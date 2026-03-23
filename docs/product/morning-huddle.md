# Morning Huddle (Operations Dashboard)

Dashboard operativo en tiempo real para consultorios odontologicos, accesible desde el tab "Operaciones" del hub de citas.

---

## How to Access

### Navigation

1. **Navegar a Citas**: Dashboard > Citas (`/dashboard/medico/citas`)
2. **Buscar el Tab de Operaciones**: Veras 3 tabs:
   - Agenda - Vista de calendario
   - **Operaciones** - Morning Huddle Dashboard
   - Lista de Espera - Gestion de pacientes en espera
3. **Click en "Operaciones"**

**URL Directa**: `http://localhost:3000/dashboard/medico/citas?tab=operations`

### Prerequisite: Odontology Specialty

El tab de Operaciones **solo aparece para especialidades de Odontologia**.

```typescript
const isOdontology = specialtyName?.toLowerCase().includes("odontolog");
```

Especialidades validas:
- "Odontologia General"
- "Odontologia Pediatrica"
- "Odontologo"
- "Cirujano Odontologico"
- Cualquier especialidad con "odontolog" en el nombre

### If You Don't See the Tab

**Verificar especialidad en base de datos:**
```sql
SELECT
  dp.full_name,
  dp.specialty_name,
  dp.type as doctor_type
FROM doctor_profiles dp
WHERE dp.id = auth.uid();
```

**Cambiar especialidad:**
```sql
UPDATE doctor_profiles
SET
  specialty_name = 'Odontologia General',
  type = 'medico'
WHERE id = auth.uid();
```

---

## Dashboard Content

### 1. Estadisticas del Dia (6 Cards)

| Metrica | Fuente |
|---------|--------|
| Total de citas | `appointments` table |
| Citas confirmadas | status = 'confirmada' |
| Casos urgentes | tipo_cita = 'urgencia' |
| Revenue estimado | `dental_appointment_details.estimated_cost` / `appointments.price` |
| Tasa de ocupacion | minutos usados / 480 minutos dia laboral |
| Materiales pendientes | materials_prepared = false |

### 2. Estado del Consultorio (Chair Status)

Per-chair real-time status:
- **Available** (verde): Silla libre
- **Occupied** (rojo): Paciente actual con tiempo estimado disponible
- **Cleaning** (amarillo): En limpieza

Query por silla dental:
- Encuentra paciente actual (status = 'en_consulta')
- Encuentra proximo paciente
- Calcula tiempo estimado disponible basado en duracion restante

### 3. Alertas y Prioridades (3 Levels)

- **Urgent** (rojo): Citas de urgencia dentro de 2 horas
- **High** (naranja): Pacientes con anestesia + alergias, materiales sin preparar con cita en <1 hora
- **Normal** (azul): Citas sin confirmar dentro de 24 horas

### 4. Checklist del Equipo

Lista de tareas diarias persistente en base de datos:
- Verificar equipos esterilizados
- Confirmar citas del dia
- Revisar stock de materiales criticos
- Preparar materiales para procedimientos
- Revisar historial de pacientes del dia

Features:
- Checkbox interactivo con toggle
- Progress badge con % completado
- Optimistic updates (UI se actualiza instantaneamente, rollback si falla)
- Persistencia automatica en BD

### 5. Objetivos de Produccion

- Barra de progreso con revenue real vs meta diaria ($3,000)
- Comparacion con meta semanal
- Citas restantes estimadas

---

## Fase 3: Implementation Details (COMPLETED)

### Data Loading Functions

**File**: `apps/web/app/dashboard/medico/citas/components/operations-tab.tsx`

1. **`loadDailyStats()`** (70 lineas)
   - Query real a tabla `appointments` con join a `dental_appointment_details`
   - Calcula 6 metricas en tiempo real

2. **`loadChairStatus()`** (80 lineas)
   - Query compleja por silla dental
   - Determina estado: `available` | `occupied` | `cleaning`

3. **`generateAlerts()`** (60 lineas)
   - Sistema de alertas de 3 niveles de prioridad
   - Alertas dinamicas generadas desde datos reales

4. **`loadChecklist()`** (50 lineas)
   - Carga checklist diario desde tabla `daily_team_checklist`
   - Si no existe checklist para hoy, crea uno default con 5 items

