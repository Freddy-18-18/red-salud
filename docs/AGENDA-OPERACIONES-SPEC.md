# Agenda & Operaciones - Especificación Técnica

## 📐 Arquitectura de Layout

### Estructura de Altura Sin Scroll Principal

```
┌────────────────────────────────────────────────────────────────┐
│ Dashboard Header (48px - fixed)                                │ Fuera del control de citas
├────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Page Header (64px - flex-none)                             │ │
│ │ ┌────────────────────────────┬─────────────────────────┐   │ │
│ │ │ Title & Description         │ Office Selector         │   │ │
│ │ └────────────────────────────┴─────────────────────────┘   │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ Tabs Bar (40px - flex-none)                                │ │
│ │ [Agenda] [Operaciones] [Lista de Espera]                   │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ Tab Content Container (flex-1 min-h-0)                     │ │
│ │ ┌────────────────────────────────────────────────────────┐ │ │
│ │ │ <ScrollArea className="h-full">                        │ │ │
│ │ │   Content with internal scroll                         │ │ │
│ │ │   (overflow-y-auto, scrollbar-thin)                    │ │ │
│ │ │                                                          │ │ │
│ │ │   Altura: calc(100vh - 152px)                          │ │ │
│ │ │   - 48px header                                         │ │ │
│ │ │   - 64px page header                                    │ │ │
│ │ │   - 40px tabs bar                                       │ │ │
│ │ └────────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Clases de Tailwind Clave

```tsx
// Contenedor principal
<div className="flex flex-col h-full">
  
  // Header fijo
  <div className="flex-none border-b bg-background px-6 py-4">
    {/* 64px de altura */}
  </div>
  
  // Tabs con contenido flexible
  <Tabs className="flex flex-col flex-1 min-h-0">
    
    // Tabs list fija
    <div className="flex-none border-b bg-muted/30 px-6">
      <TabsList className="h-10"> {/* 40px */}
    </div>
    
    // Content scrollable
    <div className="flex-1 min-h-0">
      <TabsContent className="h-full m-0 overflow-hidden">
        <ScrollArea className="h-full">
          {/* Contenido scrollable */}
        </ScrollArea>
      </TabsContent>
    </div>
  </Tabs>
</div>
```

**Conceptos Clave:**
- `flex-1`: Toma todo el espacio disponible
- `min-h-0`: Permite que los flex items se encojan por debajo de su tamaño mínimo
- `overflow-hidden`: Previene scroll en el contenedor padre
- `h-full`: Los hijos toman 100% de altura del padre

---

## 🦷 Funcionalidades Específicas de Odontología

### Tab 1: Agenda (Calendario)

#### Tipos de Cita Específicos
```typescript
const DENTAL_APPOINTMENT_TYPES = {
  cleaning: { 
    label: "Limpieza/Profilaxis", 
    color: "#3B82F6",
    defaultDuration: 45,
    materials: ["Pasta profiláctica", "Flúor gel"],
  },
  endodontics: { 
    label: "Endodoncia", 
    color: "#8B5CF6",
    defaultDuration: 90,
    materials: ["Limas", "Gutapercha", "Cemento"],
    requiresAssistant: true,
  },
  periodontics: { 
    label: "Periodoncia", 
    color: "#10B981",
    defaultDuration: 60,
    materials: ["Curetas", "Sutura"],
  },
  surgery: { 
    label: "Cirugía/Extracción", 
    color: "#EF4444",
    defaultDuration: 30,
    requiresPreMedication: true,
  },
  orthodontics: { 
    label: "Ortodoncia", 
    color: "#F59E0B",
    defaultDuration: 30,
  },
  aesthetic: { 
    label: "Estética", 
    color: "#EC4899",
    defaultDuration: 60,
  },
};
```

#### Campos Adicionales por Cita
```typescript
interface DentalAppointmentExtension {
  // Recursos
  chair_id?: string;              // Silla asignada
  hygienist_id?: string;         // Higienista asignado
  assistant_id?: string;         // Asistente asignado
  
  // Clínicos
  procedure_code?: string;       // Código del procedimiento
  tooth_number?: string[];       // Dientes involucrados
  requires_anesthesia?: boolean;
  anesthesia_type?: "lidocaína" | "articaína" | "mepivacaína";
  patient_allergies?: string[];  // Alertas de alergias
  
  // Materiales
  materials_needed?: string[];   // Lista de materiales requeridos
  materials_prepared?: boolean;  // Si ya están listos
  
