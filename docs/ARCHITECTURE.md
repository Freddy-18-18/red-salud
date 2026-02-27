# Architecture

## Overview

This project is a monorepo managed by `pnpm`, organized to share core logic and UI components across web and desktop applications.

## Applications

- **`apps/web` (`red-salud-web`)**: Next.js 14+ application serving as the main platform for patients, doctors, and secretaries.
- **`apps/desktop-farmacia` (`@red-salud/farmacia-desktop`)**: Tauri-based desktop application for pharmacy management.
- **`apps/desktop-medico` (`red-salud-desktop-medico`)**: Tauri-based desktop application for medical offline usage.

## Shared Packages

- **`packages/core` (`@red-salud/core`)**: 
  - Contains shared business logic, utilities, and constants.
  - **Pharmacy Module**: Contains currency management and rate fetching logic (`packages/core/src/pharmacy`). Note: While heavily used by the desktop app, the web app consumes specific parts like `BCVRateFetcher`.
- **`packages/ui` (`@red-salud/design-system`)**: 
  - Validated, reusable UI components built with Radix UI and Tailwind CSS.
  - **Philosophy**: Dumb components. They should not contain business logic or direct API calls (e.g., `AvatarUpload` receives `onUpload` prop rather than calling Supabase directly).
- **`packages/types` (`@red-salud/types`)**: 
  - Shared TypeScript interfaces and Zod schemas to ensure type consistency across the monorepo.

## Project Structure (Web)

The `apps/web` application follows a domain-driven structure within the Next.js App Router:

- **`app/(auth)`**: Authentication routes (Login, Register, Forgot Password).
- **`app/(public)`**: Public-facing pages (Landing, Blog, Directory).
- **`app/dashboard`**: Protected routes, split by role:
  - `app/dashboard/medico`: Doctor's workspace.
  - `app/dashboard/paciente`: Patient's portal.
  - `app/dashboard/secretaria`: Secretary's management area.
  - `app/dashboard/farmacia`: Pharmacy interface (Web version).

## Conventions

### Imports
- **`@/components`**: Local components specific to the web app.
- **`@/lib`**: Local utilities, hooks, and services.
- **`@red-salud/core`**: Import from shared core business logic.
- **`@red-salud/design-system`**: Import shared UI components.

### Data Layer
- **Separation of Concerns**: UI components should not directly fetch data.
- **Hooks/Services**: Data fetching and mutations should be encapsulated in custom hooks (e.g., `useProfileSectionV2`) or service modules.
- **Supabase**: Direct Supabase client usage should be limited to these hooks/services, keeping UI components pure and testable.

### State Management
- Prefer local state or URL state (searchParams) for UI controls.
- Use React Context or Zustand for global session/user state.
