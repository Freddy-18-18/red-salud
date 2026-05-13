'use client';

/**
 * @file use-chronic-data.ts
 * @description Companion hook for `<ChronicMgmtModule>`. Orchestrates list
 * loading, selection, detail loading, and goal mutations via deps-injected
 * fetchers (production wires Supabase; tests inject mocks).
 *
 * Spec R1, R4, R5. Phase A of medicina-general-cronicos.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  evaluateSeverity,
  type AlertSeverity,
} from '@/lib/chronic/alert-evaluator';
import {
  resolveChronicList,
  type ActiveGoal,
  type BasicPatient,
  type ChronicPatientSummary,
} from '@/lib/chronic/patient-resolver';

// ============================================================================
// PUBLIC TYPES
// ============================================================================

export interface HealthMetricRow {
  id: string;
  patient_id: string;
  metric_type_id: string;
  valor: number;
  valor_secundario: number | null;
  measured_at: string;
}

export interface HealthGoalRow {
  id: string;
  patient_id: string;
  metric_type_id: string;
  titulo: string;
  valor_objetivo: number;
  starts_at: string;
  target_date: string | null;
  status: 'pending' | 'active' | 'completed' | 'paused';
}

export interface MetricTypeRow {
  id: string;
  name: string;
  unidad_medida: string;
  categoria: string;
  rango_minimo: number;
  rango_maximo: number;
}

export interface AlertResult {
  metric_type_id: string;
  metric_type_name: string;
  value: number;
  measured_at: string;
  severity: AlertSeverity;
  effectiveMax: number;
  via: 'goal' | 'default';
}

export interface CreateGoalInput {
  patient_id: string;
  metric_type_id: string;
  titulo: string;
  valor_objetivo: number;
  target_date?: string | null;
}

export interface UseChronicDataDeps {
  fetchChronicListData(doctorId: string): Promise<{
    patients: BasicPatient[];
    goals: ActiveGoal[];
    lastMeasurements: Record<string, string>;
  }>;
  fetchPatientDetail(patientId: string): Promise<{
    metrics: HealthMetricRow[];
    goals: HealthGoalRow[];
    metricTypes: MetricTypeRow[];
  }>;
  createGoal(input: CreateGoalInput): Promise<HealthGoalRow>;
  updateGoalStatus(id: string, status: HealthGoalRow['status']): Promise<void>;
}

export interface PatientDetailState {
  metrics: HealthMetricRow[];
  goals: HealthGoalRow[];
  metricTypes: MetricTypeRow[];
  alerts: AlertResult[];
}

export interface UseChronicDataResult {
  patients: ChronicPatientSummary[];
  selectedPatient: ChronicPatientSummary | null;
  setSelectedPatientId: (id: string | null) => void;
  patientDetail: PatientDetailState | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
  createGoal: (input: CreateGoalInput) => Promise<void>;
  updateGoalStatus: (id: string, status: HealthGoalRow['status']) => Promise<void>;
  refresh: () => Promise<void>;
}

// ============================================================================
// ALERT COMPUTATION
// ============================================================================

function computeAlerts(
  metrics: HealthMetricRow[],
  goals: HealthGoalRow[],
  metricTypes: MetricTypeRow[],
): AlertResult[] {
  const typeById = new Map(metricTypes.map((t) => [t.id, t]));
  const activeGoalByType = new Map(
    goals.filter((g) => g.status === 'active').map((g) => [g.metric_type_id, g]),
  );

  const out: AlertResult[] = [];
  for (const m of metrics) {
    const type = typeById.get(m.metric_type_id);
    if (!type) continue;
    const goal = activeGoalByType.get(m.metric_type_id) ?? null;
    const severity = evaluateSeverity(
      m.valor,
      { min: type.rango_minimo, max: type.rango_maximo },
      goal?.valor_objetivo ?? null,
    );
    if (!severity) continue;
    out.push({
      metric_type_id: type.id,
      metric_type_name: type.name,
      value: m.valor,
      measured_at: m.measured_at,
      severity,
      effectiveMax: goal?.valor_objetivo ?? type.rango_maximo,
      via: goal ? 'goal' : 'default',
    });
  }
  return out;
}

// ============================================================================
// HOOK
// ============================================================================

export function useChronicData(
  doctorId: string,
  deps: UseChronicDataDeps,
): UseChronicDataResult {
  const [patients, setPatients] = useState<ChronicPatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetail, setPatientDetail] = useState<PatientDetailState | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { patients: rawPatients, goals, lastMeasurements } =
        await deps.fetchChronicListData(doctorId);
      const resolved = resolveChronicList(rawPatients, goals, lastMeasurements);
      setPatients(resolved);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [deps, doctorId]);

  const loadDetail = useCallback(
    async (patientId: string) => {
      setDetailLoading(true);
      try {
        const { metrics, goals, metricTypes } = await deps.fetchPatientDetail(patientId);
        const alerts = computeAlerts(metrics, goals, metricTypes);
        setPatientDetail({ metrics, goals, metricTypes, alerts });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setDetailLoading(false);
      }
    },
    [deps],
  );

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedPatientId) {
      void loadDetail(selectedPatientId);
    } else {
      setPatientDetail(null);
    }
  }, [selectedPatientId, loadDetail]);

  const selectedPatient = useMemo<ChronicPatientSummary | null>(
    () =>
      selectedPatientId
        ? patients.find((p) => p.patient_id === selectedPatientId) ?? null
        : null,
    [patients, selectedPatientId],
  );

  const createGoal = useCallback(
    async (input: CreateGoalInput) => {
      await deps.createGoal(input);
      if (selectedPatientId) await loadDetail(selectedPatientId);
    },
    [deps, selectedPatientId, loadDetail],
  );

  const updateGoalStatus = useCallback(
    async (id: string, status: HealthGoalRow['status']) => {
      await deps.updateGoalStatus(id, status);
      if (selectedPatientId) await loadDetail(selectedPatientId);
    },
    [deps, selectedPatientId, loadDetail],
  );

  const refresh = useCallback(async () => {
    await loadList();
    if (selectedPatientId) await loadDetail(selectedPatientId);
  }, [loadList, loadDetail, selectedPatientId]);

  return {
    patients,
    selectedPatient,
    setSelectedPatientId,
    patientDetail,
    loading,
    detailLoading,
    error,
    createGoal,
    updateGoalStatus,
    refresh,
  };
}
