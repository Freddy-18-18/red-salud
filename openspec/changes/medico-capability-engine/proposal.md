# Proposal: Doctor Capability Engine (Fase 2)

## Intent

Phase 1 (`medico-shell-sanvia`) shipped a static `NAV_GROUPS` in `apps/medico/web/src/components/shell/nav-data.ts` — every doctor sees identical chrome regardless of specialty or SACS postgrados. Meanwhile, 132 override files declare ~50+ phantom module keys pointing to non-existent `/dashboard/medico/<slug>/*` routes (all 404). Rich SACS data (specialty + postgrados[] + profesiones[]) is captured in `doctor_profiles.sacs_data` but unused for navigation. The empty `doctor_module_preferences` table was designed for per-doctor overrides; nothing writes to it correctly.

Replace static nav with a capability-driven resolver: SACS data → `capability_modules` matrix → grouped sidebar + dashboard quick-links, with per-doctor preference overrides on top.

## Scope

### In Scope
- New tables: `capability_modules` (source_type / source_value / module_key / display_group / min_verification / min_plan); `sacs_postgrado_mapping` (~50 seed rows).
- TS shape `MedicoModule` (key/label/icon/route/displayGroup/minVerification/minPlan) + resolver `resolveDoctorModules(doctorId)` in `apps/medico/web/src/lib/capabilities/`.
- Server-side resolution in `app/dashboard/layout.tsx`; thread `navGroups` as prop to `DashboardShell`.
- Replace `NAV_GROUPS` source while preserving 5 hardcoded major groups (Clínica · Análisis · Comunicación · Crecimiento · Configuración).
- Extract clinical constants (`PREVENTIVE_SCREENING_PROTOCOLS`, `REFERRAL_CRITERIA`, `ADULT_VACCINATION_SCHEDULE`, equivalents in other overrides) from `lib/specialties/configs/overrides/*.ts` to `packages/core/src/clinical-data/<specialty-slug>.ts`.
- Delete 132 override files post-extraction.
- Fix broken write to `doctor_module_preferences` in `components/onboarding/registration-steps.tsx:351-360` (wrong column names).
- Strict TDD: vitest tests for resolver, matrix queries, sidebar integration, capability-source union.

### Out of Scope
- `specialty-widgets.tsx` reescritura — separate change.
- `/dashboard/modulos/[moduleKey]` route refactor — keep current rendering.
- `module-registry.ts` reescritura — matrix references its keys; registry stays as lazy-loaded component lookup.
- `module_catalog` table (used by `apps/clinica/`, no touch).
- RBAC enforcement of `minVerification` / `minPlan` (columns logged, not enforced yet).
- Multi-office, offline_patients, AI suggestions, attention-model hybrid (longitudinal/walk-in) — deferred to future changes.
- Migration of `apps/clinica/web/` to the same matrix.

## Capabilities

### New Capabilities
- `doctor-capabilities`: SACS-derived module matrix + resolver + per-doctor preference overrides + sidebar/dashboard integration.

### Modified Capabilities
- None (no existing specs under `openspec/specs/`).

## Approach

**UNION-of-capabilities resolver.** Each doctor accumulates module access from multiple sources:

1. `always-on` baseline (any verified doctor).
2. `specialty` row (matched by `doctor_profiles.specialty_id`).
3. N × `postgrado` rows (matched against normalized strings from `sacs_data.data.postgrados[]`).
4. Optional `cert` and `plan` rows.

Resolver runs server-side in `app/dashboard/layout.tsx` on every dashboard render, threads the resolved `navGroups: NavGroupData[]` as props to `DashboardShell` (zero-flicker, no client fetch for first paint). `doctor_module_preferences` apply on top (disable / reorder / pin to dashboard). Cache via Next.js `unstable_cache` keyed by `(doctorId, sacs_hash)`, 5min TTL, invalidated on preference write or SACS re-verify.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/` | New | 2 migrations: `capability_modules` table + `sacs_postgrado_mapping` seed |
| `apps/medico/web/src/lib/capabilities/` | New | Resolver, MedicoModule types, postgrado normalizer |
| `apps/medico/web/src/app/dashboard/layout.tsx` | Modified | Server-side capability resolution + thread props |
| `apps/medico/web/src/components/shell/nav-data.ts` | Modified | Becomes consumer of resolver output, not static source |
| `apps/medico/web/src/lib/specialties/configs/overrides/*.ts` | Removed | 132 files deleted after clinical data extraction |
| `packages/core/src/clinical-data/` | New | Extracted clinical reference constants per specialty |
| `apps/medico/web/src/components/onboarding/registration-steps.tsx` | Modified | Fix broken `doctor_module_preferences` insert |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Lose clinical data when deleting overrides | High | Extract step lands BEFORE delete; vitest tests pin extracted constants; manual diff review |
| Phantom module_keys in matrix without React component | Medium | Resolver applies `isModuleRegistered()` graceful degrade; render placeholder card with "Próximamente" |
| Server-side DB latency per dashboard render | Medium | `unstable_cache` 5min TTL keyed by `sacs_hash`; invalidate on preference write |
| Duplicate `trg_auto_resolve_doctor_specialty` triggers cause double-resolve | Low | Inspect `information_schema.triggers` + drop dup BEFORE shipping new migration |
| Postgrado SACS strings miss normalization | Medium | Resolver falls back to specialty-base-only; log unmapped postgrados to `doctor_logs` for ops review |
| `category='gin\n\neco'` typo breaks GROUP BY | Low | 1-line fix in same migration |

## Rollback Plan

1. **Migrations are additive only** (CREATE TABLE, no schema changes to existing tables). To roll back DB: `DROP TABLE capability_modules CASCADE; DROP TABLE sacs_postgrado_mapping CASCADE;`.
2. **Shell change is reversible**: `nav-data.ts` retains a `STATIC_NAV_GROUPS` fallback constant; flipping a feature flag in `layout.tsx` switches sidebar back to static.
3. **Override deletion in a separate commit** — `git revert <commit>` restores all 132 files. Clinical-data extraction (commit-prior) is independent and remains.
4. **Onboarding fix isolated** — separate commit, separately revertible.

## Dependencies

- `sacs_verifications` schema (exists, currently empty — populated by SACS service on verify).
- `doctor_profiles.sacs_data` jsonb shape (validated via real SACS test data for 5 doctors: medico1-5).
- `packages/core` workspace package (exists, receives new `clinical-data/` subdirectory).
- No external service changes.

## Success Criteria

- [ ] `medico2` (Medicina General, sin postgrados) sees specialty-base + always-on modules in sidebar.
- [ ] `medico4` (Infectología + 2 postgrados pediátricos) sees specialty + postgrado add-on modules (UNION).
- [ ] `medico1` (manual mode, cédula not in SACS) sees always-on bundle + warning banner about pending verification.
- [ ] No phantom links: every sidebar href returns 200 (verified via Playwright crawl).
- [ ] Resolver test coverage ≥90%; dormant tests in `lib/specialties/__tests__/*` replaced with capability tests.
- [ ] 132 override files deleted, clinical reference data preserved in `packages/core/src/clinical-data/` and importable by any app.
- [ ] First-paint dashboard latency p95 within 10ms of current baseline (cache effective).
- [ ] `doctor_module_preferences` row written successfully during onboarding for at least one test doctor.
