-- Script para aplicar la migración de verificación de doctores
-- Ejecutar en el SQL Editor de Supabase

-- Agregar campo para datos de verificación SACS
ALTER TABLE doctor_profiles 
ADD COLUMN IF NOT EXISTS verification_data JSONB DEFAULT '{}'::jsonb;

-- Índice para búsquedas por verificación
CREATE INDEX IF NOT EXISTS idx_doctor_verification ON doctor_profiles USING gin(verification_data);

COMMENT ON COLUMN doctor_profiles.verification_data IS 'Datos de verificación del SACS y otros sistemas';

-- Verificar que la tabla existe
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'doctor_profiles'
ORDER BY ordinal_position;
