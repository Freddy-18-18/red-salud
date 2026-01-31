import { supabase } from "../../client";
import type {
  TelemedicineSession,
  TelemedicineParticipant,
  TelemedicineChatMessage,
  TelemedicinePrescription,
  WaitingRoomEntry,
  CreateSessionData,
  UpdateSessionData,
  CreatePrescriptionData,
  SendMessageData,
  JoinSessionData,
} from "./telemedicine.types";

// Crear una sesión de telemedicina
export async function createTelemedicineSession(
  patientId: string,
  sessionData: CreateSessionData
) {
  try {
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const roomName = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .insert({
        patient_id: patientId,
        doctor_id: sessionData.doctor_id,
        appointment_id: sessionData.appointment_id,
        session_token: sessionToken,
        room_name: roomName,
        scheduled_start_time: sessionData.scheduled_start_time,
        video_enabled: sessionData.video_enabled ?? true,
        audio_enabled: sessionData.audio_enabled ?? true,
        recording_enabled: sessionData.recording_enabled ?? false,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "telemedicine_session_created",
      description: `Sesión de telemedicina creada para ${sessionData.scheduled_start_time}`,
      status: "success",
    });

    return { success: true, data: data as TelemedicineSession };
  } catch (error) {
    console.error("Error creating telemedicine session:", error);
    return { success: false, error, data: null };
  }
}

// Actualizar una sesión
export async function updateSession(
  sessionId: string,
  updates: UpdateSessionData
) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .update(updates)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as TelemedicineSession };
  } catch (error) {
    console.error("Error updating session:", error);
    return { success: false, error, data: null };
  }
}

// Iniciar una sesión
export async function startSession(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .update({
        status: 'active',
        actual_start_time: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as TelemedicineSession };
  } catch (error) {
    console.error("Error starting session:", error);
    return { success: false, error, data: null };
  }
}

// Finalizar una sesión
export async function endSession(sessionId: string, notes?: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        session_notes: notes,
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as TelemedicineSession };
  } catch (error) {
    console.error("Error ending session:", error);
    return { success: false, error, data: null };
  }
}

// Unirse a una sesión
export async function joinSession(
  userId: string,
  joinData: JoinSessionData
) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_participants")
      .insert({
        session_id: joinData.session_id,
        user_id: userId,
        role: joinData.role,
        connection_status: 'connected',
        joined_at: new Date().toISOString(),
        video_enabled: joinData.video_enabled ?? true,
        audio_enabled: joinData.audio_enabled ?? true,
        device_info: joinData.device_info || {},
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as TelemedicineParticipant };
  } catch (error) {
    console.error("Error joining session:", error);
    return { success: false, error, data: null };
  }
}

// Salir de una sesión
export async function leaveSession(participantId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_participants")
      .update({
        connection_status: 'disconnected',
        left_at: new Date().toISOString(),
      })
      .eq("id", participantId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as TelemedicineParticipant };
  } catch (error) {
    console.error("Error leaving session:", error);
    return { success: false, error, data: null };
  }
}

// Enviar mensaje
export async function sendMessage(
  senderId: string,
  messageData: SendMessageData
) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_chat_messages")
      .insert({
        session_id: messageData.session_id,
        sender_id: senderId,
        message: messageData.message,
        message_type: messageData.message_type || 'text',
        file_url: messageData.file_url,
        file_name: messageData.file_name,
        file_size: messageData.file_size,
        file_type: messageData.file_type,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as TelemedicineChatMessage };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error, data: null };
  }
}

// Marcar mensajes como leídos
export async function markMessagesAsRead(sessionId: string, userId: string) {
  try {
    const { error } = await supabase
      .from("telemedicine_chat_messages")
      .update({ is_read: true })
      .eq("session_id", sessionId)
      .neq("sender_id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, error };
  }
}

// Crear receta
export async function createPrescription(
  doctorId: string,
  patientId: string,
  prescriptionData: CreatePrescriptionData
) {
  try {
    const prescriptionNumber = `RX-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { data, error } = await supabase
      .from("telemedicine_prescriptions")
      .insert({
        session_id: prescriptionData.session_id,
        patient_id: patientId,
        doctor_id: doctorId,
        prescription_number: prescriptionNumber,
        diagnosis: prescriptionData.diagnosis,
        medications: prescriptionData.medications,
        instructions: prescriptionData.instructions,
        notes: prescriptionData.notes,
        valid_until: prescriptionData.valid_until,
        signed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("user_activity_log").insert({
      user_id: doctorId,
      activity_type: "prescription_created",
      description: `Receta ${prescriptionNumber} creada para paciente`,
      status: "success",
    });

    return { success: true, data: data as TelemedicinePrescription };
  } catch (error) {
    console.error("Error creating prescription:", error);
    return { success: false, error, data: null };
  }
}

// Entrar a sala de espera
export async function enterWaitingRoom(
  patientId: string,
  sessionId: string,
  reasonForVisit?: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_waiting_room")
      .insert({
        session_id: sessionId,
        patient_id: patientId,
        reason_for_visit: reasonForVisit,
        priority: priority,
        status: 'waiting',
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from("telemedicine_sessions")
      .update({ status: 'waiting' })
      .eq("id", sessionId);

    return { success: true, data: data as WaitingRoomEntry };
  } catch (error) {
    console.error("Error entering waiting room:", error);
    return { success: false, error, data: null };
  }
}

// Admitir paciente a la sesión
export async function admitPatient(waitingRoomId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_waiting_room")
      .update({
        status: 'admitted',
        admitted_at: new Date().toISOString(),
      })
      .eq("id", waitingRoomId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as WaitingRoomEntry };
  } catch (error) {
    console.error("Error admitting patient:", error);
    return { success: false, error, data: null };
  }
}
