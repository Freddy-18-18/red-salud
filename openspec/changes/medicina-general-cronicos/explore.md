# Exploration: medicina-general-cronicos

First clinical module REAL for Medicina General. Replaces the `Próximamente` placeholder on `/dashboard/modulos/chronic-mgmt` with a working "Gestión de Crónicos" interface for the doctor.

## Current State

- **Capability engine wired** (Phase 2 completed): `chronic-mgmt` resolves through `capability_modules` → sidebar shows badge "Próximamente" because no React component is registered.
- **Supabase schema READY** — no migrations needed:
  - `health_metric_types` (15 rows seeded): presión sistólica/diastólica, glucosa ayunas/postprandial, HDL/LDL/total/triglicéridos, IMC/peso/altura, frecuencia cardíaca/respiratoria, saturación O2, temperatura. Each row has `rango_minimo`/`rango_maximo` for normal range.
  - `health_metrics` (empty): patient measurements linked to `metric_type_id`, with `medical_record_id` + `appointment_id` slots for visit-linking and `medido_por` to distinguish paciente vs medico entry.
  - `health_goals` (empty): per-patient targets with `valor_objetivo`, `starts_at`, `target_date`, `status`, `progreso_actual`.
  - `measurement_reminders`: paciente-side schedules (out of doctor scope v1).
  - `patient_details.enfermedades_cronicas[]`: existing free-text array column on the patient profile.
- **Hooks ready in `packages/core/src/hooks/use-health-metrics.ts`**: 9 hooks already factored (types, metrics, stats, trend, goals, progress, reminders, summary). Paciente/web already consumes them.
- **Module pattern proven** (`pediatrics/growth-curves-module.tsx`): `<ModuleWrapper>` shell + form toggle + alerts + chart + table + companion `use-X-data.ts` hook. Receives `ModuleComponentProps {doctorId, patientId?, config?, themeColor?}`.

## Affected Areas

- `apps/medico/web/src/components/modules/chronic-mgmt/` — NEW folder for the module + companion hook + sub-components
- `apps/medico/web/src/components/modules/module-registry.ts` — register `chronic-mgmt` lazy import
- `apps/medico/web/src/lib/capabilities/module-catalog.ts` — already correct (label/icon/route)
- `packages/core/src/hooks/use-health-metrics.ts` — REUSE; no changes
- `packages/core/src/services/supabase/health-metrics-service.ts` — REUSE; may need a doctor-side query helper (e.g. `getDoctorChronicPatients`)
- `apps/medico/web/src/app/dashboard/consulta/page.tsx` — TOUCH only for visit-linking decision
- Supabase migration `seed_chronic_metric_types_extras.sql` — OPTIONAL: add HbA1c + microalbuminuria

## Approaches

### A. Clinical scope: HTA + DM2 + Dislipidemia + Obesidad (RECOMMENDED)

Maps to existing metric_types: presión sistólica/diastólica (HTA), glucosa ayunas/postprandial (DM2), HDL/LDL/total/triglicéridos (Dislipidemia), peso/altura/IMC (Obesidad). Covers the 4 cardiovascular crónicos that account for >80% of primary-care chronic visits.

- Pros: clear clinical boundary; all required metric_types already seeded; reuses existing hooks 1:1.
- Cons: skips HbA1c (CRITICAL for DM2 control) and microalbuminuria — recommend a 5-min seed expansion as task 0.

### B. Patient identification: `enfermedades_cronicas[]` tag + auto-include goal holders (RECOMMENDED)

A doctor sees a patient in chronic-mgmt if **either**:
1. `patient_details.enfermedades_cronicas` contains a canonical tag (`HTA`, `DM2`, `DISLIPIDEMIA`, `OBESIDAD`), OR
2. patient has at least one `health_goals.status='active'`.

A typeahead with canonical values prevents typos. To "add patient to chronic mgmt", doctor adds tags + creates first goal.

- Pros: no new table; works with paciente's existing self-tagging UI; auto-includes any patient with an active goal.
- Cons: free-text array allows historical drift (typos in old rows). Mitigation: typeahead + light normalization on read.

### C. UI structure: single-page with patient selector + tabs (RECOMMENDED)

`/dashboard/modulos/chronic-mgmt` renders:
- Left panel: list of chronic patients with status pill (controlado / descompensado / sin meta) + last-reading timestamp.
- Right panel: selected patient with 3 tabs — **Métricas** (timeline + chart), **Metas** (CRUD), **Alertas** (out-of-range + adherence). No patient selected → empty state with CTA "Agregar paciente crónico".

