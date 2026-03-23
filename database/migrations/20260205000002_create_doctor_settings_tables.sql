-- Migration: Create doctor settings tables
-- Description: Creates doctor_settings, prescription_frames, and prescription_watermarks tables

-- 1. Create doctor_settings table
CREATE TABLE IF NOT EXISTS doctor_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Personal Info
    nombre_completo TEXT,
    trato TEXT CHECK (trato IN ('Dr.', 'Dra.')),
    titulo TEXT,
    cedula_profesional TEXT,
    especialidad TEXT,
    
    -- Clinic Info
    clinica_nombre TEXT,
    consultorio_direccion TEXT,
    telefono TEXT,
    email TEXT,
    
    -- Signature & Logo
    firma_digital_url TEXT,
    firma_digital_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    logo_url TEXT,
    logo_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Active Template Settings
    active_frame_id UUID,
    active_watermark_id UUID,
    frame_color TEXT DEFAULT '#0da9f7' NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create prescription_frames table
CREATE TABLE IF NOT EXISTS prescription_frames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_generic BOOLEAN DEFAULT FALSE NOT NULL,
    doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    has_customizable_color BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure generic frames don't have a doctor_id
    CONSTRAINT generic_frame_no_doctor CHECK (
        (is_generic = TRUE AND doctor_id IS NULL) OR 
        (is_generic = FALSE AND doctor_id IS NOT NULL)
    )
);

-- 3. Create prescription_watermarks table
CREATE TABLE IF NOT EXISTS prescription_watermarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_generic BOOLEAN DEFAULT FALSE NOT NULL,
    doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure generic watermarks don't have a doctor_id
    CONSTRAINT generic_watermark_no_doctor CHECK (
        (is_generic = TRUE AND doctor_id IS NULL) OR 
        (is_generic = FALSE AND doctor_id IS NOT NULL)
    )
);

-- 4. Add foreign key constraints from doctor_settings
ALTER TABLE doctor_settings 
    ADD CONSTRAINT fk_active_frame 
    FOREIGN KEY (active_frame_id) 
    REFERENCES prescription_frames(id) 
    ON DELETE SET NULL;

ALTER TABLE doctor_settings 
    ADD CONSTRAINT fk_active_watermark 
    FOREIGN KEY (active_watermark_id) 
    REFERENCES prescription_watermarks(id) 
    ON DELETE SET NULL;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctor_settings_doctor_id ON doctor_settings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescription_frames_doctor_id ON prescription_frames(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescription_frames_is_generic ON prescription_frames(is_generic);
CREATE INDEX IF NOT EXISTS idx_prescription_watermarks_doctor_id ON prescription_watermarks(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescription_watermarks_is_generic ON prescription_watermarks(is_generic);

-- 6. Enable Row Level Security
ALTER TABLE doctor_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_watermarks ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for doctor_settings
CREATE POLICY "Users can view their own settings"
    ON doctor_settings FOR SELECT
    USING ((select auth.uid()) = doctor_id);

CREATE POLICY "Users can insert their own settings"
    ON doctor_settings FOR INSERT
    WITH CHECK ((select auth.uid()) = doctor_id);

CREATE POLICY "Users can update their own settings"
    ON doctor_settings FOR UPDATE
    USING ((select auth.uid()) = doctor_id);

CREATE POLICY "Users can delete their own settings"
    ON doctor_settings FOR DELETE
    USING ((select auth.uid()) = doctor_id);

-- 8. RLS Policies for prescription_frames
CREATE POLICY "Anyone can view generic frames"
    ON prescription_frames FOR SELECT
    USING (is_generic = TRUE);

CREATE POLICY "Users can view their own frames"
    ON prescription_frames FOR SELECT
    USING ((select auth.uid()) = doctor_id);

CREATE POLICY "Users can create their own frames"
    ON prescription_frames FOR INSERT
    WITH CHECK ((select auth.uid()) = doctor_id AND is_generic = FALSE);

CREATE POLICY "Users can update their own frames"
    ON prescription_frames FOR UPDATE
    USING ((select auth.uid()) = doctor_id AND is_generic = FALSE);

CREATE POLICY "Users can delete their own frames"
    ON prescription_frames FOR DELETE
    USING ((select auth.uid()) = doctor_id AND is_generic = FALSE);

-- 9. RLS Policies for prescription_watermarks
CREATE POLICY "Anyone can view generic watermarks"
    ON prescription_watermarks FOR SELECT
    USING (is_generic = TRUE);

CREATE POLICY "Users can view their own watermarks"
    ON prescription_watermarks FOR SELECT
    USING ((select auth.uid()) = doctor_id);

CREATE POLICY "Users can create their own watermarks"
    ON prescription_watermarks FOR INSERT
    WITH CHECK ((select auth.uid()) = doctor_id AND is_generic = FALSE);

CREATE POLICY "Users can update their own watermarks"
    ON prescription_watermarks FOR UPDATE
    USING ((select auth.uid()) = doctor_id AND is_generic = FALSE);

CREATE POLICY "Users can delete their own watermarks"
    ON prescription_watermarks FOR DELETE
    USING ((select auth.uid()) = doctor_id AND is_generic = FALSE);

-- 10. Seed generic prescription frames
INSERT INTO prescription_frames (name, image_url, is_generic, has_customizable_color)
VALUES 
    ('Marco Clásico Azul', '/templates/frames/classic-blue.svg', TRUE, TRUE),
    ('Marco Moderno Verde', '/templates/frames/modern-green.svg', TRUE, TRUE),
    ('Marco Elegante Púrpura', '/templates/frames/elegant-purple.svg', TRUE, TRUE),
    ('Sin Marco', '/templates/frames/no-frame.svg', TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- 11. Seed generic prescription watermarks  
INSERT INTO prescription_watermarks (name, image_url, is_generic)
VALUES 
    ('Sin Marca de Agua', '', TRUE),
    ('Marca de Agua Clásica', '/templates/watermarks/classic.svg', TRUE),
    ('Marca de Agua Moderna', '/templates/watermarks/modern.svg', TRUE),
    ('Marca de Agua Sutil', '/templates/watermarks/subtle.svg', TRUE)
ON CONFLICT DO NOTHING;

-- 12. Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Add triggers for updated_at
DROP TRIGGER IF EXISTS update_doctor_settings_updated_at ON doctor_settings;
CREATE TRIGGER update_doctor_settings_updated_at
    BEFORE UPDATE ON doctor_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
