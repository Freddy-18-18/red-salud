-- =============================================================================
-- A7 / Fase A — Cancellation policy + doctor notification stub
-- =============================================================================
--
-- Adds a per-doctor cancellation window (hours) so the patient cancel flow can
-- enforce "no cancellation < N hours before the appointment". Default is 24 h
-- which matches the policy in the original A7 plan; doctors can later raise
-- or lower it from their settings UI.
--
-- The column is NOT NULL with a default so existing doctor_settings rows pick
-- up the policy automatically. A CHECK clamps the value to a sane range so a
-- buggy UI cannot accidentally set 0 (no policy at all) or 720 (a month).
--
-- Idempotent via IF NOT EXISTS / DROP CONSTRAINT IF EXISTS.
-- =============================================================================

ALTER TABLE public.doctor_settings
  ADD COLUMN IF NOT EXISTS cancellation_window_hours integer NOT NULL DEFAULT 24;

ALTER TABLE public.doctor_settings
  DROP CONSTRAINT IF EXISTS doctor_settings_cancellation_window_hours_check;

ALTER TABLE public.doctor_settings
  ADD CONSTRAINT doctor_settings_cancellation_window_hours_check
  CHECK (cancellation_window_hours BETWEEN 1 AND 168);

COMMENT ON COLUMN public.doctor_settings.cancellation_window_hours IS
  'Minimum hours before scheduled_at that a patient is allowed to self-cancel. Default 24h. Range 1..168 (one week max).';