  // Lab
  lab_work?: {
    type: "corona" | "puente" | "prótesis" | "férula";
    lab_name: string;
    expected_date: string;
    received: boolean;
  };
  
  // Financiero
  estimated_cost?: number;
  treatment_plan_id?: string;
}
```

#### Vista de Calendario Mejorada

**Indicadores Visuales:**
- 🔴 Punto rojo: Requiere pre-medicación
- ⚠️ Triángulo: Alertas de alergias
- 🔬 Icono lab: Esperando trabajo de laboratorio
- ✓ Checkmark verde: Materiales preparados
- 👥 Icono personas: Requiere asistente

**Tooltip Expandido:**
```
María García - 10:00 AM
─────────────────────────────────
Endodoncia Molar #14
Duración: 90 min
Silla: 2 | Higienista: Ana Rodríguez

⚠️ Alergia a lidocaína - Usar articaína
🔬 Corona pendiente del laboratorio
✓ Materiales preparados

Costo: $250 | Confirmada ✓
```

---

### Tab 2: Operaciones (Morning Huddle)

#### Secciones Principales

**1. Dashboard del Día**
```typescript
interface DailyDashboard {
  // Métricas generales
  totalAppointments: number;
  confirmedAppointments: number;
  urgentCases: number;
  
  // Financiero
  estimatedRevenue: number;      // Ingresos proyectados del día
  dailyGoal: number;             // Meta diaria
  weeklyProjection: number;      // Proyección semanal
  
  // Operaciones
  occupancyRate: number;         // % de slots ocupados
  pendingMaterials: number;      // Materiales sin preparar
  labWorkPending: number;        // Trabajos de lab pendientes
  
  // Confirmaciones
  unconfirmedCount: number;
  noShowRisk: number;            // Citas con alto riesgo de no-show
}
```

**2. Estado de Sillas en Tiempo Real**
```typescript
interface ChairStatus {
  id: string;
  name: string;
  location?: string;              // "Sala 1", "Consultorio A"
  
  status: "available" | "occupied" | "cleaning" | "maintenance";
  
  // Si está ocupada
  currentPatient?: {
    name: string;
    procedure: string;
    startTime: string;
    estimatedEnd: string;
    doctor: string;
  };
  
  // Si está disponible
  nextAppointment?: {
    patientName: string;
    time: string;
    procedure: string;
  };
  
  // Si está en limpieza
  cleaningProgress?: number;      // 0-100
  estimatedReady?: string;        // "10 min"
}
```

**3. Sistema de Alertas Prioritario**
```typescript
interface DentalAlert {
  id: string;
  priority: "urgent" | "high" | "normal";
  category: "patient" | "lab" | "material" | "confirmation" | "insurance";
  
  // Alertas de Paciente
  patientAlert?: {
    patientName: string;
    appointmentTime: string;
    alertType: "allergy" | "pain" | "special_needs" | "first_visit";
    message: string;
    actionRequired?: string;      // "Llamar antes de 9am"
  };
  
  // Alertas de Laboratorio
  labAlert?: {
    patientName: string;
    workType: string;
    status: "ready" | "delayed" | "needs_revision";
    expectedDate: string;
  };
  
  // Alertas de Materiales
  materialAlert?: {
    item: string;
    quantity: number;
    status: "low_stock" | "out_of_stock" | "expired";
    urgency: "immediate" | "today" | "this_week";
  };
}
```

**4. Checklist del Equipo**
```typescript
interface TeamChecklist {
  dailyTasks: ChecklistItem[];
  weeklyTasks: ChecklistItem[];
  monthlyTaks: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  title: string;
  category: "sterilization" | "materials" | "equipment" | "admin";
  completed: boolean;
  assignedTo?: string;          // Nombre del team member
  dueTime?: string;             // "Before 9am"
  recurring: boolean;           // Tarea diaria/semanal
  dependencies?: string[];      // IDs de tareas que deben completarse primero
}

