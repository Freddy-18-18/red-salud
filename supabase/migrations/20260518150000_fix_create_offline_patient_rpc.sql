-- =============================================================================
-- Migration: Fix create_offline_patient RPC (write to offline_patients, not profiles)
-- Date: 2026-05-18
-- Description: La versión de la RPC aplicada en el remoto (20260517223630)
--   intentaba INSERT directo en public.profiles, lo cual viola la FK
--   profiles_id_fkey → auth.users(id) cuando se usa un gen_random_uuid()
--   que no existe en auth.users. Resultado: 500 al crear un offline patient
--   desde /api/patients.
--
--   Esta migración reemplaza la RPC por la versión correcta que escribe en
--   public.offline_patients (tabla ya existente). También garantiza el
--   trigger de reconciliación que linkea offline_patients ↔ profiles cuando
--   el paciente luego se registra.
--
-- Idempotente: usa CREATE OR REPLACE y DROP IF EXISTS para todos los objetos.
-- No toca la tabla offline_patients (ya existe y tiene datos potencialmente).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. RPC create_offline_patient — versión correcta
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_offline_patient(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doctor_id    uuid := auth.uid();
  v_new_id       uuid := gen_random_uuid();
  v_cedula       text;
  v_nacionalidad varchar(1);
  v_full_name    text;
  v_existing_id  uuid;
BEGIN
  IF v_doctor_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_doctor_id AND role = 'medico'
  ) THEN
    RAISE EXCEPTION 'Only doctors can register offline patients'
      USING ERRCODE = '42501';
  END IF;

  v_cedula       := NULLIF(TRIM(payload->>'cedula'), '');
  v_nacionalidad := COALESCE(NULLIF(payload->>'nacionalidad', ''), 'V');
  v_full_name    := NULLIF(TRIM(payload->>'full_name'), '');

  IF v_cedula IS NULL THEN
    RAISE EXCEPTION 'cedula is required' USING ERRCODE = '23502';
  END IF;
  IF v_full_name IS NULL THEN
    RAISE EXCEPTION 'full_name is required' USING ERRCODE = '23502';
  END IF;
  IF v_nacionalidad NOT IN ('V','E') THEN
    RAISE EXCEPTION 'nacionalidad must be V or E' USING ERRCODE = '23514';
  END IF;

  -- Idempotencia: si el doctor ya registró esta cédula, devolver el id existente.
  SELECT id INTO v_existing_id
  FROM public.offline_patients
  WHERE doctor_id = v_doctor_id AND cedula = v_cedula;

  IF v_existing_id IS NOT NULL THEN
    RETURN v_existing_id;
  END IF;

  INSERT INTO public.offline_patients (
    id, doctor_id, nacionalidad, cedula, full_name,
    first_name, middle_name, last_name, second_last_name,
    date_of_birth, gender, phone, email, address, city, state,
    blood_type, allergies, chronic_conditions, current_medications,
    doctor_notes, cne_estado, cne_municipio, cne_parroquia
  ) VALUES (
    v_new_id, v_doctor_id, v_nacionalidad, v_cedula, v_full_name,
    NULLIF(payload->>'first_name', ''),
    NULLIF(payload->>'middle_name', ''),
    NULLIF(payload->>'last_name', ''),
    NULLIF(payload->>'second_last_name', ''),
    NULLIF(payload->>'date_of_birth', '')::date,
    NULLIF(payload->>'gender', ''),
    NULLIF(payload->>'phone', ''),
    NULLIF(payload->>'email', ''),
    NULLIF(payload->>'address', ''),
    NULLIF(payload->>'city', ''),
    NULLIF(payload->>'state', ''),
    NULLIF(payload->>'blood_type', ''),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(payload->'allergies')), ARRAY[]::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(payload->'chronic_conditions')), ARRAY[]::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(payload->'current_medications')), ARRAY[]::text[]),
    NULLIF(payload->>'doctor_notes', ''),
    NULLIF(payload->>'cne_estado', ''),
    NULLIF(payload->>'cne_municipio', ''),
    NULLIF(payload->>'cne_parroquia', '')
  );

  -- Auto-link si ya existe un profile registrado con esa cédula
  UPDATE public.offline_patients op
  SET status = 'linked',
      linked_profile_id = p.id,
      linked_at = now()
  FROM public.profiles p
  WHERE op.id = v_new_id
    AND p.role = 'paciente'
    AND p.national_id = v_cedula
    AND op.status = 'offline';

  INSERT INTO public.doctor_patients (doctor_id, patient_id, notes)
  SELECT v_doctor_id, p.id, COALESCE(NULLIF(payload->>'doctor_notes', ''), NULL)
  FROM public.profiles p
  WHERE p.role = 'paciente' AND p.national_id = v_cedula
  ON CONFLICT DO NOTHING;

  RETURN v_new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_offline_patient(jsonb) TO authenticated;

COMMENT ON FUNCTION public.create_offline_patient(jsonb) IS
  'Doctor-only RPC: atomic insert of an offline patient row with optional clinical bag and CNE enrichment. Idempotent on (doctor_id, cedula). Writes to offline_patients (NOT profiles).';

-- -----------------------------------------------------------------------------
-- 2. Trigger de reconciliación — garantizar que existe
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.reconcile_offline_patients_on_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role <> 'paciente' OR NEW.national_id IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.offline_patients
  SET status = 'linked',
      linked_profile_id = NEW.id,
      linked_at = now()
  WHERE cedula = NEW.national_id
    AND status = 'offline'
    AND linked_profile_id IS NULL;

  INSERT INTO public.doctor_patients (doctor_id, patient_id, first_consultation_date, notes)
  SELECT op.doctor_id,
         NEW.id,
         op.created_at,
         op.doctor_notes
  FROM public.offline_patients op
  WHERE op.linked_profile_id = NEW.id
    AND op.status = 'linked'
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reconcile_offline_patients_trigger ON public.profiles;
CREATE TRIGGER reconcile_offline_patients_trigger
  AFTER INSERT OR UPDATE OF national_id, role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.reconcile_offline_patients_on_profile();

COMMENT ON FUNCTION public.reconcile_offline_patients_on_profile() IS
  'Auto-links offline_patients with same cedula when a patient profile is inserted/updated. Also creates doctor_patients rows for every linking doctor.';
