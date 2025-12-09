# 👥 Sistema Completo de Secretarias

## ✅ Lo Implementado

### 1. Gestión de Secretarias (`/dashboard/medico/configuracion/secretarias`)

#### Funcionalidades:
- ✅ **Invitar Secretaria:**
  - Crear cuenta con email y contraseña
  - Asignar nombre completo
  - Permisos por defecto

- ✅ **Listar Secretarias:**
  - Ver todas las secretarias activas
  - Estado (activa/inactiva)
  - Permisos asignados

- ✅ **Configurar Permisos:**
  - Ver Agenda
  - Crear Citas
  - Editar Citas
  - Cancelar Citas
  - Ver Pacientes
  - Registrar Pacientes
  - Ver Historial Clínico (⚠️ sensible)
  - Enviar Mensajes
  - Ver Estadísticas (⚠️ financiero)

- ✅ **Eliminar Secretaria:**
  - Remover acceso
  - Confirmación requerida

### 2. Integración en Configuración

- ✅ Nuevo tab "Secretarias" en `/dashboard/medico/configuracion`
- ✅ Icono de Users
- ✅ Acceso directo a gestión

### 3. Validación de Fechas en Calendario

- ✅ No permite crear citas en fechas pasadas
- ✅ No permite crear citas en horas pasadas (si es hoy)
- ✅ Alert informativo al usuario

---

## 🔄 Flujo Completo

### Flujo 1: Médico Invita Secretaria

```
1. Médico va a Configuración
2. Click en tab "Secretarias"
3. Click en "Gestionar Secretarias"
4. Click en "Invitar Secretaria"
5. Llena formulario:
   - Nombre completo
   - Email
   - Contraseña
6. Sistema crea:
   - Usuario en auth.users
   - Perfil en profiles (role: secretaria)
   - Relación en doctor_secretaries
7. Secretaria recibe credenciales
8. Puede iniciar sesión
```

### Flujo 2: Médico Configura Permisos

```
1. En lista de secretarias
2. Click en "Permisos" de una secretaria
3. Ve lista de permisos con switches
4. Activa/desactiva según necesidad
5. Guarda cambios
6. Permisos se actualizan en BD
7. Secretaria ve cambios en próximo login
```

### Flujo 3: Secretaria Inicia Sesión

```
1. Va a /login
2. Ingresa email y contraseña
3. Sistema verifica:
   - Usuario existe
   - Role es "secretaria"
   - Tiene relación activa con médico
4. Redirige a /dashboard/secretaria
5. Ve solo lo que tiene permitido
```

---

## 🗄️ Estructura de Base de Datos

### Tabla: `doctor_secretaries`

```sql
CREATE TABLE doctor_secretaries (
  id UUID PRIMARY KEY,
  doctor_id UUID REFERENCES profiles(id),
  secretary_id UUID REFERENCES profiles(id),
  permissions JSONB DEFAULT '{
    "can_view_agenda": true,
    "can_create_appointments": true,
    "can_edit_appointments": true,
    "can_cancel_appointments": true,
    "can_view_patients": true,
    "can_register_patients": true,
    "can_view_medical_records": false,
    "can_send_messages": true,
    "can_view_statistics": false
  }',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Vista: `doctor_secretary_relationships`

```sql
CREATE VIEW doctor_secretary_relationships AS
SELECT 
  ds.id,
  ds.doctor_id,
  ds.secretary_id,
  ds.permissions,
  ds.status,
  ds.created_at,
  d.nombre_completo as doctor_name,
  s.nombre_completo as secretary_name,
  s.email as secretary_email
