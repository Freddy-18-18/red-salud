-- ============================================================================
-- Migration: P2 — KPI Query Optimizations
-- Fecha: 2025-02-15
-- Descripción:
--   1. Crea mv_doctor_ratings_agg basada en doctor_reviews (la tabla real)
--   2. Crea RPC get_doctor_appointment_counts (3 counts en 1 llamada)
--   3. Agrega UNIQUE INDEXes a MVs para REFRESH CONCURRENTLY
--   4. Corrige la función refresh_statistics_views()
--   5. Agrega pg_cron schedule para refresh automático cada hora
-- ============================================================================

-- ============================================================================
-- 1. Materialized View: Doctor Ratings Aggregation
-- ============================================================================
-- La tabla "ratings" tiene un schema viejo que requiere JOIN a "consultations".
-- La tabla real de calificaciones es "doctor_reviews" con doctor_id directo.

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_doctor_ratings_agg AS
SELECT
    dr.doctor_id,
    DATE_TRUNC('month', dr.created_at) AS month,
    COUNT(*) AS total_reviews,
    AVG(dr.rating)::DECIMAL(3,2) AS avg_rating,
    AVG(dr.punctuality_rating)::DECIMAL(3,2) AS avg_punctuality,
    AVG(dr.communication_rating)::DECIMAL(3,2) AS avg_communication,
    AVG(dr.professionalism_rating)::DECIMAL(3,2) AS avg_professionalism,
    MIN(dr.rating) AS min_rating,
    MAX(dr.rating) AS max_rating,
    COUNT(CASE WHEN dr.rating >= 4 THEN 1 END) AS positive_reviews,
    COUNT(CASE WHEN dr.rating <= 2 THEN 1 END) AS negative_reviews
FROM doctor_reviews dr
WHERE dr.created_at >= NOW() - INTERVAL '12 months'
GROUP BY dr.doctor_id, DATE_TRUNC('month', dr.created_at);

-- Unique index para REFRESH CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_ratings_doctor_month_uniq
    ON mv_doctor_ratings_agg(doctor_id, month);

-- Regular index para queries
CREATE INDEX IF NOT EXISTS idx_mv_ratings_doctor_month
    ON mv_doctor_ratings_agg(doctor_id, month DESC);

