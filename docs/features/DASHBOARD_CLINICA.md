# Dashboard de Clínica - Documentación Completa

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Módulos Principales](#módulos-principales)
4. [Modelo de Datos](#modelo-de-datos)
5. [User Journeys](#user-journeys)
6. [Guía de Implementación](#guía-de-implementación)
7. [APIs y Servicios](#apis-y-servicios)
8. [Configuración y Despliegue](#configuración-y-despliegue)

---

## Visión General

El Dashboard de Clínica es un sistema integral de gestión hospitalaria que abarca:

- **Revenue Cycle Management (RCM)**: Gestión completa del ciclo de ingresos desde pre-registro hasta cobranzas
- **Operaciones Clínicas**: Control de recursos, turnos, métricas operacionales y alertas
- **Pacientes Internacionales**: Registro, documentación y seguimiento de turismo médico
- **Multi-sede**: Soporte para clínicas con múltiples locaciones
- **Roles y Permisos**: Sistema granular de acceso por rol y sede

### Objetivos Clave

- ✅ **Autonomía**: Independiente de otros módulos del sistema
- ✅ **Escalabilidad**: Desde clínicas pequeñas hasta redes hospitalarias
- ✅ **Multi-moneda**: Soporte para operaciones internacionales
- ✅ **Observabilidad**: Métricas, alertas y reportes en tiempo real
- ✅ **Compliance**: Trazabilidad, auditoría y cumplimiento normativo

---

## Arquitectura

### Capas del Sistema

```
┌─────────────────────────────────────────┐
│         Presentación (Pages)            │
│  /dashboard/clinica/[clinicId]/*        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Componentes UI (Components)        │
│  components/dashboard/clinica/*         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Lógica de Negocio (Hooks)         │
│  hooks/use-clinic-*.ts                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Servicios Supabase (Services)      │
│  lib/supabase/services/clinic-*.ts      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Base de Datos (Supabase)        │
│  Migraciones: supabase/migrations/*     │
└─────────────────────────────────────────┘
```

### Principios de Diseño

- **SRP (Single Responsibility Principle)**: Cada archivo tiene una única responsabilidad
- **Archivos < 400 LOC**: Modularización forzada para mantenibilidad
- **Hooks orquestan**: Lógica de estado y efectos secundarios
- **Servicios encapsulan**: Acceso a datos y APIs externas
- **Componentes presentan**: UI sin lógica de negocio pesada

---

## Módulos Principales

### 1. Overview (Panel Ejecutivo)

**Ruta**: `/dashboard/clinica/[clinicId]`

**Funcionalidad**:
- KPIs consolidados (citas, ingresos, ocupación, alertas)
- Alertas críticas y advertencias
- Accesos rápidos a otros módulos
- Filtros multi-sede

**Componentes**:
- `stats-grid.tsx`: Tarjetas de estadísticas
- `clinic-scope-provider.tsx`: Contexto de clínica/sedes seleccionadas

### 2. RCM & Finanzas

**Ruta**: `/dashboard/clinica/[clinicId]/rcm`

**Funcionalidad**:
- Gestión de claims (crear, enviar, aprobar, denegar)
- Registro y conciliación de pagos
- Contratos con pagadores (aseguradoras, convenios)
- KPIs financieros (DSO, tasa de rechazo, tasa de cobro)
- Claims próximos a vencer (aging)
- Análisis histórico

**Servicios**:
- `clinic-rcm-service.ts`: Operaciones RCM completas

**Hooks**:
- `use-clinic-rcm.ts`: Estado y acciones RCM
- `use-claim-details.ts`: Detalle de un claim específico

### 3. Operaciones Clínicas

**Ruta**: `/dashboard/clinica/[clinicId]/operaciones`

**Funcionalidad**:
- Gestión de recursos (camas, quirófanos, consultorios)
- Turnos de personal médico y administrativo
- Métricas operacionales en tiempo real
- Alertas de capacidad y operativas
- Departamentos y utilización

**Servicios**:
- `clinic-operations-service.ts`: Recursos, turnos, métricas

**Hooks**:
- `use-clinic-operations.ts`: Estado operacional consolidado

### 4. Pacientes Internacionales

**Ruta**: `/dashboard/clinica/[clinicId]/pacientes`

**Funcionalidad**:
- Registro de pacientes extranjeros
- Gestión de documentos de viaje (pasaporte, visa, etc.)
- Verificación de documentos
- Requerimientos por país
- Seguimiento de llegadas y estancias
- Servicios concierge (alojamiento, transporte)

**Servicios**:
- `clinic-international-service.ts`: Pacientes y documentos internacionales

**Hooks**:
- `use-clinic-international.ts`: Estado y gestión de pacientes internacionales

---

## Modelo de Datos

### Entidades Principales

#### Clinics
```sql
- id (uuid, PK)
- name (text)
- legal_name (text)
- tax_id (text, unique)
- country (text)
- timezone (text)
- status (enum: active, suspended, closed)
- tier (enum: lite, professional, enterprise)
- metadata (jsonb)
```

#### Clinic Locations
```sql
- id (uuid, PK)
- clinic_id (uuid, FK → clinics)
- name (text)
- code (text, unique)
- address, city, state, country
- latitude, longitude
- is_main (boolean)
- opening_hours (jsonb)
- specialties (text[])
```

#### Clinic Roles
```sql
- id (uuid, PK)
- clinic_id (uuid, FK)
- user_id (uuid, FK → auth.users)
- role (enum: owner, admin, manager, finance, operations, concierge, auditor, viewer)
- location_id (uuid, FK opcional - NULL = acceso a todas)
- permissions (jsonb)
- status (enum: active, suspended, revoked)
```

#### RCM Claims
```sql
- id (uuid, PK)
- clinic_id, location_id, patient_id (FKs)
- payer_contract_id (FK opcional)
- claim_number (text, unique)
- claim_date, service_date
- status (enum: draft → submitted → approved → paid)
- claim_type (enum: outpatient, inpatient, emergency, ...)
- total_amount, approved_amount, paid_amount
- currency, exchange_rate
- denial_reason, denial_code
```

#### International Patients
```sql
- id (uuid, PK)
- patient_id (uuid, FK)
- clinic_id (uuid, FK)
- origin_country (text)
- passport_number, visa_type, visa_expiry
- preferred_language
- needs_translation, needs_accommodation, needs_transportation
- estimated_arrival_date, estimated_departure_date
- status (enum: pending → confirmed → arrived → in_treatment → discharged)
```

### Vistas Materializadas

#### clinic_financial_kpis
```sql
SELECT
  clinic_id,
  month,
  total_claims,
  paid_claims,
  denied_claims,
  total_billed,
  total_collected,
  avg_days_to_payment,
  denial_rate_pct,
  collection_rate_pct
FROM rcm_claims
GROUP BY clinic_id, month
```

---

## User Journeys

### Journey 1: Gerente de Clínica - Monitoreo Diario

1. **Login** → Dashboard principal
2. **Selecciona clínica** y sedes a monitorear
3. **Ve overview**:
   - Citas del día: 45
   - Ingresos: $125,000 MXN
   - Ocupación: 78%
   - **ALERTA**: Solo 2 camas disponibles
4. **Navega a Operaciones** → Ve recursos
5. **Identifica** camas en mantenimiento → Actualiza estado
6. **Revisa turnos** del personal → Todo OK
7. **Regresa a overview** → Alerta resuelta

### Journey 2: Equipo de Finanzas - Gestión de Claims

1. **Navega a RCM** → Tab "Claims"
2. **Ve aging claims** (>30 días sin cobrar)
3. **Selecciona claim** específico → Detalle completo
4. **Agrega nota** sobre seguimiento con aseguradora
5. **Actualiza estado** a "in_review"
6. **Tab "Pagos"** → Ve pago recién depositado
7. **Concilia pago** manualmente con claim
8. **Claim** pasa a estado "paid"
9. **KPIs** se actualizan automáticamente

### Journey 3: Concierge - Paciente Internacional

1. **Navega a Pacientes Internacionales**
2. **Tab "Próximas Llegadas"** → Ve paciente USA llega en 5 días
3. **Clic en paciente** → Detalle completo
4. **Revisa documentos**:
   - ✅ Pasaporte verificado
   - ❌ Seguro médico faltante
5. **Contacta paciente** → Solicita documento
6. **Paciente sube PDF** de seguro
7. **Verifica documento** → ✅ Aprobado
8. **Confirma alojamiento y transporte** desde metadata
9. **Estado** pasa a "confirmed"

---

## Guía de Implementación

### Paso 1: Ejecutar Migraciones

```bash
# Desde directorio raíz del proyecto
cd supabase

# Aplicar migraciones
supabase db push
```

Migraciones incluidas:
- `20251116000001_create_clinic_foundation.sql`: Tablas base
- `20251116000002_create_clinic_rcm.sql`: RCM, pacientes internacionales

### Paso 2: Crear Storage Bucket

```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('clinic-documents', 'clinic-documents', true);
```

### Paso 3: Configurar Roles Iniciales

Crear primera clínica desde código o SQL:

```sql
-- Crear clínica demo
INSERT INTO clinics (name, legal_name, tax_id, country, tier, email)
VALUES ('Clínica Demo', 'Clínica Demo SA de CV', 'DEMO123456ABC', 'MEX', 'professional', 'demo@clinica.com')
RETURNING id;

-- Asignar rol owner al usuario actual
INSERT INTO clinic_roles (clinic_id, user_id, role)
VALUES ('<clinic_id>', auth.uid(), 'owner');
```

### Paso 4: Navegar al Dashboard

```
http://localhost:3000/dashboard/clinica/<clinic_id>
```

---

## APIs y Servicios

### Servicios Disponibles

| Servicio | Archivo | Responsabilidad |
|----------|---------|-----------------|
| Clinics | `clinics-service.ts` | CRUD clínicas, sedes, roles |
| RCM | `clinic-rcm-service.ts` | Claims, pagos, contratos, KPIs |
| Operations | `clinic-operations-service.ts` | Recursos, turnos, métricas |
| International | `clinic-international-service.ts` | Pacientes y docs internacionales |

### Hooks Disponibles

| Hook | Descripción |
|------|-------------|
| `useClinicOverview` | Overview, stats, alertas, roles |
| `useClinicRCM` | Estado RCM completo |
| `useClaimDetails` | Detalle de claim específico |
| `useClaimsList` | Lista filtrada de claims |
| `useClinicOperations` | Recursos, turnos, métricas |
| `useInternationalPatients` | Pacientes internacionales |
| `useInternationalPatientDetails` | Detalle paciente + docs |

---

## Configuración y Despliegue

### Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Opcionales
NEXT_PUBLIC_DEFAULT_CURRENCY=MXN
NEXT_PUBLIC_DEFAULT_TIMEZONE=America/Mexico_City
```

### Feature Flags

En `lib/constants.ts`:

```typescript
export const CLINIC_FEATURES = {
  LITE_MODE: true, // Simplifica UI para clínicas pequeñas
  ADVANCED_ANALYTICS: false, // Requiere tier enterprise
  MULTI_CURRENCY: true,
  INTERNATIONAL_PATIENTS: true,
  CUSTOM_REPORTS: false,
};
```

### Permisos RLS

Las políticas RLS están configuradas para:
- Usuarios solo ven clínicas donde tienen rol activo
- Owners pueden crear clínicas
- Owners/Admins pueden modificar clínicas
- Finance puede gestionar claims y pagos
- Operations puede gestionar recursos y turnos
- Concierge puede gestionar pacientes internacionales

### Observabilidad

- **Supabase Reports**: Monitorear CPU, memoria, conexiones
- **Métricas operacionales**: Tabla `clinic_operational_metrics` con agregación horaria/diaria
- **Alertas**: Generadas on-demand vía `generateOperationalAlerts()`
- **Logs**: Edge Functions para procesamiento asíncrono de claims

---

## Roadmap Futuro

### Fase 2 - Analytics Avanzados
- [ ] Dashboards de BI con gráficas interactivas
- [ ] Forecasting de demanda con ML
- [ ] Comparativas multi-sede automáticas

### Fase 3 - Integraciones
- [ ] Motor de reglas RCM (Camunda/Temporal)
- [ ] Integración con pasarelas de pago
- [ ] APIs de aseguradoras (elegibilidad, pre-auth)
- [ ] FHIR/HL7 para intercambio de datos

### Fase 4 - IA y Automatización
- [ ] Scoring predictivo de claims
- [ ] Detección automática de fraude
- [ ] Recomendaciones de precios
- [ ] Chatbot para pacientes internacionales

---

## Contribución

Para agregar nuevas funcionalidades:

1. **Crear migración** en `supabase/migrations/`
2. **Actualizar tipos** en `lib/types/clinic.types.ts`
3. **Crear servicio** en `lib/supabase/services/`
4. **Crear hook** en `hooks/`
5. **Crear componente** en `components/dashboard/clinica/`
6. **Crear página** en `app/dashboard/clinica/[clinicId]/`
7. **Documentar** en este archivo

---

## Soporte

Para dudas o problemas:
- Revisar políticas RLS en Supabase Dashboard
- Verificar logs en consola del navegador
- Inspeccionar network calls para errores de API
- Consultar documentación de Supabase: https://supabase.com/docs

---

**Última actualización**: 16 de noviembre de 2025  
**Versión**: 1.0.0 MVP
