-- ============================================================================
-- MIGRATION: Agora Call System - Red Salud
-- Fecha: 2026-01-21
-- Descripción: Sistema de llamadas en tiempo real con Agora.io para
--              videollamadas, llamadas de voz y conferencias
-- ============================================================================

-- ============================================================================
-- TYPES (Enumerados)
-- ============================================================================

-- Tipo de sesión de llamada
CREATE TYPE call_session_type AS ENUM (
  'video',            -- Videollamada 1:1
  'voice',            -- Llamada de voz 1:1
  'group_video',      -- Videollamada grupal
  'group_voice',      -- Llamada de voz grupal
  'teleconsultation', -- Teleconsulta médica
  'conference',       -- Conferencia médica
  'emergency'         -- Llamada de emergencia
);

-- Estado de sesión de llamada
CREATE TYPE call_session_status AS ENUM (
  'initiated',        -- Iniciada (esperando respuesta)
  'active',           -- Activa (en progreso)
  'ended',            -- Finalizada normalmente
  'rejected',         -- Rechazada por el receptor
  'missed',           -- Perdida (no respondida)
  'failed',           -- Falló la conexión
  'timeout',          -- Timeout de espera
  'cancelled'         -- Cancelada por el iniciador
);

-- Estado de notificación de llamada
CREATE TYPE call_notification_status AS ENUM (
  'pending',          -- Pendiente de respuesta
  'accepted',         -- Aceptada
  'rejected',         -- Rechazada
  'missed',           -- Perdida
  'timeout'           -- Timeout
);

-- Calidad de la llamada
CREATE TYPE call_quality AS ENUM (
  'excellent',        -- Excelente
  'good',             -- Buena
  'fair',             -- Regular
  'poor',             -- Mala
  'unavailable'       -- No disponible
);

