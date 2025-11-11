# Plan de Reorganización Completa del Proyecto Red-Salud

## 📊 Análisis Actual

### Problemas Identificados:
1. **Archivos muy grandes** (>400 líneas):
   - `medical-workspace.tsx`: 1013 líneas ❌
   - `medical-tab-improved.tsx`: 704 líneas ❌
   - `medical-tab-new.tsx`: 647 líneas ❌
   - `profile-tab.tsx`: 552 líneas ❌
   - `date-picker.tsx`: 462 líneas ❌
   - `security-tab-new.tsx`: 414 líneas ❌

2. **Múltiples responsabilidades** en un solo archivo
3. **Archivos duplicados** (medical-tab, medical-tab-new, medical-tab-improved)
4. **Falta de organización** en subcarpetas
5. **Servicios muy grandes** en lib/supabase/services

### Estadísticas:
- **Components**: 113 archivos, 18MB
- **Lib**: 54 archivos, 311KB
- **App**: 125 archivos, 685KB

---

## 🎯 Objetivos

1. ✅ Ningún archivo mayor a 400 líneas
2. ✅ Una sola responsabilidad por archivo
3. ✅ Estructura clara con subcarpetas lógicas
4. ✅ Eliminar duplicados
5. ✅ Separar lógica de presentación

---

## 📁 Nueva Estructura Propuesta

