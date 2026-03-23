-- Migración: Agregar rol de secretaria y relación médico-secretaria
-- Fecha: 2025-11-13

-- 1. Actualizar el tipo de rol para incluir 'secretaria'
-- Primero verificamos si el tipo existe y lo modificamos
DO $$ 
BEGIN
  -- Agregar 'secretaria' al enum de roles si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'secretaria' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'secretaria';
  END IF;
END $$;

-- 2. Crear tabla de relación médico-secretaria
CREATE TABLE IF NOT EXISTS doctor_secretaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  secretary_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{
    "can_view_agenda": true,
    "can_create_appointments": true,
    "can_edit_appointments": true,
    "can_cancel_appointments": true,
    "can_view_patients": true,
    "can_register_patients": true,
    "can_view_medical_records": false,
    "can_send_messages": true,
    "can_view_statistics": false
  }'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, secretary_id)
);

-- 3. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_doctor_secretaries_doctor_id ON doctor_secretaries(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_secretaries_secretary_id ON doctor_secretaries(secretary_id);
CREATE INDEX IF NOT EXISTS idx_doctor_secretaries_status ON doctor_secretaries(status);

-- 4. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_doctor_secretaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_doctor_secretaries_updated_at ON doctor_secretaries;
CREATE TRIGGER trigger_update_doctor_secretaries_updated_at
  BEFORE UPDATE ON doctor_secretaries
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_secretaries_updated_at();

-- 6. Políticas de seguridad RLS
ALTER TABLE doctor_secretaries ENABLE ROW LEVEL SECURITY;

-- Política: Los médicos pueden ver sus secretarias
CREATE POLICY "Doctors can view their secretaries"
  ON doctor_secretaries
  FOR SELECT
  USING (
    auth.uid() = doctor_id
  );

-- Política: Las secretarias pueden ver sus médicos
CREATE POLICY "Secretaries can view their doctors"
  ON doctor_secretaries
  FOR SELECT
  USING (
    auth.uid() = secretary_id
  );

-- Política: Los médicos pueden agregar secretarias
CREATE POLICY "Doctors can add secretaries"
  ON doctor_secretaries
  FOR INSERT
  WITH CHECK (
    auth.uid() = doctor_id
  );

-- Política: Los médicos pueden actualizar permisos de sus secretarias
CREATE POLICY "Doctors can update their secretaries"
  ON doctor_secretaries
  FOR UPDATE
  USING (
    auth.uid() = doctor_id
  );

-- Política: Los médicos pueden eliminar secretarias
CREATE POLICY "Doctors can delete their secretaries"
  ON doctor_secretaries
  FOR DELETE
  USING (
    auth.uid() = doctor_id
  );

-- 7. Crear vista para facilitar consultas
CREATE OR REPLACE VIEW doctor_secretary_relationships AS
SELECT 
  ds.id,
  ds.doctor_id,
  ds.secretary_id,
  ds.permissions,
  ds.status,
  ds.created_at,
  ds.updated_at,
  d.nombre_completo as doctor_name,
  d.email as doctor_email,
  s.nombre_completo as secretary_name,
  s.email as secretary_email
FROM doctor_secretaries ds
JOIN profiles d ON ds.doctor_id = d.id
JOIN profiles s ON ds.secretary_id = s.id;

-- 8. Comentarios para documentación
COMMENT ON TABLE doctor_secretaries IS 'Relación entre médicos y secretarias con permisos específicos';
COMMENT ON COLUMN doctor_secretaries.permissions IS 'Permisos JSON que definen qué puede hacer la secretaria';
COMMENT ON COLUMN doctor_secretaries.status IS 'Estado de la relación: active, inactive, suspended';
