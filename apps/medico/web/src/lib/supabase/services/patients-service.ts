/**
 * @file lib/supabase/services/patients-service.ts
 * @description Service layer for patient roster + single-patient reads in the
 * medico web app. Pure async functions returning discriminated `{ data, error }`
 * envelopes — never throwing raw Supabase errors. UI consumers (hooks) surface
 * the error envelope to render visible error states with retry (REQ-1.3,
 * REQ-X.4).
 *
 * Tasks: T-1-06 (REQ-1.5, REQ-X.1, REQ-X.4).
 *
 * Key invariants:
 * - No `console.*` calls that include PHI (REQ-X.1). UUIDs are truncated to
 *   the first 8 chars when correlation logging is necessary.
 * - All functions accept a `PatientsSupabaseClient` parameter — dependency
 *   injection for testability. Production callers pass the real
 *   `@/lib/supabase/client` instance.
 * - Returns map raw Postgres rows → `@red-salud/types` shapes; the DB column
 *   names are now the canonical names (national_id/phone/date_of_birth), so
 *   the mapping is mostly a passthrough plus aggregate computation.
 *
 * Future extensions (Phase 3, NOT in this file yet):
 * - `listPatientsPaginated`, `getRosterKPIs`, `exportRosterCsv` — added in
 *   T-3-08/T-3-09. This module intentionally stays small for P1.
 */

import type {
  PatientFull,
  PatientSummary,
  PatientDetailsRow,
} from '@red-salud/types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ServiceErrorCode =
  | 'unauthorized'
  | 'not_found'
  | 'rls_violation'
  | 'network'
  | 'unknown';

export interface ServiceError {
  code: ServiceErrorCode;
  /** UI-safe message — no PHI, suitable for sonner toast or inline display. */
  message: string;
}

export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: ServiceError };

/**
 * Minimal structural type capturing the chained query-builder shape the
 * service consumes from `@supabase/supabase-js`. Using this thin interface
 * (rather than the full `SupabaseClient` type) keeps tests fast — stubs only
 * need to satisfy the chain.
 */
