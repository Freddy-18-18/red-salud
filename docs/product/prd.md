# PRD — Red Salud (Versión Final)

**Versión:** 2.0 (Final)  
**Fecha:** 2026-02-12  
**Estado:** Listo para ejecución  
**Owner:** Producto + Ingeniería  
**Aprobadores:** Dirección de Producto, Dirección Técnica, Operaciones

---

## 1) Resumen ejecutivo

Red Salud es una plataforma de salud multi-rol para operar procesos clínicos y farmacéuticos en una arquitectura unificada (web, desktop, mobile y servicios). El objetivo de esta versión es consolidar un MVP productivo, medible y escalable, con foco en el flujo crítico:

**Atención médica → receta → validación/dispensación en farmacia → seguimiento por paciente.**

Este documento define alcance, requisitos, arquitectura objetivo, seguridad, calidad, observabilidad, plan de entrega y criterios de aceptación para que no existan vacíos entre negocio y ejecución técnica.

---

## 2) Contexto y problema

### 2.1 Contexto actual

- El monorepo ya contiene aplicaciones por rol/plataforma en `apps/web`, `apps/desktop/*` y `apps/mobile/*`.
- Existen paquetes compartidos (`packages/core`, `packages/types`, `packages/ui`) y migraciones en Supabase (`supabase/migrations`).
- Hay servicios auxiliares desplegables (`services/bcv-rate`, `services/rif-verification`, `services/sacs-verification`).

### 2.2 Problema de negocio

Los actores del ecosistema de salud operan en silos y con baja trazabilidad, lo que genera:

- tiempos operativos altos,
- riesgo de errores administrativos/clínicos,
- baja interoperabilidad entre roles,
- dificultad para medir calidad operativa extremo a extremo.

---

## 3) Visión y propuesta de valor

### 3.1 Visión

Ser la plataforma unificada de operación clínica/farmacéutica que conecta a todos los roles del ciclo de atención con trazabilidad, tiempos de respuesta predecibles y estándares técnicos de nivel productivo.

### 3.2 Propuesta de valor por rol

- **Paciente:** visibilidad del proceso de atención y estado de recetas.
- **Médico:** flujo clínico con menor fricción operativa.
- **Secretaria:** coordinación administrativa centralizada.
- **Farmacia:** validación y despacho con estados auditables.
- **Clínica/Seguro/Ambulancia:** integración operativa gradual sobre la misma base.

---

## 4) Objetivos

### 4.1 Objetivos de negocio

1. Reducir tiempos de ciclo clínico-farmacéutico.
2. Aumentar adopción activa por rol clave.
3. Mejorar trazabilidad operativa y capacidad de auditoría.

### 4.2 Objetivos de producto (MVP)

1. Autenticación y autorización por rol en web.
2. Flujo funcional de receta entre médico, paciente y farmacia.
3. Operación funcional de módulos desktop críticos (farmacia y médico).
4. Consistencia de contratos y lógica compartida entre apps.

### 4.3 Objetivos técnicos

1. Cerrar deuda crítica que afecta velocidad y confiabilidad de entrega.
2. Operar con quality gates mínimos (lint, typecheck, verificadores, build).
3. Instrumentar métricas de uso, latencia, errores y trazabilidad.

---

## 5) Alcance

### 5.1 En alcance (MVP)

#### Web (`apps/web`)

- Rutas de autenticación en `app/(auth)`.
- Rutas protegidas y panel por rol en `app/dashboard/*`.
- Roles actuales detectados: `admin`, `ambulancia`, `clinica`, `farmacia`, `laboratorio`, `medico`, `paciente`, `secretaria`, `seguro`.

#### Desktop (`apps/desktop/*`)

- Operación de módulos: `farmacia`, `medico` (prioridad), y continuidad para otros verticales.

#### Mobile (`apps/mobile/*`)

- Preservación de estructura por rol y compatibilidad de contratos para fases siguientes.

#### Servicios auxiliares (`services/*`)

- Integración operativa de servicios existentes:
  - `bcv-rate`
  - `rif-verification`
  - `sacs-verification`

#### Datos

- Uso de Supabase como capa principal de persistencia y migraciones.

### 5.2 Fuera de alcance (esta versión)

- Integraciones enterprise no críticas para ciclo MVP.
- Automatizaciones avanzadas no indispensables para operación base.
- Re-arquitectura total del monorepo en un solo release.

---

## 6) Usuarios, stakeholders y Jobs-To-Be-Done

### 6.1 Usuarios primarios

1. **Paciente**
2. **Médico**
3. **Secretaria**
4. **Farmacia**

### 6.2 Usuarios secundarios

1. **Clínica**
2. **Seguro**
3. **Ambulancia**
4. **Laboratorio**

