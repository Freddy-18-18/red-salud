/**
 * @file supabase-deps.ts
 * @description Wires the pure resolver to a real Supabase client.
 *
 * Builds the `ResolverDeps` contract expected by `resolveDoctorModules` from
 * a Supabase server client (typed as `SupabaseLike` to avoid generics noise
 * and to keep this module easy to test with a stub).
 *
 * The pure resolver in `resolver.ts` is unaware of Supabase; this is the
 * boundary that knows the table names and column shapes.
 */

import { isModuleRegistered } from '@/components/modules/module-registry';

import type { DoctorProfileSlice, ResolverDeps } from './resolver';
import type {
  CapabilityModuleRow,
  CapabilitySource,
  DoctorModulePreferenceRow,
  PlanTier,
} from './types';
import type { PostgradoMappingRow } from './normalize-postgrado';

interface QueryBuilder<T> {
  select(cols: string): QueryBuilder<T>;
  eq(col: string, value: unknown): QueryBuilder<T>;
  or(filter: string): QueryBuilder<T>;
  maybeSingle(): Promise<{ data: T | null; error: unknown }>;
}

interface ListBuilder<T> {
  select(cols: string): {
    or?(filter: string): Promise<{ data: T[] | null; error: unknown }>;
    eq?(col: string, value: unknown): Promise<{ data: T[] | null; error: unknown }>;
    then?: never;
  } & Promise<{ data: T[] | null; error: unknown }>;
}

export interface SupabaseLike {
  from(table: string): {
    select: (cols: string) => unknown;
  };
}

interface DoctorProfileRow {
  sacs_verified: boolean | null;
  sacs_data: { data?: { postgrados?: Array<{ postgrado?: string }> } } | null;
  certifications: string[] | null;
  specialty: { slug: string | null } | null;
  /**
   * Joined from the `profiles` table — owns the SACS verification timestamp.
   * Surface as a join because `doctor_profiles.sacs_verified` and
   * `profiles.sacs_verified_at` are split between tables in the current
   * schema (see onboarding-wizard). The resolver consumes the timestamp to
   * compute `attention.sacsExpired`.
   */
  profile?:
    | { sacs_verified_at: string | null }
    | { sacs_verified_at: string | null }[]
    | null;
}

type Supabase = {
  // Loose typing — we only use the runtime shape, not generics.
  from(table: string): any;
};

const POSTGRADO_TABLE = 'sacs_postgrado_mapping';
const CAPABILITY_TABLE = 'capability_modules';
const PREFERENCES_TABLE = 'doctor_module_preferences';
const DOCTOR_PROFILES_TABLE = 'doctor_profiles';

function extractPostgrados(
  sacsData: DoctorProfileRow['sacs_data'],
): string[] {
  const list = sacsData?.data?.postgrados ?? [];
  return list
    .map((p) => (typeof p.postgrado === 'string' ? p.postgrado : ''))
    .filter((s) => s.length > 0);
}

function buildOrFilter(sources: CapabilitySource[]): string {
  return sources
    .map((s) => `and(source_type.eq.${s.type},source_value.eq.${s.value})`)
    .join(',');
}

export function buildSupabaseResolverDeps(
  supabase: Supabase,
  defaultPlan: PlanTier = 'starter',
): ResolverDeps {
  return {
    async fetchProfile(doctorId): Promise<DoctorProfileSlice | null> {
      const { data, error } = await supabase
        .from(DOCTOR_PROFILES_TABLE)
        .select(`
          sacs_verified,
          sacs_data,
          certifications,
          specialty:specialties(slug),
          profile:profiles!doctor_details_profile_id_fkey(sacs_verified_at)
        `)
        .eq('profile_id', doctorId)
        .maybeSingle();

      if (error || !data) return null;
      const row = data as DoctorProfileRow;
      const specialty = Array.isArray(row.specialty) ? row.specialty[0] : row.specialty;
      const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;

      return {
        specialty_slug: specialty?.slug ?? null,
        sacs_verified: row.sacs_verified ?? false,
        sacs_verified_at: profile?.sacs_verified_at ?? null,
        postgrados_raw: extractPostgrados(row.sacs_data),
        plan: defaultPlan,
        certs: row.certifications ?? [],
      };
    },

    async fetchPostgradoMapping(): Promise<PostgradoMappingRow[]> {
      const { data, error } = await supabase
        .from(POSTGRADO_TABLE)
        .select('sacs_name_pattern, postgrado_slug, confidence');
      if (error || !data) return [];
      return data as PostgradoMappingRow[];
    },

    async fetchCapabilityModules(
      sources: CapabilitySource[],
    ): Promise<CapabilityModuleRow[]> {
      if (sources.length === 0) return [];
      const orFilter = buildOrFilter(sources);
      const { data, error } = await supabase
        .from(CAPABILITY_TABLE)
        .select('*')
        .or(orFilter);
      if (error || !data) return [];
      return data as CapabilityModuleRow[];
    },

    async fetchPreferences(doctorId): Promise<DoctorModulePreferenceRow[]> {
      const { data, error } = await supabase
        .from(PREFERENCES_TABLE)
        .select('*')
        .eq('doctor_id', doctorId);
      if (error || !data) return [];
      return data as DoctorModulePreferenceRow[];
    },

    isModuleRegistered,

    logger: (msg) => {
      // Server-side log only. In prod, route to structured logging.
      // eslint-disable-next-line no-console
      console.warn(msg);
    },
  };
}
