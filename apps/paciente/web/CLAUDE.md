# Portal del Paciente Web — Red Salud

## About This App
Patient portal web application. Patients search doctors, book appointments, view medical records, message their doctors, and manage their health profile.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4 + Radix UI
- **Auth**: Supabase Auth via `@red-salud/auth-sdk`
- **Data**: Supabase + API Gateway

## Commands
```bash
pnpm dev          # Dev server on port 3003
pnpm build        # Production build
```

## Architecture
- `src/app/` — Next.js App Router pages
- `src/components/` — UI components
- `src/lib/` — Services, hooks, utilities
- `src/lib/supabase/` — Supabase client + server helpers

## Key Domain Concepts
- **Buscar Medico**: Search doctors by specialty, location, availability, ratings
- **Agendar Cita**: Book appointments with available time slots
- **Mis Citas**: View upcoming/past appointments
- **Historial Medico**: View medical records, diagnoses, prescriptions
- **Mensajeria**: Chat with doctors
- **Perfil de Salud**: Personal health data, allergies, medications, emergency contacts

## Database Tables
- `profiles` — Patient profile
- `appointments` — Appointments (patient view)
- `conversations` / `messages` — Doctor-patient messaging
- `doctor_profiles` — For doctor search (read-only)
- `medical_specialties` — Specialty catalog

## Shared Packages
- `@red-salud/types`, `@red-salud/contracts`, `@red-salud/ui`, `@red-salud/core`, `@red-salud/auth-sdk`, `@red-salud/api-client`

## Rules
- NEVER import from other apps
- Patient sees their OWN data only — RLS enforces this
- Doctor search is PUBLIC data (is_active doctors only)
- Appointment booking must validate doctor availability
- UX priority: mobile-first responsive design
