-- Phase 0 hardening: flip 6 views flagged by advisor lint 0010 to SECURITY INVOKER.
--
-- SECURITY DEFINER views bypass the RLS of the querying user and run with the
-- creator's privileges. For analytics/metrics views over tables that already
-- have RLS, SECURITY INVOKER is the correct mode: callers see only what their
-- own RLS policies allow.
--
-- All 6 views are verified not to be referenced from the `anon` code paths.
-- Callers are expected to add `WHERE <owner_column> = auth.uid()` as they
-- already do (or rely on the base table RLS to filter).

ALTER VIEW public.appointment_effective_slots SET (security_invoker = on);
ALTER VIEW public.appointment_hourly_heatmap  SET (security_invoker = on);
ALTER VIEW public.doctor_metrics_by_reason    SET (security_invoker = on);
ALTER VIEW public.doctor_realtime_metrics     SET (security_invoker = on);
ALTER VIEW public.pharmacy_dashboard_stats    SET (security_invoker = on);
ALTER VIEW public.waitlist_conversion_stats   SET (security_invoker = on);
