# Gestion de Clinica Web — Red Salud

## About This App
Clinic administration platform. Manages locations, staff, resources, inventory, operational metrics, and floor plans.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4 + Radix UI
- **Auth**: Supabase Auth via `@red-salud/auth-sdk`
- **Data**: Supabase + API Gateway
- **State**: TanStack React Query
- **Port**: 3004

## Commands
```bash
pnpm dev          # Dev server on port 3004
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
- **Sedes**: Clinic locations/branches
- **Personal**: Staff management and shift scheduling
- **Recursos**: Equipment, rooms, beds
- **Inventario Clinico**: Medical supply inventory
- **Metricas**: Operational KPIs (occupancy, wait times, revenue)
- **Planos**: Floor plan management
- **Roles**: Clinic-level role permissions

## Database Tables
- `clinics` — Clinic entities
- `clinic_locations` — Branch locations
- `clinic_areas` — Rooms/departments
- `clinic_resources` — Equipment/beds
- `clinic_inventory` — Supply inventory
- `clinic_staff_shifts` — Staff scheduling
- `clinic_roles` — Permission roles
- `clinic_operational_metrics` — KPIs

## Shared Packages
- `@red-salud/types`, `@red-salud/contracts`, `@red-salud/ui`, `@red-salud/core`, `@red-salud/auth-sdk`, `@red-salud/api-client`

## Rules
- NEVER import from other apps
- Clinic owner (profiles.id) controls all clinic data
- Multi-location support — always scope queries by clinic_id + location_id
