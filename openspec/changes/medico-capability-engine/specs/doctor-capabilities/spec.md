# doctor-capabilities Specification

## Purpose

How an authenticated doctor's accessible modules are resolved from SACS data, applied as sidebar groups and dashboard quick-links, and overridden by per-doctor preferences.

## Requirements

### Requirement: Capability source UNION

The resolver MUST compute accessible modules as the UNION of rows in `capability_modules` matching: `always-on`, doctor's `specialty`, each `postgrado` from `sacs_data`, each `cert`, and current `plan` tier. Duplicate `module_key` across sources MUST appear once.

#### Scenario: Specialty + multiple postgrados

- GIVEN doctor `specialty_id='inf-1'`, postgrados=`['INFECTOLOGÍA PEDIÁTRICA','PEDIATRÍA Y PUERICULTURA']`
- WHEN resolver runs
- THEN result MUST contain UNION of `always-on` + `specialty:inf-1` + `postgrado:infectologia-pediatrica` + `postgrado:pediatria` rows, deduplicated by module_key

#### Scenario: Specialty with no postgrados

- GIVEN doctor `specialty_id='gen-1'`, postgrados=[]
- WHEN resolver runs
- THEN result MUST contain UNION of `always-on` + `specialty:gen-1` only

### Requirement: Per-doctor preference overrides

The resolver MUST apply `doctor_module_preferences` rows on top of resolved modules, supporting disable, reorder, and dashboard pin.

#### Scenario: Disabled module

- GIVEN resolved module `lab-orders` and a preference row `is_enabled=false`
- WHEN resolver runs
- THEN result MUST NOT include `lab-orders`

#### Scenario: Custom order

- GIVEN resolved modules `[recetas, lab-orders, mensajes]` with preference `custom_order` `[10, 5, 20]`
- WHEN resolver runs
- THEN final order MUST be `[lab-orders, recetas, mensajes]`

#### Scenario: Pinned to dashboard

- GIVEN resolved module `chronic-mgmt` with preference `pinned_to_dashboard=true`
- WHEN resolver returns
- THEN that module's entry MUST have `pinned=true`

### Requirement: Manual-mode fallback

The resolver MUST handle doctors with `sacs_verified=false` by trusting the manually entered `specialty_id` and flagging `verification_pending=true`.

#### Scenario: Manual doctor (medico1 case)

- GIVEN doctor `sacs_verified=false`, manual `specialty_id='gen-1'`
- WHEN resolver runs
- THEN result MUST include `always-on` + `specialty:gen-1`
- AND `verification_pending=true` MUST be set on output

### Requirement: Postgrado normalization

The resolver MUST normalize raw SACS postgrado strings via `sacs_postgrado_mapping`. Unmapped strings MUST NOT block resolution.

#### Scenario: Mapped postgrado

- GIVEN raw string `'INFECTOLOGÍA PEDIÁTRICA'` mapped to slug `infectologia-pediatrica`
- WHEN resolver normalizes
- THEN it MUST query `capability_modules WHERE source_type='postgrado' AND source_value='infectologia-pediatrica'`

#### Scenario: Unmapped postgrado

- GIVEN raw string with no mapping row
- WHEN resolver normalizes
- THEN it MUST skip without error and log the unmapped string for ops review

### Requirement: Sidebar consumption

The sidebar MUST group resolved modules by `display_group` into 5 hardcoded groups: Clínica, Análisis, Comunicación, Crecimiento, Configuración. Empty groups MUST be omitted.

#### Scenario: Modules across multiple groups

- GIVEN resolved modules with display_group `'Clínica'`, `'Análisis'`, `'Comunicación'`
- WHEN sidebar renders
- THEN three group sections MUST display in order Clínica → Análisis → Comunicación
- AND empty groups MUST NOT render

### Requirement: Server-side first-paint

Resolution MUST run server-side during the dashboard layout render. Client-side fetching for first paint is NOT permitted.

#### Scenario: First-paint render

- GIVEN authenticated doctor accessing `/dashboard`
- WHEN dashboard layout renders
- THEN resolver MUST execute on server before HTML send
- AND shell MUST receive `navGroups` as prop, not client fetch

### Requirement: Resolution cache

The system SHOULD cache resolver output keyed by `(doctorId, sacs_hash)` with 5-minute TTL. The cache MUST invalidate on `doctor_module_preferences` write or SACS re-verify.

#### Scenario: Cache hit

- GIVEN cached resolver result within TTL
- WHEN second dashboard request arrives
- THEN resolver MUST return cached result without querying `capability_modules`

#### Scenario: Cache invalidation on preference write

- GIVEN cached resolver result
- WHEN `doctor_module_preferences` row INSERT/UPDATE fires for that doctor
- THEN cache entry MUST be invalidated before the next dashboard render

### Requirement: Missing component graceful degrade

A `module_key` present in `capability_modules` but missing from `module-registry.ts` MUST NOT crash the sidebar.

#### Scenario: Module without component

- GIVEN resolved module with `module_key='surgical-checklist'`, `isModuleRegistered()===false`
- WHEN sidebar renders entry
- THEN entry MUST render with `'Próximamente'` badge
- AND navigation to `/dashboard/modulos/[moduleKey]` MUST render a placeholder, not crash
