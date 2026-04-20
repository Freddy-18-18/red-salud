import { supabase } from "@/lib/supabase/client";

// -------------------------------------------------------------------
// Paciente messaging service — unified on chat_channels / chat_messages
// -------------------------------------------------------------------
// Each doctor<->patient DM is modelled as a `chat_channels` row with
// channel_type='direct', joined to two `chat_participants`. All reads
// and writes go through three SECURITY DEFINER RPCs:
//   * get_or_create_dm_channel(user_a, user_b, appointment_id?)
//   * get_user_dm_inbox(user_id)
//   * mark_channel_read(channel_id)
//
// The exported function names are kept stable so the existing UI
// components keep compiling; we just populate the legacy field
// names (conversation_id, is_read, patient/doctor) from the new shape.
// -------------------------------------------------------------------

interface MessageSender {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

interface Message {
  id: string;
  conversation_id: string;        // alias for channel_id — kept for UI compat
  sender_id: string;
  content: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender?: MessageSender;
}

interface Conversation {
  id: string;                     // channel_id
  patient_id: string;
  doctor_id: string;
  appointment_id?: string | null;
  subject?: string;
  status: "active" | "archived";
  last_message_at?: string;
  created_at: string;
  unread_count?: number;
  last_message?: Message;
  patient?: MessageSender;
  doctor?: MessageSender;
  counterpart?: MessageSender;    // whoever is not the caller
}

interface CreateConversationData {
  doctor_id: string;
  subject?: string;
  initial_message: string;
  appointment_id?: string;
}

interface SendMessageData {
  conversation_id: string;        // alias for channel_id
  content: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
}

interface InboxRow {
  channel_id: string;
  counterpart_id: string;
  counterpart_name: string | null;
  counterpart_avatar: string | null;
  counterpart_role: string | null;
  last_message: string | null;
  last_message_at: string | null;
  last_sender_id: string | null;
  unread_count: number;
  appointment_id: string | null;
  channel_created_at: string;
}

// ─────────────────────────────────────────────────────────────────
// Inbox
// ─────────────────────────────────────────────────────────────────
export async function getUserConversations(userId: string) {
  try {
    const { data, error } = await supabase.rpc("get_user_dm_inbox", {
      p_user_id: userId,
    });
    if (error) throw error;

    const rows = (data ?? []) as InboxRow[];
    const conversations: Conversation[] = rows.map((r) => {
      const counterpart: MessageSender = {
        id: r.counterpart_id,
        full_name: r.counterpart_name ?? undefined,
        avatar_url: r.counterpart_avatar ?? undefined,
        role: r.counterpart_role ?? undefined,
      };
      const isPatient = (r.counterpart_role ?? "") !== "paciente";
      // When the caller is a patient, the counterpart is the doctor (and vice versa).
      return {
        id: r.channel_id,
        patient_id: isPatient ? userId : r.counterpart_id,
        doctor_id: isPatient ? r.counterpart_id : userId,
        appointment_id: r.appointment_id ?? null,
        status: "active",
        last_message_at: r.last_message_at ?? undefined,
        created_at: r.channel_created_at,
        unread_count: r.unread_count,
        counterpart,
        doctor: isPatient ? counterpart : undefined,
        patient: isPatient ? undefined : counterpart,
        last_message: r.last_message
          ? {
              id: `${r.channel_id}:last`,
              conversation_id: r.channel_id,
              sender_id: r.last_sender_id ?? "",
              content: r.last_message,
              is_read: r.unread_count === 0,
              created_at: r.last_message_at ?? r.channel_created_at,
            }
          : undefined,
      };
    });

    return { success: true, data: conversations };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { success: false, error, data: [] as Conversation[] };
  }
}

// ─────────────────────────────────────────────────────────────────
// Create / open a DM and optionally send an initial message
// ─────────────────────────────────────────────────────────────────
export async function createConversation(
  patientId: string,
  data: CreateConversationData,
) {
  try {
    const { data: channelId, error: rpcErr } = await supabase.rpc(
      "get_or_create_dm_channel",
      {
        p_user_a: patientId,
        p_user_b: data.doctor_id,
        p_appointment_id: data.appointment_id ?? null,
      },
    );
    if (rpcErr) throw rpcErr;
    const conversationId = channelId as string;

    const { data: inserted, error: msgErr } = await supabase
      .from("chat_messages")
      .insert({
        channel_id: conversationId,
        sender_id: patientId,
        content: data.initial_message,
        message_type: "text",
        is_phi: true,
      })
      .select("id")
      .single();
    if (msgErr) throw msgErr;

    return { success: true, data: { conversationId, messageId: inserted.id } };
  } catch (error) {
    console.error("Error creating conversation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      data: null,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// Fetch thread
// ─────────────────────────────────────────────────────────────────
export async function getConversationMessages(conversationId: string) {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select(
        `
        id,
        channel_id,
        sender_id,
        content,
        attachments,
        created_at,
        deleted_at,
        sender:profiles!chat_messages_sender_id_fkey (
          id, full_name, avatar_url, role
        )
        `,
      )
      .eq("channel_id", conversationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (error) throw error;

    const messages: Message[] = (data ?? []).map((row) => {
      const attach = Array.isArray(row.attachments) ? row.attachments[0] : undefined;
      return {
        id: row.id as string,
        conversation_id: row.channel_id as string,
        sender_id: row.sender_id as string,
        content: (row.content as string) ?? "",
        attachment_url: attach?.url,
        attachment_name: attach?.name,
        attachment_type: attach?.type,
        is_read: true, // computed from chat_participants.last_read_at at the inbox level
        created_at: row.created_at as string,
        sender: Array.isArray(row.sender) ? row.sender[0] : (row.sender as MessageSender | undefined),
      };
    });

    return { success: true, data: messages };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error, data: [] as Message[] };
  }
}

// ─────────────────────────────────────────────────────────────────
// Send a message
// ─────────────────────────────────────────────────────────────────
export async function sendMessage(
  userId: string,
  messageData: SendMessageData,
) {
  try {
    const attachments = messageData.attachment_url
      ? [
          {
            url: messageData.attachment_url,
            name: messageData.attachment_name,
            type: messageData.attachment_type,
          },
        ]
      : [];

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        channel_id: messageData.conversation_id,
        sender_id: userId,
        content: messageData.content,
        message_type: messageData.attachment_url ? "file" : "text",
        attachments,
        is_phi: true,
      })
      .select(
        `
        id,
        channel_id,
        sender_id,
        content,
        attachments,
        created_at,
        sender:profiles!chat_messages_sender_id_fkey (
          id, full_name, avatar_url, role
        )
        `,
      )
      .single();
    if (error) throw error;

    // Touch channel timestamp so the inbox sorts correctly.
    await supabase
      .from("chat_channels")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", messageData.conversation_id);

    const msg: Message = {
      id: data.id as string,
      conversation_id: data.channel_id as string,
      sender_id: data.sender_id as string,
      content: data.content as string,
      attachment_url: messageData.attachment_url,
      attachment_name: messageData.attachment_name,
      attachment_type: messageData.attachment_type,
      is_read: true,
      created_at: data.created_at as string,
      sender: Array.isArray(data.sender) ? data.sender[0] : (data.sender as MessageSender | undefined),
    };
    return { success: true, data: msg };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error, data: null };
  }
}

