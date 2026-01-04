// Types for appointments service
export type {
  Appointment,
  DoctorProfile,
  MedicalSpecialty,
  CreateAppointmentData,
  TimeSlot,
  DoctorSchedule,
} from "../../types/appointments";

// Internal types for service
export interface AppointmentServiceResponse<T> {
  success: boolean;
  data: T;
  error?: any;
}

export interface DoctorScheduleData {
  horario_atencion: Record<string, string>;
}

export interface AppointmentDatabaseRow {
  id: string;
  paciente_id: string;
  medico_id: string;
  fecha_hora: string;
  duracion_minutos: number;
  motivo: string;
  notas?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfileRow {
  id: string;
  especialidad_id: string;
  licencia_medica: string;
  anos_experiencia: number;
  biografia?: string;
  tarifa_consulta?: string;
  consultation_price?: string;
  consultation_duration?: number;
  horario_atencion?: any;
  schedule?: any;
  direccion_consultorio?: string;
  clinic_address?: string;
  telefono_consultorio?: string;
  professional_phone?: string;
  professional_email?: string;
  acepta_seguro?: boolean;
  accepts_insurance?: boolean;
  verified: boolean;
  sacs_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
