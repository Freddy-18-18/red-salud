-- Crear tabla para análisis de ingresos del médico
CREATE TABLE IF NOT EXISTS doctor_revenue_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
    monthly_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
    weekly_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
    revenue_growth DECIMAL(5,2) NOT NULL DEFAULT 0,
    projected_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
    top_services JSONB DEFAULT '[]',
    revenue_by_month JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Índices para optimización
    UNIQUE(doctor_id),
    INDEX idx_doctor_revenue_analytics_doctor_id ON doctor_revenue_analytics(doctor_id)
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_doctor_revenue_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER doctor_revenue_analytics_updated_at
    BEFORE UPDATE ON doctor_revenue_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_doctor_revenue_analytics_updated_at();

-- Crear tabla para métricas de productividad del médico
CREATE TABLE IF NOT EXISTS doctor_productivity_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    consultations_completed INTEGER NOT NULL DEFAULT 0,
    consultations_target INTEGER NOT NULL DEFAULT 20,
    avg_consultation_time DECIMAL(4,1) NOT NULL DEFAULT 30,
    patient_satisfaction DECIMAL(5,2) NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    tasks_total INTEGER NOT NULL DEFAULT 0,
    weekly_goal_progress DECIMAL(5,2) NOT NULL DEFAULT 0,
    efficiency_rating TEXT NOT NULL CHECK (efficiency_rating IN ('excellent', 'good', 'average', 'needs_improvement')),
    streak_days INTEGER NOT NULL DEFAULT 0,
    best_day TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Índices para optimización
    UNIQUE(doctor_id),
    INDEX idx_doctor_productivity_metrics_doctor_id ON doctor_productivity_metrics(doctor_id)
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_doctor_productivity_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER doctor_productivity_metrics_updated_at
    BEFORE UPDATE ON doctor_productivity_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_doctor_productivity_metrics_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE doctor_revenue_analytics IS 'Análisis de ingresos y métricas financieras del médico';
COMMENT ON TABLE doctor_productivity_metrics IS 'Métricas de productividad y rendimiento del médico';
COMMENT ON COLUMN doctor_revenue_analytics.top_services IS 'JSON array con servicios principales y sus ingresos';
COMMENT ON COLUMN doctor_revenue_analytics.revenue_by_month IS 'JSON array con ingresos por mes';
COMMENT ON COLUMN doctor_productivity_metrics.overall_score IS 'Puntuación general de productividad (0-100)';
COMMENT ON COLUMN doctor_productivity_metrics.efficiency_rating IS 'Calificación de eficiencia basada en métricas';

-- Políticas RLS
ALTER TABLE doctor_revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_productivity_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas para doctor_revenue_analytics
CREATE POLICY "Users can view own revenue analytics" ON doctor_revenue_analytics
    FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Users can insert own revenue analytics" ON doctor_revenue_analytics
    FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Users can update own revenue analytics" ON doctor_revenue_analytics
    FOR UPDATE USING (auth.uid() = doctor_id);

-- Políticas para doctor_productivity_metrics
CREATE POLICY "Users can view own productivity metrics" ON doctor_productivity_metrics
    FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Users can insert own productivity metrics" ON doctor_productivity_metrics
    FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Users can update own productivity metrics" ON doctor_productivity_metrics
    FOR UPDATE USING (auth.uid() = doctor_id);
