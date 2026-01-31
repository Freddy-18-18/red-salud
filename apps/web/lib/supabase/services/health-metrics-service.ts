import { supabase } from "../client";
import type {
  HealthMetricType,
  HealthMetric,
  HealthGoal,
  MeasurementReminder,
  CreateHealthMetricData,
  CreateHealthGoalData,
  CreateMeasurementReminderData,
  MetricStats,
  HealthDashboardSummary,
  MetricTrend,
  GoalProgress,
} from "../types/health-metrics";

// ============ TIPOS DE MÉTRICAS ============

export async function getHealthMetricTypes() {
  try {
    const { data, error } = await supabase
      .from("health_metric_types")
      .select("*")
      .eq("activo", true)
      .order("orden");

    if (error) throw error;
    return { success: true, data: data as HealthMetricType[] };
  } catch (error) {
    console.error("Error fetching metric types:", error);
    return { success: false, error, data: [] };
  }
}

export async function getHealthMetricType(typeId: string) {
  try {
    const { data, error } = await supabase
      .from("health_metric_types")
      .select("*")
      .eq("id", typeId)
      .single();

    if (error) throw error;
    return { success: true, data: data as HealthMetricType };
  } catch (error) {
    console.error("Error fetching metric type:", error);
    return { success: false, error, data: null };
  }
}

// ============ MÉTRICAS DE SALUD ============

export async function getPatientHealthMetrics(
  patientId: string,
  filters?: {
    metricTypeId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
) {
  try {
    let query = supabase
      .from("health_metrics")
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .eq("paciente_id", patientId)
      .order("fecha_medicion", { ascending: false });

    if (filters?.metricTypeId) {
      query = query.eq("metric_type_id", filters.metricTypeId);
    }
    if (filters?.startDate) {
      query = query.gte("fecha_medicion", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("fecha_medicion", filters.endDate);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data: data as HealthMetric[] };
  } catch (error) {
    console.error("Error fetching health metrics:", error);
    return { success: false, error, data: [] };
  }
}

export async function createHealthMetric(metricData: CreateHealthMetricData) {
  try {
    const { data, error } = await supabase
      .from("health_metrics")
      .insert(metricData)
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: metricData.paciente_id,
      activity_type: "health_metric_recorded",
      description: `Métrica de salud registrada`,
      status: "success",
    });

    return { success: true, data: data as HealthMetric };
  } catch (error) {
    console.error("Error creating health metric:", error);
    return { success: false, error, data: null };
  }
}

export async function updateHealthMetric(
  metricId: string,
  updates: Partial<CreateHealthMetricData>
) {
  try {
    const { data, error } = await supabase
      .from("health_metrics")
      .update(updates)
      .eq("id", metricId)
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .single();

    if (error) throw error;
    return { success: true, data: data as HealthMetric };
  } catch (error) {
    console.error("Error updating health metric:", error);
    return { success: false, error, data: null };
  }
}

export async function deleteHealthMetric(metricId: string) {
  try {
    const { error } = await supabase
      .from("health_metrics")
      .delete()
      .eq("id", metricId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting health metric:", error);
    return { success: false, error };
  }
}

// ============ ESTADÍSTICAS ============

export async function getMetricStats(
  patientId: string,
  metricTypeId: string,
  days: number = 30
): Promise<{ success: boolean; data: MetricStats | null; error?: any }> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: metrics, error } = await supabase
      .from("health_metrics")
      .select("valor, fecha_medicion")
      .eq("paciente_id", patientId)
      .eq("metric_type_id", metricTypeId)
      .gte("fecha_medicion", startDate.toISOString())
      .order("fecha_medicion", { ascending: false });

    if (error) throw error;

    if (!metrics || metrics.length === 0) {
      return { success: true, data: null };
    }

    const valores = metrics.map((m) => parseFloat(m.valor.toString()));
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    const minimo = Math.min(...valores);
    const maximo = Math.max(...valores);
    const ultimo_valor = valores[0];

    // Calcular tendencia
    let tendencia: 'subiendo' | 'bajando' | 'estable' = 'estable';
    if (valores.length >= 2) {
      const primerosMitad = valores.slice(0, Math.floor(valores.length / 2));
      const segundaMitad = valores.slice(Math.floor(valores.length / 2));
      const promedioPrimera = primerosMitad.reduce((a, b) => a + b, 0) / primerosMitad.length;
      const promedioSegunda = segundaMitad.reduce((a, b) => a + b, 0) / segundaMitad.length;
      
      const diferencia = ((promedioPrimera - promedioSegunda) / promedioSegunda) * 100;
      if (Math.abs(diferencia) > 5) {
        tendencia = diferencia > 0 ? 'subiendo' : 'bajando';
      }
    }

    const cambio_porcentual = valores.length >= 2
      ? ((valores[0] - valores[valores.length - 1]) / valores[valores.length - 1]) * 100
      : 0;

    // Verificar si está en rango normal
    const { data: metricType } = await getHealthMetricType(metricTypeId);
    let en_rango_normal = true;
    if (metricType && metricType.rango_normal_min && metricType.rango_normal_max) {
      en_rango_normal = ultimo_valor >= metricType.rango_normal_min && ultimo_valor <= metricType.rango_normal_max;
    }

    const stats: MetricStats = {
      promedio: Math.round(promedio * 100) / 100,
      minimo,
      maximo,
      ultimo_valor,
      tendencia,
      cambio_porcentual: Math.round(cambio_porcentual * 100) / 100,
      total_registros: metrics.length,
      en_rango_normal,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error calculating metric stats:", error);
    return { success: false, error, data: null };
  }
}