-- ============================================================================
-- TABLES (Tablas principales)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- AGORA SESSIONS (Sesiones de llamadas activas)
-- ----------------------------------------------------------------------------
CREATE TABLE agora_sessions (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agora_channel_name TEXT NOT NULL UNIQUE,

  -- Tipo de sesión
  session_type call_session_type NOT NULL,
  session_status call_session_status DEFAULT 'initiated',

  -- Participantes
  initiator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL para llamadas grupales
  participants TEXT[] NOT NULL, -- Array de user IDs participantes
  active_participants TEXT[], -- IDs de participantes activos actualmente

  -- Agora metadata
  agora_token TEXT, -- Token de autenticación Agora
  agora_uid BIGINT, -- UID de Agora del usuario
  agora_recording_id TEXT, -- ID de grabación si está grabando

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0, -- Duración en segundos

  -- Calidad y estadísticas
  call_quality call_quality DEFAULT 'unavailable',
  video_quality_score NUMERIC(3,2), -- Score 0.00 - 1.00
  audio_quality_score NUMERIC(3,2), -- Score 0.00 - 1.00
  network_quality_score NUMERIC(3,2), -- Score 0.00 - 1.00
  packet_loss_percentage NUMERIC(5,2), -- Porcentaje de paquetes perdidos
  bitrate_kbps INTEGER, -- Bitrate promedio en kbps

  -- Metadata
  call_metadata JSONB DEFAULT '{}', -- Metadata adicional
  recording_enabled BOOLEAN DEFAULT FALSE,
  recording_url TEXT, -- URL de la grabación

  -- Related entities
  related_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  related_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  related_patient_care_plan_id UUID REFERENCES patient_care_plans(id) ON DELETE SET NULL,

  -- End reason
  end_reason TEXT, -- Razón de finalización
  end_code INTEGER, -- Código de error Agora si falló

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- CALL PARTICIPANTS (Participantes individuales en llamadas)
-- ----------------------------------------------------------------------------
CREATE TABLE call_participants (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agora_session_id UUID NOT NULL REFERENCES agora_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Estado
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  participant_status TEXT DEFAULT 'joined' CHECK (participant_status IN ('joined', 'left', 'kicked')),

  -- Permisos
  can_publish_audio BOOLEAN DEFAULT TRUE,
  can_publish_video BOOLEAN DEFAULT TRUE,
  can_publish_screen BOOLEAN DEFAULT FALSE,
  can_mute_others BOOLEAN DEFAULT FALSE,

  -- Estadísticas individuales
  connection_duration_seconds INTEGER DEFAULT 0,
  audio_enabled BOOLEAN DEFAULT TRUE,
  video_enabled BOOLEAN DEFAULT TRUE,
  screen_sharing BOOLEAN DEFAULT FALSE,

  -- Agora specific
  agora_uid BIGINT UNIQUE,

  -- Metadata
  participant_metadata JSONB DEFAULT '{}',

  -- Constraints
  UNIQUE(agora_session_id, user_id)
);

-- ----------------------------------------------------------------------------
-- CALL NOTIFICATIONS (Notificaciones de llamadas entrantes)
-- ----------------------------------------------------------------------------
CREATE TABLE call_notifications (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agora_session_id UUID REFERENCES agora_sessions(id) ON DELETE CASCADE,

  -- Caller y Recipient
  caller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Tipo
  call_type call_session_type NOT NULL,
  notification_status call_notification_status DEFAULT 'pending',

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  answered_at TIMESTAMPTZ,
  timeout_at TIMESTAMPTZ,

  -- Metadata
  notification_metadata JSONB DEFAULT '{}',

  -- Intentos
  attempt_number INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 3
);

-- ----------------------------------------------------------------------------
-- CALL RECORDINGS (Grabaciones de llamadas)
-- ----------------------------------------------------------------------------
CREATE TABLE call_recordings (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agora_session_id UUID NOT NULL REFERENCES agora_sessions(id) ON DELETE CASCADE,

  -- Archivo
  recording_url TEXT NOT NULL,
  recording_filename TEXT NOT NULL,
  recording_type TEXT NOT NULL CHECK (recording_type IN ('individual', 'composite', 'audio_only', 'video_only')),

  -- Metadata
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  format TEXT, -- mp4, mkv, webm, etc.
  resolution TEXT, -- 720p, 1080p, etc.

  -- Storage
  storage_path TEXT,
  storage_bucket TEXT DEFAULT 'call-recordings',

  -- Privacy
  is_encrypted BOOLEAN DEFAULT FALSE,
  encryption_key TEXT, -- Referencia a la clave de encriptación
  consent_obtained BOOLEAN DEFAULT FALSE, -- Consentimiento de grabación
  consent_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,

  -- Retention
  auto_delete_after_days INTEGER DEFAULT 90,
  delete_at TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT FALSE,

  -- Access
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Metadata
  recording_metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- CALL RATINGS (Calificaciones de llamadas)
-- ----------------------------------------------------------------------------
CREATE TABLE call_ratings (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agora_session_id UUID NOT NULL REFERENCES agora_sessions(id) ON DELETE CASCADE,

  -- Rater
  rater_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rated_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Usuario calificado (si aplica)

  -- Calificaciones
  overall_rating NUMERIC(2,1) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  audio_quality_rating NUMERIC(2,1) CHECK (audio_quality_rating IS NULL OR (audio_quality_rating >= 1 AND audio_quality_rating <= 5)),
  video_quality_rating NUMERIC(2,1) CHECK (video_quality_rating IS NULL OR (video_quality_rating >= 1 AND video_quality_rating <= 5)),
  connection_stability_rating NUMERIC(2,1) CHECK (connection_stability_rating IS NULL OR (connection_stability_rating >= 1 AND connection_stability_rating <= 5)),

  -- Feedback
  feedback_text TEXT,
  feedback_categories TEXT[], -- Array de categorías (ej: ['audio_issues', 'video_lag'])
  was_helpful BOOLEAN DEFAULT TRUE,
  would_recommend BOOLEAN DEFAULT TRUE,

  -- Metadata
  rating_metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(agora_session_id, rater_id)
);

-- ----------------------------------------------------------------------------
-- CALL EVENTS (Eventos durante una llamada)
-- ----------------------------------------------------------------------------
CREATE TABLE call_events (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agora_session_id UUID NOT NULL REFERENCES agora_sessions(id) ON DELETE CASCADE,

  -- Evento
  event_type TEXT NOT NULL, -- 'user_joined', 'user_left', 'video_enabled', 'video_disabled', etc.
  event_data JSONB NOT NULL DEFAULT '{}',

  -- Contexto
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  event_metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- INDEXES (Índices para optimización)
-- ============================================================================

-- agora_sessions
CREATE INDEX idx_agora_sessions_initiator ON agora_sessions(initiator_id);
CREATE INDEX idx_agora_sessions_recipient ON agora_sessions(recipient_id);
CREATE INDEX idx_agora_sessions_status ON agora_sessions(session_status);
CREATE INDEX idx_agora_sessions_type ON agora_sessions(session_type);
CREATE INDEX idx_agora_sessions_started_at ON agora_sessions(started_at DESC);
CREATE INDEX idx_agora_sessions_participants ON agora_sessions USING GIN(participants);
CREATE INDEX idx_agora_sessions_active_participants ON agora_sessions USING GIN(active_participants);
CREATE INDEX idx_agora_sessions_conversation ON agora_sessions(related_conversation_id);
CREATE INDEX idx_agora_sessions_appointment ON agora_sessions(related_appointment_id);

-- call_participants
CREATE INDEX idx_call_participants_session ON call_participants(agora_session_id);
CREATE INDEX idx_call_participants_user ON call_participants(user_id);
CREATE INDEX idx_call_participants_joined_at ON call_participants(joined_at DESC);

-- call_notifications
CREATE INDEX idx_call_notifications_recipient ON call_notifications(recipient_id);
CREATE INDEX idx_call_notifications_status ON call_notifications(notification_status);
CREATE INDEX idx_call_notifications_created_at ON call_notifications(created_at DESC);
CREATE INDEX idx_call_notifications_session ON call_notifications(agora_session_id);

-- call_recordings
CREATE INDEX idx_call_recordings_session ON call_recordings(agora_session_id);
CREATE INDEX idx_call_recordings_created_at ON call_recordings(created_at DESC);
CREATE INDEX idx_call_recordings_delete_at ON call_recordings(delete_at);

-- call_ratings
CREATE INDEX idx_call_ratings_session ON call_ratings(agora_session_id);
CREATE INDEX idx_call_ratings_rater ON call_ratings(rater_id);
CREATE INDEX idx_call_ratings_created_at ON call_ratings(created_at DESC);

-- call_events
CREATE INDEX idx_call_events_session ON call_events(agora_session_id);
CREATE INDEX idx_call_events_user ON call_events(user_id);
CREATE INDEX idx_call_events_timestamp ON call_events(timestamp DESC);
CREATE INDEX idx_call_events_type ON call_events(event_type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE agora_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_events ENABLE ROW LEVEL SECURITY;

-- agora_sessions policies
CREATE POLICY "Users can view their own calls"
ON agora_sessions FOR SELECT
USING (
  initiator_id = auth.uid() OR
  recipient_id = auth.uid() OR
  auth.uid() = ANY(participants)
);

CREATE POLICY "Users can update their own calls"
ON agora_sessions FOR UPDATE
USING (
  initiator_id = auth.uid() OR
  recipient_id = auth.uid()
)
WITH CHECK (
  initiator_id = auth.uid() OR
  recipient_id = auth.uid()
);

CREATE POLICY "Users can insert their own calls"
ON agora_sessions FOR INSERT
WITH CHECK (initiator_id = auth.uid());

-- call_participants policies
CREATE POLICY "Users can view participants in their calls"
ON call_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agora_sessions
    WHERE agora_sessions.id = call_participants.agora_session_id
    AND (
      agora_sessions.initiator_id = auth.uid() OR
      agora_sessions.recipient_id = auth.uid() OR
      auth.uid() = ANY(agora_sessions.participants)
    )
  )
);

CREATE POLICY "Users can insert participants in their calls"
ON call_participants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agora_sessions
    WHERE agora_sessions.id = call_participants.agora_session_id
    AND agora_sessions.initiator_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own participant data"
ON call_participants FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- call_notifications policies
CREATE POLICY "Users can view their own notifications"
ON call_notifications FOR SELECT
USING (recipient_id = auth.uid());

CREATE POLICY "Users can insert their own notifications"
ON call_notifications FOR INSERT
WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON call_notifications FOR UPDATE
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- call_recordings policies
CREATE POLICY "Users can view recordings of their calls"
ON call_recordings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agora_sessions
    WHERE agora_sessions.id = call_recordings.agora_session_id
    AND (
      agora_sessions.initiator_id = auth.uid() OR
      agora_sessions.recipient_id = auth.uid() OR
      auth.uid() = ANY(agora_sessions.participants)
    )
  )
);