```
/components
  /auth
    /forms
      - login-form.tsx (mantener)
      - register-form.tsx (mantener)
    /ui
      - remember-me-checkbox.tsx (mantener)
      
  /dashboard
    /common
      - session-timeout-warning.tsx
      - active-sessions.tsx
      
    /profile
      /modals
        - user-profile-modal.tsx (refactorizar)
        - doctor-profile-modal.tsx (refactorizar)
      /tabs
        /common
          - profile-tab.tsx (dividir)
          - security-tab.tsx (dividir)
          - preferences-tab.tsx (mantener)
          - activity-tab.tsx (mantener)
          - billing-tab.tsx (mantener)
          - privacy-tab.tsx (mantener)
        /medical
          - medical-tab.tsx (consolidar y dividir)
          - medical-history-section.tsx (nuevo)
          - allergies-section.tsx (nuevo)
          - medications-section.tsx (nuevo)
          - emergency-contacts-section.tsx (nuevo)
        /documents
          - documents-tab.tsx (dividir)
          - didit-integration.tsx (nuevo)
          - cedula-upload.tsx (nuevo)
          - photo-upload.tsx (nuevo)
      /components
        /security
          - change-password-modal.tsx (mantener)
          - setup-2fa-modal.tsx (mantener)
          - verify-phone-modal.tsx (mantener)
          - security-questions-modal.tsx (mantener)
          - security-events-modal.tsx (mantener)
          - active-sessions-modal.tsx (mantener)
        /shared
          - tab-navigation.tsx (mantener)
          - form-section.tsx (nuevo)
          - loading-skeleton.tsx (nuevo)
          
    /medico
      /workspace
        - medical-workspace.tsx (dividir en múltiples)
        - workspace-header.tsx (nuevo)
        - workspace-toolbar.tsx (nuevo)
        - workspace-editor.tsx (nuevo)
        - workspace-preview.tsx (nuevo)
      /templates
        - template-marketplace.tsx (mantener)
        - structured-template-marketplace.tsx (mantener)
        - structured-template-editor.tsx (dividir)
        - template-card.tsx (nuevo)
        - template-filters.tsx (nuevo)
      /components
        - medication-input.tsx (mantener)
        - diagnosis-input.tsx (nuevo)
        - prescription-form.tsx (nuevo)
        
    /paciente
      - medical-profile-preview.tsx (mantener)
      - medical-profile-view.tsx (dividir)
      
  /layout
    - header.tsx (mantener)
    - footer.tsx (mantener)
    
  /messaging
    - conversation-list.tsx (mantener)
    - message-thread.tsx (mantener)
    - message-input.tsx (mantener)
    - new-conversation-dialog.tsx (mantener)
    
  /sections
    - hero-section.tsx (mantener)
    - features-section.tsx (mantener)
    - dashboard-stats.tsx (mantener)
    - infinite-specialties-scroll.tsx (mantener)
    
  /ui
    /forms
      - date-picker.tsx (dividir)
      - date-picker-input.tsx (nuevo)
      - date-picker-calendar.tsx (nuevo)
      - phone-input.tsx (mantener)
      - custom-select.tsx (mantener)
      - timezone-select.tsx (mantener)
    /feedback
      - toast.tsx (mantener)
      - alert.tsx (mantener)
      - progress.tsx (mantener)
    /data-display
      - card.tsx (mantener)
      - table.tsx (mantener)
      - badge.tsx (mantener)
      - avatar.tsx (mantener)
    /navigation
      - tabs.tsx (mantener)
      - navigation-menu.tsx (mantener)
      - dropdown-menu.tsx (mantener)
    /overlays
      - dialog.tsx (mantener)
      - sheet.tsx (mantener)
      - popover.tsx (mantener)
      - tooltip.tsx (mantener)
    /inputs
      - button.tsx (mantener)
      - input.tsx (mantener)
      - textarea.tsx (mantener)
      - checkbox.tsx (mantener)
      - switch.tsx (mantener)
      - select.tsx (mantener)
      - label.tsx (mantener)
      - calendar.tsx (mantener)
      - command.tsx (mantener)
      - scroll-area.tsx (mantener)
      - separator.tsx (mantener)
      - toggle.tsx (mantener)
      - toggle-group.tsx (mantener)
      - accordion.tsx (mantener)
      
  /video
    - video-background.tsx (mantener)
    
  /providers
    - app-providers.tsx (mantener)
    - supabase-auth-provider.tsx (mantener)

/lib
  /supabase
    /services
      /appointments
        - appointments-service.ts (dividir)
        - appointments-queries.ts (nuevo)
        - appointments-mutations.ts (nuevo)
        - appointments-types.ts (nuevo)
      /telemedicine
        - telemedicine-service.ts (dividir)
        - telemedicine-queries.ts (nuevo)
        - telemedicine-mutations.ts (nuevo)
        - telemedicine-types.ts (nuevo)
      /health-metrics
        - health-metrics-service.ts (dividir)
        - health-metrics-queries.ts (nuevo)
        - health-metrics-mutations.ts (nuevo)
        - health-metrics-types.ts (nuevo)
      /medications
        - medications-service.ts (dividir)
        - medications-queries.ts (nuevo)
        - medications-mutations.ts (nuevo)
        - medications-types.ts (nuevo)
      /doctors
        - doctors-service.ts (dividir)
        - doctors-queries.ts (nuevo)
        - doctors-mutations.ts (nuevo)
        - doctors-types.ts (nuevo)
      /messaging
        - messaging-service.ts (dividir)
        - messaging-queries.ts (nuevo)
        - messaging-mutations.ts (nuevo)
        - messaging-types.ts (nuevo)
      /medical-records
        - medical-records-service.ts (dividir)
        - medical-records-queries.ts (nuevo)
        - medical-records-mutations.ts (nuevo)
        - medical-records-types.ts (nuevo)
    /types
      - database.types.ts (nuevo)
      - api.types.ts (nuevo)
      - common.types.ts (nuevo)
    - client.ts (mantener)
    - server.ts (mantener)
    - middleware.ts (mantener)
    - admin.ts (mantener)
    - auth.ts (mantener)
    
  /templates
    - medical-templates.ts (mantener)
    - structured-templates.ts (dividir)
    - template-types.ts (nuevo)
    - template-utils.ts (nuevo)
    
  /i18n
    /translations
      - es.ts (nuevo)
      - en.ts (nuevo)
      - common.ts (nuevo)
    - translations.ts (dividir)
    - i18n-types.ts (nuevo)
    
  /contexts
    - language-context.tsx (mantener)
    - preferences-context.tsx (dividir)
    - theme-context.tsx (mantener)
    
  /hooks
    - use-i18n.ts (mantener)
    
  /security
    - security-notifications.ts (mantener)
    - session-manager.ts (mantener)
    - session-tracking.ts (mantener)
    - two-factor-auth.ts (mantener)
    
  /services
    /external
      - cedula-validation.ts (mantener)
      - gemini-service.ts (mantener)
      - icd-api-service.ts (mantener)
      - icd10-service.ts (mantener)
    /database
      - cie10-database.ts (mantener)
      
  /validations
    - auth.ts (mantener)
    - profile.ts (nuevo)
    - medical.ts (nuevo)
    
  /constants
    - medical-suggestions.ts (mantener)
    - venezuela-cities.ts (mantener)
    - app-constants.ts (nuevo)
    
  /redux
    - store.ts (mantener)
    - profileSlice.ts (mantener)
    
  /utils
    - animations.ts (mantener)
    - constants.ts (consolidar)
    - utils.ts (mantener)
    - date-utils.ts (nuevo)
    - format-utils.ts (nuevo)

/hooks
  /auth
    - use-oauth-errors.ts (mantener)
    - use-rate-limit.ts (mantener)
  /data
    - use-appointments.ts (mantener)
    - use-auth.ts (mantener)
    - use-doctor-profile.ts (mantener)
    - use-health-metrics.ts (mantener)
    - use-laboratory.ts (mantener)
    - use-medical-records.ts (mantener)
    - use-medications.ts (mantener)
    - use-messaging.ts (mantener)
    - use-patient-profile.ts (mantener)
    - use-telemedicine.ts (mantener)
  /ui
    - use-theme-color.ts (mantener)
```

---

## 🔧 Archivos a Refactorizar (Prioridad Alta)

