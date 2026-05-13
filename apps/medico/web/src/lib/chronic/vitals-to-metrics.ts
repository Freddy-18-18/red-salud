/**
 * @file vitals-to-metrics.ts
 * @description Pure mapper from a consultation's `vital_signs` form data to
 * `health_metrics` insert rows linked back to the consulta via
 * `medical_record_id` + `appointment_id`.
 *
 * Spec R6: when `FEATURE_CHRONIC_VISIT_AUTOEXTRACT='true'`, the consulta save
 * handler calls this and inserts the rows. Null vitals produce no rows.
 */

export interface VitalSigns {
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  temperature: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  weight: number | null;
  height: number | null;
}

export interface MetricTypeLookup {
  [metricTypeName: string]: { id: string };
}

export interface VitalsToMetricsInput {
  vitals: VitalSigns;
  metricTypes: MetricTypeLookup;
  patient_id: string;
  medical_record_id: string;
  appointment_id: string;
  /** ISO string. Defaults to current time if omitted. */
  measured_at?: string;
  /** Value for `health_metrics.medido_por` — typically 'medico' or the doctor's id. */
  medido_por: string;
}

export interface HealthMetricInsertRow {
  patient_id: string;
  metric_type_id: string;
  valor: number;
  measured_at: string;
  medical_record_id: string;
  appointment_id: string;
  medido_por: string;
}

/**
 * Mapping: VitalSigns field → metric_type.name (must match the seed).
 * Keep aligned with `supabase/migrations/*health_metric_types*.sql`.
 */
const VITAL_FIELD_TO_METRIC_NAME: Record<keyof VitalSigns, string> = {
  systolic_bp: 'Presión Arterial Sistólica',
  diastolic_bp: 'Presión Arterial Diastólica',
  heart_rate: 'Frecuencia Cardíaca',
  temperature: 'Temperatura Corporal',
  respiratory_rate: 'Frecuencia Respiratoria',
  oxygen_saturation: 'Saturación de Oxígeno',
  weight: 'Peso',
  height: 'Altura',
};

export function vitalsToMetrics(input: VitalsToMetricsInput): HealthMetricInsertRow[] {
  const measuredAt = input.measured_at ?? new Date().toISOString();
  const rows: HealthMetricInsertRow[] = [];

  for (const [field, metricName] of Object.entries(VITAL_FIELD_TO_METRIC_NAME) as Array<
    [keyof VitalSigns, string]
  >) {
    const value = input.vitals[field];
    if (value === null || value === undefined) continue;

    const metricType = input.metricTypes[metricName];
    if (!metricType) continue;

    rows.push({
      patient_id: input.patient_id,
      metric_type_id: metricType.id,
      valor: value,
      measured_at: measuredAt,
      medical_record_id: input.medical_record_id,
      appointment_id: input.appointment_id,
      medido_por: input.medido_por,
    });
  }

  return rows;
}
