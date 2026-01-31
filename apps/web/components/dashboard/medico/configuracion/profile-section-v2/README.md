# Profile Section V2 - Documentación

## 📋 Descripción

Sistema completo de configuración de perfil médico profesional con las siguientes características:

- ✅ Layout de dos columnas (formulario + vista previa en vivo)
- ✅ Sistema de gamificación con niveles (Básico → Completo → Profesional → Elite)
- ✅ Progress ring circular animado
- ✅ Vista previa en tiempo real (móvil/desktop)
- ✅ Editor de biografía con análisis de IA
- ✅ Upload de avatar con validación profesional
- ✅ Campos con contexto educativo
- ✅ Métricas de impacto en tiempo real

## 🎯 Componentes

### 1. ProfileSectionV2 (index.tsx)
Componente principal que orquesta toda la experiencia.

**Props:** Ninguna (obtiene datos de Supabase)

**Uso:**
```tsx
import { ProfileSectionV2 } from "@/components/dashboard/medico/configuracion/profile-section-v2";

<ProfileSectionV2 />
```

### 2. ProfileCompletionRing
Progress ring circular animado que muestra el porcentaje de completitud.

**Props:**
- `percentage: number` - Porcentaje de completitud (0-100)
- `level: ProfileLevel` - Nivel actual del perfil
- `size?: "sm" | "md" | "lg"` - Tamaño del ring (default: "md")

### 3. ProfileLevelBadge
Badge animado que muestra el nivel actual del perfil.

**Props:**
- `level: ProfileLevel` - Nivel del perfil
- `showLabel?: boolean` - Mostrar texto del nivel (default: true)
- `size?: "sm" | "md" | "lg"` - Tamaño del badge (default: "md")

### 4. LiveProfilePreview
Vista previa en tiempo real de cómo los pacientes ven el perfil.

**Props:**
- `profile: ProfileData` - Datos del perfil

### 5. EnhancedBioEditor
Editor de biografía con análisis en tiempo real y mejoras de IA.

**Props:**
- `value: string` - Texto de la biografía
- `onChange: (value: string) => void` - Callback al cambiar
- `specialty: string` - Especialidad del médico
- `doctorName: string` - Nombre del médico

### 6. ProfessionalAvatarUpload
Upload de avatar con validación y guías profesionales.

**Props:**
- `currentUrl: string | null` - URL actual del avatar
- `onUpload: (url: string) => void` - Callback al subir
- `userName: string` - Nombre del usuario

### 7. FieldWithContext
Campo de formulario con contexto educativo y validación visual.

**Props:**
- `label: string` - Etiqueta del campo
- `value: string | string[]` - Valor del campo
- `onChange?: (value: any) => void` - Callback al cambiar
- `type?: "text" | "email" | "phone" | "specialty" | "multi-specialty"` - Tipo de campo
- `locked?: boolean` - Si está bloqueado
- `verified?: boolean` - Si está verificado
- `contextInfo?: string` - Información contextual
- `impact?: string` - Descripción del impacto
- `allowedValues?: string[]` - Valores permitidos
- `placeholder?: string` - Placeholder
- `error?: string` - Mensaje de error
- `warning?: string` - Mensaje de advertencia

### 8. ProfileImpactMetrics
Visualización de métricas de impacto del perfil.

**Props:**
- `completeness: ProfileCompleteness` - Datos de completitud
- `profile: ProfileData` - Datos del perfil

## 📊 Sistema de Niveles

### Básico (0-60%)
- Color: Gris
- Icono: Star
- Descripción: "Completa tu perfil para destacar"

### Completo (60-80%)
- Color: Azul
- Icono: Award
- Descripción: "¡Buen trabajo! Sigue mejorando"

### Profesional (80-95%)
- Color: Índigo
- Icono: Trophy
- Descripción: "Perfil destacado y confiable"

### Elite (95-100%)
- Color: Púrpura/Rosa (gradiente)
- Icono: Crown
- Descripción: "¡Excelencia profesional!"
- Efecto especial: Glow animado

## 🎨 Cálculo de Completitud

