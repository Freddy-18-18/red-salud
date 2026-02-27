import { useState, useEffect, useCallback } from "react";
import {
  getHealthMetricTypes,
  getPatientHealthMetrics,
  createHealthMetric,
  getMetricStats,
  getMetricTrend,
  getPatientHealthGoals,
  createHealthGoal,
  getGoalProgress,
  getPatientMeasurementReminders,
  getHealthDashboardSummary,
} from "@/lib/supabase/services/health-metrics-service";
import type {
  HealthMetricType,
  HealthMetric,
  HealthGoal,
  MeasurementReminder,
  CreateHealthMetricData,
  CreateHealthGoalData,
  MetricStats,
  HealthDashboardSummary,
  MetricTrend,
  GoalProgress,
} from "@/lib/supabase/types/health-metrics";

// Hook para tipos de métricas
export function useHealthMetricTypes() {
  const [metricTypes, setMetricTypes] = useState<HealthMetricType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetricTypes = async () => {
      const result = await getHealthMetricTypes();
      if (result.success && result.data) {
        setMetricTypes(result.data);
      }
      setLoading(false);
    };

    loadMetricTypes();
  }, []);

  return { metricTypes, loading };
}

// Hook para métricas del paciente
export function usePatientHealthMetrics(
  patientId: string | undefined,
  filters?: {
    metricTypeId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    let cancelled = false;

    const loadMetrics = async () => {
      setLoading(true);
      const result = await getPatientHealthMetrics(patientId, filters);
      if (!cancelled) {
        if (result.success) {
          setMetrics(result.data || []); // Fallback to empty array
        } else {
          setError(String(result.error) || 'Error loading metrics');
        }
        setLoading(false);
      }
    };

    loadMetrics();

    return () => {
      cancelled = true;
    };
  }, [patientId, filters]);

  const refreshMetrics = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getPatientHealthMetrics(patientId, filters);
    if (result.success && result.data) {
      setMetrics(result.data);
    } else {
      setError(String(result.error) || 'Error loading metrics');
    }
    setLoading(false);
  }, [patientId, filters]);

  return { metrics, loading, error, refreshMetrics };
}

// Hook para crear métrica
export function useCreateHealthMetric() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (metricData: CreateHealthMetricData) => {
    setLoading(true);
    setError(null);
    const result = await createHealthMetric(metricData);
    setLoading(false);
    if (!result.success) {
      setError(String(result.error) || 'Error creating metric');
    }
    return result;
  };

  return { create, loading, error };
}

// Hook para estadísticas de métrica
export function useMetricStats(
  patientId: string | undefined,
  metricTypeId: string | undefined,
  days: number = 30
) {
  const [stats, setStats] = useState<MetricStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId || !metricTypeId) return;

    const loadStats = async () => {
      setLoading(true);
      const result = await getMetricStats(patientId, metricTypeId, days);
      if (result.success) {
        setStats(result.data);
      }
      setLoading(false);
    };

    loadStats();
  }, [patientId, metricTypeId, days]);

  return { stats, loading };
}

// Hook para tendencia de métrica
export function useMetricTrend(
  patientId: string | undefined,
  metricTypeId: string | undefined,
  days: number = 30
) {
  const [trend, setTrend] = useState<MetricTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId || !metricTypeId) return;

    const loadTrend = async () => {
      setLoading(true);
      const result = await getMetricTrend(patientId, metricTypeId, days);
      if (result.success && result.data) {
        setTrend(result.data);
      }
      setLoading(false);
    };

    loadTrend();
  }, [patientId, metricTypeId, days]);

  return { trend, loading };
}

// Hook para metas de salud
export function usePatientHealthGoals(patientId: string | undefined, status?: string) {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    let cancelled = false;

    const loadGoals = async () => {
      setLoading(true);
      const result = await getPatientHealthGoals(patientId, status);
      if (!cancelled) {
        if (result.success && result.data) {
          setGoals(result.data);
        }
        setLoading(false);
      }
    };

    loadGoals();

    return () => {
      cancelled = true;
    };
  }, [patientId, status]);

  const refreshGoals = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getPatientHealthGoals(patientId, status);
    if (result.success && result.data) {
      setGoals(result.data);
    }
    setLoading(false);
  }, [patientId, status]);

  return { goals, loading, refreshGoals };
}

// Hook para crear meta
export function useCreateHealthGoal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (goalData: CreateHealthGoalData) => {
    setLoading(true);
    setError(null);
    const result = await createHealthGoal(goalData);
    setLoading(false);
    if (!result.success) {
      setError(String(result.error) || 'Error creating goal');
    }
    return result;
  };

  return { create, loading, error };
}

// Hook para progreso de meta
export function useGoalProgress(goalId: string | undefined) {
  const [progress, setProgress] = useState<GoalProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!goalId) return;

    const loadProgress = async () => {
      setLoading(true);
      const result = await getGoalProgress(goalId);
      if (result.success) {
        setProgress(result.data);
      }
      setLoading(false);
    };

    loadProgress();
  }, [goalId]);

  return { progress, loading };
}

// Hook para recordatorios de medición
export function usePatientMeasurementReminders(patientId: string | undefined) {
  const [reminders, setReminders] = useState<MeasurementReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    let cancelled = false;

    const loadReminders = async () => {
      setLoading(true);
      const result = await getPatientMeasurementReminders(patientId);
      if (!cancelled) {
        if (result.success && result.data) {
          setReminders(result.data);
        }
        setLoading(false);
      }
    };

    loadReminders();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const refreshReminders = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getPatientMeasurementReminders(patientId);
    if (result.success && result.data) {
      setReminders(result.data);
    }
    setLoading(false);
  }, [patientId]);

  return { reminders, loading, refreshReminders };
}

// Hook para dashboard summary
export function useHealthDashboardSummary(patientId: string | undefined) {
  const [summary, setSummary] = useState<HealthDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    let cancelled = false;

    const loadSummary = async () => {
      setLoading(true);
      const result = await getHealthDashboardSummary(patientId);
      if (!cancelled) {
        if (result.success) {
          setSummary(result.data);
        }
        setLoading(false);
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const refreshSummary = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getHealthDashboardSummary(patientId);
    if (result.success && result.data) {
      setSummary(result.data);
    }
    setLoading(false);
  }, [patientId]);

  return { summary, loading, refreshSummary };
}

