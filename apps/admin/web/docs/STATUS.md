# Red Salud Admin Web — Estado del Proyecto

> Última actualización: 2026-05-01
> Founder: Freddy (`firf.1818@gmail.com`) — único super_admin
> URL local: `http://localhost:3011`
> Supabase project: `hwckkfiirldgundbcjsp`

---

## 1. Resumen ejecutivo

Centro de control interno para Red Salud (1 founder, automatización con IA). Web app Next.js 15 sobre puerto 3011, integrada con el mismo proyecto Supabase del resto del ecosistema. Acceso restringido a empleados internos vía tabla `admin_roles`. Toda acción auditada en `admin_audit_log`.

**Estado global**: MVP funcional con 7 módulos en producción + capa de analytics + alertas automatizadas + crons nativos. Listo para uso por founder.

---

## 2. Stack y arquitectura

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js 15 + App Router + Turbopack | 15.5.14 |
| Lenguaje | TypeScript strict | 5.6+ |
| Estilos | Tailwind CSS 4 | 4.0 |
| Auth | Supabase Auth + Google OAuth | @supabase/ssr 0.6.1 |
| DB | Supabase Postgres 17 | — |
| State server | TanStack React Query | 5.64 |
| Tablas | TanStack React Table | 8.20 |
| Charts | Recharts | 2.15 |
| Validación | Zod | 3.24 |
| Toasts | Sonner | 2.0 |
| Iconos | lucide-react | 0.474 |

### Aislamiento de sesión
- Cookie name único: `sb-rs-admin-auth-token`. No colisiona con paciente/medico/farmacia que comparten `localhost`.
- Sesión Supabase + chequeo en `admin_roles` en cada request (middleware doble guard).

### Seguridad de service role
- `SUPABASE_SERVICE_ROLE_KEY` solo en server (`import 'server-only'` en `lib/supabase/admin.ts`).
- Cualquier import accidental desde Client Component → build error.
- Cada query con service role pasa por `withAudit()` → registra en `admin_audit_log`.

### Headers
`X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` + `X-Frame-Options: DENY` + `Permissions-Policy` que bloquea cámara/mic/geo. La app NUNCA debe ser indexada.

---

## 3. Esquema de base de datos (cambios introducidos)

### Migraciones aplicadas en producción

| Migración | Tablas/objetos | Estado |
|-----------|----------------|--------|
| `20260430000000_admin_panel_schema` | `admin_role_type` enum, `admin_roles`, `admin_audit_log`, `is_admin()`, `has_admin_role()` + RLS | ✅ aplicada |
| `20260501000000_analytics_metrics_alerts` | `analytics_events`, `metrics_daily_global`, `metrics_daily_by_app`, `metrics_doctor_performance`, `system_alerts` (con `alert_severity` enum), `refresh_metrics_daily_global()`, `refresh_metrics_daily_by_app()`, `live_kpis()` | ✅ aplicada |
| `enable_pg_cron` | extension `pg_cron` | ✅ aplicada |
| `run_metrics_alerts_function` | `run_metrics_alerts()` (PL/pgSQL nativo, 4 reglas) | ✅ aplicada |
| `schedule_metrics_crons` | 2 jobs en `cron.job` | ✅ aplicada |
| `fix_payment_status_enum_values` | patch enum mismatch (`'succeeded'`→`'approved'`, `'scheduled'`→`'pending'`) | ✅ aplicada |
| `feature_flags_and_announcements_extensions` | `feature_flags` + columnas adicionales en `system_announcements` + RLS | ✅ aplicada |

### Tablas creadas por el admin

- `admin_roles` — orthogonal a `profiles.role`. Roles: `super_admin`, `support`, `finance`, `ops`, `read_only`.
- `admin_audit_log` — append-only. Cada acción admin registra actor, IP, UA, request_id, status.
- `analytics_events` — event stream alta volumen para todas las apps cliente. Sin PII.
- `metrics_daily_global` — KPIs globales agregados por día.
- `metrics_daily_by_app` — actividad por app por día.
- `metrics_doctor_performance` — snapshot mensual por médico.
- `system_alerts` — alertas automáticas del cron.
- `feature_flags` — remote config para apps cliente (key, enabled, rollout_percent, target_apps, target_roles).

### Tablas extendidas

- `system_announcements` — agregadas: `priority`, `starts_at`, `expires_at`, `published_by`, `updated_at`. Nuevas RLS (public ve activos+vigentes, admin ve todo).
- `support_tickets` — RLS nuevas (admin select all, anyone insert, no update/delete público).

---

## 4. Edge Functions y Cron Jobs

### Edge Functions deployadas

| Nombre | Status | Trigger |
|--------|--------|---------|
| `metrics-aggregate` | active | manual (Bearer service_role) — backup. Cron real es pg_cron. |
| `metrics-alerts` | active | manual (Bearer service_role) — backup. Cron real es pg_cron. |

