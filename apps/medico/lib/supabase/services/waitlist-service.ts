/**
 * Servicio para Lista de Espera Inteligente (smart_waitlist)
 *
 * Cubre: fetch, create, update status, delete y conteo en tiempo real.
 */

import { createClient } from "@/lib/supabase/client";
import type { WaitlistEntry } from "@/types/dental";

const supabase = createClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convierte una fila de Supabase al tipo WaitlistEntry del frontend */
function rowToEntry(row: Record<string, unknown>): WaitlistEntry {
  return {
    id: row.id as string,
    patientId: (row.patient_id as string) ?? "",
    patientName: (row.resolved_name ?? row.patient_name) as string,
    patientPhone: (row.resolved_phone ?? row.patient_phone ?? "") as string,
    procedureType: row.procedure_type as string,
    estimatedDuration: row.estimated_duration as number,
    priority: row.priority as WaitlistEntry["priority"],
    preferredDays: (row.preferred_days as string[]) ?? [],
    preferredTimeStart: row.preferred_time_start
      ? (row.preferred_time_start as string).slice(0, 5) // "08:00:00" → "08:00"
      : undefined,
    preferredTimeEnd: row.preferred_time_end
      ? (row.preferred_time_end as string).slice(0, 5)
      : undefined,
    status: row.status as WaitlistEntry["status"],
    notifiedAt: row.notified_at as string | undefined,
    confirmedAt: row.confirmed_at as string | undefined,
    notes: (row.notes as string) ?? "",
    createdAt: row.created_at as string,
    // Campos dentales
    procedureCode: row.procedure_code as string | undefined,
    toothNumbers: (row.tooth_numbers as number[]) ?? undefined,
    requiresAnesthesia: (row.requires_anesthesia as boolean) ?? undefined,
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Obtiene todos los registros de la lista de espera de un médico.
 * Si se pasa `officeId` sólo trae los de ese consultorio.
 */
export async function getWaitlistEntries(
  doctorId: string,
  officeId?: string | null
): Promise<{ data: WaitlistEntry[]; error: string | null }> {
  let query = supabase
    .from("waitlist_with_patient")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("priority", { ascending: true }) // urgent=urgent sorts handled by client
    .order("created_at", { ascending: true });

  if (officeId) {
    query = query.eq("office_id", officeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[waitlist-service] getWaitlistEntries:", error.message);
    return { data: [], error: error.message };
  }

  return {
    data: (data ?? []).map((row) => rowToEntry(row as Record<string, unknown>)),
    error: null,
  };
}

/**
 * Devuelve sólo el conteo de entradas activas (waiting + notified)
 * para usar en el badge del tab.
 */
export async function getActiveWaitlistCount(doctorId: string): Promise<number> {
  const { count, error } = await supabase
    .from("smart_waitlist")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", doctorId)
    .in("status", ["waiting", "notified"]);

  if (error) return 0;
  return count ?? 0;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface CreateWaitlistInput {
  doctorId: string;
  patientId?: string;        // UUID registrado (auth.users)
  offlinePatientId?: string; // UUID offline_patients
  officeId?: string;
  patientName: string;
  patientPhone: string;
  procedureType: string;
  estimatedDuration: number;
  priority: WaitlistEntry["priority"];
  preferredDays?: string[];
  preferredTimeStart?: string;
  preferredTimeEnd?: string;
  notes?: string;
  // Campos dentales
  procedureCode?: string;
  toothNumbers?: number[];
  requiresAnesthesia?: boolean;
}

export async function createWaitlistEntry(
  input: CreateWaitlistInput
): Promise<{ data: WaitlistEntry | null; error: string | null }> {
  const { data, error } = await supabase
    .from("smart_waitlist")
    .insert({
      doctor_id: input.doctorId,
      patient_id: input.patientId ?? null,
      offline_patient_id: input.offlinePatientId ?? null,
      office_id: input.officeId ?? null,
      patient_name: input.patientName,
      patient_phone: input.patientPhone,
      procedure_type: input.procedureType,
      estimated_duration: input.estimatedDuration,
      priority: input.priority,
      preferred_days: input.preferredDays ?? [],
      preferred_time_start: input.preferredTimeStart ?? null,
      preferred_time_end: input.preferredTimeEnd ?? null,
      notes: input.notes ?? "",
      procedure_code: input.procedureCode ?? null,
      tooth_numbers: input.toothNumbers ?? [],
      requires_anesthesia: input.requiresAnesthesia ?? false,
      status: "waiting",
    })
    .select()
    .single();

  if (error) {
    console.error("[waitlist-service] createWaitlistEntry:", error.message);
    return { data: null, error: error.message };
  }

  return { data: rowToEntry(data as Record<string, unknown>), error: null };
}

export async function notifyWaitlistEntry(
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("smart_waitlist")
    .update({ status: "notified", notified_at: new Date().toISOString() })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function confirmWaitlistEntry(
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("smart_waitlist")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function cancelWaitlistEntry(
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("smart_waitlist")
    .update({ status: "cancelled" })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function deleteWaitlistEntry(
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("smart_waitlist")
    .delete()
    .eq("id", id);

  return { error: error?.message ?? null };
}

/**
 * Busca pacientes (registrados + offline) disponibles del médico
 * para el selector en el formulario de agregar a lista de espera.
 */
export async function getDoctorPatientsForWaitlist(doctorId: string) {
  const [registered, offline] = await Promise.all([
    supabase
      .from("doctor_patients")
      .select(
        "patient_id, patient:profiles!doctor_patients_patient_id_fkey(id, nombre_completo, telefono, cedula)"
      )
      .eq("doctor_id", doctorId),
    supabase
      .from("offline_patients")
      .select("id, nombre_completo, telefono, cedula")
      .eq("doctor_id", doctorId)
      .eq("status", "offline"),
  ]);

  type RegisteredRow = {
    patient_id: string;
    patient: { id: string; nombre_completo: string; telefono: string | null; cedula: string | null } | null;
  };

  const registeredPatients = (
    (registered.data as unknown as RegisteredRow[]) ?? []
  )
    .filter((r) => r.patient)
    .map((r) => ({
      id: r.patient!.id,
      name: r.patient!.nombre_completo,
      phone: r.patient!.telefono ?? "",
      type: "registered" as const,
      cedula: r.patient!.cedula,
    }));

  type OfflineRow = { id: string; nombre_completo: string; telefono: string | null; cedula: string | null };
  const offlinePatients = ((offline.data as OfflineRow[]) ?? []).map((op) => ({
    id: op.id,
    name: op.nombre_completo,
    phone: op.telefono ?? "",
    type: "offline" as const,
    cedula: op.cedula,
  }));

  return [...registeredPatients, ...offlinePatients];
}
