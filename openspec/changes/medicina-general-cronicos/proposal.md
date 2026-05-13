# Proposal: Gestión de Crónicos (medicina-general-cronicos)

## Intent

First clinical module REAL for Medicina General. Currently `chronic-mgmt` resolves through `capability_modules` but the React component is unregistered — sidebar shows `Próximamente`, click navigates to a placeholder. This change ships the working module: doctor identifies chronic patients, sees longitudinal metric timelines + range-based alerts, creates and tracks goals, and (behind flag) auto-extracts vitals from consultas into the chronic timeline. Covers 7 chronic conditions (HTA, DM2/DM1, Dislipidemia, Obesidad, ERC, EPOC, Tiroides).

## Scope

### In Scope
- Seed expansion (Task 0): 10 new `health_metric_types` rows (HbA1c, microalbuminuria, creatinina, BUN, TFG, FEV1, FEV1/FVC, FEV1 %predicho, TSH, T4 libre).
- New module folder `apps/medico/web/src/components/modules/chronic-mgmt/` — single-page `<ChronicMgmtModule>` with left panel (chronic patient list) + right panel (3 tabs: Métricas, Metas, Alertas).
- Companion hook `use-chronic-data.ts` orchestrating existing `packages/core/src/hooks/use-health-metrics.ts`.
- Module registry registration for `chronic-mgmt` (kills the `Próximamente` badge).
- Chronic patient identification: union of `patient_details.enfermedades_cronicas[]` canonical tags AND patients with active `health_goals`.
- Canonical tag typeahead in chronic-mgmt module AND in patient detail view (symmetry decision).
- Goal CRUD (medico-created; paciente read-only): create / edit `valor_objetivo` / pause / complete.
- Computed range alerts: severity tiers mild/moderate/severe from `metric_type.rango_minimo/maximo`, overridden per-patient by active goal `valor_objetivo`.
- Auto-extract behind feature flag `FEATURE_CHRONIC_VISIT_AUTOEXTRACT`: consulta save handler creates `health_metrics` rows from vital_signs with `medical_record_id` + `appointment_id` populated.
- Strict TDD: ≥90% coverage on the companion hook + module-level tests for list/detail/tabs.

### Out of Scope
- AI/ML risk prediction (Framingham, ASCVD) — delegated to future clinical-calculators module.
- SMS/push reminder integration (paciente-side schedules already work).
- Telemedicine inside the module.
- Detailed medication adherence CRUD (single % chip only, deeper view deferred).
- New tables / schema changes beyond seed expansion.
- Cross-doctor goal sharing.
- Mobile-bottom-nav entry (still hardcoded; tackled in a later shell change).

## Capabilities

### New Capabilities
- `chronic-disease-management`: doctor-facing longitudinal management of chronic patients — identification, metric timeline, goals, range-based alerts, and visit-to-timeline linking.

### Modified Capabilities
- None. Auto-extract is opt-in via feature flag; consulta behavior unchanged when flag is off.

## Approach

Reuse existing `health_metrics` / `health_goals` / `patient_details` schema and the 9 hooks in `packages/core/src/hooks/use-health-metrics.ts`. Build a single-page React module that follows the existing `<ModuleWrapper>` pattern (mirror `pediatrics/growth-curves-module.tsx`). Alerts are pure functions computed on-read. Visit-linking is a thin handler addition inside `app/dashboard/consulta/page.tsx` gated by `process.env.FEATURE_CHRONIC_VISIT_AUTOEXTRACT === 'true'`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/<ts>_chronic_metric_types_seed.sql` | Create | +10 rows in `health_metric_types` |
| `apps/medico/web/src/components/modules/chronic-mgmt/` | Create | Module folder: `chronic-mgmt-module.tsx`, `use-chronic-data.ts`, sub-components, tests |
| `apps/medico/web/src/components/modules/module-registry.ts` | Modify | Register lazy `chronic-mgmt` entry |
| `apps/medico/web/src/components/patients/patient-detail.tsx` | Modify | Add canonical-tag typeahead for `enfermedades_cronicas[]` |
| `apps/medico/web/src/app/dashboard/consulta/page.tsx` | Modify | Auto-extract gated by `FEATURE_CHRONIC_VISIT_AUTOEXTRACT` |
| `apps/medico/web/src/lib/chronic/` | Create | Pure helpers: canonical tags constant, range/alert evaluator, vitals → metrics mapper |
| `apps/medico/web/CLAUDE.md` | Modify | Document the feature flag + module |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Unnormalized `enfermedades_cronicas[]` text drift | Medium | Typeahead with canonical list on write; soft-match (uppercase + strip accents) on read |
| Auto-extract miswrites metrics on partial vitals | Medium | Feature flag default OFF; integration test asserts both empty-vitals and full-vitals paths |
| 7-condition scope underestimates effort | Medium | Apply phases gated; ship HTA+DM2+Dislipidemia+Obesidad first, then ERC+EPOC+Tiroides in same change but separate phases |
| Paciente/web renders medico goal edits unexpectedly | Low | RLS audit + paciente release note |
| Adding 10 metric_types breaks paciente metric selector | Low | Paciente uses the same query; new rows just appear as options — visually verified |

## Rollback Plan

1. Seed migration is additive (INSERT only). Roll back via `DELETE FROM health_metric_types WHERE name IN (...)` — script saved alongside migration.
2. Module registry rollback: revert the one-line lazy import; sidebar shows `Próximamente` again.
3. Auto-extract rollback: flip `FEATURE_CHRONIC_VISIT_AUTOEXTRACT=false`. No code revert needed.
4. Patient-detail typeahead: pure additive UI; revert that commit independently.

## Dependencies

- `medico-capability-engine` (DONE) — sidebar entry, module-catalog mapping, R8 badge wiring.
- `packages/core/src/hooks/use-health-metrics.ts` (exists) — 9 hooks reused unchanged.
- `health_metric_types`, `health_metrics`, `health_goals`, `measurement_reminders`, `patient_details` tables (all exist, RLS in place).

## Success Criteria

- [ ] medico2 (Med General) clicks `Gestión de Crónicos` → working module loads (no placeholder, no badge).
- [ ] Adding `HTA` tag to a paciente via typeahead surfaces them in the chronic-mgmt list.
- [ ] Creating a goal for `Presión Arterial Sistólica` with `valor_objetivo=130` shows in paciente/web read-only.
- [ ] Recording a measurement of `180 mmHg` shows `severe` alert (>25% above 140).
- [ ] With flag ON, saving a consulta with BP=180/100 creates 2 `health_metrics` rows with `medical_record_id` set.
- [ ] With flag OFF, saving the same consulta creates 0 `health_metrics` rows.
- [ ] Coverage ≥90% on `use-chronic-data.ts` and `lib/chronic/` pure helpers.
- [ ] All 7 condition tags resolve via typeahead in both surfaces (chronic-mgmt + patient detail).
