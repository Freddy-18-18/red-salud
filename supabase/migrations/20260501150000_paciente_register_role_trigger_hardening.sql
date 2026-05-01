-- =============================================================================
-- A5 / Fase A — Hardens public.handle_new_user() against role injection.
-- =============================================================================
--
-- Problem
-- -------
-- Every Red Salud client app (paciente, medico, secretaria, admin, ...) hits
-- the same Supabase Auth instance. When a user signs up via supabase.auth.signUp
-- the client can put arbitrary data in raw_user_meta_data — including a
-- 'role' field. The trigger that fans out from auth.users into public.profiles
-- has historically trusted whatever role the client passed, which means a
-- malicious actor calling signUp directly could request role='admin' (or any
-- other privileged role) and be granted it on the profile row.
--
-- Defense in depth from middleware (paciente web blocks any role != 'paciente'
-- before serving /dashboard) AND admin_roles (admin web reads its own table,
-- not profiles.role) reduces the blast radius of that mistake, but the trigger
-- itself should still refuse roles outside the known whitelist and default to
-- the least-privileged role: 'paciente'.
--
-- Idempotent
-- ----------
-- - CREATE OR REPLACE on the function body — the trigger binding on auth.users
--   continues to point at this function automatically.
-- - INSERT ... ON CONFLICT (id) DO NOTHING preserves rows from any prior
--   signup that already populated profiles.
-- - SET search_path matches the value set in
--   20260419120100_phase0_set_function_search_paths.sql so the security audit
--   stays clean.
--
-- Test plan (manual after deploy)
-- -------------------------------
-- 1. Sign up via paciente web with role explicitly set to 'admin' in metadata
--    -- profiles.role for the new user MUST be 'paciente'.
-- 2. Sign up via medico web (sends role='medico') -- profiles.role MUST be
--    'medico'.
-- 3. Sign up with no role in metadata -- profiles.role MUST be 'paciente'.
-- 4. Sign up twice with the same email (after delete + recreate) -- the
--    trigger MUST NOT crash on the duplicate key path.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_meta_role text;
  v_role      public.user_role;
  v_full_name text;
BEGIN
  -- 1. Pull the metadata role and clamp it to the whitelist. Any unknown,
  --    empty, or maliciously crafted value falls back to 'paciente'.
  v_meta_role := NULLIF(TRIM(BOTH FROM (NEW.raw_user_meta_data ->> 'role')), '');

  IF v_meta_role IS NULL OR v_meta_role NOT IN (
    'paciente', 'medico', 'secretaria', 'farmacia', 'laboratorio',
    'clinica', 'aseguradora', 'ambulancia', 'admin', 'corporate',
    'auditor', 'gerente', 'administrador', 'contador', 'rrhh',
    'soporte', 'analista', 'supervisor'
  ) THEN
    v_role := 'paciente'::public.user_role;
  ELSE
    v_role := v_meta_role::public.user_role;
  END IF;

  -- 2. Best-effort full_name fallback so the row is never NULL on a column
  --    the dashboards rely on for greeting copy.
  v_full_name := COALESCE(
    NULLIF(TRIM(BOTH FROM (NEW.raw_user_meta_data ->> 'full_name')), ''),
    split_part(NEW.email, '@', 1)
  );

  -- 3. Insert profile. ON CONFLICT keeps the function idempotent so a re-run
  --    or a post-confirmation race never blows up the auth flow.
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_role,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Fans out auth.users INSERT to public.profiles. Role values from raw_user_meta_data are whitelisted; unknown roles fall back to paciente.';
