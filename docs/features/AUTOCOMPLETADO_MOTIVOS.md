# Sistema de Autocompletado Inteligente - Motivos de Consulta

## 🎯 Funcionalidad Implementada

Se ha agregado un sistema de autocompletado inteligente para el campo "Motivo de Consulta" que sugiere automáticamente los motivos más comunes mientras el médico escribe.

---

## ✨ Características

### 1. **Búsqueda Inteligente**
- Empieza a buscar después de escribir 2 caracteres
- Búsqueda insensible a mayúsculas/minúsculas
- Busca coincidencias en cualquier parte del texto
- Muestra hasta 8 sugerencias relevantes

### 2. **Múltiples Motivos con Comas** ⭐ NUEVO
- Soporta múltiples motivos separados por comas
- El autocompletado se activa después de cada coma
- Ejemplo: "Dolor de cabeza, fiebre, control de rutina"
- Indicador visual cuando hay múltiples motivos

### 3. **Navegación con Teclado**
- **↑ / ↓**: Navegar entre sugerencias
- **Tab / Enter**: Seleccionar sugerencia
- **Escape**: Cerrar sugerencias
- **Coma (,)**: Agregar otro motivo
- **Continuar escribiendo**: Actualiza sugerencias en tiempo real

### 4. **Interfaz Intuitiva**
- Dropdown con scroll automático
- Resaltado de la opción seleccionada
- Indicador visual de cómo usar el autocompletado
- Badge "Múltiples motivos" cuando se usan comas
- Diseño responsive y accesible

---

## 📋 Base de Datos de Motivos (100+ opciones)

### Categorías Incluidas:

#### 1. **Síntomas Generales** (11)
- Dolor de cabeza, Fiebre, Malestar general, Fatiga, etc.

#### 2. **Respiratorio** (13)
- Tos, Gripe, Asma, Bronquitis, Sinusitis, etc.

#### 3. **Gastrointestinal** (11)
- Dolor abdominal, Diarrea, Gastritis, Reflujo, etc.

#### 4. **Cardiovascular** (6)
- Dolor en el pecho, Palpitaciones, Hipertensión, etc.

#### 5. **Musculoesquelético** (13)
- Dolor de espalda, Artritis, Esguince, Ciática, etc.

#### 6. **Dermatológico** (10)
- Erupción cutánea, Acné, Dermatitis, Hongos, etc.

#### 7. **Neurológico** (7)
- Migraña, Vértigo, Entumecimiento, Convulsiones, etc.

#### 8. **Oftalmológico** (5)
- Dolor de ojos, Visión borrosa, Conjuntivitis, etc.

#### 9. **Otorrinolaringológico** (5)
- Dolor de oído, Otitis, Sinusitis, Zumbido, etc.

#### 10. **Urológico** (5)
- Infección urinaria, Cistitis, Cálculos renales, etc.

#### 11. **Ginecológico** (5)
- Dolor menstrual, Irregularidades, Menopausia, etc.

#### 12. **Endocrino** (5)
- Diabetes, Problemas de tiroides, etc.

#### 13. **Mental/Emocional** (6)
- Ansiedad, Depresión, Estrés, Insomnio, etc.

#### 14. **Pediátrico** (6)
- Fiebre en niños, Cólicos, Vacunación, etc.

#### 15. **Preventivo y Control** (10)
- Chequeo general, Control de rutina, Certificado médico, etc.

#### 16. **Otros** (10)
- Alergias, Intoxicación, Obesidad, Tabaquismo, etc.

---

## 💻 Implementación Técnica

### Archivos Creados:

1. **`lib/data/consultation-reasons.ts`**
   - Base de datos de 100+ motivos de consulta
   - Función de búsqueda `searchConsultationReasons()`
   - Organizado por categorías médicas

2. **`components/ui/autocomplete-textarea.tsx`**
   - Componente reutilizable de autocompletado
   - Manejo de teclado completo
   - Scroll automático en sugerencias
   - Accesibilidad integrada

### Integración en el Formulario:

