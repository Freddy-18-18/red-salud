## Decisiones Acordadas
- Límite objetivo por archivo: 400 líneas.
- Avance paralelo en reducción de `any` y modularización tanto en `lib/supabase/services/*` como en `app/dashboard/*`.
- Paquetes usados en `scripts/` se consideran en uso.
- `mobile/` y `sacs-verification-service/` quedan para una fase posterior.

## Objetivo
- Ejecutar una refactorización incremental que mejore modularidad, responsabilidad única por archivo y limpieza de dependencias, manteniendo funcionamiento.

## Fase 1 (inicio inmediato)
- Eliminar archivos obsoletos sin referencias: `components/ui/date-picker-old.tsx`, `app/(auth)/login/page-old.tsx`, `lib/i18n/translations-old.ts`.
- Ajustar dependencias: mover `@types/*` presentes en `dependencies` del raíz a `devDependencies`.
- Verificar compilación (`build`) tras los cambios.

## Fase 2 (páginas grandes: extracción UI + hooks)
- `app/dashboard/medico/pacientes/page.tsx` (>400): extraer `hooks/usePatientsList.ts`, `components/PatientsTable.tsx`, `components/FiltersBar.tsx`.
- `app/dashboard/medico/perfil/setup/page.tsx` (>400): extraer `components/ProfileForm.tsx`, `hooks/useProfileSetup.ts`, `components/VerificationSection.tsx`.
- `app/dashboard/paciente/telemedicina/sesion/[id]/page.tsx` (>400): extraer `hooks/useTelemedicineSession.ts`, `components/SessionHeader.tsx`, `components/ChatPanel.tsx`, `components/PrescriptionPanel.tsx`.

## Fase 3 (servicios Supabase: modularización)
- `lib/supabase/services/health-metrics-service.ts` (>400): separar en `metrics/queries.ts`, `metrics/aggregations.ts`, `metrics/mutations.ts`, `metrics/types.ts`.
- `lib/supabase/services/appointments/appointments.queries.ts` (>400): dividir `availability.ts`, `basic.ts`, `mappers.ts`, `types.ts`.
- `lib/supabase/services/doctors-service.ts` (>400): separar `queries.ts`, `mutations.ts`, `mappers.ts`, `types.ts`.

## Fase 4 (UI común)
- `components/ui/date-picker.tsx` (>400): crear `components/date-picker/Calendar.tsx`, `InputField.tsx`, `hooks/useDatePicker.ts`, `types.ts` y convertir el archivo original en re-export.

## Calidad y Pruebas
- Ejecutar build tras cada bloque de cambios para validar integración.
- Introducir pruebas unitarias de servicios y hooks en siguientes iteraciones (framework: `vitest`), sin bloquear inicio.

## Entregables
- Cambios aplicados y verificados en Fase 1.
- Plan detallado de extracción por archivo (>400) con módulos propuestos.
- Reporte de dependencias ajustadas.

## Próximo Paso
- Comenzar Fase 1: eliminación de obsoletos y ajuste de dependencias con verificación de compilación.