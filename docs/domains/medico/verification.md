# Professional Verification System

Sistema de verificacion multi-nivel para profesionales de salud en el dashboard medico/clinico.

> **ALCANCE:** Este sistema es SOLO para profesionales de salud clinica en el dashboard medico.
> NO incluye: farmacia, admin, secretarias, pacientes, seguros, ambulancias, laboratorios independientes, ni clinicas.
> Esos tienen sus propios dashboards y sistemas de autenticacion separados.

---

## System Overview

### Niveles de Verificacion

```
NIVEL 1: Medicos
  Verificacion OBLIGATORIA con SACS
  Acceso COMPLETO a funciones clinicas
  Puede recetar, diagnosticar, operar

NIVEL 2: Profesionales de Salud con Registro
  Verificacion MANUAL + Documentacion
  Acceso LIMITADO segun especialidad
  Puede asistir, reportar, colaborar

NIVEL 3: Personal Tecnico
  Verificacion por SUPERVISOR + Certificados
  Acceso OPERATIVO especifico
  Puede operar equipos, procesar muestras

NIVEL 4: Personal Administrativo
  Verificacion por MEDICO RESPONSABLE
  Acceso ADMINISTRATIVO delegado
  Puede agendar, registrar, gestionar documentos
```

### Niveles de Verificacion (Detalle)

| Nivel | Nombre | Quien Aprueba | Descripcion |
|-------|--------|---------------|-------------|
| 1 | SACS Verified | Sistema (automatico) | Verificado automaticamente por SACS. Solo valido para medicos. Permisos completos una vez verificado. |
| 2 | Manual Verified | Admin | Admin revisa documentos manualmente. Para enfermeros, nutricionistas, psicologos. Requiere titulos, certificados, licencias. |
| 3 | Supervisor Verified | Admin/Supervisor | Supervisor del departamento aprueba. Para tecnicos (radiologia, laboratorio, electrocardiografia). Requiere certificados tecnicos. |
| 4 | Doctor Delegated | Medico responsable | Medico responsable delega acceso. Para personal administrativo (secretarias, recepcionistas). Puede ser revocado en cualquier momento. |

---

## Scope

### SI INCLUYE (Profesionales de Salud Clinica)

#### 1. Medicos
- Verificacion automatica por SACS
- No requieren subir documentos si estan en el SACS
- Acceso inmediato una vez verificados

#### 2. Profesionales de Salud
- **Enfermeros/Enfermeras**: General, Jefe
- **Nutricionistas**: General, Clinico
- **Psicologos**: General, Clinico
- **Fisioterapeutas**
- **Terapeutas Ocupacionales**
- **Terapeutas Respiratorios**
- **Fonoaudiologos**
- **Asistentes Medicos**

Verificacion: Manual por admin (suben titulo, certificados, licencias)

#### 3. Tecnicos de Salud
- Tecnico Radiologo / Radiologia
- Tecnico de Electrocardiografia
- Tecnico de Ecografia
- Tecnico de Quirofano
- Tecnico de Esterilizacion
- Tecnico de Laboratorio Clinico
- Tecnico de Hemodinamia
- Tecnico de Emergencias

Verificacion: Manual por admin o supervisor del area

### NO INCLUYE (Tienen sus Propios Dashboards)

Estos roles NO entran en el dashboard medico porque tienen sistemas separados:

- Farmacia: Dashboard farmacia independiente
- Administrativo/Secretarias: Sistema administrativo propio
- Pacientes: Portal de pacientes
- Seguros: Sistema de seguros
- Ambulancias: Sistema de emergencias
- Laboratorios (como entidad independiente): Sistema de laboratorio
- Clinicas (como entidad): Sistema de gestion de clinicas
- Admin general: Panel de administracion separado

---

## Roles Architecture

### Nuevo Sistema de Roles

