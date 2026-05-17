-- ============================================================
-- Phase 3: Doctor-side patient creation RPCs
-- Source: sdd/medico-pacientes-profesional Phase 3
-- Branch: feat/medico-pacientes-profesional-p3
--
-- Two flows:
--   1. create_offline_patient: doctor creates patient with cedula+name only.
--      Generates placeholder email. Patient has NO auth.users yet.
--   2. create_invited_patient: doctor creates patient with real email +
--      generates an invite token for future signup reconciliation.
-- ============================================================

-- 1. Invitations table (used by invited flow only)
CREATE TABLE IF NOT EXISTS public.patient_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_by_doctor_id uuid NOT NULL,
  invite_token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  accepted_at timestamptz,
  reconciled_to_auth_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_invitations_profile_id
  ON public.patient_invitations(profile_id);
CREATE INDEX IF NOT EXISTS idx_patient_invitations_doctor_id
  ON public.patient_invitations(invited_by_doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_invitations_token
  ON public.patient_invitations(invite_token) WHERE accepted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_invitations_email
  ON public.patient_invitations(invited_email);

ALTER TABLE public.patient_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doctors_view_own_invitations" ON public.patient_invitations;
CREATE POLICY "doctors_view_own_invitations"
  ON public.patient_invitations
  FOR SELECT
  USING (invited_by_doctor_id = (SELECT auth.uid()));

COMMENT ON TABLE public.patient_invitations IS
  'Pending patient invitations created by doctors. Reconciled to auth.users when patient signs up with the matching token or email + national_id.';

-- 2. Helper: validate doctor + extract base patient fields
CREATE OR REPLACE FUNCTION public._assert_doctor_caller()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_doctor_id uuid;
BEGIN
  v_doctor_id := (SELECT auth.uid());
  IF v_doctor_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized: no auth user' USING ERRCODE = '28000';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_doctor_id AND role = 'medico'
  ) THEN
    RAISE EXCEPTION 'forbidden: only doctors can create patients' USING ERRCODE = '42501';
  END IF;
  RETURN v_doctor_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._assert_doctor_caller() FROM PUBLIC;

