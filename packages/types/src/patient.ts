/**
 * @file packages/types/src/patient.ts
 * @description Shared patient types consumed by every domain app (medico, paciente,
 * secretaria, etc.). Column names match the real Supabase `profiles` schema —
 * NOT the legacy Spanish aliases that `useDoctorAppointments` synthesizes for
 * backwards-compat (those should be replaced as consumers migrate).
 *
 * Tasks: T-1-04 (REQ-1.4 + spec §2).
 *
 * Why this lives in @red-salud/types and not inside the medico-web app:
 * - Multiple apps need the same shape (medico reads the roster; secretaria
 *   reads the same patients for intake; paciente reads the same row as their
 *   own profile). Centralizing keeps the shape consistent across domains.
 * - Domain isolation rule (CLAUDE.md): apps MUST NOT import from each other,
 *   so shared shapes belong in a package.
 *
 * Conventions:
 * - ISO 8601 strings for dates/timestamps (Supabase native return shape).
 *   Components convert to America/Caracas wall-clock via
 *   `toLocaleDateString('es-VE', { timeZone: 'America/Caracas' })` per REQ-X.2.
 * - `null` (not `undefined`) for absent optional values — matches PostgREST.
 * - Field names mirror the real DB columns exactly: `national_id`, `phone`,
 *   `date_of_birth`, `city`, `state`. No aliases.
 */

/**
 * Compact row representing a patient in a doctor's roster / list view.
 *
 * Derived from `profiles` joined with aggregate appointment data:
 * - `last_visit_at` = `max(appointments.scheduled_at)` where `status='completed'`
 * - `next_appointment_at` = `min(appointments.scheduled_at)` where
 *   `scheduled_at > now() AND status NOT IN ('cancelled')`
 * - `total_visits` = `count(appointments)` for this doctor + patient pair
 */
export interface PatientSummary {
  /** profiles.id (UUID) */
  id: string;
  /** profiles.full_name */
  full_name: string;
  /** profiles.national_id (Venezuelan cedula format `[VEJG]-\d{6,9}`); null when missing */
  national_id: string | null;
  /** profiles.phone (E.164 or local Venezuelan format); null when missing */
  phone: string | null;
  /** profiles.date_of_birth as ISO date string (YYYY-MM-DD); null when missing */
  date_of_birth: string | null;
  /** profiles.avatar_url; null when no avatar uploaded */
  avatar_url: string | null;
  /**
   * Derived: latest completed appointment for this doctor+patient pair.
   * ISO 8601 timestamp string; null when patient never visited.
   */
  last_visit_at: string | null;
  /**
   * Derived: next scheduled future appointment for this doctor+patient pair.
   * ISO 8601 timestamp string; null when none upcoming.
   */
  next_appointment_at: string | null;
  /** Derived count of appointments for this doctor+patient pair. */
  total_visits: number;
}

/**
 * Joined patient_details subset embedded inside `PatientFull`. The join may
 * return `null` for patients without a `patient_details` row — the spec's
 * SC-2.2 calls this case out explicitly (banner shows "Sin información
 * clínica registrada").
 */
export interface PatientDetailsRow {
  /** patient_details.profile_id (FK to profiles.id) */
  profile_id: string;
  /** ABO/Rh blood group; null when not asked */
  grupo_sanguineo: string | null;
  /** Free-text allergies (no severity/reaction metadata at this layer — see proposal §7) */
  alergias: string[];
  /** Canonical-tag slugs from lib/chronic/canonical-tags.ts */
  enfermedades_cronicas: string[];
  /** Free-text current medications as the doctor recorded them */
  medicamentos_actuales: string[];
  /** Free-text doctor notes (no PHI guard — visible only to the doctor's roster) */
  notas_medicas: string | null;
  /** Weight in kilograms; null when not measured */
  peso_kg: number | null;
  /** Height in centimeters; null when not measured */
  altura_cm: number | null;
}

