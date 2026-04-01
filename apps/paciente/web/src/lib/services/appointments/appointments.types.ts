// Appointment types for the patient app
// TODO: These should migrate to @red-salud/types once the shared package is ready

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  consultation_type: "video" | "presencial" | "telefono";
  reason?: string;
  notes?: string;
  price?: number;
  created_at: string;
  updated_at: string;
  doctor?: {
    id: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  patient?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface MedicalSpecialty {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface DoctorProfile {
  id: string;
  specialty_id?: string;
  license_number?: string;
  years_experience?: number;
  biografia?: string;
  consultation_fee?: number;
  consultation_duration?: number;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
  profile?: {
    id?: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  specialty?: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
  };
}

export interface CreateAppointmentData {
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: "video" | "presencial" | "telefono";
  reason?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointment_id?: string;
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface AppointmentServiceResponse<T> {
  success: boolean;
  data: T;
  error?: unknown;
}
