-- Script para aplicar la migración del sistema de médicos
-- Copia y pega este contenido en Supabase Dashboard > SQL Editor

-- Ejecutar migración
\i supabase/migrations/009_create_doctors_system.sql

-- Verificar que las tablas se crearon correctamente
SELECT 
  'medical_specialties' as table_name,
  COUNT(*) as record_count
FROM medical_specialties
UNION ALL
SELECT 
  'doctor_profiles' as table_name,
  COUNT(*) as record_count
FROM doctor_profiles
UNION ALL
SELECT 
  'doctor_reviews' as table_name,
  COUNT(*) as record_count
FROM doctor_reviews
UNION ALL
SELECT 
  'doctor_availability_exceptions' as table_name,
  COUNT(*) as record_count
FROM doctor_availability_exceptions;

-- Verificar especialidades insertadas
SELECT name, icon, color FROM medical_specialties ORDER BY name;
