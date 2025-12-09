# Guía de Inicio Rápido - Dashboard de Clínica

## ¿Por qué no veo nada en `/dashboard/clinica`?

El dashboard de clínica requiere que:
1. ✅ Las tablas estén creadas en Supabase (migraciones aplicadas)
2. ❌ **Tengas al menos una clínica creada**
3. ❌ **Tengas un rol asignado en esa clínica**

## Solución Rápida (3 pasos)

### Paso 1: Aplicar Migraciones

Verifica que las migraciones estén aplicadas en Supabase:

```bash
# Si usas Supabase CLI local
supabase db push

# O aplica manualmente en Supabase Dashboard
# → Table Editor → SQL Editor
# → Ejecuta el contenido de:
# - supabase/migrations/20251116000001_create_clinic_foundation.sql
# - supabase/migrations/20251116000002_create_clinic_rcm.sql
```

### Paso 2: Crear Clínica Demo

Ve a **Supabase Dashboard → SQL Editor** y ejecuta este script:

```sql
-- Pega y ejecuta: scripts/setup-demo-clinic-auto.sql
```

O usa el archivo: `scripts/setup-demo-clinic-auto.sql`

Este script creará automáticamente:
- ✅ Una clínica demo ("Clínica Demo")
- ✅ Una sede principal
- ✅ Te asignará como owner
- ✅ Creará 7 recursos de ejemplo (camas, quirófanos, consultorios)

### Paso 3: Recargar la Página

1. Regresa a `/dashboard/clinica`
2. La página debería redirigirte automáticamente a `/dashboard/clinica/[id]`
3. ¡Verás el dashboard completo con estadísticas!

## Verificación

Si algo falla, puedes verificar manualmente en Supabase:

### 1. ¿Existen las tablas?

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'clinic%';
```

Deberías ver:
- `clinics`
- `clinic_locations`
- `clinic_roles`
- `clinic_resources`
- `clinic_staff_shifts`
- `clinic_operational_metrics`
- `rcm_claims`
- `rcm_payments`
- etc.

### 2. ¿Tengo clínicas?

```sql
SELECT id, name, status 
FROM clinics;
```

### 3. ¿Tengo un rol asignado?

```sql
SELECT cr.role, c.name as clinic_name
FROM clinic_roles cr
JOIN clinics c ON c.id = cr.clinic_id
WHERE cr.user_id = auth.uid();
```

## Estructura del Dashboard

Una vez funcionando, verás:

```
/dashboard/clinica/[clinicId]
├── Overview (estadísticas ejecutivas)
├── /rcm (Revenue Cycle Management)
├── /operaciones (recursos, turnos, métricas)
└── /pacientes (pacientes internacionales)
```

## Roles Disponibles

- `owner`: Acceso total
- `admin`: Gestión completa sin eliminar clínica
- `finance`: Solo RCM y finanzas
- `operations`: Solo operaciones y recursos
- `concierge`: Solo pacientes internacionales
- `viewer`: Solo lectura

## Soporte

Si el problema persiste:
1. Verifica que estés logueado en la aplicación
2. Revisa la consola del navegador (F12) por errores
3. Consulta `docs/DASHBOARD_CLINICA.md` para más detalles
