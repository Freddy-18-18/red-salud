import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import {
  getLatestVitals,
  getVitalHistory,
  getVitalStats,
  logVitalSign,
  type VitalType,
  type VitalReading,
  type VitalStats,
} from "@/lib/services/vitals-service";
import { supabase } from "@/lib/supabase/client";

// ─── Latest Vitals ───────────────────────────────────────────────────────────

export function useLatestVitals(patientId: string | undefined) {
  const queryClient = useQueryClient();

  const { data, isFetching, error } = useQuery({
    queryKey: ["latestVitals", patientId],
    queryFn: async () => {
      const result = await getLatestVitals(patientId!);
      if (!result.success) throw new Error("Error cargando signos vitales");
      return result.data;
    },
    enabled: !!patientId,
    staleTime: 30_000,
  });

  const refresh = useCallback(
    () => queryClient.refetchQueries({ queryKey: ["latestVitals", patientId] }),
    [queryClient, patientId],
  );

  return {
    vitals: data ?? ({} as Record<VitalType, VitalReading | null>),
    loading: isFetching,
    error: error ? (error instanceof Error ? error.message : "Error desconocido") : null,
    refresh,
  };
}

// ─── Vital History ───────────────────────────────────────────────────────────

export function useVitalHistory(
  patientId: string | undefined,
  metricType: VitalType | undefined,
  days: number,
) {
  const { data, isFetching, error } = useQuery({
    queryKey: ["vitalHistory", patientId, metricType, days],
    queryFn: async () => {
      const result = await getVitalHistory(patientId!, metricType!, days);
      if (!result.success) throw new Error("Error cargando historial");
      return result.data;
    },
    enabled: !!patientId && !!metricType,
    staleTime: 30_000,
  });

  return {
    readings: data ?? ([] as VitalReading[]),
    loading: isFetching,
    error: error ? (error instanceof Error ? error.message : "Error desconocido") : null,
  };
}

// ─── Vital Stats ─────────────────────────────────────────────────────────────

export function useVitalStats(
  patientId: string | undefined,
  metricType: VitalType | undefined,
  days: number,
) {
  const { data, isFetching } = useQuery({
    queryKey: ["vitalStats", patientId, metricType, days],
    queryFn: async () => {
      const result = await getVitalStats(patientId!, metricType!, days);
      return result.data;
    },
    enabled: !!patientId && !!metricType,
    staleTime: 30_000,
  });

  const emptyStats: VitalStats = {
    min: 0,
    max: 0,
    average: 0,
    count: 0,
    trend: "stable",
    latestValue: null,
    latestDate: null,
  };

  return {
    stats: data ?? emptyStats,
    loading: isFetching,
  };
}

// ─── Log Vital Mutation ──────────────────────────────────────────────────────

export function useLogVital(patientId: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      vitalType,
      value,
      notes,
    }: {
      vitalType: VitalType;
      value: number;
      notes?: string;
    }) => {
      if (!patientId) throw new Error("No patient");
      const result = await logVitalSign(patientId, vitalType, value, notes);
      if (!result.success) throw new Error(result.error || "Error registrando");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["latestVitals", patientId] });
      queryClient.invalidateQueries({ queryKey: ["vitalHistory", patientId] });
      queryClient.invalidateQueries({ queryKey: ["vitalStats", patientId] });
    },
  });

  const log = async (vitalType: VitalType, value: number, notes?: string) => {
    if (!patientId) {
      return { success: false as const, error: "No patient", data: null };
    }
    try {
      const data = await mutation.mutateAsync({ vitalType, value, notes });
      return { success: true as const, data };
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : "Error desconocido",
        data: null,
      };
    }
  };

  return {
    log,
    logging: mutation.isPending,
  };
}

// ─── Combined Dashboard Hook ─────────────────────────────────────────────────

export function useVitalsDashboard() {
  const { data: userId, isLoading: initialLoading } = useQuery({
    queryKey: ["currentUserId"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id;
    },
    staleTime: 5 * 60 * 1000,
  });

  const latest = useLatestVitals(userId);
  const logVital = useLogVital(userId);

  return {
    userId,
    initialLoading,
    latest,
    logVital,
  };
}