```typescript
// Rol principal
export enum MainRole {
  PACIENTE = 'paciente',
  MEDICO = 'medico',
  PROFESIONAL_SALUD = 'profesional_salud',
  TECNICO = 'tecnico',
  ADMINISTRATIVO = 'administrativo',
  FARMACIA = 'farmacia',
  CLINICA = 'clinica',
  ADMIN = 'admin',
}

// Sub-roles para profesionales de salud
export enum ProfesionalSaludType {
  ENFERMERO = 'enfermero',
  NUTRICIONISTA = 'nutricionista',
  PSICOLOGO = 'psicologo',
  FISIOTERAPEUTA = 'fisioterapeuta',
  TERAPEUTA_OCUPACIONAL = 'terapeuta_ocupacional',
  TERAPEUTA_RESPIRATORIO = 'terapeuta_respiratorio',
  PARAMEDICO = 'paramedico',
  OTRO = 'otro',
}

// Sub-roles para tecnicos
export enum TecnicoType {
  RADIOLOGO = 'radiologo',
  LABORATORIO = 'laboratorio',
  ELECTROCARDIOGRAFIA = 'electrocardiografia',
  FARMACIA = 'farmacia',
  QUIROFANO = 'quirofano',
  OTRO = 'otro',
}

// Sub-roles administrativos
export enum AdministrativoType {
  SECRETARIA_MEDICA = 'secretaria_medica',
  RECEPCIONISTA = 'recepcionista',
  ARCHIVISTA = 'archivista',
  COORDINADOR = 'coordinador',
}
```

### Niveles de Verificacion por Rol

| Rol | Nivel | Quien Aprueba | Documentos Requeridos |
|-----|-------|---------------|----------------------|
| **Medico** | SACS Auto | Sistema | Ninguno (si esta en SACS) |
| **Enfermero** | Manual | Admin | Titulo, Licencia, CV |
| **Nutricionista** | Manual | Admin | Titulo, Certificado Colegio |
| **Psicologo** | Manual | Admin | Titulo, Licencia Psicologia |
| **Fisioterapeuta** | Manual | Admin | Titulo, Certificados |
| **Tecnico Radiologia** | Supervisor | Admin/Supervisor | Certificado Tecnico, Constancia |
| **Tecnico Laboratorio** | Supervisor | Admin/Supervisor | Certificado Tecnico, Constancia |
| **Asistente Medico** | Delegado | Medico Responsable | CV, Constancia |

### Documentos que se Pueden Subir

```typescript
export type VerificationDocumentType =
  | 'cedula'                      // Cedula de identidad
  | 'titulo_universitario'        // Titulo universitario
  | 'certificado_especialidad'    // Certificado de especialidad
  | 'licencia_profesional'        // Licencia profesional
  | 'certificado_tecnico'         // Certificado tecnico
  | 'constancia_trabajo'          // Constancia de trabajo
  | 'carta_recomendacion'         // Carta de recomendacion
  | 'curriculum_vitae'            // CV
  | 'carnet_colegio'              // Carnet del colegio profesional
  | 'otro'                        // Otro documento
```

---

## Permission Matrix

### Medico (SACS Verificado)

```typescript
const MEDICO_PERMISSIONS = {
  patient: { read: true, create: true, update: true, delete: false },
  medical_records: { read: true, create: true, update: true, delete: false },
  prescriptions: { read: true, create: true, update: true, cancel: true },
  appointments: { read: true, create: true, update: true, cancel: true },
  diagnosis: { create: true, update: true },
  surgery: { schedule: true, perform: true },
};
```

### Tecnico Radiologo

```typescript
const TECNICO_RADIOLOGO_PERMISSIONS = {
  radiology: { operate_equipment: true, process_images: true, generate_reports: true, view_orders: true },
  patient: { read: true, create: false, update: false },
  medical_records: { read: false, create: false, update: false },
  imaging_studies: { read: true, create: true, update: true, upload: true },
  prescriptions: { read: false, create: false },
};
```

### Tecnico de Laboratorio

```typescript
const TECNICO_LABORATORIO_PERMISSIONS = {
  laboratory: { process_samples: true, run_tests: true, input_results: true, view_orders: true },
  patient: { read: true, create: false },
  lab_results: { read: true, create: true, update: true },
  quality_control: { register: true, view: true },
};
```

### Enfermero/Enfermera

```typescript
const ENFERMERO_PERMISSIONS = {
  patient: { read: true, create: true, update: true },
  medical_records: { read: true, create: false, update: true },
  medication_administration: { read: true, register: true, verify: true },
  vital_signs: { read: true, create: true, update: true },
  nursing_notes: { create: true, update: true },
  prescriptions: { read: true, create: false },
};
```

### Secretaria Medica

```typescript
const SECRETARIA_PERMISSIONS = {
  appointments: { read: true, create: true, update: true, cancel: true },
  patient: { read: true, create: true, update: true },
  medical_records: { read: false, create: false, update: false },
  documents: { upload: true, download: true, organize: true },
  billing: { read: true, create: true, update: false },
  messages: { read: true, send: true },
};
```

### Custom Permissions Examples

**Tecnico Radiologo:**
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

**Enfermero:**
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

---

## Database Schema

