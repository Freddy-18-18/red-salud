/**
 * @file checkin-service.ts
 * @description Digital check-in & waiting room management.
 *   Handles patient arrival, queue position, SDK notifications to patient app,
 *   and real-time queue updates.
 */

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CheckinMethod = "manual" | "qr_code" | "patient_app" | "kiosk";
export type AppointmentStatus = "pendiente" | "confirmada" | "en_espera" | "en_consulta" | "completada" | "cancelada" | "no_asistio";

export interface CheckinEntry {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string | null;
  checkin_method: CheckinMethod;
  checkin_at: string;
  called_in_at: string | null;
  seated_at: string | null;
  completed_at: string | null;
  queue_position: number | null;
  estimated_wait_mins: number | null;
  patient_notified: boolean;
  notes: string | null;
  created_at: string;
  // Joined
  appointment?: {
    id: string;
    fecha_hora: string;
    duracion_minutos: number;
    motivo: string | null;
    tipo_cita: string | null;
    paciente_id: string | null;
    paciente?: { nombre_completo: string; telefono: string | null; avatar_url: string | null } | null;
  };
}

export interface WaitingRoomEntry {
  appointment_id: string;
  checkin_id: string | null;
  patient_name: string;
  patient_avatar: string | null;
  appointment_time: string;
  motivo: string | null;
  tipo_cita: string | null;
  status: AppointmentStatus;
  checkin_at: string | null;
  queue_position: number | null;
  estimated_wait_mins: number | null;
  wait_elapsed_mins: number;
}

