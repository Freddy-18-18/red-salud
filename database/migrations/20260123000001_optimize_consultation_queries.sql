-- Optimización de queries para la página de consulta médica
-- Fecha: 2026-01-23
-- Descripción: Índices para mejorar performance de consultas en /dashboard/medico/consulta

-- ============================================================================
-- ÍNDICES PARA APPOINTMENTS (Citas)
-- ============================================================================

-- Índice compuesto para citas por médico, estado y fecha
-- Mejora: Citas de hoy, estadísticas, consultas activas
CREATE INDEX IF NOT EXISTS idx_appointments_medico_status_fecha
ON appointments(medico_id, status, fecha_hora);

-- Índice parcial para consultas activas (con medical_record)
-- Mejora: Widget de consultas en progreso
CREATE INDEX IF NOT EXISTS idx_appointments_active_consultations
ON appointments(medico_id, medical_record_id, fecha_hora DESC)
WHERE medical_record_id IS NOT NULL
AND status NOT IN ('completada', 'cancelada', 'no_asistio');

-- Índice para pacientes recientes (últimas citas)
-- Mejora: Widget de pacientes recientes
CREATE INDEX IF NOT EXISTS idx_appointments_recent_patients
ON appointments(medico_id, fecha_hora DESC);

-- ============================================================================
-- ÍNDICES PARA DOCTOR_PATIENTS (Pacientes registrados por médico)
-- ============================================================================

-- Índice para carga rápida de pacientes del médico
-- Mejora: Buscador de pacientes, lista de pacientes
CREATE INDEX IF NOT EXISTS idx_doctor_patients_doctor_id
ON doctor_patients(doctor_id);

-- ============================================================================
-- ÍNDICES PARA OFFLINE_PATIENTS (Pacientes offline)
-- ============================================================================

-- Índice compuesto para pacientes offline activos
-- Mejora: Buscador de pacientes (pacientes offline)
CREATE INDEX IF NOT EXISTS idx_offline_patients_doctor_status
ON offline_patients(doctor_id, status)
WHERE status = 'offline';

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

-- Los índices parciales (WHERE) son más eficientes porque:
-- 1. Ocupan menos espacio en disco
-- 2. Son más rápidos de mantener
-- 3. Solo indexan las filas relevantes

-- El orden de las columnas en los índices compuestos importa:
-- 1. Primero: columnas de igualdad (medico_id)
-- 2. Segundo: columnas de rango o filtro (status, fecha_hora)

-- Para verificar que los índices se usan correctamente, ejecutar:
-- EXPLAIN ANALYZE <query>;
-- Y buscar "Index Scan" en lugar de "Seq Scan"
