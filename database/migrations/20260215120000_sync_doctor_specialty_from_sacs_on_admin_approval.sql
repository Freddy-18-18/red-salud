-- ============================================
-- Sync doctor specialty from SACS on admin approval
-- Date: 2026-02-15
--
-- See root migration for full rationale.
-- This file exists to support the apps/web migration track.
-- ============================================

DO $$
DECLARE
  v_has_doctor_details BOOLEAN;
  v_has_profiles BOOLEAN;
  v_has_specialties BOOLEAN;
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

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'doctor_details' AND column_name = 'profile_id'
  ) INTO v_has_dd_profile_id;

  IF NOT (v_has_doctor_details AND v_has_profiles AND v_has_specialties AND v_has_dd_profile_id) THEN
    RETURN;
  END IF;

  -- Prefer the newer schema used by the web app (is_verified/specialty_id)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'doctor_details' AND column_name = 'is_verified'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'doctor_details' AND column_name = 'specialty_id'
  ) THEN
    CREATE OR REPLACE FUNCTION public.sync_doctor_specialty_id_from_sacs_on_is_verified_approval()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
    $$;

    DROP TRIGGER IF EXISTS trg_sync_doctor_specialty_id_from_sacs_is_verified ON public.doctor_details;

    CREATE TRIGGER trg_sync_doctor_specialty_id_from_sacs_is_verified
      BEFORE UPDATE OF is_verified ON public.doctor_details
      FOR EACH ROW
      WHEN (NEW.is_verified = true AND (OLD.is_verified IS DISTINCT FROM NEW.is_verified))
      EXECUTE FUNCTION public.sync_doctor_specialty_id_from_sacs_on_is_verified_approval();
  END IF;
END $$;
