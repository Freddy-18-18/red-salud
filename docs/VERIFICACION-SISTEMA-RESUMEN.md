# 🎯 Sistema de Verificación Multi-Nivel - Dashboard Médico/Clínico

> **ALCANCE:** Este sistema es SOLO para profesionales de salud clínica en el dashboard médico.
> NO incluye: farmacia, admin, secretarias, pacientes, seguros, ambulancias, laboratorios independientes, ni clínicas.
> Esos tienen sus propios dashboards y sistemas de autenticación separados.

## 📦 Archivos Creados

### 1. Migraciones SQL (`apps/web/supabase/migrations/`)

✅ **20260214000000_create_professional_verification_system.sql**
- Crea ENUMs para niveles de verificación, tipos de roles, tipos de documentos
- Tabla `professional_verifications`: Sistema central de verificación
- Tabla `verification_documents`: Documentos subidos por usuarios
- Tabla `verification_history`: Auditoría completa de cambios
- Triggers para `updated_at` y contadores de documentos
- RLS policies para seguridad
- Vistas: `pending_verifications`, `expiring_verifications`

✅ **20260214000001_migrate_existing_doctors_to_new_system.sql**
- Migra datos existentes de `verificaciones_sacs` al nuevo sistema
- Preserva todo el historial de verificaciones SACS
- Sincroniza datos con tabla `profiles`
- Genera estadísticas post-migración

✅ **20260214000002_create_verification_functions.sql**
- `get_user_verification()`: Obtiene verificación completa
- `approve_verification()`: Aprueba verificación
- `reject_verification()`: Rechaza verificación
- `check_user_permission()`: Verifica permisos específicos
- `get_supervised_professionals()`: Lista supervisados
- `get_expiring_verifications()`: Verificaciones próximas a vencer
- `renew_verification()`: Renueva verificación
- `get_verification_statistics()`: Estadísticas del sistema

### 2. Scripts de Deployment

✅ **scripts/deploy-verification-migrations.ps1**
- Script PowerShell para aplicar migraciones en orden
- Validación de prerequisitos
- Confirmación antes de aplicar
- Resumen de resultados

### 3. Documentación

✅ **docs/RBAC-MULTI-NIVEL-VERIFICACION.md** (Creado anteriormente)
- Arquitectura completa del sistema
- Niveles de verificación y roles
- Permisos por tipo de profesional
- Fases de implementación

✅ **docs/VERIFICACION-IMPLEMENTACION-GUIDE.md**
- Guía paso a paso de implementación
- Código TypeScript completo para servicios
- Hooks React con React Query
- Componentes UI de ejemplo
- Casos de uso reales
- Tests y monitoring

### 4. Tipos TypeScript

✅ **packages/types/src/verification.ts**
- Tipos completos para el sistema de verificación
- Interfaces para todas las tablas
- Request/Response types
- Permisos personalizados por rol
- Tipos de formularios

---

## 🚀 Cómo Aplicar las Migraciones

### Método 1: Script PowerShell (Recomendado)

```powershell
cd c:\Users\Fredd\Developer\red-salud
.\scripts\deploy-verification-migrations.ps1
```

### Método 2: Supabase CLI

```powershell
cd apps/web
supabase db push --project-ref hwckkfiirldgundbcjsp
```

### Método 3: Supabase Dashboard

1. Abre https://supabase.com/dashboard/project/hwckkfiirldgundbcjsp
2. Ve a SQL Editor
3. Copia y ejecuta cada migración en orden

---

## 📋 Estructura de la Base de Datos

