# Tasks: medico-shell-supabase-style

Strict TDD: RED -> GREEN -> REFACTOR. Reqs R1-R9 per spec.
Phases gated by `FEATURE_NEW_SHELL` env flag.

## Phase 1: Tokens + Sidebar Refactor (foundation)

- [x] 1.1 (tokens) Extend `packages/design-system/src/styles/tokens.css` with 8 tokens (`--sidebar`, `--sidebar-accent`, `--sidebar-foreground`, `--sidebar-ring`, `--foreground-lighter`, `--border-strong`, `--border-muted`, `--surface-75`); add light + `.dark` parity [R9]
- [x] 1.2 (tokens) Verify Caribbean Trust WCAG AA via design-system a11y test or manual check
- [x] 1.3 (RED) Test `apps/medico/web/src/components/shell/__tests__/desktop-sidebar.test.tsx` — collapsed default 48px on viewport >=1024px [R1]
- [x] 1.4 (GREEN) Modify `apps/medico/web/src/components/shell/desktop-sidebar.tsx` — collapsed 48px gated by `FEATURE_NEW_SHELL`; legacy 64px preserved when flag off [R1, R8]
- [x] 1.5 (RED) Test NavLink shows Radix tooltip with label when collapsed, hides when expanded [R2]
- [x] 1.6 (GREEN) Modify `apps/medico/web/src/components/shell/nav-link.tsx` — wrap in `TooltipTrigger` from `@red-salud/design-system`, conditional render based on collapsed state [R2]
- [x] 1.7 (RED) Test NavGroup renders 1px divider between groups [R4]
- [x] 1.8 (GREEN) Modify `apps/medico/web/src/components/shell/nav-group.tsx` — add divider rendering [R4]
- [x] 1.9 (RED) Test NavLink renders attention dot when `attention: true` [R5]
- [x] 1.10 (GREEN) Add `attention` prop to NavLink + render `w-1.5 h-1.5 bg-destructive-600 rounded-full absolute` [R5]
- [x] 1.11 (RED) Test `apps/medico/web/src/hooks/__tests__/use-sidebar-collapsed.test.ts` — default state `true`, storage key v2
- [x] 1.12 (GREEN) Modify `apps/medico/web/src/hooks/use-sidebar-collapsed.ts` — default `true`, storage key v2 (legacy key preserved, separate)
- [x] 1.13 (config) Add `FEATURE_NEW_SHELL` to `.env.example` with default `false` [R8]
- [x] 1.14 (verify) Playwright manual pass on `/dashboard` with flag true and false — both render

## Phase 2: Global Header + Breadcrumbs + Action Cluster

- [x] 2.1 (RED) Test GlobalHeader renders 3 breadcrumb levels with slash SVG separators when flag true [R6]
- [x] 2.2 (GREEN) Create `apps/medico/web/src/components/shell/global-header.tsx` [R6]
- [x] 2.3 (RED) Test BreadcrumbPicker opens popover with options
- [x] 2.4 (GREEN) Create `apps/medico/web/src/components/shell/breadcrumb-picker.tsx` — generic accepts `{level, value, options, onSelect}`
- [x] 2.5 (RED) Test AdvisorButton shows red dot when resolver flags `verificationPending` OR `sacsExpired`
- [x] 2.6 (GREEN) Create `apps/medico/web/src/components/shell/advisor-button.tsx` — opens dropdown with alerts list
- [x] 2.7 (RED) Test resolver output includes `verificationPending` + `sacsExpired` fields
- [x] 2.8 (GREEN) Modify `apps/medico/web/src/lib/capabilities/resolver.ts` — add fields, default `false` when capability engine off
- [x] 2.9 (GREEN) Create `apps/medico/web/src/components/shell/help-button.tsx` — `/help` link + feedback form modal
- [x] 2.10 (GREEN) Create `apps/medico/web/src/components/shell/ai-assistant-button.tsx` — placeholder dock trigger (Decision 6)
- [x] 2.11 (RED) Test DashboardShell renders GlobalHeader when flag true, hides when false [R8]
- [x] 2.12 (GREEN) Modify `apps/medico/web/src/components/shell/dashboard-shell.tsx` — conditional `GlobalHeader` mount [R8]
- [x] 2.13 (style) Apply `rounded-full w-8 h-8 border-strong hover:border-foreground-muted` on action buttons [R7]
- [x] 2.14 (verify) typecheck + vitest pass; Playwright check deferred until Phase 5 cutover (no console error budget on dashboard pages)

## Phase 3: doctor_practice_locations + RLS + Management UI

