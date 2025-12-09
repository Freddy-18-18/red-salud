# Roadmap - Sistema Avanzado de Citas Médicas

## ✅ FASE 1: COMPLETADA (Hoy)

### Formulario de Nueva Cita Mejorado
- ✅ Diseño compacto con Paciente y Fecha/Hora lado a lado
- ✅ Botón "Volver" minimalista
- ✅ Eliminación de max-width para mejor uso del espacio
- ✅ Campo de método de pago
- ✅ Generación automática de URL de videollamada para telemedicina
- ✅ Recordatorios inteligentes (descripción mejorada)
- ✅ Eliminación de teléfono de contacto (ya está en perfil)
- ✅ Eliminación de prioridad (se moverá a gestión de cola)

### Base de Datos
- ✅ Migración creada para ubicaciones del médico
- ✅ Migración creada para precios por servicio
- ✅ Migración creada para sistema de cola
- ✅ Campos de pago agregados a appointments

---

## 🚧 FASE 2: CONFIGURACIÓN DEL MÉDICO (Próximo)

### 2.1 Gestión de Ubicaciones
**Página:** `/dashboard/medico/configuracion/ubicaciones`

**Funcionalidades:**
- Agregar múltiples ubicaciones (consultorio, clínica, hospital)
- Configurar horarios por ubicación
- Establecer dirección y teléfono
- Activar/desactivar ubicaciones

**UI:**
```
┌─────────────────────────────────────────┐
│ Mis Ubicaciones                [+ Nueva]│
├─────────────────────────────────────────┤
│ 🏥 Consultorio Privado          [Editar]│
│    Av. Principal 123                    │
│    Lun-Vie: 09:00-17:00                 │
│    ✓ Activo                             │
├─────────────────────────────────────────┤
│ 🏥 Hospital San José            [Editar]│
│    Calle Secundaria 456                 │
│    Lun-Mié: 14:00-18:00                 │
│    ✓ Activo                             │
└─────────────────────────────────────────┘
```

### 2.2 Gestión de Precios por Servicio
**Página:** `/dashboard/medico/configuracion/precios`

**Funcionalidades:**
- Crear servicios personalizados
- Asignar precios por ubicación
- Precios diferentes para presencial/telemedicina
- Duración estimada por servicio

**UI:**
```
┌─────────────────────────────────────────┐
│ Mis Servicios y Precios        [+ Nuevo]│
├─────────────────────────────────────────┤
│ Consulta General                        │
│   Consultorio Privado                   │
│     • Presencial: $50 (30 min)          │
│     • Telemedicina: $40 (30 min)        │
│   Hospital San José                     │
│     • Presencial: $60 (30 min)          │
├─────────────────────────────────────────┤
│ Consulta Especializada                  │
│   Consultorio Privado                   │
│     • Presencial: $80 (45 min)          │
│     • Telemedicina: $70 (45 min)        │
└─────────────────────────────────────────┘
```

### 2.3 Actualizar Formulario de Nueva Cita
- Agregar selector de ubicación
- Agregar selector de servicio (con precio auto-completado)
- Precio se actualiza según ubicación + servicio + tipo de cita

---

## 🎯 FASE 3: SISTEMA DE COLA Y CHECK-IN (Mediano Plazo)

### 3.1 Check-in del Paciente
**Página:** `/dashboard/paciente/citas/[id]/checkin`

**Funcionalidades:**
- Botón "Hacer Check-in" 30 min antes de la cita
- Confirmación de llegada al consultorio
- Ver posición en la cola en tiempo real

**UI Móvil:**
```
┌─────────────────────────────────────────┐
│ Tu Cita - Hoy 10:00                     │
├─────────────────────────────────────────┤
│ Dr. Juan Pérez                          │
│ Consultorio Privado                     │
│                                         │
│ [✓ Hacer Check-in]                      │
│                                         │
│ ⏳ Tu posición en la cola: 3            │
│                                         │
│ Faltan aproximadamente 2 personas       │
│ Tiempo estimado: 20 minutos             │
│                                         │
│ 📍 Deberías estar en el consultorio     │
└─────────────────────────────────────────┘
```

### 3.2 Sala de Espera del Médico
**Página:** `/dashboard/medico/sala-espera`

**Funcionalidades:**
- Ver todos los pacientes del día
- Paciente actual en consulta
- Cola de espera ordenada
- Drag & drop para reordenar
- Botón "Llamar" que notifica al paciente
- Ver historial rápido del paciente

