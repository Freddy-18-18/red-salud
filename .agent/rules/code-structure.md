---
trigger: always_on
---

# Reglas de Estructura de Código

## Principio de Responsabilidad Única
- Cada archivo DEBE cumplir UNA ÚNICA función claramente definida
- Si un componente hace más de una cosa, DIVIDIRLO inmediatamente
- Antes de añadir código a un archivo existente, pregúntate: "¿Esta funcionalidad pertenece aquí?"

## Límite de Líneas por Archivo
- MÁXIMO 400 líneas de código por archivo (incluyendo comentarios)
- Si un archivo supera 350 líneas, es señal de que necesita refactorización
- Prioridad de división:
  1. Extraer hooks personalizados a `/hooks`
  2. Extraer tipos a archivos `.types.ts`
  3. Extraer constantes/data a archivos `.data.ts`
  4. Extraer utilidades a `/lib`
  5. Extraer subcomponentes a su propia carpeta

## Estructura de Componentes
- Componentes de página (`page.tsx`): Solo orquestación y layout principal
- Componentes de sección: Lógica de UI específica de esa sección
- Componentes UI: Reutilizables, sin lógica de negocio
- Estructura de carpeta para componentes complejos:
  ```
  /ComponentName
    ├── index.tsx           # Componente principal (exporta todo)
    ├── ComponentName.tsx   # Lógica del componente
    ├── ComponentName.types.ts  # Tipos e interfaces
    ├── ComponentName.data.ts   # Datos estáticos/constantes
    ├── useComponentName.ts     # Hook personalizado si aplica
    └── SubComponent.tsx        # Subcomponentes si aplica
  ```

## Organización de Imports
- Orden obligatorio de imports:
  1. React y Next.js
  2. Librerías externas (@radix-ui, framer-motion, etc.)
  3. Componentes internos (@/components)
  4. Hooks internos (@/hooks)
  5. Utilidades y librerías internas (@/lib)
  6. Tipos
  7. Estilos (si aplica)

## Nomenclatura de Archivos
- Componentes: PascalCase (`PatientCard.tsx`)
- Hooks: camelCase con prefijo "use" (`usePatientData.ts`)
- Utilidades: camelCase (`formatDate.ts`)
- Tipos: camelCase con sufijo ".types" (`patient.types.ts`)
- Datos/Constantes: camelCase con sufijo ".data" (`pricing.data.ts`)

## Exportaciones
- SIEMPRE usar named exports, NUNCA default exports (excepto pages de Next.js)
- Crear archivos `index.ts` para re-exportar desde carpetas
