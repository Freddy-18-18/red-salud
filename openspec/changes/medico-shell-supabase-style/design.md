# Design: medico-shell-supabase-style

## Technical Approach

Phased in-place refactor of medico's custom shell. No shadcn `Sidebar`, no design-system extraction. Existing `<aside>` is extended (48px collapsed default, Radix `Tooltip`, dividers, attention dots); new `<GlobalHeader>` added behind `FEATURE_NEW_SHELL` env flag (default OFF). Design-system primitives that already ship (`Tooltip`, `Command`/`cmdk`, `Popover`, `DropdownMenu`) are consumed — zero new deps. Multi-sede via medico-owned `doctor_practice_locations` with RLS; active sede tracked via cookie (truth) + opt-in `?sede=` URL param. Phases 1-4 ship independently, fully reversible by flipping the flag.

## Architecture Decisions

### Decision 1: NO shadcn sidebar — extend custom `<aside>`
**Choice**: Refactor `desktop-sidebar.tsx` in place.
**Alternatives**: Shadcn `Sidebar` cluster; inline-copy shadcn.
**Rationale**: Phase 1 shipped green (71 tests, capability engine wired). Shadcn = 15+ sub-components + group/peer patterns with zero user-visible delta.

### Decision 2: Position-named tokens, NOT shadcn-named
**Choice**: 8 new tokens (`--sidebar`, `--sidebar-accent`, `--sidebar-foreground`, `--sidebar-ring`, `--surface-75`, `--border-strong`, `--border-muted`, `--foreground-lighter`) on Caribbean Trust hues with `.dark` parity.
**Alternatives**: Rename existing tokens; wholesale import Supabase greys.
**Rationale**: Renaming breaks 9 apps. Wholesale drops brand. Position-named tokens replicate structure on our hues.

### Decision 3: `cmdk` via existing design-system primitive
**Choice**: Wrap design-system `Command`/`CommandDialog`/`CommandInput`/`CommandList`.
**Alternatives**: Roll local 50-line cmdk-style (original proposal); pull `react-cmdk`.
**Rationale**: Verified — `packages/design-system/src/command.tsx` already wraps `cmdk` with our tokens. Local re-implements fuzzy match, keyboard nav, combobox a11y for free. OVERRIDES proposal.

### Decision 4: `doctor_practice_locations` is pure medico
**Choice**: New table owned by medico, no FKs to clinica's `organization_locations`. RLS by `doctor_id = auth.uid()`.
**Alternatives**: Reuse `organization_locations`; jsonb array on `doctor_profiles`.
**Rationale**: Domain isolation (`CLAUDE.md`). Clinica's table is org-multi-tenant — contradicts medico's "individual practice ONLY". jsonb arrays deny per-row RLS and at-most-one-primary constraint.

### Decision 5: Active sede via cookie + opt-in URL param
**Choice**: `active_sede_id` cookie (SameSite=Lax, Path=/dashboard) is truth; `?sede=<id>` URL param honored when present and written back to cookie.
**Alternatives**: URL param everywhere; profile column; localStorage.
**Rationale**: Cookies survive tabs/refreshes/middleware without URL pollution. localStorage = client round-trip. Profile column = extra RLS update path.

### Decision 6: AI Assistant is placeholder Popover in Phase 2
**Choice**: `<AIAssistantButton>` opens Popover with one CTA calling `/api/gemini/suggest-icd11`. No chat dock.
**Alternatives**: Full chat dock; sidebar panel; defer the button.
**Rationale**: `lib/services/gemini-service.ts` is a STUB returning `[]`. A dock = vapor on vapor. Placeholder keeps slot discoverable; full dock is follow-up `medico-ai-dock`.

## Component Tree

