-- ============================================================================
-- AI Conversations Schema for Patient Portal
-- ============================================================================
-- Stores AI assistant conversation history per patient.
-- Tables: ai_conversations, ai_messages
-- ============================================================================

-- --- ai_conversations ---

CREATE TABLE IF NOT EXISTS ai_conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE ai_conversations IS 'AI assistant conversations per patient';

CREATE INDEX idx_ai_conversations_patient_updated
  ON ai_conversations (patient_id, updated_at DESC);

-- --- ai_messages ---

CREATE TABLE IF NOT EXISTS ai_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE ai_messages IS 'Messages within an AI assistant conversation';

CREATE INDEX idx_ai_messages_conversation_created
  ON ai_messages (conversation_id, created_at);

-- --- Auto-update updated_at on ai_conversations ---

CREATE OR REPLACE FUNCTION update_ai_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_ai_message_update_conversation
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_conversation_timestamp();

-- --- RLS Policies ---

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Patients can SELECT their own conversations
CREATE POLICY ai_conversations_select
  ON ai_conversations FOR SELECT
  USING (auth.uid() = patient_id);

-- Patients can INSERT their own conversations
CREATE POLICY ai_conversations_insert
  ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Patients can UPDATE their own conversations
CREATE POLICY ai_conversations_update
  ON ai_conversations FOR UPDATE
  USING (auth.uid() = patient_id);

-- Patients can DELETE their own conversations
CREATE POLICY ai_conversations_delete
  ON ai_conversations FOR DELETE
  USING (auth.uid() = patient_id);

-- Patients can SELECT messages from their own conversations
CREATE POLICY ai_messages_select
  ON ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.patient_id = auth.uid()
    )
  );

-- Patients can INSERT messages into their own conversations
CREATE POLICY ai_messages_insert
  ON ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.patient_id = auth.uid()
    )
  );

-- Patients can DELETE messages from their own conversations
CREATE POLICY ai_messages_delete
  ON ai_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.patient_id = auth.uid()
    )
  );
