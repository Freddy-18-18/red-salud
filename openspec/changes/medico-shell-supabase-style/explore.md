# Exploration: medico-shell-supabase-style

## Current State

The medico web app shipped its Fase 1 shell (`medico-shell-sanvia`) and it is the active production composition:

- Orchestrator: `apps/medico/web/src/components/shell/dashboard-shell.tsx` — composes `DesktopSidebar`, `MobileTopBar`, `MobileSidebarSheet`, `MobileBottomNav`, and `<main>`. Owns two pieces of state: `useSidebarCollapsed()` (persisted to `localStorage['medico:sidebar-collapsed']`) + a local `sheetOpen`. Wrapper toggles `lg:pl-72` ↔ `lg:pl-16`.
- Layout: `apps/medico/web/src/app/dashboard/layout.tsx` — server component that fetches `doctor_profiles` + `specialties` + `profiles`, optionally runs the capability resolver behind `FEATURE_CAPABILITY_ENGINE`, and threads `navGroups | pinnedModules | verificationPending` as props to the shell. Flag is OFF by default; resolver result is `null` → shell falls back to `STATIC_NAV_GROUPS`.
- Sidebar: `desktop-sidebar.tsx` is a custom (NOT shadcn) fixed `<aside>` with `transition-[width]`. Already supports collapsed mode: header brand hides, items render via `<NavLink>` with `title={item.label}` (native browser tooltip) when collapsed. Footer renders `<UserMenuDropdown>`.
- Per-page header: `page-header.tsx` is a compound component with `Breadcrumb | Title | Meta | Actions` slots. Reuses `<Breadcrumbs items={...}>` from `@red-salud/design-system`. Rendered by all 11 dashboard pages.
- Data props (post-capability-engine): icons arrive as STRINGS at the boundary (`ResolvedNavGroup`) and are mapped to `LucideIcon` via `nav-mapper.ts` → `mergeWithStaticFallback()`. Any new sidebar surface must consume `NavGroupData` (post-merge shape), not the raw resolver output.

Tokens — Caribbean Trust palette lives at `packages/design-system/src/styles/tokens.css`. Surfaces, brand, semantic, vitals, per-domain accents, radius, spacing, typography, shadows, motion. Apps `@import` the tokens.css and Tailwind 4 `@theme inline` maps them to `bg-primary`, `text-foreground`, etc. ZERO Supabase-style tokens exist (no `--sidebar`, no `--foreground-lighter`, no `--border-strong`, no `--border-muted`). The medico app's per-domain accent is wired as `--accent-domain: var(--domain-medico)` (clinical teal).

Tooltip primitive: `@red-salud/design-system` DOES export Radix-based `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`. Currently UNUSED in the medico shell — collapsed nav-links only use `title=` HTML attribute. Migrating to Radix tooltips is a low-effort, high-UX win for non-tech medics.

shadcn `Sidebar` primitive: NOT present in `packages/design-system`. The design system has tooltip, sheet, popover, command, dropdown-menu, separator, scroll-area, etc., but NO `sidebar.tsx`. The current `desktop-sidebar.tsx` is a hand-rolled fixed aside.

Multi-sede schema: `organization_locations` exists (in `supabase/migrations/20260501100000_clinica_multitenant_foundation.sql`) but it belongs to the CLINICA domain — `organization_members` links users to organizations with optional `location_id` scope. The medico app deliberately states "Individual doctor practice ONLY — no clinic/multi-org concepts" (CLAUDE.md + `nav-data.ts` + `dashboard-shell.tsx` JSDoc). There is currently NO doctor↔sede relation in the medico app's data model. `apps/medico/` has ZERO references to `organization_members`/`doctor_locations`.

## Affected Areas

- `apps/medico/web/src/components/shell/dashboard-shell.tsx` — orchestrator must thread a new "global header" prop set (sede picker, action buttons, user avatar) and render it above `<main>` on desktop.
- `apps/medico/web/src/components/shell/desktop-sidebar.tsx` — full restyle: collapse default = icon-only (48px, not 72px), grouping with dividers, attention indicators, Radix tooltips.
- `apps/medico/web/src/components/shell/nav-link.tsx` — replace `title=` with `<Tooltip>` from design-system, expose optional `attention?: boolean` flag for the red dot.
- `apps/medico/web/src/components/shell/nav-group.tsx` — divider between groups.
- `apps/medico/web/src/components/shell/types.ts` — extend `NavLinkData` with `attention?`, `shortcut?`; add header-prop types (`HeaderActions`, `SedeOption`, `BreadcrumbContext`).
- NEW `apps/medico/web/src/components/shell/global-header.tsx` — Supabase-style top bar: brand/breadcrumbs left, action cluster right.
- NEW `apps/medico/web/src/components/shell/breadcrumb-picker.tsx` — clickable crumb + chevrons-up-down trigger that opens a popover.
- NEW `apps/medico/web/src/hooks/use-active-sede.ts` (if multi-sede is in scope) — persists doctor's selected sede.
- `apps/medico/web/src/app/dashboard/layout.tsx` — server-fetch active module label from URL, fetch sede list if user opts in.
- `packages/design-system/src/styles/tokens.css` — add `--sidebar`, `--sidebar-accent`, `--sidebar-foreground`, `--sidebar-ring`, `--border-strong`, `--border-muted`, `--foreground-lighter`, `--surface-75` (mapped to Caribbean Trust values, NOT Supabase greys).
- `packages/design-system/src/sidebar.tsx` (only if Approach B) — full shadcn sidebar primitive.
- `apps/medico/web/src/components/shell/mobile-top-bar.tsx` — port the breadcrumb pattern to mobile (collapse to crumb-2 only).

