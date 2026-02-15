-- ============================================
-- MIGRACIÓN DE DATOS: Médicos existentes al nuevo sistema
-- Fecha: 2026-02-14
-- Descripción: Migrar verificaciones SACS existentes al nuevo sistema unificado
-- ============================================

-- 1. Migrar médicos verificados por SACS
-- ============================================

INSERT INTO professional_verifications (
  user_id,
  verification_level,
  verification_status,
  main_role,
  sub_role,
  professional_id,
  institution,
  sacs_cedula,
  sacs_verified,
  sacs_data,
  sacs_verified_at,
  verified_at,
  created_at,
  updated_at
)
SELECT 
  vs.user_id,
  'sacs_verified'::verification_level,
  CASE 
    WHEN vs.verificado = true THEN 'approved'
    ELSE 'rejected'
  END as verification_status,
  'medico'::main_role_type,
  'medico_general' as sub_role, -- Por defecto, se puede actualizar después
  vs.matricula_principal as professional_id,
  NULL as institution, -- Se puede añadir después
  vs.cedula as sacs_cedula,
  vs.verificado as sacs_verified,
  jsonb_build_object(
    'nombre_completo', vs.nombre_completo,
    'profesion', vs.profesion_principal,
    'matricula', vs.matricula_principal,
    'especialidad', vs.especialidad,
    'profesiones', vs.profesiones,
    'postgrados', vs.postgrados,
    'es_medico_humano', vs.es_medico_humano,
    'es_veterinario', vs.es_veterinario,
    'apto_red_salud', vs.apto_red_salud
  ) as sacs_data,
  vs.fecha_verificacion as sacs_verified_at,
  vs.fecha_verificacion as verified_at,
  vs.created_at,
  vs.updated_at
FROM verificaciones_sacs vs
WHERE NOT EXISTS (
  -- Solo migrar si no existe ya en el nuevo sistema
  SELECT 1 FROM professional_verifications pv 
  WHERE pv.user_id = vs.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- 2. Crear entrada de historial para las migraciones
-- ============================================

INSERT INTO verification_history (
  verification_id,
  user_id,
  action,
  performed_by,
  performed_by_role,
  reason,
  changes,
  created_at
)
SELECT 
  pv.id as verification_id,
  pv.user_id,
  'created' as action,
  NULL as performed_by, -- Sistema
  'system' as performed_by_role,
  'Migración automática desde verificaciones_sacs' as reason,
  jsonb_build_object(
    'migration_source', 'verificaciones_sacs',
    'migration_date', NOW(),
    'original_data', pv.sacs_data
  ) as changes,
  pv.created_at
FROM professional_verifications pv
WHERE pv.verification_level = 'sacs_verified'
AND NOT EXISTS (
  SELECT 1 FROM verification_history vh 
  WHERE vh.verification_id = pv.id
);

-- 3. Actualizar perfiles para sincronizar datos
-- ============================================

UPDATE profiles p
SET 
  especialidad = pv.sacs_data->>'especialidad',
  sacs_matricula = pv.professional_id
FROM professional_verifications pv
WHERE p.id = pv.user_id
  AND pv.verification_level = 'sacs_verified'
  AND pv.verification_status = 'approved'
  AND p.role = 'medico'
  AND (p.sacs_matricula IS NULL OR p.especialidad IS NULL);

-- 4. Comentarios
-- ============================================

COMMENT ON COLUMN professional_verifications.sacs_data IS 'Datos originales de SACS migrados desde verificaciones_sacs';

-- ============================================
-- ESTADÍSTICAS POST-MIGRACIÓN
-- ============================================

DO $$
DECLARE
  total_migrated INTEGER;
  approved_count INTEGER;
  rejected_count INTEGER;
BEGIN
  -- Contar migraciones
  SELECT COUNT(*) INTO total_migrated
  FROM professional_verifications
  WHERE verification_level = 'sacs_verified';
  
  SELECT COUNT(*) INTO approved_count
  FROM professional_verifications
  WHERE verification_level = 'sacs_verified'
  AND verification_status = 'approved';
  
  SELECT COUNT(*) INTO rejected_count
  FROM professional_verifications
  WHERE verification_level = 'sacs_verified'
  AND verification_status = 'rejected';
  
  -- Log de resultados
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'MIGRACIÓN COMPLETADA';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Total de médicos migrados: %', total_migrated;
  RAISE NOTICE 'Verificaciones aprobadas: %', approved_count;
  RAISE NOTICE 'Verificaciones rechazadas: %', rejected_count;
  RAISE NOTICE '==========================================';
END $$;

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
