-- Migración para optimizar índices y consultas del dashboard
-- Mejora significativa el rendimiento de queries frecuentes

-- ============================================================================
-- ÍNDICES COMPUESTOS PARA CONSULTAS FRECUENTES
-- ============================================================================

-- Índice para appointments (muy usado en dashboard)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_status_date
ON appointments(doctor_id, status, appointment_date);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date
ON appointments(doctor_id, appointment_date, appointment_time);

-- Índice para dashboard_preferences (consultado constantemente)
CREATE INDEX IF NOT EXISTS idx_dashboard_preferences_doctor
ON dashboard_preferences(doctor_id);

-- Índice compuesto para doctor_widget_modes (muy usado en dashboard)
CREATE INDEX IF NOT EXISTS idx_doctor_widget_modes_doctor_widget
ON doctor_widget_modes(doctor_id, widget_id);

-- Índice para doctor_revenue_analytics (widgets financieros)
CREATE INDEX IF NOT EXISTS idx_doctor_revenue_analytics_doctor_month
ON doctor_revenue_analytics(doctor_id, month);

-- Índice para doctor_productivity_metrics (widgets de productividad)
CREATE INDEX IF NOT EXISTS idx_doctor_productivity_metrics_doctor_month
ON doctor_productivity_metrics(doctor_id, month);

-- Índice para doctor_tasks (widget de tareas)
CREATE INDEX IF NOT EXISTS idx_doctor_tasks_doctor_status
ON doctor_tasks(doctor_id, is_completed, priority)
WHERE is_completed = false;

-- Índice para doctor_notifications (widget de notificaciones)
CREATE INDEX IF NOT EXISTS idx_doctor_notifications_doctor_unread
ON doctor_notifications(doctor_id, is_read, created_at)
WHERE is_read = false;

-- Índices para tablas de citas (usadas por múltiples widgets)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_status
ON appointments(doctor_id, status);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_range
ON appointments(doctor_id, appointment_date, appointment_time);

-- Índice para consultas de pacientes (widget de pacientes pendientes)
CREATE INDEX IF NOT EXISTS idx_doctor_tasks_doctor_category
ON doctor_tasks(doctor_id, category, is_completed)
WHERE is_completed = false;

-- ============================================================================
-- ÍNDICES DE JSONB PARA QUERIES EN CAMPOS JSON
-- ============================================================================

-- Índice para consultas en el campo metadata (si existe)
CREATE INDEX IF NOT EXISTS idx_doctor_notifications_metadata_gin
ON doctor_notifications USING GIN(to_jsonb(metadata));

-- Índice para tablas con JSONB de configuración
CREATE INDEX IF NOT EXISTS idx_dashboard_preferences_layout_simple_gin
ON dashboard_preferences USING GIN(to_jsonb(layout_simple));

CREATE INDEX IF NOT EXISTS idx_dashboard_preferences_layout_pro_gin
ON dashboard_preferences USING GIN(to_jsonb(layout_pro));

-- ============================================================================
-- ÍNDICES DE FECHA Y TIEMPO
-- ============================================================================

-- Índice para consultas por fecha de creación (muy común)
CREATE INDEX IF NOT EXISTS idx_dashboard_preferences_created_at
ON dashboard_preferences(created_at);

CREATE INDEX IF NOT EXISTS idx_doctor_widget_modes_created_at
ON doctor_widget_modes(created_at);

-- ============================================================================
-- ÍNDICES DE TEXT PARA BÚSQUEDAS
-- ============================================================================

-- Índice para búsquedas en títulos de widgets
CREATE INDEX IF NOT EXISTS idx_doctor_tasks_title_text_pattern
ON doctor_tasks USING gin(to_tsvector('spanish', title));

-- Índice para búsquedas en tareas por prioridad
CREATE INDEX IF NOT EXISTS idx_doctor_tasks_priority
ON doctor_tasks(doctor_id, priority, created_at)
WHERE is_completed = false;

-- ============================================================================
-- FUNCIONES PARA MANTENER ÍNDICES ACTUALIZADOS
-- ============================================================================

-- Función para reconstruir índices fragmentados (ejecutar manualmente cuando sea necesario)
CREATE OR REPLACE FUNCTION rebuild_dashboard_indexes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log de inicio
  RAISE NOTICE 'Rebuilding dashboard indexes...';

  -- Rebuild índices fragmentados
  REINDEX INDEX idx_appointments_doctor_status_date;
  REINDEX INDEX idx_appointments_doctor_date;
  REINDEX INDEX idx_dashboard_preferences_doctor;
  REINDEX INDEX idx_doctor_widget_modes_doctor_widget;

  -- Rebuild índices GIN
  REINDEX INDEX idx_doctor_notifications_metadata_gin;

  -- Log de finalización
  RAISE NOTICE 'Dashboard indexes rebuilt successfully';
END;
$$;

-- Función para monitorear consultas lentas en el dashboard
CREATE OR REPLACE FUNCTION log_slow_dashboard_queries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  slow_query RECORD;
BEGIN
  -- Log queries que tardan más de 500ms
  FOR slow_query IN
    SELECT query, mean_time, calls
    FROM pg_stat_statements
    WHERE query LIKE '%dashboard%'
      AND mean_time > 0.5
      AND calls > 10
    ORDER BY mean_time DESC
    LIMIT 10
  LOOP
    RAISE NOTICE 'Slow dashboard query: % (mean: %ms, calls: %)',
                 slow_query.query,
                 slow_query.mean_time * 1000,
                 slow_query.calls;
  END LOOP;
END;
$$;

-- ============================================================================
-- LIMPIEZA DE ÍNDICES DUPLICADOS O NO USADOS
-- ============================================================================

-- Eliminar índices duplicados si existen
DROP INDEX IF EXISTS idx_appointments_doctor_id_status;
DROP INDEX IF EXISTS idx_doctor_tasks_doctor_completed;

-- ============================================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================================================

COMMENT ON INDEX idx_appointments_doctor_status_date IS
  'Índice compuesto para consultas de citas por médico, estado y fecha';

COMMENT ON INDEX idx_dashboard_preferences_doctor IS
  'Índice para rápida búsqueda de preferencias de dashboard por médico';

COMMENT ON INDEX idx_doctor_widget_modes_doctor_widget IS
  'Índice compuesto para consultas de modos de widget por médico y widget';

COMMENT ON INDEX idx_doctor_tasks_doctor_status IS
  'Índice para tareas pendientes del médico por prioridad';

COMMENT ON FUNCTION rebuild_dashboard_indexes() IS
  'Reconstruye índices fragmentados del dashboard para mejorar rendimiento';

-- ============================================================================
-- PRÓXIMOS PASOS RECOMENDADOS
-- ============================================================================

/*
1. Monitorear el rendimiento con:
   - EXPLAIN ANALYZE en queries del dashboard
   - pg_stat_statements para identificar queries lentas
   - pg_stat_activity para ver queries activas

2. Consideraciones adicionales:
   - Si las consultas siguen lentas, añadir paginación
   - Considerar caché de resultados para queries estáticas
   - Implementar rate limiting en APIs del dashboard

3. Automatización:
   - Ejecutar rebuild_dashboard_indexes mensualmente
   - Monitorear queries lentas semanalmente
*/
