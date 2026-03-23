-- ============================================
-- SISTEMA COMPLETO DE MÉDICOS
-- ============================================

-- Tabla de especialidades médicas
CREATE TABLE IF NOT EXISTS specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  active BOOLEAN DEFAULT true,
  modules_config JSONB DEFAULT '{
    "citas": true,
    "historial": true,
    "mensajeria": true,
    "telemedicina": true,
    "recetas": true,
    "laboratorio": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de detalles de médicos
CREATE TABLE IF NOT EXISTS doctor_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES specialties(id),
  license_number TEXT,
  license_country TEXT DEFAULT 'VE',
  years_experience INTEGER DEFAULT 0,
  professional_phone TEXT,
  professional_email TEXT,
  clinic_address TEXT,
  consultation_duration INTEGER DEFAULT 30, -- minutos
  consultation_price DECIMAL(10,2),
  accepts_insurance BOOLEAN DEFAULT false,
  bio TEXT,
  languages TEXT[] DEFAULT ARRAY['es'],
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sacs_verified BOOLEAN DEFAULT false,
  sacs_data JSONB,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  schedule JSONB DEFAULT '{
    "monday": {"enabled": true, "slots": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}]},
    "tuesday": {"enabled": true, "slots": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}]},
    "wednesday": {"enabled": true, "slots": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}]},
    "thursday": {"enabled": true, "slots": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}]},
    "friday": {"enabled": true, "slots": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}]},
    "saturday": {"enabled": false, "slots": []},
    "sunday": {"enabled": false, "slots": []}
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Tabla de pacientes del médico (relación médico-paciente)
CREATE TABLE IF NOT EXISTS doctor_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_consultation_date TIMESTAMPTZ,
  last_consultation_date TIMESTAMPTZ,
  total_consultations INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id)
);

-- Tabla de notas médicas
CREATE TABLE IF NOT EXISTS medical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  note_type TEXT DEFAULT 'consultation' CHECK (note_type IN ('consultation', 'diagnosis', 'treatment', 'follow_up', 'general')),
  title TEXT,
  content TEXT NOT NULL,
  diagnosis TEXT,
  treatment_plan TEXT,
  prescriptions JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de estadísticas del médico (cache)
