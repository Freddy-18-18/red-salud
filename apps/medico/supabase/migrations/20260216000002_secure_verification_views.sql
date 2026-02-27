-- Production hardening:
-- - Remove SECURITY DEFINER behavior from sensitive views by forcing security_invoker.
-- - Revoke dangerous grants from anon/authenticated on these views.
--
-- Supabase Advisor lint: security_definer_view

DO $$
BEGIN
  IF to_regclass('public.pending_verifications') IS NOT NULL THEN
    ALTER VIEW public.pending_verifications SET (security_invoker = true);
    REVOKE ALL ON TABLE public.pending_verifications FROM anon, authenticated;
  END IF;

  IF to_regclass('public.expiring_verifications') IS NOT NULL THEN
    ALTER VIEW public.expiring_verifications SET (security_invoker = true);
    REVOKE ALL ON TABLE public.expiring_verifications FROM anon, authenticated;
  END IF;

  IF to_regclass('public.appointments_with_dental_details') IS NOT NULL THEN
    ALTER VIEW public.appointments_with_dental_details SET (security_invoker = true);
    REVOKE ALL ON TABLE public.appointments_with_dental_details FROM anon, authenticated;
  END IF;
END;
$$;
