import { describe, expect, it } from 'vitest';
import {
  vitalsToMetrics,
  type MetricTypeLookup,
  type VitalSigns,
  type VitalsToMetricsInput,
} from '../vitals-to-metrics';

const FULL_LOOKUP: MetricTypeLookup = {
  'Presión Arterial Sistólica': { id: 'mt-sys' },
  'Presión Arterial Diastólica': { id: 'mt-dia' },
  'Frecuencia Cardíaca': { id: 'mt-fc' },
  'Temperatura Corporal': { id: 'mt-temp' },
  'Frecuencia Respiratoria': { id: 'mt-fr' },
  'Saturación de Oxígeno': { id: 'mt-spo2' },
  Peso: { id: 'mt-weight' },
  Altura: { id: 'mt-height' },
};

const EMPTY_VITALS: VitalSigns = {
  systolic_bp: null,
  diastolic_bp: null,
  heart_rate: null,
  temperature: null,
  respiratory_rate: null,
  oxygen_saturation: null,
  weight: null,
  height: null,
};

function makeInput(overrides: Partial<VitalsToMetricsInput> = {}): VitalsToMetricsInput {
  return {
    vitals: EMPTY_VITALS,
    metricTypes: FULL_LOOKUP,
    patient_id: 'pat-1',
    medical_record_id: 'mr-1',
    appointment_id: 'app-1',
    measured_at: '2026-05-13T12:00:00.000Z',
    medido_por: 'medico',
    ...overrides,
  };
}

describe('vitalsToMetrics (spec R6)', () => {
  it('R6-A: full vitals → 8 rows, each with medical_record_id and appointment_id set', () => {
    const rows = vitalsToMetrics(
      makeInput({
        vitals: {
          systolic_bp: 180,
          diastolic_bp: 100,
          heart_rate: 95,
          temperature: 37.2,
          respiratory_rate: 18,
          oxygen_saturation: 97,
          weight: 85,
          height: 170,
        },
      }),
    );
    expect(rows).toHaveLength(8);
    for (const row of rows) {
      expect(row.patient_id).toBe('pat-1');
      expect(row.medical_record_id).toBe('mr-1');
      expect(row.appointment_id).toBe('app-1');
      expect(row.measured_at).toBe('2026-05-13T12:00:00.000Z');
      expect(row.medido_por).toBe('medico');
    }
  });

  it('R6-A: BP=180/100 maps to two rows with correct metric_type_id and valor', () => {
    const rows = vitalsToMetrics(
      makeInput({
        vitals: { ...EMPTY_VITALS, systolic_bp: 180, diastolic_bp: 100 },
      }),
    );
    expect(rows).toHaveLength(2);
    const sys = rows.find((r) => r.metric_type_id === 'mt-sys');
    const dia = rows.find((r) => r.metric_type_id === 'mt-dia');
    expect(sys?.valor).toBe(180);
    expect(dia?.valor).toBe(100);
  });

  it('R6-C: partial vitals → only filled rows (no rows for nulls)', () => {
    const rows = vitalsToMetrics(
      makeInput({
        vitals: { ...EMPTY_VITALS, systolic_bp: 130 },
      }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.metric_type_id).toBe('mt-sys');
    expect(rows[0]?.valor).toBe(130);
  });

  it('all vitals null → 0 rows', () => {
    const rows = vitalsToMetrics(makeInput({ vitals: EMPTY_VITALS }));
    expect(rows).toEqual([]);
  });

  it('skips vitals whose metric_type is missing from the lookup (defensive)', () => {
    const rows = vitalsToMetrics(
      makeInput({
        vitals: { ...EMPTY_VITALS, systolic_bp: 130, weight: 80 },
        metricTypes: { 'Presión Arterial Sistólica': { id: 'mt-sys' } },
      }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.metric_type_id).toBe('mt-sys');
  });

  it('treats numeric 0 as a real value (not as missing)', () => {
    const rows = vitalsToMetrics(
      makeInput({
        vitals: { ...EMPTY_VITALS, temperature: 0 },
      }),
    );
    // 0 is a real value — should produce a row.
    expect(rows).toHaveLength(1);
    expect(rows[0]?.valor).toBe(0);
  });

  it('defaults measured_at to current time when not provided', () => {
    const before = Date.now();
    const rows = vitalsToMetrics(
      makeInput({
        vitals: { ...EMPTY_VITALS, heart_rate: 75 },
        measured_at: undefined,
      }),
    );
    const after = Date.now();
    expect(rows).toHaveLength(1);
    const measuredAtMs = new Date(rows[0]!.measured_at).getTime();
    expect(measuredAtMs).toBeGreaterThanOrEqual(before);
    expect(measuredAtMs).toBeLessThanOrEqual(after);
  });
});