### Cron Jobs nativos (`cron.job`)

| Job | Schedule | Acción | Activo |
|-----|----------|--------|--------|
| `refresh-metrics-daily` | `0 7 * * *` (03:00 Caracas) | Refresca `metrics_daily_global` + `metrics_daily_by_app` (ayer + hoy) | ✅ |
| `run-metrics-alerts` | `*/5 * * * *` | Corre 4 reglas de alertas → escribe `system_alerts` | ✅ |

### Reglas de alerta implementadas

| Regla | Condición | Severidad |
|-------|-----------|-----------|
| `error_rate_spike` | >2% `error.client` en últimos 5min (mín 50 eventos) | high |
| `cancellation_spike` | >25% appointments cancelladas en 24h (mín 20) | medium |
| `payment_failure_rate` | >10% pagos rejected en 1h (mín 10) | high |
| `sacs_queue_stale` | médicos con SACS pendiente > 7 días | low |

Cada regla solo dispara si NO hay otra alerta abierta del mismo `rule_name` (no spam).

---

## 5. Módulos UI implementados

### `/dashboard` — Live KPIs
9 cards: usuarios totales, nuevos hoy, médicos activos 30d, médicos SACS, citas hoy, citas pendientes, ingresos USD/VES del mes, alertas abiertas.
Una sola roundtrip a la DB via RPC `live_kpis()`.

### `/dashboard/users` — Buscador unificado
Búsqueda por email, nombre, primer/último apellido, teléfono, **cédula** (`national_id`), RIF, UUID exacto.
Auditado: cada query registrada con la string buscada.

### `/dashboard/users/[id]` — Perfil cross-domain
13 queries paralelas. 6 paneles:
- Identidad (cédula, RIF, fecha nacimiento, dirección, 2FA, plan)
- Citas (total, próximas, canceladas, últimos 30 días)
- Pagos (cantidad, total USD, total VES, último)
- Actividad clínica (recetas, notas, órdenes lab, documentos)
- Reseñas (dadas, recibidas, rating promedio)
- SACS (si rol médico)

### `/dashboard/alerts` — Alertas
Lista de alertas abiertas + últimas 20 resueltas. Botón "Resolver" con notas opcionales. Estilo por severidad.

### `/dashboard/employees` — Gestión de admins
- Tabla agrupada por usuario (todos los roles del usuario en una fila).
- Form para buscar usuario por email + dropdown de rol + notas → otorgar.
- Botón revocar por rol. Bloquea auto-revoke de tu propio super_admin.

### `/dashboard/announcements` — Anuncios broadcast
- CRUD + activar/desactivar.
- Targets: `all`, `paciente`, `medico`, `farmacia`, `clinica`, `laboratorio`, `secretaria`, `seguro`, `ambulancia`, `academia`.
- Tipos: `info`, `warning`, `success`, `maintenance`. Prioridades: `low`, `normal`, `high`. Expiración opcional.

### `/dashboard/feature-flags` — Remote config
- CRUD con key validada (`^[a-z][a-z0-9_.-]*$`).
- Toggle on/off + slider 0-100% rollout.
- Multi-select target apps y target roles (vacío = todas/todos).

### `/dashboard/support` — Tickets
- Lista con filtros (status, priority, search texto en subject/email/name).
- Cambio de estado en línea (`NUEVO`, `EN_PROGRESO`, `ESPERANDO_USUARIO`, `RESUELTO`, `CERRADO`).
- Botón "Tomar" para auto-asignación.

### `/dashboard/audit` — Audit log viewer
- Filtros por acción, email del actor, status (`success`/`denied`/`error`).
- Paginación de 100. Hasta 500 filas por página.

---

## 6. Capa Analytics (api-client)

`packages/api-client/src/analytics.ts`:
- `initAnalytics({ supabase, appSource })` — llamar una vez por app boot.
- `track(eventName, options)` — emite evento a `analytics_events`. Auto-incluye actor_id, role, session_id, UTMs.
- `ANALYTICS_EVENTS` — 19 constantes pre-definidas (auth.*, appointment.*, prescription.*, payment.*, chat.*, review.*, error.client).
- Dependency-free — usa structural typing, no importa `@supabase/supabase-js`.
- Failures swallowed — analytics nunca rompe el flujo de producto.

**Uso pendiente**: ninguna app cliente tiene `initAnalytics` aún. Tabla `analytics_events` está vacía.

---

## 7. RBAC

### Roles y permisos

5 roles, 22 permisos.

