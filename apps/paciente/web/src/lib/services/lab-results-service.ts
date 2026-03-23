import { supabase } from "@/lib/supabase/client";

// ---------- Types ----------

export interface LabOrder {
  id: string;
  patient_id: string;
  doctor_id: string;
  laboratory_id: string;
  order_number: string;
  ordered_at: string;
  status: "ordenada" | "muestra_tomada" | "en_proceso" | "completada" | "cancelada";
  doctor?: { nombre_completo?: string; avatar_url?: string };
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
  async getOrders(patientId: string) {
    const { data, error } = await supabase
      .from("lab_orders")
      .select(`
        *,
        doctor:profiles!lab_orders_doctor_id_fkey(nombre_completo, avatar_url),
        tests:lab_order_tests(
          *,
          test_type:lab_test_types(id, name, description)
        )
      `)
      .eq("patient_id", patientId)
      .order("ordered_at", { ascending: false });

    if (error) throw error;
    return (data || []) as LabOrder[];
  },

  /**
   * Get a single lab order with full detail.
   */
  async getOrderDetail(orderId: string) {
    const { data, error } = await supabase
      .from("lab_orders")
      .select(`
        *,
        doctor:profiles!lab_orders_doctor_id_fkey(nombre_completo, avatar_url),
        tests:lab_order_tests(
          *,
          test_type:lab_test_types(id, name, description, reference_price)
        )
      `)
      .eq("id", orderId)
      .single();

    if (error) throw error;

    // Fetch results for this order
    const { data: results, error: resultsError } = await supabase
      .from("lab_results")
      .select(`
        *,
        test_type:lab_test_types(id, name, description),
        values:lab_result_values(*)
      `)
      .eq("order_id", orderId)
      .order("result_at", { ascending: false });

    if (resultsError) throw resultsError;

    return {
      order: data as LabOrder,
      results: (results || []) as LabResult[],
    };
  },

  /**
   * Get result values for a specific result.
   */
  async getResultValues(resultId: string) {
    const { data, error } = await supabase
      .from("lab_result_values")
      .select("*")
      .eq("result_id", resultId)
      .order("parameter_name");

    if (error) throw error;
    return (data || []) as LabResultValue[];
  },

  /**
   * Get historical data for a specific parameter.
   */
  async getParameterHistory(
    patientId: string,
    parameterName: string,
    months: number = 12,
  ): Promise<ParameterHistory> {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const { data, error } = await supabase
      .from("lab_result_values")
      .select(`
        value, status, unit, reference_min, reference_max,
        result:lab_results!inner(
          result_at,
          order:lab_orders!inner(patient_id)
        )
      `)
      .eq("parameter_name", parameterName)
      .eq("result.order.patient_id", patientId)
      .gte("result.result_at", since.toISOString())
      .order("result.result_at", { ascending: true });

    if (error) throw error;

    const points: ParameterHistoryPoint[] = (data || []).map(
      (row: Record<string, unknown>) => {
        const result = row.result as Record<string, unknown>;
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
   */
  async getMonitoredParameters(
    patientId: string,
  ): Promise<MonitoredParameter[]> {
    const { data, error } = await supabase
      .from("lab_result_values")
      .select(`
        parameter_name, value, unit, reference_min, reference_max, status,
        result:lab_results!inner(
          result_at,
          order:lab_orders!inner(patient_id)
        )
      `)
      .eq("result.order.patient_id", patientId)
      .order("result.result_at", { ascending: false });

    if (error) throw error;

    // Group by parameter_name, keep the most recent for each
    const paramMap = new Map<string, MonitoredParameter>();
    const historyMap = new Map<string, number[]>();

    for (const row of data || []) {
      const name = row.parameter_name as string;
      const result = row.result as Record<string, unknown>;

      if (!historyMap.has(name)) {
        historyMap.set(name, []);
      }
      historyMap.get(name)!.push(row.value as number);

      if (!paramMap.has(name)) {
        paramMap.set(name, {
          parameter_name: name,
          unit: row.unit as string,
          reference_min: row.reference_min as number,
          reference_max: row.reference_max as number,
          latest_value: row.value as number,
          latest_status: row.status as MonitoredParameter["latest_status"],
          latest_date: result.result_at as string,
          trend: "stable",
        });
      }
    }

    // Compute trend for each parameter
    for (const [name, param] of paramMap) {
      const values = historyMap.get(name) || [];
      // Values are in descending order from query, reverse for trend calc
      param.trend = computeTrend(values.reverse());
    }

    return Array.from(paramMap.values());
  },

  /**
   * Get the latest results for a patient, across all orders.
   */
  async getLatestResults(patientId: string, limit: number = 5) {
    const { data, error } = await supabase
      .from("lab_results")
      .select(`
        *,
        test_type:lab_test_types(id, name, description),
        values:lab_result_values(*),
        order:lab_orders!inner(patient_id, order_number, ordered_at)
      `)
      .eq("order.patient_id", patientId)
      .order("result_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as LabResult[];
  },
};
