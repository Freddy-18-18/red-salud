# chronic-disease-management Specification

## Purpose

Doctor-facing longitudinal management of chronic patients in Medicina General. Covers 7 conditions: HTA, DM2, DM1, Dislipidemia, Obesidad, ERC, EPOC, Hipotiroidismo, Hipertiroidismo. Surfaces identification, metric timeline, goals, range-based alerts, and consulta-to-timeline visit linking.

## Requirements

### Requirement: R1 Chronic patient identification

A patient MUST be classified as "crónico" for a doctor when EITHER `patient_details.enfermedades_cronicas[]` contains at least one canonical chronic tag, OR the patient has at least one `health_goals` row with `status='active'`.

#### Scenario: R1-A — tag-only identification

- GIVEN patient with `enfermedades_cronicas=['HTA']` and no goals
- WHEN the doctor opens chronic-mgmt
- THEN the patient MUST appear in the chronic list with reason="tag:HTA"

#### Scenario: R1-B — goal-only identification

- GIVEN patient with `enfermedades_cronicas=[]` and one `health_goal` status=active
- WHEN the doctor opens chronic-mgmt
- THEN the patient MUST appear with reason="goal:active"

#### Scenario: R1-C — neither tag nor goal

- GIVEN patient with no tags and no active goals
- WHEN the doctor opens chronic-mgmt
- THEN the patient MUST NOT appear in the list

### Requirement: R2 Canonical tag typeahead

The system MUST expose a typeahead with exactly 9 canonical tags (`HTA`, `DM2`, `DM1`, `DISLIPIDEMIA`, `OBESIDAD`, `ERC`, `EPOC`, `HIPOTIROIDISMO`, `HIPERTIROIDISMO`) on BOTH the chronic-mgmt module AND the patient detail view. Read SHALL soft-match (uppercase + strip accents) so legacy free-text rows still resolve.

#### Scenario: R2-A — adding canonical tag

- GIVEN doctor in chronic-mgmt, patient with `enfermedades_cronicas=[]`
- WHEN doctor types "diab" and selects "DM2" from suggestions
- THEN `enfermedades_cronicas` MUST be `['DM2']`

#### Scenario: R2-B — soft-match legacy value

- GIVEN patient with `enfermedades_cronicas=['Diabetes']`
- WHEN the read-side normalizer runs
- THEN the value MUST resolve to canonical `DM2` for filtering purposes
- AND the typeahead MUST suggest replacement with the canonical form

#### Scenario: R2-C — symmetric edit surface

- GIVEN doctor on `/dashboard/pacientes/[id]`
- WHEN doctor uses the typeahead there
- THEN the tag MUST persist identically (same column, same canonical form) as adding via chronic-mgmt

### Requirement: R3 Module layout and selection

The page `/dashboard/modulos/chronic-mgmt` MUST render with a left-panel chronic-patient list and a right-panel detail area. With no patient selected, the right panel MUST show an empty state. With a patient selected, three tabs MUST be available: `Métricas`, `Metas`, `Alertas`.

#### Scenario: R3-A — empty state

- GIVEN doctor opens chronic-mgmt with no patient selected
- WHEN the page renders
- THEN the right panel MUST show "Seleccioná un paciente crónico para ver su seguimiento"

#### Scenario: R3-B — tab navigation

- GIVEN a patient is selected
- WHEN the doctor clicks the `Metas` tab
- THEN the active tab MUST be `Metas` and only goal-related controls MUST render

### Requirement: R4 Goal lifecycle

Goals MUST be doctor-created. Paciente MUST be able to read but not write. The `health_goals.status` enum MUST follow transitions: `pending → active → completed | paused`.

#### Scenario: R4-A — create goal

- GIVEN doctor in `Metas` tab for a patient
- WHEN doctor creates a goal `valor_objetivo=130` for "Presión Arterial Sistólica" with status `active`
- THEN a `health_goals` row MUST persist with `patient_id`, `metric_type_id`, `valor_objetivo=130`, `status='active'`

#### Scenario: R4-B — pause and resume

