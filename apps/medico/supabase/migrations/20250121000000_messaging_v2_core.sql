-- ============================================================================
-- MIGRATION: Messaging V2 - Red Salud Messenger
-- Fecha: 2025-01-21
-- Descripción: Sistema de mensajería avanzado inspirado en WhatsApp, Telegram,
--              Discord y Slack para comunicación médica
-- ============================================================================

-- ============================================================================
-- TYPES (Enumerados)
-- ============================================================================

-- Tipos de canal
CREATE TYPE channel_type AS ENUM (
  'direct',           -- 1:1 entre dos usuarios (WhatsApp DM)
  'group',            -- Grupo pequeño (WhatsApp Group)
  'patient_care',     -- Canal de atención al paciente
  'multidisciplinary', -- Equipo multidisciplinario
  'broadcast',        -- Mensajes unidireccionales (Telegram Channel)
  'announcement'      -- Anuncios (clínica -> pacientes)
);

-- Tipo de mensaje
CREATE TYPE message_type AS ENUM (
  'text',            -- Mensaje de texto
  'image',           -- Imagen
  'video',           -- Video
  'audio',           -- Audio
  'file',            -- Archivo adjunto
  'location',        -- Ubicación
  'prescription',    -- Receta digital
  'lab_result',      -- Resultado de laboratorio
  'appointment',     -- Cita
  'voice_note',      -- Nota de voz
  'system',          -- Mensaje del sistema
  'encrypted',       -- Mensaje cifrado (PHI)
  'poll',            -- Encuesta
  'video_call'       -- Llamada de video
);

-- Estado de entrega del mensaje
CREATE TYPE delivery_status AS ENUM (
  'sending',    -- Enviando
  'sent',       -- Enviado al servidor
  'delivered',  -- Entregado al dispositivo
  'read',       -- Leído por el receptor
  'failed'      -- Falló el envío
);

-- Rol de participante
CREATE TYPE participant_role AS ENUM (
  'owner',      -- Dueño del canal
  'admin',      -- Administrador
  'moderator',  -- Moderador
  'member',     -- Miembro normal
  'guest',      -- Invitado temporal
  'observer'    -- Solo lectura
);

-- Estado de presencia
CREATE TYPE presence_status AS ENUM (
  'online',           -- Conectado y activo
  'offline',          -- Desconectado
  'away',             -- Ausente (inactivo 5min)
  'busy',             -- Ocupado
  'do_not_disturb',   -- No molestar
  'invisible'         -- Invisible pero conectado
);

-- Tipo de workspace
CREATE TYPE workspace_type AS ENUM (
  'clinic',           -- Workspace de una clínica
  'medical_team',     -- Equipo médico
  'patient_care',     -- Atención a paciente específico
  'professional',     -- Red profesional
  'emergency'         -- Canal de emergencia
);

-- Tipo de adjunto
CREATE TYPE attachment_type AS ENUM (
  'image',
  'video',
  'audio',
  'document',
  'medical',
  'prescription',
  'lab_result'
);

-- ============================================================================
-- TABLES (Tablas principales)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- WORKSPACES (Discord Servers / Slack Workspaces)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  workspace_type workspace_type NOT NULL DEFAULT 'professional',
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Configuración visual
  avatar_url TEXT,
  banner_url TEXT,
  is_public BOOLEAN DEFAULT false,

  -- Límites
  max_members INTEGER DEFAULT 100,
  max_channels INTEGER DEFAULT 50,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_workspaces_owner ON chat_workspaces(owner_id);
CREATE INDEX idx_workspaces_type ON chat_workspaces(workspace_type);
CREATE INDEX idx_workspaces_public ON chat_workspaces(is_public) WHERE is_public = true;

-- ----------------------------------------------------------------------------
-- CATEGORIES (Discord Categories - organizan canales)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES chat_workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),         -- Color hex #RRGGBB
  position INTEGER DEFAULT 0,
  is_collapsed BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(workspace_id, name, position)
);

