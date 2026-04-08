// Appointment types for the patient app
// TODO: These should migrate to @red-salud/types once the shared package is ready

// ── Core Appointment ────────────────────────────────────────────────

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

// ── Specialties ─────────────────────────────────────────────────────

export interface MedicalSpecialty {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

/** Alias used by the booking flow */
export type Specialty = MedicalSpecialty;

// ── Doctor Profiles ─────────────────────────────────────────────────

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

/** Extended doctor profile returned by the booking search API */
export interface BookingDoctorProfile {
  id: string;
  profile_id: string;
  specialty_id: string;
  consultation_fee: number | null;
  accepts_insurance: boolean;
  years_experience: number | null;
  biografia: string | null;
  verified: boolean;
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    city: string | null;
    state: string | null;
  };
  specialty: {
    id: string;
    name: string;
  };
  avg_rating: number | null;
  review_count: number;
  next_available: string | null;
}

export interface DoctorFilters {
  city?: string;
  accepts_insurance?: boolean;
  gender?: string;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "rating";
}

// ── Time Slots & Availability ───────────────────────────────────────

export interface TimeSlot {
  time: string;
  available: boolean;
  appointment_id?: string;
}

/** Time slot used in the booking flow (start/end range) */
export interface BookingTimeSlot {
  start: string; // HH:MM
  end: string; // HH:MM
  available: boolean;
}

export interface TimeSlotGroup {
  label: string;
  slots: BookingTimeSlot[];
}

export interface AvailableDate {
  date: string; // ISO date YYYY-MM-DD
  dayOfWeek: number;
  hasSlots: boolean;
}

// ── Create / Result ─────────────────────────────────────────────────

export interface CreateAppointmentData {
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: "video" | "presencial" | "telefono";
  reason?: string;
}

/** Data shape for creating appointments through the booking flow */
export interface BookingCreateAppointmentData {
  doctor_id: string;
  scheduled_at: string; // ISO datetime
  duration_minutes: number;
  reason: string;
  notes?: string;
  appointment_type: "presencial" | "telemedicina";
}

export interface AppointmentResult {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  reason: string;
  notes: string | null;
  status: string;
  appointment_type: string;
}