/**
 * Full patient detail row — used by `/dashboard/pacientes/[patientId]` and
 * any deep-view of a single patient. Adds demographics + the optional join
 * with `patient_details`.
 */
export interface PatientFull {
  /** profiles.id (UUID) */
  id: string;
  /** profiles.full_name */
  full_name: string;
  /** profiles.email; null when patient has no auth account yet (offline patients) */
  email: string | null;
  /** profiles.national_id (cedula); null when missing */
  national_id: string | null;
  /** profiles.phone; null when missing */
  phone: string | null;
  /** profiles.date_of_birth as ISO date string; null when missing */
  date_of_birth: string | null;
  /** profiles.gender; values from the design-system gender enum */
  gender: string | null;
  /** profiles.city (NOT `ciudad` — real DB column) */
  city: string | null;
  /** profiles.state (NOT `estado` — real DB column) */
  state: string | null;
  /** profiles.nationality; null when not declared */
  nationality: string | null;
  /** profiles.avatar_url; null when no avatar uploaded */
  avatar_url: string | null;
  /**
   * Optional join with `patient_details`. `null` when the row does not exist
   * (common for newly-onboarded patients before clinical data has been
   * captured). Components MUST handle this explicitly (per SC-2.2).
   */
  patient_details: PatientDetailsRow | null;
}

// ---------------------------------------------------------------------------
// Phase 2: clinical overview, vitals trend, prescriptions, alerts.
// ---------------------------------------------------------------------------
//
// The Phase 2 design (sdd/medico-pacientes-profesional) introduces a richer
// per-patient view that aggregates:
//   - The static patient_details row (already typed above as PatientDetailsRow)
//   - The most recent vital signs per metric type (health_metrics joined with
//     health_metric_types so we can render units and out-of-range markers)
//   - Active prescriptions with derived expiration metadata
//   - Lab orders + results, vaccination history, family history, insurance,
//     uploaded documents, and emergency contacts (read-only for the doctor)
//   - Computed alerts derived purely client-side from the above
//
// All shapes live here (NOT inside apps/medico/web) so secretaria and other
// apps can consume the same view in the future. Strings stay close to the
// real DB columns; derived fields are explicitly labeled as such.

/**
 * ABO/Rh blood type (`patient_details.grupo_sanguineo`). The DB column is
 * free-form `text`, so consumers may also encounter `null` or a legacy free
 * text value — see `BloodType | string | null` in `PatientClinicalOverview`.
 */
export type BloodType =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

/**
 * One measurement plotted on the vitals trend chart. Sourced from
 * `health_metrics` (a single measurement) joined with `health_metric_types`
 * (catalog of metric definitions including reference ranges).
 *
 * Notes:
 * - `valor_secundario` is only populated for bidimensional metrics such as
 *   blood pressure (systolic/diastolic). `unidad_secundaria` mirrors the
 *   metric type's `unidad_secundaria` for the display layer.
 * - `is_out_of_range` is computed in the service layer when both
 *   `rango_minimo` and `rango_maximo` are present. Consumers should NOT
 *   recompute it — keep the rule centralized in `patient-clinical-service.ts`.
 */
export interface PatientVitalsTrendPoint {
  /** health_metrics.id */
  id: string;
  /** FK to health_metric_types.id */
  metric_type_id: string;
  /** Joined health_metric_types.name (e.g. "Presión Arterial Sistólica") */
  metric_name: string;
  /** health_metric_types.unidad_medida (e.g. "mmHg", "kg", "mg/dL") */
  metric_unit: string;
  /** health_metric_types.categoria; null when the catalog row omits it */
  metric_category: string | null;
  /** health_metrics.valor (primary numeric reading) */
  valor: number;
  /** health_metrics.valor_secundario; null when the metric is unidimensional */
  valor_secundario: number | null;
  /** Mirror of health_metric_types.unidad_secundaria; null when unidimensional */
  unidad_secundaria: string | null;
  /** ISO 8601 timestamp of the measurement */
  measured_at: string;
  /** health_metric_types.rango_minimo; null when unbounded */
  rango_minimo: number | null;
  /** health_metric_types.rango_maximo; null when unbounded */
  rango_maximo: number | null;
  /**
   * Derived: true when the primary reading falls outside [rango_minimo,
   * rango_maximo]. When either bound is null, defaults to false (we cannot
   * assert a deviation without a range).
   */
  is_out_of_range: boolean;
}