CREATE INDEX idx_categories_workspace ON chat_categories(workspace_id, position);

-- ----------------------------------------------------------------------------
-- CHANNELS (Canales de comunicación)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type channel_type NOT NULL,

  -- Nombre y descripción (null para direct)
  name VARCHAR(255),
  description TEXT,
  avatar_url TEXT,

  -- Relación con entidad médica
  primary_entity_type VARCHAR(20),
  primary_entity_id UUID,

  -- Configuración
  is_encrypted BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  is_read_only BOOLEAN DEFAULT false,

  -- Workspace y categoría
  workspace_id UUID REFERENCES chat_workspaces(id) ON DELETE SET NULL,
  category_id UUID REFERENCES chat_categories(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

-- Índices críticos
CREATE INDEX idx_channels_type ON chat_channels(channel_type);
CREATE INDEX idx_channels_workspace ON chat_channels(workspace_id) WHERE workspace_id IS NOT NULL;
CREATE INDEX idx_channels_category ON chat_channels(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_channels_entity ON chat_channels(primary_entity_type, primary_entity_id) WHERE primary_entity_id IS NOT NULL;
CREATE INDEX idx_channels_archived ON chat_channels(is_archived) WHERE is_archived = false;
CREATE INDEX idx_channels_last_message ON chat_channels(last_message_at DESC) WHERE last_message_at IS NOT NULL;

-- ----------------------------------------------------------------------------
-- PARTICIPANTS (Participantes de canales con roles y permisos)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Rol y presencia
  role participant_role DEFAULT 'member',
  presence_status presence_status DEFAULT 'offline',

  -- Configuración de notificaciones por canal
  notification_settings JSONB DEFAULT '{
    "mentions_only": false,
    "mute": false,
    "mute_until": null
  }'::jsonb,

  -- Permisos granulares
  permissions JSONB DEFAULT '{
    "can_send_messages": true,
    "can_send_attachments": true,
    "can_send_voice": true,
    "can_video_call": true,
    "can_invite": false,
    "can_pin": false,
    "can_manage": false
  }'::jsonb,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,

  -- Estado del participante
  is_muted BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  banned_until TIMESTAMPTZ,
  ban_reason TEXT,

  UNIQUE(channel_id, user_id)
);

-- Índices
CREATE INDEX idx_participants_channel ON chat_participants(channel_id);
CREATE INDEX idx_participants_user ON chat_participants(user_id);
CREATE INDEX idx_participants_presence ON chat_participants(user_id, presence_status) WHERE presence_status != 'offline';
CREATE INDEX idx_participants_unread ON chat_participants(user_id, channel_id, last_read_at);

-- ----------------------------------------------------------------------------
-- MESSAGES (Mensajes avanzados)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Contenido
  message_type message_type DEFAULT 'text',
  content TEXT,
  content_encrypted TEXT,
  rich_content JSONB,

  -- Respuestas y threads
  reply_to_id UUID REFERENCES chat_messages(id),
  thread_root_id UUID REFERENCES chat_messages(id),

  -- Reacciones (JSON array de {emoji, user_ids[], count})
  reactions JSONB DEFAULT '[]'::jsonb,

  -- Adjuntos (JSON array)
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Edición
  edit_count INTEGER DEFAULT 0,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),

  -- Estado de entrega
  delivery_status delivery_status DEFAULT 'sent',

  -- Prioridad y etiquetas
  priority VARCHAR(10) CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  labels TEXT[] DEFAULT '{}',

  -- Contexto médico
  medical_context JSONB,
  is_phi BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices críticos para performance