### Tablas Creadas

```
professional_verifications
  id (UUID, PK)
  user_id (UUID, FK -> profiles)
  verification_level (ENUM)
  verification_status (TEXT)
  main_role (ENUM)
  sub_role (TEXT)
  professional_id (TEXT)
  institution (TEXT)
  department (TEXT)
  sacs_cedula (TEXT)
  sacs_verified (BOOLEAN)
  sacs_data (JSONB)
  sacs_verified_at (TIMESTAMPTZ)
  documents_count (INTEGER)
  documents_approved (INTEGER)
  verified_by (UUID, FK)
  verified_by_role (TEXT)
  verification_notes (TEXT)
  verified_at (TIMESTAMPTZ)
  restrictions (JSONB)
  custom_permissions (JSONB)
  expires_at (TIMESTAMPTZ)
  last_reviewed_at (TIMESTAMPTZ)
  next_review_date (DATE)
  supervisor_id (UUID, FK)
  supervisor_approved (BOOLEAN)
  supervisor_approved_at (TIMESTAMPTZ)
  created_at (TIMESTAMPTZ)
  updated_at (TIMESTAMPTZ)

verification_documents
  id (UUID, PK)
  verification_id (UUID, FK)
  user_id (UUID, FK)
  document_type (ENUM)
  document_name (TEXT)
  file_url (TEXT)
  file_path (TEXT)
  file_size (INTEGER)
  mime_type (TEXT)
  review_status (TEXT)
  reviewed_by (UUID, FK)
  review_notes (TEXT)
  rejection_reason (TEXT)
  reviewed_at (TIMESTAMPTZ)
  version (INTEGER)
  replaced_by (UUID, FK)
  is_current (BOOLEAN)
  document_metadata (JSONB)
  uploaded_at (TIMESTAMPTZ)
  created_at (TIMESTAMPTZ)
  updated_at (TIMESTAMPTZ)

verification_history
  id (UUID, PK)
  verification_id (UUID, FK)
  user_id (UUID, FK)
  action (TEXT)
  performed_by (UUID, FK)
  performed_by_role (TEXT)
  changes (JSONB)
  reason (TEXT)
  notes (TEXT)
  created_at (TIMESTAMPTZ)
  ip_address (INET)
  user_agent (TEXT)
```

### SQL Migrations

```sql
CREATE TYPE verification_level AS ENUM (
  'sacs_verified',
  'manual_verified',
  'supervisor_verified',
  'doctor_delegated',
  'pending',
  'rejected'
);

CREATE TYPE verification_document_type AS ENUM (
  'cedula',
  'titulo_universitario',
  'certificado_especialidad',
  'licencia_profesional',
  'certificado_tecnico',
  'constancia_trabajo',
  'carta_recomendacion',
  'otro'
);

CREATE TABLE professional_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_level verification_level NOT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired')),
  main_role TEXT NOT NULL,
  sub_role TEXT,
  professional_id TEXT,
  institution TEXT,
  sacs_cedula TEXT,
  sacs_verified BOOLEAN DEFAULT false,
  sacs_data JSONB,
  sacs_verified_at TIMESTAMPTZ,
  documents JSONB DEFAULT '[]'::jsonb,
  verified_by UUID REFERENCES profiles(id),
  verified_by_role TEXT,
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  restrictions JSONB DEFAULT '{}'::jsonb,
  custom_permissions JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES professional_verifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type verification_document_type NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected', 'requires_change')),
  reviewed_by UUID REFERENCES profiles(id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_file_url CHECK (file_url ~ '^https?://.*')
);
```

### Database Functions

- `get_user_verification()`: Obtiene verificacion completa
- `approve_verification()`: Aprueba verificacion
- `reject_verification()`: Rechaza verificacion
- `check_user_permission()`: Verifica permisos especificos
- `get_supervised_professionals()`: Lista supervisados
- `get_expiring_verifications()`: Verificaciones proximas a vencer
- `renew_verification()`: Renueva verificacion
- `get_verification_statistics()`: Estadisticas del sistema

---

## Implementation Guide

### Apply Migrations

**Opcion 1: Script PowerShell (Recomendado)**
```powershell
cd c:\Users\Fredd\Developer\red-salud
.\scripts\deploy-verification-migrations.ps1
```

**Opcion 2: Supabase CLI**
```powershell
cd apps/web
supabase db push --project-ref hwckkfiirldgundbcjsp
```

**Opcion 3: Supabase Dashboard**
1. Abre https://supabase.com/dashboard
2. Ve a SQL Editor
3. Copia y ejecuta cada migracion en orden