-- 3. create_offline_patient RPC
CREATE OR REPLACE FUNCTION public.create_offline_patient(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doctor_id uuid;
  v_patient_id uuid;
  v_full_name text;
  v_national_id text;
  v_email text;
BEGIN
  v_doctor_id := public._assert_doctor_caller();
  v_patient_id := gen_random_uuid();

  v_full_name := trim(payload->>'full_name');
  v_national_id := NULLIF(trim(payload->>'national_id'), '');
  v_email := 'offline+' || v_patient_id::text || '@offline.red-salud.local';

  IF v_full_name IS NULL OR length(v_full_name) = 0 THEN
    RAISE EXCEPTION 'full_name is required' USING ERRCODE = '23502';
  END IF;

  IF v_national_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE national_id = v_national_id AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'national_id already exists' USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, role, phone, date_of_birth, national_id,
    city, state, nationality
  )
  VALUES (
    v_patient_id,
    v_email,
    v_full_name,
    'paciente',
    NULLIF(payload->>'phone', ''),
    NULLIF(payload->>'date_of_birth', '')::date,
    v_national_id,
    NULLIF(payload->>'city', ''),
    NULLIF(payload->>'state', ''),
    COALESCE(NULLIF(payload->>'nationality', ''), 'V')
  );

  INSERT INTO public.patient_details (
    profile_id,
    grupo_sanguineo,
    alergias,
    enfermedades_cronicas,
    medicamentos_actuales,
    peso_kg,
    altura_cm,
    notas_medicas
  )
  VALUES (
    v_patient_id,
    NULLIF(payload->>'grupo_sanguineo', ''),
    COALESCE(
      (SELECT array_agg(elem) FROM jsonb_array_elements_text(payload->'alergias') elem),
      '{}'::text[]
    ),
    COALESCE(
      (SELECT array_agg(elem) FROM jsonb_array_elements_text(payload->'enfermedades_cronicas') elem),
      '{}'::text[]
    ),
    COALESCE(
      (SELECT array_agg(elem) FROM jsonb_array_elements_text(payload->'medicamentos_actuales') elem),
      '{}'::text[]
    ),
    NULLIF(payload->>'peso_kg', '')::numeric,
    NULLIF(payload->>'altura_cm', '')::numeric,
    NULLIF(payload->>'notas_medicas', '')
  );

  INSERT INTO public.doctor_patients (doctor_id, patient_id, status)
  VALUES (v_doctor_id, v_patient_id, 'active')
  ON CONFLICT (doctor_id, patient_id) DO UPDATE SET status = 'active', updated_at = now();

  RETURN v_patient_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_offline_patient(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_offline_patient(jsonb) TO authenticated;

COMMENT ON FUNCTION public.create_offline_patient(jsonb) IS
  'Doctor-side: creates a patient profile with placeholder email + patient_details + doctor_patients link. No auth.users entry. Reconciled later when patient signs up with matching national_id.';

-- 4. create_invited_patient RPC
CREATE OR REPLACE FUNCTION public.create_invited_patient(payload jsonb)
RETURNS jsonb -- { patient_id, invite_token }
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doctor_id uuid;
  v_patient_id uuid;
  v_full_name text;
  v_national_id text;
  v_email text;
  v_invite_token text;
BEGIN
  v_doctor_id := public._assert_doctor_caller();
  v_patient_id := gen_random_uuid();

  v_full_name := trim(payload->>'full_name');
  v_national_id := NULLIF(trim(payload->>'national_id'), '');
  v_email := lower(trim(payload->>'email'));

  IF v_full_name IS NULL OR length(v_full_name) = 0 THEN
    RAISE EXCEPTION 'full_name is required' USING ERRCODE = '23502';
  END IF;

  IF v_email IS NULL OR v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'valid email is required' USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE lower(email) = v_email AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'email already exists' USING ERRCODE = '23505';
  END IF;

  IF v_national_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE national_id = v_national_id AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'national_id already exists' USING ERRCODE = '23505';
  END IF;

  v_invite_token := encode(gen_random_bytes(24), 'base64');
  v_invite_token := replace(replace(replace(v_invite_token, '/', '_'), '+', '-'), '=', '');

  INSERT INTO public.profiles (
    id, email, full_name, role, phone, date_of_birth, national_id,
    city, state, nationality
  )
  VALUES (
    v_patient_id,
    v_email,
    v_full_name,
    'paciente',
    NULLIF(payload->>'phone', ''),
    NULLIF(payload->>'date_of_birth', '')::date,
    v_national_id,
    NULLIF(payload->>'city', ''),
    NULLIF(payload->>'state', ''),
    COALESCE(NULLIF(payload->>'nationality', ''), 'V')
  );

  INSERT INTO public.patient_details (
    profile_id, grupo_sanguineo, alergias, enfermedades_cronicas,
    medicamentos_actuales, peso_kg, altura_cm, notas_medicas
  )
  VALUES (
    v_patient_id,
    NULLIF(payload->>'grupo_sanguineo', ''),
    COALESCE((SELECT array_agg(elem) FROM jsonb_array_elements_text(payload->'alergias') elem), '{}'::text[]),
    COALESCE((SELECT array_agg(elem) FROM jsonb_array_elements_text(payload->'enfermedades_cronicas') elem), '{}'::text[]),
    COALESCE((SELECT array_agg(elem) FROM jsonb_array_elements_text(payload->'medicamentos_actuales') elem), '{}'::text[]),
    NULLIF(payload->>'peso_kg', '')::numeric,
    NULLIF(payload->>'altura_cm', '')::numeric,
    NULLIF(payload->>'notas_medicas', '')
  );

  INSERT INTO public.doctor_patients (doctor_id, patient_id, status)
  VALUES (v_doctor_id, v_patient_id, 'active')
  ON CONFLICT (doctor_id, patient_id) DO UPDATE SET status = 'active', updated_at = now();

  INSERT INTO public.patient_invitations (
    profile_id, invited_email, invited_by_doctor_id, invite_token
  )
  VALUES (v_patient_id, v_email, v_doctor_id, v_invite_token);

  RETURN jsonb_build_object(
    'patient_id', v_patient_id,
    'invite_token', v_invite_token
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_invited_patient(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_invited_patient(jsonb) TO authenticated;

COMMENT ON FUNCTION public.create_invited_patient(jsonb) IS
  'Doctor-side: creates patient profile with real email + patient_details + doctor_patients link + patient_invitations row with unique token. Token enables reconciliation when patient signs up.';
