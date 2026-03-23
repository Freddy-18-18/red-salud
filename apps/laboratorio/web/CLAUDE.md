# Laboratorio Web — Red Salud

## About This App
Laboratory management platform. Handles test orders, sample tracking, result entry, quality control, and report generation.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4 + Radix UI
- **Auth**: Supabase Auth via `@red-salud/auth-sdk`
- **Data**: Supabase + API Gateway
- **State**: TanStack React Query
- **Port**: 3005

## Commands
```bash
pnpm dev          # Dev server on port 3005
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
```

## Architecture
- `src/app/` — Next.js App Router pages
- `src/components/` — UI components
- `src/lib/` — Services, hooks, utilities
- `src/lib/supabase/` — Supabase client + server helpers

## Key Domain Concepts
- **Ordenes**: Lab test orders from doctors
- **Muestras**: Sample collection and tracking
- **Resultados**: Test result entry with reference ranges
- **Catalogo**: Test type catalog with pricing
- **Control de Calidad**: QC tracking
- **Informes**: PDF report generation

## Database Tables
- `lab_test_types` — Test catalog
- `lab_orders` — Test orders
- `lab_order_tests` — Tests per order
- `lab_results` — Test results
- `lab_result_values` — Parameter values
- `lab_order_status_history` — Audit trail

## Shared Packages
- `@red-salud/types`, `@red-salud/contracts`, `@red-salud/ui`, `@red-salud/core`, `@red-salud/auth-sdk`, `@red-salud/api-client`

## Rules
- NEVER import from other apps
- Results require validation by authorized personnel before release
- Status workflow: solicitada -> muestra_recibida -> en_proceso -> completada -> validada -> entregada