```typescript
// Estado para sugerencias
const [motivoSuggestions, setMotivoSuggestions] = useState<string[]>([]);

// Actualizar sugerencias en tiempo real
useEffect(() => {
  if (formData.motivo.length >= 2) {
    const suggestions = searchConsultationReasons(formData.motivo);
    setMotivoSuggestions(suggestions);
  } else {
    setMotivoSuggestions([]);
  }
}, [formData.motivo]);

// Usar el componente
<AutocompleteTextarea
  value={formData.motivo}
  onChange={(value) => setFormData({ ...formData, motivo: value })}
  suggestions={motivoSuggestions}
  placeholder="Escribe el motivo..."
  required
/>
```

---

## 🎨 Experiencia de Usuario

### Flujo de Uso Simple (Un motivo):

1. **Médico empieza a escribir**: "dol"
2. **Sistema muestra sugerencias**:
   - Dolor de cabeza
   - Dolor de cabeza persistente
   - Dolor de garganta
   - Dolor abdominal
   - Dolor de estómago
   - Dolor en el pecho
   - Dolor de espalda
   - Dolor lumbar

3. **Médico navega con ↓** hasta "Dolor de cabeza"
4. **Presiona Tab o Enter**
5. **Campo se completa**: "Dolor de cabeza"

### Flujo de Uso Múltiple (Varios motivos):

1. **Médico escribe**: "Dolor de cabeza"
2. **Presiona coma**: "Dolor de cabeza,"
3. **Empieza a escribir**: "Dolor de cabeza, fie"
4. **Sistema muestra sugerencias**:
   - Fiebre
   - Fiebre alta
   - Fiebre en niños
5. **Selecciona "Fiebre"**
6. **Campo queda**: "Dolor de cabeza, Fiebre"
7. **Puede agregar más**: "Dolor de cabeza, Fiebre, control"
8. **Resultado final**: "Dolor de cabeza, Fiebre, Control de rutina"

### Ventajas:

✅ **Ahorra tiempo** - No escribir todo manualmente
✅ **Múltiples motivos** - Agregar varios motivos en una sola cita
✅ **Estandarización** - Motivos consistentes en el sistema
✅ **Menos errores** - Ortografía correcta garantizada
✅ **Mejor análisis** - Datos estructurados para reportes
✅ **Experiencia fluida** - Sin interrumpir el flujo de trabajo
✅ **Contexto completo** - Capturar todos los síntomas del paciente

---

## 🔮 Mejoras Futuras

### Fase 1: Aprendizaje Personalizado
- Guardar los motivos más usados por cada médico
- Priorizar sugerencias basadas en historial
- Sugerencias contextuales según especialidad

### Fase 2: Inteligencia Artificial
- Sugerir diagnósticos basados en el motivo
- Autocompletar notas internas relacionadas
- Sugerir duración de consulta según motivo

### Fase 3: Análisis de Datos
- Dashboard de motivos más frecuentes
- Tendencias estacionales (ej: gripe en invierno)
- Alertas de brotes epidemiológicos

### Fase 4: Multiidioma
- Soporte para inglés, portugués
- Traducción automática de motivos
- Términos médicos en latín

---

## 📊 Métricas de Éxito

### KPIs a Monitorear:

1. **Tasa de uso del autocompletado**
   - % de citas que usan sugerencias vs escritura manual

2. **Tiempo de llenado del formulario**
   - Comparar antes/después de implementación

3. **Estandarización de datos**
   - % de motivos que coinciden con la base de datos

4. **Satisfacción del usuario**
   - Encuesta a médicos sobre la funcionalidad

---

## 🛠️ Mantenimiento

### Actualizar la Base de Datos:

Para agregar nuevos motivos, editar `lib/data/consultation-reasons.ts`:

```typescript
export const CONSULTATION_REASONS = [
  // ... motivos existentes
  "Nuevo motivo de consulta",
  "Otro motivo específico",
];
```

### Personalizar por Especialidad:

Futuro: Crear bases de datos específicas por especialidad:

```typescript
export const CARDIOLOGY_REASONS = [...];
export const PEDIATRIC_REASONS = [...];
export const DERMATOLOGY_REASONS = [...];
```

---

## ✅ Conclusión

El sistema de autocompletado inteligente mejora significativamente la experiencia del médico al agendar citas, ahorrando tiempo y estandarizando los datos del sistema. Es escalable, personalizable y preparado para futuras mejoras con IA.
