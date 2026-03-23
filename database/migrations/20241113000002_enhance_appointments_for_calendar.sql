-- Migración: Mejorar tabla de appointments para calendario completo
-- Fecha: 2025-11-13

-- 1. Agregar campos adicionales a appointments si no existen
DO $$ 
BEGIN
  -- Agregar campo de duración en minutos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'duracion_minutos'
  ) THEN
    ALTER TABLE appointments ADD COLUMN duracion_minutos INTEGER DEFAULT 30;
  END IF;

  -- Agregar campo de tipo de cita
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'tipo_cita'
  ) THEN
    ALTER TABLE appointments ADD COLUMN tipo_cita TEXT DEFAULT 'presencial' 
      CHECK (tipo_cita IN ('presencial', 'telemedicina', 'urgencia', 'seguimiento', 'primera_vez'));
  END IF;

  -- Agregar campo de color para el calendario
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'color'
  ) THEN
    ALTER TABLE appointments ADD COLUMN color TEXT DEFAULT '#3B82F6';
  END IF;

  -- Agregar campo de notas internas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'notas_internas'
  ) THEN
    ALTER TABLE appointments ADD COLUMN notas_internas TEXT;
  END IF;

  -- Agregar campo de recordatorio enviado
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'recordatorio_enviado'
  ) THEN
    ALTER TABLE appointments ADD COLUMN recordatorio_enviado BOOLEAN DEFAULT false;
  END IF;

  -- Agregar campo de fecha de recordatorio
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'recordatorio_enviado_at'
  ) THEN
    ALTER TABLE appointments ADD COLUMN recordatorio_enviado_at TIMESTAMPTZ;
  END IF;

  -- Agregar campo de cita recurrente
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'es_recurrente'
  ) THEN
    ALTER TABLE appointments ADD COLUMN es_recurrente BOOLEAN DEFAULT false;
  END IF;

  -- Agregar campo de patrón de recurrencia
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'patron_recurrencia'
  ) THEN
    ALTER TABLE appointments ADD COLUMN patron_recurrencia JSONB;
  END IF;

  -- Agregar campo de ID de cita padre (para recurrentes)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'parent_appointment_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN parent_appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Crear tabla de horarios de disponibilidad del médico
CREATE TABLE IF NOT EXISTS doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, dia_semana, hora_inicio)
);

