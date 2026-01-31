-- =====================================================
-- SISTEMA DE TELEMEDICINA
-- =====================================================
-- Descripción: Sistema completo de videoconsultas médicas
-- Incluye: Sesiones, participantes, grabaciones, chat en vivo
-- =====================================================

-- Tabla: telemedicine_sessions
-- Descripción: Sesiones de videoconsulta
CREATE TABLE IF NOT EXISTS telemedicine_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información de la sesión
  session_token TEXT UNIQUE NOT NULL,
  room_name TEXT UNIQUE NOT NULL,
  
  -- Estado de la sesión
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled',    -- Programada
    'waiting',      -- Sala de espera
    'active',       -- En curso
    'completed',    -- Completada
    'cancelled',    -- Cancelada
    'failed'        -- Fallida
  )),
  
  -- Tiempos
  scheduled_start_time TIMESTAMPTZ NOT NULL,
  actual_start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Configuración de la sesión
  video_enabled BOOLEAN DEFAULT true,
  audio_enabled BOOLEAN DEFAULT true,
  screen_sharing_enabled BOOLEAN DEFAULT false,
  recording_enabled BOOLEAN DEFAULT false,
  
  -- Calidad de conexión
  connection_quality TEXT CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor')),
  
  -- Notas y resumen
  session_notes TEXT,
  technical_issues TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: telemedicine_participants
-- Descripción: Participantes en sesiones de telemedicina
CREATE TABLE IF NOT EXISTS telemedicine_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rol del participante
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'observer')),
  
  -- Estado de conexión
  connection_status TEXT DEFAULT 'disconnected' CHECK (connection_status IN (
    'disconnected',
    'connecting',
    'connected',
    'reconnecting'
  )),
  
  -- Tiempos de conexión
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  total_duration_minutes INTEGER,
  
  -- Configuración del participante
  video_enabled BOOLEAN DEFAULT true,
  audio_enabled BOOLEAN DEFAULT true,
  screen_sharing BOOLEAN DEFAULT false,
  
  -- Dispositivo y navegador
  device_info JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(session_id, user_id)
);

-- Tabla: telemedicine_chat_messages
-- Descripción: Mensajes de chat durante la videoconsulta
CREATE TABLE IF NOT EXISTS telemedicine_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contenido del mensaje
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  
  -- Archivo adjunto (si aplica)
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  
  -- Estado
  is_read BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: telemedicine_recordings
-- Descripción: Grabaciones de sesiones de telemedicina
CREATE TABLE IF NOT EXISTS telemedicine_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  
  -- Información de la grabación
  recording_url TEXT NOT NULL,
  file_size_mb DECIMAL(10, 2),
  duration_minutes INTEGER,
  
  -- Estado
  status TEXT DEFAULT 'processing' CHECK (status IN (
    'processing',
    'available',
    'expired',
    'deleted'
  )),
  
  -- Acceso
  is_available_to_patient BOOLEAN DEFAULT true,
  is_available_to_doctor BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: telemedicine_prescriptions
-- Descripción: Recetas generadas durante la videoconsulta
CREATE TABLE IF NOT EXISTS telemedicine_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información de la receta
  prescription_number TEXT UNIQUE NOT NULL,
  diagnosis TEXT NOT NULL,
  
  -- Medicamentos (array de objetos)
  medications JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Instrucciones
  instructions TEXT,
  notes TEXT,
  
  -- Validez
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  
  -- Estado
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  
  -- Firma digital
  digital_signature TEXT,
  signed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: telemedicine_waiting_room
