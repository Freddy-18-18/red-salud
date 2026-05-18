// Appointment types for the patient app
// TODO: These should migrate to @red-salud/types once the shared package is ready

// ── Core Appointment ────────────────────────────────────────────────

/**
 * Canonical appointment shape returned by `GET /api/appointments`.
 *
 * Field names mirror the `appointments` table columns. Earlier iterations of
 * this type used `appointment_date`/`appointment_time`/`consultation_type`
 * which never existed in the DB — every consumer reading those fields was
 * receiving `undefined`. If you find a stale reference, update it here.
 */
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "waiting"
  | "in_progress"
  | "no_show";

export type AppointmentType =
  | "in_person"
  | "telemedicine"
  | "emergency"
  | "follow_up"
  | "first_visit";

export type AppointmentPaymentMethod =
  | "cash"
  | "transfer"
  | "card"
  | "insurance"
  | "mobile_payment"
  | "pending"
  | "pago_movil"
  | "transferencia"
  | "efectivo"
  | "zelle"
  | "tarjeta_credito"
  | "tarjeta_debito";

export type AppointmentPaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "refunded"
  | "failed";

export interface Appointment {
  id: string;
  patient_id?: string;
  doctor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  appointment_type: AppointmentType;
  reason?: string | null;
  notes?: string | null;
  price?: number | null;
  payment_method?: AppointmentPaymentMethod | null;
  payment_status?: AppointmentPaymentStatus | null;
  location_id?: string | null;
  cancelled_at?: string | null;
  cancelled_by?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at?: string;
  doctor?: {
    id: string;
    full_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    city?: string | null;
    state?: string | null;
  } | null;
  patient?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
}

/**
 * Extended appointment shape returned by `GET /api/appointments/{id}`.
 * Includes everything the detail view needs in one round-trip:
 *   - the doctor's medical profile (specialty, experience, fees)
 *   - the sede (organization_locations + parent organization)
 *   - the doctor's cancellation window (resolved on the server)
 */
export interface AppointmentDetail extends Appointment {
  doctor?:
    | (NonNullable<Appointment["doctor"]> & {
        phone?: string | null;
        doctor_profile?: {
          id: string;
          biography?: string | null;
          consultation_fee?: number | null;
          consultation_duration?: number | null;
          accepts_telemedicine?: boolean | null;
          verified?: boolean | null;
          sacs_verified?: boolean | null;
          years_experience?: number | null;
          languages?: string[] | null;
          specialty?: {
            id: string;
            name: string;
            icon?: string | null;
          } | null;
        } | null;
      })
    | null;
  location?: {
    id: string;
    name: string;
    address_line?: string | null;
    city?: string | null;
    state?: string | null;
    phone?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    organization?: {
      id: string;
      name: string;
    } | null;
  } | null;
  // PostgREST may embed as a single object (when the row is unique by FK) or
  // as an array. Consumers should normalize via Array.isArray.
  review?:
    | {
        id: string;
        rating: number;
        created_at: string;
      }
    | Array<{
        id: string;
        rating: number;
        created_at: string;
      }>
    | null;
  waitlist?: {
    id: string;
    status: "active" | "notified" | "fulfilled" | "expired" | "cancelled";
    before_at: string;
    created_at: string;
  } | null;
  cancellation_window_hours: number;
}

// ── Specialties ─────────────────────────────────────────────────────

export interface MedicalSpecialty {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  /**
   * Number of verified doctors registered under this specialty. The booking
   * UI shows specialties with `doctor_count === 0` as "Próximamente" and
   * blocks the user from advancing to the doctor-selection step until at
   * least one doctor exists.
   */
  doctor_count?: number;
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
  consultation_duration?: number | null;
  accepts_insurance: boolean;
  accepts_telemedicine?: boolean;
  accepts_new_patients?: boolean;
  years_experience: number | null;
  biografia: string | null;
  biography?: string | null;
  verified: boolean;
  languages?: string[];
  profile: {
    id: string;
    full_name: string;
    first_name?: string | null;
    last_name?: string | null;
    gender?: string | null;
    email?: string;
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

// ── Full doctor profile (decision page / Fase 1) ────────────────────

interface WorkExperienceEntry {
  position?: string;
  organization?: string;
  start_year?: number;
  end_year?: number | null;
  description?: string;
}

interface AwardEntry {
  title?: string;
  year?: number;
  issuer?: string;
}

interface PublicationEntry {
  title?: string;
  year?: number;
  journal?: string;
  url?: string;
}

interface AssociationEntry {
  name?: string;
  role?: string;
  since?: number;
}

interface AcceptedInsuranceEntry {
  name?: string;
  plan?: string;
  notes?: string;
}

interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

/**
 * Full doctor profile returned by `/api/doctors/[id]` for the public decision
 * page (`/dashboard/buscar-medico/doctor/[idOrSlug]`). This is the dossier the
 * patient uses to decide whether to book this doctor — every field surfaces
 * in the profile UI tabs.
 */
export interface FullDoctorProfile {
  id: string;
  profile_id: string;
  slug: string | null;
  verified: boolean;
  sacs_verified: boolean | null;
  sacs_data: Record<string, unknown> | null;
  is_featured: boolean | null;
  consultation_fee: number | null;
  consultation_price: number | null;
  consultation_duration: number | null;
  accepts_insurance: boolean | null;
  accepts_telemedicine: boolean | null;
  accepts_new_patients: boolean | null;
  accepted_insurances: AcceptedInsuranceEntry[] | null;
  clinic_address: string | null;
  clinic_phone: string | null;
  professional_email: string | null;
  website: string | null;
  social_media: SocialMedia | null;
  years_experience: number | null;
  biography: string | null;
  average_rating: number | null;
  total_reviews: number | null;
  total_consultations: number | null;
  languages: string[] | null;
  certifications: string[] | null;
  subspecialties: string[] | null;
  specialization_areas: string[] | null;
  conditions_treated: string[] | null;
  age_groups: string[] | null;
  awards: AwardEntry[] | null;
  publications: PublicationEntry[] | null;
  associations: AssociationEntry[] | null;
  work_experience: WorkExperienceEntry[] | null;
  university: string | null;
  graduation_year: number | null;
  college_number: string | null;
  medical_license: string | null;
  professional_type: string | null;
  verified_at: string | null;
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
    state: string | null;
    /** Optional — `profiles.gender` is being added in a follow-up migration. */
    gender?: string | null;
  };
  specialty: {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
    slug: string | null;
  };
  avg_rating: number | null;
  review_count: number;
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

/**
 * Body for `POST /api/appointments`. Matches the validation in
 * `lib/validation/schemas.ts:createAppointmentSchema` exactly — keep them in
 * sync. The legacy alias `BookingCreateAppointmentData` was removed; this is
 * the only shape callers should use.
 */
export interface CreateAppointmentData {
  doctor_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  reason: string;
  notes?: string;
  appointment_type?: AppointmentType;
  price?: number;
  payment_method?: AppointmentPaymentMethod;
  location_id?: string;
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
