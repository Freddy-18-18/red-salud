-- Script para aplicar la migración del sistema de mensajería
-- Ejecutar en Supabase SQL Editor

-- Sistema de Mensajería entre Pacientes y Doctores
-- Permite comunicación directa relacionada con citas médicas

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  subject TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, doctor_id, appointment_id)
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_conversations_patient ON conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_conversations_doctor ON conversations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_appointment ON conversations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(is_read) WHERE is_read = FALSE;

-- Trigger para actualizar updated_at en conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS conversations_updated_at ON conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Trigger para actualizar last_message_at cuando se crea un mensaje
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS messages_update_conversation ON messages;
CREATE TRIGGER messages_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- RLS Policies para conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Patients can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Doctors can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Patients can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

-- Pacientes pueden ver sus propias conversaciones
CREATE POLICY "Patients can view their conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = patient_id
    OR auth.uid() IN (
      SELECT id FROM profiles WHERE id = patient_id AND role = 'paciente'
    )
  );

-- Doctores pueden ver sus conversaciones
CREATE POLICY "Doctors can view their conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = doctor_id
    OR auth.uid() IN (
      SELECT id FROM profiles WHERE id = doctor_id AND role = 'doctor'
    )
  );

-- Pacientes pueden crear conversaciones
CREATE POLICY "Patients can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Usuarios pueden actualizar sus conversaciones
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- RLS Policies para messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can create messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;

-- Usuarios pueden ver mensajes de sus conversaciones
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE patient_id = auth.uid() OR doctor_id = auth.uid()
    )
  );

-- Usuarios pueden crear mensajes en sus conversaciones
CREATE POLICY "Users can create messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT id FROM conversations
      WHERE patient_id = auth.uid() OR doctor_id = auth.uid()
    )
  );

-- Usuarios pueden actualizar sus propios mensajes (marcar como leído)
CREATE POLICY "Users can update messages"
  ON messages FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE patient_id = auth.uid() OR doctor_id = auth.uid()
    )
  );

-- Comentarios
COMMENT ON TABLE conversations IS 'Conversaciones entre pacientes y doctores';
COMMENT ON TABLE messages IS 'Mensajes dentro de conversaciones';
COMMENT ON COLUMN conversations.status IS 'Estado de la conversación: active, archived, closed';
COMMENT ON COLUMN messages.is_read IS 'Indica si el mensaje ha sido leído por el receptor';

-- Verificación
SELECT 'Migración de mensajería aplicada correctamente' as status;
