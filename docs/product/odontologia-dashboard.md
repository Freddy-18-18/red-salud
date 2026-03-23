# Odontología: Benchmark competitivo + plan de dashboards especializados

Fecha: 2026-02-13

## 1) Objetivo
Definir cómo competir en software odontológico de nivel mundial y aterrizar un plan ejecutable en Red Salud para:
- Detectar especialidad/subespecialidad del médico.
- Mostrar dashboards y layout adaptados por especialidad.
- Empezar por Odontología con ventajas clínicas y operativas reales.

---

## 2) Benchmark (líderes y qué los hace fuertes)

### Dentrix / Dentrix Ascend
- PMS integral con foco en ciclo completo: agenda, charting, imaging, claims, analytics.
- Mensaje fuerte en **case acceptance** con IA (detección de caries, apoyo visual al paciente).
- Voice charting y soporte para flujo clínico + billing en un mismo ecosistema.

### CareStack
- Fuerte en **all-in-one cloud** para single clinic y DSO multi-sede.
- Suite robusta de:
  - Clinical workflows (treatment planning, perio charting, imaging, eRx)
  - RCM (claims, eligibility, posting, pagos)
  - Engagement (portal, reminders, self-scheduling, two-way text)
  - Analytics (dashboards configurables, tracker de implantes, referrals).

### Planet DDS (Denticon)
- Posicionamiento fuerte en escalamiento DSO/multi-site.
- Diferenciales: AI voice perio, auto-eligibility, referral mgmt, analytics bundles, imaging AI integrado.
- Multi-specialty nativo con control corporativo + operación clínica local.

### tab32
- Orientado a operación unificada de grupos dentales y APIs.
- Foco en radiología/imaging, RCM, retención de pacientes, workflows centralizados.

### Open Dental
- Muy fuerte en **customización, extensibilidad e interoperabilidad**.
- Gran red de bridges/integraciones, eServices (portal, forms, online scheduling, texting, payment).

### Dental Intelligence (capa de performance/engagement)
- “Operating system” de productividad: Morning Huddle, Smart Schedule, Patient Finder, follow-ups.
- Muy fuerte en **automatización comercial/operativa** y métricas accionables.

### Pearl (IA dental especializada)
- Diferencial claro en visión computacional dental:
  - Detección/segmentación/medición en rayos X
  - Cobertura regulatoria internacional amplia
  - Enfoque en apoyo diagnóstico clínico y comunicación con paciente.

---

## 3) Capacidades clave de mercado (patrón común)

### A. Clinical Core Odontológico
- Odontograma completo (FDI/Universal), estado por pieza/superficie.
- Perio charting estructurado (bolsas, sangrado, movilidad, furca, recesión).
- Plan de tratamiento por fases (diagnóstico, presupuesto, firma, seguimiento).
- Integración de imagen dental 2D/3D + anotación clínica.

### B. Revenue & Insurance Core
- Eligibility en tiempo real.
- Claims electrónicos con control de denegaciones y re-trabajo.
- Estimación de copago y plan financiero en consulta.

### C. Patient Experience Core
- Agenda omnicanal, recordatorios inteligentes, auto-agendado.
- Portal/forms/check-in digital.
- Mensajería bidireccional y campañas de recall/reactivación.

### D. Growth & Intelligence Core
- Morning huddle operativo.
- KPIs de producción/cobro/aceptación/no-show por doctor/sede/especialidad.
- Recomendaciones accionables (no solo reportes).

### E. DSO / Multi-site Core
- Estandarización operativa + flexibilidad por sede.
- Analytics corporativo con drill-down clínico/financiero.
- Integraciones/API-first.

---

## 4) Lo que hoy tiene Red Salud (fortalezas reales)

### Infraestructura y arquitectura
- Layout por rol ya implementado (médico/paciente/farmacia/etc.).
- Menú dinámico por rol y soporte de `specialtyName` para inyectar módulos.
- Detección de especialidad del médico en layout médico (desde `doctor_details` + `specialties`).

### Odontología existente (base funcional)
- Dashboard odontológico dedicado cuando la especialidad es “Odontología”.
- Módulos/rutas ya existentes:
  - `/dashboard/medico/odontologia/imaging`
  - `/dashboard/medico/odontologia/growth`
  - `/dashboard/medico/odontologia/rcm`
- Widget odontograma ya presente (V1), más widgets de AI imaging / growth / elegibilidad.

### Datos y especialidad
- Base de especialidades y campo de subespecialidades en backend.
- Catálogos/sugerencias por especialidad (infra para personalización clínica incremental).

---

## 5) Gap analysis: qué falta para competir con líderes

## Gap 1 — Profundidad clínica dental
**Actual:** widgets y páginas odontológicas con UX prometedora, pero mayormente simuladas / no conectadas E2E a datos clínicos dentales especializados.

**Falta competitivo:**
- Modelo dental robusto: tooth/surface/procedures/perio/findings.
- Evolución longitudinal por pieza y por plan de tratamiento.
- Co-diagnóstico visual paciente-profesional con evidencia clínica histórica.

## Gap 2 — IA clínica “de producción”
**Actual:** experiencia AI en frontend (simulación y narrativa).

**Falta competitivo:**
- Pipeline real de ingestión de imágenes + inferencia + versionado de hallazgos.
- Registro auditable de “AI suggestion vs final diagnosis”.
- Métricas de precisión clínica y efecto en aceptación de tratamiento.

## Gap 3 — RCM dental de alto desempeño
**Actual:** módulo RCM UX listo para madurar.

