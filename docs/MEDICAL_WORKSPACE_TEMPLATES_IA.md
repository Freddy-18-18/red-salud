# Sistema de Templates y Autocompletado IA - Medical Workspace

## Resumen de Mejoras Implementadas

### 1. ✅ Error de Gemini API Corregido

**Problema:** Error 404 con modelo `gemini-1.5-flash`
**Solución:** Actualizado a `gemini-1.5-flash-latest`

**Archivos modificados:**
- `app/api/gemini/analyze-note/route.ts`

### 2. 🎨 Marketplace de Templates

**Características:**
- Vista tipo Notion con cards de templates
- Categorías: General, Especialidad, Emergencia, Control
- Sistema de favoritos (localStorage)
- Vista previa sin scroll (modal)
- Búsqueda por nombre, descripción y tags
- Templates oficiales de RED-SALUD
- Preparado para templates de comunidad

**Archivos creados:**
- `lib/templates/medical-templates.ts` - Sistema de templates
- `components/dashboard/medico/template-marketplace.tsx` - UI del marketplace

**Templates incluidos:**
1. En Blanco
2. Consulta General (SOAP)
3. Control
4. Emergencia
5. Pediatría
6. Control Prenatal
7. Postoperatorio

### 3. 🤖 Autocompletado Inteligente con IA

**Características:**
- Autocompletado local (rápido) para términos médicos comunes
- Autocompletado con IA (Gemini) para contexto específico
- Se activa automáticamente cuando:
  - No hay coincidencias locales
  - La línea tiene más de 10 caracteres
- Considera contexto del paciente (edad, género)
- Considera últimas 5 líneas de la nota
- Indicador visual de carga

**Archivos creados:**
- `app/api/gemini/autocomplete/route.ts` - API de autocompletado

**Uso:**
1. Escribe en la nota médica
2. Sugerencias locales aparecen inmediatamente
3. Si no hay coincidencias, IA genera sugerencias contextuales
4. Usa ↑↓ para navegar, Tab/Enter para aplicar, Esc para cerrar

### 4. 🔧 Scroll Horizontal Corregido

**Problema:** Al colapsar el historial clínico se generaba scroll horizontal
**Solución:** 
- Agregado `flex-shrink-0` al panel de historial
- Agregado `overflow-x-hidden` al contenedor
- Mejorado `break-words` en textos largos
- Optimizado layout con `min-w-0` y `truncate`

### 5. 🎯 Vista Previa de Templates Sin Scroll

**Características:**
- Modal de vista previa con altura fija (80vh)
- Contenido en ScrollArea para navegación interna
- No editable (solo lectura)
- Botón directo "Usar este Template"

## Flujo de Uso

### Seleccionar Template

1. Click en botón "Templates" (con badge IA)
2. Se abre marketplace con todos los templates
3. Filtrar por categoría o buscar
4. Click en "Vista Previa" para ver sin scroll
5. Click en "Usar" para aplicar al editor

### Autocompletado

1. Escribir en el editor
2. Sugerencias aparecen automáticamente
3. Locales (instantáneas) o IA (2-3 segundos)
4. Navegar con flechas, aplicar con Tab

### Favoritos

1. Click en estrella en cualquier template
2. Se guarda en localStorage por usuario
3. Filtrar por "Favoritos" en marketplace

## Próximas Mejoras Sugeridas

### Templates de Comunidad
- [ ] Tabla en Supabase: `medical_templates`
- [ ] CRUD de templates personalizados
- [ ] Compartir templates públicamente
- [ ] Sistema de likes/ratings
- [ ] Estadísticas de uso

### Autocompletado Avanzado
- [ ] Aprender de notas previas del doctor
- [ ] Sugerencias de medicamentos basadas en diagnóstico
- [ ] Sugerencias de exámenes complementarios
- [ ] Detección de interacciones medicamentosas

### Templates Inteligentes
- [ ] Templates que se adaptan a edad del paciente
- [ ] Campos calculados automáticamente (IMC, etc.)
- [ ] Validación de campos obligatorios
- [ ] Exportar a PDF con formato profesional

## Estructura de Base de Datos Sugerida

```sql
-- Templates de comunidad
CREATE TABLE medical_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  author_id UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Favoritos de templates
CREATE TABLE template_favorites (
  user_id UUID REFERENCES profiles(id),
  template_id UUID REFERENCES medical_templates(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, template_id)
);

-- Likes de templates
CREATE TABLE template_likes (
  user_id UUID REFERENCES profiles(id),
  template_id UUID REFERENCES medical_templates(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, template_id)
);
```

## Configuración de IA

### Variables de Entorno
```env
GEMINI_API_KEY=tu_api_key_aqui
```

### Modelos Usados
- `gemini-1.5-flash-latest` - Análisis de notas
- `gemini-1.5-flash-latest` - Autocompletado

### Rate Limits
- Autocompletado: Debounce de 400ms
- Análisis: Sin límite (manual)

## Testing

### Probar Templates
1. Ir a `/dashboard/medico/pacientes/nuevo`
2. Completar paso 1
3. En paso 2, click en "Templates"
4. Explorar marketplace
5. Probar vista previa y uso

### Probar Autocompletado
1. En editor de notas
2. Escribir "Paciente refiere do"
3. Verificar sugerencias locales
4. Escribir frase más larga sin coincidencias
5. Verificar sugerencias IA (con loader)

### Probar Historial
1. Colapsar panel de historial
2. Verificar que no hay scroll horizontal
3. Expandir panel
4. Verificar que textos largos no rompen layout

## Métricas de Rendimiento

- Autocompletado local: < 50ms
- Autocompletado IA: 2-3 segundos
- Carga de marketplace: < 100ms
- Vista previa template: < 50ms

## Soporte

Para reportar bugs o sugerir mejoras, contactar al equipo de desarrollo de RED-SALUD.
