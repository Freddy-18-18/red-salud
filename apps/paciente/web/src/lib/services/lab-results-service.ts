import { fetchJson } from "@/lib/utils/fetch";

// ---------- Types ----------

export interface LabOrder {
  id: string;
  patient_id: string;
  doctor_id: string;
  laboratory_id: string;
  order_number: string;
  ordered_at: string;
  status: "ordenada" | "muestra_tomada" | "en_proceso" | "completada" | "cancelada";
  doctor?: { full_name?: string; avatar_url?: string };
  laboratory?: { name?: string };
  tests?: LabOrderTest[];
}

export interface LabOrderTest {
  id: string;
  order_id: string;
  test_type_id: string;
  result_available: boolean;
  test_type?: LabTestType;
}

export interface LabTestType {
  id: string;
  name: string;
  description?: string;
  reference_price?: number;
}

export interface LabResult {
  id: string;
  order_id: string;
  test_type_id: string;
  result_at: string;
  validated_at?: string;
  general_observations?: string;
  result_pdf_url?: string;
  test_type?: LabTestType;
  values?: LabResultValue[];
}

export interface LabResultValue {
  id: string;
  result_id: string;
  parameter_name: string;
  value: number;
  unit: string;
  reference_min: number;
  reference_max: number;
  status: "normal" | "alto" | "bajo" | "critico";
}

export interface MonitoredParameter {
  parameter_name: string;
  unit: string;
  reference_min: number;
  reference_max: number;
  latest_value: number;
  latest_status: "normal" | "alto" | "bajo" | "critico";
  latest_date: string;
  trend: "up" | "down" | "stable";
}

export interface ParameterHistoryPoint {
  value: number;
  date: string;
  status: "normal" | "alto" | "bajo" | "critico";
}

export interface ParameterHistory {
  parameter_name: string;
  unit: string;
  reference_min: number;
  reference_max: number;
  points: ParameterHistoryPoint[];
  stats: {
    min: number;
    max: number;
    average: number;
    trend: "up" | "down" | "stable";
  };
}

// ---------- Helpers ----------

function computeTrend(values: number[]): "up" | "down" | "stable" {
  if (values.length < 2) return "stable";
  const recent = values[values.length - 1];
  const previous = values[values.length - 2];
  const delta = recent - previous;
  const threshold = Math.abs(previous) * 0.03; // 3% threshold
  if (delta > threshold) return "up";
  if (delta < -threshold) return "down";
  return "stable";
}

// ---------- Service ----------

export const labResultsService = {
  /**
   * Get all lab orders for a patient, ordered by most recent.
   */
  async getOrders(_patientId: string) {
    return fetchJson<LabOrder[]>(`/api/lab/orders`);
  },

  /**
   * Get a single lab order with full detail.
   */
  async getOrderDetail(orderId: string) {
    return fetchJson<{ order: LabOrder; results: LabResult[] }>(
      `/api/lab/orders/${orderId}`,
    );
  },

  /**
   * Get result values for a specific result.
   */
  async getResultValues(resultId: string) {
    return fetchJson<LabResultValue[]>(`/api/lab/results/${resultId}/values`);
  },

  /**
   * Get historical data for a specific parameter.
   */
  async getParameterHistory(
    _patientId: string,
    parameterName: string,
    months: number = 12,
  ): Promise<ParameterHistory> {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const params = new URLSearchParams({
      parameter_name: parameterName,
      since: since.toISOString(),
    });

    const data = await fetchJson<Record<string, unknown>[]>(
      `/api/lab/parameters/history?${params}`,
    );

    const points: ParameterHistoryPoint[] = (data || []).map(
      (row: Record<string, unknown>) => {
        const result = row.result as unknown as Record<string, unknown>;
        return {
          value: row.value as number,
          date: result.result_at as string,
          status: row.status as ParameterHistoryPoint["status"],
        };
      },
    );

    const values = points.map((p) => p.value);
    const refMin = data?.[0]?.reference_min ?? 0;
    const refMax = data?.[0]?.reference_max ?? 100;
    const unit = (data?.[0]?.unit as string) ?? "";

    return {
      parameter_name: parameterName,
      unit,
      reference_min: refMin as number,
      reference_max: refMax as number,
      points,
      stats: {
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
        average:
          values.length > 0
            ? Math.round(
                (values.reduce((a, b) => a + b, 0) / values.length) * 100,
              ) / 100
            : 0,
        trend: computeTrend(values),
      },
    };
  },

  /**
   * Get unique parameters that have been tracked, along with their latest values.
   * NOTE: The BFF /monitored endpoint returns deduplicated rows (latest per
   * parameter). Trend is set to "stable" because full history isn't available
   * in a single call. Use getParameterHistory() for accurate per-parameter trends.
   */
  async getMonitoredParameters(
    _patientId: string,
  ): Promise<MonitoredParameter[]> {
    const data = await fetchJson<Record<string, unknown>[]>(
      `/api/lab/parameters/monitored`,
    );

    return (data || []).map((row) => {
      const result = row.result as unknown as Record<string, unknown>;
      return {
        parameter_name: row.parameter_name as string,
        unit: row.unit as string,
        reference_min: row.reference_min as number,
        reference_max: row.reference_max as number,
        latest_value: row.value as number,
        latest_status: row.status as MonitoredParameter["latest_status"],
        latest_date: result.result_at as string,
        trend: "stable" as const,
      };
    });
  },

  /**
   * Get the latest results for a patient, across all orders.
   */
  async getLatestResults(_patientId: string, limit: number = 5) {
    return fetchJson<LabResult[]>(`/api/lab/results/latest?limit=${limit}`);
  },
};
