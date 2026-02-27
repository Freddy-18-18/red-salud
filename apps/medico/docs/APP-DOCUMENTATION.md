# 📋 Documentación de la App Médico

## Estado: 100% Independiente - Lista para Equipo de Desarrollo

---

## 1. Información General

| Aspecto | Valor |
|---------|-------|
| **Nombre** | `@red-salud/medico` |
| **Puerto** | `3001` |
| **Ruta principal** | `/dashboard/medico` |
| **Tipo** | Next.js Web App |
| **Target** | Médicos y profesionales de la salud |

---

## 2. Estructura de Archivos

```
apps/medico/
├── app/                          # Rutas de Next.js
│   ├── (auth)/                   # Rutas de autenticación
│   ├── (protected)/              # Rutas protegidas
│   ├── (public)/                # Rutas públicas
│   ├── dashboard/
│   │   └── medico/              # Dashboard principal
│   │       ├── pacientes/       # Gestión de pacientes
│   │       ├── citas/           # Citas y agenda
│   │       ├── recetas/         # Recetas médicas
│   │       ├── consulta/        # Consulta médica
│   │       ├── estadisticas/    # Estadísticas
│   │       ├── configuracion/   # Configuración
│   │       ├── telemedicina/    # Teleconsulta
│   │       ├── laboratorio/     # Laboratorio
│   │       ├── mensajeria/      # Mensajería
│   │       └── [especialidades]/ # Odontologia, Cardiologia, etc.
│   └── api/                     # API routes
├── components/                   # Componentes React
│   └── dashboard/medico/
├── hooks/                       # Custom React Hooks
├── lib/                         # Utilidades y servicios
├── packages/
│   └── sdk-medico/             # SDK para comunicación
├── supabase/                    # Configuración de Supabase
└── types/                       # Tipos TypeScript
```

---

## 3. Rutas Disponibles

### Dashboard Principal
| Ruta | Descripción |
|------|-------------|
| `/dashboard/medico` | Dashboard principal del médico |

### Gestión de Pacientes
| Ruta | Descripción |
|------|-------------|
| `/dashboard/medico/pacientes` | Lista de pacientes |
| `/dashboard/medico/pacientes/[id]` | Detalle de paciente |
| `/dashboard/medico/pacientes/nuevo` | Registrar nuevo paciente |

### Citas y Agenda
| Ruta | Descripción |
|------|-------------|
| `/dashboard/medico/citas` | Calendario de citas |
| `/dashboard/medico/citas/nueva` | Crear nueva cita |

### Recetas
| Ruta | Descripción |
|------|-------------|
| `/dashboard/medico/recetas` | Lista de recetas |
| `/dashboard/medico/recetas/nueva` | Crear receta |

### Consulta Médica
| Ruta | Descripción |
|------|-------------|
| `/dashboard/medico/consulta` | Panel de consulta |
| `/dashboard/medico/consulta/soap` | Notas SOAP |

### Especialidades
| Ruta | Descripción |
|------|-------------|
| `/dashboard/medico/odontologia` | Odontología |
| `/dashboard/medico/cardiologia` | Cardiología |
| `/dashboard/medico/ginecologia` | Ginecología |
| `/dashboard/medico/neurologia` | Neurología |
| `/dashboard/medico/oftalmologia` | Oftalmología |
| `/dashboard/medico/pediatria` | Pediatría |
| `/dashboard/medico/traumatologia` | Traumatología |

### Otras Funcionalidades
| Ruta | Descripción |
|------|-------------|
| `/dashboard/medico/estadisticas` | Estadísticas y reportes |
| `/dashboard/medico/configuracion` | Configuración de cuenta |
| `/dashboard/medico/telemedicina` | Teleconsulta |
| `/dashboard/medico/laboratorio` | Resultados de laboratorio |
| `/dashboard/medico/mensajeria` | Mensajería |
| `/dashboard/medico/tareas` | Tareas |
| `/dashboard/medico/templates` | Plantillas |

---