CREATE POLICY "Users can insert recordings in their calls"
ON call_recordings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agora_sessions
    WHERE agora_sessions.id = call_recordings.agora_session_id
    AND agora_sessions.initiator_id = auth.uid()
  )
);

-- call_ratings policies
CREATE POLICY "Users can view their own ratings"
ON call_ratings FOR SELECT
USING (rater_id = auth.uid());

CREATE POLICY "Users can insert their own ratings"
ON call_ratings FOR INSERT
WITH CHECK (rater_id = auth.uid());

CREATE POLICY "Users can update their own ratings"
ON call_ratings FOR UPDATE
USING (rater_id = auth.uid())
WITH CHECK (rater_id = auth.uid());

-- call_events policies
CREATE POLICY "Users can view events in their calls"
ON call_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agora_sessions
    WHERE agora_sessions.id = call_events.agora_session_id
    AND (
      agora_sessions.initiator_id = auth.uid() OR
      agora_sessions.recipient_id = auth.uid() OR
      auth.uid() = ANY(agora_sessions.participants)
    )
  )
);

-- ============================================================================
-- FUNCTIONS (Funciones de utilidad)
-- ============================================================================

-- Función para actualizar duration_seconds automáticamente
CREATE OR REPLACE FUNCTION update_call_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_call_duration
BEFORE UPDATE ON agora_sessions
FOR EACH ROW
EXECUTE FUNCTION update_call_duration();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agora_sessions_updated_at
BEFORE UPDATE ON agora_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_call_recordings_updated_at
BEFORE UPDATE ON call_recordings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular la duración de un participante
CREATE OR REPLACE FUNCTION update_participant_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
    NEW.connection_duration_seconds := EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_participant_duration
