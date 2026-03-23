import { createClient } from '@/lib/supabase/client';
import type {
  LabOrder,
  LabTestType,
  LabResult,
  LabResultValue,
  CreateLabOrderData,
  LabOrderFilters,
  LabResultStats,
  LabOrderStatusHistory,
} from '@red-salud/types';

const supabase = createClient();

export async function getLabTestTypes(categoria?: string) {
  try {
    let query = supabase
      .from("lab_test_types")
      .select("*")
      .eq("activo", true)
      .order("categoria")
      .order("nombre");

    if (categoria) {
      query = query.eq("categoria", categoria);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data: data as LabTestType[] };
  } catch (error) {
    console.error("Error fetching lab test types:", error);
    return { success: false, error, data: [] };
  }
}

export async function getLabTestCategories() {
  try {
    const { data, error } = await supabase
      .from("lab_test_types")
      .select("categoria")
      .eq("activo", true)
      .not("categoria", "is", null);

    if (error) throw error;

    const categories = [...new Set(data.map((item) => item.categoria))].filter(Boolean);
    return { success: true, data: categories as string[] };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error, data: [] };
  }
}

export async function getPatientLabOrders(
  patientId: string,
  filters?: LabOrderFilters
) {
  try {
    let query = supabase
      .from("lab_orders")
      .select(`
        *,
        medico:profiles!lab_orders_medico_id_fkey(
          id,
          nombre_completo,
          especialidad
        ),
        laboratorio:profiles!lab_orders_laboratorio_id_fkey(
          id,
          nombre_completo
        )
      `)
      .eq("paciente_id", patientId)
      .order("fecha_orden", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.fecha_desde) {
      query = query.gte("fecha_orden", filters.fecha_desde);
    }

    if (filters?.fecha_hasta) {
      query = query.lte("fecha_orden", filters.fecha_hasta);
    }

    if (filters?.prioridad) {
      query = query.eq("prioridad", filters.prioridad);
    }

    const { data, error } = await query;

    if (error) throw error;

    const ordersWithTests = await Promise.all(
      (data || []).map(async (order) => {
        const { data: tests } = await supabase
          .from("lab_order_tests")
          .select(`
            *,
            test_type:lab_test_types(*)
          `)
          .eq("order_id", order.id);

        return {
          ...order,
          tests: tests || [],
        };
      })
    );

    return { success: true, data: ordersWithTests as LabOrder[] };
  } catch (error) {
    console.error("Error fetching lab orders:", error);
    return { success: false, error, data: [] };
  }
}

export async function getLabOrderDetails(orderId: string) {
  try {
    const { data: order, error: orderError } = await supabase
      .from("lab_orders")
      .select(`
        *,
        paciente:profiles!lab_orders_paciente_id_fkey(
          id,
          nombre_completo,
          email
        ),
        medico:profiles!lab_orders_medico_id_fkey(
          id,
          nombre_completo,
          especialidad
        ),
        laboratorio:profiles!lab_orders_laboratorio_id_fkey(
          id,
          nombre_completo
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError) throw orderError;

    const { data: tests } = await supabase
      .from("lab_order_tests")
      .select(`*, test_type:lab_test_types(*)`)
      .eq("order_id", orderId);

    const { data: results } = await supabase
      .from("lab_results")
      .select(`
        *,
        test_type:lab_test_types(*),
        validador:profiles!lab_results_validado_por_fkey(id, nombre_completo)
      `)
      .eq("order_id", orderId);

    if (results && results.length > 0) {
      for (const result of results) {
        const { data: values } = await supabase
          .from("lab_result_values")
          .select("*")
          .eq("result_id", result.id)
          .order("orden");
        result.values = values || [];
      }
    }

    return {
      success: true,
      data: { ...order, tests: tests || [], results: results || [] } as LabOrder,
    };
  } catch (error) {
    console.error("Error fetching lab order details:", error);
    return { success: false, error, data: null };
  }
}

export async function getLabOrderResults(orderId: string) {
  try {
    const { data, error } = await supabase
      .from("lab_results")
      .select(`
        *,
        test_type:lab_test_types(*),
        validador:profiles!lab_results_validado_por_fkey(id, nombre_completo)
      `)
      .eq("order_id", orderId);

    if (error) throw error;

    const resultsWithValues = await Promise.all(
      (data || []).map(async (result) => {
        const { data: values } = await supabase
          .from("lab_result_values")
          .select("*")
          .eq("result_id", result.id)
          .order("orden");
        return { ...result, values: values || [] };
      })
    );

    return { success: true, data: resultsWithValues as LabResult[] };
  } catch (error) {
    console.error("Error fetching lab results:", error);
    return { success: false, error, data: [] };
  }
}

export async function getLabOrderStatusHistory(orderId: string) {
  try {
    const { data, error } = await supabase
      .from("lab_order_status_history")
      .select(`
        *,
        usuario:profiles!lab_order_status_history_cambiado_por_fkey(id, nombre_completo)
      `)
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data as LabOrderStatusHistory[] };
  } catch (error) {
    console.error("Error fetching status history:", error);
    return { success: false, error, data: [] };
  }
}

export async function getPatientLabStats(patientId: string) {
  try {
    const { data: orders } = await supabase
      .from("lab_orders")
      .select("id, status, fecha_orden")
      .eq("paciente_id", patientId);

    const orderIds = orders?.map((o) => o.id) || [];

    const { data: results } = await supabase
      .from("lab_results")
      .select("id")
      .in("order_id", orderIds);

    const resultIds = results?.map((r) => r.id) || [];

    const { count: abnormalCount } = await supabase
      .from("lab_result_values")
      .select("*", { count: "exact", head: true })
      .eq("es_anormal", true)
      .in("result_id", resultIds);

    const stats: LabResultStats = {
      total_ordenes: orders?.length || 0,
      pendientes: orders?.filter((o) => o.status === "pendiente").length || 0,
      completadas: orders?.filter((o) => o.status === "completada").length || 0,
      con_valores_anormales: abnormalCount || 0,
      ultima_orden: orders?.[0]?.fecha_orden,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching lab stats:", error);
    return {
      success: false,
      error,
      data: { total_ordenes: 0, pendientes: 0, completadas: 0, con_valores_anormales: 0 },
    };
  }
}

export async function createLabOrder(orderData: CreateLabOrderData) {
  try {
    const { data: order, error: orderError } = await supabase
      .from("lab_orders")
      .insert({
        paciente_id: orderData.paciente_id,
        medico_id: orderData.medico_id,
        prioridad: orderData.prioridad,
        instrucciones_paciente: orderData.instrucciones_paciente,
        status: "pendiente",
        numero_orden: `ORD-${Date.now().toString().slice(-6)}`,
        fecha_orden: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) throw orderError;

    if (orderData.tests && orderData.tests.length > 0) {
      const testsToInsert = orderData.tests.map((testTypeId) => ({
        order_id: order.id,
        test_type_id: testTypeId,
        status: "pendiente",
      }));

      const { error: testsError } = await supabase
        .from("lab_order_tests")
        .insert(testsToInsert);

      if (testsError) throw testsError;
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("Error creating lab order:", error);
    return { success: false, error };
  }
}
