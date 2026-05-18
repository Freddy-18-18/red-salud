-- =============================================================================
-- Migration: Extend handle_new_user trigger to copy terms acceptance from metadata
-- Fecha: 2026-05-13
-- Descripción:
--   Extiende el trigger handle_new_user para que copie terms_accepted_at y
--   terms_version desde raw_user_meta_data al row de profiles cuando estén
--   presentes (caso: signUp con email/password donde el frontend pasa la
--   aceptación en options.data). Para OAuth signups (Google) los campos
--   quedan NULL y la UI del onboarding mostrará el checkbox de aceptación.
--
--   Cambio aditivo. ON CONFLICT DO NOTHING mantiene idempotencia.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_meta_role text;
  v_role      public.user_role;
  v_full_name text;
  v_terms_accepted_at timestamptz;
  v_terms_version text;
BEGIN
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

  v_full_name := COALESCE(
    NULLIF(TRIM(BOTH FROM (NEW.raw_user_meta_data ->> 'full_name')), ''),
    split_part(NEW.email, '@', 1)
  );

  BEGIN
    v_terms_accepted_at := (NEW.raw_user_meta_data ->> 'terms_accepted_at')::timestamptz;
  EXCEPTION WHEN OTHERS THEN
    v_terms_accepted_at := NULL;
  END;
  v_terms_version := NULLIF(TRIM(BOTH FROM (NEW.raw_user_meta_data ->> 'terms_version')), '');

  INSERT INTO public.profiles (
    id, email, full_name, role,
    terms_accepted_at, terms_version,
    created_at, updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_role,
    v_terms_accepted_at,
    v_terms_version,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
