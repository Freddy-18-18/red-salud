# Auditoría profunda del monorepo Red-Salud

Fecha: 2026-02-12
Alcance: estructura, calidad, mantenibilidad, escalabilidad, tooling y gobernanza técnica.

## 1) Resumen ejecutivo

El proyecto tiene una base sólida (PNPM workspaces, separación `apps/` + `packages/` + `services/`, validadores internos), pero hoy opera con deuda estructural alta en `apps/web` y con gobernanza incompleta a nivel monorepo.

Estado actual:

- Lint: sin errores bloqueantes, pero con warnings activos por variables no usadas.
- Verificador de workspace: falla por checks desactualizados de rutas API Gemini.
- Integridad de imports: se detectan imports rotos en scripts.
- Tamaño y SRP: muchos archivos superan umbral de complejidad/tamaño.
- Gobernanza monorepo: faltan piezas clave (pipeline unificada, base tsconfig, CI, release strategy y reglas de ownership).

Conclusión: el monorepo es funcional, pero para escalar de forma profesional conviene pasar por una reestructuración por fases, empezando por estandarización y quality gates, luego modularización por dominio.

## 2) Hallazgos técnicos concretos

## 2.1 Calidad y deuda visible

- `pnpm lint` reporta 9 warnings (`@typescript-eslint/no-unused-vars`) en `apps/web`.
- `verify-workspace-setup.ts` exige archivos no presentes:
  - `app/api/gemini/improve-note/route.ts`
  - `app/api/gemini/generate-note/route.ts`
- En la implementación actual sí existe `app/api/gemini/suggest-icd11/route.ts`, por lo que el check está desalineado con el estado real del producto.

## 2.2 Integridad arquitectónica

`verify-imports.ts` detecta 2 imports rotos:

- `apps/web/scripts/archive/generate-specialty-inserts.ts`
- `apps/web/scripts/scrape-sacs.ts`

Esto indica deuda de refactor/movimientos de archivos no cerrados.

## 2.3 Complejidad estructural

`verify-file-sizes.ts` reporta:

- 953 archivos analizados.
- 91 archivos por encima del umbral (400 líneas).
- archivo máximo de 4339 líneas.

`verify-single-responsibility.ts` reporta:

- 958 archivos analizados.
- 435 con sugerencias de división/responsabilidad.

Riesgo: cambios lentos, onboarding costoso, mayor probabilidad de regresión.

## 2.4 Gobernanza de monorepo

Se observan vacíos de estandarización para escala:

- Sin orquestador de tareas/caché monorepo operativo (Nx inicializado, pero aún sin estandarizar targets/gates).
- Sin `tsconfig.base.json` compartido para todos los paquetes.
- Sin pipeline CI visible en `.github/workflows`.
- Sin estrategia de versionado/release (ej. Changesets).
- Sin policy de límites entre capas/dominios automática.

## 2.5 Consistencia de dependencias

- Dependencias framework (`next/react`) están en raíz y también en apps, lo que puede inducir ambigüedad de ownership.
- Versiones de librerías compartidas no totalmente homogenizadas entre apps/packages.

## 3) Arquitectura objetivo (profesional y escalable)

## 3.1 Topología recomendada

- `apps/`: productos ejecutables (web, desktop por rol).
- `packages/`: capacidades compartidas por dominio y plataforma.
- `services/`: microservicios/automatizaciones aisladas.

Evolución sugerida de `packages/`:

- `packages/domain-medico`
- `packages/domain-farmacia`
- `packages/domain-clinica`
- `packages/platform-supabase`
- `packages/config-eslint`
- `packages/config-typescript`
- `packages/config-tailwind`
- `packages/testing`

Objetivo: reducir acoplamiento entre UI y reglas de negocio, con contracts claros por paquete.

## 3.2 Capas internas por app (especialmente web)

Dentro de cada app, estructura por dominio y no por tipo técnico global:

- `features/<dominio>/ui`
- `features/<dominio>/application` (hooks/use-cases)
- `features/<dominio>/infra` (servicios/adaptadores)
- `features/<dominio>/model` (tipos/schemas)

Esto permite dividir archivos grandes sin perder cohesión funcional.

## 4) Stack recomendado para profesionalización

## 4.1 Herramientas clave (alta prioridad)