BEFORE UPDATE ON call_participants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar grabaciones antiguas (para jobs programados)
CREATE OR REPLACE FUNCTION cleanup_old_recordings()
RETURNS VOID AS $$
BEGIN
  DELETE FROM call_recordings
  WHERE delete_at IS NOT NULL
  AND delete_at <= NOW()
  AND is_permanent = FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS (Vistas para consultas comunes)
-- ============================================================================

-- Vista de llamadas activas
CREATE VIEW active_calls AS
SELECT
  s.id,
  s.agora_channel_name,
  s.session_type,
  s.initiator_id,
  s.recipient_id,
  s.participants,
  s.active_participants,
  s.started_at,
  EXTRACT(EPOCH FROM (NOW() - s.started_at))::INTEGER as current_duration_seconds,
  COUNT(DISTINCT cp.id) as participant_count,
  i.nombre_completo as initiator_name,
  r.nombre_completo as recipient_name
FROM agora_sessions s
LEFT JOIN profiles i ON s.initiator_id = i.id
LEFT JOIN profiles r ON s.recipient_id = r.id
LEFT JOIN call_participants cp ON s.id = cp.agora_session_id
WHERE s.session_status = 'active'
GROUP BY s.id, i.nombre_completo, r.nombre_completo;

-- Establecer SECURITY INVOKER para respetar RLS del usuario que consulta
ALTER VIEW active_calls SET (security_invoker = on);

