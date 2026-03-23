import { useState, useEffect, useCallback } from "react";
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
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await labResultsService.getOrders(patientId);
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error cargando ordenes",
      );
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) refresh();
  }, [patientId, refresh]);

  return { orders, loading, error, refresh };
}

/**
 * Hook for a single lab order detail with results.
 */
export function useLabOrderDetail(orderId: string | undefined) {
  const [order, setOrder] = useState<LabOrder | null>(null);
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setError(null);

    labResultsService
      .getOrderDetail(orderId)
      .then((data) => {
        setOrder(data.order);
        setResults(data.results);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Error cargando detalle",
        );
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  return { order, results, loading, error };
}

/**
 * Hook for monitored parameters (unique parameters with latest values).
 */
export function useMonitoredParameters(patientId: string | undefined) {
  const [parameters, setParameters] = useState<MonitoredParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    setError(null);

    labResultsService
      .getMonitoredParameters(patientId)
      .then(setParameters)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Error cargando parametros",
        );
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  return { parameters, loading, error };
}

/**
 * Hook for parameter history (trend data for a specific parameter).
 */
export function useParameterHistory(
  patientId: string | undefined,
  parameterName: string | undefined,
  months: number = 12,
) {
  const [history, setHistory] = useState<ParameterHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId || !parameterName) {
      setHistory(null);
      return;
    }
    setLoading(true);
    setError(null);

    labResultsService
      .getParameterHistory(patientId, parameterName, months)
      .then(setHistory)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Error cargando historial",
        );
      })
      .finally(() => setLoading(false));
  }, [patientId, parameterName, months]);

  return { history, loading, error };
}
