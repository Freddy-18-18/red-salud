# Plan Completo: Sistema de Secretarias Médicas

## 🎯 Objetivo
Implementar un sistema seguro donde las secretarias puedan:
- Iniciar sesión con sus propias credenciales
- Vincularse a uno o más médicos
- Acceder al dashboard del médico con permisos específicos
- Gestionar citas, pacientes y agenda del médico
- Mantener sincronización total con el dashboard médico

## 🔐 Arquitectura de Seguridad

### 1. Modelo de Datos
```
┌─────────────────┐
│   auth.users    │
│  (Supabase)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    profiles     │
│  role='secretaria'│
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ doctor_secretaries   │
│ - doctor_id          │
│ - secretary_id       │
│ - permissions (JSON) │
│ - status             │
└──────────────────────┘
```

### 2. Sistema de Permisos (RBAC)
```json
{
  "can_view_agenda": true,
  "can_create_appointments": true,
  "can_edit_appointments": true,
  "can_cancel_appointments": true,
  "can_view_patients": true,
  "can_register_patients": true,
  "can_view_medical_records": false,
  "can_send_messages": true,
  "can_view_statistics": false
}
```

## 📋 Pasos de Implementación

### FASE 1: Base de Datos ✅
**Estado**: Parcialmente completado

#### 1.1 Actualizar Enum de Roles
- ✅ Ya existe migración `20241113000001_add_secretary_role.sql`
- ⚠️ PROBLEMA: El enum actual NO incluye 'secretaria'
- 🔧 SOLUCIÓN: Aplicar la migración correctamente

#### 1.2 Tabla doctor_secretaries
- ✅ Ya existe con estructura completa
- ✅ Incluye permisos granulares en JSON
- ✅ Tiene RLS policies configuradas

### FASE 2: Autenticación y Registro
**Estado**: Por implementar

#### 2.1 Actualizar Constantes
```typescript
// lib/constants.ts
export const USER_ROLES = {
  // ... roles existentes
  SECRETARIA: "secretaria",
} as const;

export const ROLE_CONFIG = {
  // ... configs existentes
  [USER_ROLES.SECRETARIA]: {
    label: "Secretaria Médica",
    description: "Gestiona agenda y pacientes del médico",
    icon: "UserCog",
    dashboardPath: "/dashboard/secretaria",
  },
};
```

#### 2.2 Flujo de Registro
1. Secretaria se registra con rol 'secretaria'
2. Médico envía invitación desde su dashboard
3. Secretaria acepta invitación
4. Se crea relación en `doctor_secretaries`

#### 2.3 Flujo de Login
1. Secretaria ingresa a `/login/secretaria`
2. Autentica con sus credenciales
3. Sistema verifica rol en `profiles.role`
4. Redirige a `/dashboard/secretaria`

### FASE 3: Dashboard de Secretaria
**Estado**: Por implementar

#### 3.1 Selector de Médico
```typescript
// Si la secretaria trabaja con múltiples médicos
interface SecretaryContext {
  currentDoctorId: string;
  availableDoctors: Doctor[];
  permissions: Permissions;
}
```

#### 3.2 Vistas Compartidas
- Reutilizar componentes del dashboard médico
- Aplicar filtros basados en permisos
- Mostrar solo información autorizada

### FASE 4: Sistema de Permisos
**Estado**: Por implementar

#### 4.1 Middleware de Permisos
```typescript
// lib/auth/secretary-permissions.ts
export async function checkSecretaryPermission(
  secretaryId: string,
  doctorId: string,
  permission: keyof Permissions
): Promise<boolean>
```

#### 4.2 Hooks de Permisos
```typescript
// hooks/use-secretary-permissions.ts
export function useSecretaryPermissions(doctorId: string) {
  // Retorna permisos y funciones de verificación
}
```

### FASE 5: Gestión de Citas
**Estado**: Por implementar

#### 5.1 Modificar Queries
```sql
-- Las citas deben incluir created_by para auditoría
ALTER TABLE appointments ADD COLUMN created_by UUID REFERENCES profiles(id);
ALTER TABLE appointments ADD COLUMN modified_by UUID REFERENCES profiles(id);
```

#### 5.2 Políticas RLS
```sql
-- Secretarias pueden ver citas de sus médicos
CREATE POLICY "Secretaries can view doctor appointments"
  ON appointments FOR SELECT
  USING (
    medico_id IN (
      SELECT doctor_id FROM doctor_secretaries 
      WHERE secretary_id = auth.uid() AND status = 'active'
    )
  );
```

