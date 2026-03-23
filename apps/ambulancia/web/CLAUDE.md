# Central de Emergencias Web — Red Salud

## About This App
Emergency dispatch center. Manages ambulance fleet, dispatch operations, real-time tracking, and emergency response coordination.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4 + Radix UI
- **Auth**: Supabase Auth via `@red-salud/auth-sdk`
- **Data**: Supabase + API Gateway
- **State**: TanStack React Query
- **Port**: 3008

## Commands
```bash
pnpm dev          # Dev server on port 3008
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
- **Despacho**: Emergency call intake and unit dispatch
- **Unidades**: Ambulance fleet management
- **Seguimiento**: Real-time GPS tracking of units
- **Priorizacion**: Triage-based priority dispatch
- **Hospitales**: Hospital availability and routing

## Shared Packages
- `@red-salud/types`, `@red-salud/contracts`, `@red-salud/ui`, `@red-salud/core`, `@red-salud/auth-sdk`, `@red-salud/api-client`

## Rules
- NEVER import from other apps
- Real-time operations — use Supabase Realtime for live updates
- Priority levels: rojo (life-threatening) -> amarillo (urgent) -> verde (non-urgent)
- Dispatch decisions must be logged for audit