CREATE INDEX idx_messages_channel_created ON chat_messages(channel_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_thread ON chat_messages(thread_root_id, created_at) WHERE thread_root_id IS NOT NULL;
CREATE INDEX idx_messages_sender ON chat_messages(sender_id, created_at DESC);
CREATE INDEX idx_messages_reply_to ON chat_messages(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX idx_messages_delivery ON chat_messages(channel_id, sender_id, delivery_status);
CREATE INDEX idx_messages_phi ON chat_messages(is_phi) WHERE is_phi = true;
CREATE INDEX idx_messages_type ON chat_messages(message_type);

-- Índices GIN para búsqueda JSON
CREATE INDEX idx_messages_reactions ON chat_messages USING GIN(reactions);
CREATE INDEX idx_messages_rich_content ON chat_messages USING GIN(rich_content);
CREATE INDEX idx_messages_medical_context ON chat_messages USING GIN(medical_context);

-- ----------------------------------------------------------------------------
-- MESSAGE READS (Receipts de lectura individuales - checks azules)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  read_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ DEFAULT NOW(),

  first_reaction_at TIMESTAMPTZ,

  UNIQUE(message_id, user_id)
);

CREATE INDEX idx_message_reads_message ON chat_message_reads(message_id);
CREATE INDEX idx_message_reads_user ON chat_message_reads(user_id, read_at DESC);

-- ----------------------------------------------------------------------------
-- THREADS (Hilos organizados - Discord/Slack style)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  root_message_id UUID NOT NULL REFERENCES chat_messages(id),

  name VARCHAR(255),
  is_locked BOOLEAN DEFAULT false,

  message_count INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,

  UNIQUE(root_message_id)
);

CREATE INDEX idx_threads_channel ON chat_threads(channel_id, updated_at DESC);

-- ----------------------------------------------------------------------------
-- MENTIONS (Tracking de menciones - @user, @role, @everyone)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,

  mention_type VARCHAR(20) NOT NULL CHECK (mention_type IN (
    'user', 'role', 'everyone', 'here'
  )),

  mentioned_user_id UUID REFERENCES profiles(id),
  mentioned_role VARCHAR(50),

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mentions_message ON chat_mentions(message_id);
CREATE INDEX idx_mentions_user_unread ON chat_mentions(mentioned_user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_mentions_role ON chat_mentions(mentioned_role, created_at DESC);

-- ----------------------------------------------------------------------------
-- TYPING INDICATORS ("Escribiendo..." - TTL automático)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_typing_indicators (
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  last_typing_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (channel_id, user_id)
);

CREATE INDEX idx_typing_expiration ON chat_typing_indicators(last_typing_at);

-- Función para limpiar indicadores antiguos (> 10 segundos)
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_typing_indicators
  WHERE last_typing_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- USER PRESENCE (Estados de usuario - online/offline/away/busy)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Estado (WhatsApp style)
  status_text TEXT,
  status_emoji VARCHAR(50),

  -- Disponibilidad
  presence_status presence_status DEFAULT 'offline',

  -- Estado temporal (expira como WhatsApp)
  expires_at TIMESTAMPTZ,

  -- Última actividad
  last_seen_at TIMESTAMPTZ,
  is_last_seen_visible BOOLEAN DEFAULT true,

  -- Actividad actual
  currently_in_call UUID REFERENCES chat_voice_calls(id),
  current_channel_id UUID REFERENCES chat_channels(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_presence_status ON chat_user_presence(presence_status) WHERE presence_status != 'offline';
CREATE INDEX idx_presence_expires ON chat_user_presence(expires_at) WHERE expires_at IS NOT NULL;

-- ----------------------------------------------------------------------------
-- POLLS (Encuestas - WhatsApp style)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  message_id UUID REFERENCES chat_messages(id),
  created_by UUID NOT NULL REFERENCES profiles(id),

  question TEXT NOT NULL,
  options JSONB NOT NULL, -- [{id, text, icon, color}]

  -- Configuración
  is_anonymous BOOLEAN DEFAULT false,
  is_multi_select BOOLEAN DEFAULT false,
  allow_add_options BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,

  -- Estado
  is_closed BOOLEAN DEFAULT false,
  total_votes INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_polls_channel ON chat_polls(channel_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- POLL VOTES (Votos de encuestas)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES chat_polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id), -- Null si anónima
  option_id TEXT NOT NULL,

  voted_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(poll_id, user_id) WHERE user_id IS NOT NULL
);

CREATE INDEX idx_poll_votes_poll ON chat_poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user ON chat_poll_votes(user_id) WHERE user_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- VOICE CALLS (Llamadas de voz/video - Agora.io)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES chat_channels(id),
  initiated_by UUID NOT NULL REFERENCES profiles(id),

  call_type VARCHAR(10) CHECK (call_type IN ('audio', 'video')) NOT NULL,
  status VARCHAR(20) DEFAULT 'ringing' CHECK (status IN (
    'ringing', 'ongoing', 'ended', 'rejected', 'failed'
  )),

  -- Conexión
  room_id VARCHAR(100),
  service_provider VARCHAR(20) DEFAULT 'agora',

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Calidad
  connection_quality JSONB,

  -- Grabación
  recording_url TEXT,
  recording_enabled BOOLEAN DEFAULT false,

  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_calls_channel ON chat_voice_calls(channel_id, started_at DESC);
CREATE INDEX idx_calls_initiator ON chat_voice_calls(initiated_by, started_at DESC);
CREATE INDEX idx_calls_status ON chat_voice_calls(status) WHERE status IN ('ringing', 'ongoing');

-- ----------------------------------------------------------------------------
-- CALL PARTICIPANTS (Participantes en llamadas)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES chat_voice_calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),

  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Estado durante la llamada
  audio_enabled BOOLEAN DEFAULT true,
  video_enabled BOOLEAN DEFAULT true,
  screen_sharing BOOLEAN DEFAULT false,

  -- Calidad individual
  connection_score INTEGER, -- 0-100
  device_info JSONB
);