```typescript
const fields = {
  avatar_url: 15%,
  nombre_completo: 10%,
  email: 5%,
  telefono: 10%,
  cedula: 10%,
  especialidad: 15%,
  biografia: 25% (mínimo 150 palabras),
  especialidades_adicionales: 10%
}
```

## 🔧 Integración

### Paso 1: Importar el componente

```tsx
import { ProfileSectionV2 } from "@/components/dashboard/medico/configuracion/profile-section-v2";
```

### Paso 2: Usar en la página

```tsx
export default function ConfiguracionPage() {
  return (
    <div>
      <ProfileSectionV2 />
    </div>
  );
}
```

### Paso 3: Asegurar dependencias

El componente requiere:
- Supabase configurado
- Tablas: `profiles`, `doctor_details`, `specialties`
- Storage bucket: `profiles` (para avatares)
- API endpoint: `/api/ai/improve-bio` (opcional, para mejora de biografía)

## 🎯 Métricas Calculadas

### Visibilidad (0-100%)
Basada en la completitud del perfil. Más campos completos = mayor visibilidad en búsquedas.

### Confianza (0-100%)
- Verificado SACS: +40%
- Avatar profesional: +20%
- Biografía completa (150+ palabras): +20%
- Especialidades adicionales: +10%
- Teléfono: +10%

### Conversión (0-100%)
Estimada como: `completitud * 1.2`

## 🚀 Características Avanzadas

### 1. Análisis de Biografía en Tiempo Real
- Contador de palabras
- Score de legibilidad
- Detección de credenciales
- Detección de experiencia
- Detección de especialidades
- Sugerencias contextuales

### 2. Validación de Avatar
- Validación de dimensiones (mínimo 200x200)
- Validación de aspecto ratio (cuadrado)
- Validación de tamaño (máximo 5MB)
- Score de calidad (0-100)

### 3. Contexto Educativo
Cada campo explica:
- Por qué es importante
- Cómo impacta en el perfil
- Sugerencias de mejora

### 4. Vista Previa en Vivo
- Actualización en tiempo real
- Toggle móvil/desktop
- Simulación exacta de cómo lo ven los pacientes

## 🎨 Paleta de Colores

```css
/* Niveles */
--basic: #6B7280 (gray)
--complete: #3B82F6 (blue)
--professional: #6366F1 (indigo)
--elite: #8B5CF6 (purple)

/* Estados */
--success: #10B981 (green)
--warning: #F59E0B (yellow)
--error: #EF4444 (red)
--info: #3B82F6 (blue)
```

## 📱 Responsive

- **Mobile (< 768px)**: Una columna, preview en modal
- **Tablet (768px - 1024px)**: Una columna, preview colapsable
- **Desktop (> 1024px)**: Dos columnas, preview fijo

## ♿ Accesibilidad

- ARIA labels en todos los campos
- Navegación por teclado completa
- Contraste WCAG AAA
- Screen reader friendly
- Focus indicators claros

## 🔐 Seguridad

- Validación de imágenes (tipo, tamaño)
- Sanitización de biografía
- Rate limiting en mejoras de IA (recomendado)
- Campos bloqueados tras verificación SACS

## 📝 Notas de Implementación

1. **Campos Bloqueados**: Nombre y cédula se bloquean tras verificación SACS
2. **Especialidades Permitidas**: Se obtienen del campo `sacs_data.especialidades`
3. **Avatar Storage**: Se guarda en `profiles/avatars/{user_id}-{timestamp}.{ext}`
4. **Mejora de IA**: Endpoint opcional, el componente funciona sin él

## 🐛 Troubleshooting

### El progress ring no se anima
- Verificar que Framer Motion esté instalado
- Verificar que el porcentaje sea un número válido (0-100)

### La vista previa no se actualiza
- Verificar que el estado `profile` se esté actualizando correctamente
- Verificar que los props se pasen correctamente

### Error al subir avatar
- Verificar que el bucket `profiles` exista en Supabase Storage
- Verificar permisos de escritura en el bucket
- Verificar que el usuario esté autenticado

### La mejora de IA no funciona
- Verificar que el endpoint `/api/ai/improve-bio` exista
- El componente funciona sin este endpoint, solo no tendrá la función de mejora

## 📚 Referencias

- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [React Hook Form](https://react-hook-form.com/)
