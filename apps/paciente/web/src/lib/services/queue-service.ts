import { supabase } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────

export type QueueStatus =
  | "waiting"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export interface QueueEntry {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  doctor_id: string | null;
  doctor_name: string | null;
  clinic_name: string | null;
  specialty: string | null;
  ticket_number: string;
  position: number;
  total_ahead: number;
  estimated_wait_minutes: number;
  status: QueueStatus;
  joined_at: string;
  called_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface JoinQueueData {
  appointment_id: string;
  doctor_id?: string;
  notes?: string;
}

// ─── Constants ───────────────────────────────────────────────────────

export const QUEUE_STATUS_CONFIG: Record<
  QueueStatus,
  { label: string; bg: string; text: string; description: string }
> = {
  waiting: {
    label: "En espera",
    bg: "bg-amber-50",
    text: "text-amber-700",
    description: "Estas en la cola virtual. Te notificaremos cuando sea tu turno.",
  },
  in_progress: {
    label: "En atencion",
    bg: "bg-blue-50",
    text: "text-blue-700",
    description: "Es tu turno. Dirigete a la consulta.",
  },
  completed: {
    label: "Atendido",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    description: "Tu consulta ha sido completada.",
  },
  cancelled: {
    label: "Cancelado",
    bg: "bg-red-50",
    text: "text-red-700",
    description: "Tu turno fue cancelado.",
  },
  no_show: {
    label: "No asistio",
    bg: "bg-gray-100",
    text: "text-gray-600",
    description: "No asististe cuando fue tu turno.",
  },
};

// ─── Service ─────────────────────────────────────────────────────────

export const queueService = {
  /**
   * Joins the queue for a specific appointment.
   */
  async joinQueue(
    patientId: string,
    data: JoinQueueData
  ): Promise<QueueEntry> {
    // Check if already in queue
    const { data: existing } = await supabase
      .from("appointment_queue")
      .select("id")
      .eq("patient_id", patientId)
      .eq("appointment_id", data.appointment_id)
      .in("status", ["waiting", "in_progress"])
      .maybeSingle();

    if (existing) {
      throw new Error("Ya estas en la cola para esta cita");
    }

    // Get current queue size for this doctor/clinic to calculate position
    const { count: queueSize } = await supabase
      .from("appointment_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "waiting");

    const position = (queueSize ?? 0) + 1;
    const ticketNumber = `T-${String(position).padStart(3, "0")}`;
    const estimatedWait = position * 15; // ~15 min per patient

    const { data: entry, error } = await supabase
      .from("appointment_queue")
      .insert({
        patient_id: patientId,
        appointment_id: data.appointment_id,
        doctor_id: data.doctor_id ?? null,
        ticket_number: ticketNumber,
        position,
        total_ahead: position - 1,
        estimated_wait_minutes: estimatedWait,
        status: "waiting" as QueueStatus,
        joined_at: new Date().toISOString(),
        notes: data.notes ?? null,
      })
      .select(
        `
        *,
        doctor:profiles!appointment_queue_doctor_id_fkey(full_name),
        appointment:appointments!appointment_queue_appointment_id_fkey(
          specialty,
          clinic_name
        )
      `
      )
      .single();

    if (error) {
      console.error("Error joining queue:", error);
      throw error;
    }

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "queue_joined",
      description: `Se unio a la cola virtual: turno ${ticketNumber}`,
      status: "success",
    });

    return normalizeQueueEntry(entry);
  },

  /**
   * Gets the current active queue entry (waiting or in_progress).
   */
  async getActiveQueue(patientId: string): Promise<QueueEntry | null> {
    const { data, error } = await supabase
      .from("appointment_queue")
      .select(
        `
        *,
        doctor:profiles!appointment_queue_doctor_id_fkey(full_name),
        appointment:appointments!appointment_queue_appointment_id_fkey(
          specialty,
          clinic_name
        )
      `
      )
      .eq("patient_id", patientId)
      .in("status", ["waiting", "in_progress"])
      .order("joined_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching active queue:", error);
      throw error;
    }

    if (!data) return null;

    // Refresh position: count how many are ahead of this entry
    const { count: aheadCount } = await supabase
      .from("appointment_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "waiting")
      .lt("joined_at", data.joined_at as string);

    const entry = normalizeQueueEntry(data);
    entry.total_ahead = aheadCount ?? entry.total_ahead;
    entry.position = (aheadCount ?? entry.position - 1) + 1;
    entry.estimated_wait_minutes = entry.total_ahead * 15;

    return entry;
  },

  /**
   * Gets queue position (lightweight polling query).
   */
  async getQueuePosition(
    queueId: string
  ): Promise<{ position: number; total_ahead: number; status: QueueStatus; estimated_wait_minutes: number }> {
    const { data, error } = await supabase
      .from("appointment_queue")
      .select("status, joined_at, position, total_ahead, estimated_wait_minutes")
      .eq("id", queueId)
      .single();

    if (error) {
      console.error("Error fetching queue position:", error);
      throw error;
    }

    const status = data.status as QueueStatus;

    if (status !== "waiting") {
      return {
        position: 0,
        total_ahead: 0,
        status,
        estimated_wait_minutes: 0,
      };
    }

    // Recalculate position
    const { count: aheadCount } = await supabase
      .from("appointment_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "waiting")
      .lt("joined_at", data.joined_at as string);

    const totalAhead = aheadCount ?? (Number(data.total_ahead) || 0);

    return {
      position: totalAhead + 1,
      total_ahead: totalAhead,
      status,
      estimated_wait_minutes: totalAhead * 15,
    };
  },

  /**
   * Gets queue history for the patient.
   */
  async getQueueHistory(patientId: string): Promise<QueueEntry[]> {
    const { data, error } = await supabase
      .from("appointment_queue")
      .select(
        `
        *,
        doctor:profiles!appointment_queue_doctor_id_fkey(full_name),
        appointment:appointments!appointment_queue_appointment_id_fkey(
          specialty,
          clinic_name
        )
      `
      )
      .eq("patient_id", patientId)
      .in("status", ["completed", "cancelled", "no_show"])
      .order("joined_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching queue history:", error);
      throw error;
    }

    return (data ?? []).map(normalizeQueueEntry);
  },

  /**
   * Cancels a queue entry.
   */
  async cancelQueue(queueId: string, patientId: string): Promise<void> {
    const { error } = await supabase
      .from("appointment_queue")
      .update({
        status: "cancelled" as QueueStatus,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", queueId)
      .eq("patient_id", patientId);

    if (error) {
      console.error("Error cancelling queue:", error);
      throw error;
    }

    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "queue_cancelled",
      description: "Cancelo su turno en la cola virtual",
      status: "success",
    });
  },
};