CREATE INDEX idx_call_participants_call ON chat_call_participants(call_id);
CREATE INDEX idx_call_participants_user ON chat_call_participants(user_id, joined_at DESC);

-- ----------------------------------------------------------------------------
-- ATTACHMENTS (Archivos compartidos)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  channel_id UUID NOT NULL REFERENCES chat_channels(id),
  uploaded_by UUID NOT NULL REFERENCES profiles(id),

  -- Información del archivo
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,

  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_category attachment_type,

  -- Metadata médico
  is_medical_document BOOLEAN DEFAULT false,
  document_type VARCHAR(50),
  related_patient_id UUID REFERENCES profiles(id),
  related_appointment_id UUID,

  -- Previsualización
  thumbnail_url TEXT,
  preview_url TEXT,

  -- Virus scan y seguridad
  is_scanned BOOLEAN DEFAULT false,
  scan_result VARCHAR(20) CHECK (scan_result IN ('clean', 'infected', 'pending')),
  scanned_at TIMESTAMPTZ,

  -- Control de acceso
  is_encrypted BOOLEAN DEFAULT false,
  encryption_key TEXT,
  access_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_message ON chat_attachments(message_id);
CREATE INDEX idx_attachments_channel ON chat_attachments(channel_id, created_at DESC);
CREATE INDEX idx_attachments_medical ON chat_attachments(is_medical_document, related_patient_id);