-- 3. Crear tabla de bloqueos de horario
CREATE TABLE IF NOT EXISTS doctor_time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  motivo TEXT NOT NULL,
  tipo TEXT DEFAULT 'bloqueo' CHECK (tipo IN ('bloqueo', 'almuerzo', 'reunion', 'vacaciones', 'emergencia')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear índices para mejorar el rendimiento del calendario
CREATE INDEX IF NOT EXISTS idx_appointments_medico_fecha ON appointments(medico_id, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_appointments_paciente_fecha ON appointments(paciente_id, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_tipo_cita ON appointments(tipo_cita);
CREATE INDEX IF NOT EXISTS idx_appointments_fecha_hora_range ON appointments USING btree (fecha_hora);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_time_blocks_doctor_id ON doctor_time_blocks(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_time_blocks_fecha ON doctor_time_blocks(doctor_id, fecha_inicio, fecha_fin);

-- 5. Crear función para verificar disponibilidad
CREATE OR REPLACE FUNCTION check_doctor_availability(
  p_doctor_id UUID,
  p_fecha_hora TIMESTAMPTZ,
  p_duracion_minutos INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_fecha_fin TIMESTAMPTZ;
  v_conflictos INTEGER;
BEGIN
  v_fecha_fin := p_fecha_hora + (p_duracion_minutos || ' minutes')::INTERVAL;
  
  -- Verificar si hay citas que se solapan
  SELECT COUNT(*) INTO v_conflictos
  FROM appointments
  WHERE medico_id = p_doctor_id
    AND status NOT IN ('cancelada', 'rechazada')
    AND (
      (fecha_hora <= p_fecha_hora AND fecha_hora + (duracion_minutos || ' minutes')::INTERVAL > p_fecha_hora)
      OR
      (fecha_hora < v_fecha_fin AND fecha_hora >= p_fecha_hora)
    );
  
  -- Verificar si hay bloqueos de tiempo
  SELECT COUNT(*) + v_conflictos INTO v_conflictos
  FROM doctor_time_blocks
  WHERE doctor_id = p_doctor_id
    AND (
      (fecha_inicio <= p_fecha_hora AND fecha_fin > p_fecha_hora)
      OR
      (fecha_inicio < v_fecha_fin AND fecha_inicio >= p_fecha_hora)
    );
  
  RETURN v_conflictos = 0;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear vista para el calendario
CREATE OR REPLACE VIEW calendar_appointments AS
SELECT 
  a.id,
  a.medico_id,
  a.paciente_id,
  a.fecha_hora,
  a.duracion_minutos,
  a.fecha_hora + (a.duracion_minutos || ' minutes')::INTERVAL as fecha_hora_fin,
  a.motivo,
  a.status,
  a.tipo_cita,
  a.color,
  a.notas_internas,
  a.es_recurrente,
  p.nombre_completo as paciente_nombre,
  p.telefono as paciente_telefono,
  p.email as paciente_email,
  p.avatar_url as paciente_avatar,
  EXTRACT(DOW FROM a.fecha_hora) as dia_semana,
  EXTRACT(HOUR FROM a.fecha_hora) as hora,
  EXTRACT(MINUTE FROM a.fecha_hora) as minuto
FROM appointments a
LEFT JOIN profiles p ON a.paciente_id = p.id;

-- 7. Políticas de seguridad para nuevas tablas
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_time_blocks ENABLE ROW LEVEL SECURITY;

-- Políticas para doctor_availability
CREATE POLICY "Doctors can manage their availability"
  ON doctor_availability
  FOR ALL
  USING (auth.uid() = doctor_id);

CREATE POLICY "Secretaries can view doctor availability"
  ON doctor_availability
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctor_secretaries
      WHERE doctor_id = doctor_availability.doctor_id
        AND secretary_id = auth.uid()
        AND status = 'active'
    )
  );

-- Políticas para doctor_time_blocks
CREATE POLICY "Doctors can manage their time blocks"
  ON doctor_time_blocks
  FOR ALL
  USING (auth.uid() = doctor_id);

CREATE POLICY "Secretaries can view doctor time blocks"
  ON doctor_time_blocks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctor_secretaries
      WHERE doctor_id = doctor_time_blocks.doctor_id
        AND secretary_id = auth.uid()
        AND status = 'active'
    )
  );

-- 8. Función para obtener citas de un rango de fechas
CREATE OR REPLACE FUNCTION get_appointments_by_date_range(
  p_doctor_id UUID,
  p_fecha_inicio TIMESTAMPTZ,
  p_fecha_fin TIMESTAMPTZ
)
RETURNS TABLE (
  id UUID,
  paciente_id UUID,
  paciente_nombre TEXT,
  paciente_telefono TEXT,
  paciente_email TEXT,
  paciente_avatar TEXT,
  fecha_hora TIMESTAMPTZ,
  fecha_hora_fin TIMESTAMPTZ,
  duracion_minutos INTEGER,
  motivo TEXT,
  status TEXT,
  tipo_cita TEXT,
  color TEXT,
  notas_internas TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    ca.paciente_id,
    ca.paciente_nombre,
    ca.paciente_telefono,
    ca.paciente_email,
    ca.paciente_avatar,
    ca.fecha_hora,
    ca.fecha_hora_fin,
    ca.duracion_minutos,
    ca.motivo,
    ca.status,
    ca.tipo_cita,
    ca.color,
    ca.notas_internas
  FROM calendar_appointments ca
  WHERE ca.medico_id = p_doctor_id
    AND ca.fecha_hora >= p_fecha_inicio
    AND ca.fecha_hora < p_fecha_fin
  ORDER BY ca.fecha_hora;
END;
$$ LANGUAGE plpgsql;

-- 9. Comentarios para documentación
COMMENT ON TABLE doctor_availability IS 'Horarios de disponibilidad del médico por día de la semana';
COMMENT ON TABLE doctor_time_blocks IS 'Bloqueos de tiempo del médico (almuerzos, reuniones, vacaciones)';
COMMENT ON FUNCTION check_doctor_availability IS 'Verifica si el médico está disponible en un horario específico';
COMMENT ON FUNCTION get_appointments_by_date_range IS 'Obtiene todas las citas de un médico en un rango de fechas';
