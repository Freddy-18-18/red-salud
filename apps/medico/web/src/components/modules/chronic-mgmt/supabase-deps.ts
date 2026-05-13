'use client';

/**
 * @file supabase-deps.ts
 * @description Production wiring for `useChronicData` deps. Translates the
 * pure-function contract into real Supabase queries against the medico's
 * schema (doctor_profiles → appointments → patients).
 */

import { supabase } from '@/lib/supabase/client';
import type { ActiveGoal, BasicPatient } from '@/lib/chronic/patient-resolver';
import type {
  CreateGoalInput,
  HealthGoalRow,
  HealthMetricRow,
  MetricTypeRow,
  UseChronicDataDeps,
} from './use-chronic-data';

/**
 * Build the deps bundle that `useChronicData(doctorId, deps)` consumes.
 * Each function maps directly to the spec's data dependencies.
 */
export function makeSupabaseChronicDeps(): UseChronicDataDeps {
  return {
    async fetchChronicListData(doctorId) {
      // 1) Pull doctor's distinct patient roster from appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('doctor_id', doctorId)
        .not('patient_id', 'is', null);

      const uniquePatientIds = Array.from(
        new Set(((appointments ?? []) as { patient_id: string | null }[])
          .map((a) => a.patient_id)
          .filter((id): id is string => Boolean(id))),
      );

      if (uniquePatientIds.length === 0) {
        return { patients: [], goals: [], lastMeasurements: {} };
      }

      // 2) Profile basics + patient_details in parallel (no embed; avoids FK ambiguity at REST layer)
      const [profilesRes, detailsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, national_id')
          .in('id', uniquePatientIds),
        supabase
          .from('patient_details')
          .select('profile_id, enfermedades_cronicas')
          .in('profile_id', uniquePatientIds),
      ]);

      const detailsByProfile = new Map<string, string[]>();
      for (const d of (detailsRes.data ?? []) as Array<{
        profile_id: string;
        enfermedades_cronicas: string[] | null;
      }>) {
        detailsByProfile.set(d.profile_id, d.enfermedades_cronicas ?? []);
      }

      const patients: BasicPatient[] = ((profilesRes.data ?? []) as Array<{
        id: string;
        full_name: string | null;
        national_id: string | null;
      }>).map((row) => ({
        patient_id: row.id,
        full_name: row.full_name ?? '(Sin nombre)',
        cedula: row.national_id,
        enfermedades_cronicas: detailsByProfile.get(row.id) ?? [],
      }));

      // 3) Active health goals for those patients
      const { data: goalRows } = await supabase
        .from('health_goals')
        .select('patient_id, metric_type_id, status')
        .in('patient_id', uniquePatientIds);

      const goals: ActiveGoal[] = ((goalRows ?? []) as ActiveGoal[]).filter(
        (g) => g.status === 'active',
      );

      // 4) Last measurement per patient (lightweight aggregate)
      const { data: latest } = await supabase
        .from('health_metrics')
        .select('patient_id, measured_at')
        .in('patient_id', uniquePatientIds)
        .order('measured_at', { ascending: false });

      const lastMeasurements: Record<string, string> = {};
      for (const row of (latest ?? []) as Array<{
        patient_id: string;
        measured_at: string;
      }>) {
        if (!lastMeasurements[row.patient_id]) {
          lastMeasurements[row.patient_id] = row.measured_at;
        }
      }

      return { patients, goals, lastMeasurements };
    },

    async fetchPatientDetail(patientId): Promise<{
      metrics: HealthMetricRow[];
      goals: HealthGoalRow[];
      metricTypes: MetricTypeRow[];
    }> {
      const [metricsRes, goalsRes, typesRes] = await Promise.all([
        supabase
          .from('health_metrics')
          .select('id, patient_id, metric_type_id, valor, valor_secundario, measured_at')
          .eq('patient_id', patientId)
          .order('measured_at', { ascending: false })
          .limit(200),
        supabase
          .from('health_goals')
          .select('id, patient_id, metric_type_id, titulo, valor_objetivo, starts_at, target_date, status')
          .eq('patient_id', patientId),
        supabase
          .from('health_metric_types')
          .select('id, name, unidad_medida, categoria, rango_minimo, rango_maximo'),
      ]);

      return {
        metrics: (metricsRes.data ?? []) as unknown as HealthMetricRow[],
        goals: (goalsRes.data ?? []) as unknown as HealthGoalRow[],
        metricTypes: (typesRes.data ?? []) as unknown as MetricTypeRow[],
      };
    },

    async createGoal(input: CreateGoalInput) {
      const { data, error } = await supabase
        .from('health_goals')
        .insert({
          patient_id: input.patient_id,
          metric_type_id: input.metric_type_id,
          titulo: input.titulo,
          valor_objetivo: input.valor_objetivo,
          starts_at: new Date().toISOString().slice(0, 10),
          target_date: input.target_date ?? null,
          status: 'active',
        })
        .select()
        .single();
      if (error || !data) throw error ?? new Error('insert failed');
      return data as unknown as HealthGoalRow;
    },

    async updateGoalStatus(id, status) {
      const { error } = await supabase
        .from('health_goals')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
  };
}
