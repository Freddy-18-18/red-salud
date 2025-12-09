# Análisis de Requerimientos Avanzados - Sistema de Citas

## 1. PRECIOS Y TARIFAS DEL MÉDICO

### Problema Identificado:
El médico necesita configurar diferentes precios según:
- Tipo de servicio (consulta general, especializada, urgencia)
- Ubicación (consultorio privado, clínica, hospital)
- Tipo de cita (presencial, telemedicina)

### Solución Propuesta:
Crear una tabla `doctor_service_prices` para gestionar tarifas:

```sql
CREATE TABLE doctor_service_prices (
  id UUID PRIMARY KEY,
  doctor_id UUID REFERENCES profiles(id),
  service_name TEXT, -- "Consulta General", "Consulta Especializada"
  location_id UUID REFERENCES doctor_locations(id),
  tipo_cita TEXT, -- presencial, telemedicina
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true
);
```

### Implementación en UI:
- Dropdown de servicios pre-configurados por el médico
- El precio se auto-completa según el servicio seleccionado
- Opción de editar precio manualmente si es necesario

---

## 2. MÉTODO DE PAGO

### Opciones de Pago:
- Efectivo
- Tarjeta de crédito/débito
- Transferencia bancaria
- Seguro médico
- Pendiente (se paga después)

### Campo en DB:
Agregar `payment_method` y `payment_status` a appointments

---

## 3. TELÉFONO DE CONTACTO

### Análisis Correcto:
✅ **NO agregar aquí** - Tienes razón
- Pacientes registrados: ya tienen teléfono en su perfil
- Pacientes offline: se registra en el formulario de nuevo paciente

### Acción:
- Eliminar campo `telefono_contacto` del formulario de cita
- Obtener teléfono del perfil del paciente cuando sea necesario

---

## 4. RECORDATORIO INTELIGENTE

### Concepto Mejorado:
En lugar de solo "24h antes", implementar:

**Sistema de Cola en Tiempo Real:**
- Notificar al paciente cuántas personas hay delante
- "Faltan 3 personas, deberías estar en el consultorio"
- Actualización en tiempo real usando Supabase Realtime

**Tabla necesaria:**
```sql
CREATE TABLE appointment_queue (
  id UUID PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id),
  position INTEGER, -- posición en la cola
  status TEXT, -- 'waiting', 'in_consultation', 'completed'
  checked_in_at TIMESTAMPTZ, -- cuando llegó el paciente
  called_at TIMESTAMPTZ -- cuando fue llamado
);
```

---

## 5. UBICACIONES DEL MÉDICO (Clínicas, Consultorios, Hospitales)

### Tabla de Ubicaciones:
```sql
CREATE TABLE doctor_locations (
  id UUID PRIMARY KEY,
  doctor_id UUID REFERENCES profiles(id),
  name TEXT, -- "Consultorio Privado", "Hospital XYZ"
  type TEXT, -- 'consultorio', 'clinica', 'hospital'
  address TEXT,
  phone TEXT,
  working_hours JSONB, -- horarios por día
  is_active BOOLEAN DEFAULT true
);
```

### Impacto en Citas:
- Precio varía según ubicación
- Horarios disponibles varían según ubicación
- Campo `location_id` en appointments

### UI:
- Selector de ubicación en formulario de cita
- Precio se actualiza automáticamente
- Mostrar horarios disponibles según ubicación

---

## 6. PRIORIDAD Y ORDEN DE ATENCIÓN

### Análisis del Concepto:

**Escenario 1: Orden de Llegada (Check-in)**
- Pacientes llegan y hacen check-in
- Se ordenan por hora de llegada real, no por hora de cita
- El médico ve la lista en orden de check-in

**Escenario 2: Prioridad Manual**
- El médico puede reordenar la cola
- Casos urgentes pasan primero
- Útil cuando hay emergencias

**Escenario 3: Con Secretaria**
- La secretaria gestiona la cola
- El médico ve quién sigue
- Puede decidir quién pasa primero

### Implementación:


**Vista de Sala de Espera para el Médico:**
```
┌─────────────────────────────────────────┐
│ Sala de Espera - Hoy                    │
├─────────────────────────────────────────┤
│ 🟢 En Consultorio:                      │
│   Juan Pérez - Consulta General         │
│   [Finalizar Consulta]                  │
├─────────────────────────────────────────┤
│ ⏳ Esperando (5 pacientes):             │
│                                         │
│ 1. 🔴 María García - URGENTE            │
│    Check-in: 09:45 | Cita: 10:00       │
│    [Llamar Ahora] [Ver Historial]      │
│                                         │
│ 2. Ana López - Primera Vez              │
│    Check-in: 09:50 | Cita: 10:30       │
│    [Llamar] [Mover Arriba] [Mover Abajo]│
│                                         │
│ 3. Carlos Ruiz - Seguimiento            │
│    Check-in: 10:05 | Cita: 10:15       │
│    [Llamar] [Mover Arriba] [Mover Abajo]│
└─────────────────────────────────────────┘
```

**Funcionalidades:**
- Drag & drop para reordenar
- Botón "Llamar" que notifica al paciente
- Ver historial rápido del paciente
- Marcar como urgente

---

## 7. VIDEOLLAMADA (TELEMEDICINA)

### Opciones de Implementación:

**Opción A: Integración con Jitsi (Recomendado)**
- Open source y gratuito
- Fácil integración
- No requiere instalación
- Genera URL única por cita

**Opción B: Integración con Zoom/Google Meet**
- Requiere API keys
- Costos adicionales
- Más profesional

### Implementación Sugerida (Jitsi):