### FASE 6: Auditoría y Seguridad
**Estado**: Por implementar

#### 6.1 Registro de Actividades
```typescript
// Todas las acciones de secretarias se registran
interface SecretaryActivity {
  secretary_id: string;
  doctor_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: Date;
}
```

#### 6.2 Notificaciones al Médico
- Médico recibe notificación de acciones importantes
- Dashboard muestra actividad reciente de secretarias

## 🔒 Consideraciones de Seguridad

### 1. Autenticación
- ✅ Cada secretaria tiene su propia cuenta en `auth.users`
- ✅ No comparten credenciales con el médico
- ✅ Autenticación independiente con email/password o OAuth

### 2. Autorización
- ✅ Permisos granulares por médico
- ✅ RLS policies en todas las tablas
- ✅ Verificación en backend y frontend

### 3. Auditoría
- ✅ Registro de todas las acciones
- ✅ Trazabilidad completa
- ✅ Médico puede revisar actividad

### 4. Revocación
- ✅ Médico puede desactivar secretaria en cualquier momento
- ✅ Cambio de status a 'inactive' o 'suspended'
- ✅ Acceso inmediatamente bloqueado

## 📊 Flujo de Trabajo Completo

### Escenario 1: Secretaria Nueva
```
1. Secretaria → Registro en /register/secretaria
2. Médico → Dashboard → "Agregar Secretaria"
3. Médico → Ingresa email de secretaria
4. Sistema → Envía invitación
5. Secretaria → Acepta invitación
6. Sistema → Crea relación en doctor_secretaries
7. Secretaria → Puede acceder al dashboard
```

### Escenario 2: Login Diario
```
1. Secretaria → /login/secretaria
2. Ingresa credenciales
3. Sistema → Verifica rol = 'secretaria'
4. Sistema → Carga médicos vinculados
5. Secretaria → Selecciona médico (si tiene varios)
6. Dashboard → Muestra agenda del médico
```

### Escenario 3: Crear Cita
```
1. Secretaria → Dashboard → "Nueva Cita"
2. Sistema → Verifica permiso 'can_create_appointments'
3. Secretaria → Completa formulario
4. Sistema → Guarda cita con created_by = secretary_id
5. Sistema → Notifica al médico
6. Sistema → Registra actividad
```

## 🚀 Orden de Implementación Recomendado

### Sprint 1: Base de Datos (1-2 días)
1. ✅ Verificar migración de rol secretaria
2. ✅ Aplicar migración si no está aplicada
3. ✅ Crear políticas RLS adicionales
4. ✅ Agregar campos de auditoría

### Sprint 2: Autenticación (2-3 días)
1. Actualizar constantes y tipos
2. Crear página de registro para secretarias
3. Crear página de login para secretarias
4. Implementar validación de rol

### Sprint 3: Dashboard Básico (3-4 días)
1. Crear layout de dashboard secretaria
2. Implementar selector de médico
3. Reutilizar componentes de agenda
4. Aplicar filtros de permisos

### Sprint 4: Gestión de Secretarias (2-3 días)
1. Panel de médico para agregar secretarias
2. Sistema de invitaciones
3. Gestión de permisos
4. Activar/desactivar secretarias

### Sprint 5: Permisos y Seguridad (2-3 días)
1. Implementar middleware de permisos
2. Crear hooks de verificación
3. Aplicar RLS en todas las tablas
4. Testing de seguridad

### Sprint 6: Auditoría (1-2 días)
1. Sistema de registro de actividades
2. Dashboard de actividad para médico
3. Notificaciones
4. Reportes

## 📝 Notas Importantes

### Diferencias con Sistema de Usuarios Múltiples
- ❌ NO es multi-usuario en una cuenta
- ✅ Cada secretaria tiene su propia cuenta
- ✅ Secretaria puede trabajar para múltiples médicos
- ✅ Cada médico controla sus propias secretarias

### Sincronización
- ✅ Datos en tiempo real con Supabase Realtime
- ✅ Cambios visibles inmediatamente
- ✅ No hay conflictos de datos

### Escalabilidad
- ✅ Soporta múltiples secretarias por médico
- ✅ Soporta secretaria trabajando para múltiples médicos
- ✅ Permisos independientes por relación

## 🎯 Próximos Pasos Inmediatos

1. **Verificar estado de migración de secretaria**
2. **Aplicar migración si es necesario**
3. **Actualizar constantes del sistema**
4. **Crear páginas de registro y login**
5. **Implementar dashboard básico**

¿Quieres que comience con la implementación?
