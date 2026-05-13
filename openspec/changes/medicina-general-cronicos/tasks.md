# Tasks: Gestión de Crónicos (medicina-general-cronicos)

> Strict TDD: RED → GREEN → REFACTOR. Reqs R1-R9 from `specs/chronic-disease-management/spec.md`.

## Phase 0: Seed + pure helpers

- [x] 0.1 (R7) Migration `chronic_metric_types_seed` — 10 INSERTs applied via MCP. Post-count = **25 rows** verified.
- [x] 0.2 (R2) RED `canonical-tags.test.ts` — 27 scenarios (9 const, exact match, case-insensitive, legacy variants HTA/DM2/DM1/ERC/EPOC/Dislipidemia/Obesidad, empty/whitespace/unknown).
- [x] 0.3 (R2) GREEN `canonical-tags.ts` — `CHRONIC_TAGS` const + `softMatchTag()` with NFD normalize + LEGACY_MAP for 14 variants. **27/27 passing**.
- [x] 0.4 (R5) RED `alert-evaluator.test.ts` — 13 scenarios (in-range null, mild/moderate/severe above & below, goal override, zero-min edge).
- [x] 0.5 (R5) GREEN `alert-evaluator.ts` — `evaluateSeverity(value, range, goal?)` with 10%/25% thresholds. **13/13 passing**.
- [x] 0.6 (R6) RED `vitals-to-metrics.test.ts` — 7 scenarios (full 8-row, BP-only 2-row, partial 1-row, empty 0-row, missing lookup skip, zero-value, default measured_at).
- [x] 0.7 (R6) GREEN `vitals-to-metrics.ts` — `vitalsToMetrics()` mapping 8 vital fields → `HealthMetricInsertRow[]` with `medical_record_id` + `appointment_id`. **7/7 passing**.
- [x] 0.8 (R1) RED `patient-resolver.test.ts` — 10 scenarios (tag-only, goal-only, both, neither, soft-match legacy, dedupe, count active only, sort alpha, lastMeasurementAt pass-through).
- [x] 0.9 (R1) GREEN `patient-resolver.ts` — `resolveChronicList()` UNION + dedup + sort. **10/10 passing**.

## Phase A: Cardiovascular core (HTA + DM2 + DM1 + Dislipidemia + Obesidad)

- [x] A.1 RED `use-chronic-data.test.ts` — 7 scenarios (load, select, detail, goal override, createGoal refresh, updateStatus refresh, error capture).
- [x] A.2 GREEN `use-chronic-data.ts` deps-injected hook composing list + selection + detail + alerts + mutations.
- [x] A.3 RED `chronic-patient-list.test.tsx` — 5 scenarios (render names+tags, empty state, click selects, aria-current, goal count).
- [x] A.4 GREEN `chronic-patient-list.tsx`.
- [x] A.5 RED `chronic-patient-detail.test.tsx` — 6 scenarios (header, 3 tabs, default Métricas, tab switching, alert badge, loading).
- [x] A.6 GREEN `chronic-patient-detail.tsx` + `metricas-tab.tsx` (table) + `metas-tab.tsx` (CRUD with form + status transitions) + `alertas-tab.tsx` (severity sorted).
- [x] A.7-8 GREEN `chronic-mgmt-module.tsx` container with `supabase-deps.ts` production wiring (deps-injected).
- [x] A.9 (R9) Registered `chronic-mgmt` lazy import in `module-registry.ts`. **Live verified**: badge Próximamente gone for medico2.
- [x] A.9-bis (RLS fix) Applied migration `doctors_can_view_their_patients` creating SELECT policies for profiles, patient_details, health_metrics, health_goals (+ INSERT/UPDATE for health_goals) scoped to doctor's appointment patients. Critical for module to fetch any data.
- [x] A.9-tris (column name fix) `profiles.cedula` → `national_id` in supabase-deps query.
- [ ] A.10 (R6) DEFERRED to next session — modify `consulta/page.tsx` with auto-extract behind `FEATURE_CHRONIC_VISIT_AUTOEXTRACT`. Pure helper `vitalsToMetrics` already TDD'd and ready (Phase 0). Wiring in consulta requires reading current save handler + integration test.

## Phase B: Subspecialty extensions (ERC + EPOC + Tiroides)

- [ ] B.1 Extend metric picker scope in `metas-tab.tsx` and `metricas-tab.tsx`: filter `health_metric_types` by `categoria` based on patient tags (HTA→presion, ERC→renal, EPOC→respiracion, Tiroides→tiroides). Tests for filter logic.
- [ ] B.2 Add condition→metric mapping helper in `lib/chronic/condition-metrics.ts` + RED/GREEN tests. Verify ERC patient sees Creatinina/BUN/TFG/Microalbuminuria; EPOC sees FEV1/FEV1FVC/FEV1%pred; Tiroides sees TSH/T4libre.
- [ ] B.3 Playwright smoke: register a test ERC patient, add ERC tag, verify renal metric_types appear in picker.

## Phase C: Patient-detail typeahead symmetry

- [ ] C.1 (R2-C) RED `components/patients/__tests__/patient-detail-tags.test.tsx` — typeahead suggests 9 tags, soft-matches legacy values, persists via Supabase update.
- [ ] C.2 GREEN modify `components/patients/patient-detail.tsx` — surface canonical tag typeahead bound to `enfermedades_cronicas[]`.
- [ ] C.3 Playwright smoke: add `DM2` tag from patient-detail, switch to chronic-mgmt, verify patient appears in list.

## Documentation

- [ ] D.1 Update `apps/medico/web/CLAUDE.md` — document FEATURE_CHRONIC_VISIT_AUTOEXTRACT flag + chronic-mgmt module + 7 conditions covered + canonical tag list.

## Success criteria (validate live with Playwright)

- [ ] SC1: medico2 clicks `Gestión de Crónicos` → working module loads (no `Próximamente` badge, no placeholder).
- [ ] SC2: Add `HTA` tag → patient appears in chronic list with reason chip.
- [ ] SC3: Goal `valor_objetivo=130` for PA Sistólica → paciente/web sees read-only via existing hook.
- [ ] SC4: Recording `180 mmHg` → severe alert visible in AlertasTab.
- [ ] SC5: Flag ON, consulta BP=180/100 → 2 `health_metrics` rows persisted with `medical_record_id`.
- [ ] SC6: Flag OFF, same consulta → 0 `health_metrics` rows.
- [ ] SC7: Coverage ≥90% on `use-chronic-data` + `lib/chronic/` (run `pnpm test --coverage`).
- [ ] SC8: All 7 condition tags resolve via typeahead in chronic-mgmt AND patient-detail.
