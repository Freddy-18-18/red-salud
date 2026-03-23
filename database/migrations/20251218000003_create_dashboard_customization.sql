/**
 * @file 20251218000003_create_dashboard_customization.sql
 * @description Migración para crear el sistema de personalización del dashboard médico.
 * Incluye tablas para preferencias, configuración de widgets, acciones rápidas y temas.
 * 
 * @tables
 * - dashboard_preferences: Preferencias generales del dashboard (modo, layouts)
 * - dashboard_widget_configs: Configuración individual de cada widget
 * - doctor_quick_actions: Acciones rápidas personalizadas del médico
 * - doctor_themes: Temas de colores personalizados
 * - doctor_tasks: Tareas pendientes del médico (para widget de tareas)
 */

-- ============================================================================
-- TABLA: dashboard_preferences
-- Almacena las preferencias principales del dashboard de cada médico
-- ============================================================================
CREATE TABLE IF NOT EXISTS dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Modo actual del dashboard (simple o pro)
  current_mode VARCHAR(20) DEFAULT 'simple' CHECK (current_mode IN ('simple', 'pro')),
  
  -- Layouts guardados como JSONB para flexibilidad
  -- Estructura: [{ id: string, x: number, y: number, w: number, h: number }]
  layout_simple JSONB DEFAULT '[]'::jsonb,
  layout_pro JSONB DEFAULT '[]'::jsonb,
  
  -- Widgets ocultos por el usuario
  hidden_widgets TEXT[] DEFAULT '{}',
  
  -- Referencia al tema activo
  active_theme_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Cada médico solo puede tener un registro de preferencias
  UNIQUE(doctor_id)
);

-- Comentarios de tabla
COMMENT ON TABLE dashboard_preferences IS 'Preferencias del dashboard para cada médico';
COMMENT ON COLUMN dashboard_preferences.current_mode IS 'Modo actual: simple (básico) o pro (completo)';
COMMENT ON COLUMN dashboard_preferences.layout_simple IS 'Posiciones de widgets en modo simple';
COMMENT ON COLUMN dashboard_preferences.layout_pro IS 'Posiciones de widgets en modo pro';
COMMENT ON COLUMN dashboard_preferences.hidden_widgets IS 'IDs de widgets que el médico ha ocultado';

-- ============================================================================
-- TABLA: dashboard_widget_configs
-- Configuración individual de cada widget (refresh rate, filters, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS dashboard_widget_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Identificador del widget (stats-overview, today-timeline, etc.)
  widget_id VARCHAR(50) NOT NULL,
  
  -- Configuración específica del widget como JSONB
  -- Permite almacenar cualquier configuración sin migrar esquema
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Si el widget está minimizado
  is_minimized BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Cada médico solo puede tener una configuración por widget
  UNIQUE(doctor_id, widget_id)
);

COMMENT ON TABLE dashboard_widget_configs IS 'Configuración individual por widget para cada médico';
COMMENT ON COLUMN dashboard_widget_configs.settings IS 'Configuración flexible del widget (filtros, refresh, etc.)';

-- ============================================================================
-- TABLA: doctor_quick_actions
-- Acciones rápidas personalizadas del médico
-- ============================================================================
CREATE TABLE IF NOT EXISTS doctor_quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Identificador de la acción (agenda, pacientes, recetas, etc.)
  action_id VARCHAR(50) NOT NULL,
  
  -- Posición en el grid de acciones rápidas (0-5 para mostrar, >5 para ocultas)
  position INTEGER NOT NULL DEFAULT 999,
  
  -- Si la acción está visible en el widget
  is_visible BOOLEAN DEFAULT true,
  
  -- Etiqueta personalizada (opcional)
  custom_label VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Cada médico solo puede tener una configuración por acción
  UNIQUE(doctor_id, action_id)
);

COMMENT ON TABLE doctor_quick_actions IS 'Configuración de acciones rápidas del dashboard';
COMMENT ON COLUMN doctor_quick_actions.position IS 'Orden de la acción (0-5 visibles, resto ocultas)';

