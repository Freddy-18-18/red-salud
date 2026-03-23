# Consultorio Medico Web — Red Salud

## About This App
Doctor's workspace web application. Manages patient consultations, appointments, medical records, prescriptions, specialty-specific workflows, and professional verification.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4 + Radix UI
- **Auth**: Supabase Auth via `@red-salud/auth-sdk`
- **Data**: Supabase + API Gateway
- **State**: TanStack React Query

## Commands
```bash
pnpm dev          # Dev server on port 3002
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
- **Agenda**: Doctor's schedule with configurable time slots
- **Consulta**: Medical consultation (SOAP notes, diagnoses, prescriptions)
- **Pacientes**: Patient roster and medical history
- **Recetas**: Prescription creation with digital signature
- **Verificacion SACS**: Venezuelan medical registry verification
- **Especialidades**: Specialty-aware UI (odontology gets periodontograma, dental imaging, etc.)
- **Telemedicina**: Video consultations (future)
- **Estadisticas**: Practice analytics and KPIs

## Database Tables (Supabase)
- `doctor_profiles` — Doctor extended profile (THE source of truth for doctor data)
- `appointments` — Appointments (shared with paciente)
- `doctor_schedules` — Available time slots
- `medical_notes` / `soap_notes` — Clinical notes
- `prescription_templates` — Rx templates
- `doctor_signatures` — Digital signatures
- `doctor_reviews` — Patient ratings
- `verificaciones_sacs` — SACS verification cache

## Shared Packages
- `@red-salud/types`, `@red-salud/contracts`, `@red-salud/ui`, `@red-salud/core`, `@red-salud/auth-sdk`, `@red-salud/api-client`

## Rules
- NEVER import from other apps
- `doctor_profiles` is THE doctor table — ignore `doctors`, `doctor_details`, `medico_profiles` (legacy)
- ICD-11 codes for diagnoses, ICD-10 as fallback
- All medical data is PHI — never log patient identifiable information
- Prescriptions require digital signature before printing