/**
 * One medication line item inside an active prescription. Sourced from
 * `prescription_medications`. The medication FK is intentionally omitted —
 * UI only needs the human-readable name and dosing instructions.
 */
export interface PatientPrescriptionMedication {
  /** prescription_medications.id */
  id: string;
  /** prescription_medications.medication_name (denormalized for display) */
  medication_name: string;
  /** Dosing (e.g. "500 mg", "1 tableta") */
  dosis: string | null;
  /** Frequency (e.g. "cada 8 horas") */
  frecuencia: string | null;
  /** Route (e.g. "oral", "IV") */
  via_administracion: string | null;
  /** Total treatment duration in days; null when open-ended */
  duration_days: number | null;
  /** Free-text special instructions for the patient or pharmacist */
  special_instructions: string | null;
}

/**
 * Active prescription with derived expiration metadata. Sourced from
 * `prescriptions` filtered to `status = 'activa'` AND `deleted_at IS NULL`,
 * with the joined `prescription_medications` rows.
 *
 * Derived fields:
 * - `days_until_expiration`: negative when expired, null when no `expires_at`.
 * - `is_expiring_soon`: true when `0 <= days_until_expiration <= 7`.
 * - `is_expired`: true when `days_until_expiration < 0`.
 *
 * The service computes these once so the alert engine doesn't recompute per
 * render and so timezone handling stays consistent (America/Caracas, REQ-X.2).
 */
export interface PatientActivePrescription {
  /** prescriptions.id */
  id: string;
  /** ISO date string from prescriptions.prescribed_at */
  prescribed_at: string;
  /** ISO date string from prescriptions.expires_at; null when open-ended */
  expires_at: string | null;
  /** Primary clinical reason for the prescription */
  diagnosis: string | null;
  /** Doctor-authored generic instructions for the whole prescription */
  general_instructions: string | null;
  /** prescriptions.status — typically 'activa' when surfaced here */
  status: string;
  /** Derived: floor((expires_at - today) / day). Negative ⇒ expired. */
  days_until_expiration: number | null;
  /** Derived: 0 <= days_until_expiration <= 7 */
  is_expiring_soon: boolean;
  /** Derived: days_until_expiration < 0 */
  is_expired: boolean;
  /** Embedded prescription_medications rows */
  medications: PatientPrescriptionMedication[];
}

/**
 * Severity tier for client-derived alerts surfaced in the patient detail
 * banner. Maps roughly to the design-system Alert variants:
 *   - `info`    → neutral, "vencimiento próximo distante"
 *   - `warning` → yellow, attention required
 *   - `critical`→ red, immediate clinical concern
 */
export type ComputedAlertSeverity = 'info' | 'warning' | 'critical';

/**
 * Discriminated union of alerts derived client-side from the patient
 * overview/vitals/prescriptions slice. The alert engine
 * (`use-patient-computed-alerts.ts`) is pure — it does not query Supabase.
 *
 * Each variant carries the minimum info the UI needs to render a chip,
 * tooltip, and call-to-action; the `message` field is the user-facing text
 * in rioplatense voseo (REQ-X.3, copy style consistent with onboarding).
 */
