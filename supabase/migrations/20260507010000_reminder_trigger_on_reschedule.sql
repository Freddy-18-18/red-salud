-- ============================================================================
-- Re-schedule appointment reminders when the appointment is moved
-- ============================================================================
-- The previous trigger fired only on INSERT and on the `pending → confirmed`
-- transition. A reschedule (UPDATE of `scheduled_at` without a status change,
-- or with the demotion to `pending` we do server-side) left the previously
-- scheduled reminders pointing at the OLD time, so the patient was getting
-- a "tu cita es en 2h" push for a slot that had moved.
--
-- The fix expands the trigger condition to also re-run scheduling when
-- scheduled_at changes. `schedule_appointment_reminders` already deletes the
-- existing `scheduled` rows before inserting fresh ones, so this is safe to
-- call eagerly.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_schedule_reminders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  IF
    (TG_OP = 'INSERT')
    OR (TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed')
    OR (TG_OP = 'UPDATE' AND NEW.scheduled_at IS DISTINCT FROM OLD.scheduled_at)
  THEN
    PERFORM schedule_appointment_reminders(NEW.id);
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IN ('cancelled', 'no_show') THEN
    UPDATE appointment_reminders
    SET overall_status = 'skipped'
    WHERE appointment_id = NEW.id
      AND overall_status = 'scheduled';
  END IF;

  RETURN NEW;
END;
$function$;
