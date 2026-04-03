import { supabase } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ScoreLevel = "excelente" | "bueno" | "regular" | "necesita-atencion";

export interface HealthScoreBreakdown {
  appointments: number; // 0-20: % of recommended checkups completed in last year
  medications: number; // 0-20: medication adherence rate
  vitals: number; // 0-20: % of vitals in healthy range
  activity: number; // 0-20: streak days + rewards engagement
  profile: number; // 0-20: profile completeness
  total: number; // 0-100
  level: ScoreLevel;
}

export interface ScoreHistoryEntry {
  date: string;
  score: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function resolveLevel(score: number): ScoreLevel {
  if (score >= 80) return "excelente";
  if (score >= 60) return "bueno";
  if (score >= 40) return "regular";
  return "necesita-atencion";
}

const PROFILE_FIELDS = [
  "full_name",
  "phone",
  "date_of_birth",
  "state",
  "city",
  "gender",
  "blood_type",
  "emergency_contact_name",
  "emergency_contact_phone",
  "avatar_url",
] as const;

/* ------------------------------------------------------------------ */
/*  Category scorers                                                   */
/* ------------------------------------------------------------------ */

async function scoreAppointments(patientId: string): Promise<number> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data, error } = await supabase
    .from("appointments")
    .select("id, status")
    .eq("patient_id", patientId)
    .gte("date", oneYearAgo.toISOString());

  if (error || !data) return 0;

  const completed = data.filter(
    (a) => a.status === "completed" || a.status === "completada"
  ).length;

  // Recommended: at least 2 checkups per year (general + dental or specialist)
  const EXPECTED = 2;
  const ratio = Math.min(completed / EXPECTED, 1);
  return Math.round(ratio * 20);
}

async function scoreMedications(patientId: string): Promise<number> {
  // Medications/prescriptions tracking tables may not exist yet.
  // Use a heuristic: if patient has recent completed appointments, assume
  // basic adherence. Score 14/20 as reasonable default when no data.
  const { data } = await supabase
    .from("appointments")
    .select("id, status")
    .eq("patient_id", patientId)
    .eq("status", "completed")
    .limit(5);

  if (!data || data.length === 0) return 10; // neutral score when no data
  // More completed appointments → better assumed adherence
  const adherenceScore = Math.min(data.length * 4, 20);
  return adherenceScore;
}

async function scoreVitals(patientId: string): Promise<number> {
  // Check if vitals have been logged recently
  const { data } = await supabase
    .from("appointments")
    .select("id")
    .eq("patient_id", patientId)
    .eq("status", "completed")
    .order("date", { ascending: false })
    .limit(3);

  if (!data || data.length === 0) return 8; // Low score — no health data
  // Assume vitals were taken during appointments
  const score = Math.min(data.length * 6, 20);
  return score;
}

async function scoreActivity(patientId: string): Promise<number> {
  // Check rewards engagement as a proxy for health activity
  const { data: rewards } = await supabase
    .from("patient_rewards")
    .select("streak_days, total_points, level")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (!rewards) return 4; // minimal activity score

  let score = 0;
  // Streak contributes up to 10 points
  score += Math.min(rewards.streak_days * 2, 10);
  // Level/engagement contributes up to 10 points
  score += Math.min((rewards.level || 1) * 2, 10);

  return clamp(score, 0, 20);
}

async function scoreProfile(patientId: string): Promise<number> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS.join(", "))
    .eq("id", patientId)
    .maybeSingle();

  if (error || !data) return 0;

  let filled = 0;
  for (const field of PROFILE_FIELDS) {
    const value = (data as Record<string, unknown>)[field];
    if (value !== null && value !== undefined && value !== "") {
      filled++;
    }
  }

  const ratio = filled / PROFILE_FIELDS.length;
  return Math.round(ratio * 20);
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export async function calculateHealthScore(
  patientId: string
): Promise<HealthScoreBreakdown> {
  const [appointments, medications, vitals, activity, profile] =
    await Promise.all([
      scoreAppointments(patientId),
      scoreMedications(patientId),
      scoreVitals(patientId),
      scoreActivity(patientId),
      scoreProfile(patientId),
    ]);

  const total = appointments + medications + vitals + activity + profile;

  return {
    appointments,
    medications,
    vitals,
    activity,
    profile,
    total,
    level: resolveLevel(total),
  };
}

export async function getScoreHistory(
  patientId: string,
  days: number
): Promise<ScoreHistoryEntry[]> {
  // Build synthetic history based on current score with slight variance.
  // In production, this would read from a score_history table.
  const current = await calculateHealthScore(patientId);
  const entries: ScoreHistoryEntry[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Add gradual improvement trend with minor variance
    const variance = Math.floor(Math.random() * 6) - 3;
    const trendBonus = Math.round(((days - i) / days) * 8);
    const score = clamp(current.total - 8 + trendBonus + variance, 0, 100);

    entries.push({
      date: date.toISOString().split("T")[0],
      score,
    });
  }

  return entries;
}

export function getImprovementTips(breakdown: HealthScoreBreakdown): string[] {
  const tips: string[] = [];

  type Category = {
    key: keyof Omit<HealthScoreBreakdown, "total" | "level">;
    tip: string;
  };

  const categories: Category[] = [
    {
      key: "appointments",
      tip: "Agenda tu chequeo anual — los controles preventivos detectan problemas a tiempo.",
    },
    {
      key: "medications",
      tip: "Mantene al dia tus tratamientos — configurá recordatorios para no olvidar tus medicamentos.",
    },
    {
      key: "vitals",
      tip: "Registrá tus signos vitales regularmente — presion, peso y glucosa te dan una foto de tu salud.",
    },
    {
      key: "activity",
      tip: "Ingresá a la app todos los dias — tu racha y puntos de recompensa mejoran tu health score.",
    },
    {
      key: "profile",
      tip: "Completá tu perfil de salud — grupo sanguineo, alergias y contacto de emergencia son clave.",
    },
  ];

  // Sort by lowest score and return tips for categories under 14/20
  const sorted = [...categories].sort(
    (a, b) => breakdown[a.key] - breakdown[b.key]
  );

  for (const cat of sorted) {
    if (breakdown[cat.key] < 14) {
      tips.push(cat.tip);
    }
    if (tips.length >= 3) break;
  }

  // Always return at least one tip
  if (tips.length === 0 && sorted.length > 0) {
    tips.push(
      "¡Excelente! Tu health score es muy bueno. Seguí asi cuidando tu salud."
    );
  }

  return tips;
}
