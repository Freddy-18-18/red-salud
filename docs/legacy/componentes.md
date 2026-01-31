# 🧩 Componentes y Hooks

## Estructura de Componentes

```
components/
├── ui/                 # shadcn/ui (43 componentes)
├── auth/               # Autenticación (8 componentes)
├── dashboard/          # Dashboard (160+ componentes)
├── sections/           # Páginas públicas (47 componentes)
├── chatbot/            # Chatbot AI
├── citas/              # Sistema de citas
├── layout/             # Header, Footer, Sidebar
└── providers/          # Context providers
```

## Componentes UI (shadcn/ui)

Ubicación: `components/ui/`

| Componente | Uso |
|------------|-----|
| `Button` | Botones con variantes (default, destructive, outline, ghost) |
| `Card` | Contenedores con CardHeader, CardContent, CardFooter |
| `Dialog` | Modales |
| `DropdownMenu` | Menús desplegables |
| `Select` | Selectores |
| `Input` | Campos de texto |
| `Tabs` | Navegación por pestañas |
| `Table` | Tablas de datos |
| `Toast` (Sonner) | Notificaciones |
| `Tooltip` | Tooltips informativos |

### Uso

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Abrir Modal</Button>
          </DialogTrigger>
          <DialogContent>
            Contenido del modal
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
```

## Componentes de Dashboard

### Por Rol

| Rol | Ubicación | Componentes Clave |
|-----|-----------|-------------------|
| Médico | `dashboard/medico/` | AgendaView, PatientList, ConsultaForm |
| Paciente | `dashboard/paciente/` | AppointmentsList, HealthMetrics, MedicalHistory |
| Clínica | `dashboard/clinica/` | OperationsView, StaffManager, Analytics |
| Secretaria | `dashboard/secretaria/` | AppointmentScheduler, PatientRegistry |

### Componentes Comunes

| Componente | Descripción |
|------------|-------------|
| `DashboardLayout` | Layout base con sidebar y header |
| `Sidebar` | Navegación lateral adaptable por rol |
| `StatsCard` | Tarjeta de métricas con ícono |
| `DataTable` | Tabla con sorting, filtering, pagination |
| `PatientSelector` | Buscador/selector de pacientes |

## Custom Hooks

Ubicación: `hooks/`

### Hooks de Features

| Hook | Descripción |
|------|-------------|
| `useAppointments` | Gestión de citas (CRUD, filtros) |
| `usePatientProfile` | Perfil del paciente actual |
| `useDoctorProfile` | Perfil del médico actual |
| `useLaboratory` | Resultados de laboratorio |
| `useMedications` | Recetas y medicamentos |
| `useMessaging` | Chat en tiempo real |
| `useTelemedicine` | Videollamadas |
| `useHealthMetrics` | Métricas de salud del paciente |

### Hooks de Auth

| Hook | Descripción |
|------|-------------|
| `useAuth` | Estado de autenticación |
| `useSessionValidation` | Validación automática de sesión |
| `useOAuthSignIn` | Login con Google |

### Hooks de UI

| Hook | Descripción |
|------|-------------|
| `useKeyboardShortcuts` | Atajos de teclado |
| `useDashboardWidgets` | Widgets del dashboard (drag & drop) |
| `useTourGuide` | Tour interactivo |
| `useThemeColor` | Tema y colores |

### Ejemplo de Uso

```tsx
'use client'

import { useAppointments } from '@/hooks/use-appointments'
import { usePatientProfile } from '@/hooks/use-patient-profile'

function PatientDashboard() {
  const { patient, isLoading: loadingPatient } = usePatientProfile()
  const { appointments, isLoading: loadingAppts } = useAppointments({
    patientId: patient?.id,
    status: 'scheduled',
  })

  if (loadingPatient || loadingAppts) {
    return <Loading />
  }

  return (
    <div>
      <h1>Hola, {patient.first_name}</h1>
      <h2>Tienes {appointments.length} citas pendientes</h2>
      {appointments.map(apt => (
        <AppointmentCard key={apt.id} appointment={apt} />
      ))}
    </div>
  )
}
```

## Componentes Especiales

### Chatbot AI

```tsx
import { ChatbotProvider } from '@/components/chatbot'

// En el layout del dashboard
<ChatbotProvider>
  {children}
</ChatbotProvider>

// Abre el chatbot desde cualquier parte
import { useChatbot } from '@/components/chatbot'
const { openChat, sendMessage } = useChatbot()
```

### Tour Guide

```tsx
import { useTourGuide } from '@/hooks/use-tour-guide'

function PageWithTour() {
  const { startTour, TourComponent } = useTourGuide('dashboard-medico')

  return (
    <>
      <Button onClick={startTour}>Iniciar Tour</Button>
      <TourComponent />
    </>
  )
}
```

### Formularios con React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.email('Email inválido'),
})

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  )
}
```

## Patrones de Componentes

### Componente Cliente vs Servidor

```tsx
// Componente Servidor (por defecto en App Router)
// No tiene 'use client', no puede usar hooks
async function ServerComponent() {
  const data = await fetchData() // Puede hacer fetch directo
  return <div>{data}</div>
}

// Componente Cliente
'use client'
function ClientComponent() {
  const [state, setState] = useState()
  return <div onClick={() => setState('clicked')}>{state}</div>
}
```

### Composición

```tsx
// Preferir composición sobre props complejas
<Card>
  <Card.Header>
    <Card.Title>Título</Card.Title>
    <Card.Description>Descripción</Card.Description>
  </Card.Header>
  <Card.Content>
    {children}
  </Card.Content>
</Card>
```
