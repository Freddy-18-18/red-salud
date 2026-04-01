import { supabase } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type VitalType =
  | "blood_pressure_systolic"
  | "blood_pressure_diastolic"
  | "heart_rate"
  | "temperature"
  | "blood_glucose"
  | "oxygen_saturation"
  | "weight"
  | "respiratory_rate";

export interface VitalRange {
  min: number;
  max: number;
  unit: string;
}

export interface VitalSign {
  type: VitalType;
  label: string;
  unit: string;
  icon: string;
  range: VitalRange;
  /** For compound vitals like BP, the paired type */
  pairedWith?: VitalType;
}

export interface VitalReading {
  id: string;
  patient_id: string;
  metric_type_id: string;
  value: number;
  measured_at: string;
  notes?: string;
  metric_type?: {
    id: string;
    name: string;
    unit: string;
    min_value?: number;
    max_value?: number;
  };
}

export interface VitalStats {
  min: number;
  max: number;
  average: number;
  count: number;
  trend: "up" | "down" | "stable";
  latestValue: number | null;
  latestDate: string | null;
}

// ─── Normal Ranges ───────────────────────────────────────────────────────────

export const VITAL_DEFINITIONS: Record<VitalType, VitalSign> = {
  blood_pressure_systolic: {
    type: "blood_pressure_systolic",
    label: "Presion Sistolica",
    unit: "mmHg",
    icon: "heart",
    range: { min: 90, max: 120, unit: "mmHg" },
    pairedWith: "blood_pressure_diastolic",
  },
  blood_pressure_diastolic: {
    type: "blood_pressure_diastolic",
    label: "Presion Diastolica",
    unit: "mmHg",
    icon: "heart",
    range: { min: 60, max: 80, unit: "mmHg" },
    pairedWith: "blood_pressure_systolic",
  },
  heart_rate: {
    type: "heart_rate",
    label: "Frecuencia Cardiaca",
    unit: "BPM",
    icon: "activity",
    range: { min: 60, max: 100, unit: "BPM" },
  },
  temperature: {
    type: "temperature",
    label: "Temperatura",
    unit: "\u00b0C",
    icon: "thermometer",
    range: { min: 36.1, max: 37.2, unit: "\u00b0C" },
  },
  blood_glucose: {
    type: "blood_glucose",
    label: "Glucosa en Sangre",
    unit: "mg/dL",
    icon: "droplet",
    range: { min: 70, max: 100, unit: "mg/dL" },
  },
  oxygen_saturation: {
    type: "oxygen_saturation",
    label: "Saturacion O2",
    unit: "%",
    icon: "wind",
    range: { min: 95, max: 100, unit: "%" },
  },
  weight: {
    type: "weight",
    label: "Peso",
    unit: "kg",
    icon: "scale",
    range: { min: 0, max: 999, unit: "kg" },
  },
  respiratory_rate: {
    type: "respiratory_rate",
    label: "Frecuencia Respiratoria",
    unit: "rpm",
    icon: "lungs",
    range: { min: 12, max: 20, unit: "rpm" },
  },
};

