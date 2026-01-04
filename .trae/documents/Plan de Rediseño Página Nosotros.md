# Rediseño de la Página "Nosotros" - Red-Salud

A continuación presento el plan detallado para transformar la página `/nosotros` en una experiencia visual moderna, inmersiva y alineada con la identidad "Aurora Health".

## 1. Hero Section (100% Viewport)
**Objetivo**: Crear un impacto inmediato y ocupar toda la pantalla inicial.
- **Estructura**: `min-h-screen flex items-center justify-center`.
- **Fondo**: Mantener los "blobs" animados pero ajustar su opacidad y posición para mayor profundidad. Añadir un sutil patrón de ruido o malla si es posible (via CSS) para textura.
- **Contenido**:
  - Título principal más grande y con `gradient-text-animated`.
  - Badge "Startup venezolana" con efecto `glass`.
  - Indicador de scroll animado (flecha hacia abajo) en la parte inferior para invitar a la navegación.

## 2. Nuestra Historia (Diseño Asimétrico)
**Objetivo**: Romper la monotonía del texto centrado.
- **Layout**: Grid de 2 columnas en desktop.
  - Columna Izquierda: Texto narrativo (contenido actual).
  - Columna Derecha: Elemento visual abstracto o composición de iconos flotantes (Target, Heart, Lightbulb) representando la "construcción" de la solución.
- **Estilo**: Uso de tarjetas `glass-card` para el texto.

## 3. Misión y Visión (Tarjetas Interactivas)
**Objetivo**: Dar peso a los pilares fundamentales.
- **Mejora**: Aplicar efecto `hover-lift` y `shadow-glow` a las tarjetas.
- **Iconografía**: Aumentar el tamaño de los iconos y usar fondos con gradientes más vibrantes.

## 4. Valores (Grid Dinámico)
**Objetivo**: Mostrar la cultura de la empresa de forma atractiva.
- **Layout**: Mantener el grid de 4 columnas.
- **Interacción**: Efecto de borde brillante al hacer hover (`border-primary`).
- **Animación**: `staggerContainer` para que aparezcan uno a uno.

## 5. Fundador (Perfil Profesional)
**Objetivo**: Humanizar la marca.
- **Diseño**: Tarjeta horizontal con imagen (placeholder con iniciales) a la izquierda y texto a la derecha.
- **Detalle**: Añadir un fondo sutil detrás de la foto para destacarla.

## 6. Stats (Banda de Impacto)
**Objetivo**: Mostrar credibilidad.
- **Estilo**: Sección con fondo oscuro (o gradiente fuerte) y texto claro para contraste.
- **Animación**: Contadores que suben de 0 al valor final (si es posible con framer-motion, o simple fade-in).

## 7. Roadmap y CTA Final
**Objetivo**: Mostrar transparencia y cerrar con una llamada a la acción clara.
- **Roadmap**: Mejorar la línea de tiempo con conectores más visibles y estados (completado, en progreso) más distintivos.
- **CTA**: Botones grandes con `shadow-glow` y efectos de hover.

## Entregables Técnicos
- Archivo `app/(public)/nosotros/page.tsx` completamente reescrito.
- Uso de componentes existentes (`Card`, `Button`, `Badge`) y utilidades de `globals.css` (`glass-card`, `gradient-text`, `animate-blob`).
- Código limpio, tipado y optimizado para SEO y performance.