-- ----------------------------------------------------------------------------
-- SCHEDULED MESSAGES (Mensajes programados - Slack style)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),

  -- Contenido
  content TEXT NOT NULL,
  rich_content JSONB,
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Programación
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/Caracas',

  -- Repetición opcional
  repeat_pattern JSONB,

  -- Estado
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'cancelled', 'failed'
  )),
  sent_message_id UUID REFERENCES chat_messages(id),

  -- Intentos fallidos
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_channel ON chat_scheduled_messages(channel_id, scheduled_for);
CREATE INDEX idx_scheduled_pending ON chat_scheduled_messages(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_scheduled_sender ON chat_scheduled_messages(sender_id, scheduled_for DESC);

-- ----------------------------------------------------------------------------
-- STICKER PACKS (Telegram style)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_sticker_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,

  category VARCHAR(50) DEFAULT 'general',
  is_medical BOOLEAN DEFAULT false,

  created_by UUID REFERENCES profiles(id),

  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- STICKERS (Stickers individuales)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID REFERENCES chat_sticker_packs(id) ON DELETE SET NULL,

  name VARCHAR(100),
  emoji_keywords TEXT[],
  file_url TEXT NOT NULL,
  file_size_bytes INTEGER,

  width INTEGER,
  height INTEGER,
  mime_type VARCHAR(50),

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stickers_pack ON chat_stickers(pack_id) WHERE is_active = true;
CREATE INDEX idx_stickers_keywords ON chat_stickers USING GIN(emoji_keywords);

-- ----------------------------------------------------------------------------
-- AUDIT LOG (Auditoría HIPAA)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_message_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,

  action VARCHAR(50) NOT NULL,
  performed_by UUID REFERENCES profiles(id),

  entity_type VARCHAR(50),
  entity_id UUID,

  ip_address INET,
  user_agent TEXT,
  location TEXT,

  action_metadata JSONB DEFAULT '{}'::jsonb,

  phi_accessed BOOLEAN DEFAULT false,
  compliance_reason TEXT,

  performed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_message ON chat_message_audit(message_id, performed_at DESC);
CREATE INDEX idx_audit_performer ON chat_message_audit(performed_by, performed_at DESC);
CREATE INDEX idx_audit_phi ON chat_message_audit(phi_accessed, performed_at DESC) WHERE phi_accessed = true;
CREATE INDEX idx_audit_action ON chat_message_audit(action, performed_at DESC);

-- ----------------------------------------------------------------------------
-- SEARCH INDEX (Full-text search PostgreSQL)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES chat_channels(id),

  -- Contenido indexado
  content_tsv TSVECTOR,
  metadata_tsv TSVECTOR,

  -- Filtros rápidos
  sender_id UUID REFERENCES profiles(id),
  message_type message_type,
  has_attachments BOOLEAN DEFAULT false,
  is_medical BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices GIN para búsqueda de texto completo
CREATE INDEX idx_search_content ON chat_search_index USING GIN(content_tsv);
CREATE INDEX idx_search_metadata ON chat_search_index USING GIN(metadata_tsv);
CREATE INDEX idx_search_filters ON chat_search_index(channel_id, message_type, is_medical);

-- Trigger para actualizar el índice de búsqueda
CREATE OR REPLACE FUNCTION chat_search_index_trigger()
RETURNS trigger AS $$
BEGIN
  INSERT INTO chat_search_index (
    message_id,
    channel_id,
    content_tsv,
    metadata_tsv,
    sender_id,
    message_type,
    has_attachments,
    is_medical
  )
  VALUES (
    NEW.id,
    NEW.channel_id,
    to_tsvector('spanish', COALESCE(NEW.content, '')),
    to_tsvector('spanish', COALESCE(NEW.rich_content::text, '')),
    NEW.sender_id,
    NEW.message_type,
    COALESCE(jsonb_array_length(NEW.attachments) > 0, false),
    (NEW.medical_context IS NOT NULL OR NEW.is_phi = true)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_search_index_insert
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION chat_search_index_trigger();

-- ----------------------------------------------------------------------------
-- ENCRYPTION KEYS (Llaves de cifrado para canales)
-- ----------------------------------------------------------------------------
CREATE TABLE chat_encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,

  key_encrypted TEXT NOT NULL,
  key_version INTEGER DEFAULT 1,

  algorithm VARCHAR(20) DEFAULT 'AES-256-GCM',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT true,
  rotated_to UUID REFERENCES chat_encryption_keys(id)
);

CREATE INDEX idx_encryption_channel ON chat_encryption_keys(channel_id) WHERE is_active = true;
CREATE INDEX idx_encryption_version ON chat_encryption_keys(channel_id, key_version DESC);

-- ============================================================================
-- FUNCTIONS (Funciones útiles)
-- ============================================================================

-- Actualizar last_message_at de un canal
CREATE OR REPLACE FUNCTION update_channel_last_message()
RETURNS trigger AS $$
BEGIN
  UPDATE chat_channels
  SET last_message_at = NEW.created_at
  WHERE id = NEW.channel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_channel_last_message_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_last_message();

-- Actualizar presencia del usuario
CREATE OR REPLACE FUNCTION update_user_presence()
RETURNS trigger AS $$
BEGIN
  INSERT INTO chat_user_presence (user_id, presence_status, updated_at)
  VALUES (NEW.user_id, 'online', NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    presence_status = 'online',
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Obtener estadísticas de un canal
CREATE OR REPLACE FUNCTION get_channel_stats(p_channel_id UUID)
RETURNS TABLE (
  message_count BIGINT,
  participant_count BIGINT,
  last_message_at TIMESTAMPTZ,
  last_message_content TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM chat_messages WHERE channel_id = p_channel_id AND deleted_at IS NULL),
    (SELECT COUNT(*) FROM chat_participants WHERE channel_id = p_channel_id AND is_banned = false),
    (SELECT MAX(created_at) FROM chat_messages WHERE channel_id = p_channel_id AND deleted_at IS NULL),
    (SELECT content FROM chat_messages WHERE channel_id = p_channel_id AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Políticas de seguridad
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE chat_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sticker_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_message_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_encryption_keys ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- POLICIES PARA WORKSPACES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view workspaces they are members of"
  ON chat_workspaces FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT workspace_id FROM chat_channels
      JOIN chat_participants ON chat_channels.id = chat_participants.channel_id
      WHERE chat_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces"
  ON chat_workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can update"
  ON chat_workspaces FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete"
  ON chat_workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- ----------------------------------------------------------------------------
-- POLICIES PARA CHANNELS
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view channels they participate in"
  ON chat_channels FOR SELECT
  USING (
    id IN (
      SELECT channel_id FROM chat_participants
      WHERE user_id = auth.uid() AND is_banned = false
    )
    OR primary_entity_id = auth.uid() -- Canales directos donde el usuario es la entidad
  );

CREATE POLICY "Users can create channels"
  ON chat_channels FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    OR workspace_id IN (
      SELECT id FROM chat_workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Channel admins can update channels"
  ON chat_channels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE channel_id = chat_channels.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'moderator')
    )
  );

-- ----------------------------------------------------------------------------
-- POLICIES PARA PARTICIPANTS
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view participants of channels they are in"
  ON chat_participants FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM chat_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add participants if they have permission"
  ON chat_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_participants p
      JOIN chat_channels c ON p.channel_id = c.id
      WHERE p.channel_id = chat_participants.channel_id
      AND p.user_id = auth.uid()
      AND (p.permissions->>'can_invite')::boolean = true
    )
  );

