/**
 * @file treatment-plan-service.ts
 * @description CRUD para planes de tratamiento (treatment_plan_series).
 *   Permite agrupar citas bajo un plan con sesiones y seguimiento financiero.
 */

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface TreatmentPlan {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  offline_patient_id: string | null;
  office_id: string | null;
  name: string;
  description: string | null;
  specialty_context: Record<string, unknown>;
  total_sessions: number;
  completed_sessions: number;
  tps_status: "active" | "paused" | "completed" | "cancelled";
  total_estimated_cost: number | null;
  total_actual_cost: number | null;
  insurance_coverage: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  appointments?: Array<{
    id: string;
    fecha_hora: string;
    status: string;
    motivo: string | null;
    treatment_plan_session: number | null;
  }>;
  patient?: { nombre_completo: string; avatar_url?: string | null } | null;
}

export type CreateTreatmentPlanInput = Omit<TreatmentPlan,
  "id" | "doctor_id" | "completed_sessions" | "created_at" | "updated_at" | "appointments" | "patient"
>;

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function getTreatmentPlans(
  doctorId: string,
  options: { status?: string; patientId?: string } = {}
) {
  let query = supabase
    .from("treatment_plan_series")
    .select(`
      *,
      patient:profiles!treatment_plan_series_patient_id_fkey(nombre_completo, avatar_url),
      appointments(id, fecha_hora, status, motivo, treatment_plan_session)
    `)
    .eq("doctor_id", doctorId);

  if (options.status)    query = query.eq("tps_status", options.status);
  if (options.patientId) query = query.eq("patient_id", options.patientId);

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  return { data: data as TreatmentPlan[] | null, error: error?.message ?? null };
}

export async function getTreatmentPlanById(id: string) {
  const { data, error } = await supabase
    .from("treatment_plan_series")
    .select(`
      *,
      patient:profiles!treatment_plan_series_patient_id_fkey(nombre_completo, avatar_url, email, telefono),
      appointments(id, fecha_hora, status, motivo, treatment_plan_session, duracion_minutos, tipo_cita, actual_duration_minutes)
    `)
    .eq("id", id)
    .single();
  return { data: data as TreatmentPlan | null, error: error?.message ?? null };
}

export async function createTreatmentPlan(
  doctorId: string,
  input: CreateTreatmentPlanInput
): Promise<{ data: TreatmentPlan | null; error: string | null }> {
  const { data, error } = await supabase
    .from("treatment_plan_series")
    .insert({ ...input, doctor_id: doctorId, completed_sessions: 0 })
    .select()
    .single();
  return { data: data as TreatmentPlan | null, error: error?.message ?? null };
}

export async function updateTreatmentPlan(
  id: string,
  updates: Partial<CreateTreatmentPlanInput>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("treatment_plan_series")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteTreatmentPlan(id: string): Promise<{ error: string | null }> {
  // Unlink appointments first
  await supabase.from("appointments").update({ treatment_plan_id: null }).eq("treatment_plan_id", id);
  const { error } = await supabase.from("treatment_plan_series").delete().eq("id", id);
  return { error: error?.message ?? null };
}

/**
 * Assign appointment to a treatment plan.
 */
export async function assignAppointmentToPlan(
  appointmentId: string,
  planId: string,
  sessionNumber: number
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("appointments")
    .update({ treatment_plan_id: planId, treatment_plan_session: sessionNumber })
    .eq("id", appointmentId);

  if (!error) {
    // Recalculate completed sessions
    const { data: apts } = await supabase
      .from("appointments")
      .select("status")
      .eq("treatment_plan_id", planId);

    const completed = (apts ?? []).filter((a) => a.status === "completada").length;
    await supabase
      .from("treatment_plan_series")
      .update({ completed_sessions: completed, updated_at: new Date().toISOString() })
      .eq("id", planId);
  }

  return { error: error?.message ?? null };
}
