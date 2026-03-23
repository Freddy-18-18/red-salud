import { supabase } from "@/lib/supabase/client";

// TODO: Import types from @red-salud/types once available
interface MessageSender {
  id: string;
  nombre_completo?: string;
  avatar_url?: string;
  role?: string;
}

interface Message {
  id: string;
  conversation_id: string;
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
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  subject?: string;
  status: "active" | "archived";
  last_message_at?: string;
  created_at: string;
  unread_count?: number;
  last_message?: Message;
  patient?: MessageSender;
  doctor?: MessageSender;
}

interface CreateConversationData {
  doctor_id: string;
  subject?: string;
  initial_message: string;
  appointment_id?: string;
}

interface SendMessageData {
  conversation_id: string;
  content: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
}

// Obtener todas las conversaciones de un usuario
export async function getUserConversations(userId: string) {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        *,
        patient:profiles!conversations_patient_id_fkey(
          id, nombre_completo, email, avatar_url
        ),
        doctor:profiles!conversations_doctor_id_fkey(
          id, nombre_completo, email, avatar_url
        )
      `)
      .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    const conversationsWithDetails = await Promise.all(
      (data || []).map(async (conv) => {
        const { count } = await supabase
          .from("messages_new")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("is_read", false)
          .neq("sender_id", userId);

        const { data: lastMessage } = await supabase
          .from("messages_new")
          .select(`
            *,
            sender:profiles!messages_new_sender_id_fkey(
              id, nombre_completo, avatar_url, role
            )
          `)
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        return {
          ...conv,
          unread_count: count || 0,
          last_message: lastMessage,
        };
      })
    );

    return {
      success: true,
      data: conversationsWithDetails as Conversation[],
    };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { success: false, error, data: [] };
  }
}

// Crear una nueva conversación
export async function createConversation(
  patientId: string,
  conversationData: CreateConversationData
) {
  try {
    // Check for existing active conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("patient_id", patientId)
      .eq("doctor_id", conversationData.doctor_id)
      .eq("status", "active")
      .maybeSingle();

    let conversationId: string;

    if (existing) {
      conversationId = existing.id;
    } else {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({
          patient_id: patientId,
          doctor_id: conversationData.doctor_id,
          appointment_id: conversationData.appointment_id,
          subject: conversationData.subject,
          status: "active",
        })
        .select()
        .single();

      if (convError) throw convError;
      conversationId = newConv.id;
    }

    // Send initial message
    const { data: message, error: msgError } = await supabase
      .from("messages_new")
      .insert({
        conversation_id: conversationId,
        sender_id: patientId,
        content: conversationData.initial_message,
      })
      .select()
      .single();

    if (msgError) throw msgError;

    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "conversation_created",
      description: `Nueva conversación con doctor`,
      status: "success",
    });

    return { success: true, data: { conversationId, message } };
  } catch (error) {
    console.error("Error creating conversation:", error);
    return { success: false, error, data: null };
  }
}

// Obtener mensajes de una conversación
export async function getConversationMessages(conversationId: string) {
  try {
    const { data, error } = await supabase
      .from("messages_new")
      .select(`
        *,
        sender:profiles!messages_new_sender_id_fkey(
          id, nombre_completo, avatar_url, role
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return { success: true, data: data as Message[] };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error, data: [] };
  }
}

// Enviar un mensaje
export async function sendMessage(
  userId: string,
  messageData: SendMessageData
) {
  try {
    const { data, error } = await supabase
      .from("messages_new")
      .insert({
        conversation_id: messageData.conversation_id,
        sender_id: userId,
        content: messageData.content,
        attachment_url: messageData.attachment_url,
        attachment_name: messageData.attachment_name,
        attachment_type: messageData.attachment_type,
      })
      .select(`
        *,
        sender:profiles!messages_new_sender_id_fkey(
          id, nombre_completo, avatar_url, role
        )
      `)
      .single();

    if (error) throw error;

    return { success: true, data: data as Message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error, data: null };
  }
}

// Marcar mensajes como leídos
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
) {
  try {
    const { error } = await supabase
      .from("messages_new")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("conversation_id", conversationId)
      .eq("is_read", false)
      .neq("sender_id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, error };
  }
}

// Suscribirse a nuevos mensajes en tiempo real
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages_new",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        const { data } = await supabase
          .from("messages_new")
          .select(`
            *,
            sender:profiles!messages_new_sender_id_fkey(
              id, nombre_completo, avatar_url, role
            )
          `)
          .eq("id", payload.new.id)
          .single();

        if (data) {
          onMessage(data as Message);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Obtener conteo total de mensajes no leídos
export async function getUnreadMessagesCount(userId: string) {
  try {
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`);

    if (!conversations || conversations.length === 0) {
      return { success: true, data: 0 };
    }

    const conversationIds = conversations.map((c) => c.id);

    const { count, error } = await supabase
      .from("messages_new")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .eq("is_read", false)
      .neq("sender_id", userId);

    if (error) throw error;

    return { success: true, data: count || 0 };
  } catch (error) {
    console.error("Error getting unread count:", error);
    return { success: false, error, data: 0 };
  }
}
