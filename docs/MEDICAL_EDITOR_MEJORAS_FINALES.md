# Medical Editor - Mejoras Finales

## Cambios Implementados

### 1. ✅ Alineamiento Perfecto del Texto
- **Problema resuelto**: Texto ahora está centrado entre las líneas
- **Solución**: 
  - `backgroundPosition: '0 11px'`
  - `paddingTop: '11px'`
  - `lineHeight: '24px'`
- **Resultado**: Texto perfectamente alineado con las líneas del fondo

### 2. ✅ Editor Sin Scroll Externo
- **Cambio**: Editor ocupa todo el espacio disponible
- **Implementación**: 
  - `position: absolute` con `inset-0`
  - Scroll interno del textarea
  - Sin scroll en el contenedor padre
- **Beneficio**: Experiencia más limpia y profesional

### 3. ✅ Vista Dividida (Split View)
- **Área izquierda**: Editor principal con autocompletado
- **Área derecha**: Vista previa en tiempo real
- **Características**:
  - Vista previa formateada
  - Actualización en tiempo real
  - Scroll independiente
  - Fondo gris para diferenciar

### 4. ✅ Historial Clínico Colapsable
- **Estado expandido**: Muestra consultas anteriores (w-80)
- **Estado colapsado**: Solo icono visible (w-12)
- **Transición**: Animación suave de 300ms
- **Botones**:
  - ChevronRight para colapsar
  - Activity icon para expandir
- **Beneficio**: Más espacio para el editor cuando se necesita

### 5. ✅ Templates Mejorados
- **Nuevos templates agregados**:
  1. Consulta General (SOAP)
  2. Control
  3. Emergencia
  4. **Pediatría** (nuevo)
  5. **Control Prenatal** (nuevo)
  6. **Postoperatorio** (nuevo)

- **Mejoras en templates**:
  - Placeholders `[Escriba aquí]` para guiar al usuario
  - Campos con formato `[___]` para valores numéricos
  - Estructura más clara y profesional
  - Iconos de colores para cada tipo

### 6. ✅ Autocompletado Mejorado
- **Más sugerencias**: 40+ frases médicas comunes
- **Categorías**:
  - Secciones principales (MOTIVO, HISTORIA, etc.)
  - Subsecciones (Estado General, Cabeza y Cuello, etc.)
  - Signos vitales con formato
  - Frases comunes (Paciente refiere, Al examen físico, etc.)
- **Límite**: Muestra hasta 8 sugerencias
- **Posicionamiento**: Dinámico según línea actual

### 7. ✅ Menú de Templates Mejorado
- **Diseño**: Más ancho (w-72) con scroll
- **Iconos**: Cada template tiene su icono de color
- **Descripciones**: Más claras y específicas
- **Botón especial**: "Ver más templates..." para marketplace

## Plan para Marketplace de Templates

### Fase 1: Infraestructura (Próxima)

#### Base de Datos
```sql
-- Tabla de templates compartidos
CREATE TABLE medical_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES profiles(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category VARCHAR(50), -- consulta, emergencia, pediatria, etc.
  specialty VARCHAR(100), -- cardiologia, pediatria, etc.
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  downloads_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de templates del usuario
CREATE TABLE user_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  template_id UUID REFERENCES medical_templates(id),
  is_favorite BOOLEAN DEFAULT false,
  custom_content TEXT, -- Si el usuario modificó el template
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ratings
CREATE TABLE template_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES medical_templates(id),
  user_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);
```

#### Componentes Nuevos
1. **TemplateMarketplace.tsx**: Página principal del marketplace
2. **TemplateCard.tsx**: Card de template con preview
3. **TemplateEditor.tsx**: Editor para crear/editar templates
4. **TemplatePreview.tsx**: Vista previa del template

### Fase 2: Funcionalidades del Marketplace

#### Características Principales
1. **Explorar Templates**:
   - Grid de cards con templates
   - Filtros por categoría y especialidad
   - Búsqueda por texto
   - Ordenar por: Más descargados, Mejor valorados, Recientes

2. **Crear Template**:
   - Editor WYSIWYG
   - Campos protegidos (no editables)
   - Campos variables (editables)
   - Preview en tiempo real
   - Metadata (título, descripción, categoría)

3. **Compartir Template**:
   - Opción de hacer público/privado
   - Licencia (uso libre, atribución, etc.)
   - Tags para búsqueda

4. **Usar Template**:
   - Vista previa antes de usar
   - Botón "Usar Template"
   - Opción de guardar en "Mis Templates"
   - Personalización antes de aplicar

