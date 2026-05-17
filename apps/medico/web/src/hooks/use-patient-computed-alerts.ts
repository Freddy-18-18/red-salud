'use client';

import { useMemo } from 'react';
import type {
  ComputedAlert,
  ComputedAlertSeverity,
  PatientActivePrescription,
  PatientClinicalOverview,
  PatientVitalsTrendPoint,
} from '@red-salud/types';

interface UsePatientComputedAlertsInput {
  overview: PatientClinicalOverview | null;
  vitals: PatientVitalsTrendPoint[];
  prescriptions: PatientActivePrescription[];
}

/**
 * Pure-derivation hook: takes already-fetched overview / vitals /
 * prescriptions and produces a sorted `ComputedAlert[]` for the patient
 * detail banner. NO Supabase calls — this is the "join engine" that ties
 * the three streams together.
 *
 * Why it lives in a hook instead of a plain function: components consuming
 * it benefit from `useMemo` so the alert array reference is stable across
 * renders, which matters for downstream `key`-based reconciliation in
 * <AlertList />. Equally important: keeping it as a hook lets us swap in a
 * future "alert preferences" context (mute, snooze) without touching every
 * caller.
 *
 * Rules implemented:
 *
 *  1. Vital out of range (kind: 'vital_out_of_range')
 *     - For each vital where `is_out_of_range === true`, classify severity
 *       based on how far outside the range the value falls:
 *         - <= 20% deviation → 'warning'
 *         -  > 20% deviation → 'critical'
 *     - Edge: when only one of (min, max) is null, the service already
 *       returns is_out_of_range = false, so we never get here.
 *
 *  2. Rx expiring (kind: 'rx_expiring')
 *     - When `is_expiring_soon === true` and `is_expired === false`.
 *     - Always severity 'warning'.
 *
 *  3. Rx expired (kind: 'rx_expired')
 *     - When `is_expired === true`.
 *     - Always severity 'critical' (doctor needs to renew or replace).
 *
 *  4. Allergy/medication conflict (kind: 'allergy_med_conflict')
 *     - For each pair (allergy, medicamento_actual) — case-insensitive,
 *       accent-folded, substring match — surface a critical alert.
 *     - Substring (not exact equality) because allergies and medications are
 *       free-text: "penicilina" should match "Amoxicilina 500mg" only when
 *       the allergy itself contains a substring of the med string (or vice
 *       versa). We require >=4 chars on the matched token to avoid noise
 *       like "AAS" matching every word containing "aas".
 *
 *  5. Lab abnormal pending (kind: 'lab_abnormal_pending')
 *     - NOT computed here because lab results aren't part of the inputs.
 *       The Lab Estudios tab feeds them in separately via a future
 *       extension; for Phase 2 the variant exists in the type union so the
 *       UI is ready, but the engine does not yet emit it.
 *
 * Sorting: critical → warning → info, with newest-first within each tier.
 */
