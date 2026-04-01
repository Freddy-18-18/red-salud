import { useQuery } from "@tanstack/react-query";

import {
  labResultsService,
  type LabOrder,
  type LabResult,
  type MonitoredParameter,
  type ParameterHistory,
} from "@/lib/services/lab-results-service";

/**
 * Hook for the lab orders list.
 */
export function useLabOrders(patientId: string | undefined) {
  const query = useQuery({
    queryKey: ["lab-orders", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      return labResultsService.getOrders(patientId);
    },
    enabled: !!patientId,
  });

  return {
    orders: (query.data ?? []) as LabOrder[],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: () => query.refetch(),
  };
}

/**
 * Hook for a single lab order detail with results.
 */
export function useLabOrderDetail(orderId: string | undefined) {
  const query = useQuery({
    queryKey: ["lab-order-detail", orderId],
    queryFn: async () => {
      if (!orderId) return { order: null, results: [] };
      return labResultsService.getOrderDetail(orderId);
    },
    enabled: !!orderId,
  });

  return {
    order: query.data?.order ?? null,
    results: (query.data?.results ?? []) as LabResult[],
    loading: query.isLoading,
    error: query.error?.message ?? null,
  };
}

/**
 * Hook for monitored parameters (unique parameters with latest values).
 */
export function useMonitoredParameters(patientId: string | undefined) {
  const query = useQuery({
    queryKey: ["lab-monitored-parameters", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      return labResultsService.getMonitoredParameters(patientId);
    },
    enabled: !!patientId,
  });

  return {
    parameters: (query.data ?? []) as MonitoredParameter[],
    loading: query.isLoading,
    error: query.error?.message ?? null,
  };
}

/**
 * Hook for parameter history (trend data for a specific parameter).
 */
export function useParameterHistory(
  patientId: string | undefined,
  parameterName: string | undefined,
  months: number = 12,
) {
  const query = useQuery({
    queryKey: ["lab-parameter-history", patientId, parameterName, months],
    queryFn: async () => {
      if (!patientId || !parameterName) return null;
      return labResultsService.getParameterHistory(patientId, parameterName, months);
    },
    enabled: !!patientId && !!parameterName,
  });

  return {
    history: (query.data ?? null) as ParameterHistory | null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
