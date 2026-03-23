# Portal de Seguros Web — Red Salud

## About This App
Insurance company portal. Manages policies, provider networks, claims authorization, and member services.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4 + Radix UI
- **Auth**: Supabase Auth via `@red-salud/auth-sdk`
- **Data**: Supabase + API Gateway
- **State**: TanStack React Query
- **Port**: 3007

## Commands
```bash
pnpm dev          # Dev server on port 3007
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
- **Polizas**: Insurance plan management
- **Red de Proveedores**: Doctor/clinic/pharmacy network
- **Autorizaciones**: Pre-authorization workflow
- **Reclamos**: Claims processing
- **Afiliados**: Member management
- **Elegibilidad**: Real-time eligibility verification

## Database Tables
- `insurance_plans` — Plan definitions
- `insurance_claims` — Claims
- `rcm_claims` — Revenue cycle claims
- `dental_eligibility_checks` — Eligibility
- `payer_contracts` — Provider contracts

## Shared Packages
- `@red-salud/types`, `@red-salud/contracts`, `@red-salud/ui`, `@red-salud/core`, `@red-salud/auth-sdk`, `@red-salud/api-client`

## Rules
- NEVER import from other apps
- Insurance sees aggregate/anonymized data unless authorized
- Claims follow strict status workflow
- Pre-authorization is required for specified procedure codes