export async function getMetricTrend(
  patientId: string,
  metricTypeId: string,
  days: number = 30
): Promise<{ success: boolean; data: MetricTrend[]; error?: any }> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("health_metrics")
      .select("valor, valor_secundario, fecha_medicion")
      .eq("paciente_id", patientId)
      .eq("metric_type_id", metricTypeId)
      .gte("fecha_medicion", startDate.toISOString())
      .order("fecha_medicion", { ascending: true });

    if (error) throw error;

    const trend: MetricTrend[] = (data || []).map((m) => ({
      fecha: m.fecha_medicion,
      valor: parseFloat(m.valor.toString()),
      valor_secundario: m.valor_secundario ? parseFloat(m.valor_secundario.toString()) : undefined,
    }));

    return { success: true, data: trend };
  } catch (error) {
    console.error("Error fetching metric trend:", error);
    return { success: false, error, data: [] };
  }
}

// ============ METAS DE SALUD ============

export async function getPatientHealthGoals(patientId: string, status?: string) {
  try {
    let query = supabase
      .from("health_goals")
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .eq("paciente_id", patientId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data: data as HealthGoal[] };
  } catch (error) {
    console.error("Error fetching health goals:", error);
    return { success: false, error, data: [] };
  }
}

export async function createHealthGoal(goalData: CreateHealthGoalData) {
  try {
    const { data, error } = await supabase
      .from("health_goals")
      .insert(goalData)
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: goalData.paciente_id,
      activity_type: "health_goal_created",
      description: `Meta de salud creada: ${goalData.titulo}`,
      status: "success",
    });

    return { success: true, data: data as HealthGoal };
  } catch (error) {
    console.error("Error creating health goal:", error);
    return { success: false, error, data: null };
  }
}

export async function updateHealthGoal(
  goalId: string,
  updates: Partial<HealthGoal>
) {
  try {
    const { data, error } = await supabase
      .from("health_goals")
      .update(updates)
      .eq("id", goalId)
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .single();

    if (error) throw error;
    return { success: true, data: data as HealthGoal };
  } catch (error) {
    console.error("Error updating health goal:", error);
    return { success: false, error, data: null };
  }
}

