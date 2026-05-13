# Design: Doctor Capability Engine (Fase 2)

## Technical Approach

Replace static `NAV_GROUPS` with a server-side resolver computing a doctor's accessible modules from SACS data + per-doctor preferences. Data lives in two new tables; resolution is one TS function `resolveDoctorModules(supabase, doctorId)` invoked in `app/dashboard/layout.tsx` and threaded as `navGroups` prop to `DashboardShell`.

## Architecture Decisions

### Decision: `capability_modules` table with `source_type` discriminator

**Choice**: Single table with columns `source_type` (`always-on|specialty|postgrado|cert|plan`), `source_value` (text), `module_key`, `display_group`, `display_order`, `min_verification`, `min_plan`. Composite unique `(source_type, source_value, module_key)`.

**Alternatives considered**: Separate tables per source type (4 tables); hardcoded TS matrix.

**Rationale**: Single discriminated table makes the UNION query trivial (`WHERE (source_type, source_value) IN (...)`), supports new source types via row insert (not schema change), and centralizes admin/CRUD. Cost: less type-safety at SQL level — accepted because resolver enforces shape in TS.

### Decision: New `MedicoModule` shape, not rich `ModuleDefinition`

**Choice**: New shape `{key, label, icon, route, displayGroup, displayOrder, minVerification, minPlan, badge?, pinned?}` in `apps/medico/web/src/lib/capabilities/types.ts`.

**Alternatives considered**: Reuse `packages/types/src/module.ts:ModuleDefinition` (502 LOC, RBAC + RuntimeCapability); reuse current `SpecialtyModule`.

**Rationale**: `ModuleDefinition` overkill for MVP; `SpecialtyModule` carries wrong mental model (one specialty → many modules). Migrate later when RBAC enforcement lands.

### Decision: Server-side resolution, no client fetch for first paint

**Choice**: Resolver runs in `app/dashboard/layout.tsx` (Server Component), result is a prop. No client `useQuery` for first paint.

**Alternatives considered**: Client-side hook with React Query; hybrid (server first-paint + client refetch).

**Rationale**: First-paint zero-flicker matters. Hybrid reserved for Fase 3 if live refetch on preference change becomes a felt need.

### Decision: Cache key `(doctorId, sacs_hash, prefs_version)` via `unstable_cache`

**Choice**: Next.js `unstable_cache`, 5min TTL. `sacs_hash` = SHA256 of `sacs_data` jsonb; `prefs_version` = `MAX(updated_at)` from `doctor_module_preferences`. Bust via `revalidateTag(\`caps:\${doctorId}\`)` on preference write.

**Rationale**: Tag-based invalidation lets us bust cache without knowing the hash; hash inclusion ensures SACS re-verify auto-busts even without explicit revalidateTag.

## Data Flow

```
Browser GET /dashboard
   │
   ▼
app/dashboard/layout.tsx (Server Component)
   ├──→ supabase.auth.getUser()
   ├──→ supabase.from('doctor_profiles').select(...).join(specialties, profiles)
   ├──→ resolveDoctorModules(supabase, doctorId)
   │       │
   │       ├──→ unstable_cache key=(doctorId, sacs_hash, prefs_version)
   │       │       HIT  → return ResolverResult
   │       │       MISS → continue
   │       ├──→ buildCapabilitySources(profile, sacs_data) → CapabilitySource[]
   │       ├──→ normalizePostgrados(sources, sacs_postgrado_mapping)
   │       ├──→ select * FROM capability_modules WHERE (source_type,source_value) IN sources
   │       ├──→ select * FROM doctor_module_preferences WHERE doctor_id=...
   │       ├──→ applyPreferences(modules, prefs)  // disable/reorder/pin
   │       ├──→ groupAndSort(modules) by displayGroup → NavGroupData[]
   │       └──→ return { navGroups, pinnedModules, verificationPending, ... }
   │
   └──→ <DashboardShell doctorName navGroups pinnedModules />
            ├──→ <DesktopSidebar groups={navGroups} />
            ├──→ <MobileSidebarSheet groups={navGroups} />
            └──→ pages consume pinnedModules
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/<ts>_capability_modules.sql` | Create | Table + indexes + RLS + seed (~60 rows) |
| `supabase/migrations/<ts>_sacs_postgrado_mapping.sql` | Create | Table + indexes + RLS + seed (~50 rows) |
| `apps/medico/web/src/lib/capabilities/types.ts` | Create | `MedicoModule`, `CapabilitySource`, `ResolverResult` |
| `apps/medico/web/src/lib/capabilities/resolver.ts` | Create | `resolveDoctorModules()` + helpers |
| `apps/medico/web/src/lib/capabilities/normalize-postgrado.ts` | Create | SACS string → slug |
| `apps/medico/web/src/lib/capabilities/cache.ts` | Create | `unstable_cache` wrapper + tag helpers |
| `apps/medico/web/src/lib/capabilities/__tests__/*.test.ts` | Create | TDD: resolver, normalize, cache, grouping |
| `apps/medico/web/src/app/dashboard/layout.tsx` | Modify | Call resolver, thread props |
| `apps/medico/web/src/components/shell/nav-data.ts` | Modify | `STATIC_NAV_GROUPS` fallback + dynamic merge helpers |
| `apps/medico/web/src/components/shell/dashboard-shell.tsx` | Modify | Accept `navGroups` + `pinnedModules` props |
| `packages/core/src/clinical-data/index.ts` | Create | Barrel exporter |
| `packages/core/src/clinical-data/<slug>.ts` | Create (×N) | Extracted constants per specialty |
| `apps/medico/web/src/lib/specialties/configs/overrides/*.ts` | Delete | 132 files post-extraction |
| `apps/medico/web/src/components/onboarding/registration-steps.tsx` | Modify | Fix `doctor_module_preferences` insert (real columns) |

