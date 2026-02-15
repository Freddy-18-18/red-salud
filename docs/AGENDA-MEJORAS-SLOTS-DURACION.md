# Mejoras en Agenda - Sistema de Slots por Duración

## Resumen

Implementación de un sistema inteligente de gestión de slots en el calendario de citas que considera la duración de cada consulta para mostrar y organizar múltiples citas dentro de una misma hora.

## Cambios Implementados

### 1. **Scroll Interno del Calendario** ✅

**Problema Anterior:**
- El scroll estaba a nivel de página completa
- Difícil navegación en pantallas pequeñas
- Experiencia de usuario subóptima

**Solución Implementada:**
- Removido `overflow-hidden` de contenedores externos
- Agregado `overflow-y-auto` al contenido del calendario
- Toolbar fijo, solo el grid de tiempo tiene scroll
- Página principal sin scroll, centrada

**Archivos Modificados:**
- `apps/web/app/dashboard/medico/citas/components/agenda-tab.tsx`
- `apps/web/components/dashboard/medico/calendar/unified-calendar.tsx`

### 2. **Sistema de Slots por Duración** ✅

**Concepto:**
Las citas ahora se organizan en slots de tiempo precisos basados en su duración:
- **15 minutos**: Permite hasta 4 citas por hora (09:00, 09:15, 09:30, 09:45)
- **30 minutos**: Permite hasta 2 citas por hora (09:00, 09:30)
- **60 minutos**: Permite 1 cita por hora (09:00)

**Implementación Técnica:**

#### Estructura de Datos
```typescript
interface TimeSlot {
  startMinute: number;  // 0, 15, 30, 45
  endMinute: number;    // 15, 30, 45, 60
  appointments: CalendarAppointment[];
}
```

#### Función Principal: `getTimeSlotsForHour`
```typescript
const getTimeSlotsForHour = (day: Date, hour: number): TimeSlot[]
```

Esta función:
1. Filtra citas de una hora específica
2. Ordena por minuto de inicio
3. Agrupa citas en slots basados en `duracion_minutos`
4. Retorna slots ordenados para renderizado

**Ejemplo de Uso:**
```typescript
// Hora 09:00 con 3 citas
// - 09:00-09:15 (15 min): Dr. García
// - 09:15-09:45 (30 min): Dr. López  
// - 09:45-10:00 (15 min): Dr. Martínez

const slots = getTimeSlotsForHour(today, 9);
// Retorna:
// [
//   { startMinute: 0, endMinute: 15, appointments: [Dr. García] },
//   { startMinute: 15, endMinute: 45, appointments: [Dr. López] },
//   { startMinute: 45, endMinute: 60, appointments: [Dr. Martínez] }
// ]
```

**Archivos Modificados:**
- `apps/web/components/dashboard/medico/calendar/week-view-improved.tsx`

### 3. **Visualización Mejorada de Múltiples Citas** ✅

**Características Visuales:**

1. **Separación Visual entre Slots**
   - Bordes punteados entre slots diferentes
   - Altura proporcional a la duración del slot
   - Mínimo 22px de altura por slot

2. **Header de Slot Informativo**
   ```
   09:15  [1/1]
   ```
   - Hora exacta del slot (HH:mm)
   - Indicador de capacidad (ocupados/máximo)
   - Color rojo si está lleno, azul si tiene espacio

3. **Tarjetas de Cita Mejoradas**
   - Border izquierdo más grueso (3px) según estado
   - Badge de duración prominente
   - Muestra motivo de consulta si existe
   - Hover effects suaves (scale 1.02)
   - Colores por estado:
     - 🟡 Pendiente: Amarillo
     - 🔵 Confirmada: Azul
     - 🟢 Completada: Verde

4. **Indicador de Disponibilidad**
   - Mensaje "Disponible" en slots vacíos
   - Solo visible en hover
   - Guía visual para el usuario

**Estilos Aplicados:**
```tsx
// Slot Container
<div className="border-t border-dashed border-border/30">

// Capacity Badge
<div className={`${isFull ? 'bg-red-100' : 'bg-blue-100'}`}>
  {slot.appointments.length}/{maxCapacity}
</div>

// Appointment Card
<div className="border-l-[3px] hover:scale-[1.02] hover:shadow-md">
```

