# command-palette-medico Specification

## Purpose

Global `Ctrl+K` palette for medico/web with search across patients, modules, and appointments.

## Requirements

### Requirement: Keyboard trigger

The palette MUST respond to `Ctrl+K` on Windows/Linux and `Cmd+K` on macOS from any route under `/dashboard`.

#### Scenario: Open from any dashboard route

- GIVEN the doctor is on `/dashboard/recetas`
- WHEN they press `Ctrl+K`
- THEN the palette MUST open and focus its input

#### Scenario: Trigger ignored outside dashboard

- GIVEN the doctor is on `/login`
- WHEN they press `Ctrl+K`
- THEN the palette MUST NOT open

### Requirement: Search domains

The palette SHALL search across: patients by `full_name` or `national_id`, module names from `module-catalog`, and appointments scheduled within +/-30 days of today.

#### Scenario: Patient match by national_id

- GIVEN a patient `V-12345678` exists for doctor A
- WHEN doctor A types `12345678` in the palette
- THEN that patient entry MUST appear under the Patients group

#### Scenario: Module match by name

- GIVEN module catalog includes `Recetas`
- WHEN the doctor types `rec`
- THEN module `Recetas` MUST appear under the Modules group

### Requirement: Result grouping

Results MUST be grouped by type with section headers `Pacientes`, `Modulos`, `Citas`.

#### Scenario: Mixed result set

- GIVEN a query that matches 2 patients, 1 module, and 1 appointment
- WHEN results render
- THEN three section headers MUST display with their respective entries

#### Scenario: Empty group hidden

- GIVEN a query matches only patients
- WHEN results render
- THEN the `Modulos` and `Citas` headers MUST NOT render

### Requirement: Keyboard navigation

Arrow keys SHALL navigate, Enter SHALL select the focused entry, Esc SHALL close the palette.

#### Scenario: Arrow + Enter selection

- GIVEN the palette shows 3 entries with the first focused
- WHEN the doctor presses ArrowDown then Enter
- THEN the second entry MUST be activated and the palette MUST close

#### Scenario: Esc closes

- GIVEN the palette is open
- WHEN the doctor presses Esc
- THEN the palette MUST close and previous focus MUST be restored

### Requirement: Performance

Results SHOULD render in under 200ms for queries served from the TanStack Query cache.

#### Scenario: Cached query under budget

- GIVEN patient list and module catalog are warm in cache
- WHEN the doctor types a 3-char query
- THEN the first result paint MUST occur within 200ms in 95th percentile

#### Scenario: Cold cache acceptable

- GIVEN the cache is cold
- WHEN the doctor types a 3-char query
- THEN a loading state MAY appear and results MUST arrive without blocking input

### Requirement: Empty state

When the query has no matches, the palette MUST show a `Sin resultados` message and a hint suggesting full-text search or filters.

#### Scenario: No matches

- GIVEN the doctor types `zzzz`
- WHEN no results are found
- THEN the palette MUST render `Sin resultados` plus a hint string

#### Scenario: Blank input

- GIVEN the palette just opened with empty input
- WHEN no characters are typed
- THEN the palette MAY show recent items or remain blank but MUST NOT show `Sin resultados`

### Requirement: Query clearing

When the palette closes, the search query MUST be cleared from in-memory state.

#### Scenario: Close clears query

- GIVEN the doctor typed `Lopez` and closes the palette with Esc
- WHEN the palette reopens
- THEN the input MUST be empty

#### Scenario: No persistence across sessions

- GIVEN the doctor typed a query and refreshes the page
- WHEN the palette reopens
- THEN no query history MUST persist