### Create Storage Bucket

1. Ve a https://supabase.com/dashboard/project/hwckkfiirldgundbcjsp/storage/buckets
2. Crea bucket: `verification-documents`
3. Configura como **Private**

### TypeScript Service

Crear `apps/web/lib/supabase/services/verification-service.ts` con los siguientes metodos:

- `getUserVerification(userId)`: Obtiene la verificacion completa de un usuario
- `createVerification(params)`: Crea una nueva solicitud de verificacion
- `uploadVerificationDocument(params)`: Sube un documento de verificacion
- `approveVerification(params)`: Aprueba una verificacion (solo admins)
- `rejectVerification(params)`: Rechaza una verificacion (solo admins)
- `checkPermission(userId, permissionPath)`: Verifica si un usuario tiene un permiso especifico
- `getPendingVerifications()`: Obtiene verificaciones pendientes (para admins)
- `getExpiringVerifications(daysThreshold)`: Obtiene verificaciones proximas a vencer
- `getSupervisedProfessionals(supervisorId)`: Obtiene profesionales supervisados
- `renewVerification(params)`: Renueva una verificacion
- `getStatistics()`: Obtiene estadisticas del sistema
- `getVerificationHistory(verificationId)`: Obtiene el historial de una verificacion
- `getVerificationDocuments(verificationId)`: Obtiene documentos de una verificacion
- `approveDocument(params)` / `rejectDocument(params)`: Revisa documentos

### React Hooks

- `useVerification()`: Hook para usuario actual (verificacion, estados, acciones)
- `useVerificationDocuments(verificationId)`: Hook para documentos
- `useAdminVerifications()`: Hook para panel de admin (pendientes, aprobar/rechazar)

### UI Components

- `VerificationWizard`: Formulario multi-paso de verificacion
- `VerificationStatusBadge`: Badge de estado (pending/approved/rejected/expired)
- `DocumentUploader`: Upload de documentos
- `AdminVerificationPanel`: Panel de revision para admins
- `PermissionGate`: HOC para proteger componentes por permisos

---

## Verification Flows

### Para Medicos (SACS)
```
1. Usuario se registra con rol "medico"
2. Introduce cedula
3. Sistema llama a edge function -> Railway backend -> SACS scraping
4. Si encontrado: Verificacion automatica
5. Si no encontrado: Solicitud manual de revision
```

### Para Tecnicos/Enfermeros
```
1. Usuario se registra con rol especifico
2. Completa wizard con informacion profesional
3. Sube documentos (certificados, titulos)
4. Admin o supervisor revisa documentos
5. Admin/Supervisor aprueba con permisos personalizados
6. Usuario obtiene acceso
```

### Para Personal Administrativo
```
1. Usuario se registra como "administrativo"
2. Medico responsable lo vincula
3. Medico delega permisos especificos
4. Usuario obtiene acceso inmediato
5. Medico puede revocar en cualquier momento
```

---

## Monitoring

```sql
-- Verificaciones pendientes de aprobacion
SELECT * FROM pending_verifications;

-- Verificaciones que vencen en 30 dias
SELECT * FROM expiring_verifications;

-- Estadisticas del sistema
SELECT * FROM get_verification_statistics();

-- Historial de una verificacion
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

## Migration Files

| File | Description |
|------|-------------|
| `20260214000000_create_professional_verification_system.sql` | Schema, tablas, ENUMs, RLS, vistas |
| `20260214000001_migrate_existing_doctors_to_new_system.sql` | Migracion de datos existentes de verificaciones SACS |
| `20260214000002_create_verification_functions.sql` | Funciones de base de datos |

## Implementation Status

| Funcionalidad | Estado |
|--------------|--------|
| Schema de base de datos | Listo |
| Migracion de datos existentes | Listo |
| Funciones de base de datos | Listo |
| Script de deployment | Listo |
| Tipos TypeScript | Listo |
| Servicios TypeScript | Por hacer |
| Hooks React | Por hacer |
| Componentes UI | Por hacer |
| Tests | Por hacer |

---

## Related Files

- Migrations: `apps/web/supabase/migrations/20260214000000_*`
- Types: `packages/types/src/verification.ts`
- Deployment script: `scripts/deploy-verification-migrations.ps1`
- SACS integration: `docs/domains/medico/sacs-integration.md`
- RBAC decision: `docs/decisions/rbac-verification.md`

---

**Fecha**: 2026-02-14
**Version**: 1.0
