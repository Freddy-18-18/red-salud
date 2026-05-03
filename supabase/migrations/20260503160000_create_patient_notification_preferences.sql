-- Patient-side notification preferences. The pre-existing
-- `public.notification_preferences` table is the community/Q&A one
-- (email_new_follower, email_new_answer, ...) and does not match the
-- shape the patient app needs (global email/push toggles + per-category
-- {email, push} matrix). Create a dedicated table so the BFF can
-- upsert without colliding with the community schema.
CREATE TABLE IF NOT EXISTS public.patient_notification_preferences (
  patient_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  push_enabled  boolean NOT NULL DEFAULT true,
  -- categories is a JSON object keyed by category slug
  -- (appointments, lab_results, prescriptions, messages, chronic_alerts,
  --  price_alerts, follow_ups, rewards, system) where each value is
  -- { email: boolean, push: boolean }.
  categories    jsonb   NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_notification_preferences ENABLE ROW LEVEL SECURITY;

-- A patient can only read/write their own row.
CREATE POLICY "patients select own prefs"
  ON public.patient_notification_preferences
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = patient_id);

CREATE POLICY "patients insert own prefs"
  ON public.patient_notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = patient_id);

CREATE POLICY "patients update own prefs"
  ON public.patient_notification_preferences
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = patient_id)
  WITH CHECK ((SELECT auth.uid()) = patient_id);

-- Refresh the updated_at column on every UPDATE so we know when the
-- patient last touched their preferences.
CREATE TRIGGER patient_notification_preferences_set_updated_at
  BEFORE UPDATE ON public.patient_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

COMMENT ON TABLE public.patient_notification_preferences IS
  'Per-patient notification channel preferences (global email/push toggles + per-category matrix).';
