// ============================================================================
// Red Salud Messenger - Supabase Service Layer
// Handles all DB operations and real-time subscriptions
// ============================================================================

import { supabase } from "@/lib/supabase/client";
import type {
  Channel,
  ChannelType,
  Message,
  MessageType,
  Participant,
  UserProfile,
  UserPresence,
  PresenceStatus,
} from "./types";

// ============================================================================
// CHANNELS
// ============================================================================

/**
 * Get all channels the current user participates in
 * Updated to use RPC function that avoids RLS recursion
 */
export async function getUserChannels(userId: string): Promise<Channel[]> {
  try {
    if (!userId) {
      console.warn("getUserChannels called without userId");
      return [];
    }

    // Step 1: Use the RPC function to get user's channel IDs safely
    // This uses SECURITY DEFINER to bypass RLS recursion issues
    const { data: channelData, error: rpcError } = await supabase.rpc(
      "get_user_channel_ids"
    );

    if (rpcError) {
      console.error("Error fetching user channel IDs via RPC:", rpcError.message);
      // Fallback: try direct query (will fail if RLS policy is problematic)
      const { data: myParticipations, error: partError } = await supabase
        .from("chat_participants")
        .select("channel_id")
        .eq("user_id", userId)
        .eq("is_banned", false);

      if (partError) {
        console.error("Error fetching own participations:", partError.message);
        return [];
      }

      if (!myParticipations || myParticipations.length === 0) {
        return [];
      }
    } else {
      if (!channelData || channelData.length === 0) {
        return [];
      }
    }

    const channelIds = (
      channelData || ([] as Array<{ channel_id: string }>)
    ).map((p) => p.channel_id);

    // Step 2: Get channel data for these channel IDs
    const { data: channels, error: chanError } = await supabase
      .from("chat_channels")
      .select(`
        id,
        name,
        description,
        channel_type,
        workspace_id,
        category_id,
        primary_entity_id,
        avatar_url,
        is_archived,
        is_encrypted,
        is_read_only,
        created_at,
        updated_at,
        last_message_at
      `)
      .in("id", channelIds)
      .eq("is_archived", false)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (chanError) {
      console.error("Error fetching channels:", chanError.message);
      return [];
    }

    return (channels as Channel[]) || [];
  } catch (err) {
    console.error("Error in getUserChannels:", err);
    return [];
  }
}

/**
 * Get channel details with participants
 */
export async function getChannelWithParticipants(
  channelId: string
): Promise<{ channel: Channel; participants: Participant[] } | null> {
  try {
    const { data: channel, error: channelError } = await supabase
      .from("chat_channels")
      .select("*")
      .eq("id", channelId)
      .single();

    if (channelError || !channel) {
      console.error("Error loading channel:", channelError?.message);
      return null;
    }

    // Use the RPC function to get participants safely (avoids RLS recursion)
    const { data: participantData, error: partError } = await supabase.rpc(
      "get_channel_participants",
      { p_channel_id: channelId }
    );

    if (partError) {
      console.error("Error loading participants:", partError.message);
      return {
        channel,
        participants: [],
      };
    }

    // Map RPC response to Participant objects
    const normalized = (participantData || []).map((p: any) => ({
      id: p.id,
      channel_id: p.channel_id,
      user_id: p.user_id,
      role: p.role,
      presence_status: p.presence_status,
      notification_settings: p.notification_settings,
      permissions: p.permissions,
      joined_at: p.joined_at,
      last_read_at: p.last_read_at,
      is_muted: p.is_muted,
      is_banned: p.is_banned,
      profile: {
        id: p.user_id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        role: p.user_role,
        specialty: p.specialty,
      },
    })) as Participant[];

    return {
      channel,
      participants: normalized,
    };
  } catch (err) {
    console.error("Error in getChannelWithParticipants:", err);
    return null;
  }
}

/**
 * Create a direct message channel between two users
 */
export async function createDirectChannel(
  userId: string,
  otherUserId: string
): Promise<Channel | null> {
  try {
    // Simple approach: Don't check for existing DM due to RLS circular dependency
    // Instead, just create a new DM channel. Duplicate DMs don't hurt.
    
    // Create new DM channel
    const { data: newChannel, error } = await supabase
      .from("chat_channels")
      .insert({
        channel_type: "direct" as ChannelType,
        is_encrypted: true,
      })
      .select()
      .single();

    if (error || !newChannel) {
      console.error("Error creating channel:", error?.message);
      return null;
    }

    // Add both participants
    const { error: partError } = await supabase
      .from("chat_participants")
      .insert([
        {
          channel_id: newChannel.id,
          user_id: userId,
          role: "member",
          permissions: {
            can_send_messages: true,
            can_send_attachments: true,
            can_send_voice: true,
            can_video_call: true,
            can_invite: false,
            can_pin: true,
            can_manage: false,
          },
        },
        {
          channel_id: newChannel.id,
          user_id: otherUserId,
          role: "member",
          permissions: {
            can_send_messages: true,
            can_send_attachments: true,
            can_send_voice: true,
            can_video_call: true,
            can_invite: false,
            can_pin: true,
            can_manage: false,
          },
        },
      ]);

    if (partError) {
      console.error("Error adding participants:", partError.message);
      // Channel created but participants failed - still return it
      return newChannel;
    }

    return newChannel;
  } catch (err) {
    console.error("Error in createDirectChannel:", err);
    return null;
  }
}

