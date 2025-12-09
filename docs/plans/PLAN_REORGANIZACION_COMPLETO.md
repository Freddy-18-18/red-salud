# Plan de Reorganización Completa - Red-Salud

## 📊 Análisis Detallado

### Archivos Problemáticos (>400 líneas):

1. **app/dashboard/paciente/configuracion/page.tsx** - 1059 líneas
   - Responsabilidades: Perfil, Notificaciones, Seguridad, Privacidad, Preferencias
   - Acción: Dividir en 6 componentes

2. **components/dashboard/medico/medical-workspace.tsx** - 1013 líneas
   - Responsabilidades: Editor, Preview, Templates, ICD Search, AI Analysis
   - Acción: Dividir en 7 componentes

3. **components/dashboard/profile/tabs/medical-tab-improved.tsx** - 704 líneas
   - Responsabilidades: Historia médica, Alergias, Medicamentos, Contactos emergencia
   - Acción: Dividir en 5 componentes + eliminar duplicados

4. **app/dashboard/paciente/page.tsx** - 676 líneas
   - Responsabilidades: Dashboard, Stats, Citas, Métricas
   - Acción: Dividir en 5 componentes

5. **lib/i18n/translations.ts** - 667 líneas
   - Responsabilidades: Todas las traducciones en un archivo
   - Acción: Dividir por módulos (auth, dashboard, medical, etc.)

6. **app/dashboard/medico/pacientes/page.tsx** - 649 líneas
   - Responsabilidades: Lista pacientes, Búsqueda, Filtros, Acciones
   - Acción: Dividir en 5 componentes

7. **components/dashboard/profile/tabs/medical-tab-new.tsx** - 647 líneas
   - Acción: ELIMINAR (duplicado de medical-tab-improved)

8. **lib/supabase/services/appointments-service.ts** - 628 líneas
   - Acción: Dividir en queries, mutations, types

9. **app/dashboard/medico/perfil/setup/page.tsx** - 623 líneas
   - Acción: Dividir en 4 componentes

10. **lib/supabase/services/telemedicine-service.ts** - 563 líneas
    - Acción: Dividir en queries, mutations, types

11. **components/dashboard/profile/tabs/profile-tab.tsx** - 552 líneas
    - Acción: Dividir en 4 secciones

12. **app/dashboard/paciente/citas/nueva/page.tsx** - 511 líneas
    - Acción: Dividir en 4 componentes

13. **app/dashboard/medico/pacientes/nuevo/page.tsx** - 484 líneas
    - Acción: Dividir en 3 componentes

14. **lib/supabase/services/health-metrics-service.ts** - 481 líneas
    - Acción: Dividir en queries, mutations, types

15. **components/ui/date-picker.tsx** - 462 líneas
    - Acción: Dividir en 3 componentes

16. **app/dashboard/paciente/medicamentos/page.tsx** - 435 líneas
    - Acción: Dividir en 4 componentes

17. **lib/templates/structured-templates.ts** - 432 líneas
    - Acción: Dividir por categorías

18. **components/dashboard/profile/tabs/security-tab-new.tsx** - 414 líneas
    - Acción: Dividir en 4 secciones

19. **lib/supabase/services/medications-service.ts** - 406 líneas
    - Acción: Dividir en queries, mutations, types

---

## 🎯 Nueva Estructura de Carpetas

