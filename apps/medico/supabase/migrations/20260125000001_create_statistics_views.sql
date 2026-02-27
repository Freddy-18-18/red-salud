-- ============================================================================
-- Migration: Create Materialized Views for Advanced Statistics
-- Fecha: 2025-01-25
-- Descripción: Crea vistas materializadas optimizadas para el dashboard de
--              estadísticas avanzadas del médico.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Vista de Pacientes Agregados
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_doctor_patients_agg AS
SELECT
    a.medico_id AS doctor_id,
    DATE_TRUNC('month', a.created_at) AS month,
    COUNT(DISTINCT a.paciente_id) AS unique_patients,
    COUNT(DISTINCT CASE WHEN a.created_at >= NOW() - INTERVAL '30 days' THEN a.paciente_id END) AS active_patients_30d,
    COUNT(DISTINCT CASE WHEN a.created_at >= NOW() - INTERVAL '90 days' THEN a.paciente_id END) AS active_patients_90d,
    COUNT(DISTINCT CASE WHEN p.created_at >= DATE_TRUNC('month', a.created_at) THEN p.id END) AS new_patients_month,
    COUNT(DISTINCT CASE WHEN a.created_at < NOW() - INTERVAL '180 days' THEN a.paciente_id END) AS inactive_patients
FROM appointments a
JOIN profiles p ON a.paciente_id = p.id
WHERE a.created_at >= NOW() - INTERVAL '12 months'
GROUP BY a.medico_id, DATE_TRUNC('month', a.created_at);

CREATE INDEX IF NOT EXISTS idx_mv_patients_doctor_month ON mv_doctor_patients_agg(doctor_id, month DESC);

-- ----------------------------------------------------------------------------
-- 2. Vista de Diagnósticos Agregados
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_doctor_diagnoses_agg AS
SELECT
    mr.medico_id AS doctor_id,
    mr.diagnostico,
    DATE_TRUNC('week', mr.created_at) AS week,
    COUNT(*) AS cases,
    COUNT(DISTINCT mr.paciente_id) AS unique_patients,
    COUNT(DISTINCT CASE WHEN p.genero ILIKE '%femenino%' OR p.genero = 'F' THEN mr.paciente_id END) AS female_cases,
    COUNT(DISTINCT CASE WHEN p.genero ILIKE '%masculino%' OR p.genero = 'M' THEN mr.paciente_id END) AS male_cases
FROM medical_records mr
JOIN profiles p ON mr.paciente_id = p.id
WHERE mr.diagnostico IS NOT NULL
    AND mr.created_at >= NOW() - INTERVAL '12 months'
GROUP BY mr.medico_id, mr.diagnostico, DATE_TRUNC('week', mr.created_at);

CREATE INDEX IF NOT EXISTS idx_mv_diagnoses_doctor_week ON mv_doctor_diagnoses_agg(doctor_id, week DESC);
CREATE INDEX IF NOT EXISTS idx_mv_diagnoses_code ON mv_doctor_diagnoses_agg(diagnostico);

-- ----------------------------------------------------------------------------
-- 3. Vista de Ingresos Agregados
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_doctor_revenue_agg AS
SELECT
    a.medico_id AS doctor_id,
    DATE_TRUNC('month', a.appointment_date) AS month,
    a.status,
    a.consultation_type,
    COUNT(*) AS consultations,
    SUM(a.price) AS gross_revenue,
    AVG(a.price) AS avg_ticket,
    COUNT(DISTINCT a.paciente_id) AS unique_patients
FROM appointments a
WHERE a.appointment_date >= NOW() - INTERVAL '12 months'
    AND a.price IS NOT NULL
GROUP BY a.medico_id, DATE_TRUNC('month', a.appointment_date), a.status, a.consultation_type;

CREATE INDEX IF NOT EXISTS idx_mv_revenue_doctor_month ON mv_doctor_revenue_agg(doctor_id, month DESC, status);

-- ----------------------------------------------------------------------------
-- 4. Vista de Patrones Temporales
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_doctor_temporal_patterns AS
SELECT
    a.medico_id AS doctor_id,
    EXTRACT(DOW FROM a.appointment_date) AS day_of_week,
    EXTRACT(HOUR FROM a.appointment_time) AS hour,
    DATE_TRUNC('day', a.appointment_date) AS date,
    a.consultation_type,
    a.status,
    COUNT(*) AS consultations,
    COUNT(DISTINCT a.paciente_id) AS unique_patients
FROM appointments a
WHERE a.appointment_date >= NOW() - INTERVAL '12 months'
GROUP BY a.medico_id,
    EXTRACT(DOW FROM a.appointment_date),
    EXTRACT(HOUR FROM a.appointment_time),
    DATE_TRUNC('day', a.appointment_date),
    a.consultation_type,
    a.status;

CREATE INDEX IF NOT EXISTS idx_mv_temporal_doctor_date ON mv_doctor_temporal_patterns(doctor_id, date DESC);