// ─── Normalizer ──────────────────────────────────────────────────────

function normalizeQueueEntry(raw: Record<string, unknown>): QueueEntry {
  const doctor = raw.doctor as Record<string, unknown> | null;
  const appointment = raw.appointment as Record<string, unknown> | null;

  return {
    id: raw.id as string,
    patient_id: raw.patient_id as string,
    appointment_id: (raw.appointment_id as string) ?? null,
    doctor_id: (raw.doctor_id as string) ?? null,
    doctor_name: (doctor?.full_name as string) ?? null,
    clinic_name: (appointment?.clinic_name as string) ?? null,
    specialty: (appointment?.specialty as string) ?? null,
    ticket_number: raw.ticket_number as string,
    position: Number(raw.position) || 0,
    total_ahead: Number(raw.total_ahead) || 0,
    estimated_wait_minutes: Number(raw.estimated_wait_minutes) || 0,
    status: raw.status as QueueStatus,
    joined_at: raw.joined_at as string,
    called_at: (raw.called_at as string) ?? null,
    completed_at: (raw.completed_at as string) ?? null,
    cancelled_at: (raw.cancelled_at as string) ?? null,
    notes: (raw.notes as string) ?? null,
    created_at: raw.created_at as string,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────

export function formatWaitTime(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function formatQueueDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
