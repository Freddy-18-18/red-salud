# Red Salud — Plan de Métricas y Observabilidad

> Pensado para una empresa de **un solo founder** con automatización IA. La regla principal: si no podés ver una métrica desde el panel admin, no existe — no quiero pegarme a SQL ad-hoc para responder preguntas básicas.

---

## 0. Principios

1. **Una sola fuente de verdad para cada KPI.** Si dos pantallas muestran "MRR", la consulta es la misma — vive en `lib/metrics/<dominio>.ts` y se reutiliza.
2. **Pre-agregados para todo lo recurrente.** El dashboard NO recalcula sobre `appointments` cada vez que abrís — usa una `materialized view` o tabla `metrics_daily_*` refrescada por cron. El detalle queda para drill-down.
3. **Eventos > snapshots.** Cualquier acción que tenga valor analítico (booking creado, cita confirmada, pago iniciado, cita cancelada) emite un evento a `analytics_events` con `actor_id`, `actor_role`, `app_source`, `event_name`, `payload`, `occurred_at`. Las métricas se derivan de los eventos, no del estado.
4. **Todo etiquetado por `app_source`.** Cada evento dice de qué app vino (`paciente_web`, `medico_mobile`, `farmacia_desktop`, etc.). Permite separar tráfico, retención, errores por app.
5. **Automatización primero.** Cualquier métrica que cruce un umbral (e.g. error_rate > 1%) dispara un anuncio interno o un job. No esperamos a que un humano la mire.

---

## 1. KPIs globales (dashboard principal)

| KPI | Fuente | Frecuencia | Owner |
|-----|--------|------------|-------|
| MAU / DAU por app                         | `analytics_events`                    | tiempo real (5 min)  | growth |
| Usuarios totales por rol                  | `profiles`                            | tiempo real          | ops |
| Médicos activos (con cita en últimos 30d) | `appointments` ∩ `profiles role=medico` | hourly             | ops |
| Médicos verificados SACS                  | `profiles.sacs_verified`              | tiempo real          | ops |
| Citas hoy / esta semana                   | `appointments.scheduled_at`           | tiempo real          | ops |
| Tasa de no-show                           | `appointments.status = no_show / total agendadas` | daily      | ops |
| Tasa de cancelación                       | `appointments.status = cancelled / total agendadas` | daily    | ops |
| MRR (USD + VES)                           | `payments` recurrentes                | daily                | finance |
| Ingresos del mes                          | `payments` agregados                  | daily                | finance |
| ARPU                                      | MRR / usuarios pagos activos          | daily                | finance |
| Churn mensual                             | `subscription_cancellations`          | monthly              | finance |
| Tickets de soporte abiertos               | `support_tickets` (por crear)         | tiempo real          | support |
| Salud por app (uptime + p95 latency)      | gateway logs                          | tiempo real          | ops |
| Errores en últimas 24h                    | `client_errors` (por crear)           | tiempo real          | ops |

---

## 2. Métricas por dominio

### Paciente
- Pacientes registrados (acumulado, nuevos/día)
- % perfil completo (cédula verificada, foto, datos médicos)
- Tasa de conversión búsqueda → reserva
- Tiempo promedio entre registro y primera cita
- Re-booking rate (% pacientes que reservan 2da vez en 90d)
- Documentos cargados por paciente (avg)
- Adopción de "perfil de emergencia" (% activado)

### Médico
- Médicos onboarded (vs verificados SACS)
- Tiempo desde registro hasta primera cita
- Citas/médico/mes (distribución, top 10, mediana)
- Ingresos/médico/mes
- Reviews promedio por médico
- Tasa de respuesta a mensajes en chat (< 24h)
- Médicos que usan templates de receta (proxy de adopción)

### Farmacia
- Farmacias activas (con ventas en últimos 30d)
- Ventas/día por farmacia
- Top 20 productos vendidos
- Recetas digitales canjeadas / total recetas emitidas
- Inventario bajo stock (alerta)
- Tiempo promedio entre receta emitida y dispensada

### Laboratorio
- Órdenes/día
- Tiempo orden → resultado (p50, p95)
- Tasa de re-tomas (% muestras rechazadas)
- Resultados entregados < 24h

### Clínica
- Clínicas onboardeadas
- Médicos por clínica
- Ocupación de salas (si tracked)
- Ingresos por clínica

### Seguro
- Pólizas activas
- Reclamos pendientes
- Tiempo aprobación reclamo (p50, p95)
- Ratio aprobación / rechazo

