# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This is a pnpm workspace monorepo using Nx for task orchestration.

### Applications

| App | Location | Description | Dev Command |
|-----|----------|-------------|-------------|
| Web | `apps/web` | Next.js 16+ app for patients, doctors, secretaries | `pnpm dev` |
| Pharmacy Desktop | `apps/desktop/farmacia` | Tauri desktop app for pharmacy | `pnpm tauri:farmacia:dev` |
| Medical Desktop | `apps/desktop/medico` | Tauri desktop app for doctors | `pnpm tauri:medico:dev` |
| Corporativo | `apps/desktop/corporativo` | Tauri desktop admin panel | `pnpm --filter @red-salud/corporativo-desktop tauri:dev` |

### Shared Packages

| Package | Location | Purpose |
|---------|----------|---------|
| `@red-salud/types` | `packages/types/` | Shared TypeScript interfaces and Zod schemas |
| `@red-salud/design-system` | `packages/ui/` | Dumb UI components (Radix UI + Tailwind CSS) |
| `@red-salud/core` | `packages/core/` | Business logic, utilities, constants |

## Common Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev                    # Web app on 0.0.0.0

# Building
pnpm build                  # Types package first, then web

# Code Quality
pnpm lint                   # ESLint
pnpm typecheck              # TypeScript check
pnpm test                   # Vitest tests
pnpm check                  # Run lint + typecheck + test
```

## Architecture

### Routing Structure (Web App)

The Next.js App Router is organized by user role with domain-driven paths:

- `app/(auth)` - Authentication routes (login, register, password reset)
- `app/(public)` - Public pages (landing, blog, directory)
- `app/dashboard/medico` - Doctor's workspace (specialty-aware)
- `app/dashboard/paciente` - Patient's portal
- `app/dashboard/secretaria` - Secretary's management area
- `app/dashboard/farmacia` - Pharmacy interface

### Specialty Experience System

The application has a specialty-aware dashboard system (`lib/specialty-experience/`):

- **Odontology Detection**: Automatically detects odontology specialties and shows specialized modules
- **Module Groups**: Clinical, Financial, Lab, Technology, Communication, Growth
- **Key Function**: `isOdontologySpecialty()` checks specialty names against normalized keywords
- **Configuration**: `getSpecialtyExperienceConfig()` returns dashboard variant and modules

Dentists get a different menu structure with specialized modules like:
- Periodontograma
- Dental imaging (3D models)
- Treatment estimates
- Insurance/memberships
- Lab tracking
- Tele-dentology

### Runtime Abstraction

The `lib/runtime/` layer provides runtime detection and platform-specific services:

- **Runtime Detection**: Automatically detects Tauri vs Web environment
- **Service Factory**: Returns appropriate storage/network/PDF/notification services
- **Singleton Pattern**: `RuntimeService.getInstance()` for consistent access
- **Services**: `TauriStorageService`, `WebStorageService`, `TauriNetworkService`, etc.

### Data Layer Conventions

1. **Separation of Concerns**: UI components should NOT directly fetch data
2. **Service Layer**: All Supabase queries live in `lib/supabase/services/*.ts`
3. **Custom Hooks**: Data fetching encapsulated in hooks (e.g., `useDashboardMenuGroups`)
4. **Component Props**: UI components receive data via props, not direct queries

### Authentication Flow

- **Server Client**: `lib/supabase/server.ts` - creates server-side client with cookies
- **Browser Client**: `lib/supabase/client.ts` - creates browser client
- **Middleware**: `lib/supabase/middleware.ts` - syncs sessions, handles `getUserRole()`
- **Provider**: `components/providers/supabase-auth-provider.tsx` - client-side auth state
- **Auth Sync**: `/api/auth/sync` endpoint syncs tokens between client and server

### Role-Based Access Control

Roles are stored in the `profiles` table:
- `paciente` - Patient
- `medico` - Doctor
- `secretaria` - Secretary
- `admin` - Administrator

The `getUserRole()` function checks multiple sources:
1. `profiles.role` table column
2. `user.user_metadata.role`
3. Fallback defaults

### RLS (Row Level Security)

All tables use Supabase RLS. Key policies:
- Users can only view/update their own profile
- Insertion happens via `handle_new_user()` trigger
- Email uniqueness enforced via `check_email_not_exists()` trigger

### Component Architecture

- **Dumb Components**: `@red-salud/design-system` components are pure presentation (no business logic)
- **Smart Components**: App components in `components/` handle data fetching via hooks
- **Props Pattern**: UI components receive callbacks like `onUpload`, `onChange` rather than calling services directly

### Import Conventions

| Alias | Resolves To |
|-------|-------------|
| `@/` | `apps/web/` |
| `@red-salud/core` | `packages/core/src/` |
| `@red-salud/design-system` | `packages/ui/src/` |
| `@red-salud/types` | `packages/types/src/` |

### Testing

- **Framework**: Vitest
- **Location**: `apps/web/lib/runtime/__tests__/`
- **Property Tests**: Uses `fast-check` for property-based testing
- **Test Commands**: `pnpm test`, `pnpm test:ui`, `pnpm test:coverage`

### Database Migrations

Migrations in `apps/web/supabase/migrations/` follow naming convention:
- `YYYYMMDDHHMMSS_description.sql` for timestamped migrations
- Core schema: profiles, appointments, messaging, laboratory, telemedicine
- Verification system: SACS integration, doctor verifications
- Dental features: periodontograma, RCM, clinical core

## Key Integration Points

### Google Calendar
- API routes in `app/api/calendar/google/`
- Service: `lib/services/google-calendar-service.ts`
- Hook: `hooks/use-google-calendar.ts`

### Gemini AI
- ICD-11 suggestions: `app/api/gemini/suggest-icd11/route.ts`
- Service: `lib/services/gemini-service.ts`

### Payments
- Service: `lib/services/payment-service.ts`
- Admin API: `app/api/admin/payments/route.ts`

## Important Notes

- **Package Manager**: Must use `pnpm` (not npm or yarn)
- **Build Order**: Types package must build before web
- **Environment**: Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Migrations**: Run new migrations on Supabase before deploying schema changes
