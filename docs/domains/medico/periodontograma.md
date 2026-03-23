# Periodontograma

Implementacion completa del modulo de periodontograma para odontologia en Red Salud.

**Fecha de Implementacion**: 2026-02-13 (Fases 1 y 2 completadas)

---

## Overview

El periodontograma es una herramienta clinica fundamental en odontologia para registrar y monitorear la salud periodontal de los pacientes. Se ha implementado como una funcionalidad end-to-end completamente conectada a Supabase.

### Acceso

1. **Sidebar**: Menu "Odontologia Pro" -> "Periodontograma"
2. **URL directa**: `/dashboard/medico/odontologia/periodontograma`
3. **Test mode**: `/dashboard/medico/odontologia/periodontograma?test=odontologia`

---

## Funcionalidades Implementadas

### Fase 1: Funcionalidades Base

#### CRUD Completo
- Crear nuevo periodontograma
- Actualizar periodontograma existente
- Leer periodontograma por ID
- Listar historial del paciente (ultimos 10)
- Eliminar periodontograma

#### Alertas Clinicas Inteligentes
- **Sangrado > 30%**: Alerta de enfermedad periodontal activa (tipo danger)
- **>=5 dientes con bolsas >=5mm sangrantes**: Tratamiento activo recomendado (tipo warning)
- **>=4 dientes ausentes**: Considerar rehabilitacion (tipo warning)
- **>=3 dientes con movilidad grado 2+**: Evaluar tratamiento (tipo danger)

#### Navegacion por Teclado
- **Flechas izq/der**: Navegar entre dientes
- **Enter**: Editar diente seleccionado
- **Esc**: Cerrar panel de edicion
- **Ctrl+S**: Guardar examen

#### UI/UX
- Selector de pacientes con busqueda en tiempo real
- Panel de historial con scroll y seleccion rapida
- Comparacion visual con examen anterior (lineas punteadas)
- Indicadores visuales de carga y guardado
- Manejo de errores con mensajes claros
- Badge "Mas reciente" en el examen mas actual
- Indicador visual del diente enfocado (ring amber)
- Transiciones suaves en hover
- Animaciones en los puntos del grafico
- Colores dinamicos con soporte dark mode

### Fase 2: Funcionalidades Avanzadas

#### Indicadores de Progresion
- Flechas (verde) en dientes mejorados desde examen anterior
- Flechas (rojo) en dientes empeorados desde examen anterior
- Calculo automatico comparando con examen previo
- Panel de resumen con total de mejoras/empeoramientos
- Umbral de 2mm para considerar cambio significativo

#### Exportacion a PDF
- Funcion `exportToPDF()` que activa impresion del navegador
- Animacion visual durante la exportacion (opacity 50%)
- Preparado para integrar con jsPDF/html2canvas

#### Animaciones Mejoradas
- Transiciones suaves en todos los elementos interactivos
- Efecto de pulso (animate-pulse) en puntos de sangrado
- Animacion de entrada (animate-in-fade) para panel de detalle
- Efecto hover con escala (scale-110) en botones BOP

---

## Como Usarlo

### 1. Seleccionar un Paciente
1. Haz clic en el boton "Seleccionar Paciente"
2. Escribe el nombre o email del paciente
3. Selecciona de la lista desplegable

### 2. Registrar Periodontograma
1. Haz clic en los dientes para seleccionarlos
2. Ingresa los valores de sondaje (0-15mm)
3. Activa/desactiva BOP (sangrado al sondaje)
4. Activa/desactiva supuracion
5. Activa/desactiva placa bacteriana
6. El grafico se actualiza en tiempo real

### 3. Guardar los Datos
1. Haz clic en el boton "Guardar" (arriba a la derecha)
2. Veras el indicador "Guardando..."
3. Los datos se guardan en Supabase automaticamente
4. El ID del examen se actualiza en el estado local

### 4. Ver Historial
1. Haz clic en "Ver Historial" (arriba a la derecha)
2. Se despliega un panel con los ultimos 10 examenes
3. Haz clic en cualquier examen previo para verlo
4. El periodo anterior se muestra con linea punteada para comparacion

### 5. Comparar Examenes
1. Selecciona un examen del historial
2. Los datos de ese examen aparecen en gris punteado
3. Tus datos actuales aparecen en azul solido
4. Compara visualmente la progresion del paciente