/** Vitals displayed as quick-log cards on the dashboard (ordered) */
export const DASHBOARD_VITALS: VitalType[] = [
  "blood_pressure_systolic",
  "blood_pressure_diastolic",
  "heart_rate",
  "temperature",
  "blood_glucose",
  "oxygen_saturation",
  "weight",
  "respiratory_rate",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeTrend(values: number[]): "up" | "down" | "stable" {
  if (values.length < 2) return "stable";
  const recent = values[values.length - 1];
  const previous = values[values.length - 2];
  const delta = recent - previous;
  const threshold = Math.abs(previous) * 0.03;
  if (delta > threshold) return "up";
  if (delta < -threshold) return "down";
  return "stable";
}

export function getVitalStatus(
  type: VitalType,
  value: number,
): "normal" | "borderline" | "abnormal" {
  const def = VITAL_DEFINITIONS[type];
  if (!def) return "normal";

  // Weight has no meaningful normal range to flag
  if (type === "weight") return "normal";

  const { min, max } = def.range;
  const borderlineMargin = (max - min) * 0.15;

  if (value >= min && value <= max) return "normal";
  if (
    value >= min - borderlineMargin &&
    value <= max + borderlineMargin
  ) {
    return "borderline";
  }
  return "abnormal";
}

// ─── Service Functions ───────────────────────────────────────────────────────

/**
 * Resolve a VitalType to its health_metric_types row ID.
 * Caches results per session.
 */
const metricTypeCache = new Map<string, string>();

async function resolveMetricTypeId(vitalType: VitalType): Promise<string | null> {
  if (metricTypeCache.has(vitalType)) {
    return metricTypeCache.get(vitalType)!;
  }

  const def = VITAL_DEFINITIONS[vitalType];
  if (!def) return null;

  // Try matching by name first (case-insensitive partial match)
  const { data, error } = await supabase
    .from("health_metric_types")
    .select("id, name")
    .order("name");

  if (error || !data) return null;

  // Match by looking for the vital type key or label in the metric type name
  const nameMap: Record<VitalType, string[]> = {
    blood_pressure_systolic: ["sistolica", "systolic", "presion sistolica"],
    blood_pressure_diastolic: ["diastolica", "diastolic", "presion diastolica"],
    heart_rate: ["cardiaca", "heart rate", "frecuencia cardiaca", "pulso"],
    temperature: ["temperatura", "temperature"],
    blood_glucose: ["glucosa", "glucose", "glicemia"],
    oxygen_saturation: ["saturacion", "spo2", "oxigeno", "oxygen"],
    weight: ["peso", "weight"],
    respiratory_rate: ["respiratoria", "respiratory", "frecuencia respiratoria"],
  };

  const searchTerms = nameMap[vitalType] || [def.label.toLowerCase()];

  const match = data.find((row) => {
    const name = row.name.toLowerCase();
    return searchTerms.some((term) => name.includes(term));
  });

  if (match) {
    metricTypeCache.set(vitalType, match.id);
    return match.id;
  }

  return null;
}

/**
 * Log a new vital sign reading.
 */
export async function logVitalSign(
  patientId: string,
  vitalType: VitalType,
  value: number,
  notes?: string,
) {
  try {
    const metricTypeId = await resolveMetricTypeId(vitalType);

    if (!metricTypeId) {
      // If metric type doesn't exist in DB, insert it
      const def = VITAL_DEFINITIONS[vitalType];
      const { data: newType, error: insertError } = await supabase
        .from("health_metric_types")
        .insert({
          name: def.label,
          unit: def.unit,
          min_value: def.range.min,
          max_value: def.range.max,
        })
        .select()
        .single();

      if (insertError) {
        return { success: false as const, error: insertError.message, data: null };
      }

      metricTypeCache.set(vitalType, newType.id);

      const { data, error } = await supabase
        .from("health_metrics")
        .insert({
          patient_id: patientId,
          metric_type_id: newType.id,
          value,
          measured_at: new Date().toISOString(),
          notes,
        })
        .select(`*, metric_type:health_metric_types(*)`)
        .single();

      if (error) return { success: false as const, error: error.message, data: null };
      return { success: true as const, data: data as VitalReading };
    }

    const { data, error } = await supabase
      .from("health_metrics")
      .insert({
        patient_id: patientId,
        metric_type_id: metricTypeId,
        value,
        measured_at: new Date().toISOString(),
        notes,
      })
      .select(`*, metric_type:health_metric_types(*)`)
      .single();

    if (error) return { success: false as const, error: error.message, data: null };

    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "vital_sign_logged",
      description: `Signo vital registrado: ${VITAL_DEFINITIONS[vitalType].label} = ${value} ${VITAL_DEFINITIONS[vitalType].unit}`,
      status: "success",
    });

    return { success: true as const, data: data as VitalReading };
  } catch {
    return { success: false as const, error: "Error registrando signo vital", data: null };
  }
}

/**
 * Get vital sign history for a specific type within a date range.
 */
export async function getVitalHistory(
  patientId: string,
  vitalType: VitalType,
  days: number,
) {
  try {
    const metricTypeId = await resolveMetricTypeId(vitalType);
    if (!metricTypeId) {
      return { success: true as const, data: [] as VitalReading[] };
    }

    const startDate = new Date(Date.now() - days * 86400000).toISOString();

    const { data, error } = await supabase
      .from("health_metrics")
      .select(`*, metric_type:health_metric_types(*)`)
      .eq("patient_id", patientId)
      .eq("metric_type_id", metricTypeId)
      .gte("measured_at", startDate)
      .order("measured_at", { ascending: true });

    if (error) throw error;

    return { success: true as const, data: (data || []) as VitalReading[] };
  } catch {
    return { success: false as const, error: "Error cargando historial", data: [] as VitalReading[] };
  }
}

/**
 * Get the latest reading for each vital type.
 */
export async function getLatestVitals(patientId: string) {
  try {
    const results: Record<VitalType, VitalReading | null> = {} as Record<VitalType, VitalReading | null>;

    await Promise.all(
      DASHBOARD_VITALS.map(async (vitalType) => {
        const metricTypeId = await resolveMetricTypeId(vitalType);
        if (!metricTypeId) {
          results[vitalType] = null;
          return;
        }

        const { data } = await supabase
          .from("health_metrics")
          .select(`*, metric_type:health_metric_types(*)`)
          .eq("patient_id", patientId)
          .eq("metric_type_id", metricTypeId)
          .order("measured_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        results[vitalType] = (data as VitalReading) || null;
      }),
    );

    return { success: true as const, data: results };
  } catch {
    return {
      success: false as const,
      error: "Error cargando signos vitales",
      data: {} as Record<VitalType, VitalReading | null>,
    };
  }
}

/**
 * Compute statistics for a vital sign over a date range.
 */
export async function getVitalStats(
  patientId: string,
  vitalType: VitalType,
  days: number,
): Promise<{ success: boolean; data: VitalStats }> {
  const historyResult = await getVitalHistory(patientId, vitalType, days);

  const readings = historyResult.success ? historyResult.data : [];
  const values = readings.map((r) => r.value);

  if (values.length === 0) {
    return {
      success: true,
      data: {
        min: 0,
        max: 0,
        average: 0,
        count: 0,
        trend: "stable",
        latestValue: null,
        latestDate: null,
      },
    };
  }

  const sum = values.reduce((a, b) => a + b, 0);

  return {
    success: true,
    data: {
      min: Math.round(Math.min(...values) * 10) / 10,
      max: Math.round(Math.max(...values) * 10) / 10,
      average: Math.round((sum / values.length) * 10) / 10,
      count: values.length,
      trend: computeTrend(values),
      latestValue: values[values.length - 1],
      latestDate: readings[readings.length - 1].measured_at,
    },
  };
}
