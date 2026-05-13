# Tasks: Doctor Capability Engine (Fase 2)

> Strict TDD: RED → GREEN → REFACTOR per requirement.

## Phase 1: Extract clinical data

- [ ] 1.1 Inventory data-shape exports across `lib/specialties/configs/overrides/*.ts` → `openspec/changes/medico-capability-engine/clinical-extract-inventory.md`.
- [ ] 1.2 RED: `packages/core/src/clinical-data/__tests__/medicina-general.test.ts` snapshot of `PREVENTIVE_SCREENING_PROTOCOLS`, `REFERRAL_CRITERIA`, `ADULT_VACCINATION_SCHEDULE`.
- [ ] 1.3 GREEN: copy constants verbatim → `packages/core/src/clinical-data/medicina-general.ts`.
- [ ] 1.4 Repeat 1.2+1.3 for pediatria, cardiologia, ginecologia, traumatologia, infectologia, urologia (confirm with 1.1).
- [ ] 1.5 Barrel `packages/core/src/clinical-data/index.ts` + re-export from `packages/core/src/index.ts`.
- [ ] 1.6 `pnpm --filter @red-salud/medico-web typecheck` passes.

## Phase 2: New tables migration

- [x] 2.1 Inspect duplicate `trg_auto_resolve_doctor_specialty` on `doctor_profiles`; drop dup if confirmed. — Result: NOT a duplicate; 2 valid triggers (BEFORE INSERT + BEFORE UPDATE) for the same function. No action needed.
- [x] 2.2 Migration `<ts>_capability_modules.sql`: CREATE TABLE + CHECK + UNIQUE + index + RLS.
- [x] 2.3 Seed `capability_modules` 54 rows: always-on (9) + specialty (35 across gen-1, gen-4, inf-1, uro-1, car-1, ped-1) + postgrado (10).
- [x] 2.4 Migration `<ts>_sacs_postgrado_mapping.sql`: CREATE TABLE + UNIQUE + index + RLS.
- [x] 2.5 Seed `sacs_postgrado_mapping` 55 rows: 5 from test data + 50 common Venezuelan postgrados.
- [x] 2.6 Fix typo: `UPDATE specialties SET category='gineco' WHERE id='gin-2'`. — Verified post-fix.
- [x] 2.7 Apply migrations via MCP `apply_migration` to `hwckkfiirldgundbcjsp`. — 3 migrations applied successfully.

## Phase 3: Resolver lib (TDD)

- [x] 3.1 Create `lib/capabilities/types.ts` (CapabilitySource, MedicoModule, ResolverResult, ResolvedNavGroup, ResolvedNavItem). Also added DISPLAY_GROUP_LABELS + DISPLAY_GROUP_ORDER consts.
- [x] 3.2 RED `normalize-postgrado.test.ts` → 7 scenarios (R4-A through R4-G).
- [x] 3.3 GREEN `normalize-postgrado.ts` — 7/7 passing.
- [x] 3.4 RED `build-sources.test.ts` → 7 scenarios (R1-A through R1-F + R3 manual mode).
- [x] 3.5 GREEN `build-sources.ts` (extracted to its own file) — 7/7 passing.
- [x] 3.6 RED `apply-preferences.test.ts` → 7 scenarios (R2-A through R2-G).
- [x] 3.7 GREEN `apply-preferences.ts` — 7/7 passing.
- [x] 3.8 RED `group-and-sort.test.ts` → 7 scenarios (R5-A through R5-G).
- [x] 3.9 GREEN `group-and-sort.ts` returns `ResolvedNavGroup[]` (server-safe, icon as string) — 7/7 passing.
- [x] 3.10 RED `resolver.test.ts` → 8 scenarios (R1+R2+R3+R4+R5 end-to-end + degraded profile).
- [x] 3.11 GREEN `resolver.ts` (deps-injected, plus `module-catalog.ts` for key→{label,icon,route}) — 8/8 passing.
- [x] 3.12 RED `cache.test.ts` → 8 scenarios (R7-A through R7-E + key derivation).
- [x] 3.13 GREEN `cache.ts` with `computeCacheKey/Tag`, `createInMemoryStore`, `withCache` (production wires to `unstable_cache`+`revalidateTag` at Phase 4) — 8/8 passing.
- [x] 3.14 REFACTOR: typecheck clean, generics annotated in cache tests, 44/44 tests passing.

## Phase 4: Shell wiring (behind flag)

- [x] 4.1 `FEATURE_CAPABILITY_ENGINE` documented in `apps/medico/web/CLAUDE.md` and read in `app/dashboard/layout.tsx`. Default false. (`.env.example` was protected by permissions; flag still works via env.)
- [x] 4.2 `components/shell/nav-data.ts`: added `STATIC_NAV_GROUPS` alias for `NAV_GROUPS`. Added new `components/shell/nav-mapper.ts` with `ICON_REGISTRY`, `resolveIcon()`, `resolvedToNavGroups()`, `mergeWithStaticFallback()`.
- [x] 4.3 `components/shell/dashboard-shell.tsx`: accepts `navGroups?: ResolvedNavGroup[]`, `pinnedModules?: MedicoModule[]`, `verificationPending?: boolean`. Calls `mergeWithStaticFallback()` once and threads to both desktop + mobile sidebars.
- [x] 4.4 RED `nav-mapper.test.ts` (9) + `dashboard-shell.test.tsx` Phase 2 scenarios (5 new).
- [x] 4.5 GREEN: `DesktopSidebar` + `MobileSidebarSheet` accept optional `groups?: NavGroupData[]` prop with NAV_GROUPS fallback. Verification banner renders when `verificationPending=true`.
- [x] 4.6 `app/dashboard/layout.tsx`: when `FEATURE_CAPABILITY_ENGINE=true`, builds `ResolverDeps` via `buildSupabaseResolverDeps()`, calls `resolveDoctorModules(deps, user.id)`, threads result to shell. Resolver failures are caught and logged; shell silently falls back to static.
- [x] 4.7 Integration test `supabase-deps.test.ts` (10) verifies fetchProfile/Mapping/Modules/Preferences shapes + OR-filter construction + error fallbacks.