```
/app
  /dashboard
    /paciente
      /configuracion
        - page.tsx (orquestador <150 líneas)
        /_components
          - profile-section.tsx
          - notifications-section.tsx
          - security-section.tsx
          - privacy-section.tsx
          - preferences-section.tsx
      /citas
        /nueva
          - page.tsx (orquestador <150 líneas)
          /_components
            - doctor-selection.tsx
            - date-time-picker.tsx
            - appointment-summary.tsx
      /medicamentos
        - page.tsx (orquestador <150 líneas)
        /_components
          - medications-list.tsx
          - medication-form.tsx
          - medication-filters.tsx
      - page.tsx (orquestador <150 líneas)
      /_components
        - dashboard-stats.tsx
        - upcoming-appointments.tsx
        - health-metrics-summary.tsx
        - quick-actions.tsx
        
    /medico
      /pacientes
        /nuevo
          - page.tsx (orquestador <150 líneas)
          /_components
            - patient-basic-info.tsx
            - patient-medical-info.tsx
            - patient-emergency-contacts.tsx
        - page.tsx (orquestador <150 líneas)
        /_components
          - patients-list.tsx
          - patients-filters.tsx
          - patients-search.tsx
          - patient-card.tsx
      /perfil
        /setup
          - page.tsx (orquestador <150 líneas)
          /_components
            - professional-info-step.tsx
            - specialties-step.tsx
            - schedule-step.tsx
            - verification-step.tsx

/components
  /dashboard
    /medico
      /workspace
        - medical-workspace.tsx (orquestador <150 líneas)
        /_components
          - workspace-header.tsx
          - workspace-toolbar.tsx
          - workspace-editor.tsx
          - workspace-preview.tsx
          - workspace-templates.tsx
          - workspace-icd-search.tsx
          - workspace-ai-analysis.tsx
          
    /profile
      /tabs
        - profile-tab.tsx (orquestador <150 líneas)
        - medical-tab.tsx (orquestador <150 líneas)
        - security-tab.tsx (orquestador <150 líneas)
        - documents-tab.tsx
        - preferences-tab.tsx
        - activity-tab.tsx
        - billing-tab.tsx
        - privacy-tab.tsx
        /_sections
          /profile
            - personal-info-section.tsx
            - contact-info-section.tsx
            - professional-info-section.tsx
          /medical
            - medical-history-section.tsx
            - allergies-section.tsx
            - medications-section.tsx
            - emergency-contacts-section.tsx
            - chronic-conditions-section.tsx
          /security
            - password-section.tsx
            - two-factor-section.tsx
            - sessions-section.tsx
            - security-questions-section.tsx
            
  /ui
    /forms
      /date-picker
        - date-picker.tsx (orquestador <150 líneas)
        - date-picker-input.tsx
        - date-picker-calendar.tsx
        - date-picker-range.tsx

/lib
  /i18n
    /translations
      - es.ts (orquestador)
      /modules
        - auth.ts
        - dashboard.ts
        - medical.ts
        - appointments.ts
        - profile.ts
        - common.ts
        - errors.ts
        
  /supabase
    /services
      /appointments
        - index.ts (exporta todo)
        - appointments.queries.ts
        - appointments.mutations.ts
        - appointments.types.ts
        - appointments.utils.ts
      /telemedicine
        - index.ts
        - telemedicine.queries.ts
        - telemedicine.mutations.ts
        - telemedicine.types.ts
        - telemedicine.utils.ts
      /health-metrics
        - index.ts
        - health-metrics.queries.ts
        - health-metrics.mutations.ts
        - health-metrics.types.ts
        - health-metrics.utils.ts
      /medications
        - index.ts
        - medications.queries.ts
        - medications.mutations.ts
        - medications.types.ts
        - medications.utils.ts
      /doctors
        - index.ts
        - doctors.queries.ts
        - doctors.mutations.ts
        - doctors.types.ts
        - doctors.utils.ts
      /messaging
        - index.ts
        - messaging.queries.ts
        - messaging.mutations.ts
        - messaging.types.ts
        - messaging.utils.ts
      /medical-records
        - index.ts
        - medical-records.queries.ts
        - medical-records.mutations.ts
        - medical-records.types.ts
        - medical-records.utils.ts
        
  /templates
    - index.ts (exporta todo)
    /medical
      - consultation-templates.ts
      - prescription-templates.ts
      - lab-order-templates.ts
    /structured
      - structured-templates.ts
      - template-types.ts
      - template-utils.ts

/hooks
  /auth
    - use-oauth-errors.ts
    - use-rate-limit.ts
  /data
    - use-appointments.ts
    - use-auth.ts
    - use-doctor-profile.ts
    - use-health-metrics.ts
    - use-laboratory.ts
    - use-medical-records.ts
    - use-medications.ts
    - use-messaging.ts
    - use-patient-profile.ts
    - use-telemedicine.ts
  /ui
    - use-theme-color.ts
```