## Approaches

### A. Drop-in in `apps/medico/web/` (RECOMMENDED for first iteration)

Rebuild `desktop-sidebar.tsx` + add `global-header.tsx` in-place inside the medico app. Token gaps are filled by extending `packages/design-system/src/styles/tokens.css` (mapped to Caribbean Trust palette, not Supabase greys). NavGroup gains dividers, NavLink gets Radix tooltip + attention dot.

- Pros: localized blast radius — only medico changes; capability engine wiring stays intact (`mergeWithStaticFallback` already returns `NavGroupData`); zero risk to other 8 apps; tests in `components/shell/*.test.tsx` continue to apply; iteration speed is high.
- Cons: paciente/clinica/farmacia etc. won't benefit immediately; if they want the same shell later, we'll have a code-duplication tax to repay.
- Effort: M (3-5 days). Mostly new TSX + 8 new tokens + Tooltip rewire. No data-model changes if sede is deferred.

### B. Extract reusable `<AppShell>` to `@red-salud/design-system`

Add `packages/design-system/src/sidebar.tsx` (shadcn-style primitive with `Sidebar`, `SidebarProvider`, `SidebarMenu`, `SidebarMenuItem`, `SidebarTrigger`) + `packages/design-system/src/app-shell.tsx` (composition root that takes `navGroups`, `header`, `children` slots). Migrate medico to consume the new primitives; other 8 apps adopt later.

- Pros: zero duplication; matches the existing `app-switcher.tsx` and `auth-shell.tsx` precedent of cross-app shells in design-system; future capability-engine-style features deploy to 9 apps simultaneously.
- Cons: design-system is consumed by 9 apps + 4 desktop builds + 3 mobile builds — every API decision is a 9-way commitment; need to audit every other app's existing custom sidebar (paciente, clinica, etc.) to confirm the new primitive subsumes their use cases without regressions; shadcn `Sidebar` brings ~15 new sub-components, each needing tests; the medico-specific "sede picker" header is NOT a design-system concern (it's domain logic) so we still end up with medico-specific glue.
- Effort: L (1.5-2 weeks). Includes audit of paciente/clinica/farmacia/laboratorio shells, write the primitive, write storybook-style examples, migrate medico, smoke-test 9 apps.

## Token Gap

| Token | Exists today? | Action needed |
|---|---|---|
| `bg-sidebar` | NO | Add `--sidebar: 200 25% 97%` (slightly cooler than `--background`) + `@theme` mapping |
| `bg-sidebar-accent` | NO | Add `--sidebar-accent: 205 60% 92%` (lift `--accent` for sidebar contrast) |
| `text-sidebar-foreground` | NO | Add `--sidebar-foreground: 215 28% 18%` (slightly softer than `--foreground`) |
| `ring-sidebar-ring` | NO | Add `--sidebar-ring: var(--ring)` (reuse) |
| `text-foreground-lighter` | NO | Add `--foreground-lighter: 215 14% 52%` (between `--muted-foreground` and `--foreground`) |
| `border-strong` | NO | Add `--border-strong: 215 18% 76%` (between `--border` and the popover edge) |
| `bg-border-muted` | NO | Add `--border-muted: 215 18% 92%` (subtle group divider) |
| `bg-surface-75` | NO | Add `--surface-75: 210 20% 95%` (under-elevated chip backgrounds — "Free" badge analog) |
| `text-border-stronger` (slash separator color) | NO | Reuse `--foreground-lighter` |
| Existing `--primary`, `--foreground`, `--muted`, `--accent`, `--border`, `--ring`, `--destructive`, `--destructive-foreground`, `--warning` | YES | No change — slot existing tokens into Supabase-positioned elements |

Action: extend tokens.css with the 8 new variables, each mapped to a Caribbean Trust hue (NOT Supabase grey). This preserves brand integrity while giving the shell the contrast headroom the Supabase pattern relies on. Dark-mode parity is mandatory (extend `.dark` block too).

## Critical Open Questions (for user, before propose)

