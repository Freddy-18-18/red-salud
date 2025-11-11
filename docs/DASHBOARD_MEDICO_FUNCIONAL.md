# Dashboard Médico Funcional - Plan de Implementación

## ✅ Lo que ya tenemos implementado

### 1. Sistema de Gestión de Pacientes

#### **Vista de Lista de Pacientes** (`/dashboard/medico/pacientes`)
- ✅ Lista de todos los pacientes activos del médico
- ✅ Búsqueda por nombre, email o teléfono
- ✅ Información básica: nombre, contacto, edad, género
- ✅ Total de consultas por paciente
- ✅ Última fecha de consulta
- ✅ Botón para ver detalles del paciente
- ✅ Botón para enviar mensaje
- ✅ **NUEVO:** Botón "Registrar Paciente" para agregar pacientes offline

#### **Vista Detallada del Paciente** (`/dashboard/medico/pacientes/[id]`)
- ✅ Información completa del paciente
- ✅ Historial médico (alergias, condiciones crónicas, medicamentos)
- ✅ Tabs organizados:
  - Historial médico
  - Citas (con fechas y estados)
  - Recetas emitidas
  - Notas médicas
- ✅ Acciones rápidas:
  - Nueva receta
  - Nueva nota médica
  - Agendar cita
  - Enviar mensaje

#### **Registro de Pacientes Offline** (`/dashboard/medico/pacientes/nuevo`) ⭐ NUEVO
- ✅ Formulario completo para registrar pacientes que NO están en la app
- ✅ Vinculación automática por cédula
- ✅ Campos incluidos:
  - Información básica (cédula, nombre, fecha nacimiento, género)
  - Contacto (teléfono, email, dirección)
  - Información médica (tipo sangre, alergias, condiciones, medicamentos)
  - Notas del médico
- ✅ Sistema de vinculación automática:
  - Cuando el paciente se registre y valide su cédula
  - Verá automáticamente todo su historial con ese médico
  - Los datos se copian al perfil del paciente

### 2. Sistema de Búsqueda de Médicos (Dashboard Paciente)

#### **Búsqueda Mejorada** (`/dashboard/paciente/citas/nueva`)
- ✅ Buscador de especialidades con filtro en tiempo real
- ✅ Grid de especialidades (4x3) con scroll
- ✅ Contador de resultados
- ✅ Información completa del médico:
  - ✅ Nombre y foto
  - ✅ Especialidad
  - ✅ Años de experiencia
  - ✅ Precio de consulta
  - ✅ Ubicación (ciudad, estado)
  - ✅ Teléfono de contacto
  - ✅ Horarios disponibles
  - ✅ Biografía
  - ✅ Badge de verificación SACS

### 3. Base de Datos

#### **Nueva Tabla: `offline_patients`** ⭐
```sql
- id: UUID
- doctor_id: UUID (referencia a profiles)
- cedula: TEXT (clave para vinculación)
- nombre_completo, fecha_nacimiento, genero
- telefono, email, direccion
- tipo_sangre, alergias[], condiciones_cronicas[], medicamentos_actuales[]
- notas_medico: TEXT
- status: 'offline' | 'linked' | 'archived'
- linked_profile_id: UUID (cuando se vincula)
- linked_at: TIMESTAMPTZ
```

#### **Trigger Automático de Vinculación**
- ✅ Cuando un paciente se registra y valida su cédula
- ✅ Busca automáticamente registros offline con esa cédula
- ✅ Vincula los registros (status = 'linked')
- ✅ Crea relación en `doctor_patients`
- ✅ Copia información médica al perfil del paciente

---

## 🚧 Lo que falta por implementar

### 1. Editor de Recetas con Snippets ⭐ PRIORIDAD ALTA

**Ubicación:** `/dashboard/medico/recetas/nueva`

**Características necesarias:**
- [ ] Editor rico de texto (TipTap o similar)
- [ ] Sistema de snippets/plantillas personalizables:
  - [ ] Plantillas predefinidas por especialidad
  - [ ] Snippets personalizados del médico
  - [ ] Variables dinámicas (nombre paciente, fecha, etc.)