---

## 🔧 Plan de Refactorización Detallado

### FASE 1: Preparación (Crear estructura base)

#### 1.1 Crear carpetas de componentes
```
components/dashboard/medico/workspace/_components/
components/dashboard/profile/tabs/_sections/profile/
components/dashboard/profile/tabs/_sections/medical/
components/dashboard/profile/tabs/_sections/security/
components/ui/forms/date-picker/
```

#### 1.2 Crear carpetas de páginas
```
app/dashboard/paciente/configuracion/_components/
app/dashboard/paciente/citas/nueva/_components/
app/dashboard/paciente/medicamentos/_components/
app/dashboard/paciente/_components/
app/dashboard/medico/pacientes/_components/
app/dashboard/medico/pacientes/nuevo/_components/
app/dashboard/medico/perfil/setup/_components/
```

#### 1.3 Crear carpetas de servicios
```
lib/supabase/services/appointments/
lib/supabase/services/telemedicine/
lib/supabase/services/health-metrics/
lib/supabase/services/medications/
lib/supabase/services/doctors/
lib/supabase/services/messaging/
lib/supabase/services/medical-records/
```

#### 1.4 Crear carpetas de traducciones
```
lib/i18n/translations/modules/
```

#### 1.5 Crear carpetas de templates
```
lib/templates/medical/
lib/templates/structured/
```

---

### FASE 2: Refactorización de Servicios (Primero, para no romper dependencias)

#### 2.1 appointments-service.ts (628 líneas) → 4 archivos
- `lib/supabase/services/appointments/appointments.types.ts` (~100 líneas)
- `lib/supabase/services/appointments/appointments.queries.ts` (~250 líneas)
- `lib/supabase/services/appointments/appointments.mutations.ts` (~200 líneas)
- `lib/supabase/services/appointments/index.ts` (~50 líneas - exporta todo)

#### 2.2 telemedicine-service.ts (563 líneas) → 4 archivos
- `lib/supabase/services/telemedicine/telemedicine.types.ts` (~80 líneas)
- `lib/supabase/services/telemedicine/telemedicine.queries.ts` (~220 líneas)
- `lib/supabase/services/telemedicine/telemedicine.mutations.ts` (~180 líneas)
- `lib/supabase/services/telemedicine/index.ts` (~50 líneas)

#### 2.3 health-metrics-service.ts (481 líneas) → 4 archivos
- `lib/supabase/services/health-metrics/health-metrics.types.ts` (~70 líneas)
- `lib/supabase/services/health-metrics/health-metrics.queries.ts` (~180 líneas)
- `lib/supabase/services/health-metrics/health-metrics.mutations.ts` (~150 líneas)
- `lib/supabase/services/health-metrics/index.ts` (~50 líneas)

#### 2.4 medications-service.ts (406 líneas) → 4 archivos
- `lib/supabase/services/medications/medications.types.ts` (~60 líneas)
- `lib/supabase/services/medications/medications.queries.ts` (~150 líneas)
- `lib/supabase/services/medications/medications.mutations.ts` (~130 líneas)
- `lib/supabase/services/medications/index.ts` (~50 líneas)

---

### FASE 3: Refactorización de Traducciones

