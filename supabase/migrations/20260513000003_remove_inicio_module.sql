-- =============================================================================
-- Migration: Remove redundant 'inicio' module from capability_modules
-- Fecha: 2026-05-13
-- Descripción:
--   El logo "Red-Salud" del sidebar ahora navega a /dashboard (sustituye al
--   ítem "Inicio" del rail). Borramos el módulo always-on 'inicio' para que
--   no aparezca duplicado en el sidebar.
--
--   Cambio cosmético, sin riesgo de data loss.
-- =============================================================================

DELETE FROM public.capability_modules WHERE module_key = 'inicio';
