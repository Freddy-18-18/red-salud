# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ecosystem Overview

Red Salud is a healthcare ecosystem for Venezuela, organized as a pnpm workspace monorepo with Nx for task orchestration. It spans 9 business domains, each with its own web, desktop, and/or mobile application. All apps share a common tech stack and communicate through an API gateway — never by importing from each other.

## Directory Structure

```
red-salud/
  apps/
    farmacia/          # Pharmacy domain
      web/             # Next.js web app (port 3001)
      desktop/         # Tauri desktop app
    medico/            # Doctor domain
      web/             # Next.js web app (port 3002)
      desktop/         # Tauri desktop app
      mobile/          # React Native mobile app
    paciente/          # Patient domain
      web/             # Next.js web app (port 3003)
      desktop/         # Tauri desktop app
      mobile/          # React Native mobile app
    clinica/           # Clinic administration domain
      web/             # Next.js web app (port 3004)
      desktop/         # Tauri desktop app
    laboratorio/       # Laboratory domain
      web/             # Next.js web app (port 3005)
      desktop/         # Tauri desktop app
    secretaria/        # Medical secretary domain
      web/             # Next.js web app (port 3006)
      desktop/         # Tauri desktop app
    seguro/            # Insurance domain
      web/             # Next.js web app (port 3007)
    ambulancia/        # Emergency/ambulance domain
      web/             # Next.js web app (port 3008)
      mobile/          # React Native mobile app
    academia/          # Medical education domain
      web/             # Next.js web app (port 3009)
      mobile/          # React Native mobile app
    landing/           # Public landing page
    web/               # Legacy monolithic app (being decomposed)
  packages/
    types/             # @red-salud/types — Shared TypeScript interfaces and Zod schemas
    ui/                # @red-salud/ui — Design system components (Radix UI + Tailwind CSS)
    core/              # @red-salud/core — Business logic, validations, constants
    contracts/         # @red-salud/contracts — API contracts between domains
    auth-sdk/          # @red-salud/auth-sdk — Authentication SDK (Supabase Auth wrapper)
    api-client/        # @red-salud/api-client — Typed HTTP client for backend services
  services/
    api-gateway/       # API Gateway — routes cross-domain requests
    auth/              # Auth service
    notifications/     # Notification service (email, push, SMS)
    payments/          # Payment processing service
    ai/                # AI service (Gemini, ICD-11 suggestions)
```

## Domain Applications (Web)

| Domain | App | Port | Location | Description |
|--------|-----|------|----------|-------------|
| Farmacia | Pharmacy Web | 3001 | `apps/farmacia/web/` | Inventory, POS, prescriptions, deliveries |
| Medico | Doctor Web | 3002 | `apps/medico/web/` | Consultations, medical records, scheduling |
| Paciente | Patient Web | 3003 | `apps/paciente/web/` | Doctor search, appointments, health portal |
| Clinica | Clinic Admin | 3004 | `apps/clinica/web/` | Locations, staff, resources, metrics |
| Laboratorio | Lab Web | 3005 | `apps/laboratorio/web/` | Test orders, samples, results, QC |
| Secretaria | Secretary Web | 3006 | `apps/secretaria/web/` | Agenda management, patient intake |
| Seguro | Insurance Web | 3007 | `apps/seguro/web/` | Policies, claims, provider networks |
| Ambulancia | Emergency Web | 3008 | `apps/ambulancia/web/` | Dispatch, fleet tracking, triage |
| Academia | Education Web | 3009 | `apps/academia/web/` | Courses, certifications, gamification |

Each app has its own `CLAUDE.md` with domain-specific context. When working on a specific app, read its CLAUDE.md first.

## Shared Packages

| Package | Location | Purpose |
|---------|----------|---------|
| `@red-salud/types` | `packages/types/` | Shared TypeScript interfaces and Zod schemas |
| `@red-salud/ui` | `packages/ui/` | Dumb UI components (Radix UI + Tailwind CSS) — pure presentation, no business logic |
| `@red-salud/core` | `packages/core/` | Business logic, validations, utilities, constants |
| `@red-salud/contracts` | `packages/contracts/` | API contracts defining cross-domain communication |
| `@red-salud/auth-sdk` | `packages/auth-sdk/` | Authentication SDK wrapping Supabase Auth |
| `@red-salud/api-client` | `packages/api-client/` | Typed HTTP client for calling backend services |

## Common Tech Stack (All Web Apps)

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4 + Radix UI
- **Auth**: Supabase Auth via `@red-salud/auth-sdk`
- **Data**: Supabase (direct RLS queries) + API Gateway for cross-domain operations
- **State**: TanStack React Query for server state
- **Testing**: Vitest + fast-check for property-based tests

## Common Commands

