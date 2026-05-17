/**
 * @file __tests__/use-patient-computed-alerts.test.ts
 * @description Behavior tests for the pure derivation hook
 * `usePatientComputedAlerts` (T-2 / Phase 2). The hook takes already-fetched
 * overview / vitals / prescriptions and emits a sorted `ComputedAlert[]`.
 *
 * Contract:
 * - Returns [] when overview is null (no clinical record).
 * - Returns [] when no vitals out of range + no expired/expiring rx + no
 *   allergy/medication conflict.
 * - Emits `vital_out_of_range` with severity 'warning' when deviation <= 20%
 *   and 'critical' when > 20%.
 * - Emits `rx_expired` (severity critical) when `is_expired === true`.
 * - Emits `rx_expiring` (severity warning) when `is_expiring_soon === true`
 *   and `days_until_expiration <= 7`.
 * - Emits `allergy_med_conflict` (severity critical) when an allergy substring
 *   matches a medication name (>= 4 chars to avoid false positives).
 * - Does NOT emit a conflict when the allergy term is < 4 chars.
 * - Multiple alerts coexist.
 */

import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import type {
  PatientActivePrescription,
  PatientClinicalOverview,
  PatientVitalsTrendPoint,
} from '@red-salud/types';

import { usePatientComputedAlerts } from '../use-patient-computed-alerts';

// ---------------------------------------------------------------------------
// Fixture builders — keep tests declarative and easy to skim.
// ---------------------------------------------------------------------------

function makeOverview(
  overrides: Partial<PatientClinicalOverview> = {},
): PatientClinicalOverview {
  return {
    patient_id: '00000000-0000-0000-0000-000000000001',
    alergias: [],
    enfermedades_cronicas: [],
    grupo_sanguineo: null,
    medicamentos_actuales: [],
    peso_kg: null,
    altura_cm: null,
    bmi: null,
    notas_medicas: null,
    last_vitals: [],
    active_prescriptions_count: 0,
    next_appointment_at: null,
    has_clinical_record: true,
    ...overrides,
  };
}

function makeVital(
  overrides: Partial<PatientVitalsTrendPoint> = {},
): PatientVitalsTrendPoint {
  return {
    id: '00000000-0000-0000-0000-0000000000v1',
    metric_type_id: 'mt-weight',
    metric_name: 'Peso',
    metric_unit: 'kg',
    metric_category: 'antropometria',
    valor: 70,
    valor_secundario: null,
    unidad_secundaria: null,
    measured_at: '2026-05-10T12:00:00Z',
    rango_minimo: 50,
    rango_maximo: 90,
    is_out_of_range: false,
    ...overrides,
  };
}