export interface WaitingRoomStats {
  total_today: number;
  checked_in: number;
  in_consultation: number;
  completed: number;
  avg_wait_mins: number;
  avg_consultation_mins: number;
  on_time_rate_pct: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK-IN OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check in a patient for their appointment.
 * Updates appointment status to 'en_espera' and records checkin timestamp.
 */
export async function checkInPatient(
  appointmentId: string,
  doctorId: string,
  options: {
    method?: CheckinMethod;
    patientId?: string | null;
    notes?: string;
  } = {}
): Promise<{ data: CheckinEntry | null; error: string | null }> {
  // 1. Get current queue to compute position
  const { data: existingQueue } = await supabase
    .from("appointment_checkin")
    .select("queue_position")
    .eq("doctor_id", doctorId)
    .is("called_in_at", null)
    .order("checkin_at", { ascending: true });

  const nextPosition = (existingQueue?.length ?? 0) + 1;

  // 2. Create check-in record
  const { data: checkin, error: checkinErr } = await supabase
    .from("appointment_checkin")
    .insert({
      appointment_id: appointmentId,
      doctor_id: doctorId,
      patient_id: options.patientId ?? null,
      checkin_method: options.method ?? "manual",
      queue_position: nextPosition,
      estimated_wait_mins: nextPosition * 20, // rough estimate: 20 min per patient
      notes: options.notes ?? null,
    })
    .select()
    .single();

  if (checkinErr) return { data: null, error: checkinErr.message };

  // 3. Update appointment status to en_espera
  await supabase
    .from("appointments")
    .update({
      status: "en_espera",
      checkin_at: new Date().toISOString(),
      checkin_method: options.method === "qr_code" ? "qr" : options.method ?? "manual",
    })
    .eq("id", appointmentId);

  return { data: checkin as CheckinEntry, error: null };
}

/**
 * Call patient into the consultation room.
 * Updates appointment status to 'en_consulta' and records the call time.
 * Also records actual start time for duration tracking.
 */
export async function callPatientIn(
  appointmentId: string,
  checkinId: string
): Promise<{ error: string | null }> {
  const now = new Date().toISOString();

  await Promise.all([
    supabase
      .from("appointment_checkin")
      .update({ called_in_at: now, seated_at: now })
      .eq("id", checkinId),
    supabase
      .from("appointments")
      .update({ status: "en_consulta", started_at: now })
      .eq("id", appointmentId),
  ]);

  return { error: null };
}

/**
 * Complete a consultation.
 * Updates status to 'completada' and records end time for actual duration.
 */
export async function completeConsultation(
  appointmentId: string,
  checkinId: string | null
): Promise<{ error: string | null }> {
  const now = new Date().toISOString();

  // Get started_at to compute actual duration
  const { data: apt } = await supabase
    .from("appointments")
    .select("started_at, duracion_minutos")
    .eq("id", appointmentId)
    .single();

  let actualDuration: number | null = null;
  if (apt?.started_at) {
    actualDuration = Math.round(
      (new Date(now).getTime() - new Date(apt.started_at).getTime()) / 60000
    );
  }

  await Promise.all([
    checkinId
      ? supabase
          .from("appointment_checkin")
          .update({ completed_at: now })
          .eq("id", checkinId)
      : Promise.resolve(),
    supabase
      .from("appointments")
      .update({
        status: "completada",
        ended_at: now,
        actual_duration_minutes: actualDuration,
      })
      .eq("id", appointmentId),
  ]);

  return { error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// WAITING ROOM QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export async function getWaitingRoom(
  doctorId: string,
  officeId?: string | null
): Promise<{ data: WaitingRoomEntry[]; stats: WaitingRoomStats; error: string | null }> {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  let query = supabase
    .from("appointments")
    .select(`
      id,
      fecha_hora,
      duracion_minutos,
      motivo,
      tipo_cita,
      status,
      paciente_id,
      started_at,
      ended_at,
      actual_duration_minutes,
      location_id,
      paciente:profiles!appointments_paciente_id_fkey(nombre_completo, avatar_url, telefono),
      checkin:appointment_checkin(id, checkin_at, called_in_at, queue_position, estimated_wait_mins, checkin_method)
    `)
    .eq("medico_id", doctorId)
    .gte("fecha_hora", startOfDay)
    .lt("fecha_hora", endOfDay)
    .not("status", "eq", "cancelada")
    .order("fecha_hora", { ascending: true });

  if (officeId) query = query.eq("location_id", officeId);

  const { data: apts, error } = await query;
  if (error) return { data: [], stats: emptyStats(), error: error.message };

  const now = Date.now();
  const entries: WaitingRoomEntry[] = (apts ?? []).map((apt) => {
    const checkin = Array.isArray(apt.checkin) ? apt.checkin[0] : apt.checkin;
    const patient = Array.isArray(apt.paciente) ? apt.paciente[0] : apt.paciente;
    const waitElapsed = checkin?.checkin_at
      ? Math.round((now - new Date(checkin.checkin_at).getTime()) / 60000)
      : 0;

    return {
      appointment_id:      apt.id,
      checkin_id:          checkin?.id ?? null,
      patient_name:        patient?.nombre_completo ?? "Paciente",
      patient_avatar:      patient?.avatar_url ?? null,
      appointment_time:    apt.fecha_hora,
      motivo:              apt.motivo,
      tipo_cita:           apt.tipo_cita,
      status:              apt.status as AppointmentStatus,
      checkin_at:          checkin?.checkin_at ?? null,
      queue_position:      checkin?.queue_position ?? null,
      estimated_wait_mins: checkin?.estimated_wait_mins ?? null,
      wait_elapsed_mins:   waitElapsed,
    };
  });

  const stats = computeWaitingRoomStats(apts ?? []);
  return { data: entries, stats, error: null };
}

function emptyStats(): WaitingRoomStats {
  return {
    total_today: 0,
    checked_in: 0,
    in_consultation: 0,
    completed: 0,
    avg_wait_mins: 0,
    avg_consultation_mins: 0,
    on_time_rate_pct: 0,
  };
}

function computeWaitingRoomStats(
  apts: Array<{
    status: string;
    fecha_hora: string;
    started_at?: string | null;
    ended_at?: string | null;
    actual_duration_minutes?: number | null;
  }>
): WaitingRoomStats {
  const total = apts.length;
  const checkedIn    = apts.filter((a) => a.status === "en_espera").length;
  const inConsult    = apts.filter((a) => a.status === "en_consulta").length;
  const completed    = apts.filter((a) => a.status === "completada").length;

  const actualDurations = apts
    .filter((a) => a.actual_duration_minutes != null)
    .map((a) => a.actual_duration_minutes as number);

  const avgConsultation = actualDurations.length
    ? Math.round(actualDurations.reduce((s, v) => s + v, 0) / actualDurations.length)
    : 0;

  // On-time = appointment started within 15 min of scheduled time
  const startedApts = apts.filter((a) => a.started_at);
  const onTime = startedApts.filter((a) => {
    const delay = (new Date(a.started_at!).getTime() - new Date(a.fecha_hora).getTime()) / 60000;
    return Math.abs(delay) <= 15;
  }).length;

  return {
    total_today: total,
    checked_in: checkedIn,
    in_consultation: inConsult,
    completed,
    avg_wait_mins: 0, // requires checkin data join
    avg_consultation_mins: avgConsultation,
    on_time_rate_pct: startedApts.length ? Math.round((onTime / startedApts.length) * 100) : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// QR TOKEN
// ─────────────────────────────────────────────────────────────────────────────

export async function generateCheckinToken(appointmentId: string): Promise<string | null> {
  const { data } = await supabase
    .rpc("generate_checkin_token", { p_appointment_id: appointmentId });
  return data as string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// REALTIME
// ─────────────────────────────────────────────────────────────────────────────

export function subscribeToWaitingRoom(
  doctorId: string,
  onUpdate: () => void
) {
  return supabase
    .channel(`waiting-room-${doctorId}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "appointments",
      filter: `medico_id=eq.${doctorId}`,
    }, onUpdate)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "appointment_checkin",
      filter: `doctor_id=eq.${doctorId}`,
    }, onUpdate)
    .subscribe();
}
