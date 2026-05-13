/**
 * @file resolver.ts
 * @description Orchestrates the doctor capability resolution flow.
 *
 * Spec: openspec/changes/medico-capability-engine/specs/doctor-capabilities/spec.md
 *
 * Dependencies are injected (functions, not the Supabase client itself) so the
 * resolver stays pure and trivially testable. The caller in
 * `app/dashboard/layout.tsx` wires the deps with real Supabase queries.
 */

import { applyPreferences } from './apply-preferences';
import { buildCapabilitySources } from './build-sources';
import { groupAndSort } from './group-and-sort';
import { lookupModule } from './module-catalog';
import { normalizePostgrados, type PostgradoMappingRow } from './normalize-postgrado';
import type {
  CapabilityModuleRow,
  CapabilitySource,
  DoctorModulePreferenceRow,
  MedicoModule,
  PlanTier,
  ResolverResult,
} from './types';

export interface DoctorProfileSlice {
  specialty_slug: string | null;
  sacs_verified: boolean;
  /**
   * ISO timestamp of the most recent SACS verification, or `null` when the
   * doctor has never been verified. Used to compute `attention.sacsExpired`
   * (renewal cycle: 1 year). Added by medico-shell-supabase-style Phase 2.
   */
  sacs_verified_at?: string | null;
  postgrados_raw: string[];
  plan: PlanTier;
  certs: string[];
}

export interface ResolverDeps {
  fetchProfile(doctorId: string): Promise<DoctorProfileSlice | null>;
  fetchPostgradoMapping(): Promise<PostgradoMappingRow[]>;
  fetchCapabilityModules(sources: CapabilitySource[]): Promise<CapabilityModuleRow[]>;
  fetchPreferences(doctorId: string): Promise<DoctorModulePreferenceRow[]>;
  /**
   * Spec R8: when a module_key resolves but no React component is registered,
   * the sidebar entry should display a "Próximamente" badge. Caller injects
   * the predicate (typically `isModuleRegistered` from module-registry.ts).
   */
  isModuleRegistered?: (moduleKey: string) => boolean;
  logger?: (msg: string) => void;
}

const DEGRADED_RESULT: ResolverResult = {
  navGroups: [],
  pinnedModules: [],
  verificationPending: true,
  attention: { verificationPending: true, sacsExpired: false },
  capabilities: { specialty: null, postgrados: [], certs: [], plan: 'starter' },
  resolvedAt: '',
};

/** Renewal cycle for SACS verification — 1 year. */
const SACS_RENEWAL_WINDOW_MS = 1000 * 60 * 60 * 24 * 365;

/**
 * Computes whether a SACS verification timestamp is past the renewal window.
 * Returns false when the timestamp is null/undefined (never verified — surfaced
 * by `verificationPending` instead).
 */
function computeSacsExpired(sacsVerifiedAt: string | null | undefined): boolean {
  if (!sacsVerifiedAt) return false;
  const verifiedAt = Date.parse(sacsVerifiedAt);
  if (Number.isNaN(verifiedAt)) return false;
  return Date.now() - verifiedAt > SACS_RENEWAL_WINDOW_MS;
}

const PLACEHOLDER_BADGE = 'Próximamente';
const LAZY_MODULE_ROUTE_PREFIX = '/dashboard/modulos/';

/**
 * Only lazy-loaded modules (route under `/dashboard/modulos/[key]`) can be
 * "unregistered" — always-on items like Inicio/Agenda/Pacientes have their
 * own dedicated pages in `/dashboard/*` and never live in `module-registry.ts`.
 */
function shouldBadgeWhenUnregistered(route: string): boolean {
  return route.startsWith(LAZY_MODULE_ROUTE_PREFIX);
}

function rowsToModules(
  rows: CapabilityModuleRow[],
  isModuleRegistered?: (moduleKey: string) => boolean,
): MedicoModule[] {
  const seenKeys = new Set<string>();
  const out: MedicoModule[] = [];
  for (const r of rows) {
    if (seenKeys.has(r.module_key)) continue;
    seenKeys.add(r.module_key);

    const meta = lookupModule(r.module_key);
    const isLazyRoute = shouldBadgeWhenUnregistered(meta.route);
    const unregistered =
      isLazyRoute && isModuleRegistered
        ? !isModuleRegistered(r.module_key)
        : false;
    out.push({
      key: r.module_key,
      label: meta.label,
      icon: meta.icon,
      route: meta.route,
      displayGroup: r.display_group,
      displayOrder: r.display_order,
      minVerification: r.min_verification,
      minPlan: r.min_plan,
      ...(unregistered ? { badge: PLACEHOLDER_BADGE } : {}),
    });
  }
  return out;
}

export async function resolveDoctorModules(
  deps: ResolverDeps,
  doctorId: string,
): Promise<ResolverResult> {
  const profile = await deps.fetchProfile(doctorId);
  if (!profile) {
    return { ...DEGRADED_RESULT, resolvedAt: new Date().toISOString() };
  }

  const mapping = await deps.fetchPostgradoMapping();
  const normalizedPostgrados = normalizePostgrados(
    profile.postgrados_raw,
    mapping,
    deps.logger,
  );

  const sources = buildCapabilitySources({
    specialty_slug: profile.specialty_slug,
    sacs_verified: profile.sacs_verified,
    postgrados_normalized: normalizedPostgrados,
    certs: profile.certs,
    plan: profile.plan,
  });

  const rows = await deps.fetchCapabilityModules(sources);
  const modules = rowsToModules(rows, deps.isModuleRegistered);

  const preferences = await deps.fetchPreferences(doctorId);
  const finalModules = applyPreferences(modules, preferences);

  const pinnedModules = finalModules.filter((m) => m.pinned);
  const navGroups = groupAndSort(finalModules);

  const verificationPending = !profile.sacs_verified;
  const sacsExpired = computeSacsExpired(profile.sacs_verified_at ?? null);

  return {
    navGroups,
    pinnedModules,
    verificationPending,
    attention: { verificationPending, sacsExpired },
    capabilities: {
      specialty: profile.specialty_slug,
      postgrados: normalizedPostgrados.map((p) => p.slug),
      certs: profile.certs,
      plan: profile.plan,
    },
    resolvedAt: new Date().toISOString(),
  };
}
