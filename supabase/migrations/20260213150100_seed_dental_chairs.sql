-- =============================================================================
-- Seed: Crear sillas dentales de ejemplo
-- Description: Agrega 3 sillas dentales por defecto para cada consultorio odontológico
-- Author: AI Assistant
-- Date: 2026-02-13
-- =============================================================================

-- Esta función se ejecutará para cada consultorio que exista
-- y creará 3 sillas dentales si no existen ya

DO $$
DECLARE
  office_record RECORD;
  chair_count INTEGER;
BEGIN
  -- Iterar sobre cada consultorio
  FOR office_record IN 
    SELECT id, nombre FROM doctor_offices
  LOOP
    -- Verificar si ya hay sillas para este consultorio
    SELECT COUNT(*) INTO chair_count 
    FROM dental_chairs 
    WHERE office_id = office_record.id;

    -- Si no hay sillas, crear 3 por defecto
    IF chair_count = 0 THEN
      INSERT INTO dental_chairs (office_id, name, number, is_active, equipment_notes)
      VALUES 
        (office_record.id, 'Silla Principal', 1, true, 'Equipo completo con lámpara LED y sillón eléctrico'),
        (office_record.id, 'Silla Secundaria', 2, true, 'Equipo estándar'),
        (office_record.id, 'Silla de Higiene', 3, true, 'Para limpiezas y consultas rápidas');
      
      RAISE NOTICE 'Creadas 3 sillas para consultorio: % (ID: %)', office_record.nombre, office_record.id;
    END IF;
  END LOOP;
END $$;

-- Crear índice para búsquedas rápidas por consultorio activo
CREATE INDEX IF NOT EXISTS idx_dental_chairs_office_active 
ON dental_chairs(office_id, is_active) 
WHERE is_active = true;

COMMENT ON INDEX idx_dental_chairs_office_active IS 'Índice para búsqueda rápida de sillas activas por consultorio';