### 1. medical-workspace.tsx (1013 líneas) → Dividir en 5 archivos
- `workspace-header.tsx` (~150 líneas)
- `workspace-toolbar.tsx` (~200 líneas)
- `workspace-editor.tsx` (~300 líneas)
- `workspace-preview.tsx` (~200 líneas)
- `medical-workspace.tsx` (~150 líneas - orquestador)

### 2. medical-tab-improved.tsx (704 líneas) → Consolidar y dividir
- Eliminar `medical-tab.tsx` y `medical-tab-new.tsx`
- Crear `medical-tab.tsx` (~150 líneas - orquestador)
- Crear `medical-history-section.tsx` (~150 líneas)
- Crear `allergies-section.tsx` (~100 líneas)
- Crear `medications-section.tsx` (~150 líneas)
- Crear `emergency-contacts-section.tsx` (~150 líneas)

### 3. profile-tab.tsx (552 líneas) → Dividir en 3 archivos
- `profile-tab.tsx` (~150 líneas - orquestador)
- `personal-info-section.tsx` (~200 líneas)
- `contact-info-section.tsx` (~200 líneas)

### 4. date-picker.tsx (462 líneas) → Dividir en 3 archivos
- `date-picker.tsx` (~100 líneas - orquestador)
- `date-picker-input.tsx` (~180 líneas)
- `date-picker-calendar.tsx` (~180 líneas)

### 5. security-tab-new.tsx (414 líneas) → Dividir en 4 archivos
- `security-tab.tsx` (~100 líneas - orquestador)
- `password-section.tsx` (~100 líneas)
- `two-factor-section.tsx` (~100 líneas)
- `sessions-section.tsx` (~100 líneas)

### 6. Servicios grandes en lib/supabase/services
Cada servicio >400 líneas dividir en:
- `*-service.ts` (orquestador)
- `*-queries.ts` (consultas)
- `*-mutations.ts` (mutaciones)
- `*-types.ts` (tipos)

---

## 📋 Archivos a Eliminar (Duplicados)

1. ❌ `components/dashboard/profile/tabs/medical-tab.tsx`
2. ❌ `components/dashboard/profile/tabs/medical-tab-new.tsx`
3. ❌ `components/ui/date-picker-old.tsx`
4. ❌ `components/ui/date-picker-calendar-only.tsx`

---

## ✅ Archivos que NO necesitan cambios (<400 líneas)

- Todos los archivos en `/components/ui` excepto date-picker
- Todos los archivos en `/components/messaging`
- Todos los archivos en `/components/sections`
- Todos los archivos en `/components/layout`
- Todos los archivos en `/components/providers`
- Todos los archivos en `/hooks`
- Mayoría de archivos en `/lib`

---

## 🚀 Plan de Ejecución

### Fase 1: Preparación (Crear estructura)
1. Crear nuevas carpetas según estructura propuesta
2. Crear archivos de tipos compartidos
3. Crear utilidades compartidas

### Fase 2: Refactorización de Componentes (Prioridad)
1. medical-workspace.tsx → 5 archivos
2. medical-tab-improved.tsx → 6 archivos
3. profile-tab.tsx → 3 archivos
4. date-picker.tsx → 3 archivos
5. security-tab-new.tsx → 4 archivos

### Fase 3: Refactorización de Servicios
1. appointments-service.ts → 4 archivos
2. telemedicine-service.ts → 4 archivos
3. health-metrics-service.ts → 4 archivos
4. medications-service.ts → 4 archivos
5. doctors-service.ts → 4 archivos

### Fase 4: Consolidación
1. Eliminar archivos duplicados
2. Actualizar imports en toda la aplicación
3. Mover archivos a nuevas ubicaciones

### Fase 5: Validación
1. Verificar que no hay errores de compilación
2. Verificar que todos los imports están correctos
3. Ejecutar tests (si existen)

---

## 📊 Métricas Esperadas

### Antes:
- Archivos >400 líneas: 20+
- Archivos duplicados: 4
- Responsabilidades múltiples: Muchos
- Estructura: Plana

### Después:
- Archivos >400 líneas: 0 ✅
- Archivos duplicados: 0 ✅
- Responsabilidades múltiples: 0 ✅
- Estructura: Jerárquica y organizada ✅

---

## ⚠️ Consideraciones

1. **Mantener funcionalidad**: No cambiar lógica, solo reorganizar
2. **Imports**: Actualizar todos los imports después de mover archivos
3. **Types**: Crear archivos de tipos compartidos para evitar duplicación
4. **Testing**: Verificar que todo funciona después de cada fase
5. **Git**: Hacer commits frecuentes por fase

---

## 🎯 Resultado Final

Un proyecto con:
- ✅ Archivos pequeños y manejables (<400 líneas)
- ✅ Una sola responsabilidad por archivo
- ✅ Estructura clara y lógica
- ✅ Sin duplicados
- ✅ Fácil de mantener y escalar
- ✅ Mejor experiencia de desarrollo