FROM doctor_secretaries ds
JOIN profiles d ON ds.doctor_id = d.id
JOIN profiles s ON ds.secretary_id = s.id;
```

---

## 🔐 Sistema de Permisos

### Permisos Disponibles:

| Permiso | Descripción | Por Defecto | Sensible |
|---------|-------------|-------------|----------|
| `can_view_agenda` | Ver calendario de citas | ✅ Sí | No |
| `can_create_appointments` | Crear nuevas citas | ✅ Sí | No |
| `can_edit_appointments` | Modificar citas existentes | ✅ Sí | No |
| `can_cancel_appointments` | Cancelar citas | ✅ Sí | No |
| `can_view_patients` | Ver lista de pacientes | ✅ Sí | No |
| `can_register_patients` | Registrar nuevos pacientes | ✅ Sí | No |
| `can_view_medical_records` | Ver historial clínico | ❌ No | ⚠️ Sí |
| `can_send_messages` | Enviar mensajes a pacientes | ✅ Sí | No |
| `can_view_statistics` | Ver estadísticas financieras | ❌ No | ⚠️ Sí |

### Verificación de Permisos en Código:

```typescript
// Ejemplo: Verificar si puede crear citas
const { data } = await supabase
  .from('doctor_secretaries')
  .select('permissions')
  .eq('secretary_id', userId)
  .eq('status', 'active')
  .single();

