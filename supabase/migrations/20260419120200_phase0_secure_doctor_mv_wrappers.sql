-- Phase 0 hardening: restrict API access to mv_doctor_*_agg materialized views.
--
-- Materialized views cannot enforce RLS directly. Today any authenticated user
-- can query the raw MVs and see other doctors' aggregated metrics.
-- Fix: wrap each MV in a SECURITY INVOKER view that filters to the caller's
-- own doctor_id, revoke direct API access to the MVs, and grant the wrappers.
--
-- Frontend change: replace `.from("mv_doctor_*_agg")` with `.from("my_doctor_*_agg")`.

-- --- Wrapper views (security_invoker so they run with caller privileges) ---

CREATE OR REPLACE VIEW public.my_doctor_revenue_agg
WITH (security_invoker = on) AS
  SELECT * FROM public.mv_doctor_revenue_agg
  WHERE doctor_id = auth.uid();

CREATE OR REPLACE VIEW public.my_doctor_efficiency_agg
WITH (security_invoker = on) AS
  SELECT * FROM public.mv_doctor_efficiency_agg
  WHERE doctor_id = auth.uid();

CREATE OR REPLACE VIEW public.my_doctor_patients_agg
WITH (security_invoker = on) AS
  SELECT * FROM public.mv_doctor_patients_agg
  WHERE doctor_id = auth.uid();

CREATE OR REPLACE VIEW public.my_doctor_ratings_agg
WITH (security_invoker = on) AS
  SELECT * FROM public.mv_doctor_ratings_agg
  WHERE doctor_id = auth.uid();

CREATE OR REPLACE VIEW public.my_doctor_diagnoses_agg
WITH (security_invoker = on) AS
  SELECT * FROM public.mv_doctor_diagnoses_agg
  WHERE doctor_id = auth.uid();

-- --- Revoke direct API access to the raw MVs ---

REVOKE SELECT ON public.mv_doctor_revenue_agg    FROM anon, authenticated;
REVOKE SELECT ON public.mv_doctor_efficiency_agg FROM anon, authenticated;
REVOKE SELECT ON public.mv_doctor_patients_agg   FROM anon, authenticated;
REVOKE SELECT ON public.mv_doctor_ratings_agg    FROM anon, authenticated;
REVOKE SELECT ON public.mv_doctor_diagnoses_agg  FROM anon, authenticated;

-- --- Grant access to the wrappers (authenticated only; no anon) ---

GRANT SELECT ON public.my_doctor_revenue_agg    TO authenticated;
GRANT SELECT ON public.my_doctor_efficiency_agg TO authenticated;
GRANT SELECT ON public.my_doctor_patients_agg   TO authenticated;
GRANT SELECT ON public.my_doctor_ratings_agg    TO authenticated;
GRANT SELECT ON public.my_doctor_diagnoses_agg  TO authenticated;