### 6.3 JTBD resumidos

- Como médico, quiero emitir y actualizar una receta de forma rápida y trazable para reducir fricción en la consulta.
- Como farmacia, quiero validar y actualizar estados de receta para despachar con control operativo.
- Como paciente, quiero ver mi estado de receta/atención para tomar acciones sin depender de llamadas.
- Como secretaria, quiero coordinar flujos administrativos por rol para reducir cuellos de botella.

---

## 7) Casos de uso críticos (E2E)

### UC-01: Autenticación y entrada por rol

1. Usuario ingresa por autenticación.
2. Sistema valida identidad y rol.
3. Sistema redirige a dashboard correspondiente.

**Resultado esperado:** acceso autorizado por rol, sin fuga de permisos.

### UC-02: Creación y ciclo de receta

1. Médico crea receta asociada a paciente.
2. Paciente visualiza receta y estado.
3. Farmacia recibe receta para validación/dispensación.
4. Farmacia actualiza estado final.

**Resultado esperado:** trazabilidad del estado de principio a fin.

### UC-03: Operación administrativa

1. Secretaria gestiona tareas administrativas asociadas a atención.
2. Cambios impactan la visibilidad del flujo para roles correspondientes.

**Resultado esperado:** coordinación operativa centralizada.

---

## 8) Requisitos funcionales (FR)

### 8.1 Gestión de acceso

- **FR-001:** El sistema debe autenticar usuarios con sesiones válidas.
- **FR-002:** El sistema debe autorizar acceso por rol en rutas protegidas.
- **FR-003:** El sistema debe redirigir automáticamente al dashboard de rol.
- **FR-004:** El sistema debe bloquear acceso cruzado entre paneles no permitidos.

### 8.2 Flujo clínico/farmacéutico

- **FR-005:** El módulo médico debe crear recetas con datos mínimos válidos.
- **FR-006:** El paciente debe consultar estado y datos principales de receta.
- **FR-007:** El módulo farmacia debe listar recetas pendientes y actualizarlas por estado.
- **FR-008:** El sistema debe persistir historial de estados de receta para auditoría.

### 8.3 Operación por rol

- **FR-009:** Secretaría debe gestionar elementos administrativos del flujo.
- **FR-010:** Clínica/Seguro/Ambulancia/Laboratorio deben contar con base de acceso y navegación por rol para su evolución incremental.

### 8.4 Plataforma y servicios

- **FR-011:** Web, desktop y mobile deben compartir contratos de tipos para entidades core.
- **FR-012:** La lógica de negocio reusable debe residir en paquetes compartidos cuando aplique.
- **FR-013:** Los servicios auxiliares deben exponer estado de salud y errores observables.

### 8.5 Auditoría y trazabilidad

- **FR-014:** Cambios de estado críticos deben generar eventos auditables.
- **FR-015:** El sistema debe permitir reconstruir la línea de tiempo de una receta.

---

## 9) Requisitos no funcionales (NFR)

### 9.1 Seguridad y control de acceso

- **NFR-SEC-001:** RBAC obligatorio por rol y ruta.
- **NFR-SEC-002:** Principio de mínimo privilegio en capas de aplicación/datos.
- **NFR-SEC-003:** No exponer secretos en frontend ni en documentación.
- **NFR-SEC-004:** Registro de eventos sensibles para auditoría.

### 9.2 Rendimiento y disponibilidad

- **NFR-PERF-001:** P95 de APIs críticas de consulta < 800 ms (objetivo MVP).
- **NFR-PERF-002:** P95 de mutaciones críticas < 1200 ms (objetivo MVP).
- **NFR-AVAIL-001:** Disponibilidad mensual objetivo del módulo web crítico: 99.5% (MVP).

### 9.3 Calidad y mantenibilidad

- **NFR-QUAL-001:** Lint sin errores bloqueantes para release.
- **NFR-QUAL-002:** Verificadores de arquitectura alineados al estado real del repo.
- **NFR-QUAL-003:** Type safety en contratos compartidos.
- **NFR-QUAL-004:** Reducción progresiva de complejidad de archivos priorizados.

### 9.4 Observabilidad

- **NFR-OBS-001:** Correlation ID entre capa web/servicios para trazas críticas.
- **NFR-OBS-002:** Logs estructurados para errores de negocio y sistema.
- **NFR-OBS-003:** Dashboard mínimo de errores, latencia y volumen por rol.

---

## 10) Requisitos de datos y modelo lógico

### 10.1 Entidades lógicas mínimas

1. Usuario
2. Perfil de rol
3. Paciente
4. Médico
5. Receta
6. Estado de receta
7. Evento de auditoría
8. Operación administrativa