CREATE TABLE IF NOT EXISTS doctor_stats_cache (
  doctor_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_patients INTEGER DEFAULT 0,
  total_consultations INTEGER DEFAULT 0,
  consultations_this_month INTEGER DEFAULT 0,
  consultations_today INTEGER DEFAULT 0,
  pending_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  cancelled_appointments INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  revenue_this_month DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar especialidades por defecto
INSERT INTO specialties (name, description, icon) VALUES
  ('Medicina General', 'Atención médica integral y preventiva', 'stethoscope'),
  ('Cardiología', 'Especialista en enfermedades del corazón', 'heart'),
  ('Pediatría', 'Atención médica para niños y adolescentes', 'baby'),
  ('Ginecología', 'Salud reproductiva femenina', 'user'),
  ('Dermatología', 'Enfermedades de la piel', 'droplet'),
  ('Oftalmología', 'Salud visual y ocular', 'eye'),
  ('Traumatología', 'Lesiones y enfermedades del sistema musculoesquelético', 'bone'),
  ('Psiquiatría', 'Salud mental y trastornos psiquiátricos', 'brain'),
  ('Odontología', 'Salud bucal y dental', 'smile'),
  ('Nutrición', 'Alimentación y nutrición saludable', 'apple')
ON CONFLICT (name) DO NOTHING;

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_doctor_details_profile ON doctor_details(profile_id);
CREATE INDEX IF NOT EXISTS idx_doctor_details_specialty ON doctor_details(specialty_id);
CREATE INDEX IF NOT EXISTS idx_doctor_details_verified ON doctor_details(is_verified, is_active);
CREATE INDEX IF NOT EXISTS idx_doctor_patients_doctor ON doctor_patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_patients_patient ON doctor_patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_notes_doctor ON medical_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_notes_patient ON medical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_notes_appointment ON medical_notes(appointment_id);

-- RLS Policies
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_stats_cache ENABLE ROW LEVEL SECURITY;

-- Policies para specialties (público para lectura)
CREATE POLICY "Specialties are viewable by everyone"
  ON specialties FOR SELECT
  USING (active = true);

-- Policies para doctor_details
CREATE POLICY "Doctors can view their own details"
  ON doctor_details FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Doctors can update their own details"
  ON doctor_details FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Doctors can insert their own details"
  ON doctor_details FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Verified doctors are viewable by patients"
  ON doctor_details FOR SELECT
  USING (is_verified = true AND is_active = true);

-- Policies para doctor_patients
CREATE POLICY "Doctors can view their patients"
  ON doctor_patients FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "Patients can view their doctors"
  ON doctor_patients FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can manage their patient relationships"
  ON doctor_patients FOR ALL
  USING (doctor_id = auth.uid());

-- Policies para medical_notes
CREATE POLICY "Doctors can view their own notes"
  ON medical_notes FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "Patients can view their non-private notes"
  ON medical_notes FOR SELECT
  USING (patient_id = auth.uid() AND is_private = false);

CREATE POLICY "Doctors can create notes"
  ON medical_notes FOR INSERT
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their notes"
  ON medical_notes FOR UPDATE
  USING (doctor_id = auth.uid());

-- Policies para doctor_stats_cache
CREATE POLICY "Doctors can view their own stats"
  ON doctor_stats_cache FOR SELECT
  USING (doctor_id = auth.uid());

-- Función para actualizar estadísticas del médico
CREATE OR REPLACE FUNCTION update_doctor_stats(doctor_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO doctor_stats_cache (doctor_id)
  VALUES (doctor_uuid)
  ON CONFLICT (doctor_id) DO UPDATE SET
    total_patients = (
      SELECT COUNT(DISTINCT patient_id)
      FROM doctor_patients
      WHERE doctor_id = doctor_uuid AND status = 'active'
    ),
    total_consultations = (
      SELECT COUNT(*)
      FROM appointments
      WHERE medico_id = doctor_uuid AND status = 'completada'
    ),
    consultations_this_month = (
      SELECT COUNT(*)
      FROM appointments
      WHERE medico_id = doctor_uuid
        AND status = 'completada'
        AND fecha_hora >= date_trunc('month', CURRENT_DATE)
    ),
    consultations_today = (
      SELECT COUNT(*)
      FROM appointments
      WHERE medico_id = doctor_uuid
        AND DATE(fecha_hora) = CURRENT_DATE
    ),
    pending_appointments = (
      SELECT COUNT(*)
      FROM appointments
      WHERE medico_id = doctor_uuid
        AND status IN ('pendiente', 'confirmada')
    ),
    completed_appointments = (
      SELECT COUNT(*)
      FROM appointments
      WHERE medico_id = doctor_uuid AND status = 'completada'
    ),
    cancelled_appointments = (
      SELECT COUNT(*)
      FROM appointments
      WHERE medico_id = doctor_uuid AND status = 'cancelada'
    ),
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctor_details_updated_at
  BEFORE UPDATE ON doctor_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_patients_updated_at
  BEFORE UPDATE ON doctor_patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_notes_updated_at
  BEFORE UPDATE ON medical_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE specialties IS 'Especialidades médicas disponibles en la plataforma';
COMMENT ON TABLE doctor_details IS 'Información detallada de los médicos';
COMMENT ON TABLE doctor_patients IS 'Relación entre médicos y sus pacientes';
COMMENT ON TABLE medical_notes IS 'Notas médicas y consultas';
COMMENT ON TABLE doctor_stats_cache IS 'Cache de estadísticas del médico para mejor rendimiento';
