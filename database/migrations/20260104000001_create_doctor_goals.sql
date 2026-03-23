-- ============================================================================
-- Migración: Crear tabla doctor_goals para metas mensuales
-- Descripción: Almacena objetivos mensuales del médico para el dashboard
-- ============================================================================

-- Tabla principal de metas del doctor
CREATE TABLE IF NOT EXISTS doctor_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Período
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    
    -- Metas configurables
    target_appointments INTEGER DEFAULT 0,
    target_new_patients INTEGER DEFAULT 0,
    target_revenue DECIMAL(12,2) DEFAULT 0,
    target_rating DECIMAL(2,1) DEFAULT 0 CHECK (target_rating >= 0 AND target_rating <= 5),
    
    -- Progreso actual (calculado o actualizado periódicamente)
    current_appointments INTEGER DEFAULT 0,
    current_new_patients INTEGER DEFAULT 0,
    current_revenue DECIMAL(12,2) DEFAULT 0,
    current_rating DECIMAL(2,1) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: Un registro por doctor por mes
    UNIQUE(doctor_id, year, month)
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_doctor_goals_doctor_id ON doctor_goals(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_goals_period ON doctor_goals(year, month);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_doctor_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_doctor_goals_updated_at ON doctor_goals;
CREATE TRIGGER trigger_doctor_goals_updated_at
    BEFORE UPDATE ON doctor_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_doctor_goals_updated_at();

-- RLS (Row Level Security)
ALTER TABLE doctor_goals ENABLE ROW LEVEL SECURITY;

-- Política: Doctores solo ven sus propias metas
CREATE POLICY "doctor_goals_select_own" ON doctor_goals
    FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "doctor_goals_insert_own" ON doctor_goals
    FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "doctor_goals_update_own" ON doctor_goals
    FOR UPDATE USING (auth.uid() = doctor_id);

CREATE POLICY "doctor_goals_delete_own" ON doctor_goals
    FOR DELETE USING (auth.uid() = doctor_id);

-- Comentarios
COMMENT ON TABLE doctor_goals IS 'Metas mensuales de cada médico para seguimiento en dashboard';
COMMENT ON COLUMN doctor_goals.target_appointments IS 'Meta de citas a completar en el mes';
COMMENT ON COLUMN doctor_goals.target_new_patients IS 'Meta de nuevos pacientes en el mes';
COMMENT ON COLUMN doctor_goals.target_revenue IS 'Meta de ingresos en el mes';
COMMENT ON COLUMN doctor_goals.target_rating IS 'Meta de calificación promedio';
