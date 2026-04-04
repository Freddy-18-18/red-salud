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
  error?: unknown;
}

export interface DoctorScheduleData {
  schedule: Record<string, string>;
}

export interface AppointmentDatabaseRow {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  reason: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfileRow {
  id: string;
  specialty_id: string;
  license_number: string;
  years_experience: number;
  bio?: string;
  consultation_price?: string;
  consultation_duration?: number;
  schedule?: unknown;
  office_address?: string;
  clinic_address?: string;
  office_phone?: string;
  professional_phone?: string;
  professional_email?: string;
  accepts_insurance?: boolean;
  is_verified: boolean;
  sacs_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