-- Descripción: Sala de espera virtual
CREATE TABLE IF NOT EXISTS telemedicine_waiting_room (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Estado en sala de espera
  status TEXT DEFAULT 'waiting' CHECK (status IN (
    'waiting',      -- Esperando
    'called',       -- Llamado por el doctor
    'admitted',     -- Admitido a la sesión
    'left'          -- Abandonó la sala
  )),
  
  -- Tiempos
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  called_at TIMESTAMPTZ,
  admitted_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  wait_time_minutes INTEGER,
  
  -- Información adicional
  reason_for_visit TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_telemedicine_sessions_patient ON telemedicine_sessions(patient_id);
CREATE INDEX idx_telemedicine_sessions_doctor ON telemedicine_sessions(doctor_id);
CREATE INDEX idx_telemedicine_sessions_appointment ON telemedicine_sessions(appointment_id);
CREATE INDEX idx_telemedicine_sessions_status ON telemedicine_sessions(status);
CREATE INDEX idx_telemedicine_sessions_scheduled_time ON telemedicine_sessions(scheduled_start_time);

CREATE INDEX idx_telemedicine_participants_session ON telemedicine_participants(session_id);
CREATE INDEX idx_telemedicine_participants_user ON telemedicine_participants(user_id);

CREATE INDEX idx_telemedicine_chat_session ON telemedicine_chat_messages(session_id);
CREATE INDEX idx_telemedicine_chat_sender ON telemedicine_chat_messages(sender_id);
CREATE INDEX idx_telemedicine_chat_created ON telemedicine_chat_messages(created_at);

CREATE INDEX idx_telemedicine_recordings_session ON telemedicine_recordings(session_id);
CREATE INDEX idx_telemedicine_recordings_status ON telemedicine_recordings(status);

CREATE INDEX idx_telemedicine_prescriptions_session ON telemedicine_prescriptions(session_id);
CREATE INDEX idx_telemedicine_prescriptions_patient ON telemedicine_prescriptions(patient_id);
CREATE INDEX idx_telemedicine_prescriptions_doctor ON telemedicine_prescriptions(doctor_id);

CREATE INDEX idx_telemedicine_waiting_room_session ON telemedicine_waiting_room(session_id);
CREATE INDEX idx_telemedicine_waiting_room_patient ON telemedicine_waiting_room(patient_id);
CREATE INDEX idx_telemedicine_waiting_room_status ON telemedicine_waiting_room(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE telemedicine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemedicine_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemedicine_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemedicine_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemedicine_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemedicine_waiting_room ENABLE ROW LEVEL SECURITY;

-- Políticas para telemedicine_sessions
CREATE POLICY "Usuarios pueden ver sus propias sesiones"
  ON telemedicine_sessions FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Doctores pueden crear sesiones"
  ON telemedicine_sessions FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Participantes pueden actualizar sesiones"
  ON telemedicine_sessions FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- Políticas para telemedicine_participants
CREATE POLICY "Usuarios pueden ver participantes de sus sesiones"
  ON telemedicine_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM telemedicine_sessions
      WHERE id = session_id
      AND (patient_id = auth.uid() OR doctor_id = auth.uid())
    )
  );

CREATE POLICY "Sistema puede insertar participantes"
  ON telemedicine_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Participantes pueden actualizar su estado"
  ON telemedicine_participants FOR UPDATE
  USING (user_id = auth.uid());

-- Políticas para telemedicine_chat_messages
CREATE POLICY "Usuarios pueden ver mensajes de sus sesiones"
  ON telemedicine_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM telemedicine_sessions
      WHERE id = session_id
      AND (patient_id = auth.uid() OR doctor_id = auth.uid())
    )
  );

CREATE POLICY "Participantes pueden enviar mensajes"
  ON telemedicine_chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM telemedicine_sessions
      WHERE id = session_id
      AND (patient_id = auth.uid() OR doctor_id = auth.uid())
    )
  );

-- Políticas para telemedicine_recordings
CREATE POLICY "Usuarios pueden ver grabaciones de sus sesiones"
  ON telemedicine_recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM telemedicine_sessions
      WHERE id = session_id
      AND (
        (patient_id = auth.uid() AND is_available_to_patient = true) OR
        (doctor_id = auth.uid() AND is_available_to_doctor = true)
      )
    )
  );

-- Políticas para telemedicine_prescriptions
CREATE POLICY "Usuarios pueden ver sus recetas"
  ON telemedicine_prescriptions FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Doctores pueden crear recetas"
  ON telemedicine_prescriptions FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctores pueden actualizar sus recetas"
  ON telemedicine_prescriptions FOR UPDATE
  USING (auth.uid() = doctor_id);

-- Políticas para telemedicine_waiting_room
CREATE POLICY "Usuarios pueden ver su sala de espera"
  ON telemedicine_waiting_room FOR SELECT
  USING (
    patient_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM telemedicine_sessions
      WHERE id = session_id AND doctor_id = auth.uid()
    )
  );

