-- Migración 009: Sistema de Médicos con Especialidades y Configuración Flexible
-- Permite crear dashboards personalizados por especialidad

-- ============================================
-- TABLA: medical_specialties (Especialidades Médicas)
-- ============================================
CREATE TABLE IF NOT EXISTS medical_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- Nombre del icono de lucide-react
  color VARCHAR(50), -- Color hex o tailwind
  -- Módulos habilitados por defecto para esta especialidad
  modules_config JSONB DEFAULT '{
    "citas": true,
    "historial": true,
    "recetas": true,
    "telemedicina": true,
    "mensajeria": true,
    "laboratorio": true,
    "metricas": false,
    "documentos": true
  }'::jsonb,
  -- Campos personalizados para consultas
  custom_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_specialties_name ON medical_specialties(name);

-- ============================================
-- TABLA: doctor_profiles (Perfiles de Médicos)
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES medical_specialties(id),
  license_number VARCHAR(50) UNIQUE NOT NULL, -- Matrícula profesional
  license_country VARCHAR(2) DEFAULT 'AR', -- ISO country code
  
  -- Información profesional
  years_experience INTEGER DEFAULT 0,
  education JSONB DEFAULT '[]'::jsonb, -- [{institution, degree, year}]
  certifications JSONB DEFAULT '[]'::jsonb, -- [{name, issuer, year, expires}]
  languages JSONB DEFAULT '["es"]'::jsonb, -- Idiomas que habla
  
  -- Información de contacto profesional
  professional_phone VARCHAR(20),
  professional_email VARCHAR(255),
  clinic_address TEXT,
  
  -- Configuración de agenda
  consultation_duration INTEGER DEFAULT 30, -- minutos
  consultation_price DECIMAL(10,2),
  accepts_insurance BOOLEAN DEFAULT false,
  insurance_providers JSONB DEFAULT '[]'::jsonb,
  
  -- Horarios de atención (por día de semana)
  schedule JSONB DEFAULT '{
    "monday": {"enabled": true, "slots": [{"start": "09:00", "end": "17:00"}]},
    "tuesday": {"enabled": true, "slots": [{"start": "09:00", "end": "17:00"}]},
    "wednesday": {"enabled": true, "slots": [{"start": "09:00", "end": "17:00"}]},
    "thursday": {"enabled": true, "slots": [{"start": "09:00", "end": "17:00"}]},
    "friday": {"enabled": true, "slots": [{"start": "09:00", "end": "17:00"}]},
    "saturday": {"enabled": false, "slots": []},
    "sunday": {"enabled": false, "slots": []}
  }'::jsonb,
  
  -- Configuración personalizada del dashboard
  dashboard_config JSONB DEFAULT '{}'::jsonb,
  
  -- Estado de verificación
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES profiles(id),
  
  -- Estadísticas
  total_consultations INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  
  -- Bio y presentación
  bio TEXT,
  specialization_areas TEXT[], -- Sub-especialidades
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  accepts_new_patients BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_doctor_specialty ON doctor_profiles(specialty_id);
CREATE INDEX idx_doctor_license ON doctor_profiles(license_number);
CREATE INDEX idx_doctor_verified ON doctor_profiles(is_verified);
CREATE INDEX idx_doctor_active ON doctor_profiles(is_active);

-- ============================================
-- TABLA: doctor_reviews (Reseñas de Médicos)
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  -- Ratings específicos
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  
  is_anonymous BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false, -- Si la cita fue confirmada
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(doctor_id, patient_id, appointment_id)
);

-- Índices
CREATE INDEX idx_reviews_doctor ON doctor_reviews(doctor_id);
CREATE INDEX idx_reviews_patient ON doctor_reviews(patient_id);
CREATE INDEX idx_reviews_rating ON doctor_reviews(rating);

-- ============================================
-- TABLA: doctor_availability_exceptions (Excepciones de Disponibilidad)
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT false, -- false = no disponible, true = disponible fuera de horario
  reason VARCHAR(255),
  
  -- Si is_available = true, especificar slots
  custom_slots JSONB DEFAULT '[]'::jsonb, -- [{"start": "10:00", "end": "12:00"}]
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(doctor_id, date)
);

-- Índices
CREATE INDEX idx_availability_doctor ON doctor_availability_exceptions(doctor_id);
CREATE INDEX idx_availability_date ON doctor_availability_exceptions(date);

-- ============================================
-- INSERTAR ESPECIALIDADES COMUNES
-- ============================================
INSERT INTO medical_specialties (name, description, icon, color, modules_config) VALUES
('Medicina General', 'Atención médica integral y preventiva', 'Stethoscope', '#3B82F6', 
  '{"citas": true, "historial": true, "recetas": true, "telemedicina": true, "mensajeria": true, "laboratorio": true, "metricas": true, "documentos": true}'::jsonb),
  
