-- Crear tabla para modos de widgets del médico
CREATE TABLE IF NOT EXISTS doctor_widget_modes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    widget_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('compact', 'expanded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Índices para optimización
    UNIQUE(doctor_id, widget_id),
    INDEX idx_doctor_widget_modes_doctor_id ON doctor_widget_modes(doctor_id),
    INDEX idx_doctor_widget_modes_widget_id ON doctor_widget_modes(widget_id)
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_doctor_widget_modes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER doctor_widget_modes_updated_at
    BEFORE UPDATE ON doctor_widget_modes
    FOR EACH ROW
    EXECUTE FUNCTION update_doctor_widget_modes_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE doctor_widget_modes IS 'Modos de visualización de widgets del dashboard médico (compacto/expandido)';
COMMENT ON COLUMN doctor_widget_modes.widget_id IS 'ID del widget (ej: stats-overview, today-timeline)';
COMMENT ON COLUMN doctor_widget_modes.mode IS 'Modo de visualización: compact o expanded';

-- Políticas RLS
ALTER TABLE doctor_widget_modes ENABLE ROW LEVEL SECURITY;

-- Solo el médico puede ver/modificar sus propios modos de widget
CREATE POLICY "Users can view own widget modes" ON doctor_widget_modes
    FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Users can insert own widget modes" ON doctor_widget_modes
    FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Users can update own widget modes" ON doctor_widget_modes
    FOR UPDATE USING (auth.uid() = doctor_id);

CREATE POLICY "Users can delete own widget modes" ON doctor_widget_modes
    FOR DELETE USING (auth.uid() = doctor_id);