#### 3.1 translations.ts (667 líneas) → 8 archivos
- `lib/i18n/translations/modules/auth.ts` (~100 líneas)
- `lib/i18n/translations/modules/dashboard.ts` (~100 líneas)
- `lib/i18n/translations/modules/medical.ts` (~120 líneas)
- `lib/i18n/translations/modules/appointments.ts` (~80 líneas)
- `lib/i18n/translations/modules/profile.ts` (~100 líneas)
- `lib/i18n/translations/modules/common.ts` (~80 líneas)
- `lib/i18n/translations/modules/errors.ts` (~60 líneas)
- `lib/i18n/translations/es.ts` (~50 líneas - orquestador)

---

### FASE 4: Refactorización de Templates

#### 4.1 structured-templates.ts (432 líneas) → 4 archivos
- `lib/templates/structured/template-types.ts` (~80 líneas)
- `lib/templates/structured/consultation-templates.ts` (~120 líneas)
- `lib/templates/structured/prescription-templates.ts` (~100 líneas)
- `lib/templates/structured/lab-templates.ts` (~100 líneas)
- `lib/templates/structured/index.ts` (~30 líneas)

---

### FASE 5: Refactorización de Componentes UI

#### 5.1 date-picker.tsx (462 líneas) → 4 archivos
- `components/ui/forms/date-picker/date-picker.tsx` (~100 líneas - orquestador)
- `components/ui/forms/date-picker/date-picker-input.tsx` (~150 líneas)
- `components/ui/forms/date-picker/date-picker-calendar.tsx` (~150 líneas)
- `components/ui/forms/date-picker/date-picker-range.tsx` (~50 líneas)

---

### FASE 6: Refactorización de Tabs de Perfil

#### 6.1 medical-tab-improved.tsx (704 líneas) → 6 archivos
- `components/dashboard/profile/tabs/medical-tab.tsx` (~120 líneas - orquestador)
- `components/dashboard/profile/tabs/_sections/medical/medical-history-section.tsx` (~150 líneas)
- `components/dashboard/profile/tabs/_sections/medical/allergies-section.tsx` (~120 líneas)
- `components/dashboard/profile/tabs/_sections/medical/medications-section.tsx` (~150 líneas)
- `components/dashboard/profile/tabs/_sections/medical/emergency-contacts-section.tsx` (~120 líneas)
- `components/dashboard/profile/tabs/_sections/medical/chronic-conditions-section.tsx` (~100 líneas)

#### 6.2 profile-tab.tsx (552 líneas) → 4 archivos
- `components/dashboard/profile/tabs/profile-tab.tsx` (~120 líneas - orquestador)
- `components/dashboard/profile/tabs/_sections/profile/personal-info-section.tsx` (~180 líneas)
- `components/dashboard/profile/tabs/_sections/profile/contact-info-section.tsx` (~150 líneas)
- `components/dashboard/profile/tabs/_sections/profile/professional-info-section.tsx` (~100 líneas)

#### 6.3 security-tab-new.tsx (414 líneas) → 5 archivos
- `components/dashboard/profile/tabs/security-tab.tsx` (~100 líneas - orquestador)
- `components/dashboard/profile/tabs/_sections/security/password-section.tsx` (~100 líneas)
- `components/dashboard/profile/tabs/_sections/security/two-factor-section.tsx` (~100 líneas)
- `components/dashboard/profile/tabs/_sections/security/sessions-section.tsx` (~100 líneas)
- `components/dashboard/profile/tabs/_sections/security/security-questions-section.tsx` (~80 líneas)

---

### FASE 7: Refactorización de Medical Workspace

#### 7.1 medical-workspace.tsx (1013 líneas) → 8 archivos
- `components/dashboard/medico/workspace/medical-workspace.tsx` (~120 líneas - orquestador)
- `components/dashboard/medico/workspace/_components/workspace-header.tsx` (~100 líneas)
- `components/dashboard/medico/workspace/_components/workspace-toolbar.tsx` (~150 líneas)
- `components/dashboard/medico/workspace/_components/workspace-editor.tsx` (~200 líneas)
- `components/dashboard/medico/workspace/_components/workspace-preview.tsx` (~150 líneas)
- `components/dashboard/medico/workspace/_components/workspace-templates.tsx` (~120 líneas)
- `components/dashboard/medico/workspace/_components/workspace-icd-search.tsx` (~120 líneas)
- `components/dashboard/medico/workspace/_components/workspace-ai-analysis.tsx` (~100 líneas)

