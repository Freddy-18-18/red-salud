import { supabase } from "../../client";
import type {
  Appointment,
  CreateAppointmentData,
} from "./appointments.types";
import { getDoctorProfile } from "./appointments.queries";

// Crear una cita
export async function createAppointment(
  patientId: string,
  appointmentData: CreateAppointmentData
) {
  try {
    // Obtener precio del doctor
    const { data: doctor } = await getDoctorProfile(appointmentData.doctor_id);

    // Combinar fecha y hora para la tabla existente
    const fechaHora = `${appointmentData.appointment_date}T${appointmentData.appointment_time}`;

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        paciente_id: patientId,
        medico_id: appointmentData.doctor_id,
        fecha_hora: fechaHora,
        duracion_minutos: doctor?.consultation_duration || 30,
        motivo: appointmentData.reason || '',
        status: "pendiente",
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "appointment_created",
      description: `Cita creada con doctor para ${appointmentData.appointment_date}`,
      status: "success",
    });

    // Transformar respuesta al formato esperado
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.paciente_id,
      doctor_id: data.medico_id,
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      duration: data.duracion_minutos,
      status: data.status === 'pendiente' ? 'pending' : data.status === 'confirmada' ? 'confirmed' : data.status === 'completada' ? 'completed' : 'cancelled',
      consultation_type: appointmentData.consultation_type,
      reason: data.motivo,
      price: doctor?.tarifa_consulta,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, error, data: null };
  }
}

// Cancelar una cita
export async function cancelAppointment(
  appointmentId: string,
  userId: string,
  reason?: string
) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "cancelada",
        notas: reason ? `Cancelada: ${reason}` : 'Cancelada',
      })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: userId,
      activity_type: "appointment_cancelled",
      description: `Cita cancelada: ${appointmentId}`,
      status: "success",
    });

    const fechaHora = new Date(data.fecha_hora);
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.paciente_id,
      doctor_id: data.medico_id,
      appointment_date: fechaHora.toISOString().split('T')[0],
      appointment_time: fechaHora.toTimeString().split(' ')[0],
      duration: data.duracion_minutos,
      status: 'cancelled',
      consultation_type: 'video',
      reason: data.motivo,
      notes: data.notas,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { success: false, error, data: null };
  }
}

// Confirmar una cita (doctor)
export async function confirmAppointment(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "confirmada" })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;
    
    const fechaHora = new Date(data.fecha_hora);
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.paciente_id,
      doctor_id: data.medico_id,
      appointment_date: fechaHora.toISOString().split('T')[0],
      appointment_time: fechaHora.toTimeString().split(' ')[0],
      duration: data.duracion_minutos,
      status: 'confirmed',
      consultation_type: 'video',
      reason: data.motivo,
      notes: data.notas,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error confirming appointment:", error);
    return { success: false, error, data: null };
  }
}

// Completar una cita (doctor)
export async function completeAppointment(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "completada" })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;
    
    const fechaHora = new Date(data.fecha_hora);
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.paciente_id,
      doctor_id: data.medico_id,
      appointment_date: fechaHora.toISOString().split('T')[0],
      appointment_time: fechaHora.toTimeString().split(' ')[0],
      duration: data.duracion_minutos,
      status: 'completed',
      consultation_type: 'video',
      reason: data.motivo,
      notes: data.notas,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error completing appointment:", error);
    return { success: false, error, data: null };
  }
}
