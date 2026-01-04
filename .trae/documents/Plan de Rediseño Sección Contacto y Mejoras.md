# Plan de Rediseño: Sección de Contacto y Mejoras Visuales

A continuación, presento la estrategia para rediseñar la sección de contacto y solucionar los problemas de contraste detectados, garantizando una experiencia visual impecable en ambos modos.

## 1. Rediseño Sección de Contacto (CTA Final)
Transformaremos la sección final en un **Centro de Contacto** estructurado y accesible, abandonando el diseño de "banner único" por un layout más funcional.

*   **Estructura (Grid 2 Columnas)**:
    *   **Columna Izquierda (Información)**: Título claro ("¿Necesitas ayuda?"), texto descriptivo y datos de contacto directos (Email, Horario).
    *   **Columna Derecha (Acciones)**: Tarjeta destacada con los botones de acción principales.
*   **Botón "Contáctanos"**:
    *   **Estilo**: Botón Primario (Fondo sólido, texto contraste alto).
    *   **Tipografía**: 16px (1rem), peso Medium/Semibold.
    *   **Dimensiones**: Padding vertical 14px (`py-3.5`), horizontal 32px (`px-8`).
    *   **Interacción**: Escala suave (`scale-105`) y aumento de sombra al hover.
*   **Iconografía**:
    *   Reemplazo del `Rocket` (genérico) por `MessageCircle` o `Headset` (comunicación).
    *   Inclusión de iconos funcionales (`Mail`, `Clock`) para los datos de contacto.
*   **Fondo y Contraste**:
    *   Uso de `bg-muted/50` o un tono neutro suave que funcione en ambos modos, eliminando los problemas de legibilidad del fondo anterior.

## 2. Solución de Iconos "Casa" y "Nosotros" (Breadcrumbs)
Atenderé la solicitud de reemplazar los iconos poco intuitivos en la navegación superior.

*   **Breadcrumbs**:
    *   Reemplazar icono `Home` (Casa) por texto "Inicio" para mayor claridad, o un icono más moderno como `Grid` si se prefiere visual. *Asumiré texto "Inicio" + icono sutil.*
    *   Asegurar que el indicador de la página actual ("Nosotros") sea visualmente distinto (negrita/color primario) sin necesidad de iconos redundantes.

## 3. Corrección de Contraste (Sección Stats)
He detectado que la sección de estadísticas ("8 Roles integrados...") tiene problemas de visibilidad en ciertos modos debido a la inversión de colores.

*   **Acción**: Forzar un fondo oscuro permanente (`bg-slate-900` o variable `primary` oscura) con texto blanco para esta franja específica. Esto garantiza que se vea elegante y legible tanto en modo claro como oscuro, actuando como un "break" visual consistente.

## Entregables
1.  Actualización de `app/(public)/nosotros/page.tsx` con la nueva sección de contacto y corrección de stats.
2.  Actualización de `components/ui/breadcrumbs.tsx` para mejorar la iconografía.
3.  Verificación de contrastes y responsividad.