```
<DashboardShell>
 ├─ <TooltipProvider delay=250>                       NEW
 ├─ <GlobalHeader> (Phase 2, lg+)                     NEW
 │   ├─ <BreadcrumbPicker level=doctor/sede/module/>
 │   ├─ <CommandPaletteTrigger/>  ← Ctrl K
 │   ├─ <HelpButton/>             ← Popover
 │   ├─ <AdvisorButton/>          ← red dot from resolver
 │   ├─ <AIAssistantButton/>      ← Phase 2 placeholder
 │   └─ <UserMenuDropdown/>
 ├─ <DesktopSidebar>                                  REFACTORED
 │   ├─ <NavGroup> + Radix Tooltip + attention dot
 │   ├─ <Divider/>                                    NEW
 │   └─ <CollapseToggleButton/>   ← footer
 ├─ <CommandPalette/> (Phase 4, mounted always)       NEW
 └─ <main>{children}</main>
```

Mobile keeps `MobileTopBar`/`MobileSidebarSheet`/`MobileBottomNav`. `<GlobalHeader>` is `lg+` only; mobile shows truncated breadcrumb in `MobileTopBar`.

## Data Flow — Sede Swap

```
crumb click → BreadcrumbPicker Popover → onSelect(sedeId)
  → useActiveSede.setActive → cookie 'active_sede_id'
  → if URL had ?sede=, replace; else leave URL alone
  → queryClient.invalidateQueries(['sede-scoped'])
  → header label + sidebar re-render
```

`useActiveSede` precedence: URL param → cookie → first primary row → null.

## File Changes

**New (13)**: shell `global-header.tsx`, `breadcrumb-picker.tsx`, `command-palette{,-trigger}.tsx`, `help-button.tsx`, `advisor-button.tsx`, `ai-assistant-button.tsx`; hooks `use-active-sede.ts`, `use-command-palette.ts`; lib `sedes/{types,service,hooks}.ts`; page `app/dashboard/sedes/page.tsx`.

**Modified (7)**: `desktop-sidebar.tsx`, `nav-link.tsx`, `nav-group.tsx`, `dashboard-shell.tsx`, `types.ts`, `use-sidebar-collapsed.ts` (default `true`, key v2), `lib/capabilities/{types,resolver}.ts` (`sacsExpired`), `packages/design-system/src/styles/tokens.css` (8 tokens + dark).

**Migration (1)**: `<ts>_doctor_practice_locations.sql` — table + RLS + at-most-one-primary trigger + `doctor_id` index.

## Testing Strategy

- **Unit**: `useActiveSede` precedence; `useCommandPalette` keyboard; resolver `sacsExpired`; `BreadcrumbPicker` modes
- **Integration**: sede swap invalidates `['sede-scoped']`; tooltip hover collapsed; Advisor red dot when expired; palette filters by name/CI
- **E2E**: Ctrl K palette → patient nav; sede persists reload; `FEATURE_NEW_SHELL` toggles chrome
- **RLS**: `doctor_practice_locations` isolation between doctors
- **Visual**: dark-mode token parity (Storybook)
- **A11y**: Lighthouse `/dashboard` ≥95 (axe-core CI)

## Migration / Rollout

All 4 phases behind `FEATURE_NEW_SHELL` (default `false`).

- **P1**: tokens (additive) + sidebar refactor. Default-collapsed visible; storage key v2 invalidates stale prefs.
- **P2**: `<GlobalHeader>` + breadcrumbs + 4 actions. Mounts when flag ON. Needs P1 tokens.
- **P3**: migration + sede hook + `/dashboard/sedes` UI. Independent; table empty, no backfill.
- **P4**: Command palette via `CommandDialog`. Needs P2 header.

Cutover: Playwright + a11y + visual regression green on staging. Rollback = flip flag.

## Open Questions

- [ ] Tooltip `delayDuration` — 250ms (Radix default) or 100ms for snappier feel?
- [ ] `AdvisorButton` — reuse `UserMenuDropdown` styling or grouped `DropdownMenu` (Pendiente / Vencido / Informativo)?
- [ ] AI panel — keep Popover or switch to Sheet when real Gemini lands?
- [ ] Palette TTL — per-domain `staleTime` (heterogeneous) or flat 30s palette index?
- [ ] When `FEATURE_CAPABILITY_ENGINE=false`, should `sacsExpired` read `verificaciones_sacs` directly or stay `false`?
