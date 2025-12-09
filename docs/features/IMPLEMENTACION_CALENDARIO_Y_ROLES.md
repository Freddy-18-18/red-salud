# 📅 Implementación: Calendario Completo y Sistema de Roles

## ✅ Lo que se ha implementado

### 1. Sistema de Roles - Secretaria

#### Base de Datos (Migraciones)
- ✅ `20241113000001_add_secretary_role.sql`
  - Nuevo rol "secretaria" agregado al enum
  - Tabla `doctor_secretaries` para relación médico-secretaria
  - Sistema de permisos granular en JSON
  - Políticas RLS para seguridad
  - Vista `doctor_secretary_relationships` para consultas fáciles

#### Permisos de Secretaria (Configurables)
```json
{
  "can_view_agenda": true,           // Ver calendario
  "can_create_appointments": true,    // Crear citas
  "can_edit_appointments": true,      // Editar citas
  "can_cancel_appointments": true,    // Cancelar citas
  "can_view_patients": true,          // Ver lista de pacientes
  "can_register_patients": true,      // Registrar nuevos pacientes
  "can_view_medical_records": false,  // Ver expedientes médicos (NO por defecto)
  "can_send_messages": true,          // Enviar mensajes
  "can_view_statistics": false        // Ver estadísticas (NO por defecto)
}
```

### 2. Calendario Visual Completo

#### Base de Datos (Migraciones)
- ✅ `20241113000002_enhance_appointments_for_calendar.sql`
  - Campos adicionales en `appointments`:
    - `duracion_minutos`: Duración de la cita
    - `tipo_cita`: presencial, telemedicina, urgencia, seguimiento, primera_vez
    - `color`: Color para el calendario
    - `notas_internas`: Notas privadas del médico
    - `recordatorio_enviado`: Control de recordatorios
    - `es_recurrente`: Soporte para citas recurrentes
  - Tabla `doctor_availability`: Horarios de disponibilidad
  - Tabla `doctor_time_blocks`: Bloqueos de tiempo
  - Función `check_doctor_availability()`: Verificar disponibilidad
  - Función `get_appointments_by_date_range()`: Obtener citas por rango
  - Vista `calendar_appointments`: Vista optimizada para calendario

#### Componentes React
- ✅ `calendar-view-selector.tsx`: Selector de vistas (Día/Semana/Mes/Lista)
- ✅ `day-view.tsx`: Vista de día con horarios
- ✅ `week-view.tsx`: Vista de semana con grid
- ✅ `month-view.tsx`: Vista de mes tipo calendario
- ✅ `appointment-card.tsx`: Tarjeta de cita con acciones
- ✅ `calendar-main.tsx`: Componente principal que integra todo
- ✅ `types.ts`: Tipos TypeScript compartidos

#### Página Actualizada
- ✅ `app/dashboard/medico/citas/page.tsx`: Usa el nuevo calendario

---

## 🎨 Características del Calendario

### Vista Día
- Horarios de 7:00 AM a 8:00 PM (configurables)
- Citas organizadas por hora
- Click en horario vacío para crear cita
- Tarjetas compactas de citas
- Acciones rápidas: ver, mensaje, iniciar video

### Vista Semana
- 7 días visibles
- Grid de horarios
- Citas en miniatura
- Indicador de día actual
- Click en celda para crear cita

### Vista Mes
- Calendario mensual completo
- Hasta 3 citas visibles por día
- Contador de citas adicionales
- Click en día para ver detalle
- Indicador de día actual

### Vista Lista
- Lista completa de todas las citas
- Tarjetas expandidas con toda la info
- Ideal para búsqueda y revisión

---

## 🎯 Funcionalidades Implementadas

### Navegación
- ✅ Botón "Hoy" para volver a la fecha actual
- ✅ Flechas para navegar (día/semana/mes según vista)
- ✅ Selector de vista (Día/Semana/Mes/Lista)
- ✅ Rango de fechas visible en header

### Estadísticas en Tiempo Real
- ✅ Total de citas
- ✅ Citas pendientes
- ✅ Citas confirmadas
- ✅ Citas completadas

