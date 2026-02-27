-- Hardening: Fix mutable search_path on security-sensitive functions.
-- Supabase Advisor lint: function_search_path_mutable

DO $$
BEGIN
  IF to_regprocedure('public.sync_doctor_especialidad_from_sacs_on_verified_approval()') IS NOT NULL THEN
    ALTER FUNCTION public.sync_doctor_especialidad_from_sacs_on_verified_approval()
      SET search_path = public;
  END IF;

  IF to_regprocedure('public.sync_doctor_specialty_id_from_sacs_on_is_verified_approval()') IS NOT NULL THEN
    ALTER FUNCTION public.sync_doctor_specialty_id_from_sacs_on_is_verified_approval()
      SET search_path = public;
  END IF;

  IF to_regprocedure('public.enforce_doctor_details_verified_admin_only()') IS NOT NULL THEN
    ALTER FUNCTION public.enforce_doctor_details_verified_admin_only()
      SET search_path = public;
  END IF;

  IF to_regprocedure('public.enforce_doctor_details_is_verified_admin_only()') IS NOT NULL THEN
    ALTER FUNCTION public.enforce_doctor_details_is_verified_admin_only()
      SET search_path = public;
  END IF;
END;
$$;
