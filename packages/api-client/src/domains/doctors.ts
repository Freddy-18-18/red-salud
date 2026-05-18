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

/**
 * Shape returned by `GET /api/v1/doctors/search` — kept snake_case to match
 * the underlying Supabase columns. Adapters in each web app translate this to
 * their app-local view models.
 */
export interface GatewayDoctorSearchItem {
  id: string;
  slug: string | null;
  specialty_id: string | null;
  consultation_fee: number | null;
  consultation_price: number | null;
  average_rating: number | null;
  total_reviews: number | null;
  accepts_insurance: boolean;
  accepts_new_patients: boolean | null;
  accepts_telemedicine: boolean | null;
  verified: boolean;
  years_experience: number | null;
  biography: string | null;
  languages: string[] | null;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
    state: string | null;
  } | null;
  specialty: {
    id: string;
    name: string;
    slug: string | null;
    icon: string | null;
  } | null;
}

export interface GatewayDoctorSearchResponse {
  data: GatewayDoctorSearchItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
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

  /**
   * Search doctors via the gateway. Returns the raw paginated response shape
   * (snake_case to match Supabase columns); callers should adapt to their
   * local view models.
   *
   * Note: `ApiClient.request` is typed as `Promise<ApiResponse<T>>` but the
   * runtime returns the raw JSON body — that mismatch predates this method.
   * The cast unwraps the phantom `ApiResponse` layer until the client itself
   * is refactored.
   */
  searchDoctors(
    filters: DoctorSearchFilters & { page?: number; pageSize?: number },
  ): Promise<GatewayDoctorSearchResponse> {
    const params = toStringParams(filters);
    if (filters.page) params.page = String(filters.page);
    if (filters.pageSize) params.page_size = String(filters.pageSize);
    return this.client.get<GatewayDoctorSearchResponse>(
      '/doctors/search',
      params,
    ) as unknown as Promise<GatewayDoctorSearchResponse>;
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
      { ...params } as Record<string, string>,
    );
  }
}
