import { describe, expect, it } from 'vitest';
import {
  resolveChronicList,
  type BasicPatient,
  type ActiveGoal,
} from '../patient-resolver';

const patientWithTags: BasicPatient = {
  patient_id: 'p1',
  full_name: 'Marianella Suárez',
  cedula: '13643562',
  enfermedades_cronicas: ['HTA'],
};
const patientWithLegacyTag: BasicPatient = {
  patient_id: 'p2',
  full_name: 'José Montilla',
  cedula: '9269229',
  enfermedades_cronicas: ['Diabetes'], // legacy free-text
};
const patientNoTags: BasicPatient = {
  patient_id: 'p3',
  full_name: 'Karim Moukhallalele',
  cedula: '15229045',
  enfermedades_cronicas: [],
};
const patientUnknownTags: BasicPatient = {
  patient_id: 'p4',
  full_name: 'Marlin Sánchez',
  cedula: '17497542',
  enfermedades_cronicas: ['Migraña'], // unrecognized
};

const goalForP3: ActiveGoal = {
  patient_id: 'p3',
  metric_type_id: 'mt-sys',
  status: 'active',
};

describe('resolveChronicList (spec R1)', () => {
  it('R1-A: includes a patient with a canonical chronic tag (reason=tag)', () => {
    const result = resolveChronicList([patientWithTags], []);
    expect(result).toHaveLength(1);
    expect(result[0]?.patient_id).toBe('p1');
    expect(result[0]?.tags).toEqual(['HTA']);
    expect(result[0]?.reason).toBe('tag');
    expect(result[0]?.activeGoalsCount).toBe(0);
  });

  it('R1-B: includes a patient with an active goal but no tags (reason=goal)', () => {
    const result = resolveChronicList([patientNoTags], [goalForP3]);
    expect(result).toHaveLength(1);
    expect(result[0]?.patient_id).toBe('p3');
    expect(result[0]?.tags).toEqual([]);
    expect(result[0]?.reason).toBe('goal');
    expect(result[0]?.activeGoalsCount).toBe(1);
  });

  it('reports reason=both when patient has tags AND active goals', () => {
    const result = resolveChronicList([patientWithTags], [
      { patient_id: 'p1', metric_type_id: 'mt-sys', status: 'active' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.reason).toBe('both');
    expect(result[0]?.activeGoalsCount).toBe(1);
  });

  it('R1-C: excludes patients with neither tag nor active goal', () => {
    const result = resolveChronicList([patientNoTags], []);
    expect(result).toEqual([]);
  });

  it('soft-matches legacy tag values to canonical (Diabetes → DM2)', () => {
    const result = resolveChronicList([patientWithLegacyTag], []);
    expect(result).toHaveLength(1);
    expect(result[0]?.tags).toEqual(['DM2']);
    expect(result[0]?.reason).toBe('tag');
  });

  it('excludes patients whose only tags are unrecognized (Migraña Crónica)', () => {
    const result = resolveChronicList([patientUnknownTags], []);
    expect(result).toEqual([]);
  });

  it('deduplicates canonical tags when patient has both canonical and legacy form', () => {
    const patient: BasicPatient = {
      ...patientWithTags,
      enfermedades_cronicas: ['HTA', 'Hipertension'],
    };
    const result = resolveChronicList([patient], []);
    expect(result[0]?.tags).toEqual(['HTA']);
  });

  it('counts only goals with status=active toward activeGoalsCount', () => {
    const goals: ActiveGoal[] = [
      { patient_id: 'p1', metric_type_id: 'mt-sys', status: 'active' },
      { patient_id: 'p1', metric_type_id: 'mt-dia', status: 'paused' },
      { patient_id: 'p1', metric_type_id: 'mt-weight', status: 'completed' },
    ];
    const result = resolveChronicList([patientWithTags], goals);
    expect(result[0]?.activeGoalsCount).toBe(1);
  });

  it('returns results sorted by patient full_name ascending (deterministic)', () => {
    const result = resolveChronicList(
      [patientWithTags, patientWithLegacyTag],
      [],
    );
    expect(result.map((r) => r.full_name)).toEqual([
      'José Montilla',
      'Marianella Suárez',
    ]);
  });

  it('passes through lastMeasurementAt when provided', () => {
    const result = resolveChronicList([patientWithTags], [], {
      p1: '2026-05-13T12:00:00.000Z',
    });
    expect(result[0]?.lastMeasurementAt).toBe('2026-05-13T12:00:00.000Z');
  });
});