function makeRx(
  overrides: Partial<PatientActivePrescription> = {},
): PatientActivePrescription {
  return {
    id: '00000000-0000-0000-0000-0000000000r1',
    prescribed_at: '2026-04-01',
    expires_at: '2026-07-01',
    diagnosis: 'Hipertensión',
    general_instructions: null,
    status: 'activa',
    days_until_expiration: 30,
    is_expiring_soon: false,
    is_expired: false,
    medications: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('usePatientComputedAlerts', () => {
  it('returns empty array when overview is null', () => {
    const { result } = renderHook(() =>
      usePatientComputedAlerts({
        overview: null,
        vitals: [],
        prescriptions: [],
      }),
    );
    expect(result.current).toEqual([]);
  });

  it('returns empty when no vitals out of range, no rx issues, no conflicts', () => {
    const { result } = renderHook(() =>
      usePatientComputedAlerts({
        overview: makeOverview(),
        vitals: [makeVital({ is_out_of_range: false })],
        prescriptions: [makeRx()],
      }),
    );
    expect(result.current).toEqual([]);
  });

  it('emits vital_out_of_range warning when deviation <= 20%', () => {
    // valor 100, rango_maximo 90 → (100-90)/90 = 11.1% → warning
    const { result } = renderHook(() =>
      usePatientComputedAlerts({
        overview: makeOverview(),
        vitals: [
          makeVital({
            valor: 100,
            rango_minimo: 50,
            rango_maximo: 90,
            is_out_of_range: true,
          }),
        ],
        prescriptions: [],
      }),
    );
    expect(result.current).toHaveLength(1);
    const alert = result.current[0];
    expect(alert.kind).toBe('vital_out_of_range');
    expect(alert.severity).toBe('warning');
  });

  it('emits vital_out_of_range critical when deviation > 20%', () => {
    // valor 120, rango_maximo 90 → (120-90)/90 = 33.3% → critical
    const { result } = renderHook(() =>
      usePatientComputedAlerts({
        overview: makeOverview(),
        vitals: [
          makeVital({
            valor: 120,
            rango_minimo: 50,
            rango_maximo: 90,
            is_out_of_range: true,
          }),
        ],
        prescriptions: [],
      }),
    );
    expect(result.current).toHaveLength(1);
    const alert = result.current[0];
    expect(alert.kind).toBe('vital_out_of_range');
    expect(alert.severity).toBe('critical');
  });

  it('emits rx_expired (critical) when prescription is_expired=true', () => {
    const { result } = renderHook(() =>
      usePatientComputedAlerts({
        overview: makeOverview(),
        vitals: [],
        prescriptions: [
          makeRx({
            expires_at: '2026-03-01',
            days_until_expiration: -30,
            is_expired: true,
            is_expiring_soon: false,
          }),
        ],
      }),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].kind).toBe('rx_expired');
    expect(result.current[0].severity).toBe('critical');
  });

  it('emits rx_expiring (warning) when is_expiring_soon and days <= 7', () => {
    const { result } = renderHook(() =>
      usePatientComputedAlerts({
        overview: makeOverview(),
        vitals: [],
        prescriptions: [
          makeRx({
            expires_at: '2026-05-20',
            days_until_expiration: 5,
            is_expiring_soon: true,
            is_expired: false,
          }),
        ],
      }),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].kind).toBe('rx_expiring');
    expect(result.current[0].severity).toBe('warning');
  });

  it('emits allergy_med_conflict (critical) on case-insensitive substring match (>= 4 chars)', () => {
    // "penicilina" (10 chars) is a substring of "Amoxicilina-Penicilina 500mg".
    // Both terms >= 4 chars normalized → conflict.
    const { result } = renderHook(() =>
      usePatientComputedAlerts({
        overview: makeOverview({
          alergias: ['Penicilina'],
          medicamentos_actuales: ['amoxicilina-penicilina 500mg'],
        }),
        vitals: [],
        prescriptions: [],
      }),
    );
    expect(result.current.length).toBeGreaterThan(0);
    const conflict = result.current.find((a) => a.kind === 'allergy_med_conflict');
    expect(conflict).toBeDefined();
    expect(conflict?.severity).toBe('critical');
    if (conflict?.kind === 'allergy_med_conflict') {
      expect(conflict.allergy_term).toBe('Penicilina');
    }
  });

  it('does NOT emit allergy_med_conflict when allergy term is < 4 chars', () => {
    // "AAS" (3 chars normalized) is below the 4-char threshold → no conflict
    // even though it would substring-match "Aspirina".
    const { result } = renderHook(() =>
      usePatientComputedAlerts({
        overview: makeOverview({
          alergias: ['AAS'],
          medicamentos_actuales: ['Aspirina 100mg'],
        }),
        vitals: [],
        prescriptions: [],
      }),
    );
    const conflicts = result.current.filter(
      (a) => a.kind === 'allergy_med_conflict',
    );
    expect(conflicts).toHaveLength(0);
  });

  it('emits multiple alerts coexisting (vital + rx_expired + conflict)', () => {
    const { result } = renderHook(() =>
      usePatientComputedAlerts({
        overview: makeOverview({
          alergias: ['Penicilina'],
          medicamentos_actuales: ['penicilina-G 1M UI'],
        }),
        vitals: [
          makeVital({
            valor: 200,
            rango_minimo: 50,
            rango_maximo: 90,
            is_out_of_range: true,
          }),
        ],
        prescriptions: [
          makeRx({
            expires_at: '2026-03-01',
            days_until_expiration: -10,
            is_expired: true,
          }),
        ],
      }),
    );
    // 1 vital + 1 rx_expired + 1 conflict = 3.
    expect(result.current).toHaveLength(3);
    const kinds = result.current.map((a) => a.kind);
    expect(kinds).toContain('vital_out_of_range');
    expect(kinds).toContain('rx_expired');
    expect(kinds).toContain('allergy_med_conflict');
  });
});
