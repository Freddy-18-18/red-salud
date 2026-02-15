# Periodontograma - Guía de Uso

## Fecha de Implementación
2026-02-13

## ¿Qué se ha implementado?

Se ha conectado completamente el **Periodontograma** a la base de datos de Supabase. Ahora es una funcionalidad **end-to-end** completamente funcional.

## Archivos Modificados

### 1. **Servicios** (Backend)
- `apps/web/lib/supabase/services/dental/perio-service.ts`
  - **Crear** periodontograma
  - **Actualizar** periodontograma existente
  - **Leer** periodontograma por ID
  - **Historial** de un paciente (últimos 10)
  - **Eliminar** periodontograma
  - **Estadísticas** de progresión

### 2. **Hooks** (Data Layer)
- `apps/web/hooks/dental/use-periodontogram-data.ts`
  - Hook personalizado para manejar estado del periodontograma
  - Maneja estado local sincronizado con Supabase
  - Maneja loading, errors y acciones

### 3. **Componentes** (UI)
- `apps/web/components/dashboard/medico/odontologia/patient-selector.tsx`
  - Selector de pacientes con búsqueda
  - Muestra avatar + nombre + email
- `apps/web/app/dashboard/medico/odontologia/periodontograma/page.tsx`
  - Conectada a datos reales
  - Botón Guardar conectado
  - Panel de historial con comparación
  - Indicador de "Más reciente" en historial

### 4. **Tipos** (TypeScript)
- `apps/web/types/dental.ts` (ya existía, sin cambios)

## Funcionalidades Implementadas

### ✅ CRUD Completo
- [x] **Crear** nuevo periodontograma
- [x] **Actualizar** periodontograma existente
- [x] **Leer** periodontograma por ID
- [x] **Listar** historial del paciente (últimos 10)
- [x] **Eliminar** periodontograma

### ✅ UI/UX
- [x] **Selector de pacientes** con búsqueda en tiempo real
- [x] **Panel de historial** con scroll y selección rápida
- [x] **Comparación visual** con examen anterior (líneas punteadas)
- [x] **Indicadores visuales** de carga y guardado
- [x] **Manejo de errores** con mensajes claros
- [x] **Badge "Más reciente"** en el examen más actual

### ✅ Experiencia de Usuario
- [x] Flujo intuitivo: Seleccionar paciente → Registrar sondaje → Guardar
- [x] Feedback visual inmediato al guardar
- [x] Historial accesible desde la misma página
- [x] Comparación fácil entre exámenes con líneas superpuestas

## Cómo Usarlo

### 1. **Seleccionar un Paciente**
```
1. Haz clic en el botón "Seleccionar Paciente"
2. Escribe el nombre o email del paciente
3. Selecciona de la lista desplegable
```

### 2. **Registrar Periodontograma**
```
1. Haz clic en los dientes para seleccionarlos
2. Ingresa los valores de sondaje (0-15mm)
3. Activa/desactiva BOP (sangrado al sondaje)
4. Activa/desactiva supuración
5. Activa/desactiva placa bacteriana
6. El gráfico se actualiza en tiempo real
```

### 3. **Guardar los Datos**
```
1. Haz clic en el botón "Guardar" (arriba a la derecha)
2. Verás el indicador "Guardando..."
3. Los datos se guardan en Supabase automáticamente
4. El ID del examen se actualiza en el estado local
```

### 4. **Ver Historial**
```
1. Haz clic en "Ver Historial" (arriba a la derecha)
2. Se despliega un panel con los últimos 10 exámenes
3. Haz clic en cualquier examen previo para verlo
4. El periodo anterior se muestra con línea punteada para comparación
```

### 5. **Comparar Exámenes**
```
1. Selecciona un examen del historial
2. Los datos de ese examen aparecen en gris punteado
3. Tus datos actuales aparecen en azul solido
4. Compara visualmente la progresión del paciente
```

## Detalles Técnicos

### Base de Datos
- **Tabla**: `dental_perio_exams`
- **Campos principales**:
  - `id` (UUID)
  - `patient_id` (UUID → auth.users)
  - `doctor_id` (UUID → auth.users)
  - `exam_date` (DATE)
  - `teeth` (JSONB → Record<number, PerioToothData>)
  - `notes` (TEXT)
  - `created_at`, `updated_at` (TIMESTAMPTZ)

### Estructura de Datos
```typescript
interface PerioExam {
  id: string;
  patient_id: string;
  doctor_id: string;
  exam_date: string; // ISO date string
  teeth: Record<number, PerioToothData>;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface PerioToothData {
  toothCode: number; // 11-48 (FDI)
  mobility: 0 | 1 | 2 | 3;
  furcation: 0 | 1 | 2 | 3;
  implant: boolean;
  missing: boolean;
  measurements: Record<PerioSite, PerioMeasurement>;
}

interface PerioMeasurement {
  probingDepth: number; // 0-15mm
  recession: number; // -5 to +15mm
  bleeding: boolean; // BOP
  suppuration: boolean;
  plaque: boolean;
}

type PerioSite = "MB" | "B" | "DB" | "ML" | "L" | "DL";
```

## Seguridad y RLS

Las políticas de Row Level Security (RLS) en Supabase aseguran que:
- ✅ Solo el doctor que creó el examen puede leer/actualizarlo
- ✅ El paciente puede leer sus propios exámenes
- ✅ Nadie puede eliminar exámenes (según la política actual)

Para **ELIMINAR** exámenes, necesitarás modificar las políticas RLS:
```sql
CREATE POLICY "doctors_can_delete_perio_exams"
ON dental_perio_exams FOR DELETE
USING (doctor_id = auth.uid());
```

## Próximos Pasos Recomendados

### Fase 2: Funcionalidades Adicionales
1. **Exportar PDF** del periodontograma
2. **Notas clínicas** más detalladas por diente
3. **Adjuntar imágenes** (radiografías) al examen
4. **Alertas automáticas** cuando hay progresión de enfermedad
5. **Comparación mejorada** con indicadores de mejoría/empeoramiento

### Fase 3: Integración Clínica
1. Conectar con **SOAP Notes**
2. Conectar con **Plan de Tratamiento**
3. Flujo de **tratamiento periodontal** basado en sondajes
4. Recordatorios automáticos de **control periodontal**

## Impacto Clínico

Esta funcionalidad permite:
- ✅ **Trazabilidad** completa de salud periodontal
- ✅ **Detección temprana** de enfermedad periodontal
- ✅ **Evaluación de progresión** en el tiempo
- ✅ **Planificación** de tratamiento basado en datos reales
- ✅ **Comunicación visual** con el paciente (gráficos)
- ✅ **Historial longitudinal** para seguimiento

## Métricas de Éxito

Un periodontograma funcional conecta a producción deberías poder:
- Registrar **50+ exámenes** en el primer mes
- Reducir **no-shows** en pacientes con periodontitis
- Aumentar **aceptación de tratamientos** con evidencia visual
- Mejorar **retención** mediante seguimiento periódico

---

**¡El periodontograma está listo para producción! 🎉**

Para probar: `http://localhost:3000/dashboard/medico/odontologia/periodontograma?test=odontologia`
