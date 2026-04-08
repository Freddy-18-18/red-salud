import type { ApiClient } from '../client';
import type { PaginatedResponse } from '../types';
import type {
  DoctorProfile,
  DoctorSearchFilters,
} from '@red-salud/contracts';

// Types not yet in contracts — local until promoted

export interface MedicalSpecialty {
  id: string;
  name: string;
  slug: string | null;
  icon: string | null;
  description: string | null;
  doctor_count?: number;
}

export interface DoctorAvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
}

export interface DoctorAvailability {
  doctor_id: string;
  date: string;
  slots: DoctorAvailabilitySlot[];
}

export interface DoctorReview {
  id: string;
  patient_id: string;
  doctor_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  patient?: {
    nombre_completo: string;
    avatar_url?: string;
  };
}

export interface NearbyDoctorParams {
  lat: string;
  lng: string;
  radius?: string;
  specialty?: string;
}

// ---------- helpers ----------

function toStringParams(
  filters: DoctorSearchFilters,
): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.specialty_id) params['specialty_id'] = filters.specialty_id;
  if (filters.accepts_insurance !== undefined)
    params['accepts_insurance'] = String(filters.accepts_insurance);
  if (filters.min_rating !== undefined)
    params['min_rating'] = String(filters.min_rating);
  if (filters.max_price !== undefined)
    params['max_price'] = String(filters.max_price);
  if (filters.languages?.length)
    params['languages'] = filters.languages.join(',');
  if (filters.accepts_new_patients !== undefined)
    params['accepts_new_patients'] = String(filters.accepts_new_patients);

  return params;
}

// ---------- domain client ----------

export class DoctorsApi {
  constructor(private client: ApiClient) {}

  /** List all medical specialties. */
  getSpecialties(params?: Record<string, string>) {
    return this.client.get<MedicalSpecialty[]>(
      '/doctors/specialties',
      params,
    );
  }

  /** Search doctors with filters (specialty, insurance, rating, price, languages). */
  searchDoctors(filters: DoctorSearchFilters) {
    return this.client.get<DoctorProfile[]>(
      '/doctors/search',
      toStringParams(filters),
    );
  }

  /** Get a single doctor's full public profile. */
  getDoctorProfile(doctorId: string) {
    return this.client.get<DoctorProfile>(`/doctors/${doctorId}`);
  }

  /** Get available time-slots for a doctor on a given date. */
  getDoctorAvailability(
    doctorId: string,
    params?: { date?: string },
  ) {
    return this.client.get<DoctorAvailability>(
      `/doctors/${doctorId}/availability`,
      params as Record<string, string> | undefined,
    );
  }

  /** Get paginated reviews for a doctor. */
  getDoctorReviews(
    doctorId: string,
    params?: { page?: string; pageSize?: string },
  ) {
    return this.client.get<PaginatedResponse<DoctorReview>>(
      `/doctors/${doctorId}/reviews`,
      params as Record<string, string> | undefined,
    );
  }

  /** Find doctors near a geographic coordinate. */
  getNearbyDoctors(params: NearbyDoctorParams) {
    return this.client.get<DoctorProfile[]>(
      '/doctors/nearby',
      params as Record<string, string>,
    );
  }
}