- GIVEN an active goal
- WHEN doctor flips status to `paused`, then back to `active`
- THEN both transitions MUST be allowed and the row MUST end with `status='active'`

#### Scenario: R4-C — paciente read-only

- GIVEN paciente/web requests goals for the patient
- WHEN paciente attempts to PATCH `valor_objetivo`
- THEN RLS MUST reject the write

### Requirement: R5 Computed range alerts

For each measurement, the system MUST classify against the effective range. The effective range SHALL prefer the patient's active `health_goal.valor_objetivo` over the metric_type's `rango_minimo/maximo`. Severity tiers: `mild` within 10% deviation, `moderate` within 25%, `severe` beyond 25%.

#### Scenario: R5-A — severe alert

- GIVEN metric_type "Presión Arterial Sistólica" `rango_maximo=140` and patient has NO active goal
- WHEN a measurement of `180 mmHg` is recorded
- THEN an alert with `severity='severe'` MUST be produced (180 > 140 × 1.25)

#### Scenario: R5-B — goal override

- GIVEN active goal `valor_objetivo=120` for same metric
- WHEN a measurement of `135 mmHg` is recorded
- THEN the alert severity MUST compute against `120` (not 140), producing `severity='moderate'` (>10% above 120)

### Requirement: R6 Auto-extract from consulta

When the env flag `FEATURE_CHRONIC_VISIT_AUTOEXTRACT='true'`, saving a consultation with populated `vital_signs` MUST create one `health_metrics` row per filled field, with `medical_record_id` AND `appointment_id` set.

#### Scenario: R6-A — flag on, full vitals

- GIVEN the flag is true and consulta vitals include `systolic_bp=180`, `diastolic_bp=100`, `weight=85`
- WHEN the doctor clicks "Guardar consulta"
- THEN exactly 3 `health_metrics` rows MUST be created with `medical_record_id` matching the consulta

#### Scenario: R6-B — flag off

- GIVEN the flag is false with the same vitals
- WHEN the doctor saves
- THEN zero `health_metrics` rows MUST be created

#### Scenario: R6-C — partial vitals

- GIVEN flag on and only `systolic_bp=130` populated (other fields null)
- WHEN the doctor saves
- THEN exactly one `health_metrics` row MUST be created (no rows for null fields)

### Requirement: R7 Seed expansion prerequisite

10 new `health_metric_types` rows (HbA1c, Microalbuminuria, Creatinina, BUN, TFG estimada, FEV1, FEV1/FVC, FEV1 %predicho, TSH, T4 libre) MUST exist before the module is usable in production. Each row MUST carry a unit, category, and rango_minimo/rango_maximo populated.

#### Scenario: R7-A — seed present

- GIVEN the seed migration has been applied
- WHEN the module queries `health_metric_types`
- THEN exactly 25 rows MUST be returned (15 existing + 10 new)

#### Scenario: R7-B — seed missing

- GIVEN the seed migration has NOT been applied
- WHEN doctor selects DM2 for a chronic patient and looks up control markers
- THEN "HbA1c" MUST NOT appear in the metric picker

### Requirement: R8 Paciente compatibility

Paciente/web MUST continue reading `health_metrics` and `health_goals` unchanged. No schema column is renamed, dropped, or made stricter.

#### Scenario: R8-A — paciente reads unchanged

- GIVEN paciente views their health dashboard
- WHEN the dashboard loads metrics and goals
- THEN the same hooks (`use-health-metrics.ts`) MUST resolve identical data shapes as before the change

### Requirement: R9 Module visibility

`chronic-mgmt` MUST be registered in `apps/medico/web/src/components/modules/module-registry.ts` so the sidebar entry stops carrying the `Próximamente` badge.

#### Scenario: R9-A — badge gone

- GIVEN the module is registered
- WHEN medico2 loads `/dashboard`
- THEN the sidebar entry "Gestión de Crónicos" MUST NOT show the `Próximamente` badge

#### Scenario: R9-B — module loads

- GIVEN medico2 clicks the entry
- WHEN navigation completes
- THEN the chronic-mgmt module MUST render (not the "Módulo no disponible" placeholder)
