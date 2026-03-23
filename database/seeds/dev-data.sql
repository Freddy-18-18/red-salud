-- ============================================================================
-- DEVELOPMENT TEST DATA
-- ============================================================================
-- This script creates test users and data for local development.
-- DO NOT run this in production.
--
-- Usage:
--   supabase db execute < database/seeds/dev-data.sql
-- ============================================================================

-- ============================================================================
-- TEST PROFILES (requires matching auth.users entries)
-- ============================================================================

-- Doctor profile
INSERT INTO profiles (id, email, full_name, role, avatar_url, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'doctor@dev.redsalud.com',
  'Dr. Dev Medico',
  'medico',
  NULL,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Patient profile
INSERT INTO profiles (id, email, full_name, role, avatar_url, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'paciente@dev.redsalud.com',
  'Paciente Dev Test',
  'paciente',
  NULL,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Secretary profile
INSERT INTO profiles (id, email, full_name, role, avatar_url, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'secretaria@dev.redsalud.com',
  'Secretaria Dev Test',
  'secretaria',
  NULL,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Admin profile
INSERT INTO profiles (id, email, full_name, role, avatar_url, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'admin@dev.redsalud.com',
  'Admin Dev Test',
  'admin',
  NULL,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NOTE
-- ============================================================================
-- The pharmacy seed data is in seed-root.sql (warehouses, products, batches,
-- patients, loyalty programs, etc.)
--
-- To create full auth.users entries for development, use the Supabase
-- Dashboard or the supabase CLI:
--   supabase auth create-user --email doctor@dev.redsalud.com --password dev123456
-- ============================================================================