// ─────────────────────────────────────────────────────────────────
// Mark channel as read
// ─────────────────────────────────────────────────────────────────
export async function markMessagesAsRead(
  conversationId: string,
  _userId: string,
) {
  try {
    const { error } = await supabase.rpc("mark_channel_read", {
      p_channel_id: conversationId,
    });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, error };
  }
}

// ─────────────────────────────────────────────────────────────────
// Realtime subscription
// ─────────────────────────────────────────────────────────────────
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void,
) {
  const channel = supabase
    .channel(`chat:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `channel_id=eq.${conversationId}`,
      },
      async (payload) => {
        const newId = (payload.new as { id?: string })?.id;
        if (!newId) return;
        const { data } = await supabase
          .from("chat_messages")
          .select(
            `
            id, channel_id, sender_id, content, attachments, created_at,
            sender:profiles!chat_messages_sender_id_fkey (
              id, full_name, avatar_url, role
            )
            `,
          )
          .eq("id", newId)
          .maybeSingle();
        if (!data) return;
        const attach = Array.isArray(data.attachments) ? data.attachments[0] : undefined;
        onMessage({
          id: data.id as string,
          conversation_id: data.channel_id as string,
          sender_id: data.sender_id as string,
          content: (data.content as string) ?? "",
          attachment_url: attach?.url,
          attachment_name: attach?.name,
          attachment_type: attach?.type,
          is_read: false,
          created_at: data.created_at as string,
          sender: Array.isArray(data.sender) ? data.sender[0] : (data.sender as MessageSender | undefined),
        });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─────────────────────────────────────────────────────────────────
// Unread total across all DMs
// ─────────────────────────────────────────────────────────────────
export async function getUnreadMessagesCount(userId: string) {
  try {
    const { data, error } = await supabase.rpc("get_user_dm_inbox", {
      p_user_id: userId,
    });
    if (error) throw error;
    const rows = (data ?? []) as InboxRow[];
    const total = rows.reduce((acc, r) => acc + (r.unread_count ?? 0), 0);
    return { success: true, data: total };
  } catch (error) {
    console.error("Error getting unread count:", error);
    return { success: false, error, data: 0 };
  }
}