1. **Multi-sede semantics**: the medico app explicitly forbids "clinic/multi-org concepts" today. Three options — pick one before propose:
   - (a) DROP sede from breadcrumbs entirely → render `Doctor > Módulo` only. Lightest, no schema work, but loses the Supabase "branch picker" pattern.
   - (b) Add an INDIVIDUAL-level `doctor_practice_locations` table (doctor-owned, no organization). Doctor can register their consultorio + optional secondary cabinet. Light schema, no clinica coupling.
   - (c) Use the existing `organization_members` from clinica multi-tenant. Means medics-employed-by-clinicas see their org's sedes; solo-practice medics see nothing. Heavy coupling that contradicts current CLAUDE.md rule.
2. **Action cluster scope**: which of these belong in the medico header? Feedback (yes, easy), global search (over patients + modules? scoped how?), Help (link to docs site or in-app modal?), Advisor (capability-engine warnings? SACS reminders?), AI Assistant (resurface the existing Gemini ICD-11 service as a global launcher?). The Supabase "SQL Editor" has NO clinical equivalent — confirm we drop it.
3. **Shortcut hints in tooltips**: keyboard shortcuts are non-trivial for non-tech medics. Show shortcut hints only on hover (not on initial collapse), or skip entirely?
4. **Sede swap behavior**: if (1b) or (1c) is chosen, when the doctor switches sede does the URL change (e.g. `?sede=xxx`), the data filter change (server re-queries with sede scope), or both? Affects every page module's data layer.
5. **Reusable shell scope**: commit to Approach A first (this change) and defer Approach B to a future change, OR bite the bullet now? My recommendation is A first — see Recommendation below.
6. **Default collapsed state**: today the persisted default is `collapsed=false` (full sidebar). User asked for "icon-only collapsed (48px)" as default. Switch default to `true` AND lower min width from 64px (`w-16`) to 48px (`w-12`) — confirm.
7. **Tooltip provider scope**: `TooltipProvider` needs to wrap the entire shell to avoid per-link providers. Where do we mount it — in `dashboard-shell.tsx` or one level up in `app/layout.tsx`?

## Recommendation

Go with **Approach A** for this change. Reasons:

- Capability-engine wiring is fragile and already works — replumbing the resolver output through a new package boundary multiplies risk for no immediate user benefit.
- The Supabase shell pattern is opinionated, and locking the pattern into design-system commits all 9 apps to it. Medico is the highest-value testbed (most modules, most user variability). Validate the pattern in medico first, then promote to design-system as a SEPARATE change once we see what other apps actually need.
- Token additions (the 8 new variables) DO belong in design-system from day one — that's a small, reversible commit and avoids a per-app token fork.
- Sede should DROP from Phase 1 of this change (option 1a above) unless user explicitly approves option 1b. Medico's "individual doctor practice ONLY" stance is the source-of-truth today and re-litigating it inside a shell-styling change is out-of-scope creep.

Net plan: extend tokens.css (design-system), rebuild medico's sidebar + header in-place, ship behind no flag (it replaces the current shell wholesale). Defer cross-app shell extraction to a follow-up `design-system-app-shell` change.

## Risks

- **CRITICAL — Conceptual conflict on sede**: the breadcrumb requirement asks for `Médico > Sede > Módulo` but the medico app's contract forbids multi-org/sede concepts. This MUST be resolved with the user before propose, otherwise specs will contradict CLAUDE.md.
- **Token name collision in dark mode**: the 8 new tokens need explicit `.dark` overrides; missing one will silently fall back to light values on dark theme.
- **Tooltip flicker on first hover**: Radix `Tooltip` needs `TooltipProvider` mounted high in the tree; mounting it inside `DashboardShell` works but `TooltipProvider` props (`delayDuration`, `skipDelayDuration`) control non-tech-medic ergonomics.
- **Capability engine flag is OFF in production today** (default `false`). If we add header behavior that depends on resolver output (e.g. attention dots from `verificationPending`), we must keep static fallbacks.
- **Test coverage**: 71 existing tests pass against the current shell. Each of the 9 shell-file tests (`dashboard-shell.test.tsx`, `desktop-sidebar.test.tsx`, etc.) will need updates. Plan for ≥15 new test cases (header, picker, tooltip, attention indicator).
- **Mobile parity gap**: `mobile-top-bar.tsx` is intentionally minimal (hamburger + brand). Porting the breadcrumb pattern to mobile means either truncating to `… > Módulo` or skipping breadcrumbs on mobile entirely — needs design call.
- **`FEATURE_CAPABILITY_ENGINE` is currently dormant**: any header action that surfaces capability-engine state (e.g. Advisor button counting pending capabilities) is a no-op until the flag is enabled. Either gate the header action UI or wire the flag ON in this change.

## Ready for Proposal

NO — blocking on user input for questions 1 (sede semantics) and 2 (action cluster scope). Once those are answered, the proposal can be drafted in 1-2 hours. Questions 3-7 can be locked during proposal/design.

## skill_resolution: none (compact rules not injected this turn — orchestrator notified)