- [ ] Secciones del recipe:
  - [ ] Encabezado (datos del médico y paciente)
  - [ ] Diagnóstico
  - [ ] Indicaciones
  - [ ] Medicamentos (con dosis, frecuencia, duración)
  - [ ] Recomendaciones
  - [ ] Firma digital
- [ ] Funcionalidades:
  - [ ] Vista previa en tiempo real
  - [ ] Impresión automática (PDF)
  - [ ] Envío automático al paciente por email
  - [ ] Guardado en historial
  - [ ] Plantillas guardadas del médico

**Ejemplo de Snippets:**
```
/dx-diabetes → "Diabetes Mellitus Tipo 2 descompensada"
/rx-metformina → "Metformina 850mg - 1 tableta cada 12 horas con alimentos"
/firma → Inserta firma digital del médico
```

### 2. Sistema de Notas Médicas

**Ubicación:** `/dashboard/medico/notas/nueva`

**Características:**
- [ ] Editor de notas rápidas
- [ ] Tipos de notas:
  - [ ] Consulta
  - [ ] Diagnóstico
  - [ ] Tratamiento
  - [ ] Seguimiento
  - [ ] General
- [ ] Vinculación con citas
- [ ] Adjuntar archivos
- [ ] Notas privadas (no visibles para el paciente)

### 3. Vista de Paciente Offline

**Ubicación:** `/dashboard/medico/pacientes/offline/[id]`

**Características:**
- [ ] Vista similar a paciente normal
- [ ] Indicador de "Paciente Offline"
- [ ] Opción para editar información
- [ ] Historial de consultas offline
- [ ] Recetas emitidas
- [ ] Notas médicas
- [ ] Alerta cuando el paciente se vincule

### 4. Dashboard Principal del Médico - Mejoras

**Ubicación:** `/dashboard/medico`

**Agregar:**
- [ ] Widget de próximas citas del día
- [ ] Lista de pacientes recientes
- [ ] Acceso rápido a recetas pendientes
- [ ] Notificaciones de nuevos mensajes
- [ ] Gráficos de estadísticas (consultas por mes, ingresos)

### 5. Sistema de Citas para Médicos

**Ubicación:** `/dashboard/medico/citas`

**Características:**
- [ ] Vista de calendario
- [ ] Lista de citas por día/semana/mes
- [ ] Filtros por estado (pendiente, confirmada, completada)
- [ ] Acciones rápidas:
  - [ ] Confirmar cita
  - [ ] Cancelar cita
  - [ ] Reprogramar
  - [ ] Iniciar consulta
  - [ ] Ver detalles del paciente
- [ ] Notificaciones de nuevas citas

### 6. Configuración de Horarios

**Ubicación:** `/dashboard/medico/configuracion/horarios`

**Características:**
- [ ] Editor visual de horarios por día
- [ ] Múltiples ubicaciones/consultorios
- [ ] Bloqueo de horarios (vacaciones, días festivos)
- [ ] Duración personalizada de consultas
- [ ] Horarios especiales por tipo de consulta

### 7. Múltiples Ubicaciones

**Tabla nueva:** `doctor_locations`
```sql
- id: UUID
- doctor_id: UUID
- name: TEXT (ej: "Consultorio Principal")
- address: TEXT
- city: TEXT
- state: TEXT
- phone: TEXT
- schedule: JSONB
- is_primary: BOOLEAN
- is_active: BOOLEAN
```

**Características:**
- [ ] Gestión de múltiples consultorios
- [ ] Horarios diferentes por ubicación
- [ ] Pacientes pueden elegir ubicación al agendar
- [ ] Mostrar en búsqueda de médicos

---

## 📋 Próximos Pasos Recomendados

### Fase 1: Editor de Recetas (1-2 días)
1. Instalar TipTap o editor similar
2. Crear componente de editor con toolbar
3. Implementar sistema de snippets
4. Agregar generación de PDF
5. Implementar envío automático por email

