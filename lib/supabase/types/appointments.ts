// Tipos para el sistema de citas médicas

export interface MedicalSpecialty {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export interface DoctorProfile {
  id: string;
  specialty_id?: string;
  license_number?: string;
  anos_experiencia?: number;
  biografia?: string;
  tarifa_consulta?: number;
  consultation_duration?: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
  // Datos del perfil base
  profile?: {
    id: string;
    nombre_completo?: string;
    email?: string;
    avatar_url?: string;
  };
  // Especialidad
  specialty?: MedicalSpecialty & { icon?: string };
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0=Domingo, 6=Sábado
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type ConsultationType = 'video' | 'presencial' | 'telefono';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  status: AppointmentStatus;
  consultation_type: ConsultationType;
  reason?: string;
  notes?: string;
  meeting_url?: string;
  price?: number;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  // Datos relacionados
  doctor?: DoctorProfile;
  patient?: {
    id: string;
    nombre_completo: string;
    email: string;
    avatar_url?: string;
  };
}

export interface AppointmentNote {
  id: string;
  appointment_id: string;
  doctor_id: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: string;
  follow_up_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointment_id?: string;
}

export interface CreateAppointmentData {
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: ConsultationType;
  reason?: string;
}
