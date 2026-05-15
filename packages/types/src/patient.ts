/**
 * @file packages/types/src/patient.ts
 * @description Shared patient types consumed by every domain app (medico, paciente,
 * secretaria, etc.). Column names match the real Supabase `profiles` schema —
 * NOT the legacy Spanish aliases that `useDoctorAppointments` synthesizes for
 * backwards-compat (those should be replaced as consumers migrate).
 *
 * Tasks: T-1-04 (REQ-1.4 + spec §2).
 *
 * Why this lives in @red-salud/types and not inside the medico-web app:
 * - Multiple apps need the same shape (medico reads the roster; secretaria
 *   reads the same patients for intake; paciente reads the same row as their
 *   own profile). Centralizing keeps the shape consistent across domains.
 * - Domain isolation rule (CLAUDE.md): apps MUST NOT import from each other,
 *   so shared shapes belong in a package.
 *
 * Conventions:
 * - ISO 8601 strings for dates/timestamps (Supabase native return shape).
 *   Components convert to America/Caracas wall-clock via
 *   `toLocaleDateString('es-VE', { timeZone: 'America/Caracas' })` per REQ-X.2.
 * - `null` (not `undefined`) for absent optional values — matches PostgREST.
 * - Field names mirror the real DB columns exactly: `national_id`, `phone`,
 *   `date_of_birth`, `city`, `state`. No aliases.
 */

/**
 * Compact row representing a patient in a doctor's roster / list view.
 *
 * Derived from `profiles` joined with aggregate appointment data:
 * - `last_visit_at` = `max(appointments.scheduled_at)` where `status='completed'`
 * - `next_appointment_at` = `min(appointments.scheduled_at)` where
 *   `scheduled_at > now() AND status NOT IN ('cancelled')`
 * - `total_visits` = `count(appointments)` for this doctor + patient pair
 */
export interface PatientSummary {
  /** profiles.id (UUID) */
  id: string;
  /** profiles.full_name */
  full_name: string;
  /** profiles.national_id (Venezuelan cedula format `[VEJG]-\d{6,9}`); null when missing */
  national_id: string | null;
  /** profiles.phone (E.164 or local Venezuelan format); null when missing */
  phone: string | null;
  /** profiles.date_of_birth as ISO date string (YYYY-MM-DD); null when missing */
  date_of_birth: string | null;
  /** profiles.avatar_url; null when no avatar uploaded */
  avatar_url: string | null;
  /**
   * Derived: latest completed appointment for this doctor+patient pair.
   * ISO 8601 timestamp string; null when patient never visited.
   */
  last_visit_at: string | null;
  /**
   * Derived: next scheduled future appointment for this doctor+patient pair.
   * ISO 8601 timestamp string; null when none upcoming.
   */
  next_appointment_at: string | null;
  /** Derived count of appointments for this doctor+patient pair. */
  total_visits: number;
}

/**
 * Joined patient_details subset embedded inside `PatientFull`. The join may
 * return `null` for patients without a `patient_details` row — the spec's
 * SC-2.2 calls this case out explicitly (banner shows "Sin información
 * clínica registrada").
 */
export interface PatientDetailsRow {
  /** patient_details.profile_id (FK to profiles.id) */
  profile_id: string;
  /** ABO/Rh blood group; null when not asked */
  grupo_sanguineo: string | null;
  /** Free-text allergies (no severity/reaction metadata at this layer — see proposal §7) */
  alergias: string[];
  /** Canonical-tag slugs from lib/chronic/canonical-tags.ts */
  enfermedades_cronicas: string[];
  /** Free-text current medications as the doctor recorded them */
  medicamentos_actuales: string[];
  /** Free-text doctor notes (no PHI guard — visible only to the doctor's roster) */
  notas_medicas: string | null;
  /** Weight in kilograms; null when not measured */
  peso_kg: number | null;
  /** Height in centimeters; null when not measured */
  altura_cm: number | null;
}

/**
 * Full patient detail row — used by `/dashboard/pacientes/[patientId]` and
 * any deep-view of a single patient. Adds demographics + the optional join
 * with `patient_details`.
 */
export interface PatientFull {
  /** profiles.id (UUID) */
  id: string;
  /** profiles.full_name */
  full_name: string;
  /** profiles.email; null when patient has no auth account yet (offline patients) */
  email: string | null;
  /** profiles.national_id (cedula); null when missing */
  national_id: string | null;
  /** profiles.phone; null when missing */
  phone: string | null;
  /** profiles.date_of_birth as ISO date string; null when missing */
  date_of_birth: string | null;
  /** profiles.gender; values from the design-system gender enum */
  gender: string | null;
  /** profiles.city (NOT `ciudad` — real DB column) */
  city: string | null;
  /** profiles.state (NOT `estado` — real DB column) */
  state: string | null;
  /** profiles.nationality; null when not declared */
  nationality: string | null;
  /** profiles.avatar_url; null when no avatar uploaded */
  avatar_url: string | null;
  /**
   * Optional join with `patient_details`. `null` when the row does not exist
   * (common for newly-onboarded patients before clinical data has been
   * captured). Components MUST handle this explicitly (per SC-2.2).
   */
  patient_details: PatientDetailsRow | null;
}
