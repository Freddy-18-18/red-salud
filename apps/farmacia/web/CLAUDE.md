# Farmacia Web — Red Salud

## About This App
Pharmacy management web application for Venezuelan pharmacies. Handles inventory, POS, prescriptions, deliveries, supplier management, and reporting.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4 + Radix UI
- **Auth**: Supabase Auth via `@red-salud/auth-sdk`
- **Data**: Supabase (direct RLS queries) + API Gateway for cross-domain operations
- **State**: TanStack React Query for server state

## Commands
```bash
pnpm dev          # Dev server on port 3001
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
```

## Architecture
- `src/app/` — Next.js App Router pages
- `src/components/` — UI components (smart + presentation)
- `src/lib/` — Services, hooks, utilities
- `src/lib/supabase/` — Supabase client + server helpers

## Key Domain Concepts
- **Inventario**: Drug inventory with batch tracking (FEFO - First Expired, First Out)
- **POS (Caja)**: Point of sale with multiple payment methods (efectivo, tarjeta, pago movil, Zelle, transferencia)
- **Recetas**: Prescription management — receive, validate, dispense
- **Entregas**: Home delivery tracking with status workflow (pendiente -> en_ruta -> entregada)
- **Proveedores**: Supplier management and purchase orders
- **Alertas**: Stock alerts, expiry alerts, system notifications
- **BCV Rates**: Venezuelan Bolivar exchange rate integration

## Shared Packages (import from these, NEVER from other apps)
- `@red-salud/types` — Shared TypeScript interfaces
- `@red-salud/contracts` — API contracts
- `@red-salud/ui` — Design system components
- `@red-salud/core` — Business logic, validations
- `@red-salud/auth-sdk` — Authentication
- `@red-salud/api-client` — Typed HTTP client for backend services

## Database Tables (Supabase)
- `farmacia_inventario` — Drug inventory
- `farmacia_ventas` — Sales transactions
- `farmacia_recetas` — Prescriptions
- `farmacia_entregas` — Deliveries
- `farmacia_proveedores` — Suppliers
- `farmacia_pedidos_proveedor` — Purchase orders
- `farmacia_alertas` — System alerts
- `farmacia_fidelizacion` — Loyalty program
- `farmacia_precios_config` — Pricing rules

## Rules
- NEVER import from other apps (e.g., `apps/medico/`, `apps/paciente/`)
- All cross-domain communication goes through `@red-salud/api-client`
- Use `@red-salud/auth-sdk` for all auth — never call Supabase auth directly
- Venezuelan currency formatting: use `Intl.NumberFormat('es-VE')`
- All dates in Venezuela timezone (America/Caracas, UTC-4)
