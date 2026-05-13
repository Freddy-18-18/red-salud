/**
 * @file types.ts
 * @description Type contracts for the doctor capability resolver (Fase 2).
 *
 * Read by:
 *   - lib/capabilities/resolver.ts (orchestrator)
 *   - lib/capabilities/normalize-postgrado.ts
 *   - lib/capabilities/cache.ts
 *   - app/dashboard/layout.tsx (props threaded to DashboardShell)
 *
 * Spec: openspec/changes/medico-capability-engine/specs/doctor-capabilities/spec.md
 * Design: openspec/changes/medico-capability-engine/design.md
 */

/**
 * Discriminator for a single capability source row in `capability_modules`.
 */
export type CapabilitySourceType =
  | 'always-on'
  | 'specialty'
  | 'postgrado'
  | 'cert'
  | 'plan';

/**
 * One capability source a doctor accumulates.
 *  - `always-on` → `value = '*'`
 *  - everything else → slug (e.g., `medicina-general`, `infectologia-pediatrica`)
 */
export interface CapabilitySource {
  type: CapabilitySourceType;
  value: string;
}

/**
 * Hardcoded display group the sidebar renders. Five major groups; empty groups
 * are omitted from the sidebar per spec R5.
 */
export type DisplayGroup =
  | 'clinica'
  | 'analisis'
  | 'comunicacion'
  | 'crecimiento'
  | 'configuracion';

/**
 * RFC 2119-graded verification threshold a module requires.
 */
export type VerificationLevel =
  | 'email'
  | 'profile'
  | 'sacs'
  | 'license'
  | 'board_certified';

/**
 * Plan tier gating (logged but not enforced yet — see proposal "Out of Scope").
 */
export type PlanTier = 'starter' | 'professional' | 'enterprise';

/**
 * A module that a doctor can access. Shape lives ENTIRELY in this app — no
 * rich `ModuleDefinition` coupling yet (see ADR in design.md).
 */
export interface MedicoModule {
  /** Unique module key matching `capability_modules.module_key` AND (when registered) `module-registry.ts`. */
  key: string;
  /** Human-readable label (Spanish, es-VE). */
  label: string;
  /** Lucide icon name (string) — resolved to component at render time. */
  icon: string;
  /** Absolute route under `/dashboard/*`. */
  route: string;
  displayGroup: DisplayGroup;
  /** Sort order within the group; lower wins. */
  displayOrder: number;
  minVerification: VerificationLevel;
  minPlan: PlanTier;
  /** Optional badge — e.g. `'Próximamente'` when no React component is registered. */
  badge?: string;
  /** Set by preference application when `pinned_to_dashboard = true`. */
  pinned?: boolean;
}

/**
 * Raw row shape from `capability_modules` (one entry in the matrix). Snake-case
 * because it mirrors the SQL column names verbatim.
 */
export interface CapabilityModuleRow {
  id: string;
  source_type: CapabilitySourceType;
  source_value: string;
  module_key: string;
  display_group: DisplayGroup;
  display_order: number;
  min_verification: VerificationLevel;
  min_plan: PlanTier;
}

/**
 * Per-doctor override row shape from `doctor_module_preferences`.
 */
export interface DoctorModulePreferenceRow {
  id: string;
  doctor_id: string;
  module_id: string;
  is_enabled: boolean;
  custom_order: number | null;
  custom_settings: Record<string, unknown> | null;
  pinned_to_dashboard: boolean;
}

/**
 * Server-safe nav item shape. Icon is the lucide-react name as a STRING — the
 * shell component resolves it to a `LucideIcon` at render time. This keeps the
 * resolver pure data, no React component imports.
 */
export interface ResolvedNavItem {
  key: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

/**
 * Server-safe nav group. Matches the shape `<DashboardShell>` consumes after
 * mapping icons.
 */
export interface ResolvedNavGroup {
  key: DisplayGroup;
  label: string;
  items: ResolvedNavItem[];
}

/**
 * Display labels for the 5 hardcoded major sidebar groups. Order here is the
 * render order on the sidebar (Clínica top, Configuración bottom).
 */
export const DISPLAY_GROUP_LABELS: Record<DisplayGroup, string> = {
  clinica: 'Clínica',
  analisis: 'Análisis',
  comunicacion: 'Comunicación',
  crecimiento: 'Crecimiento',
  configuracion: 'Configuración',
};

export const DISPLAY_GROUP_ORDER: readonly DisplayGroup[] = [
  'clinica',
  'analisis',
  'comunicacion',
  'crecimiento',
  'configuracion',
];

/**
 * Attention flags surfaced by the resolver to drive header/sidebar visual
 * affordances (Advisor red-dot, NavLink attention dot). Mirrors the
 * `doctor-capabilities` delta from medico-shell-supabase-style.
 */
export interface DoctorAttention {
  /**
   * True when `profile.sacs_verified === false` — doctor is in manual mode
   * and needs to complete SACS verification. Mirrored at the top level as
   * `ResolverResult.verificationPending` for backward compatibility.
   */
  verificationPending: boolean;
  /**
   * True when `profile.sacs_verified_at` is older than the renewal cycle
   * (currently hardcoded to 1 year). False when null or within window.
   */
  sacsExpired: boolean;
}

/**
 * Final shape returned by `resolveDoctorModules()`. Threaded as props from
 * `app/dashboard/layout.tsx` to `<DashboardShell>`.
 */
export interface ResolverResult {
  navGroups: ResolvedNavGroup[];
  pinnedModules: MedicoModule[];
  /**
   * Backward-compatible alias of `attention.verificationPending`. Existing
   * consumers (DashboardShell prop, dashboard banner) read this directly.
   * Kept in sync inside the resolver.
   */
  verificationPending: boolean;
  /**
   * Attention flags driving the new shell's Advisor red-dot and NavLink
   * attention dots. Added by medico-shell-supabase-style Phase 2.
   */
  attention: DoctorAttention;
  capabilities: {
    specialty: string | null;
    postgrados: string[];
    certs: string[];
    plan: PlanTier;
  };
  resolvedAt: string;
}