export function usePatientComputedAlerts(
  input: UsePatientComputedAlertsInput,
): ComputedAlert[] {
  const { overview, vitals, prescriptions } = input;

  return useMemo(() => {
    const alerts: ComputedAlert[] = [];

    // --- Rule 1: vitals -----------------------------------------------------
    for (const vital of vitals) {
      if (!vital.is_out_of_range) continue;
      const severity = severityForVital(vital);
      alerts.push({
        kind: 'vital_out_of_range',
        severity,
        metric_name: vital.metric_name,
        metric_value: vital.valor,
        metric_unit: vital.metric_unit,
        rango_minimo: vital.rango_minimo,
        rango_maximo: vital.rango_maximo,
        measured_at: vital.measured_at,
        message: messageForVital(vital, severity),
      });
    }

    // --- Rules 2 & 3: prescriptions ----------------------------------------
    for (const rx of prescriptions) {
      if (rx.is_expired && rx.expires_at) {
        alerts.push({
          kind: 'rx_expired',
          severity: 'critical',
          prescription_id: rx.id,
          diagnosis: rx.diagnosis,
          expires_at: rx.expires_at,
          message: rx.diagnosis
            ? `La receta de ${rx.diagnosis} venció. Renovala o reemplazala.`
            : 'Tenés una receta vencida. Renovala o reemplazala.',
        });
      } else if (rx.is_expiring_soon && rx.expires_at && rx.days_until_expiration != null) {
        const days = rx.days_until_expiration;
        const dayCopy = days === 0 ? 'hoy' : days === 1 ? 'mañana' : `en ${days} días`;
        alerts.push({
          kind: 'rx_expiring',
          severity: 'warning',
          prescription_id: rx.id,
          diagnosis: rx.diagnosis,
          expires_at: rx.expires_at,
          days_until_expiration: days,
          message: rx.diagnosis
            ? `La receta de ${rx.diagnosis} vence ${dayCopy}.`
            : `Tenés una receta que vence ${dayCopy}.`,
        });
      }
    }

    // --- Rule 4: allergy/medication conflicts ------------------------------
    // Uses `overview.alergias` against `overview.medicamentos_actuales` PLUS
    // the medication names embedded in the active prescriptions. The
    // overview free-text list is what the patient self-reported; the
    // prescription list is what the doctor actually issued — both can
    // diverge, so we check against both.
    if (overview && overview.alergias.length > 0) {
      const medicationTerms = new Set<string>();
      for (const med of overview.medicamentos_actuales) medicationTerms.add(med);
      for (const rx of prescriptions) {
        for (const med of rx.medications) medicationTerms.add(med.medication_name);
      }
      const seenPairs = new Set<string>();
      for (const allergy of overview.alergias) {
        const normalizedAllergy = normalizeForMatch(allergy);
        if (normalizedAllergy.length < 4) continue;
        for (const med of medicationTerms) {
          const normalizedMed = normalizeForMatch(med);
          if (normalizedMed.length < 4) continue;
          if (
            !normalizedMed.includes(normalizedAllergy) &&
            !normalizedAllergy.includes(normalizedMed)
          ) {
            continue;
          }
          // De-dupe identical pairs — overview.medicamentos_actuales may
          // shadow a prescription medication.
          const pairKey = `${normalizedAllergy}|${normalizedMed}`;
          if (seenPairs.has(pairKey)) continue;
          seenPairs.add(pairKey);

          alerts.push({
            kind: 'allergy_med_conflict',
            severity: 'critical',
            allergy_term: allergy,
            medication_term: med,
            message: `Alerta: el paciente declara alergia a "${allergy}" y figura "${med}" entre los medicamentos. Revisalo antes de prescribir.`,
          });
        }
      }
    }

    return sortBySeverity(alerts);
  }, [overview, vitals, prescriptions]);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const SEVERE_DEVIATION_PCT = 0.2; // 20% out of range → critical

function severityForVital(vital: PatientVitalsTrendPoint): ComputedAlertSeverity {
  // The service has already determined the vital is out of range; figure
  // out how badly. When the deviating bound is zero (e.g. min = 0), treat
  // any breach as critical to avoid divide-by-zero in the percentage calc.
  const { valor, rango_minimo, rango_maximo } = vital;
  if (rango_maximo != null && valor > rango_maximo) {
    if (rango_maximo === 0) return 'critical';
    const pct = (valor - rango_maximo) / rango_maximo;
    return pct > SEVERE_DEVIATION_PCT ? 'critical' : 'warning';
  }
  if (rango_minimo != null && valor < rango_minimo) {
    if (rango_minimo === 0) return 'critical';
    const pct = (rango_minimo - valor) / rango_minimo;
    return pct > SEVERE_DEVIATION_PCT ? 'critical' : 'warning';
  }
  // Defensive fallback — should be unreachable if the service computed
  // is_out_of_range correctly.
  return 'warning';
}

function messageForVital(
  vital: PatientVitalsTrendPoint,
  severity: ComputedAlertSeverity,
): string {
  const verb = severity === 'critical' ? 'muy por fuera' : 'fuera';
  const unit = vital.metric_unit ? ` ${vital.metric_unit}` : '';
  return `${vital.metric_name}: ${vital.valor}${unit} ${verb} del rango de referencia. Revisalo.`;
}

const ACCENT_RE = /[̀-ͯ]/g;

/** NFD + accent-strip + lowercase + collapse whitespace. */
function normalizeForMatch(raw: string): string {
  return raw.normalize('NFD').replace(ACCENT_RE, '').toLowerCase().trim();
}

function severityRank(severity: ComputedAlertSeverity): number {
  if (severity === 'critical') return 0;
  if (severity === 'warning') return 1;
  return 2;
}

function timestampForSort(alert: ComputedAlert): number {
  // When the alert carries a timestamp, prefer newer first; otherwise neutral.
  if (alert.kind === 'vital_out_of_range') return -Date.parse(alert.measured_at);
  if (alert.kind === 'rx_expiring' || alert.kind === 'rx_expired') {
    return -Date.parse(alert.expires_at);
  }
  if (alert.kind === 'lab_abnormal_pending') return -Date.parse(alert.result_at);
  return 0;
}

function sortBySeverity(alerts: ComputedAlert[]): ComputedAlert[] {
  return [...alerts].sort((a, b) => {
    const rankDiff = severityRank(a.severity) - severityRank(b.severity);
    if (rankDiff !== 0) return rankDiff;
    return timestampForSort(a) - timestampForSort(b);
  });
}