---

### FASE 8: Refactorización de Páginas de Paciente

#### 8.1 configuracion/page.tsx (1059 líneas) → 7 archivos
- `app/dashboard/paciente/configuracion/page.tsx` (~120 líneas - orquestador)
- `app/dashboard/paciente/configuracion/_components/profile-section.tsx` (~180 líneas)
- `app/dashboard/paciente/configuracion/_components/notifications-section.tsx` (~150 líneas)
- `app/dashboard/paciente/configuracion/_components/security-section.tsx` (~180 líneas)
- `app/dashboard/paciente/configuracion/_components/privacy-section.tsx` (~150 líneas)
- `app/dashboard/paciente/configuracion/_components/preferences-section.tsx` (~150 líneas)
- `app/dashboard/paciente/configuracion/_components/billing-section.tsx` (~120 líneas)

#### 8.2 page.tsx (676 líneas) → 6 archivos
- `app/dashboard/paciente/page.tsx` (~100 líneas - orquestador)
- `app/dashboard/paciente/_components/dashboard-stats.tsx` (~120 líneas)
- `app/dashboard/paciente/_components/upcoming-appointments.tsx` (~150 líneas)
- `app/dashboard/paciente/_components/health-metrics-summary.tsx` (~150 líneas)
- `app/dashboard/paciente/_components/quick-actions.tsx` (~100 líneas)
- `app/dashboard/paciente/_components/recent-activity.tsx` (~120 líneas)

#### 8.3 citas/nueva/page.tsx (511 líneas) → 5 archivos
- `app/dashboard/paciente/citas/nueva/page.tsx` (~100 líneas - orquestador)
- `app/dashboard/paciente/citas/nueva/_components/doctor-selection.tsx` (~150 líneas)
- `app/dashboard/paciente/citas/nueva/_components/date-time-picker.tsx` (~120 líneas)
- `app/dashboard/paciente/citas/nueva/_components/appointment-summary.tsx` (~100 líneas)
- `app/dashboard/paciente/citas/nueva/_components/payment-method.tsx` (~100 líneas)

#### 8.4 medicamentos/page.tsx (435 líneas) → 5 archivos
- `app/dashboard/paciente/medicamentos/page.tsx` (~100 líneas - orquestador)
- `app/dashboard/paciente/medicamentos/_components/medications-list.tsx` (~120 líneas)
- `app/dashboard/paciente/medicamentos/_components/medication-form.tsx` (~100 líneas)
- `app/dashboard/paciente/medicamentos/_components/medication-filters.tsx` (~80 líneas)
- `app/dashboard/paciente/medicamentos/_components/medication-card.tsx` (~80 líneas)

---

### FASE 9: Refactorización de Páginas de Médico

#### 9.1 pacientes/page.tsx (649 líneas) → 6 archivos
- `app/dashboard/medico/pacientes/page.tsx` (~100 líneas - orquestador)
- `app/dashboard/medico/pacientes/_components/patients-list.tsx` (~150 líneas)
- `app/dashboard/medico/pacientes/_components/patients-filters.tsx` (~120 líneas)
- `app/dashboard/medico/pacientes/_components/patients-search.tsx` (~100 líneas)
- `app/dashboard/medico/pacientes/_components/patient-card.tsx` (~120 líneas)
- `app/dashboard/medico/pacientes/_components/patient-actions.tsx` (~100 líneas)