## Interfaces

```ts
// lib/capabilities/types.ts
export type CapabilitySourceType = 'always-on' | 'specialty' | 'postgrado' | 'cert' | 'plan';
export interface CapabilitySource { type: CapabilitySourceType; value: string; }

export interface MedicoModule {
  key: string;
  label: string;
  icon: string;                 // lucide-react name
  route: string;
  displayGroup: 'clinica' | 'analisis' | 'comunicacion' | 'crecimiento' | 'configuracion';
  displayOrder: number;
  minVerification: 'email' | 'profile' | 'sacs' | 'license' | 'board_certified';
  minPlan: 'starter' | 'professional' | 'enterprise';
  badge?: string;
  pinned?: boolean;
}

export interface ResolverResult {
  navGroups: NavGroupData[];
  pinnedModules: MedicoModule[];
  verificationPending: boolean;
  capabilities: { specialty: string|null; postgrados: string[]; certs: string[]; plan: string };
  resolvedAt: string;
}
```

```sql
CREATE TABLE capability_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('always-on','specialty','postgrado','cert','plan')),
  source_value text NOT NULL,
  module_key text NOT NULL,
  display_group text NOT NULL CHECK (display_group IN ('clinica','analisis','comunicacion','crecimiento','configuracion')),
  display_order int NOT NULL DEFAULT 100,
  min_verification text NOT NULL DEFAULT 'sacs',
  min_plan text NOT NULL DEFAULT 'starter',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_value, module_key)
);
CREATE INDEX idx_cap_mod_source ON capability_modules (source_type, source_value);
-- RLS: public SELECT (catalog), service_role-only writes

CREATE TABLE sacs_postgrado_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sacs_name_pattern text NOT NULL UNIQUE,
  postgrado_slug text NOT NULL,
  confidence text NOT NULL CHECK (confidence IN ('exact','keyword','fuzzy')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_postgrado_pattern ON sacs_postgrado_mapping (sacs_name_pattern);
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit (resolver) | UNION dedup, preference override, manual-mode flag, postgrado normalize, grouping | Vitest + Supabase mock factory |
| Unit (cache) | Hit within TTL, miss after TTL, tag invalidation | Vitest mocking `unstable_cache` |
| Integration | `dashboard/layout.tsx` end-to-end with test schema | Vitest + local Supabase |
| Component | Sidebar renders 3-of-5 groups, empty group hidden, 'Próximamente' badge | Vitest + @testing-library/react |
| E2E | Sidebar crawl per test doctor (5 doctors × all hrefs == 200) | Playwright MCP |

Tests land first per strict TDD; red → green → refactor per requirement R1-R8.

## Migration / Rollout

Ordered, each commit independently revertible:

1. **Extract clinical data** → `packages/core/src/clinical-data/<slug>.ts` + snapshot tests. No override deletion yet.
2. **New tables migration** + seed (~110 rows).
3. **Resolver lib** with full TDD coverage.
4. **Shell wiring** behind `FEATURE_CAPABILITY_ENGINE` env flag, default OFF.
5. **Flip flag** + Playwright validation across 5 test doctors.
6. **Override deletion**: 132 files in one commit (data already extracted).
7. **Onboarding fix**: separate commit using real `doctor_module_preferences` columns.

Rollback: flip flag (step 5), `git revert` commit (1-7), `DROP TABLE` (step 2).

## Open Questions

- [ ] `sacs_postgrado_mapping` seed size: 50 is a guess. Seed from real distinct postgrados once ≥20 verified doctors registered. MVP: ~15 from test data + 35 common.
- [ ] `module_key` FK constraint vs TS-only `isModuleRegistered()` check. Current: TS-only. Revisit when admin module manager UI lands.
- [ ] Where does `verificationPending` banner render? Recommend `DashboardShell` (persistent, dismissible per session). Confirm with UX before tasks phase.