### 10.2 Reglas de datos

- Toda receta debe tener identificador único, timestamps y actor creador.
- Todo cambio de estado debe registrar actor, fecha y estado origen/destino.
- Integridad referencial entre receta, paciente y médico.
- Contratos y validaciones compartidas en `packages/types` cuando aplique.

### 10.3 Migraciones

- Evolución de esquema vía `supabase/migrations`.
- Ningún cambio estructural en producción sin migración versionada y reversible cuando sea posible.

---

## 11) Arquitectura y lineamientos técnicos

### 11.1 Arquitectura de monorepo

- `apps/`: aplicaciones ejecutables por plataforma/rol.
- `packages/`: capacidades reutilizables (`core`, `types`, `ui`).
- `services/`: servicios especializados aislados.

### 11.2 Principios de diseño

1. Separación de responsabilidades por capa.
2. UI compartida sin lógica de negocio ni llamadas directas a datos.
3. Integraciones con datos encapsuladas en hooks/services.
4. Contratos de tipos como fuente de verdad transversal.

### 11.3 Calidad de código

- Usar scripts de verificación existentes como gates de entrega.
- Resolver imports rotos y checks desalineados antes de escalar alcance funcional.

---

## 12) Interfaces e integraciones

### 12.1 APIs internas

- Endpoint de salud disponible (`GET /api/health`).
- APIs de dominio y utilidades por módulo según rutas del App Router.

### 12.2 Servicios externos/auxiliares

- `bcv-rate`: soporte de tasa/cambio.
- `rif-verification`: verificación de identidad fiscal.
- `sacs-verification`: verificación auxiliar de datos operativos.

### 12.3 Contratos

- Definición y versionado de contratos entre módulos en paquetes compartidos.

---

## 13) Analítica, eventos y métricas

### 13.1 KPIs de producto

1. WAU/MAU por rol.
2. Tiempo de ciclo consulta → receta → despacho.
3. Tasa de recetas completadas.
4. Tasa de abandono por paso crítico.

### 13.2 KPIs técnicos

1. Warnings de lint (objetivo: 0).
2. Imports rotos (objetivo: 0).
3. Archivos >400 líneas (tendencia descendente).
4. Alertas SRP (tendencia descendente).
5. Tiempo CI en PR estándar (< 10 min).

### 13.3 Eventos mínimos a instrumentar

- `auth_login_success`
- `auth_login_failure`
- `role_dashboard_loaded`
- `prescription_created`
- `prescription_status_changed`
- `pharmacy_dispense_completed`
- `error_api_5xx`
- `error_business_validation`

---

## 14) UX y reglas de experiencia

1. Navegación consistente por rol.
2. Mensajes de error accionables (sin exponer detalles internos).
3. Estados vacíos/carga/error definidos para vistas críticas.
4. Feedback inmediato en mutaciones de receta y despacho.

---

## 15) Seguridad, privacidad y cumplimiento

1. Control de acceso por rol en frontend y backend.
2. Políticas de seguridad de datos y auditoría de eventos críticos.
3. Gestión de secretos por entorno, nunca hardcodeados.
4. Revisión periódica de dependencias y vulnerabilidades.

> Nota: Este PRD establece controles técnicos mínimos; requisitos regulatorios específicos por jurisdicción (salud/datos personales) deben anexarse en un documento de compliance legal.

---

## 16) Estrategia de pruebas y validación

### 16.1 Niveles de prueba

1. Unitarias para lógica de negocio compartida.
2. Integración para flujos de datos y permisos por rol.
3. E2E para casos críticos UC-01/UC-02/UC-03.

### 16.2 Gates mínimos por PR

- Lint
- Typecheck
- Verificadores de arquitectura
- Build de módulos impactados

### 16.3 Criterios de aceptación generales

- Cada FR implementado debe tener evidencia de prueba y validación.
- No se aprueban cambios que rompan rutas/protecciones por rol.

---

## 17) Plan de entrega por fases

### Fase 0 — Estabilización técnica (1-2 semanas)

Objetivo: eliminar bloqueadores de calidad y alinear verificadores.

Entregables:

- Warning debt priorizada y en reducción.
- Imports rotos corregidos.
- Scripts de verificación alineados al estado real.
- Baseline de calidad documentada.

### Fase 1 — MVP funcional consolidado (2-4 semanas)

Objetivo: cerrar flujo clínico-farmacéutico E2E en producción controlada.

Entregables:

- Acceso por rol estable en web.
- Receta E2E operativa (médico/paciente/farmacia).
- Operación desktop crítica validada (farmacia/médico).
- Métricas mínimas instrumentadas.

### Fase 2 — Escalabilidad y gobernanza (3-6 semanas)