export async function getGoalProgress(
  goalId: string
): Promise<{ success: boolean; data: GoalProgress | null; error?: any }> {
  try {
    const { data: goal, error: goalError } = await supabase
      .from("health_goals")
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .eq("id", goalId)
      .single();

    if (goalError) throw goalError;

    // Obtener últimas mediciones
    const { data: metrics, error: metricsError } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("paciente_id", goal.paciente_id)
      .eq("metric_type_id", goal.metric_type_id)
      .gte("fecha_medicion", goal.fecha_inicio)
      .order("fecha_medicion", { ascending: false })
      .limit(10);

    if (metricsError) throw metricsError;

    const valor_actual = metrics && metrics.length > 0 ? parseFloat(metrics[0].valor.toString()) : 0;
    const valor_objetivo = parseFloat(goal.valor_objetivo.toString());
    
    // Calcular porcentaje (depende de si es meta de aumento o disminución)
    let porcentaje_completado = 0;
    if (metrics && metrics.length > 0) {
      const valor_inicial = parseFloat(metrics[metrics.length - 1].valor.toString());
      const diferencia_total = valor_objetivo - valor_inicial;
      const diferencia_actual = valor_actual - valor_inicial;
      porcentaje_completado = Math.min(100, Math.max(0, (diferencia_actual / diferencia_total) * 100));
    }

    const dias_restantes = goal.fecha_objetivo
      ? Math.ceil((new Date(goal.fecha_objetivo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : undefined;

    const en_camino = porcentaje_completado > 0 && porcentaje_completado < 100;

    const progress: GoalProgress = {
      goal: goal as HealthGoal,
      valor_actual,
      valor_objetivo,
      porcentaje_completado: Math.round(porcentaje_completado),
      dias_restantes,
      en_camino,
      ultimas_mediciones: (metrics || []) as HealthMetric[],
    };

    return { success: true, data: progress };
  } catch (error) {
    console.error("Error calculating goal progress:", error);
    return { success: false, error, data: null };
  }
}

// ============ RECORDATORIOS ============

export async function getPatientMeasurementReminders(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("measurement_reminders")
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .eq("paciente_id", patientId)
      .eq("activo", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data as MeasurementReminder[] };
  } catch (error) {
    console.error("Error fetching measurement reminders:", error);
    return { success: false, error, data: [] };
  }
}

export async function createMeasurementReminder(reminderData: CreateMeasurementReminderData) {
  try {
    const { data, error } = await supabase
      .from("measurement_reminders")
      .insert(reminderData)
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .single();

    if (error) throw error;
    return { success: true, data: data as MeasurementReminder };
  } catch (error) {
    console.error("Error creating measurement reminder:", error);
    return { success: false, error, data: null };
  }
}

export async function updateMeasurementReminder(
  reminderId: string,
  updates: Partial<MeasurementReminder>
) {
  try {
    const { data, error } = await supabase
      .from("measurement_reminders")
      .update(updates)
      .eq("id", reminderId)
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .single();

    if (error) throw error;
    return { success: true, data: data as MeasurementReminder };
  } catch (error) {
    console.error("Error updating measurement reminder:", error);
    return { success: false, error, data: null };
  }
}

// ============ DASHBOARD ============

export async function getHealthDashboardSummary(
  patientId: string
): Promise<{ success: boolean; data: HealthDashboardSummary | null; error?: any }> {
  try {
    // Obtener métricas de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayMetrics } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("paciente_id", patientId)
      .gte("fecha_medicion", today.toISOString());

    // Obtener total de métricas
    const { count: totalMetrics } = await supabase
      .from("health_metrics")
      .select("*", { count: "exact", head: true })
      .eq("paciente_id", patientId);

    // Obtener metas activas y completadas
    const { data: activeGoals } = await supabase
      .from("health_goals")
      .select("*")
      .eq("paciente_id", patientId)
      .eq("status", "activa");

    const { data: completedGoals } = await supabase
      .from("health_goals")
      .select("*")
      .eq("paciente_id", patientId)
      .eq("status", "completada");

    // Obtener recordatorios activos
    const { data: reminders } = await supabase
      .from("measurement_reminders")
      .select("*")
      .eq("paciente_id", patientId)
      .eq("activo", true);

    // Obtener métricas recientes
    const { data: recentMetrics } = await supabase
      .from("health_metrics")
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .eq("paciente_id", patientId)
      .order("fecha_medicion", { ascending: false })
      .limit(5);

    const metricas_recientes = (recentMetrics || []).map((m: any) => {
      const valor_display = m.metric_type?.requiere_multiple_valores && m.valor_secundario
        ? `${m.valor}/${m.valor_secundario}`
        : m.valor.toString();

      const en_rango = m.metric_type?.rango_normal_min && m.metric_type?.rango_normal_max
        ? m.valor >= m.metric_type.rango_normal_min && m.valor <= m.metric_type.rango_normal_max
        : true;

      return {
        tipo: m.metric_type?.nombre || "Desconocido",
        valor: `${valor_display} ${m.metric_type?.unidad_medida || ""}`,
        fecha: m.fecha_medicion,
        en_rango,
      };
    });

    const summary: HealthDashboardSummary = {
      total_metricas_registradas: totalMetrics || 0,
      metricas_hoy: todayMetrics?.length || 0,
      metas_activas: activeGoals?.length || 0,
      metas_completadas: completedGoals?.length || 0,
      recordatorios_activos: reminders?.length || 0,
      metricas_recientes,
      alertas: [],
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return { success: false, error, data: null };
  }
}
