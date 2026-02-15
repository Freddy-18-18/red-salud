# 🔍 Cómo Acceder al Dashboard de Morning Huddle (Operaciones)

## 📌 Ubicación del Dashboard

El dashboard "Morning Huddle" se encuentra en el **tab de Operaciones** dentro del hub de Citas.

### 🚀 Pasos para Acceder:

1. **Navegar a la sección de Citas**
   ```
   Dashboard → Citas
   URL: http://localhost:3000/dashboard/medico/citas
   ```

2. **Buscar el Tab de Operaciones**
   
   Verás 3 tabs en la parte superior:
   - 📅 **Agenda** - Vista de calendario
   - 👥 **Operaciones** - Morning Huddle Dashboard ⭐ (Este es el que buscas)
   - 📋 **Lista de Espera** - Gestión de pacientes en espera

3. **Click en "Operaciones"**
   
   Al hacer click, verás el dashboard completo con:
   - **6 cards de estadísticas**: Citas, Confirmadas, Urgencias, Revenue Est., Ocupación, Materiales
   - **Estado del Consultorio**: Estado en tiempo real de cada silla dental
   - **Alertas y Prioridades**: Notificaciones urgentes, high, y normales
   - **Checklist del Equipo**: Lista de tareas diarias con % de completado
   - **Objetivos de Producción**: Barra de progreso vs meta diaria

---

## ⚠️ IMPORTANTE: Condición para Ver el Tab

El tab de **Operaciones** **solo aparece para especialidades de Odontología**.

### ¿Por qué no lo veo?

Si no ves el tab "Operaciones", verifica:

#### 1. **Especialidad del Doctor**
El código verifica si `specialtyName` contiene "odontolog" (case-insensitive):

```typescript
const isOdontology = specialtyName?.toLowerCase().includes("odontolog");

{isOdontology && (
  <TabsTrigger value="operations">
    <Users className="size-4 mr-2" />
    Operaciones
  </TabsTrigger>
)}
```

#### 2. **Verificar Especialidad en Base de Datos**

Ejecuta este query en Supabase para verificar tu especialidad:

```sql
SELECT 
  dp.full_name,
  dp.specialty_name,
  dp.type as doctor_type
FROM doctor_profiles dp
WHERE dp.id = auth.uid();
```

#### 3. **Especialidades Válidas**

El tab aparecerá si tu `specialty_name` incluye:
- ✅ "Odontología General"
- ✅ "Odontología Pediátrica"
- ✅ "Odontólogo"
- ✅ "Cirujano Odontológico"
- ✅ Cualquier especialidad con "odontolog" en el nombre

---

## 🔧 Solución: Cambiar Especialidad a Odontología

Si tu perfil no tiene una especialidad de odontología y quieres probar el dashboard:

### Opción 1: Actualizar desde SQL (Supabase Dashboard)

```sql
-- Cambiar tu especialidad a Odontología General
UPDATE doctor_profiles
SET 
  specialty_name = 'Odontología General',
  type = 'medico'
WHERE id = auth.uid();
```

### Opción 2: Actualizar desde la App

Si hay una sección de Perfil en la aplicación:
1. Ir a **Dashboard → Perfil**
2. Editar **Especialidad**
3. Seleccionar o escribir "Odontología General"
4. Guardar cambios
5. Refrescar la página de Citas

---

## 🖼️ Visual: Estructura de Tabs

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard > Citas                                       │
├─────────────────────────────────────────────────────────┤
│  [📅 Agenda]  [👥 Operaciones]  [📋 Lista de Espera]   │
│      ↓              ↓                    ↓               │
│   Calendario    MORNING        Pacientes pendientes     │
│   de citas      HUDDLE         de asignación            │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Contenido del Dashboard (Una vez visible)