/**
 * Create a group channel
 */
export async function createGroupChannel(
  name: string,
  creatorId: string,
  memberIds: string[],
  channelType: ChannelType = "group"
): Promise<Channel | null> {
  const { data: channel, error } = await supabase
    .from("chat_channels")
    .insert({
      channel_type: channelType,
      name,
      is_encrypted: true,
    })
    .select()
    .single();

  if (error || !channel) return null;

  const allMembers = [creatorId, ...memberIds.filter((id) => id !== creatorId)];
  await supabase.from("chat_participants").insert(
    allMembers.map((uid) => ({
      channel_id: channel.id,
      user_id: uid,
      role: uid === creatorId ? "owner" : "member",
      permissions: {
        can_send_messages: true,
        can_send_attachments: true,
        can_send_voice: true,
        can_video_call: true,
        can_invite: uid === creatorId,
        can_pin: uid === creatorId,
        can_manage: uid === creatorId,
      },
    }))
  );

  return channel;
}

// ============================================================================
// MESSAGES
// ============================================================================

/**
 * Fetch messages for a channel with pagination
 */
export async function getChannelMessages(
  channelId: string,
  limit = 50,
  before?: string
): Promise<Message[]> {
  let query = supabase
    .from("chat_messages")
    .select(`
      *,
      sender:sender_id (
        id,
        full_name,
        avatar_url,
        role,
        specialty
      ),
      reply_to:reply_to_id (
        id,
        content,
        sender_id,
        message_type,
        sender:sender_id (
          id,
          full_name
        )
      )
    `)
    .eq("channel_id", channelId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  // Reverse for display order (oldest first)
  return (data || []).reverse();
}

/**
 * Send a message
 */
export async function sendMessage(params: {
  channelId: string;
  senderId: string;
  content: string;
  messageType?: MessageType;
  replyToId?: string;
  threadRootId?: string;
  attachments?: unknown[];
  medicalContext?: Record<string, unknown>;
  priority?: string;
}): Promise<Message | null> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      channel_id: params.channelId,
      sender_id: params.senderId,
      content: params.content,
      message_type: params.messageType || "text",
      reply_to_id: params.replyToId,
      thread_root_id: params.threadRootId,
      attachments: params.attachments || [],
      medical_context: params.medicalContext,
      priority: params.priority || "normal",
      delivery_status: "sent",
    })
    .select(`
      *,
      sender:sender_id (
        id,
        full_name,
        avatar_url,
        role,
        specialty
      )
    `)
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }

  return data;
}

/**
 * Edit a message
 */
export async function editMessage(
  messageId: string,
  newContent: string
): Promise<boolean> {
  const { error } = await supabase
    .from("chat_messages")
    .update({
      content: newContent,
      edited_at: new Date().toISOString(),
      edit_count: 1, // incremented server-side ideally
    })
    .eq("id", messageId);

  return !error;
}

/**
 * Soft-delete a message
 */
export async function deleteMessage(
  messageId: string,
  deletedBy: string
): Promise<boolean> {
  const { error } = await supabase
    .from("chat_messages")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: deletedBy,
    })
    .eq("id", messageId);

  return !error;
}

/**
 * Add a reaction to a message
 */
export async function toggleReaction(
  messageId: string,
  userId: string,
  emoji: string
): Promise<boolean> {
  const { data: message } = await supabase
    .from("chat_messages")
    .select("reactions")
    .eq("id", messageId)
    .single();

  if (!message) return false;

  const reactions = (message.reactions || []) as Array<{
    emoji: string;
    user_ids: string[];
    count: number;
  }>;

  const existingIdx = reactions.findIndex((r) => r.emoji === emoji);
  if (existingIdx >= 0) {
    const reaction = reactions[existingIdx]!;
    const userIdx = reaction.user_ids.indexOf(userId);
    if (userIdx >= 0) {
      // Remove reaction
      reaction.user_ids.splice(userIdx, 1);
      reaction.count--;
      if (reaction.count === 0) {
        reactions.splice(existingIdx, 1);
      }
    } else {
      // Add user to existing reaction
      reaction.user_ids.push(userId);
      reaction.count++;
    }
  } else {
    // New reaction
    reactions.push({ emoji, user_ids: [userId], count: 1 });
  }

  const { error } = await supabase
    .from("chat_messages")
    .update({ reactions })
    .eq("id", messageId);

  return !error;
}

// ============================================================================
// READ RECEIPTS
// ============================================================================

/**
 * Mark messages as read
 */