### Acciones sobre Citas
- ✅ Ver detalles de la cita
- ✅ Enviar mensaje al paciente
- ✅ Iniciar videoconsulta (si es telemedicina)
- ✅ Click en horario vacío para crear cita

### Indicadores Visuales
- ✅ Colores por tipo de cita:
  - 🔵 Azul: Presencial
  - 🟢 Verde: Telemedicina
  - 🔴 Rojo: Urgencia
  - 🟣 Morado: Seguimiento
  - 🟡 Amarillo: Primera vez
- ✅ Badges de estado (pendiente, confirmada, completada, cancelada)
- ✅ Iconos por tipo de cita

---

## 📋 Próximos Pasos (Pendientes)

### Fase 2: Gestión Avanzada
- [ ] Modal de creación rápida de citas
- [ ] Arrastrar y soltar para mover citas
- [ ] Redimensionar para cambiar duración
- [ ] Configuración de horarios de disponibilidad
- [ ] Bloqueo de horarios (almuerzo, reuniones, etc.)
- [ ] Citas recurrentes

### Fase 3: Secretaria
- [ ] Dashboard para secretarias
- [ ] Gestión de permisos desde UI
- [ ] Invitar secretaria por email
- [ ] Vista de múltiples médicos (para secretarias que trabajan con varios)

### Fase 4: Notificaciones
- [ ] Recordatorios automáticos a pacientes
- [ ] Notificaciones push
- [ ] Integración con WhatsApp/SMS
- [ ] Confirmación de citas por paciente

### Fase 5: Integraciones
- [ ] Sincronización con Google Calendar
- [ ] Sincronización con Outlook
- [ ] Exportar calendario a ICS
- [ ] Sala de espera virtual

### Fase 6: IA y Optimización
- [ ] Sugerencias de horarios óptimos
- [ ] Detección de patrones de ausencias
- [ ] Predicción de duración de consultas
- [ ] Optimización automática de agenda

---

## 🚀 Cómo Usar

### Para Médicos

#### Ver el Calendario
```typescript
// La página ya está lista en:
// /dashboard/medico/citas

// Cambiar de vista:
// Click en botones: Día, Semana, Mes, Lista

// Navegar:
// - Click en "Hoy" para volver a hoy
// - Flechas para avanzar/retroceder
```

#### Crear Cita Rápida
```typescript
// Opción 1: Click en "Nueva Cita"
// Opción 2: Click en cualquier horario vacío del calendario
// Opción 3: En vista mes, click en un día
```

#### Ver Detalles de Cita
```typescript
// Click en cualquier cita del calendario
// Se abrirá la página de detalle
```

### Para Secretarias (Próximamente)

#### Agregar Secretaria
```sql
-- El médico ejecuta:
INSERT INTO doctor_secretaries (doctor_id, secretary_id, permissions)
VALUES (
  'uuid-del-medico',
  'uuid-de-la-secretaria',
  '{
    "can_view_agenda": true,
    "can_create_appointments": true,
    "can_edit_appointments": true,
    "can_cancel_appointments": true,
    "can_view_patients": true,
    "can_register_patients": true,
    "can_view_medical_records": false,
    "can_send_messages": true,
    "can_view_statistics": false
  }'::jsonb
);
```

#### Verificar Permisos
```typescript
// En el código:
const { data } = await supabase
  .from('doctor_secretaries')
  .select('permissions')
  .eq('doctor_id', doctorId)
  .eq('secretary_id', userId)
  .eq('status', 'active')
  .single();

if (data?.permissions.can_create_appointments) {
  // Permitir crear citas
}
```

---

## 🔧 Configuración

### Horarios de Atención
```sql
-- Configurar horarios del médico
INSERT INTO doctor_availability (doctor_id, dia_semana, hora_inicio, hora_fin)
VALUES
  ('uuid-del-medico', 1, '08:00', '12:00'), -- Lunes mañana
  ('uuid-del-medico', 1, '14:00', '18:00'), -- Lunes tarde
  ('uuid-del-medico', 2, '08:00', '12:00'), -- Martes mañana
  -- etc...
```

