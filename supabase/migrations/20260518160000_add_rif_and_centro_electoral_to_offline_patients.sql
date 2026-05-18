-- =============================================================================
-- Migration: Add rif + cne_centro_electoral to offline_patients
-- Date: 2026-05-18
-- Description: La API CNE (cedula.com.ve) devuelve RIF derivado de la cédula
--   y dirección del centro electoral. Ambos son útiles:
--     - rif: facturación legal en Venezuela
--     - cne_centro_electoral: referencia de domicilio aproximado
--   Hasta ahora ambos se descartaban. Agregamos las columnas y los incluimos
--   en la RPC create_offline_patient para que se persistan al auto-registrar.
-- =============================================================================

ALTER TABLE public.offline_patients
  ADD COLUMN IF NOT EXISTS rif                  text,
  ADD COLUMN IF NOT EXISTS cne_centro_electoral text;

COMMENT ON COLUMN public.offline_patients.rif IS
  'RIF (Registro de Información Fiscal) derivado de la cédula. Devuelto por CNE.';
COMMENT ON COLUMN public.offline_patients.cne_centro_electoral IS
  'Dirección del centro electoral asignado. Referencia aproximada de domicilio.';

-- Actualizar la RPC para que acepte y persista los nuevos campos.
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
    -- Si vino con info CNE nueva (rif, centro_electoral, etc), enriquecer
    -- el registro existente con lo que falte. No sobrescribir si ya existe.
    UPDATE public.offline_patients
    SET rif                  = COALESCE(rif, NULLIF(payload->>'rif', '')),
        cne_centro_electoral = COALESCE(cne_centro_electoral, NULLIF(payload->>'cne_centro_electoral', '')),
        cne_estado           = COALESCE(cne_estado, NULLIF(payload->>'cne_estado', '')),
        cne_municipio        = COALESCE(cne_municipio, NULLIF(payload->>'cne_municipio', '')),
        cne_parroquia        = COALESCE(cne_parroquia, NULLIF(payload->>'cne_parroquia', ''))
    WHERE id = v_existing_id;
    RETURN v_existing_id;
  END IF;

  INSERT INTO public.offline_patients (
    id, doctor_id, nacionalidad, cedula, full_name,
    first_name, middle_name, last_name, second_last_name,
    date_of_birth, gender, phone, email, address, city, state,
    blood_type, allergies, chronic_conditions, current_medications,
    doctor_notes, rif, cne_estado, cne_municipio, cne_parroquia,
    cne_centro_electoral
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
    NULLIF(payload->>'rif', ''),
    NULLIF(payload->>'cne_estado', ''),
    NULLIF(payload->>'cne_municipio', ''),
    NULLIF(payload->>'cne_parroquia', ''),
    NULLIF(payload->>'cne_centro_electoral', '')
  );

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