-- ============================================================================
-- TABLA: doctor_themes
-- Temas de colores personalizados
-- ============================================================================
CREATE TABLE IF NOT EXISTS doctor_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Nombre del tema
  name VARCHAR(100) NOT NULL,
  
  -- Colores principales (formato: hex o hsl)
  primary_color VARCHAR(30) DEFAULT '#0ea5e9',
  secondary_color VARCHAR(30) DEFAULT '#14b8a6',
  accent_color VARCHAR(30) DEFAULT '#8b5cf6',
  
  -- Colores de fondo
  background_color VARCHAR(30),
  card_background VARCHAR(30),
  
  -- Estilo de fondo (gradient, solid, pattern)
  background_style VARCHAR(50) DEFAULT 'gradient',
  
  -- ¿Es el tema activo?
  is_active BOOLEAN DEFAULT false,
  
  -- ¿Es un tema personalizado o predefinido?
  is_custom BOOLEAN DEFAULT true,
  
  -- Preset ID si es un tema predefinido (ocean, forest, sunset, etc.)
  preset_id VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE doctor_themes IS 'Temas de colores personalizados del dashboard';
COMMENT ON COLUMN doctor_themes.preset_id IS 'ID del preset si es tema predefinido (ocean, forest, sunset, minimal, coral)';

-- ============================================================================
-- TABLA: doctor_tasks
-- Tareas personales del médico (para widget de tareas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS doctor_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Contenido de la tarea
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Estado y prioridad
  is_completed BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Fecha límite opcional
  due_date TIMESTAMPTZ,
  
  -- Fecha de completado
  completed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE doctor_tasks IS 'Tareas personales del médico para el widget del dashboard';

-- ============================================================================
-- TABLA: doctor_notifications
-- Notificaciones del sistema para médicos
-- ============================================================================
CREATE TABLE IF NOT EXISTS doctor_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Tipo de notificación
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'appointment_new',
    'appointment_cancelled',
    'appointment_reminder',
    'message_new',
    'patient_new',
    'review_new',
    'system_update',
    'verification_status'
  )),
  
  -- Contenido
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Datos adicionales (IDs relacionados, etc.)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Estado
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_doctor_notifications_doctor_unread 
  ON doctor_notifications(doctor_id, is_read, created_at DESC);

COMMENT ON TABLE doctor_notifications IS 'Notificaciones del sistema para médicos';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas: cada médico solo accede a sus propios datos
CREATE POLICY "Doctors can manage own dashboard preferences" 
  ON dashboard_preferences FOR ALL 
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can manage own widget configs" 
  ON dashboard_widget_configs FOR ALL 
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can manage own quick actions" 
  ON doctor_quick_actions FOR ALL 
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can manage own themes" 
  ON doctor_themes FOR ALL 
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can manage own tasks" 
  ON doctor_tasks FOR ALL 
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can view own notifications" 
  ON doctor_notifications FOR SELECT 
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own notifications" 
  ON doctor_notifications FOR UPDATE 
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

-- El sistema puede crear notificaciones para cualquier médico
CREATE POLICY "System can insert notifications" 
  ON doctor_notifications FOR INSERT 
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS para updated_at
-- ============================================================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cada tabla
CREATE TRIGGER update_dashboard_preferences_updated_at
  BEFORE UPDATE ON dashboard_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widget_configs_updated_at
  BEFORE UPDATE ON dashboard_widget_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_themes_updated_at
  BEFORE UPDATE ON doctor_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_tasks_updated_at
  BEFORE UPDATE ON doctor_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DATOS INICIALES: Temas predefinidos
-- Estos se insertarán como "plantillas" que los usuarios pueden usar
-- ============================================================================

-- Nota: Los temas predefinidos se manejarán en el código, no en la BD
-- Esto permite más flexibilidad y evita duplicación de datos

-- ============================================================================
-- ÍNDICES ADICIONALES para performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_dashboard_preferences_doctor 
  ON dashboard_preferences(doctor_id);

CREATE INDEX IF NOT EXISTS idx_dashboard_widget_configs_doctor 
  ON dashboard_widget_configs(doctor_id);

CREATE INDEX IF NOT EXISTS idx_doctor_quick_actions_doctor 
  ON doctor_quick_actions(doctor_id, position);

CREATE INDEX IF NOT EXISTS idx_doctor_themes_doctor_active 
  ON doctor_themes(doctor_id, is_active);

CREATE INDEX IF NOT EXISTS idx_doctor_tasks_doctor_incomplete 
  ON doctor_tasks(doctor_id, is_completed, due_date);
