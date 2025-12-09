# 📅 Análisis y Propuesta: Sección Agenda

## 🔍 Situación Actual

### Pacientes (Sección existente)
**Enfoque:** Gestión de expedientes clínicos
- Lista de todos los pacientes
- Tarjeta "Pacientes de Hoy" (muestra cuántas citas hay hoy)
- Vista detallada del historial médico completo
- Filtros por tipo de paciente, género, búsqueda
- Acciones: ver expediente, enviar mensaje, registrar nuevo paciente

### Agenda (Sección existente)
**Enfoque:** Lista simple de citas
- Lista lineal de todas las citas ordenadas por fecha
- Muestra: paciente, fecha, hora, motivo, estado
- Botón "Nueva Cita"
- **Problema:** No tiene vista de calendario real
- **Problema:** No permite ver disponibilidad
- **Problema:** No agrupa visualmente por día/semana/mes

---

## 💡 Propuesta: Transformar "Agenda" en un Calendario Completo

### Objetivo
Que "Agenda" sea la herramienta de **gestión temporal** de las consultas, complementando (no duplicando) la vista de Pacientes.

---

## 🎨 Nueva Estructura de "Agenda"

### 1. Vista Principal: Calendario Visual

#### Opciones de Vista:
- **Día:** Ver todas las citas del día con horarios específicos
- **Semana:** Vista semanal con bloques de tiempo
- **Mes:** Vista mensual con indicadores de citas
- **Lista:** Vista actual (mejorada)

#### Ejemplo Visual - Vista Día:
```
┌─────────────────────────────────────────────────┐
│  Lunes, 13 de Noviembre 2025                    │
├─────────────────────────────────────────────────┤
│  08:00 ─────────────────────────────────────    │
│  09:00 ┌─────────────────────────────────┐      │
│        │ María García                    │      │
│        │ Consulta General                │      │
│        │ 30 min • Confirmada             │      │
│  10:00 └─────────────────────────────────┘      │
│  11:00 ┌─────────────────────────────────┐      │
│        │ Juan Pérez                      │      │
│        │ Control Post-operatorio         │      │
│        │ 45 min • Pendiente              │      │
│  12:00 └─────────────────────────────────┘      │
│  13:00 ─────────────────────────────────────    │
│  14:00 [Almuerzo - Bloqueado]                   │
│  15:00 ─────────────────────────────────────    │
│  16:00 ┌─────────────────────────────────┐      │
│        │ Ana López                       │      │
│        │ Telemedicina                    │      │
│        │ 30 min • Confirmada             │      │
│  17:00 └─────────────────────────────────┘      │
│  18:00 ─────────────────────────────────────    │
└─────────────────────────────────────────────────┘
```

