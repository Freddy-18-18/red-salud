// TODO: Move to @red-salud/types when the shared package supports these types
// Local type definitions for doctor-related entities

export interface DoctorProfile {
  id: string;
  user_id?: string;
  full_name?: string;
  specialty_id?: string;
  specialty?: { id?: string; name?: string; slug?: string; icon?: string };
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
  languages?: string[] | string;
  avatar_url?: string;
  sacs_especialidad?: string;
  sacs_verificado?: boolean;
  is_verified?: boolean;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export type DoctorProfileFormData = Partial<
  Pick<
    DoctorProfile,
    | 'specialty_id'
    | 'license_number'
    | 'license_country'
    | 'years_experience'
    | 'professional_phone'
    | 'professional_email'
    | 'clinic_address'
    | 'consultation_duration'
    | 'consultation_price'
    | 'accepts_insurance'
    | 'bio'
    | 'languages'
  >
>;

export interface MedicalSpecialty {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  active?: boolean;
  description?: string;
}

export interface DoctorReview {
  id: string;
  doctor_id: string;
  patient_id?: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export interface DoctorReviewFormData {
  rating: number;
  comment?: string;
}

export interface DoctorAvailabilityException {
  id: string;
  doctor_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
  is_available: boolean;
}

export interface DoctorSearchFilters {
  specialty?: string;
  specialty_id?: string;
  name?: string;
  city?: string;
  accepts_insurance?: boolean;
  max_price?: number;
  languages?: string[];
  limit?: number;
  offset?: number;
}

export interface DoctorSearchResult {
  doctors: DoctorProfile[];
  total: number;
}