```
professional_verifications
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── verification_level (ENUM)
├── verification_status (TEXT)
├── main_role (ENUM)
├── sub_role (TEXT)
├── professional_id (TEXT)
├── institution (TEXT)
├── department (TEXT)
├── sacs_cedula (TEXT)
├── sacs_verified (BOOLEAN)
├── sacs_data (JSONB)
├── sacs_verified_at (TIMESTAMPTZ)
├── documents_count (INTEGER)
├── documents_approved (INTEGER)
├── verified_by (UUID, FK)
├── verified_by_role (TEXT)
├── verification_notes (TEXT)
├── verified_at (TIMESTAMPTZ)
├── restrictions (JSONB)
├── custom_permissions (JSONB)
├── expires_at (TIMESTAMPTZ)
├── last_reviewed_at (TIMESTAMPTZ)
├── next_review_date (DATE)
├── supervisor_id (UUID, FK)
├── supervisor_approved (BOOLEAN)
├── supervisor_approved_at (TIMESTAMPTZ)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

verification_documents
├── id (UUID, PK)
├── verification_id (UUID, FK)
├── user_id (UUID, FK)
├── document_type (ENUM)
├── document_name (TEXT)
├── file_url (TEXT)
├── file_path (TEXT)
├── file_size (INTEGER)
├── mime_type (TEXT)
├── review_status (TEXT)
├── reviewed_by (UUID, FK)
├── review_notes (TEXT)
├── rejection_reason (TEXT)
├── reviewed_at (TIMESTAMPTZ)
├── version (INTEGER)
├── replaced_by (UUID, FK)
├── is_current (BOOLEAN)
├── document_metadata (JSONB)
├── uploaded_at (TIMESTAMPTZ)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

verification_history
├── id (UUID, PK)
├── verification_id (UUID, FK)
├── user_id (UUID, FK)
├── action (TEXT)
├── performed_by (UUID, FK)
├── performed_by_role (TEXT)
├── changes (JSONB)
├── reason (TEXT)
├── notes (TEXT)
├── created_at (TIMESTAMPTZ)
├── ip_address (INET)
└── user_agent (TEXT)
```

---

## 🎨 Stack Frontend a Implementar

### Servicios
- `verification-service.ts`: Servicio completo con todos los métodos

### Hooks
- `useVerification()`: Hook para usuario actual
- `useVerificationDocuments()`: Hook para documentos
- `useAdminVerifications()`: Hook para panel de admin
- `usePermissions()`: Hook para verificar permisos

### Componentes
- `VerificationWizard`: Formulario multi-paso
- `VerificationStatusBadge`: Badge de estado
- `DocumentUploader`: Upload de documentos
- `AdminVerificationPanel`: Panel de revisión para admins
- `PermissionGate`: HOC para proteger componentes por permisos

---

## 📊 Niveles de Verificación

### 1. SACS Verified (sacs_verified)
- **Automático** para médicos
- Conecta con Railway backend (Puppeteer scraper)
- Solo válido para profesionales médicos registrados en SACS
- Permisos completos una vez verificado

### 2. Manual Verified (manual_verified)
- **Admin** revisa documentos manualmente
- Para profesionales de salud (enfermeros, nutricionistas, psicólogos)
- Requiere títulos, certificados, licencias
- Admin define permisos personalizados

### 3. Supervisor Verified (supervisor_verified)
- **Supervisor del departamento** aprueba
- Para técnicos (radiología, laboratorio, electrocardiografía)
- Requiere certificados técnicos
- Permisos limitados al área específica

### 4. Doctor Delegated (doctor_delegated)
- **Médico responsable** delega acceso
- Para personal administrativo (secretarias, recepcionistas)
- Permisos delegados por el médico
- Puede ser revocado en cualquier momento

---

## 🔐 Ejemplos de Permisos Personalizados

### Técnico Radiólogo
```json
{
  "radiology": {
    "operate_equipment": true,
    "approve_reports": false,
    "take_xrays": true,
    "take_ct_scans": true,
    "take_mri": false,
    "access_pacs": true,
    "schedule_procedures": true
  }
}
```

### Enfermero
```json
{
  "nursing": {
    "administer_medications": true,
    "take_vital_signs": true,
    "wound_care": true,
    "iv_therapy": false,
    "patient_assessment": true,
    "document_care": true,
    "emergency_response": false
  }
}
```

### Secretaria Médica
```json
{
  "secretary": {
    "schedule_appointments": true,
    "access_medical_records": true,
    "process_payments": true,
    "manage_prescriptions": false,
    "coordinate_referrals": true,
    "generate_reports": true
  }
}
```

---

