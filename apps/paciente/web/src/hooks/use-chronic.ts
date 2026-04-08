import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import {
  getConditions,
  addCondition,
  getConditionDetail,
  updateCondition,
  getReadings,
  logReading,
  getGoals,
  createGoal,
  updateGoal,
  getAlerts,
  getDateRange,
  type ChronicCondition,
  type ChronicConditionDetail,
  type ChronicReading,
  type ChronicGoal,
  type ChronicAlert,
  type AddConditionData,
  type LogReadingData,
  type CreateGoalData,
  type DateRange,
} from "@/lib/services/chronic-service";

/* ------------------------------------------------------------------ */
/*  Conditions                                                         */
/* ------------------------------------------------------------------ */

export function useChronicConditions() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["chronic-conditions"],
    queryFn: getConditions,
    staleTime: 2 * 60 * 1000, // 2 min
  });

  return {
    conditions: data ?? ([] as ChronicCondition[]),
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Error cargando condiciones"
      : null,
    refetch,
  };
}

/* ------------------------------------------------------------------ */
/*  Add Condition (mutation)                                           */
/* ------------------------------------------------------------------ */

export function useAddCondition() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: AddConditionData) => addCondition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chronic-conditions"] });
      queryClient.invalidateQueries({ queryKey: ["chronic-alerts"] });
    },
  });

  return {
    addCondition: mutation.mutateAsync,
    adding: mutation.isPending,
    error: mutation.error
      ? mutation.error instanceof Error
        ? mutation.error.message
        : "Error registrando condicion"
      : null,
  };
}

/* ------------------------------------------------------------------ */
/*  Condition Detail                                                   */
/* ------------------------------------------------------------------ */

export function useConditionDetail(id: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["chronic-condition-detail", id],
    queryFn: () => getConditionDetail(id!),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 min
  });

  return {
    condition: data as ChronicConditionDetail | undefined,
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Error cargando detalle"
      : null,
  };
}

/* ------------------------------------------------------------------ */
/*  Update Condition (mutation)                                        */
/* ------------------------------------------------------------------ */

export function useUpdateCondition() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateCondition>[1];
    }) => updateCondition(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chronic-conditions"] });
      queryClient.invalidateQueries({
        queryKey: ["chronic-condition-detail", variables.id],
      });
    },
  });

  return {
    updateCondition: mutation.mutateAsync,
    updating: mutation.isPending,
  };
}

/* ------------------------------------------------------------------ */
/*  Readings                                                           */
/* ------------------------------------------------------------------ */

export function useChronicReadings(
  conditionId: string | undefined,
  type?: string,
  period: "7d" | "30d" | "90d" | "6m" | "1y" = "30d",
) {
  const dateRange: DateRange = useMemo(() => getDateRange(period), [period]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["chronic-readings", conditionId, type, period],
    queryFn: () => getReadings(conditionId!, type, dateRange),
    enabled: !!conditionId,
    staleTime: 30_000,
  });

  return {
    readings: data ?? ([] as ChronicReading[]),
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Error cargando lecturas"
      : null,
  };
}

/* ------------------------------------------------------------------ */
/*  Log Reading (mutation)                                             */
/* ------------------------------------------------------------------ */

export function useLogReading() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: LogReadingData) => logReading(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chronic-readings", variables.condition_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["chronic-condition-detail", variables.condition_id],
      });
      queryClient.invalidateQueries({ queryKey: ["chronic-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["chronic-conditions"] });
    },
  });

  return {
    logReading: mutation.mutateAsync,
    logging: mutation.isPending,
    error: mutation.error
      ? mutation.error instanceof Error
        ? mutation.error.message
        : "Error registrando lectura"
      : null,
    reset: mutation.reset,
  };
}

/* ------------------------------------------------------------------ */
/*  Goals                                                              */
/* ------------------------------------------------------------------ */

export function useChronicGoals() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["chronic-goals"],
    queryFn: getGoals,
    staleTime: 2 * 60 * 1000,
  });

  return {
    goals: data ?? ([] as ChronicGoal[]),
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Error cargando metas"
      : null,
  };
}

/* ------------------------------------------------------------------ */
/*  Create Goal (mutation)                                             */
/* ------------------------------------------------------------------ */

export function useCreateGoal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateGoalData) => createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chronic-goals"] });
    },
  });

  return {
    createGoal: mutation.mutateAsync,
    creating: mutation.isPending,
  };
}

/* ------------------------------------------------------------------ */
/*  Update Goal (mutation)                                             */
/* ------------------------------------------------------------------ */

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateGoal>[1];
    }) => updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chronic-goals"] });
    },
  });

  return {
    updateGoal: mutation.mutateAsync,
    updating: mutation.isPending,
  };
}

/* ------------------------------------------------------------------ */
/*  Alerts                                                             */
/* ------------------------------------------------------------------ */

export function useChronicAlerts() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["chronic-alerts"],
    queryFn: getAlerts,
    staleTime: 5 * 60 * 1000, // 5 min
    refetchOnWindowFocus: true,
  });

  const criticalAlerts = useMemo(
    () => (data ?? []).filter((a) => a.severity === "critical"),
    [data],
  );

  const dismissAlert = useCallback(
    (alertId: string) => {
      // Client-side dismiss — filter out of cache
      queryClient_noop(alertId);
    },
    [],
  );

  return {
    alerts: data ?? ([] as ChronicAlert[]),
    criticalAlerts,
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Error cargando alertas"
      : null,
    refetch,
    dismissAlert,
  };
}

// No-op for client-side dismiss (alerts are computed server-side)
function queryClient_noop(_id: string) {
  // Alerts regenerate on next fetch — no persist needed
}