**Falta competitivo:**
- Eligibility real-time conectado a pagadores/capas de verificación.
- Estado detallado de claim lifecycle (submitted/accepted/denied/resubmitted/paid).
- Motor de reglas de denegaciones y work queues para staff.

## Gap 4 — Growth / Recall sofisticado
**Actual:** base de campañas y reputación en UI.

**Falta competitivo:**
- Segmentación de recall por riesgo clínico + valor económico + probabilidad de retorno.
- Automatizaciones omnicanal trazables por cohorte.
- Closed-loop KPI: campaña → cita → tratamiento aceptado → cobro.

## Gap 5 — Especialización por subespecialidad
**Actual:** detección de especialidad principal y subespecialidades registrables.

**Falta competitivo:**
- Layout y componentes por subespecialidad (ortodoncia, periodoncia, endodoncia, implantología).
- Plantillas operativas y KPIs específicos por subespecialidad.

---

## 6) Blueprint recomendado: dashboard especializado por especialidad

## 6.1. Motor de Personalización (núcleo)
Crear un `Specialty Experience Engine` con 3 capas:
1. **Detection layer**
   - specialty principal
   - subespecialidades
   - contexto operativo (sede, tipo práctica: privada/DSO, verificación, plan).
2. **Experience config layer**
   - qué layout usar
   - qué módulos habilitar
   - orden de widgets
   - KPIs prioritarios.
3. **Execution layer**
   - render dinámico de menú, dashboard home y accesos rápidos.

## 6.2. Odontología v1 (foco)
Home odontológica con 6 bloques:
1. **Morning Huddle Dental**
   - citas del día
   - no-shows en riesgo
   - pacientes con planes abiertos sin fecha.
2. **Clinical Board**
   - hallazgos críticos nuevos
   - perio alerts
   - tratamientos pendientes por completar.
3. **Production Board**
   - producción día/semana/mes
   - aceptación de planes
   - ticket promedio por tipo de tratamiento.
4. **RCM Board**
   - claims pendientes/denegados por causa
   - aging de cuentas
   - first pass rate.
5. **Growth Board**
   - recall backlog
   - reactivación
   - reputación/NPS/referidos.
6. **Imaging/AI Board**
   - estudios cargados hoy
   - findings AI pendientes de validación
   - tiempos de validación clínica.

## 6.3. Subespecialidades odontológicas (v2)
- **Ortodoncia:** avance por caso, adhesión al plan, citas perdidas, urgencias ortodóncicas.
- **Periodoncia:** estado periodontal por cuadrante, bolsas críticas, plan de mantenimiento.
- **Implantología:** pipeline por fases (diagnóstico-cirugía-prótesis), éxito/complicaciones.
- **Endodoncia:** dolor agudo/urgencia, retratamientos, tiempos de resolución.

---

## 7) Roadmap propuesto (90 días)

## Fase 1 (Semanas 1-3): Fundaciones de datos
- Definir modelo dental canónico (tooth/surface/perio/imaging/plan/claim).
- Instrumentación de eventos de dashboard odontológico.
- Conectar widgets odontológicos existentes a datos reales mínimos.

## Fase 2 (Semanas 4-6): Dashboard odontología operable
- Morning Huddle Dental + Clinical Board + Production Board (MVP real).
- Estados de tratamiento y pipeline por paciente.
- Primer set de KPIs accionables en tiempo real.

## Fase 3 (Semanas 7-9): RCM + Growth de verdad
- Eligibility + claims lifecycle + colas de trabajo.
- Recall inteligente y campañas automatizadas por segmento.
- Métrica de impacto económico por automatización.

## Fase 4 (Semanas 10-12): IA + diferenciación
- Flujo real imaging → análisis AI → validación profesional.
- Visual co-diagnosis para paciente y mejora de case acceptance.
- Piloto por subespecialidad (ej. Ortodoncia) con layout dedicado.

---

## 8) KPIs para competir de forma medible

### Clínico
- Case acceptance rate.
- Tiempo diagnóstico→plan firmado.
- Cumplimiento de plan por paciente.

### Operativo
- No-show rate.
- Chair utilization.
- Tiempo promedio de cierre de jornada clínica.

### Financiero
- Producción por doctor/sede.
- Collections rate.
- Claim first-pass acceptance.
- Denial rate y días en AR.

### Growth
- Recall recovery rate.
- Reactivación 30/60/90 días.
- NPS / rating promedio / referidos.

### IA
- % estudios con análisis AI validado.
- Tiempo medio de validación.
- Delta de aceptación con soporte AI vs sin AI.

---

## 9) Prioridades inmediatas recomendadas (orden exacto)
1. Convertir dashboard odontológico actual de “demo UX” a “operación real con datos”.
2. Implementar Morning Huddle Dental con 5 decisiones diarias accionables.
3. Cerrar flujo RCM dental básico (eligibility + claim state machine).
4. Integrar imaging clínico con trazabilidad de hallazgos.
5. Activar motor de personalización por subespecialidad.

---

## 10) Riesgos críticos
- Quedarse en UI sin data model clínico robusto.
- IA sin trazabilidad médico-legal.
- RCM parcial sin impacto real en cashflow.
- Scope creep de múltiples especialidades antes de cerrar odontología v1.

---

## 11) Conclusión estratégica
Red Salud ya tiene una ventaja importante: **la arquitectura para dashboards por rol/especialidad ya existe**.
La brecha con líderes globales no es de navegación, sino de:
- profundidad clínica dental,
- madurez RCM,
- automatización de growth,
- y analítica accionable con IA trazable.

Si Odontología v1 se ejecuta con foco en esos cuatro ejes, se puede competir por valor real en consultorios y grupos dentales, no solo por interfaz.
