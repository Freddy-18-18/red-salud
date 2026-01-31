# 🗄️ Base de Datos (Supabase)

## Conexión

### Cliente (Browser)
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Servidor (Server Components / API Routes)
```typescript
import { createServerClient } from '@/lib/supabase/server'
const supabase = await createServerClient()
```

### Admin (Bypass RLS)
```typescript
import { createAdminClient } from '@/lib/supabase/admin'
const supabase = createAdminClient()
```

## Esquemas Principales

### Usuarios y Perfiles

```sql
-- Tabla de perfiles (extiende auth.users)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL, -- 'paciente', 'medico', 'clinica', etc.
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Detalles de médico
doctor_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  specialty TEXT,
  license_number TEXT,
  bio TEXT,
  verified BOOLEAN DEFAULT FALSE
)

-- Detalles de paciente
patient_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  birth_date DATE,
  blood_type TEXT,
  emergency_contact TEXT
)
```

### Citas

```sql
appointments (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id),
  doctor_id UUID REFERENCES profiles(id),
  clinic_id UUID REFERENCES clinics(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT, -- 'scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled'
  type TEXT, -- 'consulta', 'seguimiento', 'urgencia'
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Clínicas

```sql
clinics (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  specialties TEXT[],
  created_at TIMESTAMPTZ
)

-- Relación médico-clínica
clinic_doctors (
  clinic_id UUID REFERENCES clinics(id),
  doctor_id UUID REFERENCES profiles(id),
  role TEXT, -- 'owner', 'staff', 'guest'
  PRIMARY KEY (clinic_id, doctor_id)
)
```

### Registros Médicos

```sql
medical_records (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id),
  doctor_id UUID REFERENCES profiles(id),
  appointment_id UUID REFERENCES appointments(id),
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  attachments JSONB,
  created_at TIMESTAMPTZ
)

-- Laboratorio
lab_results (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id),
  ordered_by UUID REFERENCES profiles(id),
  type TEXT,
  results JSONB,
  status TEXT,
  created_at TIMESTAMPTZ
)
```

## Servicios Disponibles

Ubicación: `lib/supabase/services/`

| Servicio | Descripción |
|----------|-------------|
| `appointments-service.ts` | CRUD de citas |
| `doctors-service.ts` | Gestión de médicos |
| `clinics-service.ts` | Gestión de clínicas |
| `profile-service.ts` | Perfiles de usuario |
| `medical-records-service.ts` | Historiales médicos |
| `laboratory-service.ts` | Resultados de laboratorio |
| `medications-service.ts` | Recetas y medicamentos |
| `messaging-service.ts` | Chat entre usuarios |
| `telemedicine-service.ts` | Videollamadas |
| `health-metrics-service.ts` | Métricas de salud |
| `storage-service.ts` | Subida de archivos |
| `settings-service.ts` | Configuraciones |

### Ejemplo de Uso

```typescript
import { appointmentsService } from '@/lib/supabase/services'

// Obtener citas del día
const today = new Date().toISOString().split('T')[0]
const appointments = await appointmentsService.getByDate(today)

// Crear nueva cita
const newAppointment = await appointmentsService.create({
  patient_id: 'uuid...',
  doctor_id: 'uuid...',
  date: '2025-01-15',
  time: '10:00',
  type: 'consulta',
})

// Actualizar estado
await appointmentsService.updateStatus(appointmentId, 'completed')
```

## Migraciones

Las migraciones están en `supabase/migrations/`. Actualmente hay **33 migraciones**.

### Crear Nueva Migración

```bash
# En Supabase CLI (si está instalado)
supabase migration new nombre_de_migracion

# O manualmente
# Crear archivo: supabase/migrations/YYYYMMDDHHMMSS_nombre.sql
```

### Estructura de Migración

```sql
-- supabase/migrations/20250115120000_add_feature.sql

-- Crear tabla
CREATE TABLE nueva_tabla (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE nueva_tabla ENABLE ROW LEVEL SECURITY;

-- Crear policy
CREATE POLICY "Users can view own data"
ON nueva_tabla FOR SELECT
USING (auth.uid() = user_id);
```

## Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Patrones comunes:

```sql
-- Solo el propietario puede ver
CREATE POLICY "Own data only"
ON tabla FOR SELECT
USING (auth.uid() = user_id);

-- Médicos pueden ver pacientes de sus citas
CREATE POLICY "Doctors see their patients"
ON patient_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.patient_id = patient_profiles.id
    AND appointments.doctor_id = auth.uid()
  )
);
```

## Types

Los types están generados en `lib/supabase/types/` basados en el esquema de la base de datos.

```typescript
// lib/supabase/types/database.ts
export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  date: string
  time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  // ...
}
```
