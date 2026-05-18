-- =============================================================================
-- Migration: Add terms of service acceptance tracking to profiles
-- Fecha: 2026-05-13
-- Descripción:
--   Agrega tracking de aceptación de Términos y Condiciones + Política de
--   Privacidad. Necesario para cumplimiento legal y para detectar usuarios
--   que se registraron vía OAuth (Google) sin pasar por el checkbox de TyC.
--
--   Estrategia:
--     - terms_accepted_at: timestamp de aceptación. NULL = no aceptado aún.
--     - terms_version: versión del documento aceptado (permite forzar
--       re-aceptación cuando los términos cambien sustancialmente).
--
--   Lógica de UI:
--     - Registro por email/password: checkbox obligatorio antes de submit.
--     - Registro por Google OAuth: el callback de auth NO setea estos campos.
--       El wizard de onboarding detecta NULL y muestra checkbox en Step 3.
--     - Versión inicial: 'v1-2026-05'. Si el documento cambia, bumpear esta
--       constante en el código y el frontend forzará re-aceptación.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version TEXT;

COMMENT ON COLUMN public.profiles.terms_accepted_at IS
  'Timestamp de aceptación de Términos y Política de Privacidad. NULL = no aceptado.';

COMMENT ON COLUMN public.profiles.terms_version IS
  'Versión del documento aceptado (ej: v1-2026-05). Permite forzar re-aceptación al cambiar el documento.';

-- Index parcial para consultas rápidas de "usuarios sin aceptar TyC".
CREATE INDEX IF NOT EXISTS idx_profiles_terms_not_accepted
  ON public.profiles (id)
  WHERE terms_accepted_at IS NULL;