```bash
# Install dependencies
pnpm install

# Development (specific app)
pnpm --filter @red-salud/farmacia-web dev       # Farmacia on port 3001
pnpm --filter @red-salud/medico-web dev         # Medico on port 3002
pnpm --filter @red-salud/paciente-web dev       # Paciente on port 3003
pnpm --filter @red-salud/clinica-web dev        # Clinica on port 3004
pnpm --filter @red-salud/laboratorio-web dev    # Laboratorio on port 3005
pnpm --filter @red-salud/secretaria-web dev     # Secretaria on port 3006
pnpm --filter @red-salud/seguro-web dev         # Seguro on port 3007
pnpm --filter @red-salud/ambulancia-web dev     # Ambulancia on port 3008
pnpm --filter @red-salud/academia-web dev       # Academia on port 3009

# Building
pnpm build                  # Build all (types first, then apps)

# Code Quality
pnpm lint                   # ESLint across workspace
pnpm typecheck              # TypeScript check across workspace
pnpm test                   # Vitest tests
pnpm check                  # Run lint + typecheck + test
```

## Architecture Principles

### Domain Isolation (CRITICAL)
- **NEVER import from other apps** — `apps/farmacia/` must NOT import from `apps/medico/`, etc.
- All cross-domain communication goes through the **API Gateway** via `@red-salud/api-client`
- Shared code lives in `packages/` — if two apps need the same logic, extract it to a package
- Each app is independently deployable

### Data Layer Conventions
1. **Separation of Concerns**: UI components should NOT directly fetch data
2. **Service Layer**: Supabase queries live in `lib/supabase/services/*.ts` per app
3. **Custom Hooks**: Data fetching encapsulated in hooks
4. **Component Props**: UI components receive data via props, not direct queries

### Component Architecture
- **Dumb Components**: `@red-salud/ui` components are pure presentation (no business logic)
- **Smart Components**: App-level components in `components/` handle data fetching via hooks
- **Props Pattern**: UI components receive callbacks like `onUpload`, `onChange` rather than calling services

### Import Conventions

| Alias | Resolves To |
|-------|-------------|
| `@/` | App root (e.g., `apps/farmacia/web/src/`) |
| `@red-salud/core` | `packages/core/src/` |
| `@red-salud/ui` | `packages/ui/src/` |
| `@red-salud/types` | `packages/types/src/` |
| `@red-salud/contracts` | `packages/contracts/src/` |
| `@red-salud/auth-sdk` | `packages/auth-sdk/src/` |
| `@red-salud/api-client` | `packages/api-client/src/` |

## Authentication

- **SDK**: All apps use `@red-salud/auth-sdk` — never call Supabase Auth directly
- **Server Client**: Server-side Supabase client with cookies
- **Browser Client**: Client-side Supabase client
- **Middleware**: Session sync and role resolution per app

### Role-Based Access Control

Roles are stored in the `profiles` table:
- `paciente` — Patient
- `medico` — Doctor
- `secretaria` — Secretary
- `farmacia` — Pharmacist
- `laboratorio` — Lab technician
- `admin` — Administrator

## Database (Supabase)

### Key Tables

- `profiles` — All users (role determines app access)
- `doctor_profiles` — Doctor extended data (**THE source of truth for doctor data** — ignore legacy tables like `doctors`, `doctor_details`, `medico_profiles`)
- `appointments` — Shared between medico, paciente, secretaria
- `medical_specialties` — Specialty catalog

### Domain-Specific Table Prefixes

| Domain | Prefix | Example |
|--------|--------|---------|
| Farmacia | `farmacia_` | `farmacia_inventario`, `farmacia_ventas` |
| Clinica | `clinic_` | `clinic_locations`, `clinic_resources` |
| Laboratorio | `lab_` | `lab_orders`, `lab_results` |
| Academia | `academy_` | `academy_lessons`, `academy_user_progress` |
| Seguros | `insurance_` / `rcm_` | `insurance_plans`, `rcm_claims` |

### RLS (Row Level Security)
All tables use Supabase RLS. Key policies:
- Users can only view/update their own profile
- Insertion happens via `handle_new_user()` trigger
- Email uniqueness enforced via `check_email_not_exists()` trigger
- Domain tables enforce access by role and ownership

### Migrations
Migrations in `supabase/migrations/` follow naming convention:
- `YYYYMMDDHHMMSS_description.sql` for timestamped migrations
- Run new migrations on Supabase before deploying schema changes

## Key Integration Points

### Google Calendar
- Service: Google Calendar API for doctor schedule sync
- Used by: medico, secretaria

### Gemini AI
- ICD-11 code suggestions for diagnoses
- Used by: medico

### SACS Verification
- Venezuelan medical registry verification for doctors
- Used by: medico

### BCV Exchange Rates
- Venezuelan Bolivar exchange rate integration
- Used by: farmacia, clinica (any app handling payments)

## Localization

- Primary locale: es-VE (Venezuelan Spanish)
- Timezone: America/Caracas (UTC-4)
- Currency formatting: `Intl.NumberFormat('es-VE')`

## Important Notes

- **Package Manager**: Must use `pnpm` (not npm or yarn)
- **Build Order**: Types package must build before apps
- **Environment**: Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Per-App Context**: Each app has its own `CLAUDE.md` — read it before working on that app
- **No Cross-App Imports**: This is the single most important architectural rule
