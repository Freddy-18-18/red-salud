// Tipos para el sistema de laboratorio clínico

export type LabOrderStatus = 'pendiente' | 'muestra_tomada' | 'en_proceso' | 'completada' | 'cancelada' | 'rechazada';
export type LabOrderPriority = 'normal' | 'urgente' | 'stat';
export type LabTestStatus = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
export type AlertLevel = 'normal' | 'bajo' | 'alto' | 'critico';

export interface LabTestType {
  id: string;
  codigo: string;
  nombre: string;
  categoria?: string;
  descripcion?: string;
  preparacion_requerida?: string;
  tiempo_entrega_horas: number;
  requiere_ayuno: boolean;
  precio_referencia?: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface LabOrder {
  id: string;
  paciente_id: string;
  medico_id?: string;
  laboratorio_id?: string;
  appointment_id?: string;
  medical_record_id?: string;
  numero_orden: string;
  fecha_orden: string;
  fecha_muestra?: string;
  fecha_entrega_estimada?: string;
  diagnostico_presuntivo?: string;
  indicaciones_clinicas?: string;
  status: LabOrderStatus;
  prioridad: LabOrderPriority;
  requiere_ayuno: boolean;
  instrucciones_paciente?: string;
  notas_internas?: string;
  costo_total?: number;
  created_at: string;
  updated_at: string;
  // Relaciones
  paciente?: {
    id: string;
    nombre_completo: string;
    email: string;
  };
  medico?: {
    id: string;
    nombre_completo: string;
    especialidad?: string;
  };
  laboratorio?: {
    id: string;
    nombre_completo: string;
  };
  tests?: LabOrderTest[];
  results?: LabResult[];
}

export interface LabOrderTest {
  id: string;
  order_id: string;
  test_type_id: string;
  status: LabTestStatus;
  resultado_disponible: boolean;
  created_at: string;
  // Relación
  test_type?: LabTestType;
}

export interface LabResult {
  id: string;
  order_id: string;
  test_type_id: string;
  fecha_resultado: string;
  resultado_pdf_url?: string;
  observaciones_generales?: string;
  validado_por?: string;
  fecha_validacion?: string;
  notificado_paciente: boolean;
  fecha_notificacion?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  test_type?: LabTestType;
  values?: LabResultValue[];
  validador?: {
    id: string;
    nombre_completo: string;
  };
}

export interface LabResultValue {
  id: string;
  result_id: string;
  parametro: string;
  valor?: string;
  unidad?: string;
  rango_referencia?: string;
  valor_minimo?: number;
  valor_maximo?: number;
  es_anormal: boolean;
  nivel_alerta?: AlertLevel;
  notas?: string;
  orden: number;
  created_at: string;
}

export interface LabOrderStatusHistory {
  id: string;
  order_id: string;
  status_anterior?: string;
  status_nuevo: string;
  comentario?: string;
  cambiado_por?: string;
  created_at: string;
  // Relación
  usuario?: {
    id: string;
    nombre_completo: string;
  };
}

export interface CreateLabOrderData {
  paciente_id: string;
  medico_id?: string;
  diagnostico_presuntivo?: string;
  indicaciones_clinicas?: string;
  prioridad?: LabOrderPriority;
  test_type_ids?: string[];
  tests?: string[]; // Alias for test_type_ids
  instrucciones_paciente?: string;
}

export interface LabOrderFilters {
  status?: LabOrderStatus;
  fecha_desde?: string;
  fecha_hasta?: string;
  prioridad?: LabOrderPriority;
}

export interface LabResultStats {
  total_ordenes: number;
  pendientes: number;
  completadas: number;
  con_valores_anormales: number;
  ultima_orden?: string;
}