5. **Gestionar Templates**:
   - Mis templates creados
   - Mis templates favoritos
   - Editar/Eliminar propios
   - Estadísticas de uso

#### Sistema de Campos Protegidos

```typescript
interface TemplateField {
  id: string;
  type: 'protected' | 'editable' | 'numeric' | 'date';
  label: string;
  placeholder?: string;
  defaultValue?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface MedicalTemplate {
  id: string;
  title: string;
  content: string;
  fields: TemplateField[];
  sections: {
    name: string;
    protected: boolean;
    content: string;
  }[];
}
```

### Fase 3: Autocompletado Inteligente con IA

#### Sistema de Probabilidades
```typescript
interface AutocompleteContext {
  currentSection: string;
  previousLines: string[];
  patientAge?: number;
  patientGender?: string;
  specialty?: string;
}

interface Suggestion {
  text: string;
  probability: number;
  category: 'section' | 'subsection' | 'phrase' | 'value';
  context: string[];
}

// Función de scoring
function calculateSuggestionScore(
  suggestion: string,
  context: AutocompleteContext,
  userHistory: string[]
): number {
  let score = 0;
  
  // Contexto de sección actual
  if (isRelevantToSection(suggestion, context.currentSection)) {
    score += 0.4;
  }
  
  // Historial del usuario
  if (userHistory.includes(suggestion)) {
    score += 0.3;
  }
  
  // Frecuencia general
  score += getGlobalFrequency(suggestion) * 0.2;
  
  // Contexto del paciente
  if (isRelevantToPatient(suggestion, context)) {
    score += 0.1;
  }
  
  return score;
}
```

#### Aprendizaje del Usuario
- Guardar frases más usadas por el médico
- Adaptar sugerencias según especialidad
- Recordar preferencias de formato
- Sugerir basado en patrones previos

### Fase 4: Integración con IA (Opcional)

#### Sugerencias Contextuales
```typescript
async function getAISuggestions(
  context: AutocompleteContext,
  currentText: string
): Promise<Suggestion[]> {
  // Llamar a Gemini con contexto limitado
  const prompt = `
    Contexto: Sección "${context.currentSection}"
    Texto actual: "${currentText}"
    
    Sugiere 3 continuaciones médicas profesionales y breves.
    Formato: JSON array de strings
  `;
  
  // Respuesta optimizada en tokens
  return await callGeminiAPI(prompt, { maxTokens: 100 });
}
```

## Estructura de Archivos Propuesta

```
/app/dashboard/medico/
  /templates/
    page.tsx                    # Marketplace principal
    /[id]/
      page.tsx                  # Detalle de template
    /create/
      page.tsx                  # Crear nuevo template
    /edit/[id]/
      page.tsx                  # Editar template

/components/dashboard/medico/
  /templates/
    template-marketplace.tsx    # Grid de templates
    template-card.tsx          # Card individual
    template-editor.tsx        # Editor de templates
    template-preview.tsx       # Vista previa
    template-filters.tsx       # Filtros y búsqueda
    field-editor.tsx           # Editor de campos
    
/lib/
  /templates/
    template-parser.ts         # Parser de templates
    field-validator.ts         # Validación de campos
    autocomplete-engine.ts     # Motor de autocompletado
    suggestion-scorer.ts       # Scoring de sugerencias
```

## Próximos Pasos

### Inmediato
1. ✅ Mejorar alineamiento de texto
2. ✅ Implementar vista dividida
3. ✅ Hacer historial colapsable
4. ✅ Agregar más templates
5. ✅ Mejorar autocompletado

### Corto Plazo (1-2 semanas)
1. Crear tablas de base de datos
2. Implementar página de marketplace
3. Sistema de crear/editar templates
4. Sistema de campos protegidos
5. Búsqueda y filtros

### Mediano Plazo (1 mes)
1. Sistema de ratings y comentarios
2. Estadísticas de uso
3. Templates destacados
4. Categorías y tags
5. Exportar/Importar templates

### Largo Plazo (2-3 meses)
1. Autocompletado con IA
2. Aprendizaje de patrones del usuario
3. Sugerencias contextuales inteligentes
4. Análisis de calidad de templates
5. Recomendaciones personalizadas

## Beneficios del Sistema

### Para Médicos
- Ahorro de tiempo en documentación
- Consistencia en notas médicas
- Compartir mejores prácticas
- Aprender de colegas
- Personalización según especialidad

### Para la Plataforma
- Comunidad activa
- Contenido generado por usuarios
- Diferenciación competitiva
- Mejora continua
- Datos para IA

### Para Pacientes
- Notas más completas
- Mejor seguimiento
- Documentación profesional
- Menos errores
- Atención más rápida
