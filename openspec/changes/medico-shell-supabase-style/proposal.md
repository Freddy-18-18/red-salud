# Proposal: Supabase-style shell para medico/web

## Intent

El dashboard actual de `medico/web` ya envia Fase 1 (DashboardShell + DesktopSidebar + per-page header), pero sufre tres dolores concretos: densidad visual baja (sidebar 72px con texto siempre visible), jerarquia ausente (no hay breadcrumbs globales — solo per-page), y acciones rapidas no descubribles (Gemini ICD-11, capability alerts y feedback estan dispersos). Este cambio refactoriza el shell en sitio para alcanzar la estetica Supabase Dashboard: sidebar 48px colapsada por defecto con tooltips Radix, header global con breadcrumbs `Doctor > Sede > Modulo` + cluster de 4 acciones (Search / AI Assistant / Help / Advisor), y multi-sede de practica privada propio del dominio medico. Sin tocar el resto del monorepo.

## Scope

### In Scope
- Refactor `desktop-sidebar.tsx`: ancho colapsado 48px default, tooltips Radix, dividers entre grupos, attention dots por NavLink
- Nuevo `global-header.tsx` con breadcrumbs `Doctor > Sede > Modulo` + cluster de 4 botones
- Tabla `doctor_practice_locations` (Supabase) + RLS (doctor lee/escribe solo las propias) + migration
- UI `/dashboard/sedes` para CRUD de consultorios privados del medico
- Tracking de sede activa via cookie `active_sede_id` + URL param `?sede=`
- Extender `packages/design-system/src/styles/tokens.css` con 8 tokens Supabase-position + paridad dark
- Command palette `Ctrl K` con busqueda sobre pacientes / modulos / citas
- Resurfacing del Gemini ICD-11 existente como boton AI Assistant persistente en header
- Advisor button con red-dot atado a capability engine (verificationPending) + estado SACS

### Out of Scope
- Extraccion del shell a `@red-salud/design-system` (follow-up `design-system-app-shell`)
- Adopcion del primitivo shadcn `Sidebar`
- Rediseno mobile completo (solo truncacion de breadcrumb)
- Boton SQL Editor (no aplica a app clinica)

## Capabilities

### New Capabilities
- `app-shell-medico`: shell stylized estilo Supabase para medico/web — sidebar icon-only colapsada + header con breadcrumbs y quick actions
- `doctor-practice-locations`: gestion multi-sede para practica privada individual del medico con tracking de sede activa
- `command-palette-medico`: `Ctrl K` global sobre pacientes, modulos y citas

### Modified Capabilities
- `doctor-capabilities`: el resolver expone flags de atencion (`verificationPending`, `sacsExpired`) consumidos por sidebar attention dot y Advisor button

## Approach

Rollout en 4 fases independientemente shippeables, gobernadas por flag `FEATURE_NEW_SHELL` (env). **Fase 1**: extender `tokens.css` (8 tokens + dark) + refactor `desktop-sidebar.tsx` (48px colapsada default + Radix tooltips + dividers + attention dots). **Fase 2**: `global-header.tsx` + breadcrumbs + cluster de 4 acciones (Advisor y AI Assistant reusan integraciones existentes — capability engine + Gemini ICD-11). **Fase 3**: migration `doctor_practice_locations` + RLS + UI `/dashboard/sedes` + `useActiveSede` hook. **Fase 4**: command palette `Ctrl K` indexado sobre cache de TanStack Query. Cada fase ships con flag OFF; cutover via flip cuando QA + Playwright verde.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `apps/medico/web/src/components/shell/desktop-sidebar.tsx` | Modified | 48px collapsed default, Radix tooltips, dividers, attention dots |
| `apps/medico/web/src/components/shell/dashboard-shell.tsx` | Modified | Thread global-header props + TooltipProvider |
| `apps/medico/web/src/components/shell/global-header.tsx` | New | Breadcrumbs + 4 action cluster |
| `apps/medico/web/src/components/shell/breadcrumb-picker.tsx` | New | Sede picker popover |
| `apps/medico/web/src/components/shell/command-palette.tsx` | New | Ctrl K palette |
| `apps/medico/web/src/components/shell/advisor-button.tsx` | New | Red-dot + alerts dropdown |
| `apps/medico/web/src/components/shell/ai-assistant-button.tsx` | New | Gemini ICD-11 resurfacer |
| `apps/medico/web/src/app/dashboard/sedes/page.tsx` | New | Sede management UI |
| `apps/medico/web/src/lib/sedes/` | New | Service + hooks `doctor_practice_locations` |
| `apps/medico/web/src/hooks/use-active-sede.ts` | New | Active sede tracker |
| `apps/medico/web/src/lib/capabilities/resolver.ts` | Modified | Expose `verificationPending` + `sacsExpired` |
| `packages/design-system/src/styles/tokens.css` | Modified | 8 tokens + dark parity |
| `supabase/migrations/` | New | `doctor_practice_locations` + RLS |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Tokens nuevos rompen contrast ratios Caribbean Trust | Medium | Visual regression + a11y audit por fase |
| RLS de `doctor_practice_locations` filtra data entre medicos | Low | RLS fixtures + Supabase advisor scan en Fase 3 |
| Cutover de `FEATURE_NEW_SHELL` regresiona paginas existentes | Medium | Flag OFF en Fase 1; Playwright + QA manual antes de flip |
| Indice del command palette queda stale | Low | Reusa cache TanStack Query, sin store separado |
| Swap de sede activa con UX ambigua | Medium | Default "Sede principal"; URL param para enlaces compartibles |

## Rollback Plan

Flag `FEATURE_NEW_SHELL` (env). Con `false`, `dashboard-shell.tsx` renderiza la sidebar legacy + sin global-header. Tabla `doctor_practice_locations` es aditiva (nunca requerida). Remover flag = revert total.

## Dependencies

- `Tooltip` Radix de `@red-salud/design-system` (existe, no usado)
- Capability engine (`FEATURE_CAPABILITY_ENGINE`)
- Gemini ICD-11 ya integrado en medico/web
- Supabase RLS (sin infra nueva)

## Success Criteria

- [ ] Sidebar colapsada 48px por default con Radix tooltip en cada NavLink
- [ ] Header muestra `Doctor > Sede > Modulo` con pickers funcionales
- [ ] Los 4 botones del header operan (Search, AI, Help, Advisor)
- [ ] Doctor crea / edita / borra sus sedes via `/dashboard/sedes`
- [ ] Sede activa persiste entre sesiones
- [ ] `Ctrl K` abre palette y encuentra paciente por nombre o CI en <200ms
- [ ] Advisor dot se ilumina cuando SACS expira
- [ ] Cero regresion en las 11 paginas dashboard existentes (Playwright)
- [ ] Lighthouse a11y >=95 en `/dashboard`
- [ ] `FEATURE_NEW_SHELL` alterna entre shell legacy y nuevo sin errores