**UI:**
```
┌─────────────────────────────────────────┐
│ Sala de Espera - Hoy, 14 Nov 2024      │
├─────────────────────────────────────────┤
│ 🟢 EN CONSULTORIO                       │
│   Juan Pérez - Consulta General         │
│   Inicio: 10:00 | Duración: 30 min      │
│   [Finalizar Consulta]                  │
├─────────────────────────────────────────┤
│ ⏳ ESPERANDO (5 pacientes)              │
│                                         │
│ 1. 🔴 María García - URGENTE            │
│    Check-in: 09:45 | Cita: 10:00       │
│    [Llamar Ahora] [Ver Historial]      │
│    [⬆️] [⬇️]                            │
│                                         │
│ 2. Ana López - Primera Vez              │
│    Check-in: 09:50 | Cita: 10:30       │
│    [Llamar] [Ver Historial]            │
│    [⬆️] [⬇️]                            │
│                                         │
│ 3. Carlos Ruiz - Seguimiento            │
│    Check-in: 10:05 | Cita: 10:15       │
│    [Llamar] [Ver Historial]            │
│    [⬆️] [⬇️]                            │
└─────────────────────────────────────────┘
```

### 3.3 Notificaciones en Tiempo Real
**Tecnología:** Supabase Realtime

**Eventos:**
- Paciente hace check-in → Notificar al médico
- Médico llama a paciente → Notificar al paciente
- Cambio de posición en cola → Notificar al paciente
- Paciente delante de ti terminó → Notificar al siguiente

---

## 🚀 FASE 4: VIDEOLLAMADA INTEGRADA (Largo Plazo)

### 4.1 Integración con Jitsi Meet
**Funcionalidades:**
- Generar sala única por cita
- Botón "Unirse a Videollamada" 15 min antes
- Sala de espera virtual
- Grabación de consulta (opcional, con consentimiento)

### 4.2 Página de Videollamada
**Página:** `/dashboard/videollamada/[appointmentId]`

**Funcionalidades:**
- Video y audio
- Chat integrado
- Compartir pantalla
- Notas durante la consulta
- Finalizar y guardar resumen

---

## 📊 FASE 5: ANALÍTICAS Y REPORTES

### 5.1 Dashboard de Estadísticas
- Tiempo promedio por consulta
- Tasa de no-show (pacientes que no llegan)
- Ingresos por ubicación
- Servicios más solicitados
- Horarios más ocupados

### 5.2 Reportes Financieros
- Ingresos por día/semana/mes
- Desglose por método de pago
- Pagos pendientes
- Exportar a Excel/PDF

---

## 🔔 FASE 6: SISTEMA DE NOTIFICACIONES AVANZADO

### 6.1 Recordatorios Automáticos
- Email 24h antes
- SMS 2h antes
- WhatsApp 30 min antes
- Notificación push cuando es tu turno

### 6.2 Confirmación de Citas
- Link para confirmar/cancelar
- Reprogramar desde el link
- Encuesta de satisfacción post-consulta

---

## 🎨 MEJORAS DE UX/UI FUTURAS

### Calendario Mejorado
- Vista de disponibilidad en tiempo real
- Bloquear horarios (almuerzo, reuniones)
- Citas recurrentes
- Sincronización con Google Calendar

### Perfil del Paciente Mejorado
- Historial completo de citas
- Documentos adjuntos (estudios, recetas)
- Alergias y medicamentos actuales
- Contactos de emergencia

### Modo Oscuro
- Tema oscuro para reducir fatiga visual
- Especialmente útil para consultas nocturnas

---

## 📱 APLICACIÓN MÓVIL (Futuro Lejano)

### App Nativa
- React Native o Flutter
- Notificaciones push nativas
- Acceso offline a historial
- Escaneo de QR para check-in rápido

---

## 🔐 SEGURIDAD Y CUMPLIMIENTO

### HIPAA/GDPR Compliance
- Encriptación end-to-end para videollamadas
- Logs de acceso a datos sensibles
- Consentimiento informado digital
- Derecho al olvido (eliminar datos)

---

## PRIORIDADES INMEDIATAS

1. **Esta semana:**
   - ✅ Formulario de cita mejorado
   - ✅ Migraciones de base de datos
   - 🔄 Probar generación de URL de videollamada

2. **Próxima semana:**
   - Gestión de ubicaciones del médico
   - Gestión de precios por servicio
   - Actualizar formulario con ubicación y servicio

3. **Próximo mes:**
   - Sistema de check-in básico
   - Sala de espera del médico
   - Notificaciones en tiempo real

4. **Próximos 3 meses:**
   - Videollamada integrada
   - Analíticas básicas
   - Recordatorios automáticos