-- ----------------------------------------------------------------------------
-- 5. Vista de Laboratorio Agregada
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_doctor_lab_agg AS
SELECT
    lo.medico_id AS doctor_id,
    DATE_TRUNC('month', lo.fecha_orden) AS month,
    lo.status,
    lo.prioridad,
    COUNT(*) AS total_orders,
    COUNT(CASE WHEN lrv.es_anormal THEN 1 END) AS abnormal_results,
    AVG(EXTRACT(DAY FROM lr.fecha_resultado - lo.fecha_orden)) AS avg_days_to_result,
    SUM(lo.costo_total) AS total_cost
FROM lab_orders lo
LEFT JOIN lab_results lr ON lo.id = lr.order_id
LEFT JOIN lab_result_values lrv ON lr.id = lrv.result_id
WHERE lo.fecha_orden >= NOW() - INTERVAL '12 months'
GROUP BY lo.medico_id, DATE_TRUNC('month', lo.fecha_orden), lo.status, lo.prioridad;

CREATE INDEX IF NOT EXISTS idx_mv_lab_doctor_month ON mv_doctor_lab_agg(doctor_id, month DESC, status);

-- ----------------------------------------------------------------------------
-- 6. Vista de Farmacia Agregada
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_doctor_pharmacy_agg AS
SELECT
    fr.medico_id AS doctor_id,
    DATE_TRUNC('month', fr.created_at) AS month,
    fr.estado,
    COUNT(*) AS total_prescriptions,
    COUNT(DISTINCT fr.paciente_id) AS unique_patients,
    SUM(fr.total) AS total_value
FROM farmacia_recetas fr
WHERE fr.created_at >= NOW() - INTERVAL '12 months'
GROUP BY fr.medico_id, DATE_TRUNC('month', fr.created_at), fr.estado;

CREATE INDEX IF NOT EXISTS idx_mv_pharmacy_doctor_month ON mv_doctor_pharmacy_agg(doctor_id, month DESC);

-- ----------------------------------------------------------------------------
-- 7. Vista de Eficiencia Operativa
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_doctor_efficiency_agg AS
SELECT
    a.medico_id AS doctor_id,
    DATE_TRUNC('month', a.appointment_date) AS month,
    COUNT(*) AS total_appointments,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS completed_appointments,
    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) AS cancelled_appointments,
    COUNT(CASE WHEN a.status = 'pending' THEN 1 END) AS pending_appointments,
    COUNT(CASE WHEN a.status = 'no-show' THEN 1 END) AS no_show_appointments,
    AVG(a.duration) AS avg_duration,
    COUNT(CASE WHEN a.appointment_date < a.created_at THEN 1 END) AS last_minute_bookings,
    COUNT(DISTINCT a.location_id) AS locations_used
FROM appointments a
WHERE a.appointment_date >= NOW() - INTERVAL '12 months'
GROUP BY a.medico_id, DATE_TRUNC('month', a.appointment_date);

CREATE INDEX IF NOT EXISTS idx_mv_efficiency_doctor_month ON mv_doctor_efficiency_agg(doctor_id, month DESC);

-- ----------------------------------------------------------------------------
-- Función para refrescar vistas materializadas
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION refresh_statistics_views()
RETURNS TABLE(
    view_name TEXT,
    status TEXT,
    refresh_time TIMESTAMP
) AS $$
DECLARE
    v RECORD;
BEGIN
    -- Refrescar cada vista de forma concurrente si es posible
    FOR v IN SELECT unnest(ARRAY[
        'mv_doctor_patients_agg',
        'mv_doctor_diagnoses_agg',
        'mv_doctor_revenue_agg',
        'mv_doctor_temporal_patterns',
        'mv_doctor_lab_agg',
        'mv_doctor_pharmacy_agg',
        'mv_doctor_efficiency_agg'
    ]) AS view_name
    LOOP
        BEGIN
            EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I', v.view_name);
            RETURN NEXT SELECT v.view_name, 'success', NOW();
        EXCEPTION WHEN OTHERS THEN
            RETURN NEXT SELECT v.view_name, 'error: ' || SQLERRM, NOW();
        END;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Comentario sobre la migración
-- ----------------------------------------------------------------------------
COMMENT ON MATERIALIZED VIEW mv_doctor_patients_agg IS 'Agregación de pacientes por médico y mes';
COMMENT ON MATERIALIZED VIEW mv_doctor_diagnoses_agg IS 'Agregación de diagnósticos por médico y semana';
COMMENT ON MATERIALIZED VIEW mv_doctor_revenue_agg IS 'Agregación de ingresos por médico, mes y tipo';
COMMENT ON MATERIALIZED VIEW mv_doctor_temporal_patterns IS 'Patrones temporales de consultas por médico';
COMMENT ON MATERIALIZED VIEW mv_doctor_lab_agg IS 'Agregación de órdenes de laboratorio por médico';
COMMENT ON MATERIALIZED VIEW mv_doctor_pharmacy_agg IS 'Agregación de recetas de farmacia por médico';
COMMENT ON MATERIALIZED VIEW mv_doctor_efficiency_agg IS 'Métricas de eficiencia operativa por médico';
COMMENT ON FUNCTION refresh_statistics_views() IS 'Refresca todas las vistas materializadas de estadísticas';
