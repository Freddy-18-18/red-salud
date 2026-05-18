-- =============================================================================
-- Migration: Protect immutable identity fields on profiles
-- Fecha: 2026-05-13
-- Descripción:
--   Trigger BEFORE UPDATE que revierte silenciosamente cambios a campos
--   inmutables cuando el UPDATE viene del usuario (authenticated/anon role).
--
--   Campos inmutables:
--     - email (cambiar requiere Supabase Auth "Change Email" con verificación)
--     - national_id (cédula — identidad legal)
--     - sacs_* (provistos por el SACS, fuente de verdad oficial)
--     - full_name (solo cuando sacs_verified=true — evita suplantación post-registro)
--
--   role NO es inmutable: en Fase G la app pasa a multi-rol (un user puede
--   tener role 'medico' y 'paciente' a la vez).
--
--   service_role bypassa el trigger para permitir tareas admin auditadas.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.protect_profile_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF OLD.email IS NOT NULL AND NEW.email IS DISTINCT FROM OLD.email THEN
    NEW.email := OLD.email;
  END IF;

  IF OLD.national_id IS NOT NULL AND NEW.national_id IS DISTINCT FROM OLD.national_id THEN
    NEW.national_id := OLD.national_id;
  END IF;

  IF OLD.sacs_verified IS TRUE THEN
    IF NEW.sacs_name IS DISTINCT FROM OLD.sacs_name THEN
      NEW.sacs_name := OLD.sacs_name;
    END IF;
    IF NEW.sacs_license IS DISTINCT FROM OLD.sacs_license THEN
      NEW.sacs_license := OLD.sacs_license;
    END IF;
    IF NEW.sacs_specialty IS DISTINCT FROM OLD.sacs_specialty THEN
      NEW.sacs_specialty := OLD.sacs_specialty;
    END IF;
    IF NEW.sacs_verified IS DISTINCT FROM OLD.sacs_verified THEN
      NEW.sacs_verified := OLD.sacs_verified;
    END IF;
    IF NEW.sacs_verified_at IS DISTINCT FROM OLD.sacs_verified_at THEN
      NEW.sacs_verified_at := OLD.sacs_verified_at;
    END IF;
    IF OLD.full_name IS NOT NULL AND NEW.full_name IS DISTINCT FROM OLD.full_name THEN
      NEW.full_name := OLD.full_name;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_immutable_fields_trigger ON public.profiles;
CREATE TRIGGER protect_profile_immutable_fields_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_immutable_fields();

COMMENT ON FUNCTION public.protect_profile_immutable_fields IS
  'Reverts client-side UPDATE attempts on immutable identity fields. service_role bypasses for audited admin operations.';
