import { supabase } from "@/lib/supabase/client";

// Types for telemedicine domain
export interface TelemedicineSession {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  status: "scheduled" | "waiting" | "in_progress" | "completed" | "cancelled" | "no_show";
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  duration_minutes?: number;
  meeting_url?: string;
  recording_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  doctor?: {
    id: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  appointment?: {
    id: string;
    motivo?: string;
    fecha_hora: string;
    duracion_minutos?: number;
  };
  doctor_detail?: {
    id: string;
    specialty_id?: string;
    specialty?: {
      id: string;
      name: string;
    };
  };
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
}

export interface SessionRating {
  session_id: string;
  rating: number;
  comment?: string;
}

// Get upcoming telemedicine sessions for a patient
export async function getUpcomingSessions(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .select(`
        *,
        doctor:profiles!telemedicine_sessions_doctor_id_fkey(
          id, full_name, email, avatar_url
        )
      `)
      .eq("patient_id", patientId)
      .in("status", ["scheduled", "waiting", "in_progress"])
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true });

    if (error) throw error;

    return { success: true, data: (data || []) as TelemedicineSession[] };
  } catch (error) {
    console.error("Error fetching upcoming sessions:", error);
    return { success: false, error, data: [] };
  }
}

// Get session history for a patient
export async function getSessionHistory(patientId: string, limit = 20) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .select(`
        *,
        doctor:profiles!telemedicine_sessions_doctor_id_fkey(
          id, full_name, email, avatar_url
        )
      `)
      .eq("patient_id", patientId)
      .in("status", ["completed", "cancelled", "no_show"])
      .order("scheduled_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: (data || []) as TelemedicineSession[] };
  } catch (error) {
    console.error("Error fetching session history:", error);
    return { success: false, error, data: [] };
  }
}

// Get a single session with full details
export async function getSessionDetail(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .select(`
        *,
        doctor:profiles!telemedicine_sessions_doctor_id_fkey(
          id, full_name, email, avatar_url
        )
      `)
      .eq("id", sessionId)
      .single();

    if (error) throw error;

    return { success: true, data: data as TelemedicineSession };
  } catch (error) {
    console.error("Error fetching session detail:", error);
    return { success: false, error, data: null };
  }
}

// Patient joins the waiting room
export async function joinWaitingRoom(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .update({ status: "waiting" })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as TelemedicineSession };
  } catch (error) {
    console.error("Error joining waiting room:", error);
    return { success: false, error, data: null };
  }
}

// Update session status
export async function updateSessionStatus(
  sessionId: string,
  status: TelemedicineSession["status"]
) {
  try {
    const updateData: Record<string, unknown> = { status };

    if (status === "in_progress") {
      updateData.started_at = new Date().toISOString();
    } else if (status === "completed") {
      updateData.ended_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as TelemedicineSession };
  } catch (error) {
    console.error("Error updating session status:", error);
    return { success: false, error, data: null };
  }
}

// Send a chat message during a session
export async function sendChatMessage(
  sessionId: string,
  senderId: string,
  content: string
) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_chat_messages")
      .insert({
        session_id: sessionId,
        sender_id: senderId,
        content,
      })
      .select(`
        *,
        sender:profiles!telemedicine_chat_messages_sender_id_fkey(
          id, full_name, avatar_url, role
        )
      `)
      .single();

    if (error) throw error;

    return { success: true, data: data as ChatMessage };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return { success: false, error, data: null };
  }
}

// Get chat messages for a session
export async function getChatMessages(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_chat_messages")
      .select(`
        *,
        sender:profiles!telemedicine_chat_messages_sender_id_fkey(
          id, full_name, avatar_url, role
        )
      `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return { success: true, data: (data || []) as ChatMessage[] };
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return { success: false, error, data: [] };
  }
}

// Rate a completed session
export async function rateSession(
  sessionId: string,
  patientId: string,
  rating: number,
  comment?: string
) {
  try {
    const { error } = await supabase
      .from("telemedicine_session_ratings")
      .upsert({
        session_id: sessionId,
        patient_id: patientId,
        rating,
        comment,
      });

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "telemedicine_rated",
      description: `Consulta virtual calificada: ${rating}/5`,
      status: "success",
    });

    return { success: true };
  } catch (error) {
    console.error("Error rating session:", error);
    return { success: false, error };
  }
}

// Subscribe to real-time session status changes
export function subscribeToSession(
  sessionId: string,
  onStatusChange: (session: TelemedicineSession) => void
) {
  const channel = supabase
    .channel(`telemedicine:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "telemedicine_sessions",
        filter: `id=eq.${sessionId}`,
      },
      async (payload) => {
        // Fetch full session with joins
        const { data } = await supabase
          .from("telemedicine_sessions")
          .select(`
            *,
            doctor:profiles!telemedicine_sessions_doctor_id_fkey(
              id, full_name, email, avatar_url
            )
          `)
          .eq("id", payload.new.id)
          .single();

        if (data) {
          onStatusChange(data as TelemedicineSession);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribe to real-time chat messages
export function subscribeToChatMessages(
  sessionId: string,
  onMessage: (message: ChatMessage) => void
) {
  const channel = supabase
    .channel(`telemedicine-chat:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "telemedicine_chat_messages",
        filter: `session_id=eq.${sessionId}`,
      },
      async (payload) => {
        const { data } = await supabase
          .from("telemedicine_chat_messages")
          .select(`
            *,
            sender:profiles!telemedicine_chat_messages_sender_id_fkey(
              id, full_name, avatar_url, role
            )
          `)
          .eq("id", payload.new.id)
          .single();

        if (data) {
          onMessage(data as ChatMessage);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