### 1. **Estadísticas del Día** (Top Section)
```
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│  Citas  │Confirm. │Urgencias│Revenue  │Ocupación│Material │
│   12    │   10    │    2    │ $2,450  │  85%    │    3    │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

### 2. **Estado del Consultorio** (Left Side)
```
┌────────────────────────────────────┐
│ 🔴 Silla Principal                 │
│    Juan Pérez - Disp. en: 20 min  │
├────────────────────────────────────┤
│ 🟢 Silla Secundaria                │
│    Próximo: 10:30 - María López    │
├────────────────────────────────────┤
│ 🟡 Silla de Higiene               │
│    Disponible en 10 min            │
└────────────────────────────────────┘
```

### 3. **Alertas y Prioridades** (Right Side)
```
┌────────────────────────────────────┐
│ 🔴 URGENT                          │
│    Juan Pérez (9:30)               │
│    Urgencia - Dolor agudo          │
├────────────────────────────────────┤
│ 🟠 HIGH                            │
│    María López (10:30)             │
│    Anestesia + Alergia a lidocaína │
├────────────────────────────────────┤
│ 🔵 NORMAL                          │
│    Carlos Ruiz (14:00)             │
│    Cita sin confirmar              │
└────────────────────────────────────┘
```

### 4. **Checklist del Equipo** (Bottom Left)
```
┌────────────────────────────────────────────┐
│ Checklist del Equipo        75% Completado │
├────────────────────────────────────────────┤
│ ✓ Verificar equipos esterilizados         │
│ ✓ Confirmar citas del día                 │
│ ✓ Revisar stock de materiales críticos    │
│ ☐ Preparar materiales para procedimientos │
│ ☐ Revisar historial de pacientes del día  │
└────────────────────────────────────────────┘
```

### 5. **Objetivos de Producción** (Bottom Right)
```
┌────────────────────────────────┐
│ Meta Diaria:        $3,000     │
│ Actual:             $2,450     │
│ ████████████░░░░░░  81%        │
│                                │
│ Citas restantes: 4 citas       │
│ Estimado: $550                 │
└────────────────────────────────┘
```

---

## 🔄 Funcionalidades en Tiempo Real

Una vez que accedas al dashboard:

### ✅ Auto-refresh cada 60 segundos
- Estado de sillas se actualiza automáticamente
- Alertas se regeneran con datos frescos

### ✅ Realtime Subscriptions
- Cuando creas/editas una cita → Stats se actualizan instantáneamente
- Cuando cambias dental_details → Estado de sillas se actualiza
- Sin necesidad de refrescar la página

### ✅ Interactividad
- **Checklist**: Click en checkbox para marcar como completado
- **Persistencia**: Los checks se guardan automáticamente en BD
- **Optimistic Updates**: UI se actualiza instantáneamente (con rollback si falla)

---

## 🧪 Testing del Dashboard

### 1. Crear Citas de Prueba
Para ver datos en el dashboard, necesitas citas para HOY:

```sql
-- Insertar cita de prueba en el tab de Agenda
-- O usar la interfaz de Agenda para crear citas nuevas
```

### 2. Asignar Sillas Dentales
Al crear/editar una cita:
1. Seleccionar specialidad de odontología
2. En la sección "Detalles Odontológicos":
   - Seleccionar una **silla dental**
   - Agregar **procedimiento**
   - Marcar materiales necesarios

### 3. Verificar Updates en Operaciones
1. Crear una cita desde tab de Agenda
2. Ir a tab de Operaciones
3. Ver que las estadísticas se actualizaron
4. Ver el paciente en la silla asignada

---

## 🆘 Troubleshooting

### ❌ No veo el tab "Operaciones"
**Causa**: Tu especialidad no es odontología  
**Solución**: Cambiar `specialty_name` a una especialidad de odontología

### ❌ El tab está vacío / sin datos
**Causa**: No hay citas para HOY con tu usuario  
**Solución**: Crear citas desde el tab de Agenda con fecha de hoy

### ❌ Las sillas aparecen vacías
**Causa**: Las citas no tienen `chair_id` asignado  
**Solución**: Editar citas y asignar una silla dental en "Detalles Odontológicos"

### ❌ Error al cargar datos
**Causa**: Migración no aplicada completamente  
**Solución**: Verificar que las 3 tablas existen (dental_chairs, dental_appointment_details, daily_team_checklist)

---

## 📊 Verificación de Migraciones Aplicadas

Verifica que todas las tablas se crearon correctamente:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'dental_chairs', 
    'dental_appointment_details', 
    'dental_procedure_catalog', 
    'daily_team_checklist'
  )
ORDER BY table_name;
```

**Resultado esperado**: 4 filas (todas las tablas listadas)

---

## ✅ Checklist de Configuración Completa

- [ ] Perfil de doctor tiene `specialty_name` con "odontolog"
- [ ] Las 4 tablas están creadas en Supabase
- [ ] Existen sillas dentales en `dental_chairs` para tu consultorio
- [ ] Hay al menos 1 cita creada para HOY (fecha actual)
- [ ] La cita tiene `chair_id` asignado (opcional pero recomendado)
- [ ] Navegas a `/dashboard/medico/citas`
- [ ] Ves el tab "Operaciones" entre Agenda y Lista de Espera
- [ ] Click en "Operaciones" muestra el dashboard completo

---

## 🎉 ¡Todo Listo!

Una vez configurado correctamente, el dashboard de Morning Huddle será tu herramienta principal para:

- 🏥 Monitorear operaciones del consultorio en tiempo real
- 👥 Ver qué silla está ocupada y próximos pacientes
- ⚠️ Gestionar alertas y prioridades
- ✅ Coordinar tareas del equipo con checklist
- 💰 Seguimiento de objetivos de producción diarios

**URL Directa**: `http://localhost:3000/dashboard/medico/citas?tab=operations`

---

**Última Actualización**: 14 de Febrero 2026  
**Versión**: 1.0  
**Estado Migraciones**: ✅ Aplicadas (dental_chairs, dental_appointment_details, dental_procedure_catalog, daily_team_checklist)
