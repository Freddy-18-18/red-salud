-- Persistent flag so the patient onboarding wizard does not reopen on every
-- dashboard mount once the user has finished or skipped it. Without this
-- column the layout decided "show onboarding" purely from
-- `profile.full_name` + `profile.state`, so any patient who skipped the
-- wizard saw it again next time.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone NULL;

COMMENT ON COLUMN public.profiles.onboarding_completed_at IS
  'Set to now() when the patient finishes or dismisses the onboarding wizard. NULL means it should be shown when the profile is incomplete.';
