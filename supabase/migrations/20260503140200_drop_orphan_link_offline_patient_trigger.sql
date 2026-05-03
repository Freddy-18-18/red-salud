-- The `offline_patients` table was dropped in an earlier cleanup migration
-- (`drop_redundant_offline_patient_support_to_appointments`), but the trigger
-- that linked an online registration to a pending offline patient was never
-- removed. As a result, every UPDATE on `profiles.national_id` for
-- `role = 'paciente'` failed with:
--   relation "public.offline_patients" does not exist
--
-- This blocked patients from setting their cédula via the profile form.
--
-- Drop the trigger and its function. If the offline-patient flow is
-- reintroduced later it can be rebuilt cleanly against a recreated table.
DROP TRIGGER IF EXISTS link_offline_patient_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.link_offline_patient_on_registration() CASCADE;
