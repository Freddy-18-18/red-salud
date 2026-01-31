// Tipos para el sistema de médicos

export interface MedicalSpecialty {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  active: boolean;
  modules_config: {
    citas: boolean;
    historial: boolean;
    mensajeria: boolean;
    telemedicina: boolean;
    recetas: boolean;
    laboratorio: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface DoctorSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface DoctorProfile {
  id: string;
  profile_id?: string;
  specialty_id: string | null;
  specialty?: MedicalSpecialty;
  license_number: string | null;
  license_country: string;
  years_experience: number;
  professional_phone: string | null;
  professional_email: string | null;
  clinic_address: string | null;
  consultation_duration: number; // minutos
  consultation_price: number | null;
  accepts_insurance: boolean;
  bio: string | null;
  languages: string[];
  is_verified: boolean;
  is_active: boolean;
  sacs_verified: boolean;
  sacs_data: Record<string, unknown> | null;
  average_rating: number;
  total_reviews: number;
  schedule?: DoctorSchedule;
  created_at: string;
  updated_at: string;
  // Campos adicionales del perfil base
  nombre_completo?: string;
  email?: string;
  telefono?: string;
  cedula?: string;
  cedula_verificada?: boolean;
  sacs_verificado?: boolean;
  sacs_nombre?: string;
  sacs_matricula?: string;
  sacs_especialidad?: string;
  universidad?: string;
}

export interface DoctorProfileFormData {
  specialty_id?: string;
  license_number?: string;
  license_country?: string;
  years_experience?: number;
  professional_phone?: string;
  professional_email?: string;
  clinic_address?: string;
  consultation_duration?: number;
  consultation_price?: number;
  accepts_insurance?: boolean;
  bio?: string;
  languages?: string[];
  schedule?: DoctorSchedule;
}

export interface DoctorPatient {
  id: string;
  doctor_id: string;
  patient_id: string;
  patient?: {
    id: string;
    nombre_completo: string;
    email: string;
    avatar_url: string | null;
    fecha_nacimiento: string | null;
    genero: string | null;
    telefono: string | null;
  };
  first_consultation_date: string | null;
  last_consultation_date: string | null;
  total_consultations: number;
  status: 'active' | 'inactive' | 'archived';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalNote {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_id: string | null;
  note_type: 'consultation' | 'diagnosis' | 'treatment' | 'follow_up' | 'general';
  title: string | null;
  content: string;
  diagnosis: string | null;
  treatment_plan: string | null;
  prescriptions: Array<Record<string, unknown>>;
  attachments: Array<Record<string, unknown>>;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorStats {
  total_patients: number;
  total_consultations: number;
  consultations_this_month: number;
  consultations_today: number;
  pending_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  average_rating: number;
  total_reviews: number;
  revenue_this_month: number;
}

export interface DoctorReview {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorReviewFormData {
  rating: number;
  comment?: string;
}

export interface DoctorAvailabilityException {
  id: string;
  doctor_id: string;
  date: string;
  is_available: boolean;
  reason: string | null;
  custom_slots: TimeSlot[];
  created_at: string;
  updated_at: string;
}

export interface DoctorSearchFilters {
  specialty_id?: string;
  accepts_insurance?: boolean;
  min_rating?: number;
  max_price?: number;
  languages?: string[];
  accepts_new_patients?: boolean;
}

export interface DoctorSearchResult extends DoctorProfile {
  profile: {
    id: string;
    nombre_completo: string;
    avatar_url: string | null;
  };
}
