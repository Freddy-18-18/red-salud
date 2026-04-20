-- Phase 2 unified messaging: SECURITY DEFINER helpers so the paciente and
-- medico web apps can use the same chat_channels / chat_messages /
-- chat_participants infrastructure for doctor<->patient DMs.
--
-- Why these functions exist:
--   * chat_participants INSERT policy requires the inserting user to already
--     have `permissions.can_invite = true` on the channel — impossible when
--     the channel was just created. A SECURITY DEFINER wrapper creates the
--     channel and the two participants atomically.
--   * chat_messages INSERT policy requires `permissions.can_send_messages =
--     true`, so the wrapper seeds both participants with that permission.
--   * Unread counts, last message, and counterpart identity need to be
--     aggregated across 3 tables — doing that in SQL once is much cheaper
--     than the N+1 pattern the legacy service used.

-- ---------------------------------------------------------------
-- get_or_create_dm_channel
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_or_create_dm_channel(
  p_user_a uuid,
  p_user_b uuid,
  p_appointment_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_channel_id uuid;
  v_caller     uuid := auth.uid();
  v_low        uuid;
  v_high       uuid;
BEGIN
  IF v_caller IS NULL OR (v_caller <> p_user_a AND v_caller <> p_user_b) THEN
    RAISE EXCEPTION 'Not authorized to create DM between other users';
  END IF;
  IF p_user_a = p_user_b THEN
    RAISE EXCEPTION 'DM participants must be two different users';
  END IF;

  -- deterministic ordering for the synthetic channel name
  IF p_user_a < p_user_b THEN v_low := p_user_a; v_high := p_user_b;
                         ELSE v_low := p_user_b; v_high := p_user_a;
  END IF;

  -- Find an existing direct channel between exactly these two users.
  SELECT c.id INTO v_channel_id
    FROM chat_channels c
   WHERE c.channel_type = 'direct'
     AND COALESCE(c.is_archived, false) = false
     AND EXISTS (SELECT 1 FROM chat_participants p
                  WHERE p.channel_id = c.id AND p.user_id = p_user_a)
     AND EXISTS (SELECT 1 FROM chat_participants p
                  WHERE p.channel_id = c.id AND p.user_id = p_user_b)
     AND (SELECT count(*) FROM chat_participants p WHERE p.channel_id = c.id) = 2
   LIMIT 1;

  IF v_channel_id IS NOT NULL THEN
    RETURN v_channel_id;
  END IF;

  INSERT INTO chat_channels (channel_type, name, primary_entity_type, primary_entity_id)
  VALUES ('direct',
          'dm:' || v_low::text || ':' || v_high::text,
          'doctor_patient',
          p_appointment_id)
  RETURNING id INTO v_channel_id;

  INSERT INTO chat_participants (channel_id, user_id, role, permissions)
  VALUES
    (v_channel_id, p_user_a, 'member',
     jsonb_build_object('can_send_messages', true, 'can_invite', false)),
    (v_channel_id, p_user_b, 'member',
     jsonb_build_object('can_send_messages', true, 'can_invite', false));

  RETURN v_channel_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_dm_channel(uuid, uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.get_or_create_dm_channel(uuid, uuid, uuid) IS
  'Returns the id of the direct chat channel between two users; creates it with both participants if missing. Caller must be one of the two users.';

-- ---------------------------------------------------------------
-- get_user_dm_inbox
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_dm_inbox(p_user_id uuid)
RETURNS TABLE (
  channel_id            uuid,
  counterpart_id        uuid,
  counterpart_name      text,
  counterpart_avatar    text,
  counterpart_role      text,
  last_message          text,
  last_message_at       timestamptz,
  last_sender_id        uuid,
  unread_count          integer,
  appointment_id        uuid,
  channel_created_at    timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
    SELECT
      c.id,
      counterpart.user_id,
      COALESCE(NULLIF(prof.full_name, ''), prof.email)::text,
      prof.avatar_url,
      prof.role::text,
      last_msg.content,
      last_msg.created_at,
      last_msg.sender_id,
      COALESCE((
        SELECT count(*)::integer FROM chat_messages m
         WHERE m.channel_id = c.id
           AND m.deleted_at IS NULL
           AND m.sender_id <> p_user_id
           AND m.created_at > COALESCE(me.last_read_at, '1970-01-01'::timestamptz)
      ), 0),
      CASE WHEN c.primary_entity_type = 'doctor_patient' THEN c.primary_entity_id END,
      c.created_at
    FROM chat_channels c
    JOIN chat_participants me
           ON me.channel_id = c.id AND me.user_id = p_user_id AND NOT me.is_banned
    JOIN chat_participants counterpart
           ON counterpart.channel_id = c.id AND counterpart.user_id <> p_user_id
    JOIN profiles prof
           ON prof.id = counterpart.user_id
    LEFT JOIN LATERAL (
      SELECT m.content, m.created_at, m.sender_id
        FROM chat_messages m
       WHERE m.channel_id = c.id AND m.deleted_at IS NULL
       ORDER BY m.created_at DESC
       LIMIT 1
    ) last_msg ON true
   WHERE c.channel_type = 'direct'
     AND COALESCE(c.is_archived, false) = false
   ORDER BY COALESCE(last_msg.created_at, c.created_at) DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_dm_inbox(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_user_dm_inbox(uuid) IS
  'Inbox for the caller: one row per direct-message channel with counterpart profile, last message, unread count and optional appointment link.';

-- ---------------------------------------------------------------
-- mark_channel_read
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_channel_read(p_channel_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE chat_participants
     SET last_read_at = now(),
         last_active_at = now()
   WHERE channel_id = p_channel_id
     AND user_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_channel_read(uuid) TO authenticated;

COMMENT ON FUNCTION public.mark_channel_read(uuid) IS
  'Mark all messages in a channel as read for the caller by bumping chat_participants.last_read_at.';
