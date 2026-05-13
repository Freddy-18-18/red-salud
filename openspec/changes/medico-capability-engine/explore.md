# Explore — medico-capability-engine

> Phase: sdd-explore (Fase 2). No code edits. Single artifact: this document.
> Sibling Phase 1 change (`medico-shell-sanvia`) shipped the static shell. Phase 2 turns the sidebar dynamic by deriving modules from SACS-resolved capabilities.

## Problem statement

Today `apps/medico/web/src/components/shell/nav-data.ts` exports a STATIC `NAV_GROUPS` array (Principal · Configuración) — every doctor sees the same 9 sidebar items regardless of specialty, postgrado, or verification level. Meanwhile the codebase carries 132 specialty override files (`lib/specialties/configs/overrides/*.ts`, ~300–400 LOC each), an org-oriented `module_catalog` table (21 rows, all clinic/multi-org), and a SACS verification flow that produces RICH structured capability data (1..N profesiones + 1..N postgrados per cédula) that nothing currently consumes for navigation. Fase 2's job is to bridge SACS → modules → sidebar, replacing static `NAV_GROUPS` with `useDoctorCapabilities()`-driven groups, while pruning what no longer fits **individual practice**.

## DB inventory (relevant tables)

> Project: `hwckkfiirldgundbcjsp`. All RLS-enabled. Row counts as of 2026-05-09.

### `specialties` — 132 rows (source of truth for slug→id mapping)
Columns: `id text PK`, `name text`, `category text`, `icon text`, `description text`, `active bool`, `slug text`, `created_at`, `updated_at`.
- Key sample: `gen-1` Medicina General (`general`), `gen-4` Medicina Interna (`general`), `inf-1` Infectología (`infectologia`), `uro-1` Urología (`urologia`), `car-1` Cardiología (`cardiovascular`), `ped-3` Cirugía Pediátrica (`pediatria`).
- 44 distinct `category` values. Notable: `pediatria` 11, `cirugia` 10, `odontologia` 9, `cardiovascular` 6, `oftalmologia` 6.
- **BUG flag**: row `gin-2` (Obstetricia) has `category` value `"gin\n\neco"` — whitespace/newline corruption, sibling rows are `gineco`. Will break category-based grouping. Out of scope to fix here but log for proposal.

### `module_catalog` — 21 rows (PK is `key text`, NOT `id`)
Columns: `key varchar PK`, `name varchar`, `description text`, `category varchar`, `is_core bool`, `min_plan enum`, `icon varchar`, `display_order int`, `created_at`.
- Categories: `core` (4), `operations` (6), `specialty` (6), `enterprise` (5).
- All 21 keys are **clinic/multi-org concepts**: `overview`, `locations`, `staff`, `schedule`, `patients`, `resources`, `inventory`, `billing`, `metrics`, `hospitalization`, `emergency`, `surgery`, `lab`, `imaging`, `telemedicine`, `rcm`, `international`, `crm`, `ai`, `multi_org`, `settings`.
- Plan tiers: `starter`, `professional`, `enterprise` (PG enum `min_plan`).
- **Verdict**: Not directly applicable to individual medico practice. Several keys (telemedicine, lab, imaging, billing, settings) have analogues we'd want, but the catalog is shared with `apps/clinica/web/` — confirmed via grep: `apps/clinica/web/src/lib/db/modules.ts` and `organization_modules` table consume it.

### `user_modules` — 160 rows (10 modules × 16 users)
Columns: `id uuid`, `user_id uuid`, `module_name varchar`, `enabled bool`, `position int`, `settings jsonb`, `created_at`, `updated_at`.
- **CONTRADICTS the stated assumption**: rows are NOT for clinica or medico — they're for `paciente` (`derlyramirez69@gmail.com`) and `farmacia.demo` (`role=farmacia`). 10 module names: `perfil`, `metricas`, `historial`, `calificaciones`, `citas`, `configuracion`, `mensajeria`, `telemedicina`, `laboratorio`, `medicamentos`.
- Pattern: looks like a generic per-user toggle list applied to the patient or pharmacy app at signup. NOT a medico shape. Indexes were dropped per migration `20260206000000_optimize_database_indexes.sql:78-79` (probably to reduce write cost on a low-value table).
- **Verdict**: Do NOT reuse `user_modules` for medico. Build a clean medico-specific table.

### `doctor_module_preferences` — 0 rows (empty, will be the user-override surface)
Columns: `id uuid`, `doctor_id uuid`, `module_id text`, `is_enabled bool NOT NULL`, `custom_order int`, `custom_settings jsonb`, `pinned_to_dashboard bool NOT NULL`, `created_at`, `updated_at`.
- Comment in DB: *"Per-doctor module preferences: which modules are enabled, their order, custom settings, and dashboard pinning. Works with the ModuleDefinition system."*
- The `ModuleDefinition` system referenced is the strict-typed contract in `packages/types/src/module.ts:302` (300+ lines, defines `ModuleDefinition` + `ModuleContextContract` + `RuntimeCapability`).
- **BUG flag**: `apps/medico/web/src/components/onboarding/registration-steps.tsx:351-360` writes to this table with COLUMNS THAT DO NOT EXIST: `specialty_id`, `enabled_modules`, `updated_at`. Real columns are `module_id`, `is_enabled`, `custom_order`, `custom_settings`, `pinned_to_dashboard`. The `onConflict: 'doctor_id'` is also wrong — `doctor_id` is not unique (only `id` PK is). Effectively this insert silently fails and that's why the table is empty.

