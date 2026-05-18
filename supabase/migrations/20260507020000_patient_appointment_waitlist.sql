-- ============================================================================
-- Patient-facing appointment waitlist
-- ============================================================================
-- The existing `smart_waitlist` table is built for the clinical operations
-- flow — dental practice fields (tooth_numbers, anesthesia, procedure_type),
-- office_id instead of location_id, and a `patient_name` plain-text field
-- because it has to support offline (anonymous) patients added by staff.
--
-- A patient saying "tell me if a slot opens earlier than my current cita"
-- is a much simpler thing: opt-in flag tied to an appointment + the doctor.
-- We get a clean dedicated table so the matching worker doesn't have to
-- pattern-match a clinical waitlist row against a generic patient request.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patient_appointment_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Anchor cita the patient is willing to move from. NULL means "any cita
  -- with this doctor in the next 30 days" (not used yet but the column lets
  -- us evolve without a migration).
  current_appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  -- Only notify the patient if a slot opens BEFORE this timestamp. Defaults
  -- to the current cita's scheduled_at when one exists.
  before_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'notified', 'fulfilled', 'expired', 'cancelled')
  ),
  notified_at TIMESTAMPTZ,
  notification_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- A patient can only be on the waitlist once per (current cita) — the
  -- toggle in the detail page should flip a row in/out of `active`.
  UNIQUE (patient_id, doctor_id, current_appointment_id)
);

CREATE INDEX IF NOT EXISTS patient_appointment_waitlist_doctor_active_idx
  ON public.patient_appointment_waitlist (doctor_id, before_at)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS patient_appointment_waitlist_patient_idx
  ON public.patient_appointment_waitlist (patient_id);

ALTER TABLE public.patient_appointment_waitlist ENABLE ROW LEVEL SECURITY;

-- RLS — the patient owns their own row. Doctors and matching workers read
-- via service role, so no doctor/worker policies are needed here.

DROP POLICY IF EXISTS paciente_waitlist_select ON public.patient_appointment_waitlist;
CREATE POLICY paciente_waitlist_select
  ON public.patient_appointment_waitlist
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS paciente_waitlist_insert ON public.patient_appointment_waitlist;
CREATE POLICY paciente_waitlist_insert
  ON public.patient_appointment_waitlist
  FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS paciente_waitlist_update ON public.patient_appointment_waitlist;
CREATE POLICY paciente_waitlist_update
  ON public.patient_appointment_waitlist
  FOR UPDATE TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS paciente_waitlist_delete ON public.patient_appointment_waitlist;
CREATE POLICY paciente_waitlist_delete
  ON public.patient_appointment_waitlist
  FOR DELETE TO authenticated
  USING (patient_id = auth.uid());

-- updated_at trigger — reuse the generic update_updated_at helper if it
-- exists, otherwise inline a tiny one. This codebase has had several
-- conventions over the years; the inline form is portable.

CREATE OR REPLACE FUNCTION public.set_patient_waitlist_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_patient_waitlist_updated_at
  ON public.patient_appointment_waitlist;
CREATE TRIGGER trg_patient_waitlist_updated_at
  BEFORE UPDATE ON public.patient_appointment_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.set_patient_waitlist_updated_at();

COMMENT ON TABLE public.patient_appointment_waitlist IS
  'Patient-driven opt-in: notify me if a slot opens with this doctor before my current cita.';