-- Vista de historial de llamadas con estadísticas
CREATE VIEW call_history_with_stats AS
SELECT
  s.*,
  COUNT(DISTINCT cp.id) as total_participants,
  AVG(cr.overall_rating) as average_rating,
  AVG(cr.audio_quality_rating) as avg_audio_quality,
  AVG(cr.video_quality_rating) as avg_video_quality,
  COUNT(DISTINCT cr.id) as rating_count,
  COUNT(DISTINCT rec.id) as recording_count
FROM agora_sessions s
LEFT JOIN call_participants cp ON s.id = cp.agora_session_id
LEFT JOIN call_ratings cr ON s.id = cr.agora_session_id
LEFT JOIN call_recordings rec ON s.id = rec.agora_session_id
WHERE s.session_status IN ('ended', 'cancelled', 'failed', 'rejected')
GROUP BY s.id;

-- Establecer SECURITY INVOKER para respetar RLS del usuario que consulta
ALTER VIEW call_history_with_stats SET (security_invoker = on);

-- ============================================================================
-- COMMENTS (Comentarios de documentación)
-- ============================================================================

COMMENT ON TABLE agora_sessions IS 'Sesiones de llamadas Agora.io - almacena información de videollamadas, llamadas de voz y conferencias';
COMMENT ON TABLE call_participants IS 'Participantes individuales en llamadas - almacena estado y estadísticas de cada usuario';
COMMENT ON TABLE call_notifications IS 'Notificaciones de llamadas entrantes - gestiona las alertas de llamadas';
COMMENT ON TABLE call_recordings IS 'Grabaciones de llamadas - almacena metadatos y referencias a archivos de grabación';
COMMENT ON TABLE call_ratings IS 'Calificaciones de llamadas - feedback de los usuarios sobre la calidad de la llamada';
COMMENT ON TABLE call_events IS 'Eventos durante llamadas - registro de eventos importantes (join, leave, mute, etc.)';

COMMENT ON COLUMN agora_sessions.agora_channel_name IS 'Nombre único del canal en Agora.io';
COMMENT ON COLUMN agora_sessions.agora_token IS 'Token de autenticación generado por el backend';
COMMENT ON COLUMN agora_sessions.agora_recording_id IS 'ID de la grabación en el servicio de grabación de Agora';
COMMENT ON COLUMN agora_sessions.call_quality IS 'Calidad general de la llamada (excellent, good, fair, poor)';
COMMENT ON COLUMN agora_sessions.video_quality_score IS 'Score de calidad de video (0.0 - 1.0)';
COMMENT ON COLUMN agora_sessions.audio_quality_score IS 'Score de calidad de audio (0.0 - 1.0)';
COMMENT ON COLUMN agora_sessions.network_quality_score IS 'Score de calidad de red (0.0 - 1.0)';
COMMENT ON COLUMN agora_sessions.packet_loss_percentage IS 'Porcentaje de paquetes perdidos durante la llamada';

COMMENT ON COLUMN call_participants.agora_uid IS 'UID único de Agora.io para el usuario';
COMMENT ON COLUMN call_participants.can_publish_audio IS 'Permite al usuario publicar audio';
COMMENT ON COLUMN call_participants.can_publish_video IS 'Permite al usuario publicar video';
COMMENT ON COLUMN call_participants.can_publish_screen IS 'Permite al usuario compartir pantalla';

COMMENT ON COLUMN call_recordings.consent_obtained IS 'Indica si se obtuvo consentimiento explícito para grabar';
COMMENT ON COLUMN call_recordings.auto_delete_after_days IS 'Días después de los cuales se borra automáticamente la grabación';
COMMENT ON COLUMN call_recordings.is_encrypted IS 'Indica si la grabación está encriptada';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