## Phase 5: Flag flip + Playwright validation

- [x] 5.1 `FEATURE_CAPABILITY_ENGINE=true` via bash prefix (`.env.local` was permission-protected); dev server up on port 3002.
- [x] 5.2 Playwright with medico2 (Marianella, Med General sin postgrados) → 5-group sidebar Clínica(11)/Análisis(3)/Comunicación(1)/Crecimiento(1)/Configuración(2); NO banner; specialty:medicina-general items present. Screenshot `medico2-capability-sidebar.png`.
- [x] 5.3 Playwright with medico4 (Karim, Infectología + INFECTOLOGÍA PEDIÁTRICA + PEDIATRÍA Y PUERICULTURA) → UNION specialty:infectologia + postgrado dedup (pediatrics-growth + pediatrics-vaccination once each). Screenshot `medico4-union-postgrados.png`.
- [x] 5.4 Playwright with medico1 (Dr. Test Manual, sacs_verified=false) → banner ámbar "Tu verificación SACS está pendiente" + specialty items still visible (R3 trust manual). Screenshot `medico1-manual-banner.png`.
- [x] 5.5 Spec R8 graceful degrade: `/dashboard/modulos/chronic-mgmt` shows placeholder "Módulo no disponible" without crash. Screenshot `medico1-module-graceful-degrade.png`.
- [ ] 5.6 First-paint p95 measurement — DEFERRED to post Phase 4.8 (needs cache wiring + baseline+treatment runs via DevTools).

## Phase 6: Override deletion (one commit)

- [ ] 6.1 Confirm Phase 1 snapshot tests green for every extracted constant.
- [ ] 6.2 Delete 132 files in `lib/specialties/configs/overrides/*.ts`.
- [ ] 6.3 Update `config-factory.ts` if it references deleted overrides.
- [ ] 6.4 Delete dormant tests `lib/specialties/__tests__/*`.
- [ ] 6.5 `typecheck && test` green.

## Phase 7: Onboarding fix + cleanup

- [x] 7.1 RED: `build-module-preferences.test.ts` — 6 scenarios (one row per module, empty array, dedup, is_enabled default, no extra columns, onConflict key).
- [x] 7.2 GREEN: extracted helper `buildModulePreferenceRows()` + `MODULE_PREFS_CONFLICT_KEY` in `components/onboarding/build-module-preferences.ts`. Updated `registration-steps.tsx:350-362` to call helper with real schema (one row per module, composite unique `doctor_id,module_id` for upsert).
- [ ] 7.3 Manual smoke: new test doctor end-to-end → row in `doctor_module_preferences`. Pending Playwright re-run.
- [ ] 7.4 Delete `lib/specialty-experience/engine.ts` (older duplicate) — deferred to standalone cleanup task.
- [x] 7.5 `apps/medico/web/CLAUDE.md` already updated in Phase 4 (Capability Engine section).
- [x] 7.6 `typecheck && test` green: 147/147 tests, typecheck clean.

## Phase 8: Spec R8 badge polish

- [x] 8.1 RED: 2 new scenarios in `resolver.test.ts` (badge set when unregistered, badge omitted when isModuleRegistered absent).
- [x] 8.2 GREEN: `ResolverDeps.isModuleRegistered?` optional, `rowsToModules()` sets `badge='Próximamente'` on unregistered keys.
- [x] 8.3 Wire `isModuleRegistered` in `supabase-deps.ts` from `@/components/modules/module-registry`.
- [x] 8.4 Typecheck clean, 141/141 tests passing (was 139/139).

## Success criteria

- [x] SC1: medico2 sees specialty-base + always-on (validated live, Phase 5.2).
- [x] SC2: medico4 sees UNION across sources (validated live, Phase 5.3).
- [x] SC3: medico1 sees always-on + warning banner (validated live, Phase 5.4).
- [x] SC4: sidebar links navigate without crash (graceful degrade for unregistered modules, Phase 5.5). Full 200-status crawl deferred until Spec R8 badge polish.
- [x] SC5: resolver lib has 44/44 tests; component tests (shell + nav-mapper + supabase-deps) bring total to 73 new + 66 baseline = 139/139 passing.
- [ ] SC6: 132 overrides deleted (BLOCKED by Phase 1 workstream #17).
- [ ] SC7: first-paint p95 within 10ms of baseline (DEFERRED to Phase 4.8 cache wiring).
- [ ] SC8: `doctor_module_preferences` row written on onboarding (Phase 7).
