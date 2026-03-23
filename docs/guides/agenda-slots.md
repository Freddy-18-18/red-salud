# Agenda & Appointment Slots

Sistema inteligente de gestion de slots en el calendario de citas que considera la duracion de cada consulta, con especificaciones operativas completas.

---

## Slot Duration System

### Concepto

Las citas se organizan en slots de tiempo precisos basados en su duracion:
- **15 minutos**: Permite hasta 4 citas por hora (09:00, 09:15, 09:30, 09:45)
- **30 minutos**: Permite hasta 2 citas por hora (09:00, 09:30)
- **60 minutos**: Permite 1 cita por hora (09:00)

### Estructura de Datos

```typescript
interface TimeSlot {
  startMinute: number;  // 0, 15, 30, 45
  endMinute: number;    // 15, 30, 45, 60
  appointments: CalendarAppointment[];
}
```

### Funcion Principal: `getTimeSlotsForHour`

```typescript
const getTimeSlotsForHour = (day: Date, hour: number): TimeSlot[]
```

Esta funcion:
1. Filtra citas de una hora especifica
2. Ordena por minuto de inicio
3. Agrupa citas en slots basados en `duracion_minutos`
4. Retorna slots ordenados para renderizado

**Ejemplo:**
```typescript
// Hora 09:00 con 3 citas
// - 09:00-09:15 (15 min): Dr. Garcia
// - 09:15-09:45 (30 min): Dr. Lopez
// - 09:45-10:00 (15 min): Dr. Martinez

const slots = getTimeSlotsForHour(today, 9);
// [
//   { startMinute: 0, endMinute: 15, appointments: [Dr. Garcia] },
//   { startMinute: 15, endMinute: 45, appointments: [Dr. Lopez] },
//   { startMinute: 45, endMinute: 60, appointments: [Dr. Martinez] }
// ]
```

---

## Calendar Scroll Improvements

### Previous Issue
- Scroll a nivel de pagina completa
- Dificil navegacion en pantallas pequenas

### Solution
- Removido `overflow-hidden` de contenedores externos
- Agregado `overflow-y-auto` al contenido del calendario
- Toolbar fijo, solo el grid de tiempo tiene scroll
- Pagina principal sin scroll, centrada

### Modified Files
- `apps/web/app/dashboard/medico/citas/components/agenda-tab.tsx`
- `apps/web/components/dashboard/medico/calendar/unified-calendar.tsx`

---

## Visual Enhancements

### Separation Visual entre Slots
- Bordes punteados entre slots diferentes
- Altura proporcional a la duracion del slot
- Minimo 22px de altura por slot

### Header de Slot Informativo
```
09:15  [1/1]
```
- Hora exacta del slot (HH:mm)
- Indicador de capacidad (ocupados/maximo)
- Color rojo si esta lleno, azul si tiene espacio

### Tarjetas de Cita
- Border izquierdo mas grueso (3px) segun estado
- Badge de duracion prominente
- Muestra motivo de consulta si existe
- Hover effects suaves (scale 1.02)
- Colores por estado: Pendiente (amarillo), Confirmada (azul), Completada (verde)

### Indicador de Disponibilidad
- Mensaje "Disponible" en slots vacios
- Solo visible en hover

---

## Drag & Drop with Overlap Detection

### Improved DragState

```typescript
interface DragState {
  isDragging: boolean;
  draggedAppointment: CalendarAppointment | null;
  draggedOver: {
    date: Date;
    hour: number;
    minute?: number;
    existingAppointment?: CalendarAppointment
  } | null;
}
```

### Overlap Detection

`handleDragOver` detecta conflictos considerando:
1. Nueva cita empieza durante una existente
2. Nueva cita termina durante una existente
3. Nueva cita engloba completamente una existente

```typescript
const handleDragOver = (date: Date, hour: number, minute: number = 0) => {
  const targetTime = new Date(date);
  targetTime.setHours(hour, minute, 0, 0);

  const draggedDuration = dragState.draggedAppointment?.duracion_minutos || 30;
  const targetEnd = new Date(targetTime.getTime() + draggedDuration * 60000);

  const existingAppointment = appointments.find(apt => {
    const aptStart = new Date(apt.fecha_hora);
    const aptEnd = new Date(apt.fecha_hora_fin);
    return (
      (targetTime >= aptStart && targetTime < aptEnd) ||
      (targetEnd > aptStart && targetEnd <= aptEnd) ||
      (targetTime <= aptStart && targetEnd >= aptEnd)
    );
  });
}
```

### handleDragEnd

- Actualiza `fecha_hora` Y `fecha_hora_fin` en la base de datos
- Calcula correctamente el tiempo de finalizacion
- Mantiene swap functionality intacta

### Modified Files
- `apps/web/hooks/use-drag-drop.ts`
- `apps/web/components/dashboard/medico/calendar/week-view-improved.tsx`

---

## Availability Validation

En `handleTimeSlotClick` existe validacion robusta:

```typescript
const isSlotTaken = appointments.some(apt => {
  if (selectedOfficeId && apt.location_id !== selectedOfficeId) {
    return false;
  }
  const aptDate = new Date(apt.fecha_hora);
  const aptEndDate = new Date(apt.fecha_hora_fin);
  const selectedEndTime = new Date(selectedDateTime.getTime() + 30 * 60000);
  return (
    isSameDay(aptDate, selectedDateTime) &&
    selectedDateTime.getTime() < aptEndDate.getTime() &&
    selectedEndTime.getTime() > aptDate.getTime()
  );
});
```

Behavior:
- Previene citas en horarios pasados
- Valida consultorio seleccionado
- Detecta overlaps considerando duracion
- Muestra toast informativo al usuario

