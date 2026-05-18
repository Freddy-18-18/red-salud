-- =============================================================================
-- Migration: Recreate offline_patients table + RPC create_offline_patient
-- Date: 2026-05-18
-- Description: Reintroduce the offline-patient flow for doctors registering
--   patients who haven't signed up to the platform yet. Replaces the 014
--   migration (table) and matches what the schema already expected: the
--   appointments table kept the offline_patient_id column even after the
--   table was dropped, signalling this flow was meant to come back.
--
-- Key design decisions:
--   - Each doctor has their OWN offline patient roster (UNIQUE doctor_id+cedula).
--     Two doctors can independently register the same physical person without
--     conflict — they each see their own row.
--   - When the patient eventually signs up at /auth/register and provides
--     their cedula, a trigger reconciles: status -> 'linked', linked_profile_id
--     populated, and doctor_patients rows auto-created so the doctor's roster
--     stays consistent.
--   - appointments.offline_patient_id gets a real FK now (it was orphan before).
--   - appointments must reference EITHER a registered patient (patient_id) OR
--     an offline patient (offline_patient_id) — enforced by CHECK constraint
--     (NOT VALID so legacy rows don't block the migration).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.offline_patients (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nacionalidad          varchar(1) NOT NULL DEFAULT 'V' CHECK (nacionalidad IN ('V','E')),
  cedula                text NOT NULL,
  full_name             text NOT NULL,
  first_name            text,
  middle_name           text,
  last_name             text,
  second_last_name      text,
  date_of_birth         date,
  gender                text CHECK (gender IN ('M','F','O')),
  phone                 text,
  email                 text,
  address               text,
  city                  text,
  state                 text,
  blood_type            text,
  allergies             text[] DEFAULT ARRAY[]::text[],
  chronic_conditions    text[] DEFAULT ARRAY[]::text[],
  current_medications   text[] DEFAULT ARRAY[]::text[],
  doctor_notes          text,
  cne_estado            text,
  cne_municipio         text,
  cne_parroquia         text,
  status                text NOT NULL DEFAULT 'offline'
                        CHECK (status IN ('offline','linked','archived')),
  linked_profile_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  linked_at             timestamptz,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),
  CONSTRAINT offline_patients_doctor_cedula_unique UNIQUE (doctor_id, cedula)
);

CREATE INDEX IF NOT EXISTS idx_offline_patients_doctor
  ON public.offline_patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_offline_patients_cedula
  ON public.offline_patients(cedula);
CREATE INDEX IF NOT EXISTS idx_offline_patients_linked_profile
  ON public.offline_patients(linked_profile_id);
CREATE INDEX IF NOT EXISTS idx_offline_patients_status_doctor
  ON public.offline_patients(doctor_id, status);

-- -----------------------------------------------------------------------------
-- 2. RLS
-- -----------------------------------------------------------------------------

ALTER TABLE public.offline_patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can view their offline patients" ON public.offline_patients;
CREATE POLICY "Doctors can view their offline patients"
  ON public.offline_patients
  FOR SELECT
  USING (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can create offline patients" ON public.offline_patients;
CREATE POLICY "Doctors can create offline patients"
  ON public.offline_patients
  FOR INSERT
  WITH CHECK (
    doctor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'medico'
    )
  );

DROP POLICY IF EXISTS "Doctors can update their offline patients" ON public.offline_patients;
CREATE POLICY "Doctors can update their offline patients"
  ON public.offline_patients
  FOR UPDATE
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can delete their offline patients" ON public.offline_patients;
CREATE POLICY "Doctors can delete their offline patients"
  ON public.offline_patients
  FOR DELETE
  USING (doctor_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 3. updated_at trigger
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS set_offline_patients_updated_at ON public.offline_patients';
    EXECUTE 'CREATE TRIGGER set_offline_patients_updated_at
             BEFORE UPDATE ON public.offline_patients
             FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. appointments.offline_patient_id FK + integrity CHECK
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.appointments'::regclass
      AND conname = 'appointments_offline_patient_id_fkey'
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_offline_patient_id_fkey
      FOREIGN KEY (offline_patient_id)
      REFERENCES public.offline_patients(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.appointments'::regclass
      AND conname = 'appointments_patient_or_offline_required'
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_patient_or_offline_required
      CHECK (patient_id IS NOT NULL OR offline_patient_id IS NOT NULL)
      NOT VALID;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 5. Reconciliation trigger — when a patient registers later
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

-- -----------------------------------------------------------------------------
-- 6. RPC create_offline_patient(payload jsonb)
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

  -- Auto-link if a registered profile already exists with this cedula
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

COMMENT ON TABLE public.offline_patients IS
  'Patients registered by a doctor before signing up to the platform. Reconciled to profiles via cedula match on profile insert/update.';
COMMENT ON FUNCTION public.create_offline_patient(jsonb) IS
  'Doctor-only RPC: atomic insert of an offline patient with optional clinical bag and CNE enrichment. Idempotent on (doctor_id, cedula).';
COMMENT ON FUNCTION public.reconcile_offline_patients_on_profile() IS
  'Auto-links offline_patients with same cedula when a patient profile is inserted/updated. Also creates doctor_patients rows for every linking doctor.';
