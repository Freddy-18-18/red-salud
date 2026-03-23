# Secretaria Medica Web — Red Salud

## About This App
Medical secretary workspace. Manages doctor agendas, patient appointments, communications, and administrative tasks.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4 + Radix UI
- **Auth**: Supabase Auth via `@red-salud/auth-sdk`
- **Data**: Supabase + API Gateway
- **State**: TanStack React Query
- **Port**: 3006

## Commands
```bash
pnpm dev          # Dev server on port 3006
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
- **Agenda**: Manage doctor's schedule on their behalf
- **Citas**: Book/reschedule/cancel appointments
- **Pacientes**: Patient intake and record management
- **Comunicaciones**: Handle messages, calls, follow-ups
- **Facturacion**: Basic billing support

## Database Tables
- `doctor_secretaries` — Secretary-doctor assignments
- `appointments` — Appointment management
- `doctor_schedules` — Schedule management
- `profiles` — Patient lookup

## Shared Packages
- `@red-salud/types`, `@red-salud/contracts`, `@red-salud/ui`, `@red-salud/core`, `@red-salud/auth-sdk`, `@red-salud/api-client`

## Rules
- NEVER import from other apps
- Secretary acts on behalf of one or more doctors
- Always scope by `doctor_secretaries` assignment — secretary can only see assigned doctors' data
- Cannot modify medical records — only administrative data
