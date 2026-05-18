/**
 * @file lib/sedes/types.ts
 * @description Domain types for the medico practice-locations (sedes) feature.
 *
 * This is the doctor-owned multi-sede model — distinct from clinica's
 * `organization_locations`. Per-row RLS pins ownership to `auth.uid()`; only
 * the doctor can read or mutate their own rows. See
 * `supabase/migrations/*_doctor_practice_locations_with_rls.sql`.
 *
 * The table is intentionally lean: id + doctor + name + address + primary flag
 * + soft-delete flag + timestamps. Anything richer (phones, opening hours,
 * staff) should live in a future companion table — keep this surface narrow.
 *
 * Individual doctor practice ONLY — no clinic / multi-org concepts.
 */

/**
 * Row shape returned by `select('*')` on `public.doctor_practice_locations`.
 *
 * Rich fields (phone, city, state, lat/lng, etc.) landed in the
 * `enrich_doctor_practice_locations_and_unify_schedule_fk` migration. They're
 * nullable so existing rows (created before the wizard) continue to load.
 */
export interface DoctorPracticeLocation {
  id: string;
  doctor_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  amenities: Record<string, unknown>;
  arrival_instructions: string | null;
  is_primary: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fields the doctor sets when creating a new sede. `doctor_id` is enforced
 * server-side via RLS WITH CHECK; the service layer fills it from the
 * authenticated session.
 */
export interface CreateSedeInput {
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  amenities?: Record<string, unknown>;
  arrival_instructions?: string | null;
  is_primary?: boolean;
}

/**
 * Partial update — every field is optional. `active=false` is a soft-delete
 * (used by the deletion-guard fallback when reassign isn't possible yet).
 */
export interface UpdateSedeInput extends Partial<CreateSedeInput> {
  active?: boolean;
}

/**
 * Error identifier raised by `deleteSede` when the target sede is still linked
 * to one or more appointments. The numeric suffix is the appointment count, so
 * the UI can surface "Esta sede tiene N citas asociadas" without re-querying.
 *
 * Format: `SEDE_HAS_APPOINTMENTS:<count>`.
 */
export const SEDE_HAS_APPOINTMENTS_PREFIX = 'SEDE_HAS_APPOINTMENTS' as const;
