/**
 * @file lib/sedes/service.ts
 * @description CRUD service for the medico practice-locations (sedes) feature.
 *
 * All mutations are RLS-enforced server-side: the authenticated session must
 * match `doctor_id`. The browser client is used for owner-scoped operations;
 * server components can swap to the server client.
 *
 * Deletion guard
 * --------------
 * Sedes referenced by `appointments.practice_location_id` MUST NOT be deleted
 * without the operator reassigning those appointments first. Phase 3 ships
 * with `appointments.practice_location_id` absent (the FK is a Phase 4+
 * concern), so the guard performs a defensive count and tolerates the column
 * being missing (Postgres error 42703 = undefined_column). When the count is
 * positive, the service throws `Error('SEDE_HAS_APPOINTMENTS:<n>')`; callers
 * destructure that prefix to render an actionable message.
 *
 * Individual doctor practice ONLY — no clinic / multi-org concepts.
 */

import { supabase } from '@/lib/supabase/client';

import type {
  CreateSedeInput,
  DoctorPracticeLocation,
  UpdateSedeInput,
} from './types';
import { SEDE_HAS_APPOINTMENTS_PREFIX } from './types';

const TABLE = 'doctor_practice_locations';
const APPOINTMENTS_TABLE = 'appointments';
const SCHEDULE_TABLE = 'weekly_schedule_template';

/**
 * Columns we select for every read so the rich wizard surface (map, phones,
 * notes) gets its data without a second round-trip. Keep in sync with the
 * post-enrichment migration columns.
 */
const ALL_COLUMNS =
  'id,doctor_id,name,address,city,state,postal_code,phone,latitude,longitude,notes,amenities,arrival_instructions,is_primary,active,created_at,updated_at';

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Returns the active sedes for a given doctor, ordered with the primary sede
 * first and then by creation date ascending. RLS guarantees the caller can
 * only see rows where `doctor_id = auth.uid()`.
 */
export async function listSedes(
  doctorId: string,
): Promise<DoctorPracticeLocation[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(ALL_COLUMNS)
    .eq('doctor_id', doctorId)
    .eq('active', true)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as DoctorPracticeLocation[];
}

/**
 * Returns a single sede by id. RLS still pins ownership, so a foreign
 * `id` resolves to `null` for the caller instead of leaking the row.
 */
export async function getSede(
  id: string,
): Promise<DoctorPracticeLocation | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(ALL_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as DoctorPracticeLocation | null;
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a sede owned by the supplied doctor. The DB trigger
 * `dpl_single_primary` demotes any existing primary sede automatically when
 * `is_primary=true` is set.
 */
export async function createSede(
  doctorId: string,
  input: CreateSedeInput,
): Promise<DoctorPracticeLocation> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ doctor_id: doctorId, ...input })
    .select(ALL_COLUMNS)
    .single();

  if (error) throw error;
  return data as DoctorPracticeLocation;
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Partial update by id. The RLS UPDATE policy enforces that the caller owns
 * the row (both USING + WITH CHECK). Pass `active: false` for a soft-delete.
 */
export async function updateSede(
  id: string,
  input: UpdateSedeInput,
): Promise<DoctorPracticeLocation> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select(ALL_COLUMNS)
    .single();

  if (error) throw error;
  return data as DoctorPracticeLocation;
}

// ---------------------------------------------------------------------------
// Delete (with appointments guard)
// ---------------------------------------------------------------------------

/**
 * Hard-deletes a sede. Blocks the delete when the sede is referenced by one
 * or more appointments (count > 0). When the `practice_location_id` column on
 * appointments does not exist yet, the guard treats that as 0 references and
 * proceeds — Phase 3 ships before the FK is added, so this is the expected
 * shape.
 *
 * Throws `Error('SEDE_HAS_APPOINTMENTS:<n>')` when the guard fires; the UI
 * pattern-matches the prefix to render the actionable message.
 */
export async function deleteSede(id: string): Promise<void> {
  const { count, error: countError } = await supabase
    .from(APPOINTMENTS_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('practice_location_id', id);

  // PG 42703 = undefined_column. The FK column doesn't exist yet — that's a
  // Phase 4 concern. Anything else is a real error and propagates.
  if (countError && countError.code !== '42703') {
    throw countError;
  }

  if ((count ?? 0) > 0) {
    throw new Error(`${SEDE_HAS_APPOINTMENTS_PREFIX}:${count}`);
  }

  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Primary promotion
// ---------------------------------------------------------------------------

/**
 * Promotes the supplied sede to primary. The DB trigger demotes any other
 * primary row for the same doctor atomically.
 */
export async function setPrimarySede(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ is_primary: true })
    .eq('id', id);

  if (error) throw error;
}
