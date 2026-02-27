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

/** Estados terminales – no admiten transiciones de salida */
export const TERMINAL_STATUSES: ReadonlySet<AppointmentStatus> = new Set([
  "completada",
  "no_asistio",
  "cancelada",
  "rechazada",
]);

/** Estados que el paciente puede ver (todo excepto borradores internos) */
export const PATIENT_VISIBLE_STATUSES: readonly AppointmentStatus[] = [
  "pendiente",
  "confirmada",
  "en_espera",
  "en_consulta",
  "completada",
  "no_asistio",
  "cancelada",
  "rechazada",
] as const;

export interface StatusTransition {
  from: AppointmentStatus;
  to: AppointmentStatus;
  requiresReason?: boolean;
  action: string;
  icon: string;
  color: string;
  description: string;
  /** Roles que pueden ejecutar esta transición */
  allowedRoles?: ("medico" | "secretaria" | "paciente" | "system")[];
}

// =====================================================
// MÁQUINA DE ESTADOS CANÓNICA
// =====================================================
// Flujo principal:
//   pendiente → confirmada → en_espera → en_consulta → completada
//
// Flujos laterales:
//   pendiente | confirmada | en_espera → cancelada  (médico/paciente, requiere razón)
//   pendiente → rechazada                           (médico, requiere razón)
//   pendiente | confirmada | en_espera → no_asistio (médico/system, automático)
// =====================================================

export const VALID_TRANSITIONS: readonly StatusTransition[] = [
  // --- Flujo principal ---
  {
    from: "pendiente",
    to: "confirmada",
    action: "Confirmar",
    icon: "CheckCircle",
    color: "bg-blue-600 hover:bg-blue-700 text-white",
    description: "Confirmar la cita con el paciente",
    allowedRoles: ["medico", "secretaria"],
  },
  {
    from: "confirmada",
    to: "en_espera",
    action: "Paciente llegó",
    icon: "Users",
    color: "bg-purple-600 hover:bg-purple-700 text-white",
    description: "El paciente llegó y está en sala de espera",
    allowedRoles: ["medico", "secretaria"],
  },
  {
    from: "en_espera",
    to: "en_consulta",
    action: "Iniciar consulta",
    icon: "Activity",
    color: "bg-indigo-600 hover:bg-indigo-700 text-white",
    description: "Comenzar la atención médica",
    allowedRoles: ["medico"],
  },
  {
    from: "en_consulta",
    to: "completada",
    action: "Finalizar consulta",
    icon: "CheckCircle2",
    color: "bg-green-600 hover:bg-green-700 text-white",
    description: "Consulta finalizada satisfactoriamente",
    allowedRoles: ["medico"],
  },

  // --- Cancelaciones (requieren razón) ---
  {
    from: "pendiente",
    to: "cancelada",
    requiresReason: true,
    action: "Cancelar",
    icon: "XCircle",
    color: "bg-red-600 hover:bg-red-700 text-white",
    description: "Cancelar la cita pendiente",
    allowedRoles: ["medico", "secretaria", "paciente"],
  },
  {
    from: "confirmada",
    to: "cancelada",
    requiresReason: true,
    action: "Cancelar",
    icon: "XCircle",
    color: "bg-red-600 hover:bg-red-700 text-white",
    description: "Cancelar la cita confirmada",
    allowedRoles: ["medico", "secretaria", "paciente"],
  },
  {
    from: "en_espera",
    to: "cancelada",
    requiresReason: true,
    action: "Cancelar",
    icon: "XCircle",
    color: "bg-red-600 hover:bg-red-700 text-white",
    description: "Cancelar la cita (paciente en espera)",
    allowedRoles: ["medico", "secretaria"],
  },

  // --- Rechazo (solo desde pendiente) ---
  {
    from: "pendiente",
    to: "rechazada",
    requiresReason: true,
    action: "Rechazar",
    icon: "Ban",
    color: "bg-gray-600 hover:bg-gray-700 text-white",
    description: "Rechazar la solicitud de cita",
    allowedRoles: ["medico"],
  },

  // --- No asistió ---
  {
    from: "pendiente",
    to: "no_asistio",
    action: "No asistió",
    icon: "UserX",
    color: "bg-orange-600 hover:bg-orange-700 text-white",
    description: "El paciente no se presentó a la cita",
    allowedRoles: ["medico", "secretaria", "system"],
  },
  {
    from: "confirmada",
    to: "no_asistio",
    action: "No asistió",
    icon: "UserX",
    color: "bg-orange-600 hover:bg-orange-700 text-white",
    description: "El paciente no se presentó a la cita confirmada",
    allowedRoles: ["medico", "secretaria", "system"],
  },
  {
    from: "en_espera",
    to: "no_asistio",
    action: "No asistió",
    icon: "UserX",
    color: "bg-orange-600 hover:bg-orange-700 text-white",
    description: "Marcar paciente como no asistido",
    allowedRoles: ["medico", "secretaria", "system"],
  },
] as const;

/**
 * Obtiene las transiciones disponibles para un estado y rol dados.
 */
export function getAvailableTransitions(
  currentStatus: AppointmentStatus,
  role: "medico" | "secretaria" | "paciente" | "system" = "medico"
): StatusTransition[] {
  return VALID_TRANSITIONS.filter(
    (t) =>
      t.from === currentStatus &&
      (!t.allowedRoles || t.allowedRoles.includes(role))
  );
}

/**
 * Valida si una transición de estado es permitida.
 */
export function isTransitionAllowed(
  from: AppointmentStatus,
  to: AppointmentStatus,
  role: "medico" | "secretaria" | "paciente" | "system" = "medico"
): boolean {
  return VALID_TRANSITIONS.some(
    (t) =>
      t.from === from &&
      t.to === to &&
      (!t.allowedRoles || t.allowedRoles.includes(role))
  );
}

// =====================================================
// LABELS, COLORS, ICONS
// =====================================================

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

/** Minutos de gracia después de la hora programada antes de marcar no_asistio */
export const NO_SHOW_GRACE_MINUTES = 30;

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
    // Try server-side RPC first
    const { data, error } = await supabase.rpc("auto_update_appointment_status");

    if (error) {
      console.error("Error auto-updating appointments:", error);
      // Fallback: client-side no_asistio marking
      return autoMarkNoShowClientSide();
    }

    return { success: true, data };
  } catch (err) {
    console.error("Exception auto-updating appointments:", err);
    return autoMarkNoShowClientSide();
  }
}

/**
 * Fallback: marca como no_asistio las citas cuya hora + gracia ya pasó.
 * Se ejecuta solo si la RPC del servidor no está disponible.
 */
async function autoMarkNoShowClientSide() {
  try {
    const cutoff = new Date(Date.now() - NO_SHOW_GRACE_MINUTES * 60_000).toISOString();

    const { data: overdue, error: fetchErr } = await supabase
      .from("appointments")
      .select("id")
      .in("status", ["pendiente", "confirmada"])
      .lt("fecha_hora", cutoff);

    if (fetchErr || !overdue?.length) {
      return { success: !fetchErr, data: [] };
    }

    const ids = overdue.map((a) => a.id);

    const { error: updateErr } = await supabase
      .from("appointments")
      .update({ status: "no_asistio" })
      .in("id", ids);

    if (updateErr) {
      console.error("Client-side no-show update failed:", updateErr);
      return { success: false, error: updateErr };
    }

    return { success: true, data: ids };
  } catch (err) {
    console.error("Client-side auto-mark failed:", err);
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
