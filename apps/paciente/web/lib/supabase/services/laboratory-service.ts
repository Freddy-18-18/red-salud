import { supabase } from "../client";
import type {
  LabOrder,
  LabTestType,
  LabResult,
  LabResultValue,
  CreateLabOrderData,
  LabOrderFilters,
  LabResultStats,
  LabOrderStatusHistory,
} from "../types/laboratory";

// Obtener tipos de exámenes disponibles
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

// Obtener categorías de exámenes
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

// Obtener órdenes de laboratorio del paciente
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

    // Obtener tests para cada orden
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

// Obtener una orden específica con todos sus detalles
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

    // Obtener tests
    const { data: tests } = await supabase
      .from("lab_order_tests")
      .select(`
        *,
        test_type:lab_test_types(*)
      `)
      .eq("order_id", orderId);

    // Obtener resultados
    const { data: results } = await supabase
      .from("lab_results")
      .select(`
        *,
        test_type:lab_test_types(*),
        validador:profiles!lab_results_validado_por_fkey(
          id,
          nombre_completo
        )
      `)
      .eq("order_id", orderId);

    // Obtener valores de resultados
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
      data: {
        ...order,
        tests: tests || [],
        results: results || [],
      } as LabOrder,
    };
  } catch (error) {
    console.error("Error fetching lab order details:", error);
    return { success: false, error, data: null };
  }
}

// Obtener resultados de una orden
export async function getLabOrderResults(orderId: string) {
  try {
    const { data, error } = await supabase
      .from("lab_results")
      .select(`
        *,
        test_type:lab_test_types(*),
        validador:profiles!lab_results_validado_por_fkey(
          id,
          nombre_completo
        )
      `)
      .eq("order_id", orderId);

    if (error) throw error;

    // Obtener valores para cada resultado
    const resultsWithValues = await Promise.all(
      (data || []).map(async (result) => {
        const { data: values } = await supabase
          .from("lab_result_values")
          .select("*")
          .eq("result_id", result.id)
          .order("orden");

        return {
          ...result,
          values: values || [],
        };
      })
    );

    return { success: true, data: resultsWithValues as LabResult[] };
  } catch (error) {
    console.error("Error fetching lab results:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener historial de cambios de estado
export async function getLabOrderStatusHistory(orderId: string) {
  try {
    const { data, error } = await supabase
      .from("lab_order_status_history")
      .select(`
        *,
        usuario:profiles!lab_order_status_history_cambiado_por_fkey(
          id,
          nombre_completo
        )
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

// Obtener estadísticas de laboratorio del paciente
export async function getPatientLabStats(patientId: string) {
  try {
    const { data: orders } = await supabase
      .from("lab_orders")
      .select("id, status, fecha_orden")
      .eq("paciente_id", patientId);

    // Obtener IDs de órdenes del paciente
    const orderIds = orders?.map((o) => o.id) || [];

    // Obtener resultados de esas órdenes
    const { data: results } = await supabase
      .from("lab_results")
      .select("id")
      .in("order_id", orderIds);

    const resultIds = results?.map((r) => r.id) || [];

    // Contar valores anormales
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
      data: {
        total_ordenes: 0,
        pendientes: 0,
        completadas: 0,
        con_valores_anormales: 0,
      },
    };
  }
}

// Comparar resultados históricos de un parámetro
export async function compareLabParameter(
  patientId: string,
  parametro: string,
  limit: number = 10
) {
  try {
    const { data, error } = await supabase
      .from("lab_result_values")
      .select(`
        *,
        result:lab_results!inner(
          fecha_resultado,
          order:lab_orders!inner(
            paciente_id,
            fecha_orden
          )
        )
      `)
      .eq("parametro", parametro)
      .eq("result.order.paciente_id", patientId)
      .order("result.fecha_resultado", { ascending: false })
      .limit(limit);

    if (error) throw error;

    type LabValueWithDate = LabResultValue & {
      result: {
        fecha_resultado: string;
        order: {
          paciente_id: string;
          fecha_orden: string;
        };
      };
    };

    return { success: true, data: data as unknown as LabValueWithDate[] };
  } catch (error) {
    console.error("Error comparing lab parameter:", error);
    return { success: false, error, data: [] };
  }
}

// Marcar resultado como notificado
export async function markResultAsNotified(resultId: string) {
  try {
    const { error } = await supabase
      .from("lab_results")
      .update({
        notificado_paciente: true,
        fecha_notificacion: new Date().toISOString(),
      })
      .eq("id", resultId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error marking result as notified:", error);
    return { success: false, error };
  }
}

// Crear nueva orden de laboratorio
export async function createLabOrder(orderData: CreateLabOrderData) {
  try {
    // 1. Crear la orden
    const { data: order, error: orderError } = await supabase
      .from("lab_orders")
      .insert({
        paciente_id: orderData.paciente_id,
        medico_id: orderData.medico_id,
        prioridad: orderData.prioridad,
        instrucciones_paciente: orderData.instrucciones_paciente,
        status: "pendiente",
        numero_orden: `ORD-${Date.now().toString().slice(-6)}`, // Generar número simple
        fecha_orden: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Crear los tests asociados
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

// Guardar resultados de laboratorio
export async function saveLabResults(
  orderId: string,
  results: {
    test_type_id: string;
    observaciones?: string;
    values: {
      parametro: string;
      valor: string;
      unidad: string;
      rango_referencia: string;
      es_anormal: boolean;
    }[];
  }[],
  userId: string
) {
  try {
    // 1. Crear registros de resultados para cada test
    for (const result of results) {
      const { data: labResult, error: resultError } = await supabase
        .from("lab_results")
        .insert({
          order_id: orderId,
          test_type_id: result.test_type_id,
          fecha_resultado: new Date().toISOString(),
          observaciones: result.observaciones,
          validado_por: userId,
          notificado_paciente: false,
        })
        .select()
        .single();

      if (resultError) throw resultError;

      // 2. Crear valores para cada resultado
      if (result.values && result.values.length > 0) {
        const valuesToInsert = result.values.map((val, index) => ({
          result_id: labResult.id,
          parametro: val.parametro,
          valor: val.valor,
          unidad: val.unidad,
          rango_referencia: val.rango_referencia,
          es_anormal: val.es_anormal,
          orden: index,
        }));

        const { error: valuesError } = await supabase
          .from("lab_result_values")
          .insert(valuesToInsert);

        if (valuesError) throw valuesError;
      }

      // 3. Actualizar estado del test en lab_order_tests
      await supabase
        .from("lab_order_tests")
        .update({ status: "completado" })
        .eq("order_id", orderId)
        .eq("test_type_id", result.test_type_id);
    }

    // 4. Actualizar estado de la orden a completada
    const { error: updateError } = await supabase
      .from("lab_orders")
      .update({ status: "completada" })
      .eq("id", orderId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error("Error saving lab results:", error);
    return { success: false, error };
  }
}
