/**
 * @file patient-resolver.ts
 * @description Pure UNION resolver for the chronic patient list.
 *
 * Spec R1: a patient is "chronic" for the doctor when EITHER
 *   1. `patient_details.enfermedades_cronicas[]` contains a canonical tag
 *      (or a legacy variant that soft-matches), OR
 *   2. the patient has at least one `health_goals` row with `status='active'`.
 */

import { softMatchTag, type ChronicTag } from './canonical-tags';

export interface BasicPatient {
  patient_id: string;
  full_name: string;
  cedula: string | null;
  enfermedades_cronicas: string[];
}

export interface ActiveGoal {
  patient_id: string;
  metric_type_id: string;
  status: 'pending' | 'active' | 'completed' | 'paused';
}

export type ChronicReason = 'tag' | 'goal' | 'both';

export interface ChronicPatientSummary {
  patient_id: string;
  full_name: string;
  cedula: string | null;
  tags: ChronicTag[];
  activeGoalsCount: number;
  reason: ChronicReason;
  lastMeasurementAt: string | null;
}

function resolveTags(raw: string[]): ChronicTag[] {
  const seen = new Set<ChronicTag>();
  for (const value of raw) {
    const tag = softMatchTag(value);
    if (tag) seen.add(tag);
  }
  return Array.from(seen);
}

export function resolveChronicList(
  patients: BasicPatient[],
  goals: ActiveGoal[],
  lastMeasurementByPatient: Record<string, string> = {},
): ChronicPatientSummary[] {
  const activeCountByPatient = new Map<string, number>();
  for (const goal of goals) {
    if (goal.status !== 'active') continue;
    activeCountByPatient.set(
      goal.patient_id,
      (activeCountByPatient.get(goal.patient_id) ?? 0) + 1,
    );
  }

  const result: ChronicPatientSummary[] = [];
  for (const patient of patients) {
    const tags = resolveTags(patient.enfermedades_cronicas);
    const activeGoalsCount = activeCountByPatient.get(patient.patient_id) ?? 0;
    const hasTags = tags.length > 0;
    const hasGoals = activeGoalsCount > 0;

    if (!hasTags && !hasGoals) continue;

    const reason: ChronicReason =
      hasTags && hasGoals ? 'both' : hasTags ? 'tag' : 'goal';

    result.push({
      patient_id: patient.patient_id,
      full_name: patient.full_name,
      cedula: patient.cedula,
      tags,
      activeGoalsCount,
      reason,
      lastMeasurementAt: lastMeasurementByPatient[patient.patient_id] ?? null,
    });
  }

  result.sort((a, b) => a.full_name.localeCompare(b.full_name, 'es'));
  return result;
}
