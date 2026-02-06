// Tipos para el sistema de medicamentos

export interface MedicationCatalog {
  id: string;
  nombre_comercial: string;
  nombre_generico: string;
  principio_activo?: string;
  concentracion?: string;
  forma_farmaceutica?: string;
  fabricante?: string;
  descripcion?: string;
  indicaciones?: string;
  contraindicaciones?: string;
  efectos_secundarios?: string;
  dosis_usual?: string;
  requiere_receta: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export type PrescriptionStatus = 'activa' | 'surtida' | 'vencida' | 'cancelada';

export interface Prescription {
  id: string;
  paciente_id: string;
  medico_id: string;
  medical_record_id?: string;
  appointment_id?: string;
  fecha_prescripcion: string;
  fecha_vencimiento?: string;
  diagnostico?: string;
  instrucciones_generales?: string;
  status: PrescriptionStatus;
  farmacia_id?: string;
  fecha_surtida?: string;
  notas?: string;
  folio?: string;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  medico?: {
    id: string;
    nombre_completo: string;
    especialidad?: string;
    avatar_url?: string;
  };
  paciente?: {
    id: string;
    nombre_completo: string;
    cedula?: string;
    avatar_url?: string;
    fecha_nacimiento?: string;
    genero?: string;
  };
  offline_patient?: {
    id: string;
    nombre_completo: string;
    numero_documento?: string;
    telefono?: string;
    email?: string;
    fecha_nacimiento?: string;
  };
  medications?: PrescriptionMedication[];
}

export interface PrescriptionMedication {
  id: string;
  prescription_id: string;
  medication_id?: string;
  nombre_medicamento: string;
  dosis: string;
  frecuencia: string;
  via_administracion?: string;
  duracion_dias?: number;
  cantidad_total?: string;
  instrucciones_especiales?: string;
  created_at: string;
  // Datos del catálogo
  medication?: MedicationCatalog;
}

export interface MedicationReminder {
  id: string;
  paciente_id: string;
  prescription_medication_id?: string;
  nombre_medicamento: string;
  dosis: string;
  horarios: string[]; // Array de horarios en formato HH:MM
  dias_semana?: number[]; // 0-6, null = todos los días
  fecha_inicio: string;
  fecha_fin?: string;
  activo: boolean;
  notificar_email: boolean;
  notificar_push: boolean;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export type IntakeStatus = 'pendiente' | 'tomado' | 'omitido' | 'retrasado';

export interface MedicationIntakeLog {
  id: string;
  reminder_id: string;
  paciente_id: string;
  fecha_programada: string;
  fecha_tomada?: string;
  status: IntakeStatus;
  notas?: string;
  created_at: string;
  // Datos relacionados
  reminder?: MedicationReminder;
}

// Tipos para crear/actualizar
export interface CreatePrescriptionData {
  paciente_id?: string;
  offline_patient_id?: string;
  medico_id: string;
  medical_record_id?: string;
  appointment_id?: string;
  fecha_prescripcion?: string;
  fecha_vencimiento?: string;
  diagnostico?: string;
  instrucciones_generales?: string;
  notas?: string;
  medications?: CreatePrescriptionMedicationData[];
  medicamentos?: CreatePrescriptionMedicationData[]; // Alias for medications
}

export interface CreatePrescriptionMedicationData {
  medication_id?: string;
  nombre_medicamento: string;
  dosis: string;
  frecuencia: string;
  via_administracion?: string;
  duracion_dias?: number;
  cantidad_total?: string;
  instrucciones_especiales?: string;
}

export interface CreateReminderData {
  paciente_id: string;
  prescription_medication_id?: string;
  nombre_medicamento: string;
  dosis: string;
  horarios: string[];
  dias_semana?: number[];
  fecha_inicio: string;
  fecha_fin?: string;
  notificar_email?: boolean;
  notificar_push?: boolean;
  notas?: string;
}

// Estadísticas de adherencia
export interface AdherenceStats {
  total_tomas_programadas: number;
  tomas_completadas: number;
  tomas_omitidas: number;
  tomas_retrasadas: number;
  porcentaje_adherencia: number;
  racha_actual: number; // días consecutivos tomando medicamentos
  mejor_racha: number;
}

// Resumen de medicamentos activos
export interface ActiveMedicationsSummary {
  total_medicamentos: number;
  total_recordatorios: number;
  proxima_toma?: {
    medicamento: string;
    hora: string;
    minutos_restantes: number;
  } | null;
  medicamentos_activos: Array<{
    nombre: string;
    dosis: string;
    frecuencia: string;
    proxima_toma: string;
  }>;
}

// Template para recetas frecuentes
export interface PrescriptionTemplate {
  id: string;
  medico_id: string;
  nombre: string;
  descripcion?: string;
  diagnostico?: string;
  instrucciones_generales?: string;
  medicamentos: Array<{
    nombre_medicamento: string;
    dosis: string;
    frecuencia: string;
    duracion_dias?: number;
    via_administracion?: string;
    instrucciones_especiales?: string;
  }>;
  uso_count: number;
  ultima_uso?: string;
  created_at: string;
  updated_at: string;
}