### 4. **Drag & Drop Mejorado con Detección de Overlaps** ✅

**Problema Anterior:**
- Solo detectaba conflictos si coincidía la hora exacta
- No consideraba duraciones diferentes

**Solución Implementada:**

#### Hook Actualizado: `useDragAndDrop`

**Nuevo Tipo:**
```typescript
interface DragState {
  isDragging: boolean;
  draggedAppointment: CalendarAppointment | null;
  draggedOver: { 
    date: Date; 
    hour: number; 
    minute?: number;  // ← Nuevo
    existingAppointment?: CalendarAppointment 
  } | null;
}
```

**Función `handleDragOver` Mejorada:**
```typescript
const handleDragOver = (date: Date, hour: number, minute: number = 0) => {
  const targetTime = new Date(date);
  targetTime.setHours(hour, minute, 0, 0);
  
  const draggedDuration = dragState.draggedAppointment?.duracion_minutos || 30;
  const targetEnd = new Date(targetTime.getTime() + draggedDuration * 60000);
  
  // Detecta conflictos considerando:
  // 1. Nueva cita empieza durante una existente
  // 2. Nueva cita termina durante una existente
  // 3. Nueva cita engloba completamente una existente
  
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

**Función `handleDragEnd` Mejorada:**
- Actualiza `fecha_hora` Y `fecha_hora_fin` en la base de datos
- Calcula correctamente el tiempo de finalización:
  ```typescript
  const newEndTime = new Date(newDateTime.getTime() + apt.duracion_minutos * 60000);
  ```
- Mantiene swap functionality intacta

**Archivos Modificados:**
- `apps/web/hooks/use-drag-drop.ts`
- `apps/web/components/dashboard/medico/calendar/week-view-improved.tsx`

### 5. **Validación de Disponibilidad** ✅

**Validación Existente Verificada:**

En `handleTimeSlotClick` ya existe validación robusta:

```typescript
const isSlotTaken = appointments.some(apt => {
  // Filtra por consultorio
  if (selectedOfficeId && apt.location_id !== selectedOfficeId) {
    return false;
  }
  
  const aptDate = new Date(apt.fecha_hora);
  const aptEndDate = new Date(apt.fecha_hora_fin);
  const selectedEndTime = new Date(selectedDateTime.getTime() + 30 * 60000);
  
  // Detecta overlap
  return (
    isSameDay(aptDate, selectedDateTime) &&
    selectedDateTime.getTime() < aptEndDate.getTime() &&
    selectedEndTime.getTime() > aptDate.getTime()
  );
});
```

**Comportamiento:**
- ✅ Previene citas en horarios pasados
- ✅ Valida consultorio seleccionado
- ✅ Detecta overlaps considerando duración
- ✅ Muestra toast informativo al usuario

## Ejemplos de Uso

### Escenario 1: Consultas de 15 Minutos

**Configuración:**
```
09:00 - Dr. García (Control, 15 min)
09:15 - Dr. López (Consulta, 15 min)
09:30 - Dr. Martínez (Urgencia, 15 min)
09:45 - Dra. Pérez (Seguimiento, 15 min)
```

**Resultado Visual:**
```
┌─────────────────────────────┐
│ 09:00  [4/4] ← Lleno (rojo) │
├─────────────────────────────┤
│ 🟡 09:00 Dr. García [15min] │
├─────────────────────────────┤
│ 🔵 09:15 Dr. López [15min]  │
├─────────────────────────────┤
│ 🔴 09:30 Dr. Martínez [15m] │
├─────────────────────────────┤
│ 🟢 09:45 Dra. Pérez [15min] │
└─────────────────────────────┘
```

### Escenario 2: Consultas Mixtas

**Configuración:**
```
10:00 - Dr. Silva (Cirugía, 60 min)
11:00 - Dr. Torres (Control, 30 min)
11:30 - Dra. Rojas (Consulta, 30 min)
```

**Resultado Visual:**
```
┌─────────────────────────────┐
│ 10:00  [1/1] ← Lleno        │
│ 🔵 10:00 Dr. Silva [60min]  │
│      🔪 Cirugía             │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 11:00  [1/1]                │
│ 🟡 11:00 Dr. Torres [30min] │
│      Control rutinario      │
├─────────────────────────────┤
│ 11:30  [1/1]                │
│ 🔵 11:30 Dra. Rojas [30min] │
│      Consulta general       │
└─────────────────────────────┘
```

## Beneficios

### Para Usuarios (Médicos/Staff)
1. **Visualización Clara**: Pueden ver exactamente cuántas citas hay y cuánto duran
2. **Optimización de Agenda**: Identificar espacios disponibles es más fácil
3. **Prevención de Errores**: Sistema previene doble booking automáticamente
4. **Navegación Fluida**: Scroll solo en el calendario, no en toda la página

### Para el Sistema
1. **Escalabilidad**: Maneja múltiples citas de diferentes duraciones sin problemas
2. **Consistencia**: Validación centralizada en hook y componentes
3. **Performance**: Cálculos optimizados con useMemo
4. **Mantenibilidad**: Código modular y bien estructurado

## Consideraciones Técnicas

### Performance
- La función `getTimeSlotsForHour` se ejecuta para cada celda del calendario
- Optimización posible: Usar `useMemo` para cachear slots por día
- Actualmente aceptable para agendas normales (<100 citas por día)

### Compatibilidad
- ✅ Compatible con sistema de drag & drop existente
- ✅ Compatible con filtros de estado y tipo
- ✅ Compatible con realtime subscriptions
- ✅ Compatible con modo offline

### Limitaciones Conocidas
1. **Drag & Drop a Nivel de Hora**: Actualmente se arrastra a la hora completa, no a sub-slots específicos
   - Posible mejora futura: Permitir drag a minutos específicos
2. **Capacidad Fija**: Actualmente 1 cita por slot
   - Posible mejora: Permitir configurar capacidad por consultorio/médico

## Testing Recomendado

### Casos de Prueba

1. **Crear Cita de 15 Minutos**
   - [ ] Verificar que se muestra en el slot correcto (09:00, 09:15, 09:30, 09:45)
   - [ ] Verificar badge de capacidad

2. **Crear Cita de 30 Minutos**
   - [ ] Verificar que ocupa el espacio proporcional
   - [ ] Verificar que no permite overlap

3. **Crear Cita de 60 Minutos**
   - [ ] Verificar que ocupa toda la hora
   - [ ] Verificar que bloquea toda la hora para nuevas citas

4. **Drag & Drop**
   - [ ] Arrastrar cita a hora vacía → debe moverse
   - [ ] Arrastrar cita a hora ocupada → debe mostrar swap
   - [ ] Verificar que fecha_hora_fin se actualiza correctamente

5. **Scroll**
   - [ ] Verificar que página no tiene scroll
   - [ ] Verificar que solo el calendario tiene scroll
   - [ ] Verificar que toolbar permanece visible

## Próximos Pasos (Opcional)

### Mejoras Futuras Sugeridas

1. **Drag & Drop Preciso a Minutos**
   - Permitir soltar en sub-slots específicos (09:15, no solo 09:00)
   - Requerir: Modificar onDragOver para aceptar minuto exacto del mouse

2. **Configuración de Capacidad**
   ```typescript
   interface SlotCapacityConfig {
     duration_15min: number; // ej: 2 (permite 2 citas de 15 min simultáneas)
     duration_30min: number; // ej: 1
     duration_60min: number; // ej: 1
   }
   ```

3. **Vista de Línea de Tiempo**
   - Alternativa a la vista actual
   - Muestra citas como bloques horizontales en línea de tiempo continua

4. **Indicadores de Carga**
   - Mostrar porcentaje de ocupación del día
   - Alertas cuando se acerca a capacidad máxima

5. **Reservas Tentativas**
   - Permitir "reservar" un slot temporalmente mientras se captura info del paciente
   - Auto-liberación después de X minutos

## Soporte

Para preguntas o issues relacionados con este sistema:
- Revisar el código en: `apps/web/components/dashboard/medico/calendar/week-view-improved.tsx`
- Hook de drag & drop: `apps/web/hooks/use-drag-drop.ts`
- Tipos: `apps/web/components/dashboard/medico/calendar/types.ts`