5. **`toggleChecklistItem()`** (25 lineas)
   - Persiste cambios a base de datos
   - Optimistic updates con rollback automatico

### Realtime Subscriptions

```typescript
const channel = supabase
  .channel('operations-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'appointments',
  }, () => {
    loadDailyStats();
    loadChairStatus();
    generateAlerts();
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'dental_appointment_details',
  }, () => {
    loadChairStatus();
  })
  .subscribe();
```

Triggers:
- Cambios en `appointments` -> Refresca stats, chairs, alerts
- Cambios en `dental_appointment_details` -> Refresca estado de sillas
- Auto-refresh cada 60 segundos para chairs y alerts

### Data Flow

```
User abre Morning Huddle
  -> loadDailyStats -> Query appointments + dental_details -> Render 6 stats cards
  -> loadChairStatus -> Query dental_appointment_details + chairs -> Render chair status
  -> generateAlerts -> Process appointments -> Render alertas priorizadas
  -> loadChecklist -> Query daily_team_checklist -> Render checklist items

Realtime: appointments change -> Refresh stats, chairs, alerts
Realtime: dental_details change -> Refresh chair status
Auto-refresh 60s -> Refresh chairs, alerts
User toggle checklist -> Optimistic update -> Persist to DB -> Keep or rollback
```

---

## Database

### Migration: `20260213160000_daily_team_checklist.sql`

```sql
CREATE TABLE IF NOT EXISTS daily_team_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES doctor_offices(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(office_id, date)
);
```

JSONB items structure:
```json
[
  {
    "id": "uuid",
    "title": "string",
    "completed": boolean,
    "assignedTo": "string (optional)",
    "completedAt": "timestamp (optional)"
  }
]
```

Features:
- Unique constraint per office + date (1 checklist per day)
- RLS policies for doctors (SELECT + ALL)
- Composite index: `(office_id, date)`
- Auto-update trigger for `updated_at`
- Cascade delete with `doctor_offices`

### Required Tables

Verify all tables exist:
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

---

## Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Desktop (>= 1024px) | 3 columnas stats, sidebar expandido, grid 2x1 |
| Tablet (768-1023px) | 2 columnas stats, grid 1x1 stacked |
| Mobile (< 768px) | 1 columna, stats carousel, tabs scrollable |

---

## Troubleshooting

### No veo el tab "Operaciones"
**Causa**: Tu especialidad no es odontologia
**Solucion**: Cambiar `specialty_name` a una especialidad de odontologia

### El tab esta vacio / sin datos
**Causa**: No hay citas para HOY con tu usuario
**Solucion**: Crear citas desde el tab de Agenda con fecha de hoy

### Las sillas aparecen vacias
**Causa**: Las citas no tienen `chair_id` asignado
**Solucion**: Editar citas y asignar una silla dental en "Detalles Odontologicos"

### Error al cargar datos
**Causa**: Migracion no aplicada completamente
**Solucion**: Verificar que las 4 tablas existen (dental_chairs, dental_appointment_details, dental_procedure_catalog, daily_team_checklist)

---

## Metrics

| Metrica | Codigo |
|---------|--------|
| Archivos modificados | 1 |
| Archivos creados | 1 (migracion) |
| Lineas de codigo | 825 |
| Errores TypeScript | 0 |
| Funciones implementadas | 5 |
| Queries Supabase | 7 |
| Subscripciones realtime | 2 |

---

## Next Steps (Optional)

1. **Production Goals Dinamicos**: Crear tabla `daily_production_goals` con metas configurables
2. **Notificaciones Push**: Integrar con FCM/OneSignal
3. **Export/Print**: Implementar "Imprimir Agenda" con PDF
4. **Limpieza automatica de sillas**: Timer automatico cleaning -> available
5. **Historial de checklists**: Vista de checklists pasados para analisis de compliance

---

## Relevant Files

- Operations Tab: `apps/web/app/dashboard/medico/citas/components/operations-tab.tsx`
- Components index: `apps/web/app/dashboard/medico/citas/components/index.ts`
- AppointmentsHub: `apps/web/app/dashboard/medico/citas/appointments-hub.tsx`
- Migration: `apps/web/supabase/migrations/20260213160000_daily_team_checklist.sql`

---

**Completion Date**: 2026-02-14
**Migration Status**: Applied (dental_chairs, dental_appointment_details, dental_procedure_catalog, daily_team_checklist)