('Cardiología', 'Especialista en enfermedades del corazón', 'Heart', '#EF4444',
  '{"citas": true, "historial": true, "recetas": true, "telemedicina": true, "mensajeria": true, "laboratorio": true, "metricas": true, "documentos": true}'::jsonb),
  
('Pediatría', 'Atención médica para niños y adolescentes', 'Baby', '#10B981',
  '{"citas": true, "historial": true, "recetas": true, "telemedicina": true, "mensajeria": true, "laboratorio": true, "metricas": true, "documentos": true}'::jsonb),
  
('Dermatología', 'Especialista en piel, cabello y uñas', 'Sparkles', '#F59E0B',
  '{"citas": true, "historial": true, "recetas": true, "telemedicina": true, "mensajeria": true, "laboratorio": false, "metricas": false, "documentos": true}'::jsonb),
  
('Ginecología', 'Salud reproductiva femenina', 'User', '#EC4899',
  '{"citas": true, "historial": true, "recetas": true, "telemedicina": true, "mensajeria": true, "laboratorio": true, "metricas": false, "documentos": true}'::jsonb),
  
('Traumatología', 'Lesiones y enfermedades del sistema musculoesquelético', 'Bone', '#8B5CF6',
  '{"citas": true, "historial": true, "recetas": true, "telemedicina": false, "mensajeria": true, "laboratorio": true, "metricas": false, "documentos": true}'::jsonb),
  
('Psiquiatría', 'Salud mental y trastornos psiquiátricos', 'Brain', '#6366F1',
  '{"citas": true, "historial": true, "recetas": true, "telemedicina": true, "mensajeria": true, "laboratorio": false, "metricas": true, "documentos": true}'::jsonb),
  
('Oftalmología', 'Especialista en ojos y visión', 'Eye', '#14B8A6',
  '{"citas": true, "historial": true, "recetas": true, "telemedicina": false, "mensajeria": true, "laboratorio": false, "metricas": false, "documentos": true}'::jsonb),
  
('Nutrición', 'Alimentación y nutrición clínica', 'Apple', '#84CC16',
  '{"citas": true, "historial": true, "recetas": false, "telemedicina": true, "mensajeria": true, "laboratorio": true, "metricas": true, "documentos": true}'::jsonb),
  
('Odontología', 'Salud bucal y dental', 'Smile', '#06B6D4',
  '{"citas": true, "historial": true, "recetas": true, "telemedicina": false, "mensajeria": true, "laboratorio": false, "metricas": false, "documentos": true}'::jsonb);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_doctor_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_doctor_profiles_updated_at
  BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_profiles_updated_at();

CREATE TRIGGER trigger_update_specialties_updated_at
  BEFORE UPDATE ON medical_specialties
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_profiles_updated_at();

-- Función para actualizar estadísticas del médico cuando se crea una reseña
CREATE OR REPLACE FUNCTION update_doctor_stats_on_review()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE doctor_profiles
  SET 
    total_reviews = (SELECT COUNT(*) FROM doctor_reviews WHERE doctor_id = NEW.doctor_id),
    average_rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM doctor_reviews WHERE doctor_id = NEW.doctor_id)
  WHERE id = NEW.doctor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_doctor_stats
  AFTER INSERT OR UPDATE ON doctor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_stats_on_review();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Especialidades: públicas para lectura
ALTER TABLE medical_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Especialidades son públicas"
  ON medical_specialties FOR SELECT
  TO authenticated
  USING (true);

-- Doctor profiles: públicos para búsqueda, editables por el dueño
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles de médicos son públicos para lectura"
  ON doctor_profiles FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Médicos pueden actualizar su propio perfil"
  ON doctor_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Médicos pueden insertar su propio perfil"
  ON doctor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Reviews: pacientes pueden crear, todos pueden leer
ALTER TABLE doctor_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reseñas son públicas para lectura"
  ON doctor_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Pacientes pueden crear reseñas"
  ON doctor_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Pacientes pueden actualizar sus reseñas"
  ON doctor_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id);

-- Availability exceptions: solo el médico
ALTER TABLE doctor_availability_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Médicos pueden ver sus excepciones"
  ON doctor_availability_exceptions FOR SELECT
  TO authenticated
  USING (auth.uid() = doctor_id);

CREATE POLICY "Médicos pueden crear excepciones"
  ON doctor_availability_exceptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Médicos pueden actualizar sus excepciones"
  ON doctor_availability_exceptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = doctor_id);

CREATE POLICY "Médicos pueden eliminar sus excepciones"
  ON doctor_availability_exceptions FOR DELETE
  TO authenticated
  USING (auth.uid() = doctor_id);

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE medical_specialties IS 'Catálogo de especialidades médicas con configuración de módulos';
COMMENT ON TABLE doctor_profiles IS 'Perfiles extendidos de médicos con especialidad y configuración';
COMMENT ON TABLE doctor_reviews IS 'Reseñas y calificaciones de médicos por pacientes';
COMMENT ON TABLE doctor_availability_exceptions IS 'Excepciones de disponibilidad (vacaciones, días especiales)';