CREATE POLICY "Users can update their own participant settings"
  ON chat_participants FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can update other participants"
  ON chat_participants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants p
      WHERE p.channel_id = chat_participants.channel_id
      AND p.user_id = auth.uid()
      AND p.role IN ('owner', 'admin', 'moderator')
    )
  );

-- ----------------------------------------------------------------------------
-- POLICIES PARA MESSAGES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view messages from channels they participate in"
  ON chat_messages FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM chat_participants
      WHERE user_id = auth.uid() AND is_banned = false
    )
  );

CREATE POLICY "Users can insert messages to channels they participate in"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND channel_id IN (
      SELECT channel_id FROM chat_participants
      WHERE user_id = auth.uid()
      AND (permissions->>'can_send_messages')::boolean = true
      AND is_banned = false
    )
  );

CREATE POLICY "Users can edit their own messages"
  ON chat_messages FOR UPDATE
  USING (
    sender_id = auth.uid()
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can delete their own messages"
  ON chat_messages FOR UPDATE
  USING (
    sender_id = auth.uid()
  );

-- ----------------------------------------------------------------------------
-- POLICIES PARA MESSAGE READS
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view read receipts from their channels"
  ON chat_message_reads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_messages m
      JOIN chat_participants p ON m.channel_id = p.channel_id
      WHERE m.id = chat_message_reads.message_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own read receipts"
  ON chat_message_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- POLICIES PARA ATTACHMENTS
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view attachments from their channels"
  ON chat_attachments FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM chat_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can upload attachments"
  ON chat_attachments FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- ----------------------------------------------------------------------------
-- POLICIES PARA USER PRESENCE
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view presence"
  ON chat_user_presence FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own presence"
  ON chat_user_presence FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own presence"
  ON chat_user_presence FOR UPDATE
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- POLICIES PARA TYPING INDICATORS
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view typing indicators"
  ON chat_typing_indicators FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert typing indicators"
  ON chat_typing_indicators FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their typing indicators"
  ON chat_typing_indicators FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their typing indicators"
  ON chat_typing_indicators FOR DELETE
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- POLICIES PARA MENTIONS
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view mentions directed to them"
  ON chat_mentions FOR SELECT
  USING (
    mentioned_user_id = auth.uid()
    OR mentioned_role IN (
      SELECT role FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM chat_messages m
      JOIN chat_participants p ON m.channel_id = p.channel_id
      WHERE m.id = chat_mentions.message_id
      AND p.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- POLICIES PARA AUDIT LOG (solo admins y el usuario mismo)
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view audit logs for their own actions"
  ON chat_message_audit FOR SELECT
  USING (performed_by = auth.uid());

CREATE POLICY "System can insert audit logs"
  ON chat_message_audit FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- GRANTS (Permisos adicionales)
-- ============================================================================

-- Grant select on search index to authenticated users
GRANT SELECT ON chat_search_index TO authenticated;
GRANT SELECT ON chat_stickers TO authenticated;
GRANT SELECT ON chat_sticker_packs TO authenticated;

-- ============================================================================
-- COMMENTS (Comentarios de documentación)
-- ============================================================================

COMMENT ON TABLE chat_workspaces IS 'Espacios de trabajo tipo Discord Servers';
COMMENT ON TABLE chat_channels IS 'Canales de comunicación con tipos variados';
COMMENT ON TABLE chat_participants IS 'Participantes en canales con roles y permisos';
COMMENT ON TABLE chat_messages IS 'Mensajes con soporte para threads, reacciones y adjuntos';
COMMENT ON TABLE chat_message_reads IS 'Receipts de lectura (checks azules)';
COMMENT ON TABLE chat_threads IS 'Hilos organizados de mensajes';
COMMENT ON TABLE chat_mentions IS 'Tracking de menciones @user, @role, @everyone';
COMMENT ON TABLE chat_typing_indicators IS 'Indicadores de escribiendo... con TTL';
COMMENT ON TABLE chat_user_presence IS 'Estados de presencia online/offline';
COMMENT ON TABLE chat_polls IS 'Encuestas tipo WhatsApp';
COMMENT ON TABLE chat_voice_calls IS 'Llamadas de voz/video integradas con Agora.io';
COMMENT ON TABLE chat_attachments IS 'Archivos compartidos con metadata médico';
COMMENT ON TABLE chat_scheduled_messages IS 'Mensajes programados tipo Slack';
COMMENT ON TABLE chat_message_audit IS 'Log de auditoría para cumplimiento HIPAA';
COMMENT ON TABLE chat_encryption_keys IS 'Llaves de cifrado para canales';

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