- [ ] 3.1 (migration) Create `<ts>_doctor_practice_locations.sql` — id, doctor_id fk profiles, name, address, is_primary, active, timestamps [R1]
- [ ] 3.2 (migration) Add trigger: at-most-one-primary per doctor_id [R3]
- [ ] 3.3 (migration) Add RLS policies: doctor SELECT/INSERT/UPDATE/DELETE own rows only (`auth.uid() = doctor_id`) [R2]
- [ ] 3.4 (migration) Apply via `mcp__claude_ai_Supabase__apply_migration` to project `hwckkfiirldgundbcjsp`
- [ ] 3.5 (verify) SQL: confirm RLS enabled + 4 policies + trigger fires
- [ ] 3.6 (types) Add `DoctorPracticeLocation` type at `apps/medico/web/src/lib/sedes/types.ts`
- [ ] 3.7 (service) Create `apps/medico/web/src/lib/sedes/service.ts` — `listSedes`, `createSede`, `updateSede`, `deleteSede`, `setPrimary`
- [ ] 3.8 (RED) Test `apps/medico/web/src/hooks/__tests__/use-active-sede.test.ts` — cookie default first sede, URL param overrides cookie, swap persists [R5]
- [ ] 3.9 (GREEN) Create `apps/medico/web/src/hooks/use-active-sede.ts` — cookie `active_sede_id` + URL param `?sede=<id>` [R5]
- [ ] 3.10 (RED) Test sede swap invalidates `['appointments', sedeId]` query
- [ ] 3.11 (GREEN) Wire React Query invalidation in `use-active-sede` setter
- [ ] 3.12 (GREEN) Create `apps/medico/web/src/app/dashboard/sedes/page.tsx` — list + CRUD + primary toggle [R7]
- [ ] 3.13 (GREEN) Wire sede picker in `global-header.tsx` BreadcrumbPicker for level=sede
- [ ] 3.14 (RED) Integration test deletion blocked when appointments linked to sede [R6]
- [ ] 3.15 (GREEN) Implement deletion guard in service.ts with reassign-then-delete prompt [R6]
- [ ] 3.16 (verify) Playwright: doctor creates 2 sedes, swaps active, verify cookie + URL behavior

## Phase 4: Command Palette (Ctrl K)

- [ ] 4.1 (RED) Test `apps/medico/web/src/hooks/__tests__/use-command-palette.test.ts` — Ctrl+K / Cmd+K toggles open state [R1]
- [ ] 4.2 (GREEN) Create `apps/medico/web/src/hooks/use-command-palette.ts` — keyboard listener + open state [R1]
- [ ] 4.3 (RED) Test query `juan` returns patients matching name OR national_id [R2]
- [ ] 4.4 (GREEN) Create `apps/medico/web/src/components/shell/command-palette.tsx` — consume design-system `command.tsx` (Decision 3); patient search via TanStack cache [R2]
- [ ] 4.5 (RED) Test results grouped by type (Pacientes / Modulos / Citas) [R3]
- [ ] 4.6 (GREEN) Implement group rendering with section headers [R3]
- [ ] 4.7 (RED) Test keyboard navigation (arrows + Enter + Esc) [R4]
- [ ] 4.8 (GREEN) Wire keyboard handlers (cmdk likely native — verify) [R4]
- [ ] 4.9 (RED) Test appointments search returns +/-30 days window [R2]
- [ ] 4.10 (GREEN) Wire appointments query with date filter [R2]
- [ ] 4.11 (RED) Test closing palette clears query state [R7]
- [ ] 4.12 (GREEN) Implement cleanup on close [R7]
- [ ] 4.13 (GREEN) Wire `CommandPalette` into GlobalHeader (search button + Ctrl K shortcut)
- [ ] 4.14 (verify) Playwright: Ctrl K opens palette, search returns results <200ms [R5]

## Phase 5: Cutover + a11y polish

- [ ] 5.1 (a11y) Lighthouse audit on `/dashboard` with flag true, score >=95
- [ ] 5.2 (a11y) Verify all action buttons have `aria-label`
- [ ] 5.3 (a11y) Verify tooltip `role` + `aria-describedby`
- [ ] 5.4 (verify) Run full Playwright E2E against all 11 dashboard pages with new shell
- [ ] 5.5 (docs) Update `apps/medico/web/CLAUDE.md` — document `FEATURE_NEW_SHELL` + shell architecture
- [ ] 5.6 (release) Flip `FEATURE_NEW_SHELL` to true in production after staging soak