export type ComputedAlert =
  | {
      kind: 'vital_out_of_range';
      severity: ComputedAlertSeverity;
      metric_name: string;
      metric_value: number;
      metric_unit: string;
      rango_minimo: number | null;
      rango_maximo: number | null;
      measured_at: string;
      message: string;
    }
  | {
      kind: 'rx_expiring';
      severity: ComputedAlertSeverity;
      prescription_id: string;
      diagnosis: string | null;
      expires_at: string;
      days_until_expiration: number;
      message: string;
    }
  | {
      kind: 'rx_expired';
      severity: ComputedAlertSeverity;
      prescription_id: string;
      diagnosis: string | null;
      expires_at: string;
      message: string;
    }
  | {
      kind: 'lab_abnormal_pending';
      severity: ComputedAlertSeverity;
      result_id: string;
      parametro: string;
      valor: string | null;
      rango_referencia: string | null;
      nivel_alerta: string | null;
      result_at: string;
      message: string;
    }
  | {
      kind: 'allergy_med_conflict';
      severity: ComputedAlertSeverity;
      allergy_term: string;
      medication_term: string;
      message: string;
    };

/**
 * Aggregate view backing the Resumen tab. Composed by
 * `getClinicalOverview()` from a single parallel fetch of:
 *   - patient_details (may be null when the patient has no clinical record)
 *   - last vital signs per metric type
 *   - active prescriptions count
 *   - next appointment (already known from PatientFull, mirrored here for
 *     consumer convenience)
 *
 * `has_clinical_record` distinguishes "no info captured yet" from "info
 * captured but empty"; the SC-2.2 banner reads it directly.
 */
export interface PatientClinicalOverview {
  patient_id: string;
  /** patient_details.alergias; empty array when none recorded */
  alergias: string[];
  /** patient_details.enfermedades_cronicas; canonical-tag slugs */
  enfermedades_cronicas: string[];
  /**
   * patient_details.grupo_sanguineo. Typed as `BloodType | string` so the
   * UI can render legacy free-text variants verbatim without losing data.
   */
  grupo_sanguineo: BloodType | string | null;
  /** patient_details.medicamentos_actuales (free text) */
  medicamentos_actuales: string[];
  /** patient_details.peso_kg */
  peso_kg: number | null;
  /** patient_details.altura_cm */
  altura_cm: number | null;
  /**
   * Derived BMI: `peso_kg / (altura_cm / 100)^2`, rounded to 1 decimal.
   * Null when either input is missing or non-positive. The classification
   * (underweight / normal / overweight / obese) is left to the UI layer.
   */
  bmi: number | null;
  /** patient_details.notas_medicas (private doctor notes) */
  notas_medicas: string | null;
  /**
   * Most recent measurement per `metric_type_id`. Sorted by metric_name
   * ascending so the UI can render a stable list.
   */
  last_vitals: PatientVitalsTrendPoint[];
  /** Count of prescriptions where status='activa' AND deleted_at IS NULL */
  active_prescriptions_count: number;
  /** Mirrored from PatientSummary.next_appointment_at for convenience */
  next_appointment_at: string | null;
  /**
   * False ⇒ no patient_details row exists. UI renders the
   * "Sin información clínica registrada" banner (SC-2.2). True ⇒ row exists
   * even if every nullable column is null.
   */
  has_clinical_record: boolean;
}

/**
 * Payload accepted by `updateClinicalFields()` and surfaced through
 * `use-patient-edit-clinical`. All fields are optional; omitted keys preserve
 * the existing column value (the service performs a partial UPSERT).
 *
 * `patient_id` doubles as `patient_details.profile_id` (1-to-1 FK).
 */
export interface ClinicalFieldEdit {
  patient_id: string;
  grupo_sanguineo?: string | null;
  alergias?: string[];
  enfermedades_cronicas?: string[];
  medicamentos_actuales?: string[];
  peso_kg?: number | null;
  altura_cm?: number | null;
  notas_medicas?: string | null;
}

/**
 * Vaccination row sourced from `vaccination_records`. Read-only for the
 * doctor in Phase 2 — write paths land in Phase 3.
 *
 * Note: `administered_date` is a `timestamptz` in the DB (not a `date`) so we
 * keep the ISO 8601 string here. Consumers convert with `toLocaleDateString`
 * + `timeZone: 'America/Caracas'` per REQ-X.2.
 */