CREATE POLICY "Pacientes pueden entrar a sala de espera"
  ON telemedicine_waiting_room FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Sistema puede actualizar sala de espera"
  ON telemedicine_waiting_room FOR UPDATE
  USING (true);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_telemedicine_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_telemedicine_sessions_updated_at
  BEFORE UPDATE ON telemedicine_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_telemedicine_updated_at();

CREATE TRIGGER update_telemedicine_participants_updated_at
  BEFORE UPDATE ON telemedicine_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_telemedicine_updated_at();

CREATE TRIGGER update_telemedicine_recordings_updated_at
  BEFORE UPDATE ON telemedicine_recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_telemedicine_updated_at();

CREATE TRIGGER update_telemedicine_prescriptions_updated_at
  BEFORE UPDATE ON telemedicine_prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_telemedicine_updated_at();

CREATE TRIGGER update_telemedicine_waiting_room_updated_at
  BEFORE UPDATE ON telemedicine_waiting_room
  FOR EACH ROW
  EXECUTE FUNCTION update_telemedicine_updated_at();

-- Función: Calcular duración de sesión al finalizar
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.end_time IS NOT NULL AND NEW.actual_start_time IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.actual_start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_session_duration_trigger
  BEFORE UPDATE ON telemedicine_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_duration();

-- Función: Calcular tiempo de espera
CREATE OR REPLACE FUNCTION calculate_wait_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.admitted_at IS NOT NULL AND NEW.entered_at IS NOT NULL THEN
    NEW.wait_time_minutes = EXTRACT(EPOCH FROM (NEW.admitted_at - NEW.entered_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_wait_time_trigger
  BEFORE UPDATE ON telemedicine_waiting_room
  FOR EACH ROW
  EXECUTE FUNCTION calculate_wait_time();

-- =====================================================
-- VISTAS
-- =====================================================

-- Vista: Sesiones activas con información completa
CREATE OR REPLACE VIEW active_telemedicine_sessions AS
SELECT 
  s.id,
  s.session_token,
  s.room_name,
  s.status,
  s.scheduled_start_time,
  s.actual_start_time,
  s.duration_minutes,
  
  -- Información del paciente
  pp.full_name as patient_name,
  pp.email as patient_email,
  
  -- Información del doctor
  dp.full_name as doctor_name,
  dp.specialization as doctor_specialization,
  
  -- Información de la cita
  a.appointment_type,
  a.reason,
  
  -- Participantes conectados
  (
    SELECT COUNT(*)
    FROM telemedicine_participants
    WHERE session_id = s.id
    AND connection_status = 'connected'
  ) as connected_participants,
  
  s.created_at,
  s.updated_at
FROM telemedicine_sessions s
LEFT JOIN user_profiles pp ON s.patient_id = pp.user_id
LEFT JOIN user_profiles dp ON s.doctor_id = dp.user_id
LEFT JOIN appointments a ON s.appointment_id = a.id
WHERE s.status IN ('waiting', 'active');

-- Vista: Historial de sesiones del paciente
CREATE OR REPLACE VIEW patient_telemedicine_history AS
SELECT 
  s.id,
  s.status,
  s.scheduled_start_time,
  s.actual_start_time,
  s.end_time,
  s.duration_minutes,
  s.patient_id,
  
  -- Información del doctor
  dp.full_name as doctor_name,
  dp.specialization as doctor_specialization,
  dp.profile_image_url as doctor_image,
  
  -- Información de la cita
  a.appointment_type,
  a.reason,
  
  -- Grabación disponible
  EXISTS (
    SELECT 1 FROM telemedicine_recordings
    WHERE session_id = s.id
    AND status = 'available'
    AND is_available_to_patient = true
  ) as has_recording,
  
  -- Receta generada
  EXISTS (
    SELECT 1 FROM telemedicine_prescriptions
    WHERE session_id = s.id
  ) as has_prescription,
  
  s.created_at
FROM telemedicine_sessions s
LEFT JOIN user_profiles dp ON s.doctor_id = dp.user_id
LEFT JOIN appointments a ON s.appointment_id = a.id
ORDER BY s.scheduled_start_time DESC;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Comentario: Los datos de prueba se insertarán mediante script separado
