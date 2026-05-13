# Design: Gestión de Crónicos (medicina-general-cronicos)

## Technical Approach

Build the chronic-mgmt module as a deps-injected, pure-helper-first React module mirroring `pediatrics/growth-curves-module.tsx`. Reuse the 9 hooks in `packages/core/src/hooks/use-health-metrics.ts` unchanged. Add 4 pure helpers in `apps/medico/web/src/lib/chronic/` (canonical-tags, alert-evaluator, vitals-to-metrics, patient-resolver) — each unit-testable without mocks. Wire auto-extract via a flag-gated hook inside the consulta save handler. Seed 10 new metric_types as Task 0 of apply.

## Architecture Decisions

### Decision 1: Pure helpers in `lib/chronic/`, not in the hook

**Choice**: Extract canonical-tags, alert-evaluator, vitals-to-metrics, and patient-resolver to pure modules under `apps/medico/web/src/lib/chronic/`. The hook composes them.
**Alternatives**: (a) all logic inside `use-chronic-data.ts`; (b) helpers inside `packages/core`.
**Rationale**: Pure helpers are trivially testable (zero mocks per Strict TDD `Mock Hygiene Rules`). Keeping them app-local avoids coupling `packages/core` to medico's canonical tag list — paciente never edits chronic tags. Hook stays thin and orchestration-only.

### Decision 2: Patient identification UNION at read time

**Choice**: Compute the chronic list each render as `enfermedades_cronicas[]` canonical match UNION patients with `health_goals.status='active'`. No new column, no flag column.
**Alternatives**: (a) materialized `chronic_patients` table; (b) explicit "Add to chronic-mgmt" flag column on `patient_details`.
**Rationale**: Both alternatives require migration + sync logic and drift risk. Computing on read keeps the schema clean and the rule transparent (any active goal = chronic). Cost is one extra query per dashboard render, mitigated by joining server-side.

### Decision 3: Effective range = active goal ?? metric_type defaults

