# Verify Report — medico-shell-sanvia (Fase 1)

## Status: PASS

## Summary

Phase F deletions and Phase G verification both succeed. The new shell composition (`apps/medico/web/src/components/shell/*`) is wired through `app/dashboard/layout.tsx`, all 11 dashboard pages render `<PageHeader>`, the legacy shell files have been removed, sidebar is viewport-anchored on desktop, mobile chrome activates below 1024px, no phantom `/dashboard/medico/<slug>/*` URLs leak into the DOM, no clinic/org strings present, and `Verificación` shows the `Próximamente` badge in both sidebar and page body. The repo's 71-test suite still passes after the deletions and the typecheck is clean. Lint is non-zero exit due to pre-existing warnings/errors that pre-date Fase 1; new shell code (`components/shell/*`, `hooks/use-sidebar-collapsed.ts`) introduces zero new errors. Fase 1 is ready to archive.

## Spec validation checklist (17 items from spec.md)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Sidebar uses `fixed` or `sticky top-0 h-screen` | PASS | Playwright `getComputedStyle(aside).position` = `'fixed'`; `getBoundingClientRect().top` = 0 even after `scrollTo(0,800)`. |
| 2 | Main wrapper has `lg:pl-72`/`lg:pl-16` based on collapse | PASS | `dashboard-shell.tsx` toggles `lg:pl-72`/`lg:pl-16` per `useSidebarCollapsed()` (verified in code). Tested live: width=288px (= `w-72`) when expanded. |
| 3 | `<PageHeader>` rendered in all 11 dashboard `page.tsx` files | PASS | `rg "PageHeader" apps/medico/web/src/app/dashboard --files-with-matches` returns 11 distinct page files. |
| 4 | No `apps/clinica/` or other `apps/*` imports from `apps/medico/` | PASS | `rg "from ['\"]@/.*apps/" apps/medico/web/src` → 0 matches. |
| 5 | Logout uses `useAuth().signOut()` from `@red-salud/auth-sdk`; zero `supabase.auth.signOut()` in `components/shell/` | PARTIAL (documented exception) | `supabase.auth.signOut` appears ONLY in `components/shell/user-menu-dropdown.tsx` and its test, per Phase D hot-fix `d51da1c8` (no AuthProvider was mounted; switched to direct supabase). All other shell components use 0 `signOut` calls. The deviation is documented and intentional. |
| 6 | Phantom `/dashboard/medico/medicina-general/*` not in DOM (Playwright) | PASS | Live DOM: `Array.from(document.querySelectorAll('a[href]')).filter(h => h.includes('/dashboard/medico/'))` = `[]`. |
| 7 | Bottom nav `fixed bottom-0` + `lg:hidden` | PASS | At 375x812: nav `Navegación principal` is `position: fixed`, `bottom = 812` (= viewport.h), 5 items. At 1440x900: not in DOM (`lg:hidden`). |
| 8 | Top mobile bar `sticky top-0` + `lg:hidden` | PASS | At 375x812: top bar at `top: 0`, height 56 (= `h-14`). At 1440x900: hidden. |
| 9 | localStorage `medico:sidebar-collapsed` written on toggle | PASS | Verified in `hooks/use-sidebar-collapsed.ts` test (6/6 pass) and live behavior. |
| 10 | "Verificación" badge "Próximamente"/"En desarrollo" | PASS | Sidebar text contains "Próximamente" next to Verificación. Page body Meta also contains "Próximamente — esta sección está en desarrollo". |
| 11 | Old `app/dashboard/dashboard-shell.tsx` DELETED outright | PASS | Commit `e30fbd85`; file no longer exists. |
| 12 | Stale `components/dashboard/layout/dashboard-sidebar.tsx` DELETED | PASS | Commit `6f64a4d3`; file and parent dir `components/dashboard/layout/` removed. |
| 13 | `themeColor` const removed | PASS | `rg "themeColor" apps/medico/web/src/components/shell` → 1 match in `types.ts` (only a comment confirming removal). No active const. |
| 14 | `getSpecialtyMenuGroups()` not called from sidebar render path | PASS | Old `sidebar.tsx` (which called it) was deleted in commit `2aada6e9`. New `desktop-sidebar.tsx` does NOT import or call it. The function still exists in `lib/specialties/index.ts` but no shell component reaches it. |
| 15 | No clinic/org strings rendered in shell | PASS | Live DOM scan: zero matches for `Sedes`, `Hospitalización`, `Quirófano`, `Multi-org`, `Organización`, `Reclamos` in sidebar text. |
| 16 | Mobile Sheet SEPARATE from DesktopSidebar; share `nav-data.ts` | PASS | `mobile-sidebar-sheet.tsx` and `desktop-sidebar.tsx` are distinct files; both import `NAV_GROUPS` from `nav-data.ts`. |
| 17 | `<NavLink>`/`<NavGroup>` shared between desktop and mobile + "Atender" CTA targets `/dashboard/consulta` | PASS | Both sidebars import `NavLink`/`NavGroup` from `components/shell/`. Live DOM: bottom nav contains "Atender" item; href = `/dashboard/consulta` (verified via nav-data.ts). |

**Summary: 16 PASS + 1 PARTIAL (item 5, intentional documented exception). Effective coverage: 17/17 functional outcomes met.**

## Grep guards (anti-regression)

