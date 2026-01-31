# 📖 Guía de Desarrollo

## Setup del Proyecto

### Requisitos
- Node.js 18+
- npm 9+
- Cuenta de Supabase

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd red-salud

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

### Variables de Entorno

```bash
# .env.local

# Supabase (obligatorio)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...

# Google Gemini (opcional - chatbot)
GEMINI_API_KEY=AIza...

# ICD-11 API (opcional - diagnósticos)
ICD_API_CLIENT_ID=xxx
ICD_API_CLIENT_SECRET=xxx
```

### Ejecutar en Desarrollo

```bash
npm run dev
# Abre http://localhost:3000
```

## Convenciones de Código

### 1. Límite de Líneas
**Máximo 400 líneas por archivo**. Si un arquivo supera este límite, dividirlo en múltiples archivos.

### 2. Principio de Responsabilidad Única
Cada archivo debe tener una sola responsabilidad:
- Un componente por archivo
- Un hook por archivo
- Un servicio por entidad

### 3. Estructura de Imports

```typescript
// 1. React y Next
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Librerías externas
import { motion } from 'framer-motion'
import { z } from 'zod'

// 3. Componentes UI (shadcn)
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. Componentes propios
import { PatientCard } from '@/components/dashboard/patients'

// 5. Hooks
import { useAppointments } from '@/hooks/use-appointments'

// 6. Servicios y utils
import { appointmentsService } from '@/lib/supabase/services'

// 7. Types
import type { Appointment } from '@/lib/supabase/types'
```

### 4. Naming Conventions

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `PatientCard.tsx` |
| Hooks | camelCase con `use-` | `use-appointments.ts` |
| Services | kebab-case | `appointments-service.ts` |
| Types | PascalCase | `Appointment`, `Patient` |
| CSS vars | kebab-case | `--primary-color` |

### 5. TypeScript Estricto

```typescript
// ❌ Evitar
const data: any = await fetch(...)

// ✅ Correcto
interface ApiResponse {
  data: Appointment[]
  error?: string
}
const data: ApiResponse = await fetch(...)
```

## Workflows Comunes

### Crear un Nuevo Componente

```bash
# 1. Crear archivo en la carpeta correspondiente
touch components/dashboard/medico/NuevoComponente.tsx

# 2. Estructura básica
```

```typescript
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'

interface NuevoComponenteProps {
  data: SomeType
  onAction?: () => void
}

export function NuevoComponente({ data, onAction }: NuevoComponenteProps) {
  const [state, setState] = useState(false)
  
  return (
    <Card>
      {/* contenido */}
    </Card>
  )
}
```

### Crear un Nuevo Hook

```typescript
// hooks/use-nueva-feature.ts
'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { nuevaFeatureService } from '@/lib/supabase/services'

export function useNuevaFeature() {
  const { data, isLoading } = useQuery({
    queryKey: ['nueva-feature'],
    queryFn: nuevaFeatureService.getAll,
  })

  const create = useMutation({
    mutationFn: nuevaFeatureService.create,
  })

  return {
    items: data ?? [],
    isLoading,
    create: create.mutate,
  }
}
```

### Crear un Nuevo Servicio

```typescript
// lib/supabase/services/nueva-feature-service.ts
import { createClient } from '@/lib/supabase/client'
import type { NuevaFeature } from '@/lib/supabase/types'

export const nuevaFeatureService = {
  async getAll(): Promise<NuevaFeature[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('nueva_feature')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(item: Partial<NuevaFeature>): Promise<NuevaFeature> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('nueva_feature')
      .insert(item)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
}
```

## Debug y Troubleshooting

### Logs de Supabase
```typescript
// Ver queries en consola
const supabase = createClient()
// Las queries se loguean automáticamente en dev
```

### Errores Comunes

| Error | Solución |
|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL is not defined` | Verificar `.env.local` |
| `RLS policy violation` | Revisar policies en Supabase |
| `Cannot read properties of undefined` | Verificar nullish coalescing |

## Git Workflow

```bash
# Feature branch
git checkout -b feature/nueva-funcionalidad

# Commits descriptivos
git commit -m "feat(dashboard): agregar filtros de pacientes"

# Push y PR
git push origin feature/nueva-funcionalidad
```

### Prefijos de Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Refactoring sin cambio de comportamiento
- `docs:` Documentación
- `style:` Formateo, sin cambio de código
- `chore:` Tareas de mantenimiento