### Bloquear Horarios
```sql
-- Bloquear almuerzo
INSERT INTO doctor_time_blocks (doctor_id, fecha_inicio, fecha_fin, motivo, tipo)
VALUES (
  'uuid-del-medico',
  '2025-11-13 13:00:00',
  '2025-11-13 14:00:00',
  'Almuerzo',
  'almuerzo'
);

-- Bloquear vacaciones
INSERT INTO doctor_time_blocks (doctor_id, fecha_inicio, fecha_fin, motivo, tipo)
VALUES (
  'uuid-del-medico',
  '2025-12-20 00:00:00',
  '2025-12-31 23:59:59',
  'Vacaciones de fin de año',
  'vacaciones'
);
```

---

## 📊 Estructura de Datos

### Appointment (Cita)
```typescript
interface CalendarAppointment {
  id: string;
  paciente_id: string;
  paciente_nombre: string;
  paciente_telefono: string | null;
  paciente_email: string | null;
  paciente_avatar: string | null;
  fecha_hora: string;              // ISO timestamp
  fecha_hora_fin: string;          // Calculado
  duracion_minutos: number;        // 30 por defecto
  motivo: string;
  status: "pendiente" | "confirmada" | "completada" | "cancelada" | "rechazada";
  tipo_cita: "presencial" | "telemedicina" | "urgencia" | "seguimiento" | "primera_vez";
  color: string;                   // Hex color
  notas_internas: string | null;
}
```

### Doctor-Secretary Relationship
```typescript
interface DoctorSecretary {
  id: string;
  doctor_id: string;
  secretary_id: string;
  permissions: {
    can_view_agenda: boolean;
    can_create_appointments: boolean;
    can_edit_appointments: boolean;
    can_cancel_appointments: boolean;
    can_view_patients: boolean;
    can_register_patients: boolean;
    can_view_medical_records: boolean;
    can_send_messages: boolean;
    can_view_statistics: boolean;
  };
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
}
```

---

## 🎨 Personalización

### Cambiar Colores de Tipos de Cita
```typescript
// En: components/dashboard/medico/calendar/types.ts
export const APPOINTMENT_COLORS = {
  presencial: "#3B82F6",     // Cambiar a tu color
  telemedicina: "#10B981",
  urgencia: "#EF4444",
  seguimiento: "#8B5CF6",
  primera_vez: "#F59E0B",
};
```

### Cambiar Horarios del Calendario
```typescript
// En: components/dashboard/medico/calendar/day-view.tsx
<DayView
  startHour={7}   // Hora de inicio
  endHour={20}    // Hora de fin
  // ...
/>
```

---

## 🐛 Troubleshooting

### Las citas no aparecen
1. Verificar que `duracion_minutos` no sea null
2. Verificar que `tipo_cita` tenga un valor válido
3. Verificar que `color` tenga un valor hex válido
4. Revisar la consola del navegador

### Error de permisos
1. Verificar que RLS esté habilitado
2. Verificar que las políticas estén creadas
3. Verificar que el usuario esté autenticado

### El calendario se ve mal
1. Verificar que Tailwind CSS esté configurado
2. Verificar que los componentes de UI estén instalados
3. Limpiar caché del navegador

---

## 📚 Recursos

### Librerías Usadas
- `date-fns`: Manipulación de fechas
- `lucide-react`: Iconos
- `@/components/ui/*`: Componentes de UI (shadcn/ui)

### Archivos Clave
- `supabase/migrations/20241113000001_add_secretary_role.sql`
- `supabase/migrations/20241113000002_enhance_appointments_for_calendar.sql`
- `components/dashboard/medico/calendar/*`
- `app/dashboard/medico/citas/page.tsx`

---

## ✨ Conclusión

Hemos implementado:
1. ✅ Sistema completo de roles para secretarias
2. ✅ Calendario visual con 4 vistas (Día/Semana/Mes/Lista)
3. ✅ Gestión de disponibilidad y bloqueos
4. ✅ Indicadores visuales y estadísticas
5. ✅ Acciones rápidas sobre citas
6. ✅ Base de datos optimizada para calendario

**Próximo paso:** Implementar el modal de creación rápida de citas y la gestión de disponibilidad desde la UI.

¿Quieres que continuemos con alguna de las fases pendientes?