```typescript
// Generar URL de videollamada
const generateMeetingUrl = (appointmentId: string) => {
  const roomName = `cita-${appointmentId}`;
  return `https://meet.jit.si/${roomName}`;
};

// Al crear cita de telemedicina
if (tipo_cita === 'telemedicina') {
  meeting_url = generateMeetingUrl(appointmentId);
}
```

**Flujo:**
1. Al crear cita de telemedicina → generar URL automáticamente
2. Enviar URL al paciente por email/SMS
3. 15 min antes de la cita → recordatorio con link
4. Botón "Unirse a Videollamada" en dashboard

---

## PLAN DE IMPLEMENTACIÓN

### Fase 1: Inmediato (Esta sesión)
- ✅ Eliminar campo teléfono de contacto
- ✅ Agregar método de pago
- ✅ Mejorar selector de precio (preparar para servicios)
- ✅ Agregar generación de URL para telemedicina

### Fase 2: Corto Plazo (Siguiente)
- Crear tabla `doctor_locations`
- Implementar selector de ubicación
- Precios dinámicos según ubicación
- Migración de datos existentes

### Fase 3: Mediano Plazo
- Sistema de check-in para pacientes
- Vista de sala de espera para médico
- Cola en tiempo real con Supabase Realtime
- Notificaciones de posición en cola

### Fase 4: Largo Plazo
- Drag & drop para reordenar cola
- Integración completa de videollamada
- Grabación de consultas (opcional)
- Historial de consultas virtuales

---

## CAMBIOS INMEDIATOS EN EL FORMULARIO

### Eliminar:
- ❌ Teléfono de contacto (ya está en perfil)
- ❌ Prioridad (moverlo a gestión de cola)

### Agregar:
- ✅ Método de pago
- ✅ Ubicación del médico (si tiene múltiples)
- ✅ Servicio/Tipo de consulta (con precio asociado)
- ✅ Auto-generar URL de videollamada si es telemedicina

### Mantener:
- ✅ Paciente, Fecha, Hora, Duración
- ✅ Tipo de cita
- ✅ Motivo
- ✅ Notas internas
- ✅ Recordatorio


---

## RESUMEN DE CAMBIOS IMPLEMENTADOS

### ✅ Cambios Aplicados al Formulario:

1. **Eliminado:**
   - ❌ Campo "Teléfono de contacto" (correcto, ya está en perfil del paciente)
   - ❌ Campo "Prioridad" (se moverá a gestión de cola)

2. **Agregado:**
   - ✅ **Método de Pago** (efectivo, tarjeta, transferencia, seguro, pendiente)
   - ✅ **Generación automática de URL de videollamada** para telemedicina
   - ✅ **Recordatorios inteligentes mejorados** con descripción detallada

3. **Mejorado:**
   - ✅ Indicador visual cuando se selecciona telemedicina
   - ✅ Resumen lateral muestra método de pago
   - ✅ Resumen lateral muestra si recordatorios están activados
   - ✅ Iconos visuales para tipo de cita

### 📊 Migraciones Creadas:

**Archivo:** `supabase/migrations/20241114000001_add_locations_and_payment.sql`

**Tablas nuevas:**
1. `doctor_locations` - Ubicaciones del médico
2. `doctor_service_prices` - Precios por servicio
3. `appointment_queue` - Sistema de cola

**Campos agregados a appointments:**
- `location_id` - Ubicación de la cita
- `payment_method` - Método de pago
- `payment_status` - Estado del pago

**Funciones creadas:**
- `get_queue_position()` - Obtener posición en cola
- `reorder_queue()` - Reordenar cola automáticamente

### 🎯 Próximos Pasos:

**Inmediato (Esta semana):**
1. Probar el formulario actualizado
2. Verificar generación de URL de videollamada
3. Aplicar migración a la base de datos

**Corto Plazo (Próxima semana):**
1. Crear página de gestión de ubicaciones
2. Crear página de gestión de precios
3. Actualizar formulario para usar ubicaciones y servicios

**Mediano Plazo (Próximo mes):**
1. Implementar sistema de check-in
2. Crear sala de espera del médico
3. Notificaciones en tiempo real

---

## CONCLUSIONES

### ✅ Decisiones Correctas:

1. **Eliminar teléfono de contacto del formulario de cita**
   - Los pacientes registrados ya tienen teléfono en su perfil
   - Los pacientes offline lo registran al crearlos
   - Evita duplicación de datos

2. **Mover prioridad a gestión de cola**
   - La prioridad es dinámica (cambia según llegada)
   - Mejor gestionarla en tiempo real en la sala de espera
   - El médico puede reordenar según necesidad

3. **Generación automática de URL de videollamada**
   - Simplifica el proceso
   - Evita errores manuales
   - Se puede cambiar después si es necesario

### 🎯 Arquitectura Escalable:

El sistema está diseñado para crecer:
- Múltiples ubicaciones por médico
- Precios dinámicos por servicio y ubicación
- Sistema de cola flexible
- Notificaciones en tiempo real
- Videollamada integrada

### 💡 Valor Agregado:

**Para el Médico:**
- Control total de precios y ubicaciones
- Gestión eficiente de la cola de pacientes
- Menos no-shows con recordatorios inteligentes
- Telemedicina integrada

**Para el Paciente:**
- Sabe cuándo llegar al consultorio
- Notificaciones en tiempo real de su turno
- Opción de videollamada
- Transparencia en precios

**Para la Secretaria:**
- Gestión de cola simplificada
- Menos llamadas de "¿cuánto falta?"
- Control de pagos
- Organización automática
