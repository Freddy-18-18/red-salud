# Arquitectura del Monorepo Red Salud

## 📐 Estructura de Alto Nivel

Este proyecto utiliza una arquitectura **Monorepo** basada en Turborepo/Nx, diseñada para escalar a múltiples plataformas (Web, Desktop, Mobile) compartiendo el 90% del código.

```mermaid
graph TD
    subgraph APPS [Aplicaciones (Entry Points)]
        Web[apps/web<br>Next.js]
        Desktop[apps/desktop<br>Tauri + React]
        Mobile[apps/mobile<br>Expo/Flutter]
    end

    subgraph PACKAGES [Librerías Compartidas (Core)]
        UI[packages/ui<br>Componentes Visuales]
        Types[packages/types<br>Interfaces & DB Types]
        Core[packages/core<br>Utilidades & Hooks]
        Config[packages/config<br>ESLint, TSConfig]
    end

    Web --> UI
    Web --> Types
    Web --> Core
    
    Desktop --> UI
    Desktop --> Types
    Desktop --> Core

    UI --> Types
    Core --> Types
```

## 🛡 Reglas de Oro para Escalabilidad

1.  **Las Apps son "Cáscaras Delgadas"**:
    *   Una app (`apps/web`) solo debe encargarse del **Enrutamiento** (Routing) y la **Configuración** de entorno.
    *   Toda la lógica de negocio debe vivir en `packages/core` o servicios.
    *   Toda la interfaz visual debe vivir en `packages/ui` o `components/` propios si son muy específicos.

2.  **Una Sola Fuente de Verdad para Tipos**:
    *   NUNCA redefinir una interfaz de Usuario o Cita en el frontend.
    *   IMPORTAR siempre desde `@red-salud/types`. Esto asegura que si la base de datos cambia, el error salta en tiempo de compilación.

3.  **Componentes Agnósticos**:
    *   Un botón en `packages/ui` no debe saber si está en la Web o en Desktop.
    *   Recibe props y emite eventos. No hace llamadas a API directas si puede evitarlo.

## 📂 Mapa de Directorios

### `apps/`
*   `web/`: Portal principal (Pacientes, Profesionales, Admin). SSR con Next.js.
*   `desktop/`: Aplicación instalable para clínicas (Offline-first).

### `packages/`
*   `ui/`: Sistema de Diseño (Atomos, Moleculas, Organismos).
*   `types/`: Definiciones TypeScript compartidas (Zod schemas, DB interfaces).
*   `core/`: Hooks compartidos (`useAuth`), utilidades de fecha, validadores.

### `services/`
*   Backend for Frontend (BFE) o microservicios específicos si se desacoplan de Next.js API Routes.

## 🚀 Flujo de Trabajo
1.  **Nueva Feature**: "Crear tarjeta de paciente".
2.  **Paso 1**: Definir tipo en `packages/types`.
3.  **Paso 2**: Crear componente visual en `packages/ui`.
4.  **Paso 3**: Implementar en `apps/web` importando lo anterior.