## 🧪 Testing Checklist

- [ ] Aplicar migraciones en development
- [ ] Verificar tablas en Supabase Dashboard
- [ ] Confirmar migración de datos de médicos existentes
- [ ] Probar funciones SQL directamente
- [ ] Crear servicio TypeScript
- [ ] Implementar hooks React
- [ ] Construir wizard de registro
- [ ] Testing E2E del flujo completo
- [ ] Panel de admin funcional
- [ ] Sistema de notificaciones
- [ ] Cron job para expiraciones

---

## 🔄 Flujo de Verificación

### Para Médicos (SACS)
```
1. Usuario se registra con rol "médico"
2. Introduce cédula
3. Sistema llama a edge function → Railway backend → SACS scraping
4. Si encontrado: Verificación automática ✅
5. Si no encontrado: Solicitud manual de revisión
```

### Para Técnicos/Enfermeros
```
1. Usuario se registra con rol específico
2. Completa wizard con información profesional
3. Sube documentos (certificados, títulos)
4. Admin o supervisor revisa documentos
5. Admin/Supervisor aprueba con permisos personalizados
6. Usuario obtiene acceso ✅
```

### Para Personal Administrativo
```
1. Usuario se registra como "administrativo"
2. Médico responsable lo vincula
3. Médico delega permisos específicos
4. Usuario obtiene acceso inmediato ✅
5. Médico puede revocar en cualquier momento
```

---

## 📈 Métricas y Monitoring

### Queries Útiles

```sql
-- Verificaciones pendientes de aprobación
SELECT * FROM pending_verifications;

-- Verificaciones que vencen en 30 días
SELECT * FROM expiring_verifications;

-- Estadísticas del sistema
SELECT * FROM get_verification_statistics();

-- Historial de una verificación
SELECT * FROM verification_history 
WHERE verification_id = 'xxx' 
ORDER BY created_at DESC;

-- Profesionales supervisados por un usuario
SELECT * FROM get_supervised_professionals('user-id');

-- Verificar permisos de un usuario
SELECT check_user_permission(
  'user-id', 
  ARRAY['radiology', 'operate_equipment']
);
```

---

## 🎯 Próximos Pasos

1. **Aplicar migraciones** usando el script PowerShell
2. **Verificar** que la migración de datos fue exitosa
3. **Crear bucket** `verification-documents` en Supabase Storage
4. **Implementar** `VerificationService` en TypeScript
5. **Construir** wizard de registro multi-paso
6. **Crear** panel de administración
7. **Testing** end-to-end del flujo completo
8. **Desplegar** en producción

---

## 📞 Soporte

Si tienes preguntas o problemas:
1. Revisa la guía de implementación: `docs/VERIFICACION-IMPLEMENTACION-GUIDE.md`
2. Revisa la arquitectura: `docs/RBAC-MULTI-NIVEL-VERIFICACION.md`
3. Verifica los logs de Supabase

---

## ✅ Resumen de Funcionalidades

| Funcionalidad | Estado | Archivo |
|--------------|--------|---------|
| Schema de base de datos | ✅ Listo | `20260214000000_create_professional_verification_system.sql` |
| Migración de datos existentes | ✅ Listo | `20260214000001_migrate_existing_doctors_to_new_system.sql` |
| Funciones de base de datos | ✅ Listo | `20260214000002_create_verification_functions.sql` |
| Script de deployment | ✅ Listo | `deploy-verification-migrations.ps1` |
| Tipos TypeScript | ✅ Listo | `verification.ts` |
| Guía de implementación | ✅ Listo | `VERIFICACION-IMPLEMENTACION-GUIDE.md` |
| Arquitectura documentada | ✅ Listo | `RBAC-MULTI-NIVEL-VERIFICACION.md` |
| Servicios TypeScript | 🟡 Por hacer | - |
| Hooks React | 🟡 Por hacer | - |
| Componentes UI | 🟡 Por hacer | - |
| Tests | 🟡 Por hacer | - |

---

**¡Sistema listo para implementar! 🚀**

¿Quieres que aplique las migraciones ahora o prefieres revisarlas primero?