-- ============================================================================
-- 2. RPC: Get Doctor Appointment Counts (3 queries → 1 RPC)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_doctor_appointment_counts(
    p_doctor_id UUID,
    p_range_start TIMESTAMPTZ DEFAULT NULL,
    p_range_end TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_week_start DATE := DATE_TRUNC('week', CURRENT_DATE)::DATE;
    v_range_start TIMESTAMPTZ := COALESCE(p_range_start, NOW() - INTERVAL '180 days');
    v_range_end TIMESTAMPTZ := COALESCE(p_range_end, NOW());
    v_today_count BIGINT;
    v_week_count BIGINT;
    v_tele_count BIGINT;
BEGIN
    -- Today's appointments
    SELECT COUNT(*) INTO v_today_count
    FROM appointments
    WHERE medico_id = p_doctor_id
      AND fecha_hora >= v_today::TIMESTAMPTZ
      AND fecha_hora < (v_today + 1)::TIMESTAMPTZ;

    -- This week's appointments
    SELECT COUNT(*) INTO v_week_count
    FROM appointments
    WHERE medico_id = p_doctor_id
      AND fecha_hora >= v_week_start::TIMESTAMPTZ;

    -- Telemedicine in range
    SELECT COUNT(*) INTO v_tele_count
    FROM appointments
    WHERE medico_id = p_doctor_id
      AND tipo = 'telemedicina'
      AND fecha_hora >= v_range_start
      AND fecha_hora <= v_range_end;

    RETURN json_build_object(
        'today_count', COALESCE(v_today_count, 0),
        'week_count', COALESCE(v_week_count, 0),
        'telemedicina_count', COALESCE(v_tele_count, 0)
    );
END;
$$;

COMMENT ON FUNCTION get_doctor_appointment_counts(UUID, TIMESTAMPTZ, TIMESTAMPTZ)
    IS 'Returns today, week, and telemedicine appointment counts in a single RPC call';

-- ============================================================================
-- 3. Unique Indexes para REFRESH CONCURRENTLY en MVs existentes
-- ============================================================================
-- Sin un unique index, REFRESH CONCURRENTLY falla.

-- patients_agg: (doctor_id, month) is unique by GROUP BY
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_patients_doctor_month_uniq
    ON mv_doctor_patients_agg(doctor_id, month);

-- diagnoses_agg: (doctor_id, diagnostico, week) is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_diagnoses_doctor_diag_week_uniq
    ON mv_doctor_diagnoses_agg(doctor_id, diagnostico, week);

-- revenue_agg: (doctor_id, month, status, consultation_type) is unique
-- Handle NULL consultation_type with COALESCE
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_revenue_doctor_month_status_uniq
    ON mv_doctor_revenue_agg(doctor_id, month, status, COALESCE(consultation_type, '__null__'));

-- temporal_patterns: (doctor_id, day_of_week, hour, date, consultation_type, status)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_temporal_uniq
    ON mv_doctor_temporal_patterns(doctor_id, day_of_week, hour, date, COALESCE(consultation_type, '__null__'), COALESCE(status, '__null__'));

-- lab_agg: (doctor_id, month, status, prioridad)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_lab_doctor_month_uniq
    ON mv_doctor_lab_agg(doctor_id, month, COALESCE(status, '__null__'), COALESCE(prioridad, '__null__'));

-- pharmacy_agg: (doctor_id, month, estado)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_pharmacy_doctor_month_uniq
    ON mv_doctor_pharmacy_agg(doctor_id, month, COALESCE(estado, '__null__'));

-- efficiency_agg: (doctor_id, month) is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_efficiency_doctor_month_uniq
    ON mv_doctor_efficiency_agg(doctor_id, month);

-- ============================================================================
-- 4. Fix refresh_statistics_views() — include ratings view + fix syntax
-- ============================================================================
CREATE OR REPLACE FUNCTION refresh_statistics_views()
RETURNS TABLE(
    view_name TEXT,
    status TEXT,
    refresh_time TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_view TEXT;
    v_views TEXT[] := ARRAY[
        'mv_doctor_patients_agg',
        'mv_doctor_diagnoses_agg',
        'mv_doctor_revenue_agg',
        'mv_doctor_temporal_patterns',
        'mv_doctor_lab_agg',
        'mv_doctor_pharmacy_agg',
        'mv_doctor_efficiency_agg',
        'mv_doctor_ratings_agg'
    ];
BEGIN
    FOREACH v_view IN ARRAY v_views
    LOOP
        BEGIN
            EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I', v_view);
            view_name := v_view;
            status := 'success';
            refresh_time := NOW();
            RETURN NEXT;
        EXCEPTION WHEN OTHERS THEN
            view_name := v_view;
            status := 'error: ' || SQLERRM;
            refresh_time := NOW();
            RETURN NEXT;
        END;
    END LOOP;
END;
$$;

COMMENT ON FUNCTION refresh_statistics_views()
    IS 'Refresca todas las vistas materializadas de estadísticas (8 views) de forma concurrente';

-- ============================================================================
-- 5. pg_cron: Refrescar MVs cada hora (solo si pg_cron está habilitado)
-- ============================================================================
DO $$
BEGIN
    -- Check if pg_cron extension exists
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Remove existing schedule if any
        PERFORM cron.unschedule('refresh_statistics_views_hourly');
        -- Schedule hourly refresh
        PERFORM cron.schedule(
            'refresh_statistics_views_hourly',
            '15 * * * *',  -- At minute 15 of every hour
            $$SELECT * FROM refresh_statistics_views()$$
        );
        RAISE NOTICE 'pg_cron schedule created: refresh_statistics_views_hourly';
    ELSE
        RAISE NOTICE 'pg_cron not available — views must be refreshed manually via SELECT refresh_statistics_views()';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not schedule pg_cron: %', SQLERRM;
END;
$$;

-- ============================================================================
-- 6. Indexes on appointments for real-time appointment count queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_fecha
    ON appointments(medico_id, fecha_hora);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_tipo_fecha
    ON appointments(medico_id, tipo, fecha_hora);
