-- Prevent doctors (non-admin actors) from self-approving by setting
-- doctor_details.verified / doctor_details.is_verified = true.
--
-- This enforces the product rule: approval is performed only by corporate/admin.

DO $$
DECLARE
  v_has_dd_profile_id boolean;
  v_has_dd_sacs_verified boolean;
  v_has_profiles_sacs_verificado boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'doctor_details'
      AND column_name = 'profile_id'
  ) INTO v_has_dd_profile_id;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'doctor_details'
      AND column_name = 'sacs_verified'
  ) INTO v_has_dd_sacs_verified;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'sacs_verificado'
  ) INTO v_has_profiles_sacs_verificado;

  -- Path A: doctor_details.verified (legacy Spanish schema)
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'doctor_details'
      AND column_name = 'verified'
  ) THEN
    IF v_has_dd_profile_id AND v_has_dd_sacs_verified AND v_has_profiles_sacs_verificado THEN
      CREATE OR REPLACE FUNCTION public.enforce_doctor_details_verified_admin_only()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      AS $func$
      DECLARE
        actor_id uuid;
        actor_role text;
        actor_sacs_ok boolean;
      BEGIN
        -- Allow service role / background jobs where auth.uid() is null
        actor_id := auth.uid();
        IF actor_id IS NULL THEN
          RETURN NEW;
        END IF;

        -- Only guard transitions to TRUE (or inserts setting TRUE)
        IF (TG_OP = 'INSERT' AND NEW.verified IS TRUE)
           OR (TG_OP = 'UPDATE' AND COALESCE(OLD.verified, FALSE) IS DISTINCT FROM TRUE AND NEW.verified IS TRUE) THEN
          SELECT role INTO actor_role FROM public.profiles WHERE id = actor_id;

          -- Admin/corporativo siempre permitido
          IF actor_role IN (
            'admin', 'corporate', 'gerente', 'administrador', 'soporte', 'rrhh'
          ) THEN
            RETURN NEW;
          END IF;

          -- Para un médico normal: permitir SOLO si se está auto-aprobando y SACS está verificado.
          -- (SACS válido => setup se toma de una vez)
          SELECT COALESCE(sacs_verificado, false) INTO actor_sacs_ok
          FROM public.profiles
          WHERE id = actor_id;

          IF NEW.profile_id = actor_id AND NEW.sacs_verified IS TRUE AND actor_sacs_ok IS TRUE THEN
            RETURN NEW;
          END IF;

          RAISE EXCEPTION 'Solo un admin/corporativo puede aprobar (verified=true) salvo validación SACS.';
        END IF;

        RETURN NEW;
      END;
      $func$;
    ELSE
      -- Fallback: si no existe la data de SACS necesaria, mantener restricción estricta.
      CREATE OR REPLACE FUNCTION public.enforce_doctor_details_verified_admin_only()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      AS $func$
      DECLARE
        actor_id uuid;
        actor_role text;
      BEGIN
        actor_id := auth.uid();
        IF actor_id IS NULL THEN
          RETURN NEW;
        END IF;

        IF (TG_OP = 'INSERT' AND NEW.verified IS TRUE)
           OR (TG_OP = 'UPDATE' AND COALESCE(OLD.verified, FALSE) IS DISTINCT FROM TRUE AND NEW.verified IS TRUE) THEN
          SELECT role INTO actor_role FROM public.profiles WHERE id = actor_id;

          IF actor_role IS NULL OR actor_role NOT IN (
            'admin', 'corporate', 'gerente', 'administrador', 'soporte', 'rrhh'
          ) THEN
            RAISE EXCEPTION 'Solo un admin/corporativo puede aprobar (verified=true).';
          END IF;
        END IF;

        RETURN NEW;
      END;
      $func$;
    END IF;

    DROP TRIGGER IF EXISTS trg_enforce_doctor_details_verified_admin_only ON public.doctor_details;
    CREATE TRIGGER trg_enforce_doctor_details_verified_admin_only
      BEFORE INSERT OR UPDATE OF verified ON public.doctor_details
      FOR EACH ROW
      EXECUTE FUNCTION public.enforce_doctor_details_verified_admin_only();
  END IF;

  -- Path B: doctor_details.is_verified (newer English schema)
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'doctor_details'
      AND column_name = 'is_verified'
  ) THEN
    IF v_has_dd_profile_id AND v_has_dd_sacs_verified AND v_has_profiles_sacs_verificado THEN
      CREATE OR REPLACE FUNCTION public.enforce_doctor_details_is_verified_admin_only()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      AS $func$
      DECLARE
        actor_id uuid;
        actor_role text;
        actor_sacs_ok boolean;
      BEGIN
        actor_id := auth.uid();
        IF actor_id IS NULL THEN
          RETURN NEW;
        END IF;

        IF (TG_OP = 'INSERT' AND NEW.is_verified IS TRUE)
           OR (TG_OP = 'UPDATE' AND COALESCE(OLD.is_verified, FALSE) IS DISTINCT FROM TRUE AND NEW.is_verified IS TRUE) THEN
          SELECT role INTO actor_role FROM public.profiles WHERE id = actor_id;

          IF actor_role IN (
            'admin', 'corporate', 'gerente', 'administrador', 'soporte', 'rrhh'
          ) THEN
            RETURN NEW;
          END IF;

          SELECT COALESCE(sacs_verificado, false) INTO actor_sacs_ok
          FROM public.profiles
          WHERE id = actor_id;

          IF NEW.profile_id = actor_id AND NEW.sacs_verified IS TRUE AND actor_sacs_ok IS TRUE THEN
            RETURN NEW;
          END IF;

          RAISE EXCEPTION 'Solo un admin/corporativo puede aprobar (is_verified=true) salvo validación SACS.';
        END IF;

        RETURN NEW;
      END;
      $func$;
    ELSE
      CREATE OR REPLACE FUNCTION public.enforce_doctor_details_is_verified_admin_only()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      AS $func$
      DECLARE
        actor_id uuid;
        actor_role text;
      BEGIN
        actor_id := auth.uid();
        IF actor_id IS NULL THEN
          RETURN NEW;
        END IF;

        IF (TG_OP = 'INSERT' AND NEW.is_verified IS TRUE)
           OR (TG_OP = 'UPDATE' AND COALESCE(OLD.is_verified, FALSE) IS DISTINCT FROM TRUE AND NEW.is_verified IS TRUE) THEN
          SELECT role INTO actor_role FROM public.profiles WHERE id = actor_id;

          IF actor_role IS NULL OR actor_role NOT IN (
            'admin', 'corporate', 'gerente', 'administrador', 'soporte', 'rrhh'
          ) THEN
            RAISE EXCEPTION 'Solo un admin/corporativo puede aprobar (is_verified=true).';
          END IF;
        END IF;

        RETURN NEW;
      END;
      $func$;
    END IF;

    DROP TRIGGER IF EXISTS trg_enforce_doctor_details_is_verified_admin_only ON public.doctor_details;
    CREATE TRIGGER trg_enforce_doctor_details_is_verified_admin_only
      BEFORE INSERT OR UPDATE OF is_verified ON public.doctor_details
      FOR EACH ROW
      EXECUTE FUNCTION public.enforce_doctor_details_is_verified_admin_only();
  END IF;
END;
$$;