1. **Nx**: pipeline incremental + caching remoto/local + `run-many` para quality gates.
2. **Changesets**: versionado y changelog automatizado de paquetes.
3. **Syncpack**: consistencia de versiones en workspace.
4. **Knip**: detección de código/deps/exports no usados.
5. **Madge**: detección de ciclos de dependencia.
6. **Husky + lint-staged + commitlint**: gates locales antes de commit.
7. **GitHub Actions**: CI mínima con lint + typecheck + test + build selectivo.

## 4.2 Seguridad y supply chain

- `pnpm audit` en CI.
- Renovación controlada de dependencias (Renovate o Dependabot).
- Bloqueo de engines (`node`/`pnpm`) y archivo de versión (`.nvmrc` o `.node-version`).

## 5) Skills encontradas (find-skills)

Resultados robustos para esta iniciativa:

- `sickn33/antigravity-awesome-skills@monorepo-architect`
- `aj-geddes/useful-ai-prompts@monorepo-management`
- `thebushidocollective/han@monorepo-architecture`
- `sickn33/antigravity-awesome-skills@codebase-cleanup-refactor-clean`
- `nickcrew/claude-ctx-plugin@repo-cleanup`

Instalación (global, no interactiva):

```bash
npx skills add <owner/repo@skill> -g -y
```

## 6) Plan de implementación por fases

## Fase 0 — Estabilización (1-2 días)

- Corregir warnings de lint.
- Actualizar `verify-workspace-setup.ts` para que valide rutas reales (o crear rutas faltantes si son requerimiento vigente).
- Arreglar imports rotos en scripts.
- Documentar baseline (estado de pruebas/lint/build).

## Fase 1 — Gobernanza monorepo (2-4 días)

- Consolidar configuración de Nx (`nx.json`, `targetDefaults`, cache de tareas críticas).
- Crear `tsconfig.base.json` y extender desde apps/packages.
- Añadir scripts raíz estándar:
  - `typecheck`
  - `test`
  - `check` (lint + typecheck + test)
- Agregar CI en GitHub Actions.

## Fase 0.5 — Testing Foundation (2-4 días, antes de modularización)

- Definir baseline de pruebas con MCP Testsprite para flujos críticos por rol.
- Estabilizar entorno de pruebas (credenciales por rol, login estable, datos semilla reproducibles).
- Añadir `data-testid` en flujos críticos para reducir flakiness de E2E.
- Separar estrategia de pruebas:
  - Smoke UI (rápidas) en cada PR.
  - Contract/quality/performance checks en CI.
- Publicar reporte de baseline y riesgos (`testsprite_tests/testsprite-mcp-test-report.md`) como gate de entrada a Fase 2.

## Fase 2 — Modularización por dominio (1-3 semanas, después de Fase 0.5)

- Atacar top 20 archivos más grandes/volátiles.
- Mover lógica de negocio desde páginas/componentes a `application/infra/model`.
- Reducir tamaño objetivo por archivo (ideal: <300, máximo duro: 400).

## Fase 3 — Profesionalización continua

- Añadir release flow con Changesets.
- Añadir ownership (`CODEOWNERS`) por dominios.
- Métricas de salud técnica mensuales (deuda, complejidad, tiempos de CI).

## 7) Quick wins inmediatos

1. Alinear `verify-workspace-setup.ts` con la API Gemini real.
2. Corregir los 2 imports rotos detectados.
3. Eliminar/usar las 9 variables no usadas reportadas por ESLint.
4. Excluir explícitamente directorios de build/cache en verificadores para acelerar análisis.
5. Definir política de tamaño de archivo + PR template con checklist de arquitectura.

## 8) Riesgos si no se aborda

- Mayor tiempo por feature y por bugfix.
- Incremento de regresiones en áreas críticas (médico/farmacia).
- Dificultad para escalar equipo y code reviews.
- Coste creciente de mantenimiento en cada sprint.

## 9) KPI sugeridos para seguimiento

- Warnings ESLint: 9 -> 0
- Imports rotos: 2 -> 0
- Archivos > 400 líneas: 91 -> <30 (fase 2)
- Archivos con alerta SRP: 435 -> <150 (fase 2)
- Tiempo CI objetivo: <10 min en PR estándar
- Cobertura mínima (si aplica): >=70% en módulos críticos

---

Este documento propone una ruta incremental: estabilizar primero, estandarizar después y modularizar de manera guiada por métricas.