Matches every other module's `<ModuleWrapper>` pattern. Single page = single route = same auth/sidebar/breadcrumb.

- Pros: consistent with growth-curves/dental/etc.; one URL; one ModuleWrapper.
- Cons: less SEO/share-friendly than `/chronic-mgmt/[patientId]` route — irrelevant for an internal tool.

### D. Goal lifecycle: medico-created + existing `status` enum (RECOMMENDED)

Doctor creates goals; paciente sees them read-only on paciente/web. Existing `health_goals.status` covers transitions: `'pending'` → `'active'` → `'completed'` | `'paused'`. Doctor can edit `valor_objetivo` while status=active; transitions logged in `notes`. No new table.

### E. Alerts: computed on-read from `rango_minimo/maximo` (RECOMMENDED)

For each recent measurement, compare against the metric_type's range. Out-of-range → severity (`'mild'` if within 10%, `'moderate'` within 25%, `'severe'` beyond). Cached in component memo, no alerts table.

- Pros: zero new schema; rules live in DB seed (rango_minimo/maximo); rule change = single UPDATE.
- Cons: rules per patient not supported (e.g. tighter target for younger diabetic). Mitigation: an active `health_goal.valor_objetivo` overrides the global range for that patient+metric.

### F. Visit linking: auto-extract from `consulta` vitals form (RECOMMENDED — Approach 7B in prompt)

When doctor saves a consultation with vital_signs filled (BP, weight, etc.), the consultation handler detects the values and creates `health_metrics` rows with `medical_record_id` populated automatically. Doctor doesn't double-enter.

- Pros: best UX; chronic timeline always reflects real visits; zero new clicks.
- Cons: tight coupling between consulta page and chronic-mgmt — has to be defended with tests + a feature flag.

### G. Med adherence: out of scope v1, show summary stat only

`medication_intake_log` adherence shown as a single % chip in the patient panel (e.g. "Adherencia 30d: 87%") with link to a future `medication-mgmt` module. Detailed CRUD deferred.

### H. Walk-in vs longitudinal: implicit (RECOMMENDED)

`chronic-mgmt` IS the longitudinal lens (per-patient over time). `consulta` IS the walk-in lens (per-visit). They share data via visit-linking (Approach F). No mode toggle needed.

### I. Paciente compatibility: zero schema changes

Paciente/web continues to read/write the same tables. Hooks already factored in `packages/core/`. RLS policies (already in place) gate the read/write per role.

## Recommendation

Build a single-page module `/dashboard/modulos/chronic-mgmt` covering HTA + DM2 + Dislipidemia + Obesidad (approach A), with patient identification via `enfermedades_cronicas[]` tags + active goals (B), 3-tab patient panel (C), medico-created goals with existing status enum (D), computed range-based alerts (E), and auto-extracted measurements from the consultation form (F). Out of scope: med adherence CRUD, AI scoring, SMS, telemedicine, new schema.

## Risks

- **R1 (Medium)**: `enfermedades_cronicas[]` is unnormalized — old rows may have typos like `'HiperTension'`. Mitigation: typeahead on write + soft-match on read (uppercase + strip accents) + a one-time cleanup migration is OPTIONAL.
- **R2 (Low)**: Missing HbA1c metric_type for DM2 control. Mitigation: 5-min seed migration adds HbA1c (%) and Microalbuminuria (mg/g) — Task 0 of apply.
- **R3 (Medium)**: Auto-extract from `consulta` is the only invasive coupling. Mitigation: feature flag + integration test that asserts metric rows persist with `medical_record_id` set.
- **R4 (Low)**: `health_metrics` lacks an indexed `doctor_id` — list-of-chronic-patients query needs to join via appointments or patient assignments. Mitigation: add an index on `(patient_id, measured_at)` if perf degrades; for v1 the per-doctor list comes from the doctor's appointment history.
- **R5 (Low)**: paciente/web may render goals doctor edits unexpectedly. Mitigation: RLS audit + a note in paciente/web release notes.

## Ready for Proposal

**Yes**, with 4 critical user decisions to lock before propose:

1. **Clinical scope v1**: confirm HTA+DM2+Dislipidemia+Obesidad (recommended) vs HTA+DM2 only vs all crónicos.
2. **Seed expansion now or later**: add HbA1c + microalbuminuria metric_types in this change (task 0) or as a follow-up?
3. **Auto-extract from `consulta`**: do we implement Approach F (auto) now, behind flag? Or defer to a follow-up and start with manual entry only?
4. **Chronic tagging surface**: typeahead in chronic-mgmt module only, OR also in `pacientes` patient-detail view? (Symmetry concern.)