### `sacs_specialty_mapping` — 0 rows (empty — DECLARED but UNSEEDED)
Columns: `id uuid`, `sacs_code text`, `sacs_name_pattern text NOT NULL`, `specialty_slug text NOT NULL`, `confidence text` (`'exact' | 'keyword'`), `created_at`.
- Used by SQL function `resolve_sacs_to_slug(sacs_specialty text)` (3-step fallback: exact → keyword → fuzzy contains). Today returns `NULL` for everything because the table is empty.
- **The DB triggers depend on this table** but currently fail silently and fall back to NULL → NULL specialty assignment via DB-side SACS resolution. The reason all 4 verified test doctors have correct `specialty_id` is because **the wizard sets `specialty_id` BEFORE the trigger runs** (it's a manual user choice, not SACS-resolved).

### `doctor_profiles` — 5 rows (medico's main table)
Capability-relevant columns: `medical_license varchar`, `specialty_id text` (FK→specialties.id), `certifications text[]`, `sacs_verified bool`, `sacs_data jsonb`, `subspecialties text[]`, `specialization_areas text[]`.
- All 4 test doctors with SACS data have empty `subspecialties` and `specialization_areas` arrays. The richness lives **inside `sacs_data.data.postgrados[]`** — see SACS flow below.

### `sacs_verifications` — 0 rows (declared but EMPTY)
Columns: `id uuid`, `user_id uuid`, `national_id text`, `document_type text`, `full_name text`, `profesion_principal text`, `matricula_principal text`, `specialty text`, `profesiones jsonb`, `postgrados jsonb`, `is_human_doctor bool`, `es_veterinario bool`, `apto_red_salud bool`, `verificado bool`, `razon_rechazo text`, `verified_at`, `created_at`, `updated_at`.
- This is the **canonical "verifications" table** with normalized columns matching the SACS service response shape. Comment: *"Verification: SACS registry cache"*. **Empty** — onboarding flow currently bypasses it and writes the SACS payload into `doctor_profiles.sacs_data` directly.

### `verificaciones_sacs` — DOES NOT EXIST as a table
- The "what we know" section listed both `sacs_verifications` AND `verificaciones_sacs` as separate tables. **Only `sacs_verifications` exists.** Trigger `update_verificaciones_sacs_updated_at` is mis-named; it actually fires on `sacs_verifications`. The legacy `apps/medico/web/CLAUDE.md` references `verificaciones_sacs` — stale documentation, ignore.

### `professional_verifications` — 0 rows (universal verification, all roles)
Columns include `verification_level enum`, `main_role enum`, `sub_role text`, `professional_id text`, `sacs_national_id text`, `sacs_verified bool`, `sacs_data jsonb`, `restrictions jsonb`, `custom_permissions jsonb`, `expires_at`, `next_review_date`, `supervisor_id uuid`. Comment: *"Verificación universal para todos los tipos de profesionales de salud"*. Designed for laboratorio/farmacia/enfermería etc., not the primary path for individual medico.

### `verification_documents` — 0 rows
Stores doc uploads (`file_url`, `mime_type`, `review_status`). Linked to `professional_verifications.id` via `verification_id`. Out of scope for matrix engine — it's a doc-review pipeline.

### Tables matching `%capability%`, `%postgrad%`, `%certif%` — 0 rows
Returned empty. **No existing capabilities table.** Fase 2 will need either a new table or a hardcoded matrix.

### DB functions / triggers referenced
- `auto_resolve_doctor_specialty_from_sacs()` — trigger on `doctor_profiles`. When `specialty_id IS NULL` and `sacs_data` is set, reads `sacs_data#>>'{data,especialidad_display}'` (with fallback chain to `postgrados[0].postgrado` then `profesion_principal`), runs `resolve_sacs_to_slug()`, and SET `NEW.specialty_id`. Useful prior art for the resolver.
- `resolve_sacs_to_slug(text)` — STABLE, three-tier match against `sacs_specialty_mapping`. Currently returns NULL for all inputs because mapping table is empty.
- `sync_doctor_especialidad_from_sacs_on_verified_approval()` — fires on `verified` flip (false→true), gated to admin/corporate actors. Has a fallback `name ILIKE` join against `specialties` if slug resolver fails. Same idea, redundant.
- Two triggers on `doctor_profiles` named `trg_auto_resolve_doctor_specialty` (BEFORE INSERT and BEFORE UPDATE — duplicate? worth confirming).

## Code inventory

### `apps/medico/web/src/lib/specialties/index.ts` (276 LOC)
Public surface. Re-exports the WHOLE specialty subsystem: types, registry, detector, factory, module-validator, module-registry (the "core" one inside lib/specialties), 132 generated configs, layout templates, KPI resolver, plus three deprecated singleton constants (`dentalConfig`, `cardiologyConfig`, `pediatricsConfig`).

Key functions:
- `getSpecialtyExperienceConfig(context: SpecialtyContext) → SpecialtyConfig` (line 109) — main consumer-facing API. Returns config for given context or a `default` fallback.
- `isSpecialtyMatch(context, specialtyId) → boolean` (line 139).
- `getSpecialtyMenuGroups(config) → Array<{label, icon?, items, order?}>` (line 160) — **CONTRADICTS the assumption "consumer-less"**. It IS still exported, but a content-grep shows no consumer files import it. It's listed in the README and `index.ts` only. Effectively dormant in the runtime, alive in the public API. **Verdict: dormant, but cleanup-only after we know nothing else picks it up.**
- `isOdontologySpecialtyLegacy()` (line 243) — deprecated, kept for legacy callers.

### `apps/medico/web/src/lib/specialties/configs/`
- `config-factory.ts` (465 LOC) — `buildSpecialtyConfig(identity, categoryMeta, override?)`. Materializes a `SpecialtyConfig` from a `SpecialtyIdentity` + a `LayoutTemplate`. The factory does the heavy lifting; overrides are partial (modules per-group REPLACE base, others MERGE). It also has `KNOWN_PREFIXES` (~140 entries, lines 96–232) that map specialty slug → key prefix.
- `layout-templates.ts` — generic per-category templates (e.g. `surgical`, `dental`, `medical`).
- `overrides/*.ts` — **133 files** (132 specialty-specific + 1 `index.ts` aggregator). Each is a partial override: dashboard variant, module list per group, KPI defs, settings, theme. The overrides are **dense and assume a clinic-style sidebar** (clinical / financial / lab / technology / communication / growth groups) including modules like `cardio-facturacion` (Reclamaciones), `cardio-seguros` (Seguros), `dental-rcm`, `dental-memberships`, `dental-portal-paciente`, `cardio-pacs`, `cardio-portal-paciente`. **This is a clinic-org sidebar dressed up as specialty configs**, not an individual practice sidebar.
- `overrides/medicina-general.ts` (322 LOC) — has 6 clinical modules (consulta, preventivo, cronicos, derivaciones, vacunacion, historia-familiar), 2 lab, 2 technology, plus 4 widgets, 6 KPIs, plus 80 LOC of `PREVENTIVE_SCREENING_PROTOCOLS` / `REFERRAL_CRITERIA` / `ADULT_VACCINATION_SCHEDULE` constants. **THE PRACTICE-LEVEL DOMAIN DATA IS GOLD**, even if the sidebar groupings need rework.
- `overrides/cardiologia.ts` (259 LOC) — 5 clinical modules including `cardiology-ecg` whose route is `/dashboard/modulos/cardiology-ecg` (matches `module-registry.ts` lazy-loaded keys). **The `componentPath` field is the bridge between override files and lazy-loaded module components.**
- `overrides/odontologia.ts` (317 LOC) — 15 modules across 6 groups, the most mature override. Uses `dental-periodontogram`, `dental-odontogram`, `dental-imaging` registered components.

### `apps/medico/web/src/components/modules/module-registry.ts` (122 LOC)
Lazy-loaded registry. Maps 30 module keys to `lazy(() => import(...))` components — the actual React components for clinical features:
- Cross-specialty: `diagnostic-imaging`, `lab-imaging`, `lab-orders`, `clinical-templates`, `treatment-plans`.
- Per specialty: `cardiology-ecg`, `dental-periodontogram`, `dental-odontogram`, `dental-imaging`, `pediatrics-growth`, `pediatrics-vaccination`, `dermatology-body-map`, `psychiatry-scales`, `gynecology-prenatal`, `telemedicine-video`, `surgical-checklist`, `wound-care`, `rehabilitation-progress`, `neurology-scales`, `allergy-testing`, `audiometry-test`, `spirometry-test`, `nutrition-assessment`, `pain-assessment`, `oncology-staging`.
- API: `getModuleComponent(moduleId)`, `isModuleRegistered(moduleId)`, `getRegisteredModuleIds()`.
- **This is the actual MVP set of "real" clinical modules that have UI.** ~22 distinct concepts, mostly aligned to the medico-app modules we want.

### `apps/medico/web/src/components/modules/<specialty>/` — 80+ component files
The `Glob` showed allergy, audiometry, cardiology, clinical-templates, dental, dermatology, diagnostic-imaging, eeg, endoscopy, gynecology, lab-orders, neurology, nutrition, oncology, ophthalmology, pain, pediatrics, psychiatry, rehabilitation, rheumatology, etc. **Each implemented module has its own `module.tsx` + `use-*.ts` hook + supporting data files.** This is real code, not scaffolding.

### `apps/medico/web/src/components/shell/nav-data.ts` (144 LOC)
Static nav source for Fase 1. Two groups (Principal: Inicio, Agenda, Pacientes, Consulta, Recetas, Mensajes; Configuración: Estadísticas, Verificación, Configuración) plus a 5-item bottom nav. Comment line 9–10 explicitly defers capability-driven groups to Phase 2: *"Capability-driven groups are scheduled for Phase 2."*

### `apps/medico/web/src/components/shell/dashboard-shell.tsx` (98 LOC)
Composition root. Receives doctor identity as PROPS from `app/dashboard/layout.tsx`. Server-side fetch (in `dashboard/layout.tsx:23-36`) joins `doctor_profiles` × `specialties` × `profiles`. Currently consumes only `doctorName`, `email`, `avatarUrl`, `specialtyName`. **Capability data could be added to the server fetch and threaded as props with no architecture change.**

### `apps/medico/web/src/components/shell/desktop-sidebar.tsx`, `mobile-sidebar-sheet.tsx`, `mobile-bottom-nav.tsx`
Render `NAV_GROUPS` from `nav-data.ts`. The data shape is `NavGroupData` (groups → items with key/label/href/icon/badge?) defined in `shell/types.ts`. **The render layer is decoupled from the data; replacing the source is a 1-prop change.**

### `apps/medico/web/src/lib/specialties/__tests__/*` (4 test files)
- `config-registry.test.ts` — asserts 132 configs generated, covers override merge logic.
- `detector.test.ts`, `identity-system.test.ts`, `kpi-resolver.test.ts` — touch the rest of the system.
- ALL EXCLUDED from vitest in `vitest.config.ts:23`. Comment says *"reference schema/data that has since drifted (mv_doctor_* aggregate views renamed)"*. Confirmed status: dormant since the medico-shell-sanvia change.

### `packages/types/src/module.ts` (502 LOC)
Defines the **strict** `ModuleDefinition` contract: `ModuleContextContract` (requiredContextKeys, optionalContextKeys, dataRequirements, allowedRoles, permissions, minimumVerification, compatibleSpecialties, compatibleCategories, requiredCapabilities, optionalCapabilities, supportedPlatforms), `RuntimeCapability` enum (`webgl|camera|microphone|geolocation|notifications|offline|bluetooth|print|file-system|clipboard|speech|websocket|indexeddb`), `VerificationLevel` enum (`none|email|profile|sacs|license|board_certified`), `ModuleGroup` enum (`clinical|financial|lab|technology|communication|growth|administrative|education`), `ModuleLifecycleStatus` enum, and a `DoctorModulePreference` mirror of the DB row (lines 486–502).
- This is the **authoritative module shape**, but NO MODULE INSTANCES exist anywhere — it's a designed-but-unused contract. Override files use a SIMPLER `SpecialtyModule` shape (`packages/types/src/specialty.ts:24-49`).
- **DECISION INPUT**: `ModuleDefinition` is much richer than `SpecialtyModule`. Fase 2 should pick which one to use.

### `packages/types/src/specialty.ts`
Defines `SpecialtyConfig`, `SpecialtyModule` (used by overrides), `SpecialtyCategory`. `SpecialtyConfig.modules` has hardcoded group keys (`clinical|financial|lab|technology|communication|growth|administrative|education`). This is what overrides build against.

### `apps/medico/web/src/lib/specialty-experience/engine.ts`
A SECOND `getSpecialtyExperienceConfig` entry point exists at line 201 — older "engine.ts" that the README warns against. The current canonical export lives in `lib/specialties/index.ts`. **Cleanup target**: confirm that `lib/specialty-experience/` is dead.

## SACS flow today

### Wizard onboarding (`apps/medico/web/src/components/onboarding/registration-steps.tsx`, 600+ LOC)
1. Step "Personal" (lines 30–56): collects fullName, email, password, cedula (`V|E-\d{6,10}`), phone.
2. Step "Professional": licenseNumber, specialtyId (manual selection from a dropdown), subSpecialties[], yearsExperience, languages[].
3. Step "Verification": calls `verifySACSDoctor(cedula)` from `lib/services/doctor-verification-service`.
4. On submit (line 320+): creates auth user → upserts `doctor_profiles` with `specialty_id` (the manually chosen one!) + `sacs_verified` + `sacs_data` (the full SACS payload) + `dashboard_config: { modules: selectedModules, theme }`.
5. **BROKEN write** (line 351): tries to insert into `doctor_module_preferences` with non-existent columns `specialty_id`, `enabled_modules`, `updated_at`. Silently fails per the `// Non-blocking` comment. Hence empty table.

### SACS service (`services/sacs-verification/index.js`, ~864 LOC)
- POST `/verify` body: `{ cedula: string, tipo_documento?: 'V'|'E' }` (line 749).
- Response shape (verified by sample row above):
  ```jsonc
  {
    "success": true,
    "verified": true,
    "data": {
      "cedula": "9269229",
      "tipo_documento": "V",
      "nombre_completo": "JOSE GREGORIO MONTILLA HERNANDEZ",
      "matricula_principal": "MPPS-45164",
      "profesion_principal": "MÉDICO(A) CIRUJANO(A)",
      "especialidad_display": "UROLOGÍA",
      "es_medico_humano": true,
      "es_veterinario": false,
      "tiene_postgrados": true,
      "apto_red_salud": true,
      "profesiones": [
        { "matricula": "MPPS-45164", "profesion": "MÉDICO(A) CIRUJANO(A)", "tomo": "57", "folio": "150", "fecha_registro": "1993-10-05", "tiene_postgrado_btn": true }
      ],
      "postgrados": [
        { "postgrado": "UROLOGÍA", "tomo": "1", "folio": "51", "fecha_registro": "2003-04-29" }
      ],
      "datos_completos_sacs": { /* duplicated postgrados+profesiones for raw audit */ }
    },
    "meta": { "ms": 0, "cached": true, "queue": {...} },
    "message": "Verificación exitosa. Profesional de salud humana registrado en el SACS."
  }
  ```
- Cache TTL 6h (`SACS_CACHE_TTL_MS`). FIFO concurrency queue (1 active, 25 max queued). Hard timeout 2m30s. Validates `\d{6,10}` cedulas only.

### Real test data confirms postgrado richness
| Doctor | specialty_id | profesion_principal | postgrados |
|---|---|---|---|
| medico5 (José Montilla) | `uro-1` | MÉDICO(A) CIRUJANO(A) | UROLOGÍA |
| medico4 (Karim Moukhallalele) | `inf-1` | MÉDICO(A) CIRUJANO(A) | INFECTOLOGÍA PEDIÁTRICA, PEDIATRÍA Y PUERICULTURA |
| medico3 (Marlin Sánchez) | `gen-4` (Med. Interna) | MÉDICO(A) CIRUJANO(A) | ESPECIALISTA EN MEDICINA INTERNA, MEDICINA CRÍTICA |
| medico2 (Marianella Suárez) | `gen-1` (Med. General) | MÉDICO(A) CIRUJANO(A) | (none) |
| medico1 | `gen-1` (manual) | n/a | n/a (cédula not in SACS) |

**Two doctors have multiple postgrados**, validating the matrix-of-capabilities premise. medico4 contradicts the "what we know" assumption (it was logged as Infectología; SACS actually says Infectología Pediátrica + Pediatría — a TWO-postgrado profile). The current `specialty_id = inf-1` is a flat single-row link that loses this information.

## Module classification (proposal for Fase 2 MVP)

> Naming convention proposed: kebab-case, prefixed by domain. These are CONCEPT keys, not file paths.

### Always-on (any verified doctor — verification_level >= 'sacs' OR 'license')

Eight rock-bottom modules that every individual practitioner needs. These are the "Principal" group of the new sidebar.

- `inicio` — dashboard home (already implemented in `app/dashboard/page.tsx`)
- `agenda` — schedule/calendar (`app/dashboard/agenda/`)
- `pacientes` — roster (`app/dashboard/pacientes/`)
- `consulta-soap` — generic SOAP consultation flow (`app/dashboard/consulta/`)
- `recetas` — prescriptions with digital signature (`app/dashboard/recetas/`)
- `mensajes` — patient messaging (`app/dashboard/mensajes/`)
- `historia-clinica` — medical record viewer per patient
- `verificacion` — current SACS status panel (already in nav-data.ts as "Próximamente")

### Specialty-base modules (one bucket per real test specialty)

Drawn from `module-registry.ts` (real implemented components) + the relevant override file's `clinical[]` group, filtered to remove clinic-org noise (no `cardio-facturacion`, no `dental-rcm`, no `cardio-portal-paciente`).

| Specialty (test users) | specialty_id | Suggested modules (in addition to "Always-on") |
|---|---|---|
| Medicina General | `gen-1` | `chronic-mgmt`, `preventive-screening`, `vaccinations`, `lab-orders`, `referrals`, `family-history`, `calculators`, `guides` (8 modules; 6 from `medicina-general.ts:clinical` survive the filter, plus `lab-orders` from registry, plus `calculators` and `guides` from `technology` group) |
| Medicina Interna | `gen-4` | `chronic-mgmt`, `lab-orders`, `diagnostic-imaging`, `clinical-templates`, `referrals`, `treatment-plans` |
| Infectología (or Infect. Pediátrica) | `inf-1` | `lab-orders`, `diagnostic-imaging`, `clinical-templates`, `vaccinations`, `referrals`, `infectious-disease-tracker` (no implemented module yet — flag) |
| Urología | `uro-1` | `lab-orders`, `diagnostic-imaging`, `clinical-templates`, `referrals`, `urology-procedures` (placeholder — no implemented module) |
| Cardiología | `car-1` (no test doctor, but anchor) | `cardiology-ecg` (registered), `lab-orders`, `diagnostic-imaging`, `clinical-templates`, `treatment-plans`, `cardio-stress-test` (override-only, no component yet), `cardio-holter` (override-only, no component yet) |

Note: Several override-defined module keys (e.g. `cardio-stress-test`, `cardio-holter`, `cardio-echo`) do NOT have a registered React component in `module-registry.ts`. Fase 2 must decide whether to ship them as "stubs with Próximamente badge" or omit until UI is built.

### Postgrado / cert add-ons (illustrative)

Drawn from postgrado strings observed in test data + plausible mappings:

- **`PEDIATRÍA Y PUERICULTURA`** → adds `pediatrics-growth-curves`, `pediatrics-vaccination` (registered components exist).
- **`INFECTOLOGÍA PEDIÁTRICA`** → adds the same pediatrics modules ABOVE the infectología base (rationale: pediatric-specialized infectólogo needs growth curves and vaccinations).
- **`MEDICINA CRÍTICA`** → adds `vital-signs-monitoring` (no implemented component yet), `treatment-plans` already in base.
- **`UROLOGÍA`** → would map to `uro-1` specialty_id directly (no extra postgrado-only modules at MVP).
- **`ESPECIALISTA EN MEDICINA INTERNA`** → maps `specialty_id = gen-4` directly. Postgrado adds nothing extra at MVP.

The proposal phase will need to decide: (a) does the postgrado override the primary specialty (e.g. `medico4` would resolve to `infectologia-pediatrica` rather than `inf-1` Infectología) or (b) does it ADD modules to the primary base (the matrix Option C)? The "what we know" section confirmed Option C — UNION of capabilities → modules.

### Premium / plan-gated (out of scope for Fase 2 MVP)

Reserve a `min_plan` field on each module entry (mirroring `module_catalog.min_plan` enum: `starter | professional | enterprise`). Modules likely to land in plans:

- `ai-diagnostic-assist` (Gemini ICD-11 already has plumbing)
- `telemedicine-advanced` (today only `telemedicine-video` is in the registry)
- `practice-analytics` (today simple `estadisticas` page is free)
- `multi-office` (allow doctor to manage 2+ consultorios — borderline, not "individual practice" anymore)
- `wound-care`, `oncology-staging`, `audiometry-test`, `spirometry-test` — currently registered components; could be metered.

## Matrix design sketch

### Schema proposal — option A: NEW table `specialty_modules`

```text
specialty_modules (
  id              uuid PK
  specialty_slug  text NOT NULL  REFERENCES specialties(slug)
  module_key      text NOT NULL  -- matches a module-registry.ts key OR a route-only key
  is_default      bool NOT NULL DEFAULT true   -- on by default for this specialty
  display_group   text NOT NULL                -- e.g. 'clinica', 'recetas', 'analisis', 'admin'
  display_order   int NOT NULL DEFAULT 100
  min_verification verification_level NOT NULL DEFAULT 'sacs'
  min_plan        plan_tier NOT NULL DEFAULT 'starter'
  created_at      timestamptz NOT NULL DEFAULT now()
  UNIQUE (specialty_slug, module_key)
)
```

### Schema proposal — option B: NEW table `module_capabilities` keyed by capability source

```text
capability_modules (
  id              uuid PK
  source_type     text NOT NULL      -- 'always-on' | 'specialty' | 'postgrado' | 'cert' | 'plan'
  source_value    text NOT NULL      -- e.g. 'gen-1' (specialty_id), 'PEDIATRÍA Y PUERICULTURA' (postgrado), or '*'
  module_key      text NOT NULL
  display_group   text NOT NULL
  display_order   int NOT NULL DEFAULT 100
  min_verification verification_level NOT NULL DEFAULT 'sacs'
  min_plan        plan_tier NOT NULL DEFAULT 'starter'
  UNIQUE (source_type, source_value, module_key)
)
```

Option B is more flexible (handles postgrado and cert add-ons natively) but more rows. Option A is simpler but needs a SECOND table for postgrado add-ons. Open question for proposal phase.

### Resolver function

```text
resolveDoctorModules(doctorId: uuid) → ModuleResolution
  1. Read doctor_profiles{specialty_id, sacs_data, sacs_verified, certifications}
  2. Extract capabilities:
     - always-on:    if sacs_verified, include source('always-on','*')
     - specialty:    include source('specialty', specialty_id)
     - postgrados:   for each sacs_data.data.postgrados[].postgrado, include source('postgrado', NORMALIZED)
     - certs:        for each certifications[], include source('cert', NORMALIZED) (out of scope MVP)
  3. UNION query against capability_modules WHERE (source_type, source_value) ∈ caps[]
  4. Read doctor_module_preferences for this doctor → apply user override:
     - is_enabled=false  → drop the row
     - custom_order      → override display_order
     - pinned_to_dashboard → mark for dashboard widgets
     - custom_settings   → forward to module
  5. Group by display_group, sort by display_order, return:
     {
       groups: [{ key, label, items: [{ moduleKey, label, icon, route, badge?, pinned }] }],
       resolvedAt: timestamp,
       caps: { always: bool, specialty: string, postgrados: string[], certs: string[] }
     }
```

Postgrado normalization is the gnarly part — SACS strings like `INFECTOLOGÍA PEDIÁTRICA` need a stable mapping table (`postgrado_module_mapping` or rows in `capability_modules` with normalized strings). Existing infrastructure: the empty `sacs_specialty_mapping` table could be reused or kept for the specialty side and a new `sacs_postgrado_mapping` table added.

### Sidebar consumption — Server vs Client split

**Recommended**: thin server fetch in `app/dashboard/layout.tsx`, full resolver runs server-side, result is THREADED AS PROPS to `DashboardShell`.

- `app/dashboard/layout.tsx` already does `supabase.from('doctor_profiles').select(...)` server-side. Extend it to call `resolveDoctorModules(user.id)` and pass `navGroups: NavGroupData[]` to `DashboardShell`.
- `DashboardShell` becomes capability-aware via PROPS only — no client-side fetch needed for the FIRST render.
- `desktop-sidebar.tsx`, `mobile-sidebar-sheet.tsx`, `mobile-bottom-nav.tsx` continue to render whatever `NavGroupData[]` they're given. Zero render-layer changes.
- The CLIENT-side `useDoctorCapabilities()` hook (mentioned in the brief) is only needed if we want LIVE re-resolution after the user toggles a module on/off via a settings page. For MVP, server-side resolution is enough.

### Caching strategy

- Server-side: `unstable_cache` from Next.js OR `cache()` (RSC `cache`) keyed by `(doctorId, specialty_id, sacs_verified, postgrados_hash)`. TTL 5 min, invalidate on `doctor_module_preferences` update via `revalidateTag`.
- Client-side (only for live updates): TanStack React Query with `queryKey: ['doctor-capabilities', doctorId]`, `staleTime: 5*60*1000`, `gcTime: 30*60*1000`. Invalidated by mutations to `doctor_module_preferences`.
- DB-side: index `capability_modules(source_type, source_value)` and `doctor_module_preferences(doctor_id)`. RLS: doctor reads own preferences; capability_modules is publicly readable (it's a catalog).

## Cleanup zone for Fase 2

Aggressive but reversible. Each item flagged with confidence (HIGH = safe to drop / LOW = needs proposal-phase decision).

### Source files
- **HIGH** `apps/medico/web/src/lib/specialty-experience/engine.ts` — older duplicate of `getSpecialtyExperienceConfig`. README explicitly warns against. Verify zero consumers and DELETE.
- **MEDIUM** `apps/medico/web/src/lib/specialties/index.ts:160` `getSpecialtyMenuGroups` — the "consumer-less" function from the prompt. Confirm with grep; if truly dormant, DELETE export. If consumers exist (they don't per my grep), repurpose for matrix.
- **MEDIUM** `apps/medico/web/src/lib/specialties/configs/overrides/*.ts` — 132 specialty override files. The CLINIC-ORG modules they declare (`*-facturacion`, `*-seguros`, `*-rcm`, `*-portal-paciente`, `*-pacs`) have to go. The PRACTICE-LEVEL constants (`PREVENTIVE_SCREENING_PROTOCOLS`, `REFERRAL_CRITERIA`, `ADULT_VACCINATION_SCHEDULE` in `medicina-general.ts`) are GOLD and must be preserved — recommend extracting to `packages/core/src/specialty-domain-data/` or `apps/medico/web/src/lib/specialty-domain/` BEFORE deleting the override files.
- **MEDIUM** `apps/medico/web/src/components/onboarding/registration-steps.tsx:351-360` — broken write to `doctor_module_preferences` with wrong columns. Either fix to use the real schema OR remove until the matrix engine is in place.
- **HIGH** `apps/medico/web/src/lib/specialties/__tests__/*` — dormant tests, schema-drifted, excluded from vitest. **DELETE** outright; whatever Fase 2 builds will need fresh tests against the new shape.
- **LOW** Re-exports in `lib/specialties/index.ts` of `dentalConfig`, `cardiologyConfig`, `pediatricsConfig` (lines 67–74, marked `@deprecated`). Check consumers before dropping.

### DB rows / triggers
- **DO NOT DELETE** `module_catalog` (used by `apps/clinica/web/`). Just don't read from it in medico's resolver.
- **CONSIDER FIXING** the typo in `specialties.id='gin-2'` `category='gin\n\neco'` → `'gineco'`. Tiny migration. Out of scope strictly, but a 1-line fix.
- **CONSIDER REMOVING** the duplicate `trg_auto_resolve_doctor_specialty` triggers (BEFORE INSERT and BEFORE UPDATE — same trigger name appearing twice in `information_schema.triggers` looks like a leftover). Inspect with `\d doctor_profiles` then decide.
- **DO NOT** delete `sacs_specialty_mapping` — it's the table the SACS-→-slug resolver function reads. Fase 2 should SEED it.

### Tests
- Phase 1 shell tests in `apps/medico/web/src/components/shell/*.test.tsx` are KEEP. Phase 2 will need its own resolver + capability matrix tests.

## Out of scope for Fase 2

- `offline_patients` (Fase 3)
- Consultation single-page UI (Fase 4)
- Bandeja de pacientes hoy (Fase 5)
- Premium tier gating UI (later — but the `min_plan` column in the schema should be planned for)
- Multi-office support
- Cross-specialty AI suggestion ("doctor X has these modules on, you might want them too")
- Migration of `apps/clinica/web/` to the same matrix
- Re-introducing the 132 override files in their CURRENT shape
- Fixing the broken `doctor_module_preferences` write in `registration-steps.tsx` (separate bug-fix change)

## Open questions (drives sdd-propose)

> These are decisions the user needs to make before sdd-propose can lock the design.

1. **Matrix storage**: New table `specialty_modules` (option A, simpler), new table `capability_modules` (option B, supports postgrado/cert directly), reuse `doctor_module_preferences` only (matrix lives in TS code), or hardcoded TS file? **Recommendation**: option B in DB, seed via migration, runtime override via `doctor_module_preferences`.

2. **Module definition shape**: Use the rich `ModuleDefinition` from `packages/types/src/module.ts` (with strict `ModuleContextContract`, RBAC, capabilities), or use the simpler `SpecialtyModule` from `packages/types/src/specialty.ts`? **Recommendation**: introduce a NEW `MedicoModule` shape that's simpler than `ModuleDefinition` but explicit about `route`, `icon`, `displayGroup`, `minVerification`. Migrate to `ModuleDefinition` later when we need RBAC enforcement.

3. **Identifier scheme**: Module identifiers as human-readable strings (`consulta-soap`, `cardiology-ecg`) or UUIDs? **Recommendation**: stable strings for the matrix table — they read better in SQL and are stable across migrations. UUIDs only for `doctor_module_preferences.id`.

4. **Sidebar group taxonomy**: Hardcoded sections (Clínica · Análisis · Recetas · Comunicación · Admin) where modules drop in via a `displayGroup` field? Or fully data-driven groups defined in the matrix? **Recommendation**: hardcoded MAJOR groups (5–6 of them — Clínica, Análisis, Comunicación, Crecimiento, Configuración) with `displayGroup` referencing them. Keeps UX consistent across specialties.

5. **Module-level UI**: Each module = one route + one icon + one label, OR rich (sub-routes, nested modules, badges, custom settings UI)? **Recommendation**: simple shape for Fase 2 MVP. Sub-routes / nesting is Fase 3+.

6. **What happens with manual mode (medico1 — cédula NOT in SACS)?** Treat as `verification_level=email` with the always-on bundle only (no specialty modules)? Or trust the manually entered `specialty_id` and grant the same modules a SACS-verified doctor would get for that specialty? **Recommendation**: for Fase 2, trust manual entry + warn via banner. RBAC enforcement (real `verification_level` check) is a later concern.

7. **Postgrado normalization**: Hardcoded mapping in TS? Seed `sacs_postgrado_mapping` table? Use AI/keyword matching at query time? **Recommendation**: small seed table, ~50 rows for top postgrados. Anything unmatched falls through to "specialty base modules only".

8. **Where does the existing 132 override-file domain data live after cleanup?** Specifically the `PREVENTIVE_SCREENING_PROTOCOLS`, `REFERRAL_CRITERIA`, vaccination schedules in `medicina-general.ts`. These are valuable. **Recommendation**: extract to `packages/core/src/clinical-data/{specialty-slug}.ts` so any app (medico, secretaria) can use them.

9. **Scope of "module" in Fase 2**: Does the matrix only feed the SIDEBAR, or does it ALSO feed the dashboard widgets and the `/dashboard/modulos/[moduleKey]` route? **Recommendation**: just sidebar + dashboard quick-link list for Fase 2. The `/modulos/[key]` page and widget grid are separate consumers wired up incrementally.

10. **What to do with `apps/medico/web/src/components/modules/<specialty>/`** — the actual implemented React modules? They EXIST but are wired in via `module-registry.ts` and called only via the override files' `componentPath`. After cleanup, the new sidebar will need to know which `componentPath` to use per `module_key`. **Recommendation**: keep `module-registry.ts` AS-IS, treat it as the lazy-loaded component lookup. The new matrix references its keys. `componentPath` field disappears from individual modules — the registry IS the path.

## Risks

- **R1**: Deleting the 132 override files without first extracting domain data (screening protocols, vaccination schedules) loses Spanish-localized clinical reference data. MITIGATION: extraction step in Fase 2 task list.
- **R2**: The empty `sacs_specialty_mapping` table means the DB-side trigger never resolves anything. We've been relying on the wizard's manual selection. If Fase 2 adds an admin-led "auto-fill specialty" feature, we'll need to seed this table. MITIGATION: seed the top 30 postgrados/specialties as part of Fase 2 migrations.
- **R3**: The `doctor_module_preferences` insert in `registration-steps.tsx` is broken AND that file is NOT in this change's scope. Risk: Fase 2 ships with the wizard still silently failing. MITIGATION: file an issue + add a note in Fase 2's verify report.
- **R4**: `module-registry.ts` has 22 components but the override files reference ~50+ unique module keys. Many are "phantom modules" (override declares them, no component exists). Resolver needs to gracefully degrade ("module exists in matrix but no component" → render placeholder OR omit). MITIGATION: `isModuleRegistered()` check in the resolver step.
- **R5**: Two duplicate triggers `trg_auto_resolve_doctor_specialty` on `doctor_profiles` could cause double-resolution and surprising overwrites. MITIGATION: investigate before any DB migration in Fase 2.
- **R6**: 16 paciente/farmacia users have rows in `user_modules` (160 rows). Touching the `module_*` tables anywhere in DB land risks affecting their UX. MITIGATION: namespace the new medico table clearly (`medico_capability_*` or `doctor_capability_*`).
- **R7**: The `category` typo (`"gin\n\neco"` for `gin-2` Obstetricia) will break any `GROUP BY category` query. MITIGATION: trivial fix included in Fase 2 migration.
- **R8**: Server-side resolver in `dashboard/layout.tsx` adds DB latency to every dashboard page render. MITIGATION: cache via Next.js `unstable_cache` keyed on doctor_id, invalidated on preference write.
- **R9**: The "what we know" section had two stale claims (`verificaciones_sacs` table — doesn't exist, `getSpecialtyMenuGroups` consumer-less — actually still exported but no consumers). FLAGGED in this doc; proposal must verify against current main branch before locking.

## Summary table — current state vs Fase 2 target

| Aspect | Today | Fase 2 target |
|---|---|---|
| Sidebar source | `nav-data.ts` static | `resolveDoctorModules(user.id)` server-side |
| Module catalog | `module_catalog` (clinic-org), 21 rows | New `capability_modules` table, ~50–80 rows seeded |
| Module shape | `SpecialtyModule` in 132 override files | `MedicoModule` shape, simpler, lives in matrix table |
| Resolver | DB trigger (broken — empty mapping) | TS function in `lib/capabilities/resolver.ts` |
| Doctor prefs | `doctor_module_preferences` (broken writes, 0 rows) | Fix schema use, seed defaults on first login |
| SACS data flow | Wizard → `doctor_profiles.sacs_data` only | Plus extract + persist to `sacs_verifications` (table EXISTS, EMPTY) |
| Postgrado handling | Stored in JSONB, never read by app | Read by resolver, mapped to module add-ons |
| Override files | 132 files, ~40k LOC, half clinic-org | Extracted clinical data → `packages/core`; sidebar overrides DELETED |
| Test coverage | Excluded as "schema-drifted" | New tests against the resolver and matrix |
