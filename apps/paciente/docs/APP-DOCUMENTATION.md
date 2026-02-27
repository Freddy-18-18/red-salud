# App Paciente - Documentación

## Visión General

La App Paciente es una aplicación web independiente para pacientes de la red de salud.

## Estructura

```
apps/paciente/
├── app/                    # Rutas de Next.js
├── components/             # Componentes React
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuraciones
├── packages/
│   └── sdk-paciente/      # SDK específico de paciente
├── public/                # Archivos estáticos
├── supabase/              # Edge functions y migraciones propias
├── proxy.ts               # Middleware de autenticación
└── package.json
```

## SDK - @red-salud/sdk-paciente

El SDK de paciente proporciona funciones para:

- **Citas**: getPatientAppointments, createAppointment, cancel
- **Doctores**: getDoctors, getDoctorProfile, getAvailableDoctors, getAvailableTimeSlots
- **Especialidades**: getSpecialties
- **Edge Functions**: invokeTyped para llamadas tipadas

### Uso

```typescript
import { createPacienteSdk } from '@red-salud/sdk-paciente';
import { supabase } from '@/lib/supabase/client';

const sdk = createPacienteSdk(supabase);

// Obtener citas del paciente
const appointments = await sdk.appointments.getPatientAppointments(patientId);

// Buscar doctores por especialidad
const doctors = await sdk.appointments.getDoctors(specialtyId);

// Obtener horarios disponibles
const slots = await sdk.appointments.getAvailableTimeSlots(doctorId, date);
```

## Autenticación

El middleware `proxy.ts` verifica que el usuario tenga el rol `paciente`. Si el usuario tiene otro rol, es redirigido a la app correspondiente.

## Dependencias

- `@red-salud/sdk-paciente` - SDK propio de la app
- `@red-salud/contracts` - Contratos y esquemas compartidos
- `@red-salud/types` - Tipos compartidos
- `@red-salud/design-system` - Componentes de UI
- `@red-salud/identity` - Servicios de identidad
- `@supabase/supabase-js` - Cliente de Supabase

## Scripts

```bash
pnpm dev          # Iniciar servidor de desarrollo (puerto 3002)
pnpm build        # Build de producción
pnpm lint         # Linting
pnpm typecheck   # Verificación de tipos
```

## Diferencias con App Médico

| Característica | App Paciente | App Médico |
|----------------|--------------|------------|
| SDK | `@red-salud/sdk-paciente` | `@red-salud/sdk-medico` |
| Rol requerido | `paciente` | `medico` |
| Edge Functions | Propias en `supabase/` | Propias en `supabase/` |
| Propósito | Citas, doctores, horarios | Gestión de consultorio |