#### Ejemplo Visual - Vista Semana:
```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│   Lun    │   Mar    │   Mié    │   Jue    │   Vie    │   Sáb    │   Dom    │
│    13    │    14    │    15    │    16    │    17    │    18    │    19    │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 09:00    │ 10:00    │ 08:30    │          │ 09:00    │ 10:00    │          │
│ María G. │ Pedro M. │ Ana L.   │          │ Luis R.  │ Carmen S.│          │
│          │          │          │          │          │          │          │
│ 11:00    │ 14:00    │ 15:00    │ 16:00    │ 11:30    │          │          │
│ Juan P.  │ Rosa T.  │ Carlos D.│ Elena F. │ Sofia M. │          │          │
│          │          │          │          │          │          │          │
│ 16:00    │          │ 17:00    │          │ 15:00    │          │          │
│ Ana L.   │          │ Miguel A.│          │ Diego P. │          │          │
│ (Video)  │          │          │          │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 🎯 Funcionalidades Clave de "Agenda"

### 1. **Gestión de Disponibilidad**
- Configurar horarios de atención
- Bloquear horarios (almuerzo, reuniones, emergencias)
- Definir duración por tipo de consulta
- Marcar días no laborables

### 2. **Creación Rápida de Citas**
- Click en cualquier horario disponible → crear cita
- Arrastrar y soltar para mover citas
- Redimensionar para cambiar duración
- Duplicar citas recurrentes

### 3. **Filtros y Vistas**
- Filtrar por:
  - Estado (pendiente, confirmada, completada, cancelada)
  - Tipo (presencial, telemedicina, urgencia)
  - Paciente específico
  - Rango de fechas
- Búsqueda rápida por nombre de paciente

### 4. **Indicadores Visuales**
- Colores por tipo de cita:
  - 🔵 Azul: Consulta presencial
  - 🟢 Verde: Telemedicina
  - 🔴 Rojo: Urgencia
  - 🟡 Amarillo: Pendiente de confirmar
- Iconos:
  - 📹 Videollamada
  - 🏥 Presencial
  - ⚠️ Primera vez
  - 🔄 Seguimiento

### 5. **Acciones Rápidas desde el Calendario**
- Click en cita → Ver detalles
- Botones rápidos:
  - ✅ Confirmar cita
  - ❌ Cancelar cita
  - ✏️ Editar cita
  - 📝 Agregar notas
  - 💬 Enviar mensaje al paciente
  - 📹 Iniciar videoconsulta (si es telemedicina)
  - 👤 Ver expediente del paciente

### 6. **Notificaciones y Recordatorios**
- Recordatorios automáticos:
  - 24 horas antes
  - 1 hora antes
  - Al inicio de la cita
- Envío automático de recordatorios a pacientes (SMS/Email/WhatsApp)

### 7. **Estadísticas del Día**
Panel superior con:
- Total de citas del día
- Citas completadas / pendientes
- Tiempo total ocupado
- Próxima cita
- Tiempo libre restante

---

## 🔄 Diferenciación: Agenda vs Pacientes

### Cuándo usar **AGENDA**:
- ✅ Ver qué tengo hoy/esta semana/este mes
- ✅ Agendar nueva cita
- ✅ Ver disponibilidad de horarios
- ✅ Confirmar/cancelar citas
- ✅ Gestionar mi tiempo
- ✅ Ver flujo del día

### Cuándo usar **PACIENTES**:
- ✅ Buscar un paciente específico
- ✅ Ver historial médico completo
- ✅ Revisar diagnósticos y tratamientos
- ✅ Registrar nuevo paciente
- ✅ Ver todas las citas de un paciente
- ✅ Gestionar expedientes clínicos

---

## 🎨 Propuesta de Interfaz

### Header de Agenda
```
┌─────────────────────────────────────────────────────────────────┐
│  📅 Agenda                                    [Hoy] [Semana] [Mes] [Lista]  │
│                                                                   │
│  ← Noviembre 2025 →                          [+ Nueva Cita]      │
│                                                                   │
│  📊 Resumen del día:                                             │
│  • 8 citas programadas                                           │
│  • 5 completadas, 2 pendientes, 1 cancelada                     │
│  • Próxima: María García a las 16:00                            │
│  • 2 horas libres restantes                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Sidebar de Filtros
```
┌─────────────────────┐
│ Filtros             │
├─────────────────────┤
│ Estado:             │
│ ☑ Pendiente         │
│ ☑ Confirmada        │
│ ☑ Completada        │
│ ☐ Cancelada         │
│                     │
│ Tipo:               │
│ ☑ Presencial        │
│ ☑ Telemedicina      │
│ ☑ Urgencia          │
│                     │
│ Buscar paciente:    │
│ [_______________]   │
└─────────────────────┘
```

---

## 🚀 Funcionalidades Avanzadas (Futuro)

### 1. **Gestión de Sala de Espera Virtual**
- Ver pacientes que llegaron
- Notificar cuando es su turno
- Tiempo de espera estimado

### 2. **Integración con Pacientes**
- Desde Agenda: Click en paciente → Ver expediente rápido (modal)
- Desde Pacientes: Ver todas las citas del paciente en mini-calendario

### 3. **Recordatorios Inteligentes**
- IA sugiere mejor horario según historial
- Detecta patrones (ej: paciente siempre cancela los lunes)
- Alerta de conflictos de horario

### 4. **Sincronización con Calendario Externo**
- Google Calendar
- Outlook
- Apple Calendar

### 5. **Análisis de Productividad**
- Tiempo promedio por consulta
- Tasa de ausencias
- Horarios más productivos
- Sugerencias de optimización

