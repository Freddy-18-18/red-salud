-- ============================================================
-- Phase 2: Doctor clinical access for /dashboard/pacientes
-- Source: sdd/medico-pacientes-profesional Phase 2 design
-- Branch: feat/medico-pacientes-profesional-p2
--
-- Adds:
--   - Helper function doctor_has_access_to_patient(uuid)
--   - RLS policies allowing doctors to UPDATE/INSERT patient_details
--   - RLS SELECT policies on lab_*, patient_documents, patient_insurance,
--     emergency_contacts for the doctor-side of the relationship
--   - Trigger that auto-maintains doctor_patients link on medical_records INSERT
-- ============================================================

-- 1. Helper: centralizes "does this doctor have access to this patient?"
CREATE OR REPLACE FUNCTION public.doctor_has_access_to_patient(
  p_patient_id uuid
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.doctor_patients dp
    WHERE dp.doctor_id = (SELECT auth.uid())
      AND dp.patient_id = p_patient_id
      AND dp.status = 'active'
  ) OR EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.doctor_id = (SELECT auth.uid())
      AND a.patient_id = p_patient_id
  );
$$;

REVOKE EXECUTE ON FUNCTION public.doctor_has_access_to_patient(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.doctor_has_access_to_patient(uuid) TO authenticated;

COMMENT ON FUNCTION public.doctor_has_access_to_patient(uuid) IS
  'Returns true if calling user has a doctor-patient link (active) OR an appointment with the patient. Used by RLS policies on clinical tables in apps/medico/web Phase 2.';

-- 2. patient_details: doctors UPDATE + INSERT (Phase 2 inline edit dialog)
DROP POLICY IF EXISTS "doctors_can_update_patient_details" ON public.patient_details;
CREATE POLICY "doctors_can_update_patient_details"
  ON public.patient_details
  FOR UPDATE
  USING (public.doctor_has_access_to_patient(profile_id))
  WITH CHECK (public.doctor_has_access_to_patient(profile_id));

DROP POLICY IF EXISTS "doctors_can_insert_patient_details" ON public.patient_details;
CREATE POLICY "doctors_can_insert_patient_details"
  ON public.patient_details
  FOR INSERT
  WITH CHECK (public.doctor_has_access_to_patient(profile_id));

-- 3. lab_orders: doctors SELECT for their patients
DROP POLICY IF EXISTS "doctors_can_view_lab_orders" ON public.lab_orders;
CREATE POLICY "doctors_can_view_lab_orders"
  ON public.lab_orders
  FOR SELECT
  USING (
    doctor_id = (SELECT auth.uid())
    OR public.doctor_has_access_to_patient(patient_id)
  );

-- 4. lab_results: SELECT via lab_orders accessibility
DROP POLICY IF EXISTS "doctors_can_view_lab_results" ON public.lab_results;
CREATE POLICY "doctors_can_view_lab_results"
  ON public.lab_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.lab_orders lo
      WHERE lo.id = lab_results.order_id
        AND (
          lo.doctor_id = (SELECT auth.uid())
          OR public.doctor_has_access_to_patient(lo.patient_id)
        )
    )
  );

-- 5. lab_result_values: SELECT via lab_results -> lab_orders chain
DROP POLICY IF EXISTS "doctors_can_view_lab_result_values" ON public.lab_result_values;
CREATE POLICY "doctors_can_view_lab_result_values"
  ON public.lab_result_values
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.lab_results lr
      JOIN public.lab_orders lo ON lo.id = lr.order_id
      WHERE lr.id = lab_result_values.result_id
        AND (
          lo.doctor_id = (SELECT auth.uid())
          OR public.doctor_has_access_to_patient(lo.patient_id)
        )
    )
  );

-- 6. lab_order_tests: SELECT via lab_orders accessibility
DROP POLICY IF EXISTS "doctors_can_view_lab_order_tests" ON public.lab_order_tests;
CREATE POLICY "doctors_can_view_lab_order_tests"
  ON public.lab_order_tests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.lab_orders lo
      WHERE lo.id = lab_order_tests.order_id
        AND (
          lo.doctor_id = (SELECT auth.uid())
          OR public.doctor_has_access_to_patient(lo.patient_id)
        )
    )
  );

-- 7. patient_documents: doctors SELECT for their patients
DROP POLICY IF EXISTS "doctors_can_view_patient_documents" ON public.patient_documents;
CREATE POLICY "doctors_can_view_patient_documents"
  ON public.patient_documents
  FOR SELECT
  USING (public.doctor_has_access_to_patient(patient_id));

-- 8. patient_insurance: doctors SELECT for their patients
DROP POLICY IF EXISTS "doctors_can_view_patient_insurance" ON public.patient_insurance;
CREATE POLICY "doctors_can_view_patient_insurance"
  ON public.patient_insurance
  FOR SELECT
  USING (public.doctor_has_access_to_patient(patient_id));

-- 9. emergency_contacts: doctors SELECT (read-only — patient owns the data)
DROP POLICY IF EXISTS "doctors_can_view_emergency_contacts" ON public.emergency_contacts;
CREATE POLICY "doctors_can_view_emergency_contacts"
  ON public.emergency_contacts
  FOR SELECT
  USING (public.doctor_has_access_to_patient(patient_id));

-- 10. Auto-link trigger: when a medical_record is created, ensure doctor_patients
--     link exists and bump last_consultation_date + total_consultations.
CREATE OR REPLACE FUNCTION public.upsert_doctor_patient_link()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_at timestamptz;
BEGIN
  v_event_at := COALESCE(NEW.created_at, now());

  IF NEW.doctor_id IS NULL OR NEW.patient_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.doctor_patients (
    doctor_id,
    patient_id,
    first_consultation_date,
    last_consultation_date,
    total_consultations,
    status
  )
  VALUES (
    NEW.doctor_id,
    NEW.patient_id,
    v_event_at,
    v_event_at,
    1,
    'active'
  )
  ON CONFLICT (doctor_id, patient_id) DO UPDATE
    SET
      last_consultation_date = GREATEST(
        COALESCE(public.doctor_patients.last_consultation_date, v_event_at),
        v_event_at
      ),
      total_consultations = COALESCE(public.doctor_patients.total_consultations, 0) + 1,
      updated_at = now();

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.upsert_doctor_patient_link() IS
  'Trigger: keeps doctor_patients link in sync when a medical_record is inserted. SECURITY DEFINER to bypass RLS on doctor_patients.';

DROP TRIGGER IF EXISTS trg_medical_records_upsert_doctor_patient ON public.medical_records;
CREATE TRIGGER trg_medical_records_upsert_doctor_patient
  AFTER INSERT ON public.medical_records
  FOR EACH ROW
  WHEN (NEW.doctor_id IS NOT NULL AND NEW.patient_id IS NOT NULL)
  EXECUTE FUNCTION public.upsert_doctor_patient_link();
