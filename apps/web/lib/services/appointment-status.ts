"use client";

import { supabase } from "@/lib/supabase/client";

// =====================================================
// TIPOS Y CONSTANTES
// =====================================================

export type AppointmentStatus = 
  | "pendiente"
  | "confirmada"
  | "en_espera"
  | "en_consulta"
  | "completada"
  | "no_asistio"
  | "cancelada"
  | "rechazada";

export interface StatusTransition {
  from: AppointmentStatus;
  to: AppointmentStatus;
  requiresReason?: boolean;
  action: string;
  icon: string;
  color: string;
  description: string;
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  en_espera: "En Espera",
  en_consulta: "En Consulta",
  completada: "Completada",
  no_asistio: "No Asistió",
  cancelada: "Cancelada",
  rechazada: "Rechazada",
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmada: "bg-blue-100 text-blue-800 border-blue-300",
  en_espera: "bg-purple-100 text-purple-800 border-purple-300",
  en_consulta: "bg-indigo-100 text-indigo-800 border-indigo-300",
  completada: "bg-green-100 text-green-800 border-green-300",
  no_asistio: "bg-orange-100 text-orange-800 border-orange-300",
  cancelada: "bg-red-100 text-red-800 border-red-300",
  rechazada: "bg-gray-100 text-gray-800 border-gray-300",
};

export const STATUS_ICONS: Record<AppointmentStatus, string> = {
  pendiente: "Clock",
  confirmada: "CheckCircle",
  en_espera: "Users",
  en_consulta: "Activity",
  completada: "CheckCircle2",
  no_asistio: "UserX",
  cancelada: "XCircle",
  rechazada: "Ban",
};

// =====================================================
// FUNCIONES PRINCIPALES
// =====================================================

export async function changeAppointmentStatus(
  appointmentId: string,
  newStatus: AppointmentStatus,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string; old_status?: string; new_status?: string }> {
  try {
    const { data, error } = await supabase.rpc("change_appointment_status", {
      p_appointment_id: appointmentId,
      p_new_status: newStatus,
      p_user_id: userId,
      p_reason: reason || null,
    });

    if (error) {
      console.error("Error changing appointment status:", error);
      return { success: false, error: error.message };
    }

    return data as { success: boolean; error?: string; old_status?: string; new_status?: string };
  } catch (err) {
    console.error("Exception changing appointment status:", err);
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function getTodayAppointments(doctorId: string, date?: Date) {
  try {
    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString().split("T")[0];

    const { data, error } = await supabase.rpc("get_today_appointments", {
      p_doctor_id: doctorId,
      p_date: dateStr,
    });

    if (error) {
      console.error("Error getting today appointments:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Exception getting today appointments:", err);
    return { data: null, error: err };
  }
}

export async function autoUpdateAppointmentStatus() {
  try {
    const { data, error } = await supabase.rpc("auto_update_appointment_status");

    if (error) {
      console.error("Error auto-updating appointments:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Exception auto-updating appointments:", err);
    return { success: false, error: err };
  }
}

export async function getAppointmentStatusHistory(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointment_status_history")
      .select(`
        *,
        changed_by_user:profiles!appointment_status_history_changed_by_fkey(
          nombre_completo,
          avatar_url
        )
      `)
      .eq("appointment_id", appointmentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error getting status history:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Exception getting status history:", err);
    return { data: null, error: err };
  }
}

export function getStatusColor(status: AppointmentStatus): string {
  return STATUS_COLORS[status] || STATUS_COLORS.pendiente;
}

export function getStatusLabel(status: AppointmentStatus): string {
  return STATUS_LABELS[status] || status;
}

export function getStatusIcon(status: AppointmentStatus): string {
  return STATUS_ICONS[status] || "Circle";
}

export async function getAppointmentStats(doctorId: string, startDate?: Date, endDate?: Date) {
  try {
    const start = startDate || new Date(new Date().setDate(1));
    const end = endDate || new Date();

    const { data, error } = await supabase
      .from("appointments")
      .select("status, id")
      .eq("medico_id", doctorId)
      .gte("fecha_hora", start.toISOString())
      .lte("fecha_hora", end.toISOString());

    if (error) {
      console.error("Error getting appointment stats:", error);
      return null;
    }

    const stats = data.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = data.length;
    const completadas = stats.completada || 0;
    const noAsistieron = stats.no_asistio || 0;
    const canceladas = stats.cancelada || 0;
    const tasaAsistencia = total > 0 ? ((completadas / (completadas + noAsistieron)) * 100).toFixed(1) : "0";
    const tasaCancelacion = total > 0 ? ((canceladas / total) * 100).toFixed(1) : "0";

    return {
      total,
      stats,
      metrics: {
        completadas,
        noAsistieron,
        canceladas,
        tasaAsistencia: parseFloat(tasaAsistencia),
        tasaCancelacion: parseFloat(tasaCancelacion),
      },
    };
  } catch (err) {
    console.error("Exception getting appointment stats:", err);
    return null;
  }
}