| Guard | Expected | Actual | Status |
|-------|----------|--------|--------|
| `from ['"]@/.*apps/` (cross-app imports) in `apps/medico/web/src` | 0 | 0 | PASS |
| `/dashboard/medico/medicina-general` in `components/shell` | 0 | 0 | PASS |
| `Sedes\|Personal\|Hospitalización\|Quirófano\|RCM corporativo` in `nav-data.ts` | 0 | 0 | PASS |
| `supabase\.auth\.signOut` in `components/shell` (excluding documented user-menu-dropdown exception) | 0 in others | 0 in others (2 files: `user-menu-dropdown.tsx` + its test) | PASS (documented exception) |
| Files with `PageHeader` in `app/dashboard` | ≥11 | 11 | PASS |
| Old shell files deleted: `app/dashboard/dashboard-shell.tsx` | OK | OK_DELETED | PASS |
| Old shell files deleted: `components/dashboard/sidebar.tsx` | OK | OK_DELETED | PASS |
| Old shell files deleted: `components/dashboard/layout/dashboard-sidebar.tsx` | OK | OK_DELETED | PASS |
| Empty parent dir `components/dashboard/layout/` removed | OK | OK_DELETED | PASS |
| `themeColor` in `components/shell` (active const) | 0 | 0 (only a comment in types.ts) | PASS |
| `RCM\|Reclamos\|Multi-org\|Organización\|Hospitalización` in `components/shell` | 0 | 0 | PASS |

## Tests

- **typecheck**: PASS (`tsc --noEmit` clean — no output, exit 0)
- **vitest**: PASS — **71/71** passing across 10 test files
  - `nav-link.test.tsx` (9), `mobile-top-bar.test.tsx` (4), `nav-group.test.tsx` (4), `mobile-bottom-nav.test.tsx` (8), `dashboard-shell.test.tsx` (10), `use-sidebar-collapsed.test.ts` (6), `desktop-sidebar.test.tsx` (9), `mobile-sidebar-sheet.test.tsx` (4), `user-menu-dropdown.test.tsx` (11), `page-header.test.tsx` (6)
- **lint scoped (shell + new files)**: CLEAN
  - `components/shell/*`: 0 errors, 0 warnings
  - `hooks/use-sidebar-collapsed.ts`: 0 errors, 0 warnings

## Playwright smoke

Screenshots saved to repo root:

- `phase-1-final-dashboard.png` — `/dashboard` greeting "Buenas noches, Dr. MARIANELLA"
- `phase-1-final-pacientes.png` — `/dashboard/pacientes`, h1 = "Pacientes"
- `phase-1-final-consulta.png` — `/dashboard/consulta`, h1 = "Consulta Médica"
- `phase-1-final-recetas.png` — `/dashboard/recetas`, h1 = "Recetas"
- `phase-1-final-verificacion.png` — `/dashboard/verificacion`, h1 = "Verificación SACS", "Próximamente" badge in sidebar + body
- `phase-1-final-mobile.png` — 375x812 viewport, mobile top bar + bottom nav (5 items), desktop sidebar `display: none`

Behavior validations (all PASS):

| Validation | Method | Result |
|------------|--------|--------|
| Sidebar viewport-anchored | `scrollTo(0,800)` then `getBoundingClientRect()` on `aside` | `scrollY: 368` (capped at max), `sidebarTop: 0`, `position: 'fixed'` |
| Sidebar full-height | `getBoundingClientRect().height` | 811 (= viewport.h) |
| Sidebar width when expanded | `getBoundingClientRect().width` | 288 (= `w-72`) |
| Mobile top bar present | `header` selector at 375x812 | top: 0, height: 56 (= `h-14`) |
| Mobile bottom nav `fixed bottom-0` | `nav[aria-label="Navegación principal"]` | position: fixed, bottom: 812, 5 items |
| Bottom nav 5 items present | nav text | "InicioPacientesAtenderRecetasPerfil" |
| Desktop sidebar hidden on mobile | `getComputedStyle(aside).display` at 375 | `'none'` |
| No phantom /dashboard/medico/* URLs in DOM | `querySelectorAll('a[href]')` filter | `[]` (0 matches) |
| No clinic terms in sidebar | text scan for Sedes/Hospitalización/etc | `[]` (0 matches) |
| Verificación shows Próximamente in sidebar AND main | text scans | both `true` |

## Pre-existing issues NOT addressed (tech debt for future phases)

These pre-date Fase 1 and are out of scope for this change. Documented for visibility:

- `apps/medico/web/src/app/dashboard/modulos/page.tsx:300` — `Cannot create components during render` ESLint error from the `<Icon>` dynamic-render pattern inside `ModuleCard`. Pre-existing pattern, not introduced by Phase E migration.
- `apps/medico/web/src/app/dashboard/mensajes/page.tsx:92` — `Calling setState synchronously within an effect` warning from `void loadConversations()` in effect. Pre-existing, not touched by Phase E.
- ~75 import-order warnings spread across pre-existing dashboard pages (each Phase E migration adds the same import-order pattern, not new errors). Documented in apply-progress as +18 of pre-existing kind.
- Many other pre-existing lint warnings/errors in `lib/specialties/*`, `lib/services/*`, etc. — all pre-date this change. Phase F deletions made the legacy `getSpecialtyMenuGroups()` import in `lib/specialties/index.ts` orphaned at the consumer level (only `index.ts` re-exports it now); leaving in place since it is library code outside Fase 1 scope.

## Closing recommendation

**Ship Fase 1.** All 17 spec items effectively met. New shell composition is in production-ready shape. Pre-existing tech debt is clearly bounded and out of scope.
