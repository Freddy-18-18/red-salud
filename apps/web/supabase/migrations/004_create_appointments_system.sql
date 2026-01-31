-- Migración 004: Sistema de Citas Médicas
-- Tablas para gestionar citas entre pacientes y doctores

-- Tabla de especialidades médicas
CREATE TABLE IF NOT EXISTS medical_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de información de doctores
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES medical_specialties(id),
  license_number VARCHAR(50) UNIQUE,
  years_experience INTEGER,
  bio TEXT,
  consultation_price DECIMAL(10, 2),
  consultation_duration INTEGER DEFAULT 30, -- minutos
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de horarios disponibles de doctores
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, day_of_week, start_time)
);

-- Tabla de citas médicas
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration INTEGER DEFAULT 30, -- minutos
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  consultation_type VARCHAR(20) NOT NULL DEFAULT 'video' CHECK (consultation_type IN ('video', 'presencial', 'telefono')),
  reason TEXT,
  notes TEXT,
  meeting_url TEXT,
  price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT
);

-- Tabla de notas médicas de la cita
CREATE TABLE IF NOT EXISTS appointment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(id),
  diagnosis TEXT,
  treatment TEXT,
  prescriptions TEXT,
  follow_up_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialty ON doctor_profiles(specialty_id);

-- Habilitar RLS
ALTER TABLE medical_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_notes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para medical_specialties (público para lectura)
CREATE POLICY "Todos pueden ver especialidades"
  ON medical_specialties FOR SELECT
  TO authenticated
  USING (true);

-- Políticas RLS para doctor_profiles
CREATE POLICY "Todos pueden ver perfiles de doctores disponibles"
  ON doctor_profiles FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Doctores pueden actualizar su propio perfil"
  ON doctor_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Políticas RLS para doctor_schedules
CREATE POLICY "Todos pueden ver horarios de doctores"
  ON doctor_schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctores pueden gestionar sus horarios"
  ON doctor_schedules FOR ALL
  TO authenticated
  USING (auth.uid() = doctor_id);

-- Políticas RLS para appointments
CREATE POLICY "Pacientes pueden ver sus propias citas"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctores pueden ver sus citas"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = doctor_id);

CREATE POLICY "Pacientes pueden crear citas"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Pacientes pueden actualizar sus citas"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctores pueden actualizar sus citas"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = doctor_id);

-- Políticas RLS para appointment_notes
CREATE POLICY "Doctores pueden ver notas de sus citas"
  ON appointment_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = doctor_id);

CREATE POLICY "Pacientes pueden ver notas de sus citas"
  ON appointment_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_notes.appointment_id
      AND appointments.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctores pueden crear notas"
  ON appointment_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctores pueden actualizar sus notas"
  ON appointment_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = doctor_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_doctor_profiles_updated_at
  BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_notes_updated_at
  BEFORE UPDATE ON appointment_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar especialidades médicas comunes
INSERT INTO medical_specialties (name, description) VALUES
  ('Medicina General', 'Atención médica general y preventiva'),
  ('Cardiología', 'Especialista en enfermedades del corazón'),
  ('Dermatología', 'Especialista en enfermedades de la piel'),
  ('Pediatría', 'Atención médica para niños y adolescentes'),
  ('Ginecología', 'Salud reproductiva femenina'),
  ('Psiquiatría', 'Salud mental y trastornos psiquiátricos'),
  ('Traumatología', 'Lesiones y enfermedades del sistema musculoesquelético'),
  ('Oftalmología', 'Enfermedades de los ojos'),
  ('Otorrinolaringología', 'Oído, nariz y garganta'),
  ('Neurología', 'Enfermedades del sistema nervioso')
ON CONFLICT (name) DO NOTHING;

-- Comentarios
COMMENT ON TABLE appointments IS 'Tabla de citas médicas entre pacientes y doctores';
COMMENT ON TABLE doctor_profiles IS 'Información adicional de los doctores';
COMMENT ON TABLE doctor_schedules IS 'Horarios disponibles de los doctores';
COMMENT ON TABLE appointment_notes IS 'Notas médicas de las citas';
COMMENT ON TABLE medical_specialties IS 'Catálogo de especialidades médicas';
