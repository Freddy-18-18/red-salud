import { supabase } from "@/lib/supabase/client";

// --- Types ---

export type TriageLevel = "emergency" | "urgent" | "standard" | "self-care";

export interface SymptomEntry {
  description: string;
  body_area: string;
  duration_value: number;
  duration_unit: "hours" | "days" | "weeks";
  severity: number; // 1-10
}

export interface TriageResult {
  level: TriageLevel;
  recommended_action: string;
  related_specialties: string[];
}

export interface SymptomCheckSession {
  id: string;
  patient_id: string;
  symptoms: SymptomEntry;
  triage_result: TriageResult | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateSymptomCheckData {
  patientId: string;
  symptoms: SymptomEntry;
}

// --- Triage Logic ---

/**
 * Determine triage level based on symptom severity, duration, and body area.
 * This is a simplified rule-based engine — NOT a substitute for medical diagnosis.
 */
function determineTriage(symptoms: SymptomEntry): TriageResult {
  const { severity, body_area, duration_value, duration_unit } = symptoms;

  // High-risk body areas that escalate triage
  const criticalAreas = ["cabeza", "pecho", "cuello"];
  const isCriticalArea = criticalAreas.includes(body_area);

  // Convert duration to hours for comparison
  const durationHours =
    duration_unit === "hours"
      ? duration_value
      : duration_unit === "days"
        ? duration_value * 24
        : duration_value * 168;

  // Emergency: very high severity, or high severity in critical area
  if (severity >= 9 || (severity >= 7 && isCriticalArea)) {
    return {
      level: "emergency",
      recommended_action:
        "Dirijase a la sala de emergencias mas cercana o llame al servicio de ambulancias de inmediato.",
      related_specialties: getSpecialtiesForArea(body_area, "emergency"),
    };
  }

  // Urgent: high severity, or moderate severity lasting a while in critical area
  if (
    severity >= 7 ||
    (severity >= 5 && isCriticalArea) ||
    (severity >= 5 && durationHours > 72)
  ) {
    return {
      level: "urgent",
      recommended_action:
        "Consulte con un medico lo antes posible. Puede agendar una cita urgente o acudir a un centro de atencion inmediata.",
      related_specialties: getSpecialtiesForArea(body_area, "urgent"),
    };
  }

  // Standard: moderate severity
  if (severity >= 4 || durationHours > 48) {
    return {
      level: "standard",
      recommended_action:
        "Agende una cita con un especialista en los proximos dias para una evaluacion completa.",
      related_specialties: getSpecialtiesForArea(body_area, "standard"),
    };
  }

  // Self-care: low severity
  return {
    level: "self-care",
    recommended_action:
      "Los sintomas son leves. Descanse, mantenga hidratacion adecuada y observe la evolucion. Consulte si los sintomas empeoran.",
    related_specialties: ["Medicina General"],
  };
}

function getSpecialtiesForArea(
  bodyArea: string,
  _level: TriageLevel
): string[] {
  const areaSpecialties: Record<string, string[]> = {
    cabeza: ["Neurologia", "Medicina General", "Otorrinolaringologia"],
    cuello: ["Otorrinolaringologia", "Medicina General", "Endocrinologia"],
    pecho: ["Cardiologia", "Neumologia", "Medicina Interna"],
    abdomen: ["Gastroenterologia", "Medicina General", "Cirugia General"],
    espalda: ["Traumatologia", "Neurologia", "Medicina Fisica"],
    brazos: ["Traumatologia", "Reumatologia", "Medicina General"],
    piernas: ["Traumatologia", "Angiologia", "Medicina General"],
    piel: ["Dermatologia", "Alergologia", "Medicina General"],
    general: ["Medicina Interna", "Medicina General"],
  };

  return areaSpecialties[bodyArea] || ["Medicina General"];
}

// --- Service Functions ---

/**
 * Create a new symptom check session with triage assessment.
 */
export async function createSymptomCheck(
  data: CreateSymptomCheckData
): Promise<{ success: boolean; data: SymptomCheckSession | null; error?: string }> {
  const triageResult = determineTriage(data.symptoms);

  const { data: session, error } = await supabase
    .from("symptom_check_sessions")
    .insert({
      patient_id: data.patientId,
      symptoms: data.symptoms,
      triage_result: triageResult,
    })
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  // Log activity
  await supabase.from("user_activity_log").insert({
    user_id: data.patientId,
    activity_type: "symptom_check_created",
    description: `Chequeo de sintomas: ${data.symptoms.body_area} - severidad ${data.symptoms.severity}/10`,
    status: "success",
  });

  return { success: true, data: session };
}

/**
 * Get symptom check history for a patient, ordered by most recent first.
 */
export async function getSymptomHistory(
  patientId: string
): Promise<{ success: boolean; data: SymptomCheckSession[]; error?: string }> {
  const { data, error } = await supabase
    .from("symptom_check_sessions")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { success: false, data: [], error: error.message };
  }

  return { success: true, data: data || [] };
}

/**
 * Update the triage result for an existing session.
 */
export async function saveTriageResult(
  sessionId: string,
  triageResult: TriageResult
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("symptom_check_sessions")
    .update({ triage_result: triageResult })
    .eq("id", sessionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
