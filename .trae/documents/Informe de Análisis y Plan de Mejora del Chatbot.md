# Plan de Optimización del Chatbot Red Salud

El siguiente plan detalla las fases de implementación para robustecer el sistema actual, basándose en el análisis exhaustivo realizado.

## Fase 1: Optimización del Motor de Respuestas (Inmediato)
**Objetivo:** Mejorar la precisión y reducir respuestas genéricas o "no sé".

1.  **Refinamiento de Algoritmo RAG:**
    *   Modificar `chatbot-service.ts` para implementar una **Búsqueda Híbrida Real** en lugar de solo fallback. Combinar puntuación vectorial + palabras clave para re-rankear resultados.
    *   Ajustar el umbral de similitud (actualmente 0.25/0.4) para ser más tolerante en preguntas semánticamente complejas pero menos en datos factuales.
2.  **Mejora del Prompt del Sistema:**
    *   Estructurar mejor el `systemPrompt` para manejar casos de borde (insultos sutiles, competencia, intentos de jailbreak).
    *   Incluir instrucciones explícitas para formateo de precios y listas, asegurando consistencia visual.

## Fase 2: Experiencia de Usuario y Personalización (Corto Plazo)
**Objetivo:** Hacer que el bot se sienta más inteligente y contexto-consciente.

1.  **Detección de Intención:**
    *   Implementar una capa ligera de clasificación antes de la búsqueda vectorial para detectar si el usuario quiere: *Información* (RAG), *Soporte* (Ticket/Humano), o *Charla* (Greeting).
2.  **Mejoras en UI (Frontend):**
    *   Añadir estado de "Cargando fuentes..." para dar transparencia al usuario de que se está buscando información.
    *   Mejorar la accesibilidad (ARIA labels) en `chat-window.tsx`.

## Fase 3: Infraestructura y Análisis (Mediano Plazo)
**Objetivo:** Tomar decisiones basadas en datos.

1.  **Dashboard de Métricas:**
    *   Crear una vista administrativa simple para visualizar los datos de la tabla `chatbot_feedback`.
    *   Calcular métricas de "Tasa de Resolución" basada en los pulgares arriba/abajo.
2.  **Soporte Multilingüe (Preliminar):**
    *   Refactorizar textos duros en `chat-window.tsx` a un archivo de constantes o hook de i18n.
    *   Detectar idioma de entrada en `chatbot-service.ts` y ajustar el `systemPrompt` dinámicamente.

## Recursos Técnicos Requeridos
*   **Backend:** Node.js/Next.js (Existente), Supabase Vector (Existente).
*   **IA:** OpenRouter/Gemini (Existente).
*   **Tiempo Estimado:** 3-5 días de desarrollo para Fase 1 y 2.

## Métricas de Éxito
*   **Precisión:** Aumento en el % de feedback positivo (target > 90%).
*   **Retención:** Disminución de abandonos de chat sin respuesta.
*   **Velocidad:** Mantener latencia de respuesta < 2s.