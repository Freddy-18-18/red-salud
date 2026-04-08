import { fetchJson, postJson } from "@/lib/utils/fetch";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ConditionType =
  | "diabetes_tipo_1"
  | "diabetes_tipo_2"
  | "hipertension"
  | "asma"
  | "hipotiroidismo"
  | "hipertiroidismo"
  | "epoc"
  | "artritis"
  | "epilepsia"
  | "insuficiencia_renal"
  | "otro";

export type Severity = "leve" | "moderado" | "severo";

export type ReadingType =
  | "glucose"
  | "blood_pressure"
  | "peak_flow"
  | "heart_rate"
  | "weight"
  | "oxygen_saturation"
  | "temperature"
  | "custom";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertActionType =
  | "log_reading"
  | "schedule_appointment"
  | "view_condition"
  | "none";

export interface ChronicCondition {
  id: string;
  condition_type: ConditionType;
  condition_label: string;
  diagnosed_date: string;
  severity: Severity;
  treating_doctor_id: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  treating_doctor?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export interface ChronicConditionDetail extends ChronicCondition {
  latest_readings: ChronicReading[];
}

export interface ChronicReading {
  id: string;
  patient_id: string;
  condition_id: string;
  reading_type: ReadingType;
  value: number;
  value2: number | null;
  unit: string;
  context: string | null;
  notes: string | null;
  measured_at: string;
  created_at: string;
}

export interface ChronicGoal {
  id: string;
  patient_id: string;
  condition_id: string;
  metric_type: string;
  target_value: number;
  current_value: number;
  target_date: string;
  description: string;
  is_active: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  condition?: {
    id: string;
    condition_type: ConditionType;
    condition_label: string;
  };
}

export interface ChronicAlert {
  id: string;
  type: "missed_reading" | "abnormal_value" | "upcoming_checkup" | "medication_reminder";
  severity: AlertSeverity;
  title: string;
  description: string;
  condition_id: string | null;
  condition_type: string | null;
  action_type: AlertActionType;
  created_at: string;
}

export interface AddConditionData {
  condition_type: ConditionType;
  condition_label?: string;
  diagnosed_date: string;
  severity: Severity;
  treating_doctor_id?: string;
  notes?: string;
}

export interface LogReadingData {
  condition_id: string;
  reading_type: ReadingType;
  value: number;
  value2?: number;
  unit: string;
  context?: string;
  notes?: string;
  measured_at?: string;
}

export interface CreateGoalData {
  condition_id: string;
  metric_type: string;
  target_value: number;
  current_value?: number;
  target_date: string;
  description: string;
}

export interface DateRange {
  from?: string;
  to?: string;
}

/* ------------------------------------------------------------------ */
/*  Condition labels                                                   */
/* ------------------------------------------------------------------ */

export const CONDITION_OPTIONS: {
  value: ConditionType;
  label: string;
  icon: string;
  color: string;
  defaultReadingType: ReadingType;
  defaultUnit: string;
}[] = [
  {
    value: "diabetes_tipo_1",
    label: "Diabetes tipo 1",
    icon: "droplets",
    color: "blue",
    defaultReadingType: "glucose",
    defaultUnit: "mg/dL",
  },
  {
    value: "diabetes_tipo_2",
    label: "Diabetes tipo 2",
    icon: "droplets",
    color: "blue",
    defaultReadingType: "glucose",
    defaultUnit: "mg/dL",
  },
  {
    value: "hipertension",
    label: "Hipertension arterial",
    icon: "heart",
    color: "red",
    defaultReadingType: "blood_pressure",
    defaultUnit: "mmHg",
  },
  {
    value: "asma",
    label: "Asma",
    icon: "wind",
    color: "purple",
    defaultReadingType: "peak_flow",
    defaultUnit: "L/min",
  },
  {
    value: "hipotiroidismo",
    label: "Hipotiroidismo",
    icon: "thermometer",
    color: "teal",
    defaultReadingType: "weight",
    defaultUnit: "kg",
  },
  {
    value: "hipertiroidismo",
    label: "Hipertiroidismo",
    icon: "thermometer",
    color: "orange",
    defaultReadingType: "heart_rate",
    defaultUnit: "bpm",
  },
  {
    value: "epoc",
    label: "EPOC",
    icon: "wind",
    color: "indigo",
    defaultReadingType: "peak_flow",
    defaultUnit: "L/min",
  },
  {
    value: "artritis",
    label: "Artritis",
    icon: "bone",
    color: "amber",
    defaultReadingType: "custom",
    defaultUnit: "EVA 0-10",
  },
  {
    value: "epilepsia",
    label: "Epilepsia",
    icon: "zap",
    color: "yellow",
    defaultReadingType: "custom",
    defaultUnit: "episodios",
  },
  {
    value: "insuficiencia_renal",
    label: "Insuficiencia renal",
    icon: "activity",
    color: "rose",
    defaultReadingType: "custom",
    defaultUnit: "mL/min",
  },
  {
    value: "otro",
    label: "Otra condicion",
    icon: "plus-circle",
    color: "gray",
    defaultReadingType: "custom",
    defaultUnit: "",
  },
];

/* ------------------------------------------------------------------ */
/*  Condition color mapping                                            */
/* ------------------------------------------------------------------ */

export const CONDITION_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  diabetes_tipo_1: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  diabetes_tipo_2: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  hipertension: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
  },
  asma: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
  },
  hipotiroidismo: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-700",
  },
  hipertiroidismo: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
  },
  epoc: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
  },
  artritis: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
  epilepsia: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
  },
  insuficiencia_renal: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700",
  },
  otro: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-700",
  },
};