// Ejemplos de tareas diarias odontológicas:
const DAILY_CHECKLIST = [
  { title: "Autoclave ejecutado y verificado", category: "sterilization" },
  { title: "Instrumentos esterilizados para primera cita", category: "sterilization" },
  { title: "Materiales de composite verificados", category: "materials" },
  { title: "Anestésicos verificados y en stock", category: "materials" },
  { title: "Rayos X calibrados", category: "equipment" },
  { title: "Aspiradores funcionando", category: "equipment" },
  { title: "Confirmaciones de citas realizadas", category: "admin" },
  { title: "Trabajos de laboratorio revisados", category: "admin" },
];
```

**5. Objetivos de Producción**
```typescript
interface ProductionGoals {
  // Diario
  daily: {
    goal: number;
    current: number;
    remaining: number;
    remainingAppointments: number;
    projectedTotal: number;
  };
  
  // Semanal
  weekly: {
    goal: number;
    current: number;
    averagePerDay: number;
    projectedTotal: number;
    onTrack: boolean;
  };
  
  // Mensual
  monthly: {
    goal: number;
    current: number;
    daysRemaining: number;
    requiredDailyAverage: number;
  };
  
  // Breakdown por tipo de procedimiento
  byProcedure: {
    [procedureType: string]: {
      count: number;
      revenue: number;
    };
  };
}
```

---

### Tab 3: Lista de Espera (Smart Waitlist)

#### Algoritmo de Matching Inteligente

```typescript
interface SmartWaitlistEntry {
  // Info básica (ya existente)
  patientId: string;
  patientName: string;
  patientPhone: string;
  
  // Odontología específico
  procedureType: string;          // "Endodoncia", "Limpieza", etc.
  procedureCode?: string;         // Código del procedimiento
  toothNumber?: string[];         // Dientes específicos
  estimatedDuration: number;
  estimatedCost: number;
  
  // Prioridad médica
  priority: "urgent" | "high" | "normal" | "low";
  urgencyReason?: "pain" | "infection" | "broken_tooth" | "recall";
  painLevel?: 1 | 2 | 3 | 4 | 5;
  
  // Preferencias
  preferredDays: string[];
  preferredTimeStart: string;
  preferredTimeEnd: string;
  preferredDoctor?: string;
  preferredHygienist?: string;
  
  // Tiempo y seguimiento
  createdAt: string;
  lastContactedAt?: string;
  contactAttempts: number;
  lastVisitDate?: string;         // Para recalls
  daysWaiting: number;
  
  // Estado
  status: "waiting" | "notified" | "confirmed" | "expired" | "cancelled";
  notifiedAt?: string;
  willingness: "high" | "medium" | "low";  // Qué tan flexible es el paciente
}

interface CancelledSlot {
  date: string;
  time: string;
  duration: number;
  procedureType: string;          // Tipo de procedimiento que se canceló
  chairId: string;
  doctorId: string;
}

