# Farmacia Domain

The pharmacy domain handles medication dispensing, inventory management, and prescription validation.

## Key Features

- **Prescription Validation**: Receive and validate prescriptions from doctors
- **Dispensing Workflow**: Track medication dispensing with auditable state changes
- **Inventory Management**: Stock control and BCV rate-based pricing
- **Desktop Application**: Tauri-based desktop app for offline-capable pharmacy operations
- **Currency Management**: BCV rate fetching for medication pricing (Venezuela-specific)

## Applications

- **Web**: `/dashboard/farmacia` -- Web-based pharmacy interface
- **Desktop**: `apps/desktop/farmacia` -- Tauri desktop application

## Key Files

- Desktop app: `apps/desktop/farmacia/`
- Web dashboard: `apps/web/app/dashboard/farmacia/`
- Core pharmacy logic: `packages/core/src/pharmacy/`
- BCV rate service: `services/bcv-rate/`