Objetivo: mejorar capacidad de entrega sostenible y escalar módulos.

Entregables:

- Pipeline de CI fortalecida.
- Modularización de áreas de mayor complejidad.
- Mejoras sostenidas en performance, confiabilidad y mantenibilidad.

---

## 18) Plan de despliegue y operación

1. Despliegue por anillos (interno → grupo piloto → general).
2. Feature flags para cambios sensibles de flujo clínico.
3. Runbook de rollback por módulo crítico.
4. Monitoreo post-release con ventana de estabilización.

---

## 19) Dependencias

1. Supabase (migraciones, seguridad de datos, disponibilidad).
2. Paquetes compartidos `packages/core`, `packages/types`, `packages/ui`.
3. Servicios auxiliares (`bcv-rate`, `rif-verification`, `sacs-verification`).
4. Priorización de negocio por segmento y rol.

---

## 20) Riesgos y mitigaciones

1. **Deuda técnica alta en áreas críticas**  
   Mitigación: fase explícita de estabilización + quality gates.

2. **Scope creep por múltiples roles/plataformas**  
   Mitigación: priorización estricta de UC críticos y backlog por fases.

3. **Inconsistencias de contrato entre apps**  
   Mitigación: centralizar tipos/esquemas y checks automáticos.

4. **Observabilidad insuficiente en incidentes**  
   Mitigación: estándar de logs estructurados y métricas por flujo.

---

## 21) Criterios de salida de MVP (Definition of Done de release)

1. UC-01, UC-02 y UC-03 operativos en entorno de producción objetivo.
2. FR-001 a FR-015 implementados o explícitamente diferidos con aprobación.
3. NFR críticos de seguridad, calidad y observabilidad cumplidos.
4. Telemetría mínima activa y dashboard de seguimiento disponible.
5. Plan de soporte y rollback validado por operaciones.

---

## 22) Trazabilidad (Matriz resumida)

| Objetivo | Casos de uso | FR principales | KPI asociado |
|---|---|---|---|
| Acceso por rol seguro | UC-01 | FR-001, FR-002, FR-003, FR-004 | Tasa login éxito, errores de autorización |
| Flujo receta E2E | UC-02 | FR-005, FR-006, FR-007, FR-008, FR-015 | Tiempo de ciclo, recetas completadas |
| Operación administrativa | UC-03 | FR-009, FR-010 | Tiempos operativos por rol |
| Escalabilidad técnica | UC-01/02/03 | FR-011, FR-012, FR-013, FR-014 | CI <10 min, deuda técnica descendente |

---

## 23) Gobierno de cambios del PRD

### 23.1 Versionado del documento

- Cambios de alcance: incrementan versión menor.
- Cambios de estrategia o criterios de salida: incrementan versión mayor.

### 23.2 Responsables de actualización

- Producto: alcance, métricas de negocio, priorización.
- Ingeniería: arquitectura, NFR, plan técnico.
- Operaciones: despliegue, observabilidad, soporte.

---

## 24) Backlog inicial sugerido (épicas)

1. **EP-01 Acceso por rol y hardening de rutas**
2. **EP-02 Flujo de receta E2E**
3. **EP-03 Operación farmacia (web + desktop)**
4. **EP-04 Operación médico (web + desktop)**
5. **EP-05 Observabilidad y auditoría transversal**
6. **EP-06 Estabilización y quality gates monorepo**

---

## 25) Supuestos explícitos

1. Se mantiene Supabase como backend principal de datos en este horizonte.
2. La prioridad de negocio inicial se centra en médico-paciente-farmacia.
3. Las capacidades de roles secundarios avanzarán de forma incremental.
4. El equipo aceptará invertir en estabilización técnica antes de expansión funcional agresiva.

---

## 26) Preguntas abiertas para comité de producto/técnica

1. ¿Cuál es el segmento inicial exacto (tipo de clínica/farmacia, volumen y geografía)?
2. ¿Qué umbrales de SLA/SLO contractuales deben fijarse por módulo?
3. ¿Qué integraciones externas pasan a “obligatorias” para Go-Live comercial?
4. ¿Cuál es la política formal de soporte (horarios, severidades, tiempos de respuesta)?
5. ¿Qué requisitos regulatorios locales deben anexarse como control bloqueante de release?

---

## Anexo A — Referencias del repositorio

- Arquitectura: `docs/architecture.md`
- Desarrollo: `docs/development.md`
- API base: `docs/api.md`
- Auditoría técnica: `docs/monorepo-profesional-audit-2026-02-12.md`
- Web App Router: `apps/web/app`
- Paquetes compartidos: `packages/core`, `packages/types`, `packages/ui`
- Migraciones: `supabase/migrations`