### Fase 2: Sistema de Notas (1 día)
1. Crear formulario de notas
2. Implementar tipos de notas
3. Vinculación con citas
4. Sistema de adjuntos

### Fase 3: Vista de Pacientes Offline (1 día)
1. Crear página de detalle
2. Implementar edición
3. Agregar indicadores visuales
4. Sistema de notificación de vinculación

### Fase 4: Mejoras al Dashboard (1 día)
1. Widgets de citas del día
2. Pacientes recientes
3. Gráficos de estadísticas
4. Notificaciones

### Fase 5: Sistema de Citas Completo (2 días)
1. Vista de calendario
2. Gestión de citas
3. Acciones rápidas
4. Notificaciones

### Fase 6: Múltiples Ubicaciones (1-2 días)
1. Crear tabla y migraciones
2. Interfaz de gestión
3. Integración con búsqueda
4. Integración con agendamiento

---

## 🎯 Casos de Uso Principales

### Caso 1: Paciente ya registrado en la app
1. Médico busca al paciente en su lista
2. Ve toda la información que el paciente ha ingresado
3. Puede agregar notas, recetas, agendar citas
4. El paciente ve todo en su dashboard

### Caso 2: Paciente NO registrado (Offline)
1. Médico hace clic en "Registrar Paciente"
2. Ingresa cédula y datos del paciente
3. Sistema crea registro offline vinculado a esa cédula
4. Médico puede emitir recetas y notas
5. **Cuando el paciente se registre:**
   - Valida su cédula
   - Sistema detecta registros offline
   - Vincula automáticamente
   - Paciente ve todo su historial

### Caso 3: Paciente busca médico
1. Paciente va a "Nueva Cita"
2. Busca especialidad
3. Ve lista de médicos con:
   - Foto y nombre
   - Especialidad
   - Experiencia
   - Precio
   - Ubicación(es)
   - Horarios
   - Teléfono
4. Selecciona médico y agenda cita

---

## 🔧 Migraciones Pendientes

```bash
# Ya creada
✅ 014_create_offline_patients_table.sql

# Por crear
⏳ 015_create_doctor_locations_table.sql
⏳ 016_create_prescription_templates_table.sql
⏳ 017_add_doctor_snippets_table.sql
```

---

## 📝 Notas Técnicas

### Vinculación Automática
El trigger `link_offline_patient_on_registration()` se ejecuta cuando:
- Se inserta un nuevo perfil con role='paciente' y cedula
- Se actualiza la cédula de un perfil existente

### Seguridad
- RLS habilitado en todas las tablas
- Médicos solo ven sus propios pacientes
- Pacientes solo ven sus propios datos
- Notas privadas no visibles para pacientes

### Performance
- Índices en cedula para búsquedas rápidas
- Cache de estadísticas del médico
- Paginación en listas largas

---

## 🎨 UI/UX Consideraciones

### Dashboard Médico
- Debe ser rápido y eficiente
- Acceso rápido a funciones más usadas
- Información clara y organizada
- Colores que indiquen prioridad/urgencia

### Editor de Recetas
- Debe ser intuitivo
- Snippets fáciles de usar
- Vista previa en tiempo real
- Impresión profesional

### Búsqueda de Médicos
- Información completa y clara
- Fotos profesionales
- Badges de verificación visibles
- Fácil comparación entre médicos

---

## ✨ Funcionalidades Futuras (Opcional)

- [ ] Sistema de videollamadas integrado
- [ ] Chat en tiempo real médico-paciente
- [ ] Recordatorios automáticos de citas
- [ ] Sistema de pagos integrado
- [ ] Historial clínico compartido entre médicos
- [ ] Integración con laboratorios
- [ ] Recetas electrónicas con código QR
- [ ] App móvil nativa
- [ ] Sistema de referidos entre médicos
- [ ] Análisis de datos y reportes avanzados