### Ambulancia
- Despachos/día
- Tiempo respuesta (despacho → llegada)
- Cobertura geográfica

### Academia
- Cursos publicados
- Completion rate
- Certificaciones emitidas
- Tiempo promedio en curso

---

## 3. Funnels críticos

Estos hay que medirlos COMO funnel, paso a paso, para encontrar dónde se cae el usuario.

### Funnel: Reserva de cita (paciente)
1. Visita home paciente
2. Busca médico (por especialidad / nombre)
3. Selecciona médico → ve perfil
4. Selecciona horario
5. Llega a checkout
6. Paga
7. Cita confirmada

→ Conversión global y dropoff por paso. Si el paso 5→6 cae al 30%, ahí hay un problema (precio? UX? confianza?).

### Funnel: Onboarding médico
1. Registro
2. Email confirmado
3. Datos profesionales completados
4. Verificación SACS
5. Primer horario configurado
6. Primera cita recibida
7. Primer pago recibido

→ Cada paso tiene una mediana de tiempo. Si el paso 4 tarda > 7 días en mediana, hay fricción.

### Funnel: Compra en farmacia
1. Receta recibida (digital o física)
2. Búsqueda de farmacia
3. Carrito armado
4. Checkout
5. Pago
6. Despacho
7. Entrega confirmada

### Funnel: Suscripción (cualquier app pagada)
1. Trial iniciado
2. Trial 50% consumido
3. Trial expirado
4. Conversión a pago

---

## 4. Esquema de eventos analíticos

Tabla `public.analytics_events` (a crear en próxima migración):

```sql
create table public.analytics_events (
  id            bigserial primary key,
  occurred_at   timestamptz not null default now(),
  event_name    text not null,            -- 'appointment.created', 'payment.succeeded'
  app_source    text not null,            -- 'paciente_web', 'medico_mobile', etc.
  actor_id      uuid,                     -- nullable para eventos anónimos
  actor_role    text,                     -- 'paciente', 'medico', 'anon'
  session_id    text,
  resource_type text,
  resource_id   text,
  payload       jsonb,
  ip_address    inet,
  user_agent    text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text
);

create index analytics_events_event_name_idx on public.analytics_events (event_name, occurred_at desc);
create index analytics_events_actor_idx     on public.analytics_events (actor_id, occurred_at desc);
create index analytics_events_app_source_idx on public.analytics_events (app_source, occurred_at desc);
```

### Eventos mínimos por app

Cada app emite estos eventos vía un helper en `@red-salud/api-client/analytics.track(event, payload)`.

| Evento | Quién emite | Cuándo |
|--------|-------------|--------|
| `auth.signed_up`         | cualquier app | nuevo usuario |
| `auth.logged_in`         | cualquier app | login exitoso |
| `auth.failed`            | cualquier app | login fallido (sin password en payload!) |
| `appointment.searched`   | paciente      | usuario hace búsqueda |
| `appointment.viewed`     | paciente      | abre perfil de un médico |
| `appointment.created`    | paciente      | reserva una cita |
| `appointment.paid`       | paciente      | completó pago |
| `appointment.confirmed`  | medico        | médico confirma |
| `appointment.cancelled`  | cualquiera    | cancelación (incluye actor_role) |
| `appointment.completed`  | medico        | finaliza consulta |
| `appointment.no_show`    | medico        | paciente no apareció |
| `prescription.issued`    | medico        | emite receta |
| `prescription.dispensed` | farmacia      | despacha receta |
| `payment.initiated`      | cualquiera    | inicia pago |
| `payment.succeeded`      | cualquiera    | pago confirmado |
| `payment.failed`         | cualquiera    | falla |
| `chat.message_sent`      | cualquiera    | mensaje en chat |
| `review.submitted`       | paciente      | review post-cita |
| `error.client`           | cualquier app | excepción capturada en cliente |

---

## 5. Pre-agregados

Tablas/views a refrescar por cron (Supabase Edge Function diaria + hourly).

### `metrics_daily_global`
```
date | total_users | new_users | active_users | mau | dau
     | total_appointments | completed | cancelled | no_show
     | revenue_usd | revenue_ves | new_payments
```

### `metrics_daily_by_app`
```
date | app_source | sessions | unique_users | events | errors
```

### `metrics_doctor_performance`
```
doctor_id | month | appointments_count | completed | cancelled
          | revenue_usd | avg_rating | new_patients | reviews_count
```