#### 9.2 pacientes/nuevo/page.tsx (484 líneas) → 4 archivos
- `app/dashboard/medico/pacientes/nuevo/page.tsx` (~100 líneas - orquestador)
- `app/dashboard/medico/pacientes/nuevo/_components/patient-basic-info.tsx` (~150 líneas)
- `app/dashboard/medico/pacientes/nuevo/_components/patient-medical-info.tsx` (~150 líneas)
- `app/dashboard/medico/pacientes/nuevo/_components/patient-emergency-contacts.tsx` (~100 líneas)

#### 9.3 perfil/setup/page.tsx (623 líneas) → 5 archivos
- `app/dashboard/medico/perfil/setup/page.tsx` (~100 líneas - orquestador)
- `app/dashboard/medico/perfil/setup/_components/professional-info-step.tsx` (~150 líneas)
- `app/dashboard/medico/perfil/setup/_components/specialties-step.tsx` (~120 líneas)
- `app/dashboard/medico/perfil/setup/_components/schedule-step.tsx` (~150 líneas)
- `app/dashboard/medico/perfil/setup/_components/verification-step.tsx` (~120 líneas)

---

### FASE 10: Limpieza y Consolidación

#### 10.1 Eliminar archivos duplicados
- ❌ `components/dashboard/profile/tabs/medical-tab.tsx` (viejo)
- ❌ `components/dashboard/profile/tabs/medical-tab-new.tsx` (duplicado)
- ❌ `components/ui/date-picker-old.tsx`
- ❌ `components/ui/date-picker-calendar-only.tsx`

#### 10.2 Mover hooks a carpetas correctas
- Mover todos los hooks de `/hooks/*.ts` a `/hooks/data/*.ts`
- Mantener estructura: `/hooks/auth/`, `/hooks/data/`, `/hooks/ui/`

---

## 📋 Checklist de Ejecución

### Fase 1: Preparación
- [ ] Crear todas las carpetas necesarias
- [ ] Crear archivos index.ts para exportaciones

### Fase 2: Servicios
- [ ] Refactorizar appointments-service
- [ ] Refactorizar telemedicine-service
- [ ] Refactorizar health-metrics-service
- [ ] Refactorizar medications-service
- [ ] Actualizar imports en hooks

### Fase 3: Traducciones
- [ ] Dividir translations.ts
- [ ] Actualizar imports en componentes

### Fase 4: Templates
- [ ] Dividir structured-templates.ts
- [ ] Actualizar imports

### Fase 5: UI Components
- [ ] Refactorizar date-picker
- [ ] Actualizar imports

### Fase 6: Profile Tabs
- [ ] Refactorizar medical-tab
- [ ] Refactorizar profile-tab
- [ ] Refactorizar security-tab
- [ ] Eliminar duplicados

### Fase 7: Medical Workspace
- [ ] Refactorizar medical-workspace
- [ ] Actualizar imports

### Fase 8: Páginas Paciente
- [ ] Refactorizar configuracion/page
- [ ] Refactorizar dashboard/page
- [ ] Refactorizar citas/nueva/page
- [ ] Refactorizar medicamentos/page

### Fase 9: Páginas Médico
- [ ] Refactorizar pacientes/page
- [ ] Refactorizar pacientes/nuevo/page
- [ ] Refactorizar perfil/setup/page

### Fase 10: Limpieza
- [ ] Eliminar archivos duplicados
- [ ] Reorganizar hooks
- [ ] Verificar compilación
- [ ] Ejecutar linter

---

## 🎯 Resultado Esperado

- ✅ 0 archivos >400 líneas
- ✅ Cada archivo con una sola responsabilidad
- ✅ Estructura clara y organizada
- ✅ Sin duplicados
- ✅ Fácil mantenimiento
- ✅ Mejor experiencia de desarrollo

---

## ⚠️ Notas Importantes

1. **Orden de ejecución**: Seguir el orden de las fases para evitar romper dependencias
2. **Testing**: Verificar compilación después de cada fase
3. **Commits**: Hacer commit después de cada fase completada
4. **Imports**: Actualizar todos los imports después de mover archivos
5. **Types**: Mantener tipos compartidos en archivos separados
