// Tipos para el sistema de historial clínico

export interface MedicalRecord {
  id: string;
  paciente_id: string;
  medico_id: string;
  appointment_id?: string;
  diagnostico: string;
  sintomas?: string;
  tratamiento?: string;
  medicamentos?: string;
  examenes_solicitados?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  medico?: {
    id: string;
    nombre_completo: string;
    avatar_url?: string;
    especialidad?: string;
  };
  appointment?: {
    id: string;
    fecha_hora: string;
    motivo?: string;
  };
}

export interface CreateMedicalRecordData {
  paciente_id: string;
  medico_id: string;
  appointment_id?: string;
  diagnostico: string;
  sintomas?: string;
  tratamiento?: string;
  medicamentos?: string;
  examenes_solicitados?: string;
  observaciones?: string;
}

export interface MedicalRecordFilters {
  startDate?: string;
  endDate?: string;
  medicoId?: string;
  searchTerm?: string;
}

export interface MedicalRecordStats {
  total_records: number;
  total_doctors: number;
  recent_diagnoses: string[];
  last_visit?: string;
}

// Para el resumen del historial
export interface MedicalHistorySummary {
  total_consultas: number;
  ultima_consulta?: string;
  diagnosticos_frecuentes: Array<{ diagnostico: string; count: number }>;
  medicamentos_actuales: string[];
  examenes_pendientes: string[];
  doctores_consultados: Array<{
    id: string;
    nombre: string;
    especialidad: string;
    consultas: number;
  }>;
}