---

## Technical Details

### Base de Datos

**Tabla**: `dental_perio_exams`

Campos principales:
- `id` (UUID)
- `patient_id` (UUID -> auth.users)
- `doctor_id` (UUID -> auth.users)
- `exam_date` (DATE)
- `teeth` (JSONB -> Record<number, PerioToothData>)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### Estructura de Datos

```typescript
interface PerioExam {
  id: string;
  patient_id: string;
  doctor_id: string;
  exam_date: string;
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

### Datos Registrados por Diente

- **6 sitios de medicion**: MB, B, DB, ML, L, DL
- **Profundidad de sondaje**: 0-15mm
- **Recesion gingival**: -5 a +15mm
- **Sangrado (BOP)**: Booleano por sitio
- **Supuracion**: Booleano por sitio
- **Placa bacteriana**: Booleano por sitio
- **Movilidad**: Grados 0-3
- **Furcacion**: Grados 0-3
- **Implante**: Booleano
- **Ausente**: Booleano

### Calculos Automaticos

- **CAL (NIC)**: Profundidad + Recesion
- **Promedio de profundidad**: Total / sitios
- **% BOP**: (Sitios sangrantes / Total) * 100
- **Bolsas >=4mm**: Conteo de sitios
- **Bolsas >=6mm**: Conteo de sitios
- **Dientes ausentes**: Conteo de dientes

---

## Components

### Backend (perio-service.ts)
- `createPerioExam()` - Crear nuevo examen
- `updatePerioExam()` - Actualizar existente
- `getPerioExamById()` - Obtener por ID
- `getPerioExamsByPatient()` - Historial del paciente
- `getLatestPerioExamByPatient()` - Examen mas reciente
- `getPerioExamsByDoctor()` - Examenes por doctor
- `deletePerioExam()` - Eliminar examen
- `calculatePerioStats()` - Estadisticas calculadas

### Hook (use-periodontogram-data.ts)
- Estado de examen actual
- Examenes previos para comparacion
- Estados de carga (loading, saving)
- Manejo de errores
- Integracion con Supabase

### Componentes UI
- **PatientSelector**: Seleccion de pacientes con busqueda
- **Periodontogram**: Grafico principal del periodontograma
- **ToothDetailPanel**: Panel de edicion por diente
- **StatCard**: Tarjetas de estadisticas
- **PerioLegend**: Leyenda explicativa

---

## Security (RLS)

Las politicas de Row Level Security en Supabase aseguran que:
- Solo el doctor que creo el examen puede leer/actualizarlo
- El paciente puede leer sus propios examenes
- Eliminar requiere politica adicional:

```sql
CREATE POLICY "doctors_can_delete_perio_exams"
ON dental_perio_exams FOR DELETE
USING (doctor_id = auth.uid());
```

---

## Clinical Impact

- **Trazabilidad** completa de salud periodontal
- **Deteccion temprana** de enfermedad periodontal
- **Evaluacion de progresion** en el tiempo
- **Planificacion** de tratamiento basado en datos reales
- **Comunicacion visual** con el paciente (graficos)
- **Historial longitudinal** para seguimiento

---

## Next Steps

### Fase 3: Funcionalidades Adicionales
1. Crear PDF Export Real (jsPDF o html2pdf)
2. Integrar con SOAP Notes
3. Conectar con Plan de Tratamiento
4. Adjuntar imagenes (radiografias) al examen
5. Alertas automaticas de progresion de enfermedad
6. Comparacion mejorada con indicadores de mejoria/empeoramiento
7. Flujo de tratamiento periodontal basado en sondajes
8. Recordatorios automaticos de control periodontal

---

## Files

1. `lib/supabase/services/dental/perio-service.ts` - Servicio CRUD completo
2. `hooks/dental/use-periodontogram-data.ts` - Hook de estado
3. `components/dashboard/medico/odontologia/patient-selector.tsx` - Selector de pacientes
4. `components/dashboard/medico/odontologia/periodontogram/periodontogram.tsx` - Componente principal
5. `app/dashboard/medico/odontologia/periodontograma/page.tsx` - Pagina principal
6. `lib/specialty-experience/engine.ts` - 16 modulos al menu de odontologia
