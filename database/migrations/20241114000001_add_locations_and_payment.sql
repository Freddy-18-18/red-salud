-- Migración: Agregar ubicaciones del médico, métodos de pago y sistema de cola
-- Fecha: 2024-11-14

-- 1. Tabla de ubicaciones del médico (consultorios, clínicas, hospitales)
CREATE TABLE IF NOT EXISTS doctor_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Consultorio Privado", "Hospital XYZ"
  type TEXT NOT NULL CHECK (type IN ('consultorio', 'clinica', 'hospital')),
  address TEXT,
  phone TEXT,
  working_hours JSONB, -- { "monday": { "start": "09:00", "end": "17:00" }, ... }
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de precios por servicio del médico
CREATE TABLE IF NOT EXISTS doctor_service_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL, -- "Consulta General", "Consulta Especializada"
  location_id UUID REFERENCES doctor_locations(id) ON DELETE SET NULL,
  tipo_cita TEXT CHECK (tipo_cita IN ('presencial', 'telemedicina', 'urgencia', 'seguimiento', 'primera_vez')),
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de cola de citas (para sistema de check-in y orden de atención)
CREATE TABLE IF NOT EXISTS appointment_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- posición en la cola
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_consultation', 'completed', 'no_show')),
  checked_in_at TIMESTAMPTZ, -- cuando el paciente hizo check-in
  called_at TIMESTAMPTZ, -- cuando fue llamado por el médico
  started_at TIMESTAMPTZ, -- cuando empezó la consulta
  completed_at TIMESTAMPTZ, -- cuando terminó la consulta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(appointment_id)
);

-- 4. Agregar campos a appointments si no existen
DO $ 
BEGIN
  -- Campo de ubicación
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'location_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN location_id UUID REFERENCES doctor_locations(id) ON DELETE SET NULL;
  END IF;

  -- Campo de método de pago
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE appointments ADD COLUMN payment_method TEXT DEFAULT 'efectivo' 
      CHECK (payment_method IN ('efectivo', 'tarjeta', 'transferencia', 'seguro', 'pendiente'));
  END IF;

  -- Campo de estado de pago
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE appointments ADD COLUMN payment_status TEXT DEFAULT 'pendiente' 
      CHECK (payment_status IN ('pendiente', 'pagado', 'parcial', 'reembolsado'));
  END IF;
END $;

-- 5. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_doctor_locations_doctor_id ON doctor_locations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_service_prices_doctor_id ON doctor_service_prices(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointment_queue_appointment_id ON appointment_queue(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_queue_status ON appointment_queue(status);
CREATE INDEX IF NOT EXISTS idx_appointments_location_id ON appointments(location_id);

-- 6. Políticas de seguridad
ALTER TABLE doctor_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_service_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_queue ENABLE ROW LEVEL SECURITY;


-- Políticas para doctor_locations
CREATE POLICY "Doctors can manage their locations"
  ON doctor_locations
  FOR ALL
  USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view doctor locations"
  ON doctor_locations
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Secretaries can view doctor locations"
  ON doctor_locations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctor_secretaries
      WHERE doctor_id = doctor_locations.doctor_id
        AND secretary_id = auth.uid()
        AND status = 'active'
    )
  );

-- Políticas para doctor_service_prices
CREATE POLICY "Doctors can manage their service prices"
  ON doctor_service_prices
  FOR ALL
  USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view service prices"
  ON doctor_service_prices
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Secretaries can view service prices"
  ON doctor_service_prices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctor_secretaries
      WHERE doctor_id = doctor_service_prices.doctor_id
        AND secretary_id = auth.uid()
        AND status = 'active'
    )
  );

-- Políticas para appointment_queue
CREATE POLICY "Doctors can view their appointment queue"
  ON appointment_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_queue.appointment_id
        AND appointments.medico_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update their appointment queue"
  ON appointment_queue
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_queue.appointment_id
        AND appointments.medico_id = auth.uid()
    )
  );

CREATE POLICY "Patients can view their position in queue"
  ON appointment_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_queue.appointment_id
        AND appointments.paciente_id = auth.uid()
    )
  );

CREATE POLICY "Secretaries can manage appointment queue"
  ON appointment_queue
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN doctor_secretaries ds ON ds.doctor_id = a.medico_id
      WHERE a.id = appointment_queue.appointment_id
        AND ds.secretary_id = auth.uid()
        AND ds.status = 'active'
    )
  );

-- 7. Función para obtener la posición en la cola
CREATE OR REPLACE FUNCTION get_queue_position(p_appointment_id UUID)
RETURNS INTEGER AS $
DECLARE
  v_position INTEGER;
BEGIN
  SELECT position INTO v_position
  FROM appointment_queue
  WHERE appointment_id = p_appointment_id;
  
  RETURN COALESCE(v_position, 0);
END;
$ LANGUAGE plpgsql;

-- 8. Función para actualizar posiciones en la cola
CREATE OR REPLACE FUNCTION reorder_queue(p_doctor_id UUID, p_date DATE)
RETURNS VOID AS $
BEGIN
  WITH ordered_appointments AS (
    SELECT 
      aq.id,
      ROW_NUMBER() OVER (ORDER BY 
        CASE aq.status 
          WHEN 'in_consultation' THEN 1
          WHEN 'waiting' THEN 2
          ELSE 3
        END,
        aq.checked_in_at NULLS LAST,
        a.fecha_hora
      ) as new_position
    FROM appointment_queue aq
    JOIN appointments a ON a.id = aq.appointment_id
    WHERE a.medico_id = p_doctor_id
      AND DATE(a.fecha_hora) = p_date
      AND aq.status IN ('waiting', 'in_consultation')
  )
  UPDATE appointment_queue aq
  SET position = oa.new_position
  FROM ordered_appointments oa
  WHERE aq.id = oa.id;
END;
$ LANGUAGE plpgsql;

-- 9. Comentarios para documentación
COMMENT ON TABLE doctor_locations IS 'Ubicaciones donde el médico atiende (consultorios, clínicas, hospitales)';
COMMENT ON TABLE doctor_service_prices IS 'Precios de servicios del médico por ubicación y tipo de cita';
COMMENT ON TABLE appointment_queue IS 'Cola de atención para gestionar el orden de las citas';
COMMENT ON FUNCTION get_queue_position IS 'Obtiene la posición de una cita en la cola';
COMMENT ON FUNCTION reorder_queue IS 'Reordena la cola de citas de un médico para un día específico';
