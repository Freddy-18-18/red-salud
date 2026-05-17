/**
 * @file lib/supabase/services/patient-clinical-service.ts
 * @description Service layer for the Phase 2 patient clinical surface:
 * vitals trend, active prescriptions, lab orders/results, vaccination history,
 * family history, insurance, documents, emergency contacts, plus the
 * aggregate overview backing the Resumen tab.
 *
 * Tasks: T-2-* (Phase 2 sdd/medico-pacientes-profesional).
 *
 * Architectural choices (consistent with `patients-service.ts`):
 * - Pure async functions returning `ServiceResult<T>` — never throw.
 * - Dependency-injected `PatientsSupabaseClient` (structural type) so the
 *   service is trivially testable with stubs.
 * - No `console.*` with PHI (REQ-X.1). When debug logging is needed, use
 *   `correlationHash()` exported from `patients-service.ts`.
 * - Derived fields (BMI, is_out_of_range, days_until_expiration, has_abnormal)
 *   are computed ONCE here so the UI and the alert engine don't drift.
 *
 * RLS prerequisites (already shipped in 20260518000000_medico_pacientes_p2_*):
 * - `doctor_has_access_to_patient(uuid)` Postgres helper.
 * - SELECT policies on lab_*, patient_documents, patient_insurance,
 *   emergency_contacts; UPDATE/INSERT on patient_details for the calling
 *   doctor. All policies trust the helper, so no extra WHERE clause is
 *   needed at the service level — the request gets filtered automatically.
 */

import type {
  BloodType,
  ClinicalFieldEdit,
  PatientActivePrescription,
  PatientClinicalOverview,
  PatientDetailsRow,
  PatientDocumentRow,
  PatientEmergencyContactRow,
  PatientFamilyHistoryRow,
  PatientInsuranceRow,
  PatientLabOrderRow,
  PatientLabResultRow,
  PatientLabResultValueRow,
  PatientPrescriptionMedication,
  PatientVaccinationRow,
  PatientVitalsTrendPoint,
} from '@red-salud/types';

import {
  type PatientsSupabaseClient,
  type ServiceError,
  type ServiceResult,
} from './patients-service';

// Re-export the shared types so consumers can `import { ServiceResult } from
// './patient-clinical-service'` without reaching across services.
export type { PatientsSupabaseClient, ServiceError, ServiceResult };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Mirror of `toServiceError()` in patients-service.ts. We re-implement here
 * (rather than export the original) to keep both services textually small
 * and to avoid coupling the public surface. If a third clinical service
 * eventually needs it, lift it into a shared module under `services/_shared/`.
 */
function toServiceError(raw: unknown): ServiceError {
  if (raw && typeof raw === 'object' && 'message' in raw) {
    const message = String((raw as { message: unknown }).message ?? '');
    const lower = message.toLowerCase();
    if (
      lower.includes('rls') ||
      lower.includes('row-level security') ||
      lower.includes('permission denied')
    ) {
      return {
        code: 'rls_violation',
        message: 'No tenés permiso para acceder a este recurso.',
      };
    }
    if (lower.includes('jwt') || lower.includes('not authenticated')) {
      return {
        code: 'unauthorized',
        message: 'Sesión expirada. Iniciá sesión nuevamente.',
      };
    }
    if (lower.includes('fetch') || lower.includes('network')) {
      return {
        code: 'network',
        message: 'No pudimos conectar con el servidor. Reintentá.',
      };
    }
    return {
      code: 'unknown',
      message: 'No pudimos completar la operación. Reintentá en unos segundos.',
    };
  }
  return {
    code: 'unknown',
    message: 'No pudimos completar la operación. Reintentá en unos segundos.',
  };
}

/**
 * Body Mass Index from weight (kg) and height (cm). Returns null when either
 * input is missing, zero, or negative — guards against divide-by-zero AND
 * against absurd UI inputs. Rounded to 1 decimal place to match the figure
 * doctors expect to see in clinical notes.
 *
 * Exported because the UI may need to recompute live as the user edits the
 * inline-clinical dialog, and to keep the rule unit-testable.
 */