export interface PatientVaccinationRow {
  id: string;
  vaccine_name: string;
  dose_number: number | null;
  administered_date: string | null;
  administered_by: string | null;
  location: string | null;
  lot_number: string | null;
  /** ISO date string (date column in DB) */
  next_dose_date: string | null;
  notes: string | null;
}

/**
 * Family medical history row sourced from `patient_family_history`.
 * Read-only for the doctor in Phase 2.
 */
export interface PatientFamilyHistoryRow {
  id: string;
  /** e.g. "padre", "madre", "abuela materna" */
  relacion: string;
  /** Free-text condition (e.g. "DM2", "hipertensión", "cáncer de mama") */
  condicion: string;
  edad_diagnostico: number | null;
  /** null when the relative status is unknown */
  vivo: boolean | null;
  notas: string | null;
}

/**
 * Insurance row sourced from `patient_insurance`. Read-only for the doctor.
 * `coverage_details` (jsonb) is intentionally omitted — Phase 2 surface only
 * shows policy metadata; detail-level coverage lookups defer to seguros app.
 */
export interface PatientInsuranceRow {
  id: string;
  insurance_company: string;
  plan_name: string;
  policy_number: string;
  member_id: string | null;
  group_number: string | null;
  coverage_type: string | null;
  /** ISO date string */
  valid_from: string | null;
  /** ISO date string */
  valid_until: string | null;
  is_active: boolean;
}

/**
 * Uploaded document row sourced from `patient_documents`. Read-only for the
 * doctor. `file_url` already includes a signed/public URL — the UI MUST NOT
 * try to construct one.
 */
export interface PatientDocumentRow {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  status: string;
  uploaded_at: string;
}

/**
 * Emergency contact row sourced from `emergency_contacts`. Note that
 * `patient_details` *also* carries `contacto_emergencia_*` legacy columns;
 * Phase 2 reads from `emergency_contacts` (the canonical table) and ignores
 * the legacy inline columns to avoid double-displaying.
 */
export interface PatientEmergencyContactRow {
  id: string;
  name: string;
  phone: string;
  relationship: string | null;
  is_primary: boolean;
}

/**
 * Lab order row sourced from `lab_orders`. Used by the Estudios tab.
 *
 * Note: `ordered_at` and `estimated_delivery_at` are `date` columns in the DB
 * (no time component) while `sample_collected_at` is `timestamptz`.
 */
export interface PatientLabOrderRow {
  id: string;
  order_number: string;
  /** ISO date string (date column) */
  ordered_at: string | null;
  /** ISO 8601 timestamp */
  sample_collected_at: string | null;
  /** ISO date string (date column) */
  estimated_delivery_at: string | null;
  status: string;
  prioridad: string;
  presumptive_diagnosis: string | null;
  doctor_id: string | null;
}

/**
 * One parameter inside a `lab_results` row. Sourced from `lab_result_values`.
 *
 * `valor` is `varchar` in the DB (results can be qualitative — "positivo",
 * "negativo", "trazas") so it stays a string here. Numeric comparisons
 * happen against `valor_minimo`/`valor_maximo` server-side and surface as
 * `es_anormal`/`nivel_alerta`.
 */
export interface PatientLabResultValueRow {
  id: string;
  parametro: string;
  valor: string | null;
  unidad: string | null;
  rango_referencia: string | null;
  es_anormal: boolean;
  nivel_alerta: string | null;
}

/**
 * A single `lab_results` row with its embedded values. `has_abnormal` is
 * derived by the service: true when ANY value has `es_anormal=true`. The
 * computed-alerts engine uses this to surface a `lab_abnormal_pending` alert
 * when the result hasn't yet been acknowledged.
 */
export interface PatientLabResultRow {
  id: string;
  order_id: string;
  /** ISO 8601 timestamp */
  result_at: string;
  general_observations: string | null;
  values: PatientLabResultValueRow[];
  /** Derived: true ⇔ at least one value has es_anormal = true */
  has_abnormal: boolean;
}