| Rol | Permisos |
|-----|----------|
| `super_admin` | Todos (22) |
| `support` | users.* (search/view/impersonate/reset_password), doctors.view, patients.view, appointments.* (view/cancel), announcements.view, support.* (view/manage), alerts.view |
| `finance` | users.view/search, doctors.view, patients.view, appointments.view, finance.* (view/refund), alerts.view, audit.view |
| `ops` | users.view/search, doctors.* (view/manage), feature_flags.* (view/toggle), announcements.* (view/publish), alerts.* (view/resolve), audit.view, system.settings |
| `read_only` | users.view/search, doctors.view, patients.view, appointments.view, finance.view, alerts.view, audit.view |

### Ubicación
- `apps/admin/web/src/lib/rbac/types.ts` — enum + permission map.
- `apps/admin/web/src/lib/rbac/check.ts` — `getAdminSession`, `requireAdmin`, `requirePermission`.
- Sidebar filtra entries por permission del usuario activo.
- Cada server action gateada con `requirePermission()`.

---

## 8. Verified DB facts (2026-05-01)

NO ASUMIR. Estos valores fueron validados contra la DB en vivo:

- **`payment_status` enum**: `pending | approved | rejected` (NO `succeeded|failed`).
- **`appointment_status` enum**: `pending | confirmed | completed | cancelled | waiting | in_progress | no_show` (NO `scheduled`).
- **`user_role` enum**: `medico, paciente, farmacia, laboratorio, clinica, aseguradora, ambulancia, admin, corporate, auditor, gerente, administrador, contador, rrhh, soporte, analista, supervisor`. Incluye `'admin'` (legacy 2024) pero NO se usa para gating del admin panel — fuente de verdad es `admin_roles`.
- **`payments.currency`**: `text` (no enum), default `'VES'`, valores `'USD'` o `'VES'` (uppercase).
- **`payments` columns**: usa `user_id` (NO `patient_id`/`doctor_id`).
- **`profiles.id`**: igual a `auth.users.id` (1:1).
- **`profiles` tiene** ~46 columnas incluyendo `national_id`, `rif`, `first_name/last_name`, `sacs_*`, `cne_*`, `two_factor_*`, `subscription_type`, `profile_locked`, `deleted_at`.

---

## 9. Bootstrap actual

- 1 super_admin: `firf.1818@gmail.com` (auth.users.id `1eb10dac-6909-422c-a2b0-ddf54c1897fe`).
- Provider: Google OAuth.
- Inserción directa via SQL en `admin_roles` (registrada en audit con action `admin.bootstrap.direct`).
- `ADMIN_BOOTSTRAP_EMAILS=firf.1818@gmail.com` en `.env.local` (respaldo, no usado más).
- Service role key: en `.env.local`. **TODO**: rotar después de testing.

---

## 10. Estructura de archivos

```
apps/admin/web/
├── .env.local                      ← URL + anon + service_role + bootstrap email
├── CLAUDE.md                       ← reglas de seguridad + facts verificados
├── next.config.ts                  ← noindex, X-Frame-Options DENY, headers
├── package.json                    ← @red-salud/admin-web, port 3011
├── postcss.config.mjs / tsconfig.json
├── docs/
│   ├── metrics-plan.md             ← plan completo de métricas
│   └── STATUS.md                   ← este archivo
└── src/
    ├── middleware.ts               ← doble guard (sesión + admin_roles) + cookie name único
    ├── app/
    │   ├── layout.tsx              ← Sonner toaster, robots noindex
    │   ├── page.tsx                ← redirect /dashboard
    │   ├── globals.css
    │   ├── api/health/route.ts
    │   ├── auth/
    │   │   ├── login/{page,login-form}.tsx   ← email/password + Google OAuth
    │   │   └── callback/route.ts             ← PKCE exchange
    │   ├── unauthorized/{page,bootstrap-button}.tsx
    │   └── dashboard/
    │       ├── layout.tsx
    │       ├── page.tsx                       ← live KPIs
    │       ├── users/{page,user-search}.tsx
    │       ├── users/[id]/{page,profile-panel}.tsx
    │       ├── alerts/{page,alerts-list}.tsx
    │       ├── employees/{page,grant-form,employees-table}.tsx
    │       ├── announcements/{page,announcements-manager}.tsx
    │       ├── feature-flags/{page,flags-manager}.tsx
    │       ├── support/{page,tickets-manager}.tsx
    │       └── audit/{page,audit-table}.tsx
    ├── components/
    │   ├── shell/{sidebar,topbar}.tsx
    │   └── dashboard/kpi-card.tsx
    └── lib/
        ├── supabase/{client,server,admin,cookie-name}.ts
        ├── rbac/{types,check,index}.ts
        ├── audit/{logger,query,index}.ts
        ├── bootstrap/actions.ts
        ├── users/{search,profile}.ts
        ├── employees/actions.ts
        ├── alerts/actions.ts
        ├── announcements/actions.ts
        ├── feature-flags/actions.ts
        ├── support/actions.ts
        └── metrics/live.ts
```