if (data?.permissions.can_create_appointments) {
  // Permitir crear cita
} else {
  // Mostrar mensaje de acceso denegado
}
```

---

## 📱 Dashboard de Secretaria (Pendiente)

### Estructura Propuesta:

```
/dashboard/secretaria
├── /agenda          (si tiene permiso)
├── /pacientes       (si tiene permiso)
├── /mensajes        (si tiene permiso)
└── /perfil          (siempre)
```

### Sidebar Dinámico:

```typescript
const getSecretaryMenu = (permissions) => {
  const menu = [];
  
  if (permissions.can_view_agenda) {
    menu.push({ label: "Agenda", route: "/dashboard/secretaria/agenda" });
  }
  
  if (permissions.can_view_patients) {
    menu.push({ label: "Pacientes", route: "/dashboard/secretaria/pacientes" });
  }
  
  if (permissions.can_send_messages) {
    menu.push({ label: "Mensajes", route: "/dashboard/secretaria/mensajes" });
  }
  
  menu.push({ label: "Mi Perfil", route: "/dashboard/secretaria/perfil" });
  
  return menu;
};
```

---

## 🚀 Próximos Pasos

### Fase 1: Dashboard de Secretaria (Urgente)
- [ ] Crear `/dashboard/secretaria/layout.tsx`
- [ ] Crear `/dashboard/secretaria/page.tsx`
- [ ] Sidebar dinámico según permisos
- [ ] Redireccionamiento desde login

### Fase 2: Vistas Compartidas
- [ ] Reutilizar componentes de calendario
- [ ] Reutilizar lista de pacientes
- [ ] Filtrar según permisos

### Fase 3: Login y Autenticación
- [ ] Detectar role en login
- [ ] Redirigir según role:
  - medico → `/dashboard/medico`
  - secretaria → `/dashboard/secretaria`
  - paciente → `/dashboard/paciente`

### Fase 4: Seguridad
- [ ] Middleware para verificar permisos
- [ ] RLS policies en Supabase
- [ ] Logs de acciones de secretaria

### Fase 5: Notificaciones
- [ ] Notificar a médico cuando secretaria crea cita
- [ ] Notificar a secretaria de cambios del médico
- [ ] Historial de acciones

---

## 🎨 UI/UX de Gestión de Secretarias

### Lista de Secretarias:

```
┌─────────────────────────────────────────────────┐
│ María García                          [Activa]  │
│ secretaria@ejemplo.com                          │
│ [Ver Agenda] [Crear Citas] [Ver Pacientes]     │
│                                                 │
│ [Permisos] [Eliminar]                          │
└─────────────────────────────────────────────────┘
```

### Dialog de Permisos:

```
┌─────────────────────────────────────────────────┐
│ Configurar Permisos - María García              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Ver Agenda                              [✓]     │
│ Puede ver el calendario de citas                │
│                                                 │
│ Crear Citas                             [✓]     │
│ Puede agendar nuevas citas                      │
│                                                 │
│ Ver Historial Clínico                   [ ]     │
│ ⚠️ Acceso a información médica sensible         │
│                                                 │
│ Ver Estadísticas                        [ ]     │
│ ⚠️ Incluye información financiera               │
│                                                 │
│ [Cancelar] [Guardar Cambios]                   │
└─────────────────────────────────────────────────┘
```

---

## 🔒 Seguridad y Mejores Prácticas

### 1. Permisos Granulares
- No dar acceso a historial clínico por defecto
- No dar acceso a estadísticas financieras por defecto
- Revisar permisos periódicamente

### 2. Auditoría
- Registrar todas las acciones de secretarias
- Tabla `secretary_activity_log`
- Revisar logs regularmente

### 3. Contraseñas
- Mínimo 6 caracteres (mejor 8+)
- Cambio de contraseña obligatorio en primer login
- Opción de recuperación de contraseña

### 4. Sesiones
- Timeout de sesión después de inactividad
- Logout automático al cerrar navegador
- Un solo dispositivo activo a la vez (opcional)

---

## 📊 Métricas y Reportes

### Para el Médico:

**Actividad de Secretarias:**
- Citas creadas por secretaria
- Pacientes registrados por secretaria
- Mensajes enviados por secretaria
- Horarios de mayor actividad

**Eficiencia:**
- Tiempo promedio para agendar cita
- Tasa de cancelación
- Satisfacción de pacientes

---

## 🐛 Casos de Uso y Testing

### Caso 1: Secretaria Crea Cita
```
1. Secretaria inicia sesión
2. Va a Agenda
3. Click en horario disponible
4. Selecciona paciente
5. Completa motivo
6. Guarda cita
7. Sistema verifica permiso can_create_appointments
8. Si tiene permiso: crea cita
9. Si no: muestra error
```

### Caso 2: Secretaria Sin Permiso
```
1. Secretaria intenta ver estadísticas
2. Sistema verifica permiso can_view_statistics
3. No tiene permiso
4. Muestra mensaje: "No tienes permiso para ver esta sección"
5. Sugiere contactar al médico
```

### Caso 3: Médico Revoca Permisos
```
1. Médico va a gestión de secretarias
2. Edita permisos de secretaria
3. Desactiva "Ver Historial Clínico"
4. Guarda cambios
5. Secretaria en próximo acceso no ve historial
6. Mensaje informativo
```

---

## ✅ Checklist de Implementación

### Backend
- [x] Tabla `doctor_secretaries` creada
- [x] Vista `doctor_secretary_relationships` creada
- [x] RLS policies configuradas
- [ ] Función para verificar permisos
- [ ] Tabla de logs de actividad

### Frontend - Médico
- [x] Página de gestión de secretarias
- [x] Dialog para invitar secretaria
- [x] Dialog para configurar permisos
- [x] Integración en configuración
- [x] Validación de fechas en calendario

### Frontend - Secretaria
- [ ] Dashboard de secretaria
- [ ] Layout con sidebar dinámico
- [ ] Vistas según permisos
- [ ] Restricciones visuales

### Autenticación
- [ ] Detección de role en login
- [ ] Redireccionamiento según role
- [ ] Middleware de permisos
- [ ] Recuperación de contraseña

---

## 🎉 Conclusión

Hemos implementado la base completa del sistema de secretarias:

1. ✅ Gestión de secretarias (invitar, permisos, eliminar)
2. ✅ Sistema de permisos granular
3. ✅ Integración en configuración
4. ✅ Validación de fechas en calendario
5. ✅ Base de datos preparada

**Próximo paso crítico:** Crear el dashboard de secretaria y el sistema de login con detección de roles.

**Archivos creados:**
- `app/dashboard/medico/configuracion/secretarias/page.tsx`
- `docs/SISTEMA_SECRETARIAS_COMPLETO.md`

**Archivos modificados:**
- `app/dashboard/medico/configuracion/page.tsx`
- `app/dashboard/medico/citas/page.tsx`