// Algoritmo de matching
function findBestMatches(
  cancelledSlot: CancelledSlot,
  waitlist: SmartWaitlistEntry[]
): SmartWaitlistEntry[] {
  
  return waitlist
    .filter(entry => entry.status === "waiting")
    .map(entry => ({
      entry,
      score: calculateMatchScore(entry, cancelledSlot)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(m => m.entry);
}

function calculateMatchScore(
  entry: SmartWaitlistEntry,
  slot: CancelledSlot
): number {
  let score = 0;
  
  // 1. Urgencia médica (peso: 40)
  if (entry.priority === "urgent") score += 40;
  else if (entry.priority === "high") score += 30;
  else if (entry.priority === "normal") score += 20;
  else score += 10;
  
  // 2. Coincidencia de procedimiento (peso: 25)
  if (entry.procedureType === slot.procedureType) {
    score += 25;  // Match perfecto
  } else if (isSimilarProcedure(entry.procedureType, slot.procedureType)) {
    score += 15;  // Procedimientos similares
  }
  
  // 3. Duración compatible (peso: 15)
  if (entry.estimatedDuration <= slot.duration) {
    score += 15;
  } else if (entry.estimatedDuration <= slot.duration + 15) {
    score += 10;  // Ligeramente más largo
  }
  
  // 4. Preferencias de horario (peso: 10)
  const slotDay = getDayOfWeek(slot.date);
  const slotTime = slot.time;
  
  if (entry.preferredDays.includes(slotDay)) score += 5;
  if (isTimeInRange(slotTime, entry.preferredTimeStart, entry.preferredTimeEnd)) {
    score += 5;
  }
  
  // 5. Valor del procedimiento (peso: 5)
  if (entry.estimatedCost > 200) score += 5;
  else if (entry.estimatedCost > 100) score += 3;
  
  // 6. Tiempo esperando (peso: 5)
  if (entry.daysWaiting > 30) score += 5;
  else if (entry.daysWaiting > 14) score += 3;
  
  return score;
}
```

#### Notificaciones Automáticas

```typescript
interface NotificationStrategy {
  // Por SMS
  sms: {
    template: string;
    sendAt: "immediate" | "business_hours";
    maxAttempts: number;
  };
  
  // Por WhatsApp
  whatsapp: {
    template: string;
    includeCalendarLink: boolean;
  };
  
  // Por Email
  email: {
    subject: string;
    template: string;
    includeCalendarEvent: boolean;
  };
}

// Ejemplo de mensaje inteligente
function generateNotificationMessage(
  entry: SmartWaitlistEntry,
  slot: CancelledSlot
): string {
  const urgencyPrefix = entry.priority === "urgent" 
    ? "🚨 URGENTE - " 
    : "";
    
  return `${urgencyPrefix}Hola ${entry.patientName}! 

Se ha liberado un espacio para ${entry.procedureType}:
📅 ${formatDate(slot.date)}
🕐 ${slot.time}
⏱️ Duración: ${entry.estimatedDuration} min
💰 Costo: $${entry.estimatedCost}

¿Te viene bien este horario? 
Responde:
1 = SÍ, confirmar
2 = NO, esperar otro día
3 = Necesito otro horario

Clínica Dental Red-Salud`;
}
```

---

## 🔄 Plan de Implementación

### Fase 1: Restructuración Base (1-2 días)

**Objetivo:** Convertir página actual en sistema de tabs sin romper funcionalidad.

**Tareas:**
1. ✅ Crear `AppointmentsHub` component
2. ✅ Crear `OperationsTab` component con funcionalidad completa
3. ⏳ Refactorizar código actual de `page.tsx` → `AgendaTab`
4. ⏳ Refactorizar `lista-espera/page.tsx` → `WaitlistTab`
5. ⏳ Actualizar `page.tsx` para usar `AppointmentsHub`
6. ⏳ Probar layout sin scroll principal

**Archivos Modificados:**
- `apps/web/app/dashboard/medico/citas/page.tsx`
- `apps/web/app/dashboard/medico/citas/appointments-hub.tsx` (nuevo)
- `apps/web/app/dashboard/medico/citas/components/agenda-tab.tsx` (nuevo)
- `apps/web/app/dashboard/medico/citas/components/operations-tab.tsx` (nuevo)
- `apps/web/app/dashboard/medico/citas/components/waitlist-tab.tsx` (nuevo)

### Fase 2: Campos Odontológicos (2-3 días)

**Objetivo:** Agregar campos específicos de odontología a las citas.

**Tareas:**
1. Crear migración de base de datos para campos adicionales
2. Actualizar tipos TypeScript con `DentalAppointmentExtension`
3. Agregar formulario de cita con campos odontológicos
4. Actualizar vista de calendario con indicadores visuales
5. Implementar tooltips expandidos

**Nueva tabla/campos:**
```sql
-- Opción 1: Campos JSONB en appointments
ALTER TABLE appointments 
ADD COLUMN dental_data JSONB DEFAULT '{}';

-- Opción 2: Tabla relacionada
CREATE TABLE dental_appointment_details (
  appointment_id UUID PRIMARY KEY REFERENCES appointments(id),
  chair_id UUID REFERENCES dental_chairs(id),
  hygienist_id UUID REFERENCES profiles(id),
  procedure_code VARCHAR(20),
  tooth_numbers TEXT[],
  requires_anesthesia BOOLEAN DEFAULT false,
  anesthesia_type VARCHAR(50),
  materials_needed TEXT[],
  materials_prepared BOOLEAN DEFAULT false,
  estimated_cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Fase 3: Morning Huddle Real-Time (2-3 días)

**Objetivo:** Conectar Operations Tab con datos reales.

**Tareas:**
1. Crear queries para estadísticas del día
2. Implementar sistema de alertas automáticas
3. Agregar checklist persistente en base de datos
4. Integrar con citas para estado de sillas
5. Implementar actualización real-time con Supabase

**Nuevas tablas:**
```sql
CREATE TABLE team_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  office_id UUID REFERENCES offices(id),
  date DATE NOT NULL,
  task_title TEXT NOT NULL,
  category VARCHAR(50),
  completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMP,
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dental_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  office_id UUID REFERENCES offices(id),
  appointment_id UUID REFERENCES appointments(id),
  priority VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  action_required TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
```

### Fase 4: Smart Waitlist (2 días)

**Objetivo:** Implementar algoritmo de matching inteligente.

**Tareas:**
1. Agregar campos odontológicos a waitlist entries
2. Implementar función `calculateMatchScore`
3. Crear sistema de notificaciones automáticas
4. Agregar UI para revisar matches sugeridos
5. Integrar con cancelaciones de citas

### Fase 5: Adaptadores por Especialidad (1-2 días)

**Objetivo:** Hacer el sistema extensible para otras especialidades.

**Tareas:**
1. Crear sistema de adaptadores
2. Implementar `OdontologyAdapter`
3. Crear `GeneralMedicineAdapter` como fallback
4. Documentar cómo crear nuevos adaptadores

**Ejemplo de adaptador:**
```typescript
interface SpecialtyAdapter {
  name: string;
  
  // Personalización de campos
  getAppointmentTypes(): AppointmentType[];
  getExtraFields(): AppointmentField[];
  
  // Operaciones
  getDailyChecklist(): ChecklistItem[];
  getDashboardMetrics(): MetricDefinition[];
  getAlertRules(): AlertRule[];
  
  // Lista de espera
  calculateMatchScore(entry: WaitlistEntry, slot: CancelledSlot): number;
  generateNotificationMessage(entry: WaitlistEntry, slot: CancelledSlot): string;
}
```

---

## 📱 Consideraciones de UX

### Responsive Design

**Desktop (>= 1024px):**
- 3 columnas para estadísticas
- Sidebar con alertas expandido
- Grid 2x1 para sillas y alertas

**Tablet (768px - 1023px):**
- 2 columnas para estadísticas
- Grid 1x1 para sillas y alertas (stacked)

**Mobile (< 768px):**
- 1 columna para todo
- Stats en carousel
- Tabs en modo scrollable horizontal

### Performance

**Optimizaciones:**
- ✅ Scroll virtual para listas largas (waitlist)
- ✅ Lazy loading de tabs (no cargar hasta activar)
- ✅ Real-time optimizado con Supabase filters
- ✅ Memoización de componentes pesados
- ✅ Debounce en búsquedas

### Accesibilidad

**WCAG 2.1 AA:**
- ✅ Contraste de colores >= 4.5:1
- ✅ Navegación por teclado completa
- ✅ ARIA labels en todos los controles
- ✅ Focus visible en todos los elementos interactivos
- ✅ Screen reader compatible

---

## 🎨 Design Tokens

### Colores de Procedimientos Odontológicos

```css
:root {
  --dental-cleaning: #3B82F6;      /* blue-500 */
  --dental-endodontics: #8B5CF6;   /* purple-500 */
  --dental-periodontics: #10B981;  /* green-500 */
  --dental-surgery: #EF4444;       /* red-500 */
  --dental-orthodontics: #F59E0B;  /* amber-500 */
  --dental-aesthetic: #EC4899;     /* pink-500 */
}
```

### Estados de Prioridad

```css
:root {
  --priority-urgent: #EF4444;      /* red-500 */
  --priority-high: #F97316;        /* orange-500 */
  --priority-normal: #3B82F6;      /* blue-500 */
  --priority-low: #6B7280;         /* gray-500 */
}
```

---

## 📊 Métricas de Éxito

### KPIs del Sistema

**Operacionales:**
- Tiempo promedio de Morning Huddle: < 15 min
- % de checklist completado antes de primera cita: > 95%
- Tiempo de respuesta a alertas urgentes: < 5 min

**Waitlist:**
- % de slots cancelados re-ocupados: > 80%
- Tiempo promedio para llenar cancelación: < 2 horas
- % de pacientes contactados que confirman: > 50%

**Producción:**
- % de ocupación diaria: > 85%
- Varianza de ingresos diarios: < 20%
- % de citas no-show: < 5%

---

## ✅ Checklist de Implementación

### Fase 1: Base
- [x] Crear AppointmentsHub component
- [x] Crear OperationsTab con UI completa
- [ ] Refactorizar AgendaTab
- [ ] Refactorizar WaitlistTab
- [ ] Actualizar page.tsx
- [ ] Testing de layout sin scroll

### Próximos Pasos
- [ ] Campos odontológicos en DB
- [ ] Conectar datos reales a Operations
- [ ] Implementar smart matching
- [ ] Sistema de notificaciones
- [ ] Adaptadores de especialidad

