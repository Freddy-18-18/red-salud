import { supabase } from "../../client";
import type {
  TelemedicineSession,
  TelemedicineParticipant,
  TelemedicineChatMessage,
  TelemedicinePrescription,
  WaitingRoomEntry,
  SessionStats,
} from "./telemedicine.types";

// Obtener sesiones del paciente
export async function getPatientSessions(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .select(`
        *,
        doctor:profiles!telemedicine_sessions_doctor_id_fkey(
          id,
          nombre_completo,
          email,
          avatar_url
        ),
        appointment:appointments(
          id,
          fecha_hora,
          motivo
        )
      `)
      .eq("patient_id", patientId)
      .order("scheduled_start_time", { ascending: false });

    if (error) throw error;

    const sessions = data?.map((session: any) => ({
      ...session,
      appointment: session.appointment ? {
        id: session.appointment.id,
        appointment_date: new Date(session.appointment.fecha_hora).toISOString().split('T')[0],
        appointment_time: new Date(session.appointment.fecha_hora).toTimeString().split(' ')[0],
        reason: session.appointment.motivo,
      } : undefined,
    })) || [];

    return { success: true, data: sessions as TelemedicineSession[] };
  } catch (error) {
    console.error("Error fetching patient sessions:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener sesiones del doctor
export async function getDoctorSessions(doctorId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .select(`
        *,
        patient:profiles!telemedicine_sessions_patient_id_fkey(
          id,
          nombre_completo,
          email,
          avatar_url
        ),
        appointment:appointments(
          id,
          fecha_hora,
          motivo
        )
      `)
      .eq("doctor_id", doctorId)
      .order("scheduled_start_time", { ascending: false });

    if (error) throw error;

    const sessions = data?.map((session: any) => ({
      ...session,
      appointment: session.appointment ? {
        id: session.appointment.id,
        appointment_date: new Date(session.appointment.fecha_hora).toISOString().split('T')[0],
        appointment_time: new Date(session.appointment.fecha_hora).toTimeString().split(' ')[0],
        reason: session.appointment.motivo,
      } : undefined,
    })) || [];

    return { success: true, data: sessions as TelemedicineSession[] };
  } catch (error) {
    console.error("Error fetching doctor sessions:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener una sesión específica
export async function getSession(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .select(`
        *,
        patient:profiles!telemedicine_sessions_patient_id_fkey(
          id,
          nombre_completo,
          email,
          avatar_url
        ),
        doctor:profiles!telemedicine_sessions_doctor_id_fkey(
          id,
          nombre_completo,
          email,
          avatar_url
        ),
        appointment:appointments(
          id,
          fecha_hora,
          motivo
        )
      `)
      .eq("id", sessionId)
      .single();

    if (error) throw error;

    const session = {
      ...data,
      appointment: data.appointment ? {
        id: data.appointment.id,
        appointment_date: new Date(data.appointment.fecha_hora).toISOString().split('T')[0],
        appointment_time: new Date(data.appointment.fecha_hora).toTimeString().split(' ')[0],
        reason: data.appointment.motivo,
      } : undefined,
    };

    return { success: true, data: session as TelemedicineSession };
  } catch (error) {
    console.error("Error fetching session:", error);
    return { success: false, error, data: null };
  }
}

// Obtener participantes de una sesión
export async function getSessionParticipants(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_participants")
      .select("*")
      .eq("session_id", sessionId)
      .order("joined_at");

    if (error) throw error;
    return { success: true, data: data as TelemedicineParticipant[] };
  } catch (error) {
    console.error("Error fetching participants:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener mensajes de una sesión
export async function getSessionMessages(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_chat_messages")
      .select(`
        *,
        sender:profiles!telemedicine_chat_messages_sender_id_fkey(
          id,
          nombre_completo,
          avatar_url
        )
      `)
      .eq("session_id", sessionId)
      .order("created_at");

    if (error) throw error;
    return { success: true, data: data as TelemedicineChatMessage[] };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener recetas del paciente
export async function getPatientPrescriptions(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_prescriptions")
      .select(`
        *,
        doctor:profiles!telemedicine_prescriptions_doctor_id_fkey(
          id,
          nombre_completo
        )
      `)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data as TelemedicinePrescription[] };
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener recetas de una sesión
export async function getSessionPrescriptions(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_prescriptions")
      .select(`
        *,
        doctor:profiles!telemedicine_prescriptions_doctor_id_fkey(
          id,
          nombre_completo
        )
      `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data as TelemedicinePrescription[] };
  } catch (error) {
    console.error("Error fetching session prescriptions:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener pacientes en sala de espera (para doctor)
export async function getWaitingRoomPatients(doctorId: string) {
  try {
    const { data, error } = await supabase
      .from("telemedicine_waiting_room")
      .select(`
        *,
        patient:profiles!telemedicine_waiting_room_patient_id_fkey(
          id,
          nombre_completo,
          avatar_url
        ),
        session:telemedicine_sessions!telemedicine_waiting_room_session_id_fkey(
          id,
          scheduled_start_time
        )
      `)
      .eq("status", "waiting")
      .order("priority", { ascending: false })
      .order("entered_at");

    if (error) throw error;

    const filtered = data?.filter((entry: any) => 
      entry.session?.doctor_id === doctorId
    ) || [];

    return { success: true, data: filtered as WaitingRoomEntry[] };
  } catch (error) {
    console.error("Error fetching waiting room:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener estadísticas de sesiones del paciente
export async function getPatientSessionStats(patientId: string): Promise<{ success: boolean; data: SessionStats | null; error?: any }> {
  try {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .select("status, duration_minutes")
      .eq("patient_id", patientId);

    if (error) throw error;

    const stats: SessionStats = {
      total_sessions: data?.length || 0,
      completed_sessions: data?.filter(s => s.status === 'completed').length || 0,
      cancelled_sessions: data?.filter(s => s.status === 'cancelled').length || 0,
      average_duration: 0,
      total_duration: 0,
    };

    const durations = data?.filter(s => s.duration_minutes).map(s => s.duration_minutes) || [];
    if (durations.length > 0) {
      stats.total_duration = durations.reduce((a, b) => a + b, 0);
      stats.average_duration = stats.total_duration / durations.length;
    }

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching session stats:", error);
    return { success: false, error, data: null };
  }
}
