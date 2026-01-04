# Plan de Corrección de Errores

## Diagnóstico
El error `Maximum update depth exceeded` es causado por un ciclo infinito de renderizado en `ChatWindow.useEffect`.
1.  `useTranslation` devuelve una nueva función `t` en cada renderizado (no está memoizada).
2.  `ChatWindow` tiene un `useEffect` con `t` en su array de dependencias: `[t]`.
3.  Dentro del efecto, se llama a `setMessages`, lo que provoca un re-render.
4.  El re-render crea una nueva función `t`.
5.  El efecto se dispara de nuevo debido a que `t` cambió -> Ciclo infinito.

Adicionalmente, el error de `ScrollArea` es probablemente un efecto secundario del ciclo de renderizado rápido o un problema de paso de props inválidos durante el ciclo.

## Solución Propuesta

### 1. Estabilizar el hook `useTranslation`
Modificar `lib/hooks/use-translation.ts` para memoizar la función `t` usando `useCallback`. Esto evitará que la referencia de la función cambie a menos que cambie el idioma.

### 2. Corregir Dependencias en `ChatWindow`
Modificar `components/chatbot/chat-window.tsx`:
*   Eliminar `t` de las dependencias del `useEffect` de inicialización, ya que la carga del historial (`loadHistory`) solo debe ocurrir una vez al montar el componente, independientemente de los cambios de idioma.
*   Si queremos actualizar el mensaje de bienvenida al cambiar el idioma, debemos hacerlo de forma controlada, pero para corregir el error crítico, primero aseguraremos que la inicialización sea estable.

### 3. Verificar `ScrollArea`
Una vez corregido el ciclo de renderizado, el error de `ScrollArea` debería desaparecer. Si persiste, revisaremos la implementación de `ScrollArea` para asegurar que recibe las referencias correctamente.

## Pasos de Ejecución
1.  Editar `lib/hooks/use-translation.ts` para añadir `useCallback`.
2.  Editar `components/chatbot/chat-window.tsx` para dejar el array de dependencias vacío `[]` en el efecto de carga inicial.
3.  Verificar que el error desaparezca.