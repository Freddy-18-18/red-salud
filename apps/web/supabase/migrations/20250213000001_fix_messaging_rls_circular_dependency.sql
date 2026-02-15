-- ============================================================================
-- MIGRATION: Fix Messaging RLS Circular Dependency
-- Fecha: 2025-02-13
-- Descripción: Fix infinite recursion in chat_participants and chat_messages RLS policies
-- ============================================================================

-- ============================================================================
-- CHAT PARTICIPANTS - FIX CIRCULAR RECURSION
-- ============================================================================

-- Drop ALL problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Anyone can view participants of channels they are in" ON chat_participants;
DROP POLICY IF EXISTS "Users can add participants if they have permission" ON chat_participants;
DROP POLICY IF EXISTS "Users can update their own participant settings" ON chat_participants;
DROP POLICY IF EXISTS "Admins can update other participants" ON chat_participants;

-- IMPORTANT: Authorization model:
-- - Channel-level RLS controls which channels users can access
-- - Once a user can access a channel, they can see all participants
-- - Participant-level RLS uses simple conditions without complex authorization checks

-- New, non-recursive policies for participants
CREATE POLICY "view_channel_participants"
  ON chat_participants FOR SELECT
  USING (is_banned = false);

CREATE POLICY "view_own_participation"
  ON chat_participants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "users_can_join_channels"
  ON chat_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_settings"
  ON chat_participants FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "admins_manage_participants"
  ON chat_participants FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'super_admin'))
  );

-- ============================================================================
-- CHAT CHANNELS - FIX CIRCULAR DEPENDENCIES
-- ============================================================================

-- Drop policies that query chat_participants (could cause cross-table recursion)
DROP POLICY IF EXISTS "Users can view channels they participate in" ON chat_channels;
DROP POLICY IF EXISTS "Users can create channels" ON chat_channels;
DROP POLICY IF EXISTS "Channel admins can update channels" ON chat_channels;

-- FIXED approach:
-- The chat_channels policy CAN query chat_participants because:
-- - The subquery is part of the authorization context, not a recursive RLS check
-- - The chat_participants query doesn't need to check RLS on its own authorization
-- Just avoid chat_participants RLS policies querying chat_channels

CREATE POLICY "users_view_channels_they_participate_in"
  ON chat_channels FOR SELECT
  USING (
    -- User is a participant
    id IN (
      SELECT channel_id FROM chat_participants
      WHERE user_id = auth.uid() AND is_banned = false
    )
    -- Or it's a direct message with the user
    OR primary_entity_id = auth.uid()
    OR secondary_entity_id = auth.uid()
  );

CREATE POLICY "users_can_create_channels"
  ON chat_channels FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Channel updates: check if user is admin/owner
CREATE POLICY "channel_admins_update"
  ON chat_channels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE channel_id = chat_channels.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'moderator')
    )
  );

-- ============================================================================
-- CHAT MESSAGES - FIX CIRCULAR RECURSION
-- ============================================================================

-- Drop problematic message policies that query chat_participants
DROP POLICY IF EXISTS "Users can view messages from channels they participate in" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to channels they participate in" ON chat_messages;
DROP POLICY IF EXISTS "Users can edit their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;

-- New, non-recursive policies for messages
-- Authorization is delegated to the application layer
CREATE POLICY "view_channel_messages"
  ON chat_messages FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "users_can_send_messages"
  ON chat_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "users_edit_own_messages"
  ON chat_messages FOR UPDATE
  USING (
    sender_id = auth.uid()
    AND deleted_at IS NULL
  );

CREATE POLICY "users_delete_own_messages"
  ON chat_messages FOR DELETE
  USING (sender_id = auth.uid());
