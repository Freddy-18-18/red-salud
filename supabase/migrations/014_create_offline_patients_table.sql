-- ============================================
-- TABLA DE PACIENTES OFFLINE
-- Para médicos que registran pacientes que aún no están en la plataforma
-- ============================================

CREATE TABLE IF NOT EXISTS offline_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cedula TEXT NOT NULL,
  nombre_completo TEXT NOT NULL,
  fecha_nacimiento DATE,
  genero TEXT CHECK (genero IN ('M', 'F')),
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  tipo_sangre TEXT,
  alergias TEXT[],
  condiciones_cronicas TEXT[],
  medicamentos_actuales TEXT[],
  notas_medico TEXT,
  status TEXT DEFAULT 'offline' CHECK (status IN ('offline', 'linked', 'archived')),
  linked_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  linked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, cedula)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_offline_patients_doctor ON offline_patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_offline_patients_cedula ON offline_patients(cedula);
CREATE INDEX IF NOT EXISTS idx_offline_patients_status ON offline_patients(status);
CREATE INDEX IF NOT EXISTS idx_offline_patients_linked_profile ON offline_patients(linked_profile_id);

-- RLS
ALTER TABLE offline_patients ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Doctors can view their offline patients"
  ON offline_patients FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create offline patients"
  ON offline_patients FOR INSERT
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their offline patients"
  ON offline_patients FOR UPDATE
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete their offline patients"
  ON offline_patients FOR DELETE
  USING (doctor_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_offline_patients_updated_at
  BEFORE UPDATE ON offline_patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para vincular paciente offline cuando se registra
CREATE OR REPLACE FUNCTION link_offline_patient_on_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el nuevo perfil tiene cédula, buscar pacientes offline con esa cédula
  IF NEW.cedula IS NOT NULL THEN
    -- Actualizar pacientes offline con esa cédula
    UPDATE offline_patients
    SET 
      status = 'linked',
      linked_profile_id = NEW.id,
      linked_at = NOW()
    WHERE cedula = NEW.cedula
      AND status = 'offline'
      AND linked_profile_id IS NULL;
    
    -- Crear relaciones médico-paciente automáticamente
    INSERT INTO doctor_patients (doctor_id, patient_id, first_consultation_date, notes)
    SELECT 
      doctor_id,
      NEW.id,
      created_at,
      notas_medico
    FROM offline_patients
    WHERE cedula = NEW.cedula
      AND status = 'linked'
      AND linked_profile_id = NEW.id
    ON CONFLICT (doctor_id, patient_id) DO NOTHING;
    
    -- Copiar información médica al perfil si no existe
    IF NEW.alergias IS NULL OR array_length(NEW.alergias, 1) IS NULL THEN
      UPDATE profiles
      SET alergias = (
        SELECT alergias
        FROM offline_patients
        WHERE cedula = NEW.cedula
          AND status = 'linked'
          AND alergias IS NOT NULL
        LIMIT 1
      )
      WHERE id = NEW.id;
    END IF;
    
    IF NEW.condiciones_cronicas IS NULL OR array_length(NEW.condiciones_cronicas, 1) IS NULL THEN
      UPDATE profiles
      SET condiciones_cronicas = (
        SELECT condiciones_cronicas
        FROM offline_patients
        WHERE cedula = NEW.cedula
          AND status = 'linked'
          AND condiciones_cronicas IS NOT NULL
        LIMIT 1
      )
      WHERE id = NEW.id;
    END IF;
    
    IF NEW.medicamentos_actuales IS NULL OR array_length(NEW.medicamentos_actuales, 1) IS NULL THEN
      UPDATE profiles
      SET medicamentos_actuales = (
        SELECT medicamentos_actuales
        FROM offline_patients
        WHERE cedula = NEW.cedula
          AND status = 'linked'
          AND medicamentos_actuales IS NOT NULL
        LIMIT 1
      )
      WHERE id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para vincular automáticamente cuando un paciente se registra
CREATE TRIGGER link_offline_patient_trigger
  AFTER INSERT OR UPDATE OF cedula ON profiles
  FOR EACH ROW
  WHEN (NEW.role = 'paciente' AND NEW.cedula IS NOT NULL)
  EXECUTE FUNCTION link_offline_patient_on_registration();

COMMENT ON TABLE offline_patients IS 'Pacientes registrados por médicos que aún no están en la plataforma';
COMMENT ON COLUMN offline_patients.status IS 'offline: no registrado, linked: vinculado con perfil, archived: archivado';
COMMENT ON FUNCTION link_offline_patient_on_registration() IS 'Vincula automáticamente pacientes offline cuando se registran en la plataforma';
