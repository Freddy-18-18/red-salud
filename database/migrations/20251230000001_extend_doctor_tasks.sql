/**
 * @file 20251230000001_extend_doctor_tasks.sql
 * @description Migración para extender la tabla doctor_tasks con relaciones a pacientes y citas.
 * Permite vincular tareas a pacientes específicos y citas programadas.
 */

-- ============================================================================
-- AGREGAR COLUMNAS DE RELACIONES
-- ============================================================================

-- Columna para vincular tarea a un paciente
ALTER TABLE doctor_tasks 
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Columna para vincular tarea a una cita
ALTER TABLE doctor_tasks 
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

-- Categoría de la tarea para organización
ALTER TABLE doctor_tasks 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general' 
CHECK (category IN ('general', 'follow-up', 'lab', 'documentation', 'call', 'other'));

-- ============================================================================
-- ÍNDICES PARA QUERIES EFICIENTES
-- ============================================================================

-- Índice para buscar tareas por paciente
CREATE INDEX IF NOT EXISTS idx_doctor_tasks_patient 
ON doctor_tasks(patient_id) 
WHERE patient_id IS NOT NULL;

-- Índice para buscar tareas por cita
CREATE INDEX IF NOT EXISTS idx_doctor_tasks_appointment 
ON doctor_tasks(appointment_id) 
WHERE appointment_id IS NOT NULL;

-- Índice compuesto para tareas pendientes de un doctor con fecha límite
CREATE INDEX IF NOT EXISTS idx_doctor_tasks_pending_due 
ON doctor_tasks(doctor_id, is_completed, due_date) 
WHERE is_completed = FALSE;

-- ============================================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================================================

COMMENT ON COLUMN doctor_tasks.patient_id IS 'Paciente vinculado a esta tarea (opcional)';
COMMENT ON COLUMN doctor_tasks.appointment_id IS 'Cita vinculada a esta tarea (opcional)';
COMMENT ON COLUMN doctor_tasks.category IS 'Categoría de la tarea: general, follow-up, lab, documentation, call, other';

-- ============================================================================
-- ACTUALIZAR RLS POLICIES (ya deberían heredar del doctor_id)
-- ============================================================================

-- Las políticas RLS existentes ya protegen por doctor_id,
-- no es necesario agregar nuevas políticas para estas columnas.