export interface PatientsSupabaseClient {
  from: (table: string) => unknown;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Truncates a UUID to the first 8 chars for correlation logging.
 * Per REQ-X.1, error logs MUST NOT carry full patient identifiers.
 * The function is intentionally pure so tests can verify it directly when
 * needed; consumers MAY use it for sanitized debug strings.
 */
export function correlationHash(uuid: string | null | undefined): string {
  if (!uuid) return 'anon----';
  return uuid.slice(0, 8);
}

function toServiceError(raw: unknown): ServiceError {
  // Default message stays generic — UI surfaces this verbatim.
  if (raw && typeof raw === 'object' && 'message' in raw) {
    const message = String((raw as { message: unknown }).message ?? '');
    // Heuristic mapping for common Supabase error codes.
    const lower = message.toLowerCase();
    if (lower.includes('rls') || lower.includes('row-level security') || lower.includes('permission denied')) {
      return { code: 'rls_violation', message: 'No tenés permiso para acceder a este recurso.' };
    }
    if (lower.includes('jwt') || lower.includes('not authenticated')) {
      return { code: 'unauthorized', message: 'Sesión expirada. Iniciá sesión nuevamente.' };
    }
    if (lower.includes('fetch') || lower.includes('network')) {
      return { code: 'network', message: 'No pudimos conectar con el servidor. Reintentá.' };
    }
    return { code: 'unknown', message: 'No pudimos completar la operación. Reintentá en unos segundos.' };
  }
  return { code: 'unknown', message: 'No pudimos completar la operación. Reintentá en unos segundos.' };
}

// ---------------------------------------------------------------------------
// listPatientsForDoctor
// ---------------------------------------------------------------------------

interface ListPatientsForDoctorOptions {
  doctorId: string;
  /** Restricts to patients with at least one appointment in this sede (location). */
  locationId?: string | null;
  /** Server-side ilike search across full_name + national_id. */
  search?: string;
  /** Defaults to 50. Phase 3 (T-3-08) introduces cursor pagination. */
  limit?: number;
}

interface DoctorPatientLinkRow {
  patient_id: string;
}

interface ProfileRow {
  id: string;
  full_name: string;
  national_id: string | null;
  phone: string | null;
  date_of_birth: string | null;
  avatar_url: string | null;
}

interface AppointmentAggregateRow {
  patient_id: string;
  scheduled_at: string;
  status: string;
}

/**
 * Returns the doctor's patient roster as `PatientSummary[]`. The roster is
 * sourced from `doctor_patients` (the relational link table) — patients NOT
 * in `doctor_patients` are out of scope for this query, even if appointments
 * exist (Phase 2 extends to consider appointment history; here we stay
 * strictly relational).
 *
 * Aggregate fields (`last_visit_at`, `next_appointment_at`, `total_visits`)
 * are computed in-memory after fetching the relevant `appointments` slice —
 * not via a Postgres aggregate. Acceptable because:
 *   - The roster size for an individual doctor rarely exceeds the page size.
 *   - Cursor pagination (Phase 3) replaces this with server-side aggregation.
 *
 * RLS already restricts both `doctor_patients` and `appointments` to the
 * caller's `auth.uid()`, so no additional filter is needed.
 */
export async function listPatientsForDoctor(
  client: PatientsSupabaseClient,
  opts: ListPatientsForDoctorOptions,
): Promise<ServiceResult<PatientSummary[]>> {
  // Step 1: relational link rows.
  let linkRows: DoctorPatientLinkRow[] = [];
  try {
    const linkBuilder = client.from('doctor_patients') as unknown as {
      select: (cols: string) => unknown;
    };
    const linkResult = (await (linkBuilder
      .select('patient_id') as unknown as {
      eq: (col: string, val: string) => Promise<{
        data: DoctorPatientLinkRow[] | null;
        error: { message: string } | null;
      }>;
    }).eq('doctor_id', opts.doctorId)) as {
      data: DoctorPatientLinkRow[] | null;
      error: { message: string } | null;
    };

    if (linkResult.error) {
      return { data: null, error: toServiceError(linkResult.error) };
    }
    linkRows = linkResult.data ?? [];
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }

  if (linkRows.length === 0) {
    return { data: [], error: null };
  }

  const patientIds = linkRows.map((row) => row.patient_id);

  // Step 2: profiles for those ids.
  let profileRows: ProfileRow[] = [];
  try {
    const profileBuilder = client.from('profiles') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = profileBuilder.select(
      'id, full_name, national_id, phone, date_of_birth, avatar_url',
    ) as unknown as {
      in: (col: string, vals: string[]) => unknown;
    };
    let chain = selectChain.in('id', patientIds) as unknown as {
      ilike: (col: string, pattern: string) => unknown;
      order: (col: string, opt: { ascending: boolean }) => unknown;
      limit: (n: number) => Promise<{
        data: ProfileRow[] | null;
        error: { message: string } | null;
      }>;
    };
    if (opts.search && opts.search.trim().length > 0) {
      const pattern = `%${opts.search.trim()}%`;
      chain = chain.ilike('full_name', pattern) as typeof chain;
    }
    const orderedChain = chain.order('full_name', { ascending: true }) as unknown as {
      limit: (n: number) => Promise<{
        data: ProfileRow[] | null;
        error: { message: string } | null;
      }>;
    };
    const profileResult = await orderedChain.limit(opts.limit ?? 50);

    if (profileResult.error) {
      return { data: null, error: toServiceError(profileResult.error) };
    }
    profileRows = profileResult.data ?? [];
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }

  // Step 3: aggregate appointment data per patient.
  // We accept silent fallback to zero aggregates if this fetch errors —
  // showing the roster with empty visit counts is better than failing the
  // whole list.
  let appointmentRows: AppointmentAggregateRow[] = [];
  try {
    const apptBuilder = client.from('appointments') as unknown as {
      select: (cols: string) => unknown;
    };
    const apptChain = apptBuilder.select(
      'patient_id, scheduled_at, status',
    ) as unknown as {
      in: (col: string, vals: string[]) => unknown;
    };
    let chain = apptChain.in('patient_id', patientIds) as unknown as {
      eq: (col: string, val: string) => unknown;
      then: <U>(
        resolve: (v: {
          data: AppointmentAggregateRow[] | null;
          error: { message: string } | null;
        }) => U,
      ) => Promise<U>;
    };
    if (opts.locationId) {
      chain = chain.eq('practice_location_id', opts.locationId) as typeof chain;
    }
    const apptResult = (await chain) as unknown as {
      data: AppointmentAggregateRow[] | null;
      error: { message: string } | null;
    };
    appointmentRows = apptResult.data ?? [];
  } catch {
    appointmentRows = [];
  }

  const now = new Date().toISOString();
  const aggregates = new Map<
    string,
    { last_visit_at: string | null; next_appointment_at: string | null; total_visits: number }
  >();
  for (const row of appointmentRows) {
    const acc =
      aggregates.get(row.patient_id) ?? {
        last_visit_at: null,
        next_appointment_at: null,
        total_visits: 0,
      };
    acc.total_visits++;
    if (row.status === 'completed') {
      if (!acc.last_visit_at || row.scheduled_at > acc.last_visit_at) {
        acc.last_visit_at = row.scheduled_at;
      }
    }
    if (row.scheduled_at > now && row.status !== 'cancelled') {
      if (!acc.next_appointment_at || row.scheduled_at < acc.next_appointment_at) {
        acc.next_appointment_at = row.scheduled_at;
      }
    }
    aggregates.set(row.patient_id, acc);
  }

  const summaries: PatientSummary[] = profileRows.map((row) => {
    const agg = aggregates.get(row.id) ?? {
      last_visit_at: null,
      next_appointment_at: null,
      total_visits: 0,
    };
    return {
      id: row.id,
      full_name: row.full_name,
      national_id: row.national_id,
      phone: row.phone,
      date_of_birth: row.date_of_birth,
      avatar_url: row.avatar_url,
      last_visit_at: agg.last_visit_at,
      next_appointment_at: agg.next_appointment_at,
      total_visits: agg.total_visits,
    };
  });

  return { data: summaries, error: null };
}

// ---------------------------------------------------------------------------
// getPatientFullById
// ---------------------------------------------------------------------------

interface ProfileFullRow {
  id: string;
  full_name: string;
  email: string | null;
  national_id: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  city: string | null;
  state: string | null;
  nationality: string | null;
  avatar_url: string | null;
  patient_details: PatientDetailsRow | null;
}

/**
 * Returns a single patient by `id`, joined with `patient_details`. Used by
 * `/dashboard/pacientes/[patientId]` and any drill-down view.
 *
 * Distinguishes three terminal states:
 * - Success → `{ data: PatientFull, error: null }`.
 * - Not found → `{ data: null, error: { code: 'not_found', ... } }`.
 *   PostgREST returns `{ data: null, error: null }` on maybeSingle miss;
 *   we translate to an explicit not-found envelope so the UI can render
 *   a 404-style state instead of swallowing.
 * - Backend error → `{ data: null, error: { code: 'rls_violation' | ..., ... } }`.
 */
export async function getPatientFullById(
  client: PatientsSupabaseClient,
  patientId: string,
): Promise<ServiceResult<PatientFull>> {
  try {
    const builder = client.from('profiles') as unknown as {
      select: (cols: string) => unknown;
    };
    const chain = builder.select(
      'id, full_name, email, national_id, phone, date_of_birth, gender, city, state, nationality, avatar_url, patient_details(profile_id, grupo_sanguineo, alergias, enfermedades_cronicas, medicamentos_actuales, notas_medicas, peso_kg, altura_cm)',
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const eqChain = chain.eq('id', patientId) as unknown as {
      maybeSingle: () => Promise<{
        data: ProfileFullRow | null;
        error: { message: string } | null;
      }>;
    };
    const result = await eqChain.maybeSingle();

    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }
    if (!result.data) {
      return {
        data: null,
        error: { code: 'not_found', message: 'No encontramos al paciente solicitado.' },
      };
    }

    // patient_details may come back as an array (when join cardinality is
    // 1-to-many in PostgREST) or as a single object — normalize.
    const rawDetails = (result.data as unknown as { patient_details: unknown }).patient_details;
    let details: PatientDetailsRow | null;
    if (Array.isArray(rawDetails)) {
      details = rawDetails.length > 0 ? (rawDetails[0] as PatientDetailsRow) : null;
    } else if (rawDetails && typeof rawDetails === 'object') {
      details = rawDetails as PatientDetailsRow;
    } else {
      details = null;
    }

    const full: PatientFull = {
      id: result.data.id,
      full_name: result.data.full_name,
      email: result.data.email,
      national_id: result.data.national_id,
      phone: result.data.phone,
      date_of_birth: result.data.date_of_birth,
      gender: result.data.gender,
      city: result.data.city,
      state: result.data.state,
      nationality: result.data.nationality,
      avatar_url: result.data.avatar_url,
      patient_details: details,
    };
    return { data: full, error: null };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}