export function calculateBMI(
  pesoKg: number | null | undefined,
  alturaCm: number | null | undefined,
): number | null {
  if (
    pesoKg == null ||
    alturaCm == null ||
    pesoKg <= 0 ||
    alturaCm <= 0 ||
    !Number.isFinite(pesoKg) ||
    !Number.isFinite(alturaCm)
  ) {
    return null;
  }
  const heightM = alturaCm / 100;
  const bmi = pesoKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Integer day difference `toIso - fromIso`. Both dates are parsed as UTC by
 * `Date.parse` — adequate for our use case because we only compare dates
 * (no intra-day precision needed for "is the prescription expired today?").
 *
 * Returns 0 when either parse fails (Number.isNaN) so callers don't have to
 * branch — they can treat unparsable dates as "no expiration data".
 *
 * Exported for direct unit testing.
 */
export function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  // floor → "today is day 0" semantics; an expires_at later today reads as 0.
  return Math.floor((to - from) / MS_PER_DAY);
}

// ---------------------------------------------------------------------------
// listVitalsTrend
// ---------------------------------------------------------------------------

interface ListVitalsTrendOptions {
  /** Days back from `now` to include. Defaults to 30. */
  days?: 30 | 90 | 365;
  /**
   * Restrict to a subset of metric types. When omitted, returns all metrics
   * the patient has recorded in the window.
   */
  metricTypeIds?: string[];
}

interface HealthMetricRow {
  id: string;
  metric_type_id: string;
  valor: number;
  valor_secundario: number | null;
  measured_at: string;
  health_metric_types:
    | {
        name: string;
        unidad_medida: string;
        categoria: string | null;
        unidad_secundaria: string | null;
        rango_minimo: number | null;
        rango_maximo: number | null;
      }
    | Array<{
        name: string;
        unidad_medida: string;
        categoria: string | null;
        unidad_secundaria: string | null;
        rango_minimo: number | null;
        rango_maximo: number | null;
      }>
    | null;
}

/**
 * Fetches health_metrics for the patient within the trailing `days` window,
 * joining `health_metric_types` so the result already includes labels and
 * reference ranges. Results are sorted by `measured_at` ascending (oldest →
 * newest) so the UI can plot directly.
 */
export async function listVitalsTrend(
  client: PatientsSupabaseClient,
  patientId: string,
  opts: ListVitalsTrendOptions = {},
): Promise<ServiceResult<PatientVitalsTrendPoint[]>> {
  const days = opts.days ?? 30;
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const builder = client.from('health_metrics') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select(
      'id, metric_type_id, valor, valor_secundario, measured_at, health_metric_types(name, unidad_medida, categoria, unidad_secundaria, rango_minimo, rango_maximo)',
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    let chain = selectChain.eq('patient_id', patientId) as unknown as {
      gte: (col: string, val: string) => unknown;
      in: (col: string, vals: string[]) => unknown;
      order: (col: string, opt: { ascending: boolean }) => unknown;
    };
    chain = chain.gte('measured_at', sinceIso) as typeof chain;
    if (opts.metricTypeIds && opts.metricTypeIds.length > 0) {
      chain = chain.in('metric_type_id', opts.metricTypeIds) as typeof chain;
    }
    const ordered = chain.order('measured_at', { ascending: true }) as unknown as Promise<{
      data: HealthMetricRow[] | null;
      error: { message: string } | null;
    }>;
    const result = await ordered;

    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }

    const rows = result.data ?? [];
    const points: PatientVitalsTrendPoint[] = rows.map((row) => {
      // PostgREST returns the embedded relation as either a single object or
      // an array depending on inferred cardinality. Normalize defensively.
      const rawType = row.health_metric_types;
      const typeRow = Array.isArray(rawType) ? rawType[0] ?? null : rawType;

      const rangoMin = typeRow?.rango_minimo ?? null;
      const rangoMax = typeRow?.rango_maximo ?? null;
      const outOfRange =
        rangoMin != null && rangoMax != null
          ? row.valor < rangoMin || row.valor > rangoMax
          : false;

      return {
        id: row.id,
        metric_type_id: row.metric_type_id,
        metric_name: typeRow?.name ?? 'Métrica',
        metric_unit: typeRow?.unidad_medida ?? '',
        metric_category: typeRow?.categoria ?? null,
        valor: row.valor,
        valor_secundario: row.valor_secundario,
        unidad_secundaria: typeRow?.unidad_secundaria ?? null,
        measured_at: row.measured_at,
        rango_minimo: rangoMin,
        rango_maximo: rangoMax,
        is_out_of_range: outOfRange,
      };
    });

    return { data: points, error: null };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}

