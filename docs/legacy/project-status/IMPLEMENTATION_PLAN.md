# IMPLEMENTATION PLAN: Red Salud Desktop (Tauri) & Premium UI

## Overview
This plan outlines the steps to finalize the Red Salud Tauri Desktop Application, ensuring it is fully functional offline, integrated with the backend, and features a premium "Glassmorphism" UI as requested.

Based on the analysis of `TAURI_DASHBOARD_MEDICO_PLAN.md` and `design_system.txt`, we have a clear path forward.

## Phase 1: Core Functionality (The "Pending" 50%)
We need to implement the missing hooks and services to bridge the frontend with the Tauri backend (Rust).

### 1.1 Implement Tauri Hooks
Create the following hooks in `hooks/` to replace direct fetch calls:
- `hooks/use-tauri-appointments.ts`: Manage appointments with offline cache.
- `hooks/use-tauri-patients.ts`: Manage patient data.
- `hooks/use-tauri-medical-records.ts`: Manage history/records.

### 1.2 Implement Desktop Services
Create the following services in `lib/services/`:
- `lib/services/tauri-pdf-service.ts`: Handle local PDF generation/saving.
- `lib/services/tauri-notification-service.ts`: Native system notifications.
- `lib/services/tauri-sync-service.ts`: Auto-sync logic when connectivity is restored.

## Phase 2: Premium UI Upgrade (UI/UX Pro Max)
Apply the design system tokens to the main dashboard components.

### 2.1 Global Styles (`app/globals.css`)
- Add "Glassmorphism" utility classes (backdrop-blur, white/10 backgrounds).
- Enforce the "Teal/Cyan" color palette from the design system.
- Ensure all interactive elements have `cursor-pointer` and proper hover states.

### 2.2 Component Polish
- **Sidebar**: Update `DashboardSidebar` to use a glass effect instead of solid background.
- **Header**: Update `DashboardHeader` to match the glass theme.
- **Cards/Widgets**: refactor `DashboardWidget` (if exists) or common card containers to use the glass style.

## Phase 3: Integration & Build
- Wire up the new hooks into the existing pages (`app/dashboard/medico/citas/page.tsx`, etc.).
- Verify offline mode by disconnecting and trying to view cached data.
- Run `npm run tauri build` to generate the final executable.

## Next Steps
1. Create the missing hooks and services.
2. Refactor `app/dashboard/medico/citas/page.tsx` (and others) to use the new hooks.
3. Apply the CSS improvements.
