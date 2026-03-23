-- ============================================
-- Sync doctor specialty from SACS on admin approval
-- Date: 2026-02-15
--
-- Goal:
-- - Manual flow: doctor chooses specialty, waits for corporate/admin approval.
-- - When admin approves (verified flips to true), if the profile has SACS verified
--   data, we overwrite doctor_details specialty with the SACS-derived specialty.
--
-- Safety:
-- - Only runs when the actor is a corporate/admin role (auth.uid() role check).
-- - Only runs when profile has sacs_verificado=true and sacs_especialidad not null.
-- - Uses resolve_sacs_to_slug() if present; otherwise falls back to name matching.
-- - Wrapped in DO blocks with existence checks for schema differences.
-- ============================================

DO $$
DECLARE
  v_has_doctor_details BOOLEAN;
  v_has_profiles BOOLEAN;
  v_has_specialties BOOLEAN;
  v_has_profiles_sacs_verificado BOOLEAN;
  v_has_profiles_sacs_especialidad BOOLEAN;
  v_has_specialties_slug BOOLEAN;
  v_has_dd_profile_id BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'doctor_details'
  ) INTO v_has_doctor_details;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) INTO v_has_profiles;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'specialties'
  ) INTO v_has_specialties;

  IF NOT (v_has_doctor_details AND v_has_profiles AND v_has_specialties) THEN
    -- Nothing to do in this environment
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'sacs_verificado'
  ) INTO v_has_profiles_sacs_verificado;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'sacs_especialidad'
  ) INTO v_has_profiles_sacs_especialidad;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'specialties' AND column_name = 'slug'
  ) INTO v_has_specialties_slug;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'doctor_details' AND column_name = 'profile_id'
  ) INTO v_has_dd_profile_id;

  IF NOT (v_has_profiles_sacs_verificado AND v_has_profiles_sacs_especialidad AND v_has_dd_profile_id) THEN
    -- Required columns not present
    RETURN;
  END IF;

  -- ======================================================================
  -- Case A: doctor_details.verified + doctor_details.especialidad_id
  -- ======================================================================
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'doctor_details' AND column_name = 'verified'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'doctor_details' AND column_name = 'especialidad_id'
  ) THEN
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.sync_doctor_especialidad_from_sacs_on_verified_approval()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $func$
      DECLARE
        v_actor_id UUID;
        v_actor_role TEXT;
        v_sacs_verificado BOOLEAN;
        v_sacs_especialidad TEXT;
        v_resolved_slug TEXT;
        v_resolved_specialty_id public.specialties.id%TYPE;
        v_has_slug BOOLEAN;
      BEGIN
        -- Only on transition false -> true
        IF NOT (NEW.verified = true AND (OLD.verified IS DISTINCT FROM NEW.verified)) THEN
          RETURN NEW;
        END IF;

        -- Only corporate/admin actors can trigger overwrite.
        -- If running under service role (auth.uid() is null), allow it.
        v_actor_id := auth.uid();
        IF v_actor_id IS NOT NULL THEN
          SELECT role INTO v_actor_role
          FROM public.profiles
          WHERE id = v_actor_id;

          IF v_actor_role IS NULL OR v_actor_role NOT IN (
            'admin', 'corporate', 'gerente', 'administrador', 'soporte', 'rrhh'
          ) THEN
            RETURN NEW;
          END IF;
        END IF;

        -- Require SACS verified on profile
        SELECT sacs_verificado, sacs_especialidad
        INTO v_sacs_verificado, v_sacs_especialidad
        FROM public.profiles
        WHERE id = NEW.profile_id;

        IF COALESCE(v_sacs_verificado, false) IS NOT TRUE THEN
          RETURN NEW;
        END IF;

        IF v_sacs_especialidad IS NULL OR length(trim(v_sacs_especialidad)) = 0 THEN
          RETURN NEW;
        END IF;

        -- Resolve slug if mapping function exists
        IF to_regprocedure('public.resolve_sacs_to_slug(text)') IS NOT NULL THEN
          BEGIN
            SELECT public.resolve_sacs_to_slug(v_sacs_especialidad) INTO v_resolved_slug;
          EXCEPTION WHEN OTHERS THEN
            v_resolved_slug := NULL;
          END;
        END IF;

        -- Check if specialties.slug exists
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'specialties' AND column_name = 'slug'
        ) INTO v_has_slug;

        -- 1) slug -> specialties.id
        IF v_has_slug AND v_resolved_slug IS NOT NULL THEN
          SELECT id INTO v_resolved_specialty_id
          FROM public.specialties
          WHERE slug = v_resolved_slug
          LIMIT 1;
        END IF;

        -- 2) Fallback by name matching
        IF v_resolved_specialty_id IS NULL THEN
          SELECT id INTO v_resolved_specialty_id
          FROM public.specialties
          WHERE name ILIKE v_sacs_especialidad
             OR v_sacs_especialidad ILIKE '%' || name || '%'
             OR name ILIKE '%' || v_sacs_especialidad || '%'
          ORDER BY length(name) DESC
          LIMIT 1;
        END IF;

        IF v_resolved_specialty_id IS NOT NULL THEN
          NEW.especialidad_id := v_resolved_specialty_id;
        END IF;

        RETURN NEW;
      END;
      $func$;
    $fn$;

    EXECUTE 'DROP TRIGGER IF EXISTS trg_sync_doctor_especialidad_from_sacs_verified ON public.doctor_details;';
    EXECUTE 'CREATE TRIGGER trg_sync_doctor_especialidad_from_sacs_verified '
         || 'BEFORE UPDATE OF verified ON public.doctor_details '
         || 'FOR EACH ROW '
         || 'WHEN (NEW.verified = true AND (OLD.verified IS DISTINCT FROM NEW.verified)) '
         || 'EXECUTE FUNCTION public.sync_doctor_especialidad_from_sacs_on_verified_approval();';
  END IF;

  -- ======================================================================
  -- Case B: doctor_details.is_verified + doctor_details.specialty_id
  -- (compat for older schemas / apps/web migrations)
  -- ======================================================================
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'doctor_details' AND column_name = 'is_verified'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'doctor_details' AND column_name = 'specialty_id'
  ) THEN
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.sync_doctor_specialty_id_from_sacs_on_is_verified_approval()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $func$
      DECLARE
        v_actor_id UUID;
        v_actor_role TEXT;
        v_sacs_verificado BOOLEAN;
        v_sacs_especialidad TEXT;
        v_resolved_slug TEXT;
        v_resolved_specialty_id public.specialties.id%TYPE;
        v_has_slug BOOLEAN;
      BEGIN
        IF NOT (NEW.is_verified = true AND (OLD.is_verified IS DISTINCT FROM NEW.is_verified)) THEN
          RETURN NEW;
        END IF;

        v_actor_id := auth.uid();
        IF v_actor_id IS NOT NULL THEN
          SELECT role INTO v_actor_role
          FROM public.profiles
          WHERE id = v_actor_id;

          IF v_actor_role IS NULL OR v_actor_role NOT IN (
            'admin', 'corporate', 'gerente', 'administrador', 'soporte', 'rrhh'
          ) THEN
            RETURN NEW;
          END IF;
        END IF;

        SELECT sacs_verificado, sacs_especialidad
        INTO v_sacs_verificado, v_sacs_especialidad
        FROM public.profiles
        WHERE id = NEW.profile_id;

        IF COALESCE(v_sacs_verificado, false) IS NOT TRUE THEN
          RETURN NEW;
        END IF;

        IF v_sacs_especialidad IS NULL OR length(trim(v_sacs_especialidad)) = 0 THEN
          RETURN NEW;
        END IF;

        IF to_regprocedure('public.resolve_sacs_to_slug(text)') IS NOT NULL THEN
          BEGIN
            SELECT public.resolve_sacs_to_slug(v_sacs_especialidad) INTO v_resolved_slug;
          EXCEPTION WHEN OTHERS THEN
            v_resolved_slug := NULL;
          END;
        END IF;

        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'specialties' AND column_name = 'slug'
        ) INTO v_has_slug;

        IF v_has_slug AND v_resolved_slug IS NOT NULL THEN
          SELECT id INTO v_resolved_specialty_id
          FROM public.specialties
          WHERE slug = v_resolved_slug
          LIMIT 1;
        END IF;

        IF v_resolved_specialty_id IS NULL THEN
          SELECT id INTO v_resolved_specialty_id
          FROM public.specialties
          WHERE name ILIKE v_sacs_especialidad
             OR v_sacs_especialidad ILIKE '%' || name || '%'
             OR name ILIKE '%' || v_sacs_especialidad || '%'
          ORDER BY length(name) DESC
          LIMIT 1;
        END IF;

        IF v_resolved_specialty_id IS NOT NULL THEN
          NEW.specialty_id := v_resolved_specialty_id;
        END IF;

        RETURN NEW;
      END;
      $func$;
    $fn$;

    EXECUTE 'DROP TRIGGER IF EXISTS trg_sync_doctor_specialty_id_from_sacs_is_verified ON public.doctor_details;';
    EXECUTE 'CREATE TRIGGER trg_sync_doctor_specialty_id_from_sacs_is_verified '
         || 'BEFORE UPDATE OF is_verified ON public.doctor_details '
         || 'FOR EACH ROW '
         || 'WHEN (NEW.is_verified = true AND (OLD.is_verified IS DISTINCT FROM NEW.is_verified)) '
         || 'EXECUTE FUNCTION public.sync_doctor_specialty_id_from_sacs_on_is_verified_approval();';
  END IF;
END $$;
