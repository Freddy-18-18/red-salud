-- 🔍 Script de Verificación de Base de Datos
-- Ejecutar en Supabase SQL Editor para verificar que todo está configurado

-- ============================================
-- 1. Verificar que la tabla existe
-- ============================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'doctor_verifications_cache';

-- ============================================
-- 2. Verificar columnas de la tabla
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'doctor_verifications_cache'
ORDER BY ordinal_position;

-- ============================================
-- 3. Verificar índices
-- ============================================
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'doctor_verifications_cache';

-- ============================================
-- 4. Verificar políticas RLS
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'doctor_verifications_cache';

-- ============================================
-- 5. Verificar tabla doctor_details
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'doctor_details'
  AND column_name IN (
    'full_name',
    'document_type',
    'document_number',
    'main_profession',
    'display_specialty',
    'has_postgraduate',
    'sacs_data'
  )
ORDER BY ordinal_position;

-- ============================================
-- 6. Verificar especialidades disponibles
-- ============================================
SELECT 
  id,
  name,
  description,
  is_active
FROM specialties
WHERE is_active = true
ORDER BY name;

-- ============================================
-- 7. Probar inserción en caché (TEST)
-- ============================================
-- NOTA: Esto es solo para probar, eliminar después
INSERT INTO doctor_verifications_cache (
  cedula,
  tipo_documento,
  nombre_completo,
  profesiones,
  postgrados,
  profesion_principal,
  matricula_principal,
  especialidad_display,
  es_medico_humano,
  es_veterinario,
  tiene_postgrados,
  verified,
  verified_at,
  source
) VALUES (
  '99999999',
  'V',
  'TEST USUARIO',
  '[{"profesion": "MEDICO CIRUJANO", "matricula": "999999", "fecha_registro": "2020-01-01", "tomo": "1", "folio": "1"}]'::jsonb,
  '[]'::jsonb,
  'MEDICO CIRUJANO',
  '999999',
  'Medicina General',
  true,
  false,
  false,
  true,
  NOW(),
  'test'
)
ON CONFLICT (cedula, tipo_documento) 
DO UPDATE SET updated_at = NOW()
RETURNING *;

-- ============================================
-- 8. Verificar que se insertó correctamente
-- ============================================
SELECT * FROM doctor_verifications_cache
WHERE cedula = '99999999';

-- ============================================
-- 9. Limpiar datos de prueba
-- ============================================
DELETE FROM doctor_verifications_cache
WHERE cedula = '99999999' AND source = 'test';

-- ============================================
-- 10. Verificar Edge Functions desplegadas
-- ============================================
-- Ejecutar en terminal:
-- supabase functions list

-- ============================================
-- RESUMEN DE VERIFICACIÓN
-- ============================================
SELECT 
  'doctor_verifications_cache' as tabla,
  COUNT(*) as registros_totales,
  COUNT(*) FILTER (WHERE verified = true) as verificados,
  COUNT(*) FILTER (WHERE es_medico_humano = true) as medicos_humanos,
  COUNT(*) FILTER (WHERE es_veterinario = true) as veterinarios,
  COUNT(*) FILTER (WHERE verified_at > NOW() - INTERVAL '24 hours') as ultimas_24h
FROM doctor_verifications_cache;

-- ============================================
-- ✅ Si todas las consultas funcionan, estás listo!
-- ============================================
