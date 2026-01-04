---
trigger: always_on
---

# Reglas de Patrones UI y Diseño

## Diseño Premium Obligatorio
- NUNCA crear UIs simples o básicas - siempre diseño premium
- Elementos obligatorios para cada página:
  1. Efectos de glassmorphism donde sea apropiado
  2. Gradientes suaves (nunca colores sólidos planos)
  3. Micro-animaciones en interacciones
  4. Sombras sutiles y profundidad visual
  5. Transiciones suaves (mínimo 200ms)

## Sistema de Colores
- NUNCA usar colores hardcodeados en componentes
- SIEMPRE usar variables CSS del tema:
  ```typescript
  // ❌ MAL
  <div className="bg-blue-500 text-white">

  // ✅ BIEN  
  <div className="bg-primary text-primary-foreground">
  ```
- Paleta médica del proyecto:
  - Primario: Azules/Teals (#0ea5e9, #14b8a6)
  - Acentos: Verdes saludables (#10b981)
  - Alertas: Usar sistema de colores de destructive/warning

## Animaciones con Framer Motion
- Patrones estándar de animación:
  ```typescript
  // Fade in desde abajo (entrada estándar)
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // Stagger para listas
  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };
  ```
- SIEMPRE usar `whileHover` y `whileTap` para elementos interactivos
- SIEMPRE usar `AnimatePresence` para elementos que entran/salen

## Responsividad Obligatoria
- Diseñar SIEMPRE mobile-first
- Breakpoints estándar:
  - `sm`: 640px
  - `md`: 768px  
  - `lg`: 1024px
  - `xl`: 1280px
- Probar SIEMPRE en al menos 3 tamaños antes de considerar completo

## Accesibilidad (A11y)
- TODOS los elementos interactivos DEBEN tener:
  - `aria-label` descriptivo
  - Estados de focus visibles
  - Contraste de color suficiente (WCAG AA mínimo)
- TODOS los formularios DEBEN tener labels asociados
- NUNCA depender solo del color para comunicar información

## Componentes UI Base
- SIEMPRE usar componentes de `/components/ui` como base
- NUNCA recrear componentes que ya existen (Button, Card, Dialog, etc.)
- Si necesitas modificar un componente base, crear variante, no duplicar

## Iconografía
- Usar EXCLUSIVAMENTE Lucide React para iconos
- Tamaños estándar: `w-4 h-4` (pequeño), `w-5 h-5` (normal), `w-6 h-6` (grande)
- SIEMPRE incluir `aria-hidden="true"` en iconos decorativos

## Estados de Loading
- NUNCA mostrar contenido vacío durante carga
- SIEMPRE usar:
  - Skeletons para contenido estructurado
  - Spinners solo para acciones puntuales
  - Estados de progreso para operaciones largas