---

## 11. Pendiente — orden recomendado

### Prioridad 1 — Visibilidad operativa
- [ ] **Listado de doctors** `/dashboard/doctors` — tabla con filtros (especialidad, ciudad, SACS verificado, citas mes), drilldown a perfil.
- [ ] **Listado de patients** `/dashboard/patients` — tabla con filtros, perfil de salud, link a appointments.
- [ ] **Listado de appointments** `/dashboard/appointments` — vista global cross-doctor, filtros (fecha, status, ciudad), botón cancelar.
- [ ] **Listado de finance** `/dashboard/finance` — tabla de payments, totales por mes, refunds, top doctors por ingreso.

### Prioridad 2 — Cerrar el loop de analytics
- [ ] Instrumentar `track()` en `paciente_web` — booking funnel completo: searched → viewed → created → paid → confirmed.
- [ ] Instrumentar `track()` en `medico_web` — confirmed → completed/no_show → review.
- [ ] Instrumentar `track()` en `farmacia_web` — prescription.dispensed.
- [ ] Reemplazar live_kpis con datos reales una vez que `analytics_events` tenga volumen.

### Prioridad 3 — IA para founder solo
- [ ] **Daily digest IA** — Edge Function diario 08:00 Caracas que lee pre-agregados, los pasa a Claude/Gemini, manda email/WhatsApp con anomalías.
- [ ] **Chat sobre métricas** — chat box en `/dashboard` donde preguntás "¿qué pasó con farmacia esta semana?" y el LLM consulta pre-agregados.
- [ ] **Auto-triage de tickets** — LLM clasifica ticket entrante y sugiere respuesta.

### Prioridad 4 — Configuración del sistema
- [ ] **Página `/dashboard/settings`** — system-wide config (timezone, monedas, exchange rates).
- [ ] **Página /perfil del admin** — cambiar password, configurar 2FA, ver sesiones activas.
- [ ] **Resolución bulk de alertas** del mismo `rule_name`.

### Prioridad 5 — Cosas de seguridad pendientes
- [ ] **Rotar service_role key** (founder mencionó que iba a hacerlo después).
- [ ] **2FA mandatory** para admin panel — actualmente Google OAuth ya da segundo factor, pero forzar TOTP/Yubikey para super_admin.
- [ ] **IP allowlist** — definir si vamos con Cloudflare Access, Tailscale, o Supabase IP-allowlist.
- [ ] **Cookie names únicos** en las otras apps cliente (paciente/medico/farmacia siguen usando default → colisionan entre ellas).

### Prioridad 6 — Robustez
- [ ] **Tests E2E** del flujo de login + dashboard.
- [ ] **Sentry o similar** para errores en el admin.
- [ ] **Backup** automatizado de `admin_audit_log` con retención larga.
- [ ] **Soft delete** en `feature_flags` (hoy es DELETE permanente).

### Prioridad 7 — Tauri wrapper (eventual)
- [ ] Solo cuando vos quieras app de escritorio nativa con tray icon, biometric login, etc. No urgente.

---

## 12. Variables de entorno

Archivo: `apps/admin/web/.env.local` (NO commiteable).

```
NEXT_PUBLIC_SUPABASE_URL=https://hwckkfiirldgundbcjsp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon JWT>
SUPABASE_SERVICE_ROLE_KEY=<service_role JWT — server only>
ADMIN_BOOTSTRAP_EMAILS=firf.1818@gmail.com
ADMIN_SESSION_TIMEOUT_MIN=30
```

---

## 13. Comandos comunes

```bash
# Dev (puerto 3011)
pnpm --filter @red-salud/admin-web dev

# Typecheck
pnpm --filter @red-salud/admin-web typecheck

# Build prod
pnpm --filter @red-salud/admin-web build

# Aplicar nueva migración
# (via Supabase MCP apply_migration o supabase db push)

# Ver crons activos
psql ... -c "select * from cron.job;"

# Disparar metrics-aggregate manual
psql ... -c "select public.refresh_metrics_daily_global(current_date);"

# Disparar alertas manual
psql ... -c "select public.run_metrics_alerts();"
```

---

## 14. Reglas non-negotiable

1. NEVER expose service role en `NEXT_PUBLIC_*`.
2. NEVER skip el wrapper `withAudit` en server actions del admin.
3. NEVER asumir valores de enum o columnas — siempre verificar contra DB primero.
4. NEVER importar de otras apps. El admin lee cross-domain solo via service-role + audit.
5. La app NUNCA debe ser indexada (headers + robots ya lo bloquean).
6. La app NUNCA es pública. Detrás de VPN/Cloudflare Access/IP allowlist en producción.
