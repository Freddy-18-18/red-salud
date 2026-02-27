/**
 * @file reminder-service.ts
 * @description Servicio de recordatorios automáticos: gestión de reglas,
 *   programación de recordatorios por cita, respuestas de pacientes y
 *   disparadores de lista de espera por cancelación.
 */

import { createClient } from "@/lib/supabase/client";
import { addHours, format } from "date-fns";

const supabase = createClient();

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ReminderTriggerType =
  | "before_appointment"
  | "after_appointment"
  | "on_cancel"
  | "on_no_show"
  | "on_confirm"
  | "waitlist_slot_open"
  | "treatment_plan_due"
  | "recall_due"
  | "custom_interval";

export type ReminderChannel = "whatsapp" | "sms" | "email" | "push" | "in_app" | "multi";

export interface ReminderRule {
  id: string;
  doctor_id: string;
  office_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  applies_to_tipos: string[];
  specialty_context: string | null;
  trigger_type: ReminderTriggerType;
  trigger_hours_offset: number;
  trigger_time_of_day: string | null;
  channel: ReminderChannel;
  channel_priority: string[];
  template_subject: string | null;
  template_body: string;
  allows_confirm: boolean;
  allows_reschedule: boolean;
  allows_cancel: boolean;
  confirm_keyword: string;
  reschedule_keyword: string;
  cancel_keyword: string;
  auto_confirm_on_reply: boolean;
  auto_cancel_on_no_reply: boolean;
  no_reply_hours: number;
  escalate_after_hours: number | null;
  escalation_template: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export type CreateReminderRuleInput = Omit<ReminderRule, "id" | "doctor_id" | "created_at" | "updated_at">;

export interface AppointmentReminder {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string | null;
  trigger_type: string;
  trigger_offset_minutes: number | null;
  scheduled_for: string;
  channels: string[];
  push_status: string;
  whatsapp_status: string;
  sms_status: string;
  email_status: string;
  overall_status: string;
  patient_response: string | null;
  patient_responded_at: string | null;
  template_name: string | null;
  message_variables: Record<string, string> | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  sent_at: string | null;
}

export interface ReminderStats {
  total: number;
  scheduled: number;
  sent: number;
  confirmed_by_patient: number;
  cancelled_by_patient: number;
  failed: number;
  response_rate_pct: number;
  confirmation_rate_pct: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// REMINDER RULES CRUD
// ─────────────────────────────────────────────────────────────────────────────

export async function getReminderRules(doctorId: string, officeId?: string | null) {
  const query = supabase
    .from("reminder_rules")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("priority", { ascending: true });

  if (officeId) query.or(`office_id.eq.${officeId},office_id.is.null`);

  const { data, error } = await query;
  return { data: data as ReminderRule[] | null, error: error?.message ?? null };
}

export async function createReminderRule(
  doctorId: string,
  input: CreateReminderRuleInput
): Promise<{ data: ReminderRule | null; error: string | null }> {
  const { data, error } = await supabase
    .from("reminder_rules")
    .insert({ ...input, doctor_id: doctorId })
    .select()
    .single();
  return { data: data as ReminderRule | null, error: error?.message ?? null };
}

export async function updateReminderRule(
  id: string,
  updates: Partial<CreateReminderRuleInput>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("reminder_rules")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteReminderRule(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("reminder_rules").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function toggleReminderRule(id: string, isActive: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("reminder_rules")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message ?? null };
}

/**
 * Seed default reminder rules for a doctor.
 * The RPC uses INSERT ... ON CONFLICT DO NOTHING so it is safe to call multiple times.
 */
export async function ensureDefaultReminderRules(doctorId: string): Promise<void> {
  await supabase.rpc("create_default_reminder_rules", { p_doctor_id: doctorId });
}

// ─────────────────────────────────────────────────────────────────────────────
// APPOINTMENT REMINDERS (READ / STATUS)
// ─────────────────────────────────────────────────────────────────────────────

export async function getRemindersForAppointment(appointmentId: string) {
  const { data, error } = await supabase
    .from("appointment_reminders")
    .select("*")
    .eq("appointment_id", appointmentId)
    .order("scheduled_for", { ascending: true });
  return { data: data as AppointmentReminder[] | null, error: error?.message ?? null };
}

export async function getDoctorReminders(
  doctorId: string,
  options?: { dateFrom?: string; dateTo?: string; status?: string }
) {
  let query = supabase
    .from("appointment_reminders")
    .select(`
      *,
      appointment:appointments(
        id, fecha_hora, motivo, tipo_cita,
        paciente:profiles!appointments_paciente_id_fkey(nombre_completo, telefono, email)
      )
    `)
    .eq("doctor_id", doctorId);

  if (options?.dateFrom) query = query.gte("scheduled_for", options.dateFrom);
  if (options?.dateTo)   query = query.lte("scheduled_for", options.dateTo);
  if (options?.status)   query = query.eq("overall_status", options.status);

  query = query.order("scheduled_for", { ascending: false }).limit(200);

  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}

export async function getReminderStats(doctorId: string): Promise<ReminderStats> {
  const { data } = await supabase
    .from("appointment_reminders")
    .select("overall_status, patient_response")
    .eq("doctor_id", doctorId)
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const rows = data ?? [];
  const total = rows.length;
  const scheduled        = rows.filter((r) => r.overall_status === "scheduled").length;
  const sent             = rows.filter((r) => r.overall_status === "sent").length;
  const confirmed        = rows.filter((r) => r.overall_status === "confirmed_by_patient").length;
  const cancelled_by_pt  = rows.filter((r) => r.overall_status === "cancelled_by_patient").length;
  const failed           = rows.filter((r) => r.overall_status === "failed").length;
  const responded        = rows.filter((r) => r.patient_response !== null).length;

  return {
    total,
    scheduled,
    sent,
    confirmed_by_patient: confirmed,
    cancelled_by_patient: cancelled_by_pt,
    failed,
    response_rate_pct: total ? Math.round((responded / total) * 100) : 0,
    confirmation_rate_pct: sent + confirmed ? Math.round((confirmed / (sent + confirmed)) * 100) : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE VARIABLE RESOLVER
// ─────────────────────────────────────────────────────────────────────────────

export interface TemplateVariables {
  patient_name: string;
  doctor_name: string;
  date: string;
  time: string;
  duration: string;
  motivo?: string;
  office_name?: string;
  phone?: string;
  reschedule_link?: string;
}

export function resolveTemplate(template: string, vars: TemplateVariables): string {
  return template
    .replace(/\{patient_name\}/g, vars.patient_name)
    .replace(/\{doctor_name\}/g, vars.doctor_name)
    .replace(/\{date\}/g, vars.date)
    .replace(/\{time\}/g, vars.time)
    .replace(/\{duration\}/g, vars.duration)
    .replace(/\{motivo\}/g, vars.motivo ?? "consulta médica")
    .replace(/\{office_name\}/g, vars.office_name ?? "")
    .replace(/\{reschedule_link\}/g, vars.reschedule_link ?? "");
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULED REMINDERS (manual schedule creation from rules)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes when a reminder should fire based on a rule and appointment datetime.
 */
export function computeReminderScheduledAt(
  fechaHora: Date,
  rule: Pick<ReminderRule, "trigger_type" | "trigger_hours_offset" | "trigger_time_of_day">
): Date | null {
  if (rule.trigger_type === "before_appointment" || rule.trigger_type === "after_appointment") {
    return addHours(fechaHora, rule.trigger_hours_offset);
  }
  if (rule.trigger_type === "on_cancel" || rule.trigger_type === "on_confirm" || rule.trigger_type === "on_no_show") {
    // These are event-driven — scheduled_at = now() + 0 (fire immediately when event occurs)
    return new Date();
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CANCELLATION EVENTS — auto-waitlist trigger
// ─────────────────────────────────────────────────────────────────────────────

export async function getUnprocessedCancellationEvents(doctorId: string) {
  const { data, error } = await supabase
    .from("appointment_cancellation_events")
    .select("*")
    .eq("doctor_id", doctorId)
    .eq("processed", false)
    .order("created_at", { ascending: true });
  return { data, error: error?.message ?? null };
}

export async function markCancellationEventProcessed(
  eventId: string,
  matchedPatientId?: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("appointment_cancellation_events")
    .update({ processed: true, matched_patient_id: matchedPatientId ?? null })
    .eq("id", eventId);
  return { error: error?.message ?? null };
}

/** Subscribe to real-time cancellation events for a doctor */
export function subscribeToCancellationEvents(
  doctorId: string,
  onEvent: (event: Record<string, unknown>) => void
) {
  return supabase
    .channel(`cancellation-events-${doctorId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "appointment_cancellation_events",
        filter: `doctor_id=eq.${doctorId}`,
      },
      (payload) => onEvent(payload.new as Record<string, unknown>)
    )
    .subscribe();
}
