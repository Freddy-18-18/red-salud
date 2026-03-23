# Sistema de Experiencia por Especialidad

## Arquitectura Escalable para 132+ Especialidades Médicas

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Guía de Implementación](#guía-de-implementación)
4. [Ejemplos de Especialidades](#ejemplos-de-especialidades)
5. [Migración desde el Sistema Antiguo](#migración-desde-el-sistema-antiguo)

---

## Visión General

El sistema de especialidades permite que Red-Salud proporcione experiencias de dashboard personalizadas según la especialidad del médico. Originalmente diseñado solo para odontología, el nuevo sistema escala para soportar 132+ especialidades médicas.

### Características Clave

- **Detección Automática**: Identifica la especialidad desde el perfil del usuario (SACS, nombre de especialidad, sub-especialidades)
- **Modularidad**: Cada especialidad define sus propios módulos, widgets y KPIs
- **Carga Dinámica**: Los componentes se cargan bajo demanda para optimizar el rendimiento
- **Extensible**: Fácil agregar nuevas especialidades sin modificar el código central

---

## Arquitectura

### Estructura de Directorios

```
src/lib/specialties/
├── core/                      # Núcleo del sistema
│   ├── types.ts              # Tipos TypeScript
│   ├── registry.ts           # Registro de especialidades
│   ├── detector.ts           # Detección automática
│   └── factory.ts            # Carga dinámica de componentes
│
├── dental/                    # Configuración odontológica
│   └── config.ts
│
├── cardiology/                # Configuración cardiología
│   └── config.ts
│
├── orthopedics/              # Próximas especialidades...
│
└── index.ts                  # Export principal
```

### Tipos Principales

```typescript
// Configuración completa de una especialidad
interface SpecialtyConfig {
  id: string;                    // ID único
  name: string;                  // Nombre para mostrar
  slug: string;                  // URL-friendly
  category: SpecialtyCategory;   // Categoría amplia
  keywords: string[];            // Para detección automática
  dashboardVariant: string;      // Variante del dashboard

  modules: {
    clinical?: SpecialtyModule[];
    financial?: SpecialtyModule[];
    lab?: SpecialtyModule[];
    technology?: SpecialtyModule[];
    communication?: SpecialtyModule[];
    growth?: SpecialtyModule[];
  };

  prioritizedKpis: string[];
  kpiDefinitions?: Record<string, KpiDefinition>;
  settings?: SpecialtySettings;
  theme?: SpecialtyTheme;
}
```

---

## Guía de Implementación

### Paso 1: Agregar una Nueva Especialidad

1. **Crear el archivo de configuración**:

```typescript
// src/lib/specialties/[specialty-id]/config.ts
import type { SpecialtyConfig } from '../core/types';

export const specialtyConfig: SpecialtyConfig = {
  id: 'specialty-id',
  name: 'Nombre de Especialidad',
  slug: 'url-friendly-name',
  category: 'medical', // o 'surgical', 'dental', etc.

  keywords: ['keyword1', 'keyword2', ...],

  dashboardVariant: 'variant-name',

  modules: {
    clinical: [
      {
        key: 'module-key',
        label: 'Nombre del Módulo',
        icon: 'IconName', // Lucide icon
        route: '/dashboard/medico/specialty-id/module-path',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
      },
      // ... más módulos
    ],
    // ... más grupos
  },

  prioritizedKpis: ['kpi1', 'kpi2', ...],
};
```

2. **Registrar en el sistema**:

```typescript
// src/lib/specialties/core/registry.ts
import { specialtyConfig } from '../specialty-id/config';

function initializeRegistry(): void {
  // ...
  registerSpecialty(specialtyConfig);
}
```

3. **Crear los componentes del dashboard**:

```
src/components/dashboard/medico/specialty-id/
├── specialty-id-dashboard.tsx     # Dashboard principal
├── module-path/                    # Páginas de módulos
│   └── page.tsx
└── widgets/                        # Widgets del dashboard
    ├── widget1.tsx
    └── widget2.tsx
```

### Paso 2: Usar en un Componente

```typescript
import { getSpecialtyExperienceConfig } from '@/lib/specialties';
import { useSpecialtyMenuGroups } from '@/hooks/dashboard/use-specialty-menu-groups';

function DoctorDashboard({ profile }) {
  const { menuGroups, specialtyConfig } = useSpecialtyMenuGroups({
    userRole: 'medico',
    specialtyContext: {
      specialtyName: profile?.specialty?.name,
      subSpecialties: profile?.subespecialidades,
      sacsEspecialidad: profile?.sacs_especialidad,
    },
  });

  // Renderizar basado en specialtyConfig
}
```

---

## Ejemplos de Especialidades

### Odontología (Ya Implementado)

- **15 módulos** organizados en 6 grupos
- **Widgets**: Periodontograma, Morning Huddle, AI Imaging
- **KPIs**: Case acceptance, No-show rate, RCM metrics

### Cardiología (Ejemplo Implementado)

- **11 módulos** organizados en 5 grupos
- **Widgets**: Patient status, ECG queue, Critical alerts
- **KPIs**: Patient throughput, ECG turnaround, Echo utilization

### Próximas Especialidades Prioritarias

1. **Medicina Familiar** - 10 módulos
2. **Pediatría** - 12 módulos
3. **Ortopedia** - 14 módulos
4. **Ginecología** - 11 módulos
5. **Medicina Interna** - 13 módulos

---

## Migración desde el Sistema Antiguo

### Cambios en la API

| Antiguo | Nuevo |
|---------|-------|
| `getSpecialtyExperienceConfig({ specialtyName })` | `getSpecialtyExperienceConfig({ specialtyName, subSpecialties, sacsEspecialidad })` |
| `isOdontologySpecialty(name)` | `isSpecialtyMatch({ specialtyName: name }, 'dental')` |
| `ODONTOLOGY_MODULES` constante | `dentalConfig.modules` |

### Pasos de Migración

1. **Reemplazar imports**:

```typescript
// Antiguo
import { getSpecialtyExperienceConfig, isOdontologySpecialty } from '@/lib/specialty-experience/engine';

// Nuevo
import { getSpecialtyExperienceConfig, isSpecialtyMatch } from '@/lib/specialties';
```

2. **Actualizar hooks**:

```typescript
// Antiguo
const specialtyExperience = getSpecialtyExperienceConfig({
  specialtyName: profile?.specialty?.name,
});

// Nuevo
const specialtyConfig = getSpecialtyExperienceConfig({
  specialtyName: profile?.specialty?.name,
  subSpecialties: profile?.subespecialidades,
  sacsEspecialidad: profile?.sacs_especialidad,
});
```

---

## Configuración de Módulos

### Grupos de Módulos

| Grupo | Descripción | Iconos Comunes |
|-------|-------------|----------------|
| `clinical` | Gestión clínica | Stethoscope, Heart, Activity |
| `financial` | Presupuestos, seguros | DollarSign, CreditCard, FileText |
| `lab` | Laboratorio y diagnósticos | FlaskConical, Microscope, TestTube |
| `technology` | Tecnología y equipos | Scan, Monitor, Cpu |
| `communication` | Comunicación con pacientes | MessageCircle, Video, Phone |
| `growth` | Marketing y crecimiento | TrendingUp, BarChart, Users |

### Props de Módulo

```typescript
interface SpecialtyModule {
  key: string;                    // ID único
  label: string;                  // Nombre visible
  icon: string;                   // Icono Lucide
  route: string;                  // Ruta Next.js
  group: ModuleGroup;             // Grupo al que pertenece
  order?: number;                 // Orden dentro del grupo
  enabledByDefault?: boolean;     // Si está activado por defecto
  requiredPermissions?: string[]; // Permisos necesarios
  componentPath?: string;         // Ruta para carga dinámica
}
```

---

## Sistema de Widgets

### Tipos de Widget

```typescript
type WidgetSize = 'small' | 'medium' | 'large' | 'full';

interface SpecialtyWidget {
  key: string;
  component: string;              // Ruta del componente
  size: WidgetSize;
  position?: { row: number; col: number };
  required?: boolean;
}
```

### Tamaños de Widget (Bento Grid)

- **small**: 1x1 celda (approx. 200x200px)
- **medium**: 2x1 celdas (approx. 400x200px)
- **large**: 2x2 celdas (approx. 400x400px)
- **full**: Ancho completo

---

## Definición de KPIs

### Estructura de KPI

```typescript
interface KpiDefinition {
  label: string;
  format: 'percentage' | 'currency' | 'number' | 'duration';
  goal?: number;
  direction: 'higher_is_better' | 'lower_is_better';
}
```

### KPIs Comunes por Especialidad

| Especialidad | KPIs Prioritarios |
|--------------|-------------------|
| Odontología | case_acceptance_rate, no_show_rate |
| Cardiología | ecg_turnaround_time, patient_throughput |
| Pediatría | vaccination_rate, growth_tracking_compliance |
| Ortopedia | surgery_success_rate, rehab_completion |

---

## Temas Visuales

Cada especialidad puede tener su propio tema:

```typescript
theme?: {
  primaryColor?: string;    // Color primario
  accentColor?: string;     // Color de acento
  icon?: string;            // Icono representativo
};
```

### Paletas Sugeridas

| Especialidad | Primary | Accent |
|--------------|---------|--------|
| Odontología | #0ea5e9 (sky) | #6366f1 (indigo) |
| Cardiología | #ef4444 (red) | #f97316 (orange) |
| Pediatría | #22c55e (green) | #84cc16 (lime) |
| Ortopedia | #3b82f6 (blue) | #0ea5e9 (sky) |

---

## Testing

### Probar Detección de Especialidad

```typescript
import { detectSpecialty, getDetectionInfo } from '@/lib/specialties/core/detector';

// Testear detección
const result = detectSpecialty({
  specialtyName: 'Cardiología Intervencionista',
  subSpecialties: ['Hemodinamia'],
});

console.log(result);
// { detected: true, specialtyId: 'cardiology', confidence: 'likely', ... }
```

### Forzar Especialidad (Desarrollo)

```typescript
// Agregar ?test=cardiology al URL para forzar
const searchParams = new URLSearchParams(window.location.search);
const forceSpecialty = searchParams.get('test');

const config = getSpecialtyExperienceConfig({
  forceSpecialtyId: forceSpecialty,
  // ... otros datos
});
```

---

## Roadmap de Implementación

### Fase 1: Core ✅
- [x] Tipos y interfaces
- [x] Sistema de registro
- [x] Detector de especialidades
- [x] Component factory
- [x] Odontología migrada
- [x] Cardiología de ejemplo

### Fase 2: Próximas 3 Especialidades
- [ ] Medicina Familiar
- [ ] Pediatría
- [ ] Ortopedia

### Fase 3: Top 20 Especialidades
- [ ] Ginecología
- [ ] Medicina Interna
- [ ] Dermatología
- [ ] Psiquiatría
- [ ] Neurología
- [ ] ... (14 más)

### Fase 4: Expansión a 132+
- [ ] Sub-especialidades quirúrgicas
- [ ] Especialidades diagnósticas
- [ ] Profesiones aliadas
- [ ] Sub-especialidades dentales

---

## Referencias

- [Lucide Icons](https://lucide.dev/) - Iconos usados en la UI
- [SACS Venezuela](https://www.sacs.gob.ve/) - Sistema de Atención al Ciudadano en Salud
- [SNOMED CT](https://confluence.ihtsdotools.org/) - Terminología clínica internacional