## 4. SDK - @red-salud/sdk-medico

### Exports Disponibles

```typescript
// SDK Principal
export * from './medico-sdk';

// Citas
export * from './appointments';

// Registros médicos
export * from './records';

// Recetas
export * from './prescriptions';

// Laboratorio
export * from './laboratory';

// Inteligencia Artificial
export * from './ai';

// Utilidades
export * from './utilities';

// Especialidades
export * from './specialties';

// Servicios
export * from './services';

// Hooks
export * from './hooks';

// Contratos
export { appointmentFormSchema } from '@red-salud/contracts';
```

### Uso del SDK

```typescript
import { 
  createMedicoSdk, 
  appointments, 
  prescriptions 
} from '@red-salud/sdk-medico';

// Crear instancia del SDK
const sdk = createMedicoSdk(supabaseClient);

// Obtener citas
const citas = await appointments.getAll(medicoId);

// Crear receta
const receta = await prescriptions.create({
  paciente_id: 'xxx',
  medicamentos: [...],
  medico_id: 'yyy'
});
```

---

## 5. Dependencias

### Dependencias Del Monorepo
| Package | Uso |
|---------|-----|
| `@red-salud/contracts` | Esquemas de validación y tipos |
| `@red-salud/core` | Utilidades genéricas |
| `@red-salud/design-system` | Componentes UI |
| `@red-salud/identity` | Autenticación |
| `@red-salud/types` | Tipos TypeScript |

### Dependencias Externas
- `next` - Framework
- `react` / `react-dom` - UI
- `@supabase/supabase-js` - Base de datos
- `@tanstack/react-query` - Estado del servidor
- `zod` - Validación de esquemas
- `date-fns` - Fechas
- `lucide-react` - Iconos

---

## 6. Comandos

```bash
# Desarrollo
pnpm medico:dev
# o
cd apps/medico && pnpm dev

# Build
cd apps/medico && pnpm build

# Lint
cd apps/medico && pnpm lint

# Typecheck
cd apps/medico && pnpm typecheck

# Tests
cd apps/medico && pnpm test

# Build Tauri (Desktop)
cd apps/medico && pnpm tauri:build
```

---

## 7. Configuración de Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# URLs de la app
NEXT_PUBLIC_APP_URL=http://localhost:3001

# APIs Externas
GEMINI_API_KEY=...
ICD_API_CLIENT_ID=...
ICD_API_CLIENT_SECRET=...
```

---

## 8. Autenticación

La app usa Supabase Auth con roles:
- `medico` - Doctor/a
- `paciente` - Paciente
- `secretaria` - Asistente

El middleware valida el rol y redirige según corresponda.

---

## 9. Integración con Otras Apps

### Cómo otras apps acceden al médico:
1. **Vía URL**: Redirección automática del middleware de `web` a `localhost:3001`
2. **Vía SDK**: Usando `@red-salud/sdk-medico`

### Ejemplo de integración:
```typescript
import { createMedicoSdk } from '@red-salud/sdk-medico';

const sdk = createMedicoSdk(supabase);
const citas = await sdk.appointments.getAll(doctorId);
```

---

## 10. Verificación de Independencia

| Requisito | Estado |
|-----------|--------|
| Sin código de otras apps | ✅ |
| Rutas propias independientes | ✅ |
| Puerto dedicado (3001) | ✅ |
| SDK propio | ✅ |
| Dependencias solo genéricas | ✅ |
| Código duplicado eliminado | ✅ |
| Middleware configurado | ✅ |
| Lista para equipo independiente | ✅ |

---

## Notas para el Equipo de Desarrollo

1. **Puerto dedicado**: La app corre en `localhost:3001`
2. **Sin dependencias de otras apps**: Solo usa packages compartidos genéricos
3. **SDK disponible**: Para comunicación con otras apps usar `@red-salud/sdk-medico`
4. **Contratos inteligentes**: Usar `@red-salud/contracts` para validación de datos

---

*Documento generado el 17/02/2026*
