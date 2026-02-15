-- Fix infinite recursion in chat_participants RLS policy
-- Issue: The SELECT policy was checking channel_id IN (SELECT FROM chat_participants)
-- which caused recursive RLS policy evaluation

-- Step 1: Drop the problematic policy
DROP POLICY IF EXISTS "Anyone can view participants of channels they are in" ON chat_participants;

-- Step 2: Create SECURITY DEFINER functions that bypass RLS to check membership
CREATE OR REPLACE FUNCTION public.user_is_channel_member(p_channel_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM chat_participants
    WHERE channel_id = p_channel_id
    AND user_id = auth.uid()
    AND is_banned = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 3: Create an RPC function for safely fetching user's channel IDs
CREATE OR REPLACE FUNCTION public.get_user_channel_ids()
RETURNS TABLE(channel_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT chat_participants.channel_id
  FROM chat_participants
  WHERE user_id = auth.uid()
  AND is_banned = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 4: Create an RPC function for getting channel participants
CREATE OR REPLACE FUNCTION public.get_channel_participants(p_channel_id UUID)
RETURNS TABLE(
  id UUID,
  channel_id UUID,
  user_id UUID,
  role TEXT,
  presence_status TEXT,
  notification_settings JSONB,
  permissions JSONB,
  joined_at TIMESTAMP WITH TIME ZONE,
  last_read_at TIMESTAMP WITH TIME ZONE,
  is_muted BOOLEAN,
  is_banned BOOLEAN,
  full_name TEXT,
  avatar_url TEXT,
  user_role TEXT,
  specialty TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.channel_id,
    cp.user_id,
    cp.role,
    cp.presence_status,
    cp.notification_settings,
    cp.permissions,
    cp.joined_at,
    cp.last_read_at,
    cp.is_muted,
    cp.is_banned,
    p.full_name,
    p.avatar_url,
    p.role,
    p.specialty
  FROM chat_participants cp
  LEFT JOIN profiles p ON cp.user_id = p.id
  WHERE cp.channel_id = p_channel_id
  AND EXISTS (
    SELECT 1 FROM chat_participants
    WHERE channel_id = p_channel_id
    AND user_id = auth.uid()
    AND is_banned = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 5: Create an RPC function for getting participant's last read timestamp
CREATE OR REPLACE FUNCTION public.get_participant_last_read(p_channel_id UUID)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  v_last_read TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT last_read_at INTO v_last_read
  FROM chat_participants
  WHERE channel_id = p_channel_id
  AND user_id = auth.uid();
  
  RETURN v_last_read;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 6: Create simplified RLS policy for chat_participants
-- Users can view participants only if:
-- 1. They are viewing their own participant record
-- 2. They are a member of the same channel (checked via SECURITY DEFINER function)
CREATE POLICY "Users can view participants of channels they participate in"
  ON chat_participants FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR public.user_is_channel_member(channel_id)
  );
