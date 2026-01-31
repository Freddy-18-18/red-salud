// Tipos para el sistema de métricas de salud

export interface HealthMetricType {
  id: string;
  nombre: string;
  descripcion?: string;
  unidad_medida: string;
  icono?: string;
  categoria?: string;
  rango_normal_min?: number;
  rango_normal_max?: number;
  rango_alerta_min?: number;
  rango_alerta_max?: number;
  requiere_multiple_valores: boolean;
  activo: boolean;
  orden: number;
  created_at: string;
}

export interface HealthMetric {
  id: string;
  paciente_id: string;
  metric_type_id: string;
  valor: number;
  valor_secundario?: number;
  fecha_medicion: string;
  notas?: string;
  ubicacion?: string;
  medido_por?: string;
  dispositivo?: string;
  medical_record_id?: string;
  appointment_id?: string;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  metric_type?: HealthMetricType;
}

export type GoalStatus = 'activa' | 'completada' | 'cancelada' | 'pausada';

export interface HealthGoal {
  id: string;
  paciente_id: string;
  metric_type_id: string;
  titulo: string;
  descripcion?: string;
  valor_objetivo: number;
  valor_secundario_objetivo?: number;
  fecha_inicio: string;
  fecha_objetivo?: string;
  status: GoalStatus;
  progreso_actual: number;
  notas?: string;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  metric_type?: HealthMetricType;
  ultimas_mediciones?: HealthMetric[];
}

export interface MeasurementReminder {
  id: string;
  paciente_id: string;
  metric_type_id: string;
  frecuencia: string;
  horarios?: string[];
  dias_semana?: number[];
  activo: boolean;
  ultima_medicion?: string;
  proxima_medicion?: string;
  notificar_push: boolean;
  notificar_email: boolean;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  metric_type?: HealthMetricType;
}

// Tipos para crear/actualizar
export interface CreateHealthMetricData {
  paciente_id: string;
  metric_type_id: string;
  valor: number;
  valor_secundario?: number;
  fecha_medicion?: string;
  notas?: string;
  ubicacion?: string;
  medido_por?: string;
  dispositivo?: string;
  medical_record_id?: string;
  appointment_id?: string;
}

export interface CreateHealthGoalData {
  paciente_id: string;
  metric_type_id: string;
  titulo: string;
  descripcion?: string;
  valor_objetivo: number;
  valor_secundario_objetivo?: number;
  fecha_inicio?: string;
  fecha_objetivo?: string;
  notas?: string;
}

export interface CreateMeasurementReminderData {
  paciente_id: string;
  metric_type_id: string;
  frecuencia: string;
  horarios?: string[];
  dias_semana?: number[];
  notificar_push?: boolean;
  notificar_email?: boolean;
}

// Estadísticas y resúmenes
export interface MetricStats {
  promedio: number;
  minimo: number;
  maximo: number;
  ultimo_valor: number;
  tendencia: 'subiendo' | 'bajando' | 'estable';
  cambio_porcentual: number;
  total_registros: number;
  en_rango_normal: boolean;
}

export interface HealthDashboardSummary {
  total_metricas_registradas: number;
  metricas_hoy: number;
  metas_activas: number;
  metas_completadas: number;
  recordatorios_activos: number;
  proxima_medicion?: {
    metrica: string;
    hora: string;
    minutos_restantes: number;
  };
  metricas_recientes: Array<{
    tipo: string;
    valor: string;
    fecha: string;
    en_rango: boolean;
  }>;
  alertas: Array<{
    tipo: string;
    mensaje: string;
    severidad: 'info' | 'warning' | 'danger';
  }>;
}

export interface MetricTrend {
  fecha: string;
  valor: number;
  valor_secundario?: number;
}

export interface GoalProgress {
  goal: HealthGoal;
  valor_actual: number;
  valor_objetivo: number;
  porcentaje_completado: number;
  dias_restantes?: number;
  en_camino: boolean;
  ultimas_mediciones: HealthMetric[];
}