**Choice**: Alert severity uses the active goal's `valor_objetivo` when present; otherwise falls back to `metric_type.rango_minimo/rango_maximo`. The selector is a one-liner inside `alert-evaluator.ts`.
**Alternatives**: (a) per-doctor configurable rules table; (b) hardcoded thresholds per condition.
**Rationale**: Per-doctor rules drift over time and add UI surface. Hardcoded thresholds bypass the existing schema. Goal-or-default mirrors clinical reality (the doctor's goal IS the rule).

### Decision 4: Feature flag at module-level, single read

**Choice**: `FEATURE_CHRONIC_VISIT_AUTOEXTRACT` read once at the consulta page module level: `const AUTO_EXTRACT = process.env.FEATURE_CHRONIC_VISIT_AUTOEXTRACT === 'true'`. Default OFF.
**Alternatives**: per-request env read, runtime DB toggle, useEnv hook.
**Rationale**: Matches the pattern from `medico-capability-engine` (FEATURE_CAPABILITY_ENGINE). Predictable, server-side, no client leak.

## Data Flow

```
1) chronic-mgmt page load
   /dashboard/modulos/chronic-mgmt
   │
   ▼
   ChronicMgmtModule (client)
   │
   ├──→ useChronicData(doctorId)
   │      ├──→ fetchDoctorPatients(doctorId)   // appointments-derived
   │      ├──→ fetchTagsAndGoals(patientIds)
   │      └──→ resolveChronicList(...)         // pure: lib/chronic/patient-resolver
   │
   └──→ render
        ├── ChronicPatientList (left)
        └── ChronicPatientDetail (right)
              ├── MetricasTab  (timeline + chart, computes alerts)
              ├── MetasTab     (CRUD goals)
              └── AlertasTab   (active alerts list)

2) Consulta save → auto-extract (when flag ON)
   /dashboard/consulta save
   │
   ▼
   saveConsultation()
   │
   ├──→ persist medical_records row
   │
   ├──→ if (AUTO_EXTRACT && vitals filled):
   │       vitalsToMetrics(vital_signs, medical_record_id, appointment_id)
   │           // pure: lib/chronic/vitals-to-metrics → CreateHealthMetricData[]
   │       supabase.from('health_metrics').insert(rows)
   │
   └──→ revalidate chronic-mgmt cache
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/<ts>_chronic_metric_types_seed.sql` | Create | 10 INSERTs (HbA1c, microalbuminuria, creatinina, BUN, TFG, FEV1, FEV1/FVC, FEV1%pred, TSH, T4 libre) |
| `apps/medico/web/src/lib/chronic/canonical-tags.ts` | Create | `CHRONIC_TAGS` const + `softMatchTag()` |
| `apps/medico/web/src/lib/chronic/alert-evaluator.ts` | Create | `evaluateSeverity(value, range, goal?)` |
| `apps/medico/web/src/lib/chronic/vitals-to-metrics.ts` | Create | `vitalsToMetrics(vitals, medical_record_id, appointment_id)` |
| `apps/medico/web/src/lib/chronic/patient-resolver.ts` | Create | `resolveChronicList(patients, tags, goals)` |
| `apps/medico/web/src/lib/chronic/__tests__/*.test.ts` | Create | Unit tests for all 4 helpers (zero-mock) |
| `apps/medico/web/src/components/modules/chronic-mgmt/chronic-mgmt-module.tsx` | Create | Container component (lazy entry) |
| `apps/medico/web/src/components/modules/chronic-mgmt/use-chronic-data.ts` | Create | Companion hook (orchestrates packages/core hooks) |
| `apps/medico/web/src/components/modules/chronic-mgmt/{chronic-patient-list,chronic-patient-detail,metricas-tab,metas-tab,alertas-tab}.tsx` | Create | Sub-components |
| `apps/medico/web/src/components/modules/chronic-mgmt/__tests__/*.test.tsx` | Create | Component tests with supabase mock |
| `apps/medico/web/src/components/modules/module-registry.ts` | Modify | Register `chronic-mgmt` lazy import (kills `Próximamente` badge) |
| `apps/medico/web/src/components/patients/patient-detail.tsx` | Modify | Add canonical tag typeahead surface |
| `apps/medico/web/src/app/dashboard/consulta/page.tsx` | Modify | Auto-extract gated by `FEATURE_CHRONIC_VISIT_AUTOEXTRACT` |
| `apps/medico/web/CLAUDE.md` | Modify | Document flag + module + chronic conditions |

## Interfaces

```ts
// lib/chronic/canonical-tags.ts
export const CHRONIC_TAGS = ['HTA', 'DM2', 'DM1', 'DISLIPIDEMIA', 'OBESIDAD',
  'ERC', 'EPOC', 'HIPOTIROIDISMO', 'HIPERTIROIDISMO'] as const;
export type ChronicTag = typeof CHRONIC_TAGS[number];
export function softMatchTag(raw: string): ChronicTag | null;

// lib/chronic/alert-evaluator.ts
export type AlertSeverity = 'mild' | 'moderate' | 'severe';
export interface AlertRange { min: number; max: number; }
export function evaluateSeverity(
  value: number, range: AlertRange, goal?: number | null
): AlertSeverity | null;

// Module + hook contracts
export interface ChronicPatientSummary {
  patient_id: string; full_name: string; cedula: string | null;
  tags: ChronicTag[]; activeGoalsCount: number;
  reason: 'tag' | 'goal' | 'both'; lastMeasurementAt: string | null;
}
export interface AlertResult {
  metric_type_id: string; value: number; severity: AlertSeverity;
  effectiveRange: AlertRange; via: 'goal' | 'default';
}
export interface GoalDraft {
  patient_id: string; metric_type_id: string; titulo: string;
  valor_objetivo: number; target_date: string | null;
  status: 'pending' | 'active' | 'completed' | 'paused';
}
```

```sql
-- Seed: 10 new health_metric_types rows
INSERT INTO public.health_metric_types (name, unidad_medida, categoria, rango_minimo, rango_maximo, es_bidimensional) VALUES
  ('HbA1c', '%', 'glucosa', 4.0, 5.7, false),
  ('Microalbuminuria', 'mg/g', 'renal', 0, 30, false),
  ('Creatinina sérica', 'mg/dL', 'renal', 0.6, 1.2, false),
  ('BUN', 'mg/dL', 'renal', 7, 20, false),
  ('TFG estimada', 'mL/min/1.73m²', 'renal', 90, 200, false),
  ('FEV1', 'L', 'respiracion', 1.5, 5.0, false),
  ('FEV1/FVC', '%', 'respiracion', 70, 100, false),
  ('FEV1 % predicho', '%', 'respiracion', 80, 120, false),
  ('TSH', 'µIU/mL', 'tiroides', 0.4, 4.0, false),
  ('T4 libre', 'ng/dL', 'tiroides', 0.8, 1.8, false)
ON CONFLICT DO NOTHING;
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit (pure helpers) | canonical-tags softMatch, alert-evaluator severity bands, vitals-to-metrics shape, patient-resolver UNION | Vitest, ZERO mocks (pure functions) |
| Unit (hook) | use-chronic-data orchestration (load, select, create goal, refresh) | Vitest + supabase mock factory |
| Component | ChronicPatientList rendering, tab navigation, empty state, badge absence | Vitest + @testing-library/react |
| Integration | Auto-extract path: save consulta with vitals → assert health_metrics rows persisted with medical_record_id | Vitest + supabase-local stub |
| E2E (manual) | medico2 sees module load (no Próximamente), creates goal, sees severity alert | Playwright MCP, post-apply |

## Migration / Rollout — apply phasing

Sequential phases inside this single change (R3 mitigation):

- **Phase 0** — Seed migration (10 metric_types) + canonical-tags + alert-evaluator + patient-resolver pure helpers + tests.
- **Phase A — Cardiovascular core**: HTA, DM2, DM1, Dislipidemia, Obesidad. Module skeleton + 3 tabs + goal CRUD + visit-linking flag wire. Apply registers module → kills `Próximamente` badge.
- **Phase B — Subspecialty extensions**: ERC, EPOC, Tiroides. Add tag handling for the 4 extra tags + metric type pickers. No new components; only typeahead and picker scope.
- **Phase C — patient-detail typeahead symmetry**: add the same typeahead surface to `/dashboard/pacientes/[id]`.

Rollback per layer (per proposal). Auto-extract flag stays OFF until Phase A integration tests green.

## Open Questions

- [ ] Should `MetricasTab` chart use Recharts (already a dep) or a lightweight inline SVG? Defer to apply unless team has a preference.
- [ ] Soft-match in R2: should "DIABETES" alone resolve to DM2 or DM1? Recommend DM2 (more common in adults) with a warning suggesting explicit DM1 typing.
- [ ] Where to render the AlertasTab badge count — small chip on tab label, or banner on detail header? Recommend small chip.