### `metrics_funnel_booking`
```
date | step_1_search | step_2_view | step_3_select | step_4_checkout
     | step_5_payment | step_6_confirmed
```

Refresh cadence:
- `metrics_daily_*`: cron diario a las 03:00 America/Caracas
- `metrics_funnel_*`: cron cada 6h
- KPIs en vivo (DAU, citas hoy, ingresos hoy): query directa con índices

---

## 6. Alertas automáticas

Cron cada 5 minutos chequea reglas; si dispara → escribe en `system_alerts` y manda email/Slack/SMS al founder.

| Alerta | Trigger | Severidad |
|--------|---------|-----------|
| Error rate > 2% en 5 min        | `analytics_events` event_name = 'error.client' | high |
| App down (no eventos en 10 min de app activa) | sin eventos        | high |
| MRR cae > 5% en una semana                    | metrics_daily      | medium |
| Tasa cancelación > 25% en 24h                 | metrics_daily      | medium |
| Pago fallido > 10% en 1h                      | analytics_events   | high |
| SACS verification queue > 7 días              | profiles           | low |
| Soporte ticket sin respuesta > 24h            | support_tickets    | medium |
| Inventario farmacia < umbral mínimo           | farmacia_inventory | medium |
| Médico nuevo sin primera cita en 14 días      | profiles+appointments | low |
| Trial expira en 3 días sin pago               | profiles           | low (oportunidad de venta) |

Tabla `system_alerts`: id, created_at, rule_name, severity, payload, resolved_at, resolved_by.

---

## 7. Cosas que NO querés calcular en runtime

- Cohorts de retención (calcular semanal)
- LTV por usuario (calcular mensual)
- Mapa de calor geográfico (calcular diario)
- Top médicos / farmacias / clínicas (calcular diario)

Estas viven en `metrics_*` tables refrescadas por cron, NO se calculan al abrir el dashboard.

---

## 8. Privacidad / cumplimiento

- `analytics_events.payload` NUNCA contiene PII directa: nada de email, cédula, nombre completo, dirección, números de tarjeta.
- IDs siempre, datos sensibles nunca.
- IP queda guardada hasta 90 días → luego se trunca a /24 (IPv4) o /48 (IPv6).
- `analytics_events` tiene retención de 18 meses; pre-agregados infinitos.
- Si un usuario pide eliminación (GDPR-style), `actor_id` se nulea pero las métricas agregadas quedan.

---

## 9. Roadmap de implementación

| Fase | Qué | Cuándo |
|------|-----|--------|
| 1    | Tabla `analytics_events` + helper `track()` en api-client    | semana 1 |
| 2    | Instrumentar 10 eventos críticos en paciente_web             | semana 1 |
| 3    | Dashboard global con KPIs en vivo (queries directas)         | semana 2 |
| 4    | Tablas `metrics_daily_*` + cron de pre-agregación            | semana 2-3 |
| 5    | Instrumentar resto de apps (medico, farmacia, lab)           | semana 3-4 |
| 6    | Sistema de alertas (`system_alerts` + cron 5 min)            | semana 4 |
| 7    | Dashboards drill-down por dominio                            | semana 5+ |
| 8    | Cohorts, retención, LTV (jobs mensuales)                     | mes 2 |
| 9    | IA: chat sobre las métricas — "decime qué pasó este mes"     | mes 2-3 |

---

## 10. La capa de IA (relevante para founder solo)

Cuando estés solo, no podés mirar 30 dashboards al día. La IA tiene que mirar por vos.

- **Daily digest IA**: cron diario a las 8:00 AM Caracas — un Edge Function lee los pre-agregados, los pasa por Claude/Gemini, y manda un email/WhatsApp con las anomalías ("ayer las cancelaciones subieron 40%, los ingresos bajaron 12% — el médico X recibió 5 cancelaciones, posible causa Y").
- **Chat sobre métricas**: en el panel admin, un chat box donde preguntás "¿qué pasó con las ventas de farmacia esta semana?" y el LLM consulta los pre-agregados y responde.
- **Auto-triage de tickets**: cualquier ticket entrante pasa por LLM que clasifica + sugiere respuesta. Vos solo confirmás o reescribís.
- **Detección de fraude / abuso**: patrones raros (múltiples bookings cancelados desde misma IP, pagos fallidos en cascada) → alerta automática.
- **Resumen ejecutivo semanal**: cron domingo, resumen de la semana, oportunidades, riesgos, decisiones a tomar.

Eso es lo que reemplaza al "equipo de growth + finance + ops" cuando sos uno solo.
