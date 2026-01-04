# 🏗️ Arquitectura del Sistema

## Visión General

Red-Salud es un SaaS médico multi-tenant con arquitectura basada en roles. Cada tipo de usuario tiene su propio dashboard y funcionalidades específicas.

```mermaid
graph TB
    subgraph "Frontend (Next.js 16)"
        A[App Router] --> B[Pages]
        A --> C[API Routes]
        B --> D[Dashboard Médico]
        B --> E[Dashboard Paciente]
        B --> F[Dashboard Clínica]
        B --> G[Páginas Públicas]
    end
    
    subgraph "Backend (Supabase)"
        H[(PostgreSQL)] --> I[Auth]
        H --> J[Storage]
        H --> K[Realtime]
    end
    
    C --> H
    D --> C
    E --> C
    F --> C
```

## Estructura de Carpetas

### `/app` - Rutas (Next.js App Router)

| Carpeta | Descripción |
|---------|-------------|
| `(auth)/` | Login, registro, recuperación de contraseña |
| `(public)/` | Landing, servicios, precios, blog |
| `api/` | API routes para backend |
| `dashboard/` | Dashboards por rol |

### `/components` - Componentes React

| Carpeta | Descripción |
|---------|-------------|
| `ui/` | shadcn/ui (Button, Dialog, Card, etc.) |
| `dashboard/` | Componentes específicos de dashboards |
| `sections/` | Secciones de páginas públicas |
| `auth/` | Formularios y componentes de auth |
| `chatbot/` | Chatbot AI integrado |

### `/lib` - Servicios y Utilidades

| Carpeta | Descripción |
|---------|-------------|
| `supabase/` | Cliente, auth, services |
| `security/` | SessionManager, validaciones |
| `i18n/` | Traducciones |
| `constants/` | Configuraciones globales |

### `/hooks` - Custom Hooks

Hooks organizados por feature: `use-appointments`, `use-telemedicine`, `use-laboratory`, etc.

## Roles del Sistema

```mermaid
graph LR
    A[Usuario] --> B{Tipo}
    B --> C[Paciente]
    B --> D[Médico]
    B --> E[Clínica]
    B --> F[Secretaria]
    B --> G[Laboratorio]
    B --> H[Farmacia]
    B --> I[Ambulancia]
    B --> J[Seguro]
    B --> K[Admin]
```

Cada rol tiene:
- Dashboard personalizado en `/dashboard/{rol}/`
- Permisos específicos en Supabase RLS
- Componentes y features exclusivos

## Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant A as App
    participant S as Supabase Auth
    participant D as Dashboard
    
    U->>A: Login (email o Google)
    A->>S: signInWithPassword / signInWithOAuth
    S-->>A: Session + User
    A->>A: SessionManager.initialize()
    A->>D: Redirect según rol
```

### Componentes de Auth

- `SessionManager` (`lib/security/session-manager.ts`) - Gestión de sesiones
- `useSessionValidation` - Validación automática
- `SessionTimer` - Indicador visual de tiempo restante

## Decisiones de Arquitectura

### 1. App Router vs Pages Router
- **Decisión:** App Router (Next.js 13+)
- **Razón:** Server Components, layouts anidados, streaming

### 2. Supabase como Backend
- **Decisión:** Supabase (no backend custom)
- **Razón:** Auth integrado, RLS, realtime, storage sin config

### 3. shadcn/ui
- **Decisión:** shadcn/ui sobre otros UI kits
- **Razón:** Componentes copiables, full control, Tailwind nativo

### 4. Estado Global
- **Decisión:** Redux Toolkit + React Query
- **Razón:** Redux para UI state, React Query para server state

## Patrones Clave

### Service Pattern (lib/supabase/services/)
Cada entidad tiene su servicio que encapsula queries a Supabase.

```typescript
// lib/supabase/services/appointments-service.ts
export const appointmentsService = {
  getAll: async () => { /* ... */ },
  create: async (data) => { /* ... */ },
  update: async (id, data) => { /* ... */ },
}
```

### Hook Pattern (hooks/)
Cada feature tiene su hook que maneja estado y lógica.

```typescript
// hooks/use-appointments.ts
export function useAppointments() {
  const { data, isLoading } = useQuery(['appointments'], /* ... */)
  return { appointments: data, isLoading }
}
```
