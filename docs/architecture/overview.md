# Architecture Overview

## Platform Overview

Red Salud is a multi-platform health ecosystem organized as a monorepo managed by `pnpm` with Nx for task orchestration. The system is designed around 9 distinct health domains, each with its own dedicated interfaces and business logic.

### 9 Health Domains

| Domain | Description |
|--------|-------------|
| **Medico** | Doctor workspace -- appointments, clinical records, prescriptions, specialty-aware dashboards |
| **Paciente** | Patient portal -- health records, appointments, prescriptions, messaging |
| **Farmacia** | Pharmacy operations -- dispensing, inventory, BCV rate management |
| **Secretaria** | Administrative coordination -- scheduling, patient management, billing |
| **Clinica** | Clinic management -- multi-provider coordination, facility operations |
| **Laboratorio** | Lab services -- test orders, sample processing, result delivery |
| **Seguro** | Insurance operations -- eligibility, claims, coverage management |
| **Ambulancia** | Emergency services -- dispatch, patient transport, triage |
| **Academia** | Medical education -- training, certifications, continuing education |

---

## Applications

### Web Application
- **Location**: `apps/web`
- **Stack**: Next.js 16+ with App Router
- **Purpose**: Main platform serving all roles (patients, doctors, secretaries, pharmacy)
- **Dev Command**: `pnpm dev`

### Desktop Applications (Tauri)

| App | Location | Purpose |
|-----|----------|---------|
| Pharmacy | `apps/desktop/farmacia` | Pharmacy desktop operations |
| Medical | `apps/desktop/medico` | Doctor offline-capable workspace |
| Corporativo | `apps/desktop/corporativo` | Admin panel for corporate management |

---

## Shared Packages

| Package | Location | Purpose |
|---------|----------|---------|
| `@red-salud/types` | `packages/types/` | Shared TypeScript interfaces and Zod schemas |
| `@red-salud/design-system` | `packages/ui/` | Dumb UI components (Radix UI + Tailwind CSS) |
| `@red-salud/core` | `packages/core/` | Business logic, utilities, constants |

### Package Philosophy
- **`@red-salud/design-system`**: Pure presentation components. No business logic, no direct API calls. Components receive callbacks via props (e.g., `onUpload`).
- **`@red-salud/core`**: Shared business logic including pharmacy currency management and BCV rate fetching.
- **`@red-salud/types`**: Source of truth for type contracts across the monorepo.

---

## Auxiliary Services

| Service | Location | Purpose |
|---------|----------|---------|
| BCV Rate | `services/bcv-rate` | Currency rate fetching for pharmacy |
| RIF Verification | `services/rif-verification` | Venezuelan tax ID verification |
| SACS Verification | `services/sacs-verification` | Doctor credential verification via SACS scraping |

---

## Web App Structure

The Next.js App Router is organized by user role with domain-driven paths:

```
app/
  (auth)/         -- Authentication routes (login, register, password reset)
  (public)/       -- Public pages (landing, blog, directory)
  dashboard/
    medico/       -- Doctor workspace (specialty-aware)
    paciente/     -- Patient portal
    secretaria/   -- Secretary management area
    farmacia/     -- Pharmacy interface
```

---

## Key Architectural Patterns

### Data Layer

1. **Separation of Concerns**: UI components do NOT directly fetch data
2. **Service Layer**: All Supabase queries live in `lib/supabase/services/*.ts`
3. **Custom Hooks**: Data fetching encapsulated in hooks
4. **Component Props**: UI components receive data via props, not direct queries

### Runtime Abstraction

The `lib/runtime/` layer provides runtime detection and platform-specific services:
- **Runtime Detection**: Automatically detects Tauri vs Web environment
- **Service Factory**: Returns appropriate storage/network/PDF/notification services
- **Singleton Pattern**: `RuntimeService.getInstance()` for consistent access

### Specialty Experience System

Located in `lib/specialty-experience/`:
- **Detection**: Automatically detects odontology specialties
- **Module Groups**: Clinical, Financial, Lab, Technology, Communication, Growth
- **Configuration**: `getSpecialtyExperienceConfig()` returns dashboard variant and modules

### Authentication Flow

- **Server Client**: `lib/supabase/server.ts`
- **Browser Client**: `lib/supabase/client.ts`
- **Middleware**: `lib/supabase/middleware.ts` (session sync, `getUserRole()`)
- **Provider**: `components/providers/supabase-auth-provider.tsx`
- **Auth Sync**: `/api/auth/sync` endpoint

### Role-Based Access Control

Roles stored in `profiles` table: `paciente`, `medico`, `secretaria`, `admin`

The `getUserRole()` function checks:
1. `profiles.role` table column
2. `user.user_metadata.role`
3. Fallback defaults

All tables use Supabase RLS (Row Level Security).

---

## Import Conventions

| Alias | Resolves To |
|-------|-------------|
| `@/` | `apps/web/` |
| `@red-salud/core` | `packages/core/src/` |
| `@red-salud/design-system` | `packages/ui/src/` |
| `@red-salud/types` | `packages/types/src/` |

---

## State Management

- Local state or URL state (searchParams) for UI controls
- React Context or Zustand for global session/user state

---

## Related Docs

- [Domain-Driven Design](./domain-driven-design.md)
- [API Gateway](./api-gateway.md)
- [Data Model](./data-model.md)
- [Development Guide](../guides/development.md)
- [PRD](../product/prd.md)
