-- ============================================================================
-- Patient waitlist worker — match-on-cancel trigger
-- ============================================================================
-- When an appointment transitions to status='cancelled', find every patient
-- on `patient_appointment_waitlist` who:
--   - is waitlisted for the SAME doctor
--   - has a current cita SCHEDULED AFTER the freed slot (i.e. the freed slot
--     is genuinely earlier than their current one)
--   - is NOT the patient who just cancelled (no self-notify)
--   - has status='active'
--
-- For each match, insert a row in `patient_notifications` and mark the
-- waitlist row 'notified' (incrementing notification_count for analytics).
-- The downstream notification driver (push/whatsapp/email) reads
-- patient_notifications via Realtime + worker as it does for every other
-- notification type.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.notify_patient_waitlist_on_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_freed_slot_at TIMESTAMPTZ;
  v_doctor_id UUID;
  v_canceller UUID;
  v_match RECORD;
  v_doctor_name TEXT;
BEGIN
  -- Only fire on the cancelled transition, not every status change.
  IF NEW.status <> 'cancelled' OR OLD.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  v_freed_slot_at := NEW.scheduled_at;
  v_doctor_id := NEW.doctor_id;
  v_canceller := NEW.patient_id;

  -- Resolve the doctor's display name once for the notification copy.
  SELECT COALESCE(p.full_name, 'tu médico')
    INTO v_doctor_name
    FROM public.profiles p
    WHERE p.id = v_doctor_id;

  -- Walk every active waitlist row that wants an earlier slot than the one
  -- they currently hold. Update + insert + count in one pass per match.
  FOR v_match IN
    SELECT
      w.id AS waitlist_id,
      w.patient_id,
      w.current_appointment_id
    FROM public.patient_appointment_waitlist w
    WHERE w.doctor_id = v_doctor_id
      AND w.before_at > v_freed_slot_at
      AND w.status = 'active'
      AND w.patient_id <> v_canceller
  LOOP
    INSERT INTO public.patient_notifications
      (patient_id, type, title, message, action_url)
    VALUES (
      v_match.patient_id,
      'waitlist_slot_available',
      'Se liberó un cupo antes',
      format(
        'Tu Dr. %s tiene un cupo disponible el %s. Reagendá si te queda mejor.',
        v_doctor_name,
        to_char(v_freed_slot_at AT TIME ZONE 'America/Caracas', 'DD/MM "a las" HH24:MI')
      ),
      CASE
        WHEN v_match.current_appointment_id IS NOT NULL
          THEN '/dashboard/citas/' || v_match.current_appointment_id::text
        ELSE '/dashboard/citas'
      END
    );

    UPDATE public.patient_appointment_waitlist
    SET
      status = 'notified',
      notified_at = now(),
      notification_count = notification_count + 1
    WHERE id = v_match.waitlist_id;
  END LOOP;

  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.notify_patient_waitlist_on_cancel() IS
  'Walks patient_appointment_waitlist rows when an appointment cancels and emits a notification per match.';

-- The existing `notify_waitlist_on_cancel` trigger already fires on status →
-- cancelled (it writes to appointment_cancellation_events for the clinical
-- side). We attach a SECOND trigger for the patient-facing flow so the two
-- code paths don't entangle.

DROP TRIGGER IF EXISTS trg_notify_patient_waitlist_on_cancel
  ON public.appointments;
CREATE TRIGGER trg_notify_patient_waitlist_on_cancel
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'cancelled')
  EXECUTE FUNCTION public.notify_patient_waitlist_on_cancel();