### 6. **Gestión de Listas de Espera**
- Pacientes esperando cita
- Notificación automática cuando hay cancelación
- Priorización por urgencia

---

## 📱 Experiencia Móvil

### Vista Móvil Optimizada:
- Vista de lista por defecto
- Swipe para confirmar/cancelar
- Notificaciones push
- Acceso rápido a videoconsulta

---

## 🎯 Métricas de Éxito

### Para el Médico:
- Reducción de tiempo en gestión de citas (50%)
- Menos ausencias de pacientes (recordatorios automáticos)
- Mejor aprovechamiento del tiempo (ver huecos libres)
- Menos estrés (vista clara del día)

### Para el Paciente:
- Más fácil agendar citas
- Recordatorios automáticos
- Confirmación rápida
- Menos tiempo de espera

---

## 🔧 Implementación por Fases

### Fase 1: Calendario Básico (2-3 semanas)
- Vista día/semana/mes
- Crear/editar/eliminar citas
- Filtros básicos
- Indicadores visuales

### Fase 2: Gestión Avanzada (2-3 semanas)
- Configuración de disponibilidad
- Bloqueo de horarios
- Arrastrar y soltar
- Notificaciones

### Fase 3: Integraciones (2-3 semanas)
- Recordatorios automáticos a pacientes
- Integración con Telemedicina
- Sincronización con calendario externo

### Fase 4: IA y Optimización (3-4 semanas)
- Sugerencias inteligentes
- Análisis de productividad
- Predicción de ausencias
- Optimización de horarios

---

## 💬 Preguntas para Validar

1. **¿Cómo agendas citas actualmente?**
   - ¿Manualmente?
   - ¿Los pacientes las agendan?
   - ¿Usas algún sistema externo?

2. **¿Qué información necesitas ver rápidamente en tu agenda?**
   - ¿Solo nombre y hora?
   - ¿Motivo de consulta?
   - ¿Historial rápido?

3. **¿Cuántas citas atiendes por día en promedio?**
   - Esto define si necesitas vista compacta o espaciada

4. **¿Trabajas en múltiples consultorios/ubicaciones?**
   - Necesitarías filtro por ubicación

5. **¿Tienes asistente que gestiona tu agenda?**
   - Necesitarías permisos y roles

---

## 🎨 Mockup de Componentes Clave

### Tarjeta de Cita en Calendario
```
┌─────────────────────────────────────┐
│ 09:00 - 09:30                       │
│ ┌─────────────────────────────────┐ │
│ │ 👤 María García Pérez           │ │
│ │ 📋 Consulta General             │ │
│ │ ✅ Confirmada                   │ │
│ │                                 │ │
│ │ [💬 Mensaje] [📹 Iniciar] [👁️ Ver] │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Modal de Creación Rápida
```
┌─────────────────────────────────────┐
│ Nueva Cita                      [X] │
├─────────────────────────────────────┤
│ Paciente: [Buscar o crear nuevo]   │
│ Fecha: [13/11/2025]                 │
│ Hora: [09:00] Duración: [30 min]   │
│ Tipo: [Presencial ▼]                │
│ Motivo: [________________]          │
│                                     │
│ [Cancelar]  [Guardar y Confirmar]  │
└─────────────────────────────────────┘
```

---

## 🎯 Conclusión

La sección **Agenda** debe ser tu **control de tiempo**, mientras que **Pacientes** es tu **control clínico**.

**Agenda responde:**
- ¿Qué tengo hoy?
- ¿Cuándo está libre?
- ¿Quién viene después?
- ¿Cómo está mi semana?

**Pacientes responde:**
- ¿Qué historial tiene este paciente?
- ¿Qué tratamiento le di?
- ¿Cuándo fue su última consulta?
- ¿Qué alergias tiene?

**Ambas se complementan perfectamente sin duplicar funcionalidad.**

---

## 📋 Próximos Pasos

1. ✅ Validar esta propuesta contigo
2. Diseñar wireframes de las vistas de calendario
3. Definir prioridades de funcionalidades
4. Implementar Fase 1 (calendario básico)
5. Iterar según feedback

¿Qué te parece esta propuesta? ¿Hay algo que cambiarías o agregarías?
