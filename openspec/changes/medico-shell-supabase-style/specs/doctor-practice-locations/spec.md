# doctor-practice-locations Specification

## Purpose

Multi-sede management for a doctor's private practice with active-sede tracking and RLS isolation.

## Requirements

### Requirement: Schema integrity

The `doctor_practice_locations` table MUST have columns: `id uuid primary key`, `doctor_id uuid not null references profiles`, `name text not null`, `address text`, `is_primary boolean default false`, `active boolean default true`, `created_at timestamptz`, `updated_at timestamptz`.

#### Scenario: Migration applied

- GIVEN the migration has run
- WHEN `pg_dump --schema-only` is inspected
- THEN every required column MUST exist with the declared type and default

#### Scenario: Missing name rejected

- GIVEN an INSERT statement omits `name`
- WHEN it runs
- THEN Postgres MUST reject it with a not-null violation

### Requirement: RLS isolation

A doctor MUST only SELECT, INSERT, UPDATE, or DELETE rows where `doctor_id = auth.uid()`.

#### Scenario: Owner reads own row

- GIVEN doctor A authenticated and a row with `doctor_id = A`
- WHEN doctor A queries the table
- THEN the row MUST be returned

#### Scenario: Cross-doctor read blocked

- GIVEN doctor A authenticated and a row with `doctor_id = B`
- WHEN doctor A queries the table
- THEN the row MUST be filtered out by RLS

### Requirement: At-most-one primary

A doctor MAY have zero or one row with `is_primary=true`. Any INSERT or UPDATE that would create a second primary row for the same doctor SHALL fail.

#### Scenario: Promote second sede to primary

- GIVEN doctor A already has sede X marked primary
- WHEN doctor A tries to UPDATE sede Y `is_primary=true`
- THEN the operation MUST either fail or atomically demote X first via constraint or trigger

#### Scenario: First sede defaults non-primary

- GIVEN doctor A has no sedes
- WHEN doctor A INSERTs sede X without setting is_primary
- THEN the row MUST persist with `is_primary=false`

### Requirement: Active-sede default

When a doctor logs in, the system SHALL pick the `is_primary=true` row as the active sede; if none exists, the most recently created `active=true` row SHALL be chosen.

#### Scenario: Primary present

- GIVEN doctor A has sede X with `is_primary=true`
- WHEN doctor A logs in
- THEN the active sede MUST be X

#### Scenario: No primary

- GIVEN doctor A has 2 active sedes and none flagged primary
- WHEN doctor A logs in
- THEN the active sede MUST be the most recently created one

### Requirement: Sede swap persistence

When the user changes the active sede via the picker, the system MUST persist an `active_sede_id` cookie scoped to the medico subdomain with a 30-day expiry.

#### Scenario: Swap from picker

- GIVEN active sede is X
- WHEN the doctor selects sede Y from the picker
- THEN cookie `active_sede_id` MUST equal Y with `Max-Age=2592000` and scoped to the medico host

#### Scenario: Cookie restored next session

- GIVEN cookie `active_sede_id=Y` is present
- WHEN the doctor reopens `/dashboard`
- THEN active sede MUST be Y without re-prompting

### Requirement: Deletion guard

When a sede has linked appointments, DELETE SHALL be blocked with an error; the UI SHOULD offer a reassign-then-delete flow.

#### Scenario: Delete blocked

- GIVEN sede X has 5 appointments referencing it
- WHEN the doctor attempts DELETE on X
- THEN the operation MUST fail with a referential-integrity error

#### Scenario: Reassign then delete

- GIVEN sede X has appointments and sede Y exists
- WHEN the doctor reassigns appointments to Y then deletes X
- THEN the DELETE MUST succeed

### Requirement: Management page

The route `/dashboard/sedes` MUST list all sedes for the authenticated doctor and offer create, edit, and delete actions; primary toggle SHALL be radio-style across the list.

#### Scenario: List render

- GIVEN doctor A has 3 sedes
- WHEN `/dashboard/sedes` renders
- THEN exactly 3 rows MUST display with create, edit, delete actions

#### Scenario: Primary toggle radio behavior

- GIVEN doctor A toggles sede Y to primary while sede X is currently primary
- WHEN the change persists
- THEN sede X MUST become non-primary and sede Y MUST become primary in a single transaction
