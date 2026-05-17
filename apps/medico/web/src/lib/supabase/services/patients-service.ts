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
  InvitedPatientCreateInput,
  InvitedPatientCreateResult,
  OfflinePatientCreateInput,
  PatientFull,
  PatientSummary,
  PatientDetailsRow,
  RosterFilters,
  RosterKPIs,
  LastVisitWindow,
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
 *
 * Phase 3 added optional `rpc()` so the create-patient RPCs can be invoked
 * without widening every caller. The real Supabase client's `rpc()` returns
 * a `PostgrestFilterBuilder` (thenable, not a plain Promise) — we type the
 * return as `unknown` and `await` it to coerce. Stubs that don't need RPCs
 * may omit the field — the consumer guards with an optional-chain.
 */
export interface PatientsSupabaseClient {
  from: (table: string) => unknown;
  rpc?: (fn: string, args: Record<string, unknown>) => unknown;
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

export function toServiceError(raw: unknown): ServiceError {
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

// ---------------------------------------------------------------------------
// Phase 3: createOfflinePatient / createInvitedPatient
// ---------------------------------------------------------------------------

/**
 * Maps Postgres `RAISE EXCEPTION ... USING ERRCODE = '...'` codes to friendly
 * voseo messages for the create-patient flows. Keeps the UI free of raw SQL
 * jargon. Falls back to `toServiceError()` for any code we didn't anticipate.
 */
function mapCreatePatientError(
  raw: { message?: string; code?: string } | null | undefined,
  duplicateMessage: string,
): ServiceError {
  if (!raw) return { code: 'unknown', message: 'No pudimos completar la operación.' };
  const code = raw.code ?? '';
  const message = raw.message ?? '';
  if (code === '23502') {
    return { code: 'unknown', message: 'Faltan campos requeridos.' };
  }
  if (code === '23505') {
    return { code: 'unknown', message: duplicateMessage };
  }
  if (code === '23514') {
    return { code: 'unknown', message: 'Email inválido.' };
  }
  if (code === '42501' || message.toLowerCase().includes('forbidden')) {
    return {
      code: 'rls_violation',
      message: 'Solo los médicos pueden registrar pacientes.',
    };
  }
  if (code === '28000' || message.toLowerCase().includes('unauthorized')) {
    return { code: 'unauthorized', message: 'Sesión expirada. Iniciá sesión nuevamente.' };
  }
  return toServiceError(raw);
}

/**
 * Calls the `create_offline_patient(payload jsonb) RETURNS uuid` RPC, which
 * atomically creates `profiles` + `patient_details` + `doctor_patients` for a
 * patient who hasn't signed up yet. The server generates a placeholder email
 * — the doctor never enters it.
 *
 * Error mapping:
 * - `23502` (not_null_violation) → "Faltan campos requeridos"
 * - `23505` (unique_violation, e.g. national_id conflict) → cedula message
 * - `42501` (insufficient_privilege) → rls_violation message
 *
 * The RPC also returns the existing `patient_id` when called twice with the
 * same cedula for the same doctor (idempotent re-link). The UI MAY treat
 * that as "ya lo registraste" — same return shape, no error.
 */
export async function createOfflinePatient(
  client: PatientsSupabaseClient,
  input: OfflinePatientCreateInput,
): Promise<ServiceResult<{ patient_id: string }>> {
  if (!client.rpc) {
    return {
      data: null,
      error: { code: 'unknown', message: 'El cliente Supabase no soporta RPC.' },
    };
  }
  try {
    const result = (await client.rpc('create_offline_patient', { payload: input })) as {
      data: unknown;
      error: { message?: string; code?: string } | null;
    };
    if (result.error) {
      return {
        data: null,
        error: mapCreatePatientError(
          result.error,
          'Ya existe un paciente con esa cédula.',
        ),
      };
    }
    const patientId = typeof result.data === 'string' ? result.data : '';
    if (!patientId) {
      return {
        data: null,
        error: { code: 'unknown', message: 'No pudimos confirmar la creación del paciente.' },
      };
    }
    return { data: { patient_id: patientId }, error: null };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}

/**
 * Calls the `create_invited_patient(payload jsonb) RETURNS jsonb` RPC, which
 * does everything `create_offline_patient` does PLUS inserts a row in
 * `patient_invitations` and returns the unique invite token. The token is
 * URL-safe and embedded into the invitation link the doctor shares.
 *
 * Error mapping mirrors offline, plus:
 * - `23514` (check_violation) → "Email inválido" (RPC validates regex)
 * - `23505` on email → "Email o cédula ya en uso"
 */
export async function createInvitedPatient(
  client: PatientsSupabaseClient,
  input: InvitedPatientCreateInput,
): Promise<ServiceResult<InvitedPatientCreateResult>> {
  if (!client.rpc) {
    return {
      data: null,
      error: { code: 'unknown', message: 'El cliente Supabase no soporta RPC.' },
    };
  }
  try {
    const result = (await client.rpc('create_invited_patient', { payload: input })) as {
      data: unknown;
      error: { message?: string; code?: string } | null;
    };
    if (result.error) {
      return {
        data: null,
        error: mapCreatePatientError(result.error, 'Email o cédula ya en uso.'),
      };
    }
    const raw = result.data as unknown;
    if (!raw || typeof raw !== 'object') {
      return {
        data: null,
        error: { code: 'unknown', message: 'No pudimos confirmar la invitación.' },
      };
    }
    const payload = raw as { patient_id?: unknown; invite_token?: unknown };
    const patientId = typeof payload.patient_id === 'string' ? payload.patient_id : '';
    const inviteToken = typeof payload.invite_token === 'string' ? payload.invite_token : '';
    if (!patientId || !inviteToken) {
      return {
        data: null,
        error: { code: 'unknown', message: 'La respuesta del servidor está incompleta.' },
      };
    }
    return {
      data: { patient_id: patientId, invite_token: inviteToken },
      error: null,
    };
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }
}

// ---------------------------------------------------------------------------
// Phase 3: listPatientsPaginated (cursor pagination + filters)
// ---------------------------------------------------------------------------

/**
 * Inputs accepted by the paginated roster query. The cursor is the
 * `last_consultation_date` of the last row from the previous page — passing
 * it back asks PostgREST for rows with a strictly smaller value. NULL
 * `last_consultation_date` rows are returned at the tail (`NULLS LAST`) so
 * cursor-based traversal stays monotonic.
 */
export interface ListPatientsPaginatedOptions {
  doctorId: string;
  /** ISO timestamp of the last consultation of the previous page, or null for the first page */
  cursor?: string | null;
  /** Page size — defaults to 25 */
  limit?: number;
  /** Subset of RosterFilters — anything omitted uses the field's default */
  filters?: Partial<RosterFilters>;
}

export interface PatientsPaginatedPage {
  rows: PatientSummary[];
  /** ISO timestamp to pass back as `cursor` on the next call; null when no more pages */
  nextCursor: string | null;
}

interface DoctorPatientPageRow {
  patient_id: string;
  status: string | null;
  last_consultation_date: string | null;
  total_consultations: number | null;
  created_at: string | null;
}

interface ProfilePageRow {
  id: string;
  full_name: string;
  national_id: string | null;
  phone: string | null;
  date_of_birth: string | null;
  avatar_url: string | null;
}

interface PatientDetailsPageRow {
  profile_id: string;
  enfermedades_cronicas: string[] | null;
}

/**
 * Translates a `LastVisitWindow` bucket into an inclusive/exclusive bound
 * pair for `last_consultation_date`. The `never` bucket is handled by the
 * caller via an `is(.. , null)` filter instead.
 *
 * Returns:
 * - `{ minIso, maxIso }` — pass `minIso` to `gte`, `maxIso` to `lt`.
 *   `null` on either end means "no bound".
 */
function lastVisitWindowToRange(
  window: LastVisitWindow,
): { minIso: string | null; maxIso: string | null } {
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  const oneYear = 365 * day;
  switch (window) {
    case 'lt_7d':
      return { minIso: new Date(now - 7 * day).toISOString(), maxIso: null };
    case 'lt_30d':
      return { minIso: new Date(now - 30 * day).toISOString(), maxIso: null };
    case 'lt_90d':
      return { minIso: new Date(now - 90 * day).toISOString(), maxIso: null };
    case 'lt_1y':
      return { minIso: new Date(now - oneYear).toISOString(), maxIso: null };
    case 'gte_1y':
      return { minIso: null, maxIso: new Date(now - oneYear).toISOString() };
    case 'never':
      // Handled by the caller (we add `.is('last_consultation_date', null)`)
      return { minIso: null, maxIso: null };
    default:
      return { minIso: null, maxIso: null };
  }
}

/**
 * Converts an age range (years) into a `date_of_birth` range. Ages are
 * inclusive on both ends (a patient turning 40 today counts in `age_max=40`).
 * Lower age ⇒ later DOB.
 */
function ageRangeToDob(
  ageMin: number | null,
  ageMax: number | null,
): { minDob: string | null; maxDob: string | null } {
  const today = new Date();
  let minDob: string | null = null;
  let maxDob: string | null = null;
  if (ageMax != null) {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - ageMax - 1);
    d.setDate(d.getDate() + 1); // exclusive of next year — keep inclusive of age boundary
    minDob = d.toISOString().slice(0, 10);
  }
  if (ageMin != null) {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - ageMin);
    maxDob = d.toISOString().slice(0, 10);
  }
  return { minDob, maxDob };
}

/**
 * Paginated, filtered patient roster for the redesigned roster page (T-3-08).
 *
 * Implementation pragmatics:
 * - Step 1 fetches the doctor's `doctor_patients` page (LIMIT + cursor ON
 *   `last_consultation_date` DESC NULLS LAST, then `created_at` DESC). All
 *   numeric/window filters that the link table can answer are applied here.
 * - Step 2 hydrates the profile + clinical chips via a parallel `profiles`
 *   + `patient_details` fetch keyed by the page's `patient_id` set.
 * - Step 3 applies post-filters that need joined data (`search` against
 *   `full_name`/`national_id`, `chronic_tags` overlap, `age_min`/`age_max`).
 * - `nextCursor` is set when `rows.length === limit` — naive but accurate;
 *   the consumer (`useInfiniteQuery`) stops fetching when null.
 *
 * Skipped filters with TODO comments:
 * - `sede_id`: requires joining `appointments.practice_location_id`. The
 *   current implementation drops the filter rather than failing — to be
 *   wired in a follow-up batch when the appointments aggregate is added.
 * - `has_followup` / `alerts_only`: require expensive sub-queries; the UI
 *   chips are present but inert in this batch.
 *
 * Aggregate fields:
 * - `last_visit_at = last_consultation_date` (single source of truth from the
 *   trigger maintained by `upsert_doctor_patient_link()`).
 * - `total_visits = total_consultations` (same).
 * - `next_appointment_at` is set to `null` for now — the future detail-page
 *   query already returns it, and Phase 3 deliberately keeps the roster
 *   query cheap. The roster card simply shows `—`.
 */
export async function listPatientsPaginated(
  client: PatientsSupabaseClient,
  opts: ListPatientsPaginatedOptions,
): Promise<ServiceResult<PatientsPaginatedPage>> {
  const limit = opts.limit ?? 25;
  const filters = opts.filters ?? {};

  // Step 1 — doctor_patients page with link-table filters applied.
  let linkRows: DoctorPatientPageRow[] = [];
  try {
    const builder = client.from('doctor_patients') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select(
      'patient_id, status, last_consultation_date, total_consultations, created_at',
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    let chain = selectChain.eq('doctor_id', opts.doctorId) as unknown as {
      eq: (col: string, val: string) => unknown;
      gte: (col: string, val: string) => unknown;
      lt: (col: string, val: string) => unknown;
      is: (col: string, val: null) => unknown;
      order: (col: string, opt: { ascending: boolean; nullsFirst?: boolean }) => unknown;
      limit: (n: number) => unknown;
    };
    chain = chain.eq('status', 'active') as typeof chain;

    if (filters.last_visit_window) {
      if (filters.last_visit_window === 'never') {
        chain = chain.is('last_consultation_date', null) as typeof chain;
      } else {
        const range = lastVisitWindowToRange(filters.last_visit_window);
        if (range.minIso) chain = chain.gte('last_consultation_date', range.minIso) as typeof chain;
        if (range.maxIso) chain = chain.lt('last_consultation_date', range.maxIso) as typeof chain;
      }
    }
    if (opts.cursor) {
      // Cursor pagination: ask for rows STRICTLY older than the cursor.
      // Naive but correct given the descending sort on the same column.
      chain = chain.lt('last_consultation_date', opts.cursor) as typeof chain;
    }

    // TODO(P3-batch2): sede_id filter requires joining appointments.
    //   When wired, add an `in('patient_id', sedePatientIds)` here.

    const ordered = chain.order('last_consultation_date', {
      ascending: false,
      nullsFirst: false,
    }) as unknown as {
      order: (col: string, opt: { ascending: boolean }) => unknown;
    };
    const orderedSecondary = ordered.order('created_at', { ascending: false }) as unknown as {
      limit: (n: number) => Promise<{
        data: DoctorPatientPageRow[] | null;
        error: { message: string } | null;
      }>;
    };
    const result = await orderedSecondary.limit(limit);
    if (result.error) {
      return { data: null, error: toServiceError(result.error) };
    }
    linkRows = result.data ?? [];
  } catch (caught) {
    return { data: null, error: toServiceError(caught) };
  }

  if (linkRows.length === 0) {
    return { data: { rows: [], nextCursor: null }, error: null };
  }

  const patientIds = linkRows.map((r) => r.patient_id);

  // Step 2 — parallel hydrate.
  const [profileRows, detailRows] = await Promise.all([
    fetchProfilesForIds(client, patientIds, filters.search ?? ''),
    fetchPatientDetailsForIds(client, patientIds),
  ]);

  const profilesById = new Map<string, ProfilePageRow>();
  for (const p of profileRows) profilesById.set(p.id, p);

  const chronicByPatient = new Map<string, string[]>();
  for (const d of detailRows) {
    chronicByPatient.set(d.profile_id, d.enfermedades_cronicas ?? []);
  }

  const { minDob, maxDob } = ageRangeToDob(
    filters.age_min ?? null,
    filters.age_max ?? null,
  );
  const wantedChronic = (filters.chronic_tags ?? []).map((t) => t.toUpperCase());
  const searchTerm = (filters.search ?? '').trim().toLowerCase();

  // Step 3 — assemble + apply post-filters (search/chronic/age).
  const rows: PatientSummary[] = [];
  for (const link of linkRows) {
    const profile = profilesById.get(link.patient_id);
    if (!profile) continue; // dropped by the search ilike, skip silently.

    if (minDob && (profile.date_of_birth ?? '') < minDob) continue;
    if (maxDob && (profile.date_of_birth ?? '') > maxDob) continue;

    if (wantedChronic.length > 0) {
      const patientTags = (chronicByPatient.get(link.patient_id) ?? []).map((t) =>
        String(t).toUpperCase(),
      );
      const overlaps = wantedChronic.some((t) => patientTags.includes(t));
      if (!overlaps) continue;
    }

    // Server-side ilike already filters profiles; this extra guard catches
    // the edge case where the profile fetch was unfiltered (e.g. empty search).
    if (searchTerm) {
      const haystack = `${profile.full_name} ${profile.national_id ?? ''}`.toLowerCase();
      if (!haystack.includes(searchTerm)) continue;
    }

    rows.push({
      id: profile.id,
      full_name: profile.full_name,
      national_id: profile.national_id,
      phone: profile.phone,
      date_of_birth: profile.date_of_birth,
      avatar_url: profile.avatar_url,
      last_visit_at: link.last_consultation_date,
      next_appointment_at: null,
      total_visits: link.total_consultations ?? 0,
    });
  }

  // TODO(P3-batch2): has_followup and alerts_only — apply once the
  // computed-alerts pipeline runs against batched rows.

  // nextCursor: last row's last_visit_at when the page filled the limit.
  // If post-filtering trimmed rows, we still return rows.length === limit
  // ⇒ we can paginate further from the LAST link row processed.
  const last = linkRows[linkRows.length - 1];
  const nextCursor =
    linkRows.length === limit && last.last_consultation_date
      ? last.last_consultation_date
      : null;

  return { data: { rows, nextCursor }, error: null };
}

async function fetchProfilesForIds(
  client: PatientsSupabaseClient,
  ids: string[],
  search: string,
): Promise<ProfilePageRow[]> {
  if (ids.length === 0) return [];
  try {
    const builder = client.from('profiles') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select(
      'id, full_name, national_id, phone, date_of_birth, avatar_url',
    ) as unknown as {
      in: (col: string, vals: string[]) => unknown;
    };
    let chain = selectChain.in('id', ids) as unknown as {
      or: (filter: string) => unknown;
      then: <U>(resolve: (v: {
        data: ProfilePageRow[] | null;
        error: { message: string } | null;
      }) => U) => Promise<U>;
    };
    if (search && search.trim().length > 0) {
      const pattern = `%${search.trim()}%`;
      // PostgREST `or` syntax: `or=(full_name.ilike.%x%,national_id.ilike.%x%)`
      chain = chain.or(`full_name.ilike.${pattern},national_id.ilike.${pattern}`) as typeof chain;
    }
    const result = (await chain) as unknown as {
      data: ProfilePageRow[] | null;
      error: { message: string } | null;
    };
    if (result.error) return [];
    return result.data ?? [];
  } catch {
    return [];
  }
}

async function fetchPatientDetailsForIds(
  client: PatientsSupabaseClient,
  ids: string[],
): Promise<PatientDetailsPageRow[]> {
  if (ids.length === 0) return [];
  try {
    const builder = client.from('patient_details') as unknown as {
      select: (cols: string) => unknown;
    };
    const selectChain = builder.select('profile_id, enfermedades_cronicas') as unknown as {
      in: (col: string, vals: string[]) => Promise<{
        data: PatientDetailsPageRow[] | null;
        error: { message: string } | null;
      }>;
    };
    const result = await selectChain.in('profile_id', ids);
    if (result.error) return [];
    return result.data ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Phase 3: getRosterKPIs (defensive parallel counts)
// ---------------------------------------------------------------------------

/**
 * Computes the 6-metric KPI strip for the roster header. Each count runs as
 * a separate Supabase query in parallel — failures degrade individually to
 * `0` so the strip never disappears (per spec: KPIs are informative).
 *
 * `new_this_month` uses America/Caracas wall-clock for the "first day of the
 * month" boundary so a doctor in Caracas sees the same number whether they
 * load the page at 03:00 UTC (still yesterday locally) or 12:00 UTC. The
 * server stores `first_consultation_date` as `timestamptz` so the comparison
 * is timezone-safe.
 */
export async function getRosterKPIs(
  client: PatientsSupabaseClient,
  doctorId: string,
): Promise<ServiceResult<RosterKPIs>> {
  const firstDayOfMonth = firstDayOfMonthCaracasIso(new Date());
  const nowIso = new Date().toISOString();

  const safeCount = async (
    runner: () => Promise<{ count: number | null; error: { message: string } | null }>,
  ): Promise<number> => {
    try {
      const result = await runner();
      if (result.error || result.count == null) return 0;
      return result.count;
    } catch {
      return 0;
    }
  };

  const totalActiveP = safeCount(async () => {
    const builder = client.from('doctor_patients') as unknown as {
      select: (cols: string, opt: { count: 'exact'; head: boolean }) => unknown;
    };
    const chain = builder.select('patient_id', {
      count: 'exact',
      head: true,
    }) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const a = chain.eq('doctor_id', doctorId) as unknown as {
      eq: (col: string, val: string) => Promise<{
        count: number | null;
        error: { message: string } | null;
      }>;
    };
    return a.eq('status', 'active');
  });

  const newThisMonthP = safeCount(async () => {
    const builder = client.from('doctor_patients') as unknown as {
      select: (cols: string, opt: { count: 'exact'; head: boolean }) => unknown;
    };
    const chain = builder.select('patient_id', {
      count: 'exact',
      head: true,
    }) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const a = chain.eq('doctor_id', doctorId) as unknown as {
      gte: (col: string, val: string) => Promise<{
        count: number | null;
        error: { message: string } | null;
      }>;
    };
    return a.gte('first_consultation_date', firstDayOfMonth);
  });

  // chronic_count — count of doctor_patients whose patient_details has at
  // least one chronic condition. We approximate via a join filter on
  // patient_details.enfermedades_cronicas IS NOT NULL AND array_length>0.
  // PostgREST doesn't expose array_length(); we filter `neq('enfermedades_cronicas','{}')`
  // which works because Postgres compares arrays element-wise.
  const chronicCountP = safeCount(async () => {
    const builder = client.from('doctor_patients') as unknown as {
      select: (cols: string, opt: { count: 'exact'; head: boolean }) => unknown;
    };
    const chain = builder.select(
      'patient_id, patient_details!inner(enfermedades_cronicas)',
      { count: 'exact', head: true },
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const a = chain.eq('doctor_id', doctorId) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const b = a.eq('status', 'active') as unknown as {
      neq: (col: string, val: string) => Promise<{
        count: number | null;
        error: { message: string } | null;
      }>;
    };
    return b.neq('patient_details.enfermedades_cronicas', '{}');
  });

  const followupsOverdueP = safeCount(async () => {
    const builder = client.from('appointments') as unknown as {
      select: (cols: string, opt: { count: 'exact'; head: boolean }) => unknown;
    };
    const chain = builder.select('id', {
      count: 'exact',
      head: true,
    }) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const a = chain.eq('doctor_id', doctorId) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const b = a.eq('status', 'scheduled') as unknown as {
      lt: (col: string, val: string) => Promise<{
        count: number | null;
        error: { message: string } | null;
      }>;
    };
    return b.lt('scheduled_at', nowIso);
  });

  const expiredRxP = safeCount(async () => {
    const builder = client.from('prescriptions') as unknown as {
      select: (cols: string, opt: { count: 'exact'; head: boolean }) => unknown;
    };
    const chain = builder.select('id', {
      count: 'exact',
      head: true,
    }) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const a = chain.eq('doctor_id', doctorId) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const b = a.eq('status', 'activa') as unknown as {
      is: (col: string, val: null) => unknown;
    };
    const c = b.is('deleted_at', null) as unknown as {
      lt: (col: string, val: string) => Promise<{
        count: number | null;
        error: { message: string } | null;
      }>;
    };
    return c.lt('expires_at', nowIso);
  });

  // abnormal_labs_pending — count of lab_result_values.es_anormal=true tied
  // to a lab_order owned by this doctor, where patient_notified is still
  // false on the parent result. We use a deeply-nested PostgREST filter via
  // an inner join. If the column doesn't exist on a project, the query
  // degrades to 0 via the safeCount catch.
  const abnormalLabsP = safeCount(async () => {
    const builder = client.from('lab_result_values') as unknown as {
      select: (cols: string, opt: { count: 'exact'; head: boolean }) => unknown;
    };
    const chain = builder.select(
      'id, lab_results!inner(patient_notified, lab_orders!inner(doctor_id))',
      { count: 'exact', head: true },
    ) as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const a = chain.eq('es_anormal', 'true') as unknown as {
      eq: (col: string, val: string) => unknown;
    };
    const b = a.eq('lab_results.patient_notified', 'false') as unknown as {
      eq: (col: string, val: string) => Promise<{
        count: number | null;
        error: { message: string } | null;
      }>;
    };
    return b.eq('lab_results.lab_orders.doctor_id', doctorId);
  });

  const [
    totalActive,
    newThisMonth,
    chronicCount,
    followupsOverdue,
    expiredRxCount,
    abnormalLabsPending,
  ] = await Promise.all([
    totalActiveP,
    newThisMonthP,
    chronicCountP,
    followupsOverdueP,
    expiredRxP,
    abnormalLabsP,
  ]);

  return {
    data: {
      total_active: totalActive,
      new_this_month: newThisMonth,
      chronic_count: chronicCount,
      followups_overdue: followupsOverdue,
      expired_rx_count: expiredRxCount,
      abnormal_labs_pending: abnormalLabsPending,
    },
    error: null,
  };
}

/**
 * Returns the ISO timestamp for the first instant of the current calendar
 * month in America/Caracas (UTC-4). Used as the lower bound for
 * `new_this_month` so the boundary aligns with the doctor's local clock.
 *
 * Implementation: build a date at 00:00 local-month-1 then shift by the
 * fixed -04:00 offset. Venezuela does not observe DST, so the offset is
 * stable year-round.
 */
function firstDayOfMonthCaracasIso(now: Date): string {
  // Wall-clock in Caracas right now.
  const caracas = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const year = caracas.getUTCFullYear();
  const month = caracas.getUTCMonth();
  // First day at 00:00 local = (utc + 4h) of day 1 → 04:00 UTC.
  const firstLocal = new Date(Date.UTC(year, month, 1, 4, 0, 0));
  return firstLocal.toISOString();
}