---

## Layout Architecture (Operations Hub)

### Estructura de Altura Sin Scroll Principal

```
Dashboard Header (48px - fixed)
  Page Header (64px - flex-none)
    Title & Description | Office Selector
  Tabs Bar (40px - flex-none)
    [Agenda] [Operaciones] [Lista de Espera]
  Tab Content Container (flex-1 min-h-0)
    ScrollArea (h-full)
      Content with internal scroll
      Altura: calc(100vh - 152px)
```

### Tailwind Key Classes

```tsx
// Main container
<div className="flex flex-col h-full">
  // Fixed header
  <div className="flex-none border-b bg-background px-6 py-4" />

  // Tabs with flexible content
  <Tabs className="flex flex-col flex-1 min-h-0">
    // Fixed tabs list
    <div className="flex-none border-b bg-muted/30 px-6">
      <TabsList className="h-10" />
    </div>

    // Scrollable content
    <div className="flex-1 min-h-0">
      <TabsContent className="h-full m-0 overflow-hidden">
        <ScrollArea className="h-full" />
      </TabsContent>
    </div>
  </Tabs>
</div>
```

Key concepts:
- `flex-1`: Toma todo el espacio disponible
- `min-h-0`: Permite que los flex items se encojan por debajo de su tamano minimo
- `overflow-hidden`: Previene scroll en el contenedor padre
- `h-full`: Los hijos toman 100% de altura del padre

---

## Odontology-Specific Features

### Dental Appointment Types

```typescript
const DENTAL_APPOINTMENT_TYPES = {
  cleaning: { label: "Limpieza/Profilaxis", color: "#3B82F6", defaultDuration: 45 },
  endodontics: { label: "Endodoncia", color: "#8B5CF6", defaultDuration: 90, requiresAssistant: true },
  periodontics: { label: "Periodoncia", color: "#10B981", defaultDuration: 60 },
  surgery: { label: "Cirugia/Extraccion", color: "#EF4444", defaultDuration: 30, requiresPreMedication: true },
  orthodontics: { label: "Ortodoncia", color: "#F59E0B", defaultDuration: 30 },
  aesthetic: { label: "Estetica", color: "#EC4899", defaultDuration: 60 },
};
```

### Extended Appointment Fields

```typescript
interface DentalAppointmentExtension {
  chair_id?: string;
  hygienist_id?: string;
  assistant_id?: string;
  procedure_code?: string;
  tooth_number?: string[];
  requires_anesthesia?: boolean;
  anesthesia_type?: "lidocaina" | "articaina" | "mepivacaina";
  patient_allergies?: string[];
  materials_needed?: string[];
  materials_prepared?: boolean;
  lab_work?: {
    type: "corona" | "puente" | "protesis" | "ferula";
    lab_name: string;
    expected_date: string;
    received: boolean;
  };
  estimated_cost?: number;
  treatment_plan_id?: string;
}
```

### Visual Indicators
- Punto rojo: Requiere pre-medicacion
- Triangulo advertencia: Alertas de alergias
- Icono lab: Esperando trabajo de laboratorio
- Checkmark verde: Materiales preparados
- Icono personas: Requiere asistente

---

## Smart Waitlist (Tab 3)

### Matching Algorithm

```typescript
function calculateMatchScore(entry: SmartWaitlistEntry, slot: CancelledSlot): number {
  let score = 0;

  // 1. Urgencia medica (peso: 40)
  if (entry.priority === "urgent") score += 40;
  else if (entry.priority === "high") score += 30;
  else if (entry.priority === "normal") score += 20;
  else score += 10;

  // 2. Coincidencia de procedimiento (peso: 25)
  if (entry.procedureType === slot.procedureType) score += 25;
  else if (isSimilarProcedure(entry.procedureType, slot.procedureType)) score += 15;

  // 3. Duracion compatible (peso: 15)
  if (entry.estimatedDuration <= slot.duration) score += 15;
  else if (entry.estimatedDuration <= slot.duration + 15) score += 10;

  // 4. Preferencias de horario (peso: 10)
  // 5. Valor del procedimiento (peso: 5)
  // 6. Tiempo esperando (peso: 5)

  return score;
}
```

---

## Implementation Status

### Completed
- [x] AppointmentsHub component
- [x] OperationsTab with full functionality
- [x] Scroll system improvements
- [x] Duration-based slot system
- [x] Drag & drop with overlap detection

### Pending
- [ ] Refactorizar AgendaTab
- [ ] Refactorizar WaitlistTab
- [ ] Dental appointment fields in DB
- [ ] Smart matching implementation
- [ ] Specialty adapters

---

## Performance Notes

- `getTimeSlotsForHour` se ejecuta para cada celda del calendario
- Optimizacion posible: Usar `useMemo` para cachear slots por dia
- Actualmente aceptable para agendas normales (<100 citas por dia)

### Compatibility
- Compatible con sistema de drag & drop existente
- Compatible con filtros de estado y tipo
- Compatible con realtime subscriptions
- Compatible con modo offline

---

## Relevant Files

- Calendar: `apps/web/components/dashboard/medico/calendar/week-view-improved.tsx`
- Drag & Drop hook: `apps/web/hooks/use-drag-drop.ts`
- Types: `apps/web/components/dashboard/medico/calendar/types.ts`
- Agenda Tab: `apps/web/app/dashboard/medico/citas/components/agenda-tab.tsx`
- Operations Tab: `apps/web/app/dashboard/medico/citas/components/operations-tab.tsx`
- AppointmentsHub: `apps/web/app/dashboard/medico/citas/appointments-hub.tsx`
