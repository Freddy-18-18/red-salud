import { supabase } from "../../client";
import type {
  Appointment,
  CreateAppointmentData,
} from "./appointments.types";
import { getDoctorProfile } from "./appointments.queries";

// Create an appointment
export async function createAppointment(
  patientId: string,
  appointmentData: CreateAppointmentData
) {
  try {
    // Get doctor's price
    const { data: doctor } = await getDoctorProfile(appointmentData.doctor_id);

    // Combine date and time for the existing table
    const scheduledAt = `${appointmentData.appointment_date}T${appointmentData.appointment_time}`;

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: patientId,
        doctor_id: appointmentData.doctor_id,
        scheduled_at: scheduledAt,
        duration_minutes: doctor?.consultation_duration || 30,
        reason: appointmentData.reason || '',
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "appointment_created",
      description: `Appointment created with doctor for ${appointmentData.appointment_date}`,
      status: "success",
    });

    // Transform response to expected format
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      duration: data.duration_minutes,
      status: data.status === 'pending' ? 'pending' : data.status === 'confirmed' ? 'confirmed' : data.status === 'completed' ? 'completed' : 'cancelled',
      consultation_type: appointmentData.consultation_type,
      reason: data.reason,
      price: doctor?.consultation_price,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, error, data: null };
  }
}

// Cancel an appointment
export async function cancelAppointment(
  appointmentId: string,
  userId: string,
  reason?: string
) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: userId,
      activity_type: "appointment_cancelled",
      description: `Appointment cancelled: ${appointmentId}`,
      status: "success",
    });

    const scheduledAt = new Date(data.scheduled_at);
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      appointment_date: scheduledAt.toISOString().split('T')[0] ?? '',
      appointment_time: scheduledAt.toTimeString().split(' ')[0] ?? '',
      duration: data.duration_minutes,
      status: 'cancelled',
      consultation_type: 'video',
      reason: data.reason,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { success: false, error, data: null };
  }
}

// Confirm an appointment (doctor)
export async function confirmAppointment(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;

    const scheduledAt = new Date(data.scheduled_at);
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      appointment_date: scheduledAt.toISOString().split('T')[0] ?? '',
      appointment_time: scheduledAt.toTimeString().split(' ')[0] ?? '',
      duration: data.duration_minutes,
      status: 'confirmed',
      consultation_type: 'video',
      reason: data.reason,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error confirming appointment:", error);
    return { success: false, error, data: null };
  }
}

// Complete an appointment (doctor)
export async function completeAppointment(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "completed" })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;

    const scheduledAt = new Date(data.scheduled_at);
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      appointment_date: scheduledAt.toISOString().split('T')[0] ?? '',
      appointment_time: scheduledAt.toTimeString().split(' ')[0] ?? '',
      duration: data.duration_minutes,
      status: 'completed',
      consultation_type: 'video',
      reason: data.reason,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error completing appointment:", error);
    return { success: false, error, data: null };
  }
}
