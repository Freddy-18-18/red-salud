# app-shell-medico Specification

## Purpose

Supabase-style shell for `medico/web` — icon-only collapsed sidebar plus global header with breadcrumbs and a 4-action cluster.

## Requirements

### Requirement: Sidebar default collapsed state

The sidebar MUST render at 48px width on desktop viewports >=1024px at first paint.

#### Scenario: Desktop first paint

- GIVEN a doctor lands on `/dashboard` at viewport width 1440px
- WHEN the shell mounts
- THEN sidebar width MUST equal 48px and labels MUST be hidden

#### Scenario: User-expanded preference

- GIVEN the doctor toggled sidebar to expanded last session
- WHEN they land on `/dashboard` again
- THEN sidebar MAY restore the expanded state from persisted preference

### Requirement: Tooltip on hover when collapsed

The sidebar MUST render a Radix `Tooltip` with the module label on hover for every nav item while collapsed; tooltips MUST disappear when the sidebar is expanded.

#### Scenario: Hover collapsed item

- GIVEN sidebar is collapsed
- WHEN the doctor hovers any nav icon
- THEN a Radix tooltip MUST appear with the module label after standard delay

#### Scenario: Tooltip suppressed when expanded

- GIVEN sidebar is expanded
- WHEN the doctor hovers a nav item
- THEN no tooltip MUST render because labels are already visible

### Requirement: Active item indicator

The active nav item SHALL apply `bg-sidebar-accent`, `font-medium`, and `aria-current="page"`.

#### Scenario: Active route highlighting

- GIVEN current URL is `/dashboard/recetas`
- WHEN sidebar renders
- THEN the `recetas` nav item MUST carry `bg-sidebar-accent font-medium` and `aria-current="page"`

#### Scenario: Route change updates active

- GIVEN sidebar shows `recetas` as active
- WHEN navigation transitions to `/dashboard/lab-orders`
- THEN `recetas` MUST lose the active classes and `lab-orders` MUST gain them

### Requirement: Group dividers

The sidebar SHALL render a 1px divider between every adjacent nav group whether collapsed or expanded.

#### Scenario: Multi-group rendering

- GIVEN resolver returns 3 non-empty groups
- WHEN sidebar renders
- THEN exactly 2 1px dividers MUST appear between adjacent groups

#### Scenario: Single group rendering

- GIVEN resolver returns only the `Clinica` group populated
- WHEN sidebar renders
- THEN no dividers MUST render

### Requirement: Attention dot

The sidebar SHALL render a `w-1.5 h-1.5 bg-destructive-600 rounded-full` dot absolutely positioned on any nav item whose module entry flags `attention: true`.

#### Scenario: Module with attention

- GIVEN resolved module `verificacion` flags `attention: true`
- WHEN sidebar renders that item
- THEN an absolutely positioned destructive-600 dot MUST overlay the icon top-right

#### Scenario: Module without attention

- GIVEN resolved module `recetas` flags `attention: false`
- WHEN sidebar renders
- THEN no dot MUST render

### Requirement: Header breadcrumbs structure

The header MUST render `Doctor name > Sede activa > Modulo activo` separated by slash SVG icons.

#### Scenario: Three-level breadcrumb

- GIVEN doctor `Dr. Lopez`, active sede `Clinica Centro`, active module `Recetas`
- WHEN header renders
- THEN breadcrumb MUST read `Dr. Lopez / Clinica Centro / Recetas` with slash SVG separators

#### Scenario: Module not resolved yet

- GIVEN doctor on `/dashboard` index with no active module
- WHEN header renders
- THEN breadcrumb MAY truncate to `Dr. Lopez / Clinica Centro` without crashing

### Requirement: Header action cluster

The header MUST contain in order: Search button, Help button, Advisor button, AI Assistant button, Avatar.

#### Scenario: Action order

- GIVEN the global header renders
- WHEN the action cluster mounts
- THEN children order MUST be Search, Help, Advisor, AI Assistant, Avatar

#### Scenario: Avatar dropdown

- GIVEN the cluster is rendered
- WHEN the doctor clicks the Avatar
- THEN a dropdown with profile and logout entries MUST open

### Requirement: FEATURE_NEW_SHELL toggle

When `process.env.FEATURE_NEW_SHELL === 'true'` the dashboard MUST render the new shell; otherwise the legacy shell MUST render. A missing flag MUST NOT throw.

#### Scenario: Flag on

- GIVEN `FEATURE_NEW_SHELL=true`
- WHEN `/dashboard` renders
- THEN the new 48px sidebar plus global header MUST mount

#### Scenario: Flag off or missing

- GIVEN `FEATURE_NEW_SHELL` unset or `'false'`
- WHEN `/dashboard` renders
- THEN the legacy shell MUST mount without runtime error

### Requirement: Dark mode parity

All new tokens introduced for the shell MUST have both light and dark values in `packages/design-system/src/styles/tokens.css`.

#### Scenario: Token light value present

- GIVEN a new token `--sidebar-bg` is added
- WHEN tokens.css is loaded under the light theme
- THEN the token MUST resolve to a light value

#### Scenario: Token dark value present

- GIVEN the same token `--sidebar-bg`
- WHEN tokens.css is loaded under the dark theme
- THEN the token MUST resolve to a dark value matched in contrast