export async function markChannelAsRead(
  channelId: string,
  userId: string
): Promise<void> {
  // Update participant's last_read_at
  await supabase
    .from("chat_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("channel_id", channelId)
    .eq("user_id", userId);
}

/**
 * Get unread count for a channel
 */
export async function getUnreadCount(
  channelId: string,
  userId: string
): Promise<number> {
  // Get the user's last read timestamp safely using RPC (avoids RLS recursion)
  const { data: lastReadAt, error: rpcError } = await supabase.rpc(
    "get_participant_last_read",
    { p_channel_id: channelId }
  );

  if (rpcError) {
    console.error("Error fetching last read timestamp:", rpcError.message);
    // Fallback to direct query - this might fail if RLS policy is problematic
    const { data: participant } = await supabase
      .from("chat_participants")
      .select("last_read_at")
      .eq("channel_id", channelId)
      .eq("user_id", userId)
      .single();

    if (!participant?.last_read_at) return 0;

    const { count } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("channel_id", channelId)
      .gt("created_at", participant.last_read_at)
      .neq("sender_id", userId)
      .is("deleted_at", null);

    return count || 0;
  }

  if (!lastReadAt) return 0;

  const { count } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("channel_id", channelId)
    .gt("created_at", lastReadAt)
    .neq("sender_id", userId)
    .is("deleted_at", null);

  return count || 0;
}

// ============================================================================
// TYPING INDICATORS
// ============================================================================

/**
 * Set typing indicator
 */
export async function setTypingIndicator(
  channelId: string,
  userId: string
): Promise<void> {
  await supabase.from("chat_typing_indicators").upsert(
    {
      channel_id: channelId,
      user_id: userId,
      last_typing_at: new Date().toISOString(),
    },
    { onConflict: "channel_id,user_id" }
  );
}

/**
 * Clear typing indicator
 */
export async function clearTypingIndicator(
  channelId: string,
  userId: string
): Promise<void> {
  await supabase
    .from("chat_typing_indicators")
    .delete()
    .eq("channel_id", channelId)
    .eq("user_id", userId);
}

// ============================================================================
// USER PRESENCE
// ============================================================================

/**
 * Update user presence status
 */
export async function updatePresence(
  userId: string,
  status: PresenceStatus,
  statusText?: string
): Promise<void> {
  await supabase.from("chat_user_presence").upsert(
    {
      user_id: userId,
      presence_status: status,
      status_text: statusText,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

/**
 * Get presence for multiple users
 */
export async function getUsersPresence(
  userIds: string[]
): Promise<UserPresence[]> {
  const { data } = await supabase
    .from("chat_user_presence")
    .select("*")
    .in("user_id", userIds);

  return data || [];
}

// ============================================================================
// CONTACTS / USERS
// ============================================================================

/**
 * Search users for new conversations
 */
export async function searchUsers(
  query: string,
  currentUserId: string,
  limit = 20
): Promise<UserProfile[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, specialty")
    .neq("id", currentUserId)
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(limit);

  return data || [];
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, specialty")
    .eq("id", userId)
    .single();

  return data;
}

// ============================================================================
// SEARCH MESSAGES
// ============================================================================

/**
 * Full-text search in messages
 */
export async function searchMessages(
  query: string,
  channelId?: string,
  limit = 30
): Promise<Message[]> {
  let dbQuery = supabase
    .from("chat_messages")
    .select(`
      *,
      sender:sender_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .textSearch("content", query, { type: "websearch", config: "spanish" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (channelId) {
    dbQuery = dbQuery.eq("channel_id", channelId);
  }

  const { data } = await dbQuery;
  return data || [];
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to new messages in a channel
 */
export function subscribeToMessages(
  channelId: string,
  onMessage: (message: Message) => void
) {
  return supabase
    .channel(`messages:${channelId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `channel_id=eq.${channelId}`,
      },
      async (payload) => {
        // Fetch the full message with sender info
        const { data } = await supabase
          .from("chat_messages")
          .select(`
            *,
            sender:sender_id (
              id,
              full_name,
              avatar_url,
              role,
              specialty
            )
          `)
          .eq("id", payload.new.id)
          .single();

        if (data) onMessage(data);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "chat_messages",
        filter: `channel_id=eq.${channelId}`,
      },
      async (payload) => {
        const { data } = await supabase
          .from("chat_messages")
          .select(`
            *,
            sender:sender_id (
              id,
              full_name,
              avatar_url,
              role,
              specialty
            )
          `)
          .eq("id", payload.new.id)
          .single();

        if (data) onMessage(data);
      }
    )
    .subscribe();
}

/**
 * Subscribe to typing indicators in a channel
 */
export function subscribeToTyping(
  channelId: string,
  onTyping: (userId: string, isTyping: boolean) => void
) {
  return supabase
    .channel(`typing:${channelId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_typing_indicators",
        filter: `channel_id=eq.${channelId}`,
      },
      (payload) => {
        if (payload.eventType === "DELETE") {
          onTyping(payload.old.user_id, false);
        } else {
          onTyping(payload.new.user_id, true);
        }
      }
    )
    .subscribe();
}

/**
 * Subscribe to channel list updates (new messages updating last_message_at)
 */
export function subscribeToChannelUpdates(
  userId: string,
  onUpdate: () => void
) {
  return supabase
    .channel(`channel_updates:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "chat_channels",
      },
      () => onUpdate()
    )
    .subscribe();
}