/* ------------------------------------------------------------------ */
/*  Normal ranges for reference lines in charts                        */
/* ------------------------------------------------------------------ */

export const NORMAL_RANGES: Record<
  string,
  { label: string; min: number; max: number; unit: string }
> = {
  glucose: { label: "Glucosa en ayunas", min: 70, max: 100, unit: "mg/dL" },
  blood_pressure: { label: "Presion sistolica", min: 90, max: 120, unit: "mmHg" },
  peak_flow: { label: "Flujo espiratorio maximo", min: 400, max: 600, unit: "L/min" },
  heart_rate: { label: "Frecuencia cardiaca", min: 60, max: 100, unit: "bpm" },
  oxygen_saturation: { label: "Saturacion de oxigeno", min: 95, max: 100, unit: "%" },
  weight: { label: "Peso", min: 0, max: 999, unit: "kg" },
};

/* ------------------------------------------------------------------ */
/*  API Functions                                                      */
/* ------------------------------------------------------------------ */

export async function getConditions(): Promise<ChronicCondition[]> {
  return fetchJson<ChronicCondition[]>("/api/chronic/conditions");
}

export async function addCondition(
  data: AddConditionData,
): Promise<ChronicCondition> {
  return postJson<ChronicCondition>("/api/chronic/conditions", data);
}

export async function getConditionDetail(
  id: string,
): Promise<ChronicConditionDetail> {
  return fetchJson<ChronicConditionDetail>(`/api/chronic/conditions/${id}`);
}

export async function updateCondition(
  id: string,
  data: Partial<Pick<ChronicCondition, "severity" | "notes" | "condition_label" | "treating_doctor_id">>,
): Promise<ChronicCondition> {
  return postJson<ChronicCondition>(
    `/api/chronic/conditions/${id}`,
    data,
    "PATCH",
  );
}

export async function deleteCondition(id: string): Promise<void> {
  await fetchJson(`/api/chronic/conditions/${id}`, { method: "DELETE" });
}

export async function getReadings(
  conditionId: string,
  type?: string,
  dateRange?: DateRange,
): Promise<ChronicReading[]> {
  const params = new URLSearchParams();
  params.set("condition_id", conditionId);
  if (type) params.set("type", type);
  if (dateRange?.from) params.set("from", dateRange.from);
  if (dateRange?.to) params.set("to", dateRange.to);

  return fetchJson<ChronicReading[]>(
    `/api/chronic/readings?${params.toString()}`,
  );
}

export async function logReading(data: LogReadingData): Promise<ChronicReading> {
  return postJson<ChronicReading>("/api/chronic/readings", data);
}

export async function getGoals(): Promise<ChronicGoal[]> {
  return fetchJson<ChronicGoal[]>("/api/chronic/goals");
}

export async function createGoal(data: CreateGoalData): Promise<ChronicGoal> {
  return postJson<ChronicGoal>("/api/chronic/goals", data);
}

export async function updateGoal(
  id: string,
  data: Partial<Pick<ChronicGoal, "current_value" | "is_completed" | "is_active" | "description" | "target_value" | "target_date">>,
): Promise<ChronicGoal> {
  return postJson<ChronicGoal>(`/api/chronic/goals/${id}`, data, "PATCH");
}

export async function getAlerts(): Promise<ChronicAlert[]> {
  return fetchJson<ChronicAlert[]>("/api/chronic/alerts");
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Resolve the condition-specific color palette */
export function getConditionColor(conditionType: string) {
  return (
    CONDITION_COLORS[conditionType] ?? CONDITION_COLORS.otro
  );
}

/** Resolve the condition option meta for a given type */
export function getConditionOption(conditionType: string) {
  return CONDITION_OPTIONS.find((o) => o.value === conditionType);
}

/** Compute trend arrow based on last two readings */
export function computeTrend(
  readings: ChronicReading[],
): "up" | "down" | "stable" | null {
  if (readings.length < 2) return null;
  const latest = readings[readings.length - 1].value;
  const previous = readings[readings.length - 2].value;
  const diff = latest - previous;
  const threshold = previous * 0.03; // 3% change threshold
  if (diff > threshold) return "up";
  if (diff < -threshold) return "down";
  return "stable";
}

/** Format a reading value for display */
export function formatReadingValue(
  reading: Pick<ChronicReading, "reading_type" | "value" | "value2" | "unit">,
): string {
  if (reading.reading_type === "blood_pressure" && reading.value2 != null) {
    return `${Math.round(reading.value)}/${Math.round(reading.value2)} ${reading.unit}`;
  }
  return `${Number.isInteger(reading.value) ? reading.value : reading.value.toFixed(1)} ${reading.unit}`;
}

/** Get date range ISO strings for chart periods */
export function getDateRange(period: "7d" | "30d" | "90d" | "6m" | "1y"): DateRange {
  const now = new Date();
  const from = new Date(now);

  switch (period) {
    case "7d":
      from.setDate(from.getDate() - 7);
      break;
    case "30d":
      from.setDate(from.getDate() - 30);
      break;
    case "90d":
      from.setDate(from.getDate() - 90);
      break;
    case "6m":
      from.setMonth(from.getMonth() - 6);
      break;
    case "1y":
      from.setFullYear(from.getFullYear() - 1);
      break;
  }

  return {
    from: from.toISOString(),
    to: now.toISOString(),
  };
}
