/**
 * @file type-configs-service.ts
 * @description CRUD service for appointment_type_configs.
 * Manages per-doctor configuration of appointment types: duration, buffers,
 * colors, preparation instructions, consent requirements, and booking flags.
 */

import { supabase } from "@/lib/supabase/client";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AppointmentTypeConfig {
  id:                         string;
  doctor_id:                  string;
  specialty_slug:             string | null;
  tipo_cita:                  string;
  procedure_code:             string | null;
  // Durations
  duracion_default:           number;
  duracion_min:               number;
  duracion_max:               number;
  // Buffers
  buffer_before_min:          number;
  buffer_after_min:           number;
  // Reminders
  reminder_templates:         { "24h": boolean; "2h": boolean; "30min": boolean };
  reminder_message_override:  string | null;
  // Pre-appointment
  preparation_instructions:   string | null;
  // Consent
  requires_consent_form:      boolean;
  consent_form_url:           string | null;
  // Visual
  color:                      string;
  // Flags
  is_high_privacy:            boolean;
  shows_tooth_selector:       boolean;
  shows_session_counter:      boolean;
  allow_online_booking:       boolean;
  // Timestamps
  created_at:                 string;
  updated_at:                 string;
}

export type CreateTypeConfigInput = Omit<AppointmentTypeConfig, "id" | "doctor_id" | "created_at" | "updated_at">;
export type UpdateTypeConfigInput = Partial<CreateTypeConfigInput>;

// Labels shown in the UI
export const TIPO_LABELS: Record<string, string> = {
  primera_vez:    "Primera vez",
  seguimiento:    "Seguimiento",
  urgencia:       "Urgencia",
  control:        "Control",
  procedimiento:  "Procedimiento",
  teleconsulta:   "Teleconsulta",
  evaluacion:     "Evaluación",
  rehabilitacion: "Rehabilitación",
  psicoterapia:   "Psicoterapia",
  limpieza:       "Limpieza / Profilaxis",
  extraccion:     "Extracción",
  endodoncia:     "Endodoncia",
  implante:       "Implante",
  ortodoncia:     "Ortodoncia",
};

const DEFAULT_CONFIGS: Omit<AppointmentTypeConfig, "id" | "doctor_id" | "created_at" | "updated_at">[] = [
  { specialty_slug: null, tipo_cita: "primera_vez",  procedure_code: null, duracion_default: 60, duracion_min: 45, duracion_max: 90,  buffer_before_min: 5,  buffer_after_min: 10, color: "#6366f1", reminder_templates: { "24h": true, "2h": true, "30min": false }, reminder_message_override: null, preparation_instructions: null, requires_consent_form: false, consent_form_url: null, is_high_privacy: false, shows_tooth_selector: false, shows_session_counter: false, allow_online_booking: true },
  { specialty_slug: null, tipo_cita: "seguimiento",  procedure_code: null, duracion_default: 30, duracion_min: 20, duracion_max: 60,  buffer_before_min: 0,  buffer_after_min: 5,  color: "#3b82f6", reminder_templates: { "24h": true, "2h": true, "30min": false }, reminder_message_override: null, preparation_instructions: null, requires_consent_form: false, consent_form_url: null, is_high_privacy: false, shows_tooth_selector: false, shows_session_counter: false, allow_online_booking: true },
  { specialty_slug: null, tipo_cita: "urgencia",     procedure_code: null, duracion_default: 20, duracion_min: 15, duracion_max: 45,  buffer_before_min: 10, buffer_after_min: 10, color: "#ef4444", reminder_templates: { "24h": false, "2h": true, "30min": true }, reminder_message_override: null, preparation_instructions: null, requires_consent_form: false, consent_form_url: null, is_high_privacy: false, shows_tooth_selector: false, shows_session_counter: false, allow_online_booking: true },
  { specialty_slug: null, tipo_cita: "control",      procedure_code: null, duracion_default: 20, duracion_min: 15, duracion_max: 30,  buffer_before_min: 0,  buffer_after_min: 5,  color: "#10b981", reminder_templates: { "24h": true, "2h": true, "30min": false }, reminder_message_override: null, preparation_instructions: null, requires_consent_form: false, consent_form_url: null, is_high_privacy: false, shows_tooth_selector: false, shows_session_counter: false, allow_online_booking: true },
  { specialty_slug: null, tipo_cita: "procedimiento",procedure_code: null, duracion_default: 60, duracion_min: 30, duracion_max: 120, buffer_before_min: 10, buffer_after_min: 15, color: "#f59e0b", reminder_templates: { "24h": true, "2h": true, "30min": false }, reminder_message_override: null, preparation_instructions: null, requires_consent_form: true,  consent_form_url: null, is_high_privacy: false, shows_tooth_selector: false, shows_session_counter: false, allow_online_booking: true },
  { specialty_slug: null, tipo_cita: "teleconsulta", procedure_code: null, duracion_default: 30, duracion_min: 20, duracion_max: 60,  buffer_before_min: 0,  buffer_after_min: 0,  color: "#8b5cf6", reminder_templates: { "24h": true, "2h": true, "30min": true  }, reminder_message_override: null, preparation_instructions: null, requires_consent_form: false, consent_form_url: null, is_high_privacy: false, shows_tooth_selector: false, shows_session_counter: false, allow_online_booking: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export async function getTypeConfigs(doctorId: string): Promise<{
  data: AppointmentTypeConfig[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("appointment_type_configs")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("tipo_cita", { ascending: true });

  return {
    data: data as AppointmentTypeConfig[] | null,
    error: error?.message ?? null,
  };
}

/**
 * Seeds default configs for a doctor if none exist.
 * Returns the resulting list of configs.
 */
export async function ensureDefaultTypeConfigs(doctorId: string): Promise<{
  data: AppointmentTypeConfig[] | null;
  error: string | null;
}> {
  const { data: existing } = await supabase
    .from("appointment_type_configs")
    .select("id")
    .eq("doctor_id", doctorId)
    .limit(1);

  if (!existing || existing.length === 0) {
    const rows = DEFAULT_CONFIGS.map((c) => ({ ...c, doctor_id: doctorId }));
    await supabase.from("appointment_type_configs").insert(rows);
  }

  return getTypeConfigs(doctorId);
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function createTypeConfig(
  doctorId: string,
  input: CreateTypeConfigInput
): Promise<{ data: AppointmentTypeConfig | null; error: string | null }> {
  const { data, error } = await supabase
    .from("appointment_type_configs")
    .insert({ ...input, doctor_id: doctorId })
    .select()
    .single();

  return {
    data: data as AppointmentTypeConfig | null,
    error: error?.message ?? null,
  };
}

export async function updateTypeConfig(
  id: string,
  updates: UpdateTypeConfigInput
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("appointment_type_configs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function deleteTypeConfig(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("appointment_type_configs")
    .delete()
    .eq("id", id);

  return { error: error?.message ?? null };
}

/**
 * Convenience: upsert by (doctor_id, tipo_cita). Used for quick inline edits.
 */
export async function upsertTypeConfig(
  doctorId: string,
  input: CreateTypeConfigInput
): Promise<{ data: AppointmentTypeConfig | null; error: string | null }> {
  const { data, error } = await supabase
    .from("appointment_type_configs")
    .upsert(
      { ...input, doctor_id: doctorId, updated_at: new Date().toISOString() },
      { onConflict: "doctor_id,tipo_cita" }
    )
    .select()
    .single();

  return {
    data: data as AppointmentTypeConfig | null,
    error: error?.message ?? null,
  };
}