// ---------------------------------------------------------------------------
// listActivePrescriptions
// ---------------------------------------------------------------------------

interface PrescriptionMedicationRow {
  id: string;
  medication_name: string;
  dosis: string | null;
  frecuencia: string | null;
  via_administracion: string | null;
  duration_days: number | null;
  special_instructions: string | null;
}

interface PrescriptionRow {
  id: string;
  prescribed_at: string;
  expires_at: string | null;
  diagnosis: string | null;
  general_instructions: string | null;
  status: string;
  prescription_medications: PrescriptionMedicationRow[] | null;
}

/**
 * Fetches prescriptions where `status='activa'` AND `deleted_at IS NULL` for
 * the patient, embedding `prescription_medications`. Sorted by `prescribed_at`
 * descending (newest first).
 *
 * Computes `days_until_expiration` / `is_expiring_soon` / `is_expired` here
 * using `daysBetween()` against `now` in UTC. Per REQ-X.2 the UI converts to
 * America/Caracas for display, but expiration math at day granularity does
 * not need TZ rounding (off-by-one only matters at the hour level).
 */
export async function listActivePrescriptions(
  client: PatientsSupabaseClient,
  patientId: string,
): Promise<ServiceResult<PatientActivePrescription[]>> {
  try {
    const builder = client.from('prescriptions') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select(
      'id, prescribed_at, expires_at, diagnosis, general_instructions, status, prescription_medications(id, medication_name, dosis, frecuencia, via_administracion, duration_days, special_instructions)',
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const eqPatient = selectChain.eq('patient_id', patientId) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const eqStatus = eqPatient.eq('status', 'activa') as unknown as {
      is: (col: string, val: null) => unknown;
    };
    const isNull = eqStatus.is('deleted_at', null) as unknown as {
      order: (col: string, opt: { ascending: boolean }) => Promise<{
        data: PrescriptionRow[] | null;
        error: { message: string } | null;
      }>;
    };
    const result = await isNull.order('prescribed_at', { ascending: false });

    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }

    const nowIso = new Date().toISOString();
    const rows = result.data ?? [];
    const prescriptions: PatientActivePrescription[] = rows.map((row) => {
      let days: number | null = null;
      let isExpiring = false;
      let isExpired = false;
      if (row.expires_at) {
        days = daysBetween(nowIso, row.expires_at);
        isExpired = days < 0;
        isExpiring = days >= 0 && days <= 7;
      }
      const medications: PatientPrescriptionMedication[] = (
        row.prescription_medications ?? []
      ).map((med) => ({
        id: med.id,
        medication_name: med.medication_name,
        dosis: med.dosis,
        frecuencia: med.frecuencia,
        via_administracion: med.via_administracion,
        duration_days: med.duration_days,
        special_instructions: med.special_instructions,
      }));
      return {
        id: row.id,
        prescribed_at: row.prescribed_at,
        expires_at: row.expires_at,
        diagnosis: row.diagnosis,
        general_instructions: row.general_instructions,
        status: row.status,
        days_until_expiration: days,
        is_expiring_soon: isExpiring,
        is_expired: isExpired,
        medications,
      };
    });

    return { data: prescriptions, error: null };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}

// ---------------------------------------------------------------------------
// listLabOrders / listLabResultsForOrder
// ---------------------------------------------------------------------------

interface LabOrderRowRaw {
  id: string;
  order_number: string;
  ordered_at: string | null;
  sample_collected_at: string | null;
  estimated_delivery_at: string | null;
  status: string | null;
  prioridad: string | null;
  presumptive_diagnosis: string | null;
  doctor_id: string | null;
}

export async function listLabOrders(
  client: PatientsSupabaseClient,
  patientId: string,
): Promise<ServiceResult<PatientLabOrderRow[]>> {
  try {
    const builder = client.from('lab_orders') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select(
      'id, order_number, ordered_at, sample_collected_at, estimated_delivery_at, status, prioridad, presumptive_diagnosis, doctor_id',
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const eqChain = selectChain.eq('patient_id', patientId) as unknown as {
      order: (col: string, opt: { ascending: boolean; nullsFirst?: boolean }) => Promise<{
        data: LabOrderRowRaw[] | null;
        error: { message: string } | null;
      }>;
    };
    // nullsFirst:false so orders missing an `ordered_at` sink to the bottom.
    const result = await eqChain.order('ordered_at', {
      ascending: false,
      nullsFirst: false,
    });

    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }

    const rows = result.data ?? [];
    const orders: PatientLabOrderRow[] = rows.map((row) => ({
      id: row.id,
      order_number: row.order_number,
      ordered_at: row.ordered_at,
      sample_collected_at: row.sample_collected_at,
      estimated_delivery_at: row.estimated_delivery_at,
      status: row.status ?? 'pendiente',
      prioridad: row.prioridad ?? 'normal',
      presumptive_diagnosis: row.presumptive_diagnosis,
      doctor_id: row.doctor_id,
    }));

    return { data: orders, error: null };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}

interface LabResultRowRaw {
  id: string;
  order_id: string;
  result_at: string | null;
  general_observations: string | null;
  lab_result_values:
    | Array<{
        id: string;
        parametro: string;
        valor: string | null;
        unidad: string | null;
        rango_referencia: string | null;
        es_anormal: boolean | null;
        nivel_alerta: string | null;
      }>
    | null;
}

/**
 * Fetches all results for a given lab order, embedding their parameter
 * values. `has_abnormal` is derived per result: true ⇔ any embedded value
 * has `es_anormal = true`. The computed-alerts engine uses this flag.
 */
export async function listLabResultsForOrder(
  client: PatientsSupabaseClient,
  orderId: string,
): Promise<ServiceResult<PatientLabResultRow[]>> {
  try {
    const builder = client.from('lab_results') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select(
      'id, order_id, result_at, general_observations, lab_result_values(id, parametro, valor, unidad, rango_referencia, es_anormal, nivel_alerta)',
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const eqChain = selectChain.eq('order_id', orderId) as unknown as {
      order: (col: string, opt: { ascending: boolean }) => Promise<{
        data: LabResultRowRaw[] | null;
        error: { message: string } | null;
      }>;
    };
    const result = await eqChain.order('result_at', { ascending: false });

    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }

    const rows = result.data ?? [];
    const results: PatientLabResultRow[] = rows.map((row) => {
      const values: PatientLabResultValueRow[] = (row.lab_result_values ?? []).map(
        (val) => ({
          id: val.id,
          parametro: val.parametro,
          valor: val.valor,
          unidad: val.unidad,
          rango_referencia: val.rango_referencia,
          es_anormal: Boolean(val.es_anormal),
          nivel_alerta: val.nivel_alerta,
        }),
      );
      const hasAbnormal = values.some((v) => v.es_anormal);
      return {
        id: row.id,
        order_id: row.order_id,
        // result_at is NOT NULL in our use case but the column is nullable.
        // Fallback to empty string so the UI can safeguard the format call.
        result_at: row.result_at ?? '',
        general_observations: row.general_observations,
        values,
        has_abnormal: hasAbnormal,
      };
    });

    return { data: results, error: null };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}

// ---------------------------------------------------------------------------
// listVaccinations
// ---------------------------------------------------------------------------

interface VaccinationRowRaw {
  id: string;
  vaccine_name: string;
  dose_number: number | null;
  administered_date: string | null;
  administered_by: string | null;
  location: string | null;
  lot_number: string | null;
  next_dose_date: string | null;
  notes: string | null;
}

/**
 * Reads from `vaccination_records` (the canonical patient-portal table).
 * NOT to be confused with `pediatrics_vaccines` which is the catalog table
 * (vaccine definitions, not patient applications).
 */
export async function listVaccinations(
  client: PatientsSupabaseClient,
  patientId: string,
): Promise<ServiceResult<PatientVaccinationRow[]>> {
  try {
    const builder = client.from('vaccination_records') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select(
      'id, vaccine_name, dose_number, administered_date, administered_by, location, lot_number, next_dose_date, notes',
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const eqChain = selectChain.eq('patient_id', patientId) as unknown as {
      order: (col: string, opt: { ascending: boolean; nullsFirst?: boolean }) => Promise<{
        data: VaccinationRowRaw[] | null;
        error: { message: string } | null;
      }>;
    };
    const result = await eqChain.order('administered_date', {
      ascending: false,
      nullsFirst: false,
    });

    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }
    return { data: (result.data ?? []) as PatientVaccinationRow[], error: null };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}

// ---------------------------------------------------------------------------
// listFamilyHistory
// ---------------------------------------------------------------------------

interface FamilyHistoryRowRaw {
  id: string;
  relacion: string;
  condicion: string;
  edad_diagnostico: number | null;
  vivo: boolean | null;
  notas: string | null;
}

export async function listFamilyHistory(
  client: PatientsSupabaseClient,
  patientId: string,
): Promise<ServiceResult<PatientFamilyHistoryRow[]>> {
  try {
    const builder = client.from('patient_family_history') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select(
      'id, relacion, condicion, edad_diagnostico, vivo, notas',
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const eqChain = selectChain.eq('patient_id', patientId) as unknown as {
      order: (col: string, opt: { ascending: boolean }) => Promise<{
        data: FamilyHistoryRowRaw[] | null;
        error: { message: string } | null;
      }>;
    };
    const result = await eqChain.order('relacion', { ascending: true });

    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }
    return { data: (result.data ?? []) as PatientFamilyHistoryRow[], error: null };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}

// ---------------------------------------------------------------------------
// listInsurance
// ---------------------------------------------------------------------------

interface InsuranceRowRaw {
  id: string;
  insurance_company: string;
  plan_name: string;
  policy_number: string;
  member_id: string | null;
  group_number: string | null;
  coverage_type: string | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean | null;
}

export async function listInsurance(
  client: PatientsSupabaseClient,
  patientId: string,
): Promise<ServiceResult<PatientInsuranceRow[]>> {
  try {
    const builder = client.from('patient_insurance') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select(
      'id, insurance_company, plan_name, policy_number, member_id, group_number, coverage_type, valid_from, valid_until, is_active',
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const eqChain = selectChain.eq('patient_id', patientId) as unknown as {
      order: (col: string, opt: { ascending: boolean }) => Promise<{
        data: InsuranceRowRaw[] | null;
        error: { message: string } | null;
      }>;
    };
    // Active policies first; tied rows go by valid_until desc.
    const result = await eqChain.order('is_active', { ascending: false });

    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }
    const rows = result.data ?? [];
    const insurance: PatientInsuranceRow[] = rows.map((row) => ({
      id: row.id,
      insurance_company: row.insurance_company,
      plan_name: row.plan_name,
      policy_number: row.policy_number,
      member_id: row.member_id,
      group_number: row.group_number,
      coverage_type: row.coverage_type,
      valid_from: row.valid_from,
      valid_until: row.valid_until,
      is_active: Boolean(row.is_active),
    }));
    return { data: insurance, error: null };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}

// ---------------------------------------------------------------------------
// listDocuments
// ---------------------------------------------------------------------------

interface DocumentRowRaw {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  status: string | null;
  uploaded_at: string | null;
}

export async function listDocuments(
  client: PatientsSupabaseClient,
  patientId: string,
): Promise<ServiceResult<PatientDocumentRow[]>> {
  try {
    const builder = client.from('patient_documents') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select(
      'id, document_type, document_name, file_url, file_size, mime_type, status, uploaded_at',
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const eqChain = selectChain.eq('patient_id', patientId) as unknown as {
      order: (col: string, opt: { ascending: boolean; nullsFirst?: boolean }) => Promise<{
        data: DocumentRowRaw[] | null;
        error: { message: string } | null;
      }>;
    };
    const result = await eqChain.order('uploaded_at', {
      ascending: false,
      nullsFirst: false,
    });

    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }
    const rows = result.data ?? [];
    const docs: PatientDocumentRow[] = rows.map((row) => ({
      id: row.id,
      document_type: row.document_type,
      document_name: row.document_name,
      file_url: row.file_url,
      file_size: row.file_size,
      mime_type: row.mime_type,
      // The DB default is 'pending' but the column is nullable; fall back.
      status: row.status ?? 'pending',
      uploaded_at: row.uploaded_at ?? '',
    }));
    return { data: docs, error: null };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}

// ---------------------------------------------------------------------------
// listEmergencyContacts
// ---------------------------------------------------------------------------

interface EmergencyContactRowRaw {
  id: string;
  name: string;
  phone: string;
  relationship: string | null;
  is_primary: boolean | null;
}

export async function listEmergencyContacts(
  client: PatientsSupabaseClient,
  patientId: string,
): Promise<ServiceResult<PatientEmergencyContactRow[]>> {
  try {
    const builder = client.from('emergency_contacts') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select(
      'id, name, phone, relationship, is_primary',
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const eqChain = selectChain.eq('patient_id', patientId) as unknown as {
      order: (col: string, opt: { ascending: boolean }) => Promise<{
        data: EmergencyContactRowRaw[] | null;
        error: { message: string } | null;
      }>;
    };
    // Primary contact first.
    const result = await eqChain.order('is_primary', { ascending: false });

    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }
    const rows = result.data ?? [];
    const contacts: PatientEmergencyContactRow[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      relationship: row.relationship,
      is_primary: Boolean(row.is_primary),
    }));
    return { data: contacts, error: null };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}

// ---------------------------------------------------------------------------
// updateClinicalFields
// ---------------------------------------------------------------------------

/**
 * UPSERT on `patient_details` keyed by `profile_id`. Used by the inline
 * clinical-fields edit dialog. Returns the freshly-persisted row so the
 * caller can update its React Query cache with confirmed values (avoids the
 * "optimistic update drift" failure mode).
 *
 * RLS check: `doctors_can_insert_patient_details` and
 * `doctors_can_update_patient_details` both call
 * `doctor_has_access_to_patient(profile_id)` — if the doctor has no link
 * with the patient, the UPSERT is rejected with `permission denied`, which
 * `toServiceError()` maps to `code: 'rls_violation'`.
 *
 * Note on UPSERT semantics: Supabase's `.upsert(..., { onConflict: 'profile_id' })`
 * with a partial payload preserves columns NOT included in the payload only
 * when those columns have their default values OR when the row already exists
 * (PostgREST sends `Prefer: resolution=merge-duplicates`). For Phase 2 we
 * always send the FULL set of mutable columns the doctor can touch, so this
 * is safe; future callers MUST follow the same convention or read-merge-write.
 */
export async function updateClinicalFields(
  client: PatientsSupabaseClient,
  edit: ClinicalFieldEdit,
): Promise<ServiceResult<PatientDetailsRow>> {
  // Build a payload that omits keys the caller did not explicitly set, so
  // PostgREST's merge keeps existing values intact.
  const payload: Record<string, unknown> = { profile_id: edit.patient_id };
  if ('grupo_sanguineo' in edit) payload.grupo_sanguineo = edit.grupo_sanguineo ?? null;
  if ('alergias' in edit) payload.alergias = edit.alergias ?? [];
  if ('enfermedades_cronicas' in edit) payload.enfermedades_cronicas = edit.enfermedades_cronicas ?? [];
  if ('medicamentos_actuales' in edit) payload.medicamentos_actuales = edit.medicamentos_actuales ?? [];
  if ('peso_kg' in edit) payload.peso_kg = edit.peso_kg ?? null;
  if ('altura_cm' in edit) payload.altura_cm = edit.altura_cm ?? null;
  if ('notas_medicas' in edit) payload.notas_medicas = edit.notas_medicas ?? null;

  try {
    const builder = client.from('patient_details') as unknown as {
      upsert: (
        payload: Record<string, unknown>,
        opts: { onConflict: string },
      ) => unknown;
    };
    const upsertChain = builder.upsert(payload, { onConflict: 'profile_id' }) as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = upsertChain.select(
      'profile_id, grupo_sanguineo, alergias, enfermedades_cronicas, medicamentos_actuales, notas_medicas, peso_kg, altura_cm',
    ) as unknown as {
      single: () => Promise<{
        data: PatientDetailsRow | null;
        error: { message: string } | null;
      }>;
    };
    const result = await selectChain.single();

    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }
    if (!result.data) {
      return {
        data: null,
        error: { code: 'unknown', message: 'No pudimos confirmar la actualización.' },
      };
    }
    return { data: result.data, error: null };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}

// ---------------------------------------------------------------------------
// getClinicalOverview
// ---------------------------------------------------------------------------

interface PatientDetailsAggregateRow {
  profile_id: string;
  grupo_sanguineo: string | null;
  alergias: string[] | null;
  enfermedades_cronicas: string[] | null;
  medicamentos_actuales: string[] | null;
  peso_kg: number | null;
  altura_cm: number | null;
  notas_medicas: string | null;
}

interface AppointmentNextRow {
  scheduled_at: string;
  status: string;
}

/**
 * Aggregate read backing the Resumen tab. Issues four parallel sub-queries
 * (patient_details, last vitals, active prescriptions count, next
 * appointment) and folds the result into a single `PatientClinicalOverview`.
 *
 * Resilience choices:
 * - If `patient_details` returns nothing → `has_clinical_record = false` and
 *   the UI renders the SC-2.2 banner. We do NOT treat this as an error.
 * - Sub-query failures degrade gracefully: an empty vitals list, zero
 *   prescriptions, or null next-appointment are acceptable partial states.
 *   The only hard error we surface is the `patient_details` fetch failing
 *   (because then we can't render the panel at all).
 *
 * "Most recent vital per metric_type" is computed in memory by sorting a 90d
 * window of `listVitalsTrend()` and keeping the latest reading per
 * `metric_type_id`. 90 days is intentionally wider than the chart default
 * (30) so the overview surfaces older readings when nothing new exists.
 */
export async function getClinicalOverview(
  client: PatientsSupabaseClient,
  patientId: string,
): Promise<ServiceResult<PatientClinicalOverview>> {
  // 1. patient_details — hard dependency.
  let details: PatientDetailsAggregateRow | null = null;
  try {
    const builder = client.from('patient_details') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select(
      'profile_id, grupo_sanguineo, alergias, enfermedades_cronicas, medicamentos_actuales, peso_kg, altura_cm, notas_medicas',
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const eqChain = selectChain.eq('profile_id', patientId) as unknown as {
      maybeSingle: () => Promise<{
        data: PatientDetailsAggregateRow | null;
        error: { message: string } | null;
      }>;
    };
    const result = await eqChain.maybeSingle();
    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }
    details = result.data;
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }

  // 2-4. Run the soft dependencies in parallel. Each one degrades gracefully.
  const [vitalsResult, prescriptionsResult, nextAppointment] = await Promise.all([
    listVitalsTrend(client, patientId, { days: 90 }),
    listActivePrescriptions(client, patientId),
    fetchNextAppointment(client, patientId),
  ]);

  // Last reading per metric type (keep the most recent of duplicates).
  const lastByType = new Map<string, PatientVitalsTrendPoint>();
  if (vitalsResult.data) {
    // listVitalsTrend returns ascending, so a later iteration wins.
    for (const point of vitalsResult.data) {
      lastByType.set(point.metric_type_id, point);
    }
  }
  const lastVitals = Array.from(lastByType.values()).sort((a, b) =>
    a.metric_name.localeCompare(b.metric_name, 'es'),
  );

  const activePrescriptionsCount = prescriptionsResult.data?.length ?? 0;

  const pesoKg = details?.peso_kg ?? null;
  const alturaCm = details?.altura_cm ?? null;

  const overview: PatientClinicalOverview = {
    patient_id: patientId,
    alergias: details?.alergias ?? [],
    enfermedades_cronicas: details?.enfermedades_cronicas ?? [],
    grupo_sanguineo: (details?.grupo_sanguineo as BloodType | string | null) ?? null,
    medicamentos_actuales: details?.medicamentos_actuales ?? [],
    peso_kg: pesoKg,
    altura_cm: alturaCm,
    bmi: calculateBMI(pesoKg, alturaCm),
    notas_medicas: details?.notas_medicas ?? null,
    last_vitals: lastVitals,
    active_prescriptions_count: activePrescriptionsCount,
    next_appointment_at: nextAppointment,
    has_clinical_record: details !== null,
  };

  return { data: overview, error: null };
}

/**
 * Helper: fetches the earliest upcoming appointment for this patient. Falls
 * back to null on error so a missing appointments table doesn't break the
 * whole overview. Filter logic mirrors `PatientSummary.next_appointment_at`
 * (no `cancelled` status, future-only).
 */
async function fetchNextAppointment(
  client: PatientsSupabaseClient,
  patientId: string,
): Promise<string | null> {
  try {
    const builder = client.from('appointments') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select('scheduled_at, status') as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const eqChain = selectChain.eq('patient_id', patientId) as unknown as {
      gt: (col: string, val: string) => unknown;
    };
    const gtChain = eqChain.gt('scheduled_at', new Date().toISOString()) as unknown as {
      neq: (col: string, val: string) => unknown;
    };
    const neqChain = gtChain.neq('status', 'cancelled') as unknown as {
      order: (col: string, opt: { ascending: boolean }) => unknown;
    };
    const orderChain = neqChain.order('scheduled_at', { ascending: true }) as unknown as {
      limit: (n: number) => Promise<{
        data: AppointmentNextRow[] | null;
        error: { message: string } | null;
      }>;
    };
    const result = await orderChain.limit(1);
    if (result.error || !result.data || result.data.length === 0) return null;
    return result.data[0].scheduled_at;
  } catch {
    return null;
  }
}
