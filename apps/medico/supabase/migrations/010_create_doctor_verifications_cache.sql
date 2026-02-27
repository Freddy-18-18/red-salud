-- Tabla de caché para verificaciones de médicos
-- Almacena verificaciones exitosas del SACS y verificaciones manuales

CREATE TABLE IF NOT EXISTS doctor_verifications_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cedula VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  especialidad VARCHAR(200),
  mpps VARCHAR(50),
  colegio VARCHAR(200),
  estado VARCHAR(100),
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES profiles(id), -- Admin que verificó manualmente
  source VARCHAR(20) DEFAULT 'manual', -- 'sacs' o 'manual'
  notes TEXT, -- Notas de verificación manual
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_verifications_cedula ON doctor_verifications_cache(cedula);
CREATE INDEX idx_verifications_verified ON doctor_verifications_cache(verified);
CREATE INDEX idx_verifications_source ON doctor_verifications_cache(source);

-- RLS
ALTER TABLE doctor_verifications_cache ENABLE ROW LEVEL SECURITY;

-- Políticas: Todos los autenticados pueden leer
CREATE POLICY "Verificaciones son públicas para lectura"
  ON doctor_verifications_cache FOR SELECT
  TO authenticated
  USING (true);

-- Solo admins pueden insertar/actualizar
CREATE POLICY "Solo admins pueden crear verificaciones"
  ON doctor_verifications_cache FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden actualizar verificaciones"
  ON doctor_verifications_cache FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_verifications_updated_at
  BEFORE UPDATE ON doctor_verifications_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_verifications_updated_at();

-- Comentarios
COMMENT ON TABLE doctor_verifications_cache IS 'Caché de verificaciones de médicos del SACS y verificaciones manuales';
COMMENT ON COLUMN doctor_verifications_cache.source IS 'Origen de la verificación: sacs (automática) o manual (por admin)';
COMMENT ON COLUMN doctor_verifications_cache.verified_by IS 'Admin que realizó la verificación manual';

-- Insertar algunos datos de prueba para desarrollo
INSERT INTO doctor_verifications_cache (cedula, nombre, apellido, especialidad, mpps, colegio, estado, verified, source, verified_at) VALUES
('7983901', 'Juan', 'Pérez', 'Medicina General', 'MPPS-7983901', 'Colegio Médico de Caracas', 'Distrito Capital', true, 'manual', NOW()),
('12345678', 'María', 'González', 'Pediatría', 'MPPS-12345678', 'Colegio Médico de Miranda', 'Miranda', true, 'manual', NOW()),
('23456789', 'Carlos', 'Rodríguez', 'Cardiología', 'MPPS-23456789', 'Colegio Médico de Carabobo', 'Carabobo', true, 'manual', NOW())
ON CONFLICT (cedula) DO NOTHING;
