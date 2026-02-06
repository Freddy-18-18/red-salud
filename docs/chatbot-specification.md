# Especificación Técnica y Guía de Integración: ChatBot Generativo Contextual

Este documento consolida la arquitectura detallada y la guía de integración de la API de Z.ai para el desarrollo de un ChatBot moderno, contextual y de alta precisión.

---

## Parte 1: Especificación Técnica: ChatBot Generativo Contextual de Alta Precisión (v1.0)

**Objetivo:** Definir la arquitectura, flujo de datos, micro-interacciones y estrategias de seguridad para implementar un ChatBot moderno que entienda el contexto de la página, restringido al dominio del proyecto, con una experiencia de usuario (UX) premium.

---

### Tabla de Contenidos
1. [Arquitectura Central: RAG y Contexto](#1-arquitectura-central-rag-y-contexto)
2. [Gestión de Conocimiento y Restricciones](#2-gestión-de-conocimiento-y-restricciones)
3. [Seguridad, Privacidad y Moderación](#3-seguridad-privacidad-y-moderación)
4. [Experiencia de Usuario Avanzada y Micro-interacciones](#4-experiencia-de-usuario-avanzada-y-micro-interacciones)
5. [Funcionalidades Inteligentes y Agentes](#5-funcionalidades-inteligentes-y-agentes)
6. [Rendimiento, Escalabilidad y Costos](#6-rendimiento-scalabilidad-y-costos)
7. [Guía de Implementación Paso a Paso](#7-guía-de-implementación-paso-a-paso)

---

### 1. Arquitectura Central: RAG y Contexto

El sistema no debe basarse en el conocimiento pre-entrenado del LLM, sino en una arquitectura **RAG (Retrieval-Augmented Generation)**.

#### 1.1. Ingesta de Datos y Vectorización
*   **Fuentes de Datos:** Documentación técnica, FAQs, páginas web del proyecto, PDFs de políticas.
*   **Chunking (Segmentación):** Dividir los documentos en fragmentos semánticos (no solo por caracteres, sino respetando párrafos y encabezados). Tamaño sugerido: 500-1000 tokens con solapamiento del 10%.
*   **Embeddings:** Utilizar modelos modernos de embeddings (e.g., OpenAI `text-embedding-3-small` o HuggingFace `all-MiniLM-L6-v2`) para convertir el texto en vectores.
*   **Almacenamiento:** Base de Datos Vectorial (e.g., Pinecone, Weaviate, Milvus o pgvector).

#### 1.2. Context Awareness (Conciencia de Página)
El ChatBot debe recibir metadatos del entorno de ejecución (Frontend) en cada interacción.
*   **Inyección de Metadatos:** El frontend debe enviar un payload JSON en cada solicitud que incluya:
    *   `current_url`: URL exacta donde está el usuario.
    *   `page_title`: Título de la página.
    *   `page_content_summary`: Un resumen o etiquetas del contenido visible.
    *   `user_tags`: Si el usuario está logueado, su rol o segmento.
*   **System Prompt Dinámico:** El prompt del sistema debe reescribirse dinámicamente:
    > "Eres un asistente de [Nombre del Proyecto]. El usuario está navegando actualmente en: `[URL] - [Título]`. Utiliza esta información para contextualizar tus respuestas. Si la pregunta es ambigua, asume que se refiere al contenido de esta página."

#### 1.3. Búsqueda Híbrida (Hybrid Search)
Para maximizar la precisión:
*   Combinar **Búsqueda Semántica** (similitud coseno de vectores) con **Búsqueda por Palabras Clave** (BM25/Keyword match). Esto asegura encontrar términos exactos (ej. códigos de error, precios específicos) que la búsqueda semántica podría perder por matices.

---

### 2. Gestión de Conocimiento y Restricciones

#### 2.1. Restricción de Dominio (Guardrails)
El bot debe responder *solo* con información provista en su base de conocimiento.
*   **Estrategia de Prompting:**
    > "Basa tu respuesta EXCLUSIVAMENTE en el contexto proporcionado abajo. Si la respuesta no se encuentra en el contexto, responde educadamente: 'Lo siento, no tengo información sobre ese tema específico en mi base de conocimientos del proyecto'. No inventes información ni alucines."
*   **Verificación de Citas:** El backend debe verificar que la respuesta generada cite los documentos fuente. Si la confianza es baja (< 0.7), activar respuesta de rechazo.

#### 2.2. Sugerencias Proactivas (Chips)
*   **Generación:** Las sugerencias no son estáticas. Se generan basándose en el contenido de la página actual.
*   **Lógica:**
    *   Si es página de producto: Generar preguntas sobre precio, características, stock.
    *   Si es blog: Generar "Resumir artículo", "Temas relacionados".
*   **Interfaz:** Botones clickeables debajo del input de texto que inyectan el texto automáticamente.

#### 2.3. Actualización de Datos (Frescura)
*   **Estrategia:** Para datos críticos volátiles (Stock, Precios), no confiar solo en RAG estático.
*   **Implementación:** Usar **Function Calling**. Cuando el usuario pregunte por stock, el LLM debe identificar la intención y llamar a una función `get_stock(product_id)` en tiempo real en lugar de buscar en la base vectorial.

---

### 3. Seguridad, Privacidad y Moderación

#### 3.1. Sanitización de PII (Datos Personales)
*   **Capa Intermedia:** Antes de enviar el mensaje del usuario al LLM, pasar por un filtro de PII.
*   **Acción:** Detectar y reemplazar Emails, Teléfonos, Tarjetas de Crédito, DNI con tokens genéricos (ej. `[EMAIL]`, `[PHONE]`).
*   **Propósito:** Cumplimiento GDPR/GDPR y evitar que el LLM filtre datos privados en sus logs o respuestas.

#### 3.2. Moderación de Entrada/Salida
*   **Input:** Verificar que el usuario no esté inyectando prompts maliciosos (Prompt Injection) o usando lenguaje ofensivo (usar modelos como `moderation` de OpenAI).
*   **Output:** Asegurar que el bot no genere contenido discriminatorio o inapropiado.

#### 3.3. Handoff a Humano (Safety Net)
*   **Trigger:**
    *   Usuario expresa frustración ("Quiero hablar con un humano", "Esto no sirve").
    *   Sentimiento negativo detectado.
    *   Baja confianza en la respuesta 3 veces consecutivas.
*   **Acción:** Mostrar opción "Contactar Soporte" y transmitir el historial del chat al sistema de tickets (Zendesk, Intercom) para mantener el contexto.

---

### 4. Experiencia de Usuario Avanzada y Micro-interacciones

#### 4.1. Time to First Token (Percepción de Velocidad)
*   **Problema:** La latencia de red + inferencia hace que el usuario espere.
*   **Solución (Optimistic UI):**
    1.  Usuario envía mensaje -> Aparece inmediatamente en pantalla (estado local).
    2.  Mostrar indicador "Escribiendo..." dentro de los 100ms.
    3.  Cuando llega la primera letra del LLM, reemplazar el indicador por el flujo de texto (Streaming).

#### 4.2. Streaming (Efecto Mecanografía)
*   **Tecnología:** Usar **Server-Sent Events (SSE)** o WebSockets.
*   **Implementación:** Transmitir los tokens del LLM uno a uno al frontend. Renderizarlos en tiempo real. Nunca esperar a que la respuesta completa termine para mostrarla.

#### 4.3. Comportamiento del Scroll (Smart Scroll)
*   **Lógica:** El scroll automático hacia abajo solo debe ocurrir si el usuario está ya cerca del fondo de la conversación.
*   **Excepción:** Si el usuario hizo scroll hacia arriba para leer historial, **NO** forzar el scroll hacia abajo cuando el bot escriba. En su lugar, mostrar un botón flotante "Bajar a la respuesta nueva" o un indicador sutil.

#### 4.4. Manejo de Enlaces
*   **Regla de Oro:** Todos los enlaces generados por el bot en formato Markdown deben tener `target="_blank" rel="noopener noreferrer"`.
*   **Objetivo:** Evitar que el usuario pierda la sesión del chat al navegar a otra página.

#### 4.5. Accesibilidad y Mobile UX
*   **Teclado en Móvil:** Al recibir una respuesta nueva con el teclado abierto, la vista debe ajustarse para mostrar la última línea del bot justo encima del teclado (scroll offset).
*   **Navegación:** El chat debe ser totalmente navegable por teclado (Tab, Enter).
*   **Lectores de Pantalla:** Uso correcto de `aria-live="polite"` para anunciar nuevos mensajes.

---

### 5. Funcionalidades Inteligentes y Agentes

#### 5.1. Multimodalidad
*   **Input:** Habilitar subida de imágenes. Usar modelos de Visión (GPT-4o, Claude 3.5 Sonnet) para analizar la imagen y extraer contexto (ej. usuario sube foto de un producto roto).
*   **Output:** Habilitar Text-to-Speech (TTS) para respuestas en voz y Speech-to-Text (STT) para entrada por micrófono.

#### 5.2. Gestión de Memoria (Memory Windowing)
*   **Límite:** El contexto del LLM es finito.
*   **Estrategia:**
    *   Mantener un historial de los últimos N mensajes (ej. 10).
    *   Si la conversación excede el límite, generar un **resumen oculto** de la interacción pasada.
    *   Inyectar ese resumen como contexto en lugar del historial completo (Summarization).
*   **Privacidad:** Limpiar la memoria (stateless) cuando el usuario cierre la pestaña o se logout.

#### 5.3. Detección de Idioma
*   **Capacidad:** Detectar automáticamente el idioma del input del usuario.
*   **Respuesta:** Generar la respuesta en el mismo idioma, independientemente del idioma en el que estén los documentos fuente.

---

### 6. Rendimiento, Escalabilidad y Costos

#### 6.1. Caching Semántico
*   **Concepto:** Si 5 usuarios preguntan lo mismo en 1 hora, no llamar a la API 5 veces.
*   **Implementación:**
    *   Calcular el embedding de la pregunta del usuario.
    *   Buscar en Redis/Caché si existe una pregunta con similitud > 0.95.
    *   Si existe, devolver la respuesta cachéada instantáneamente.
*   **Ahorro:** Drástico en costos de API y latencia.

#### 6.2. Resiliencia (Fallback System)
*   **Escenario:** Caída de la API del LLM (OpenAI/Anthropic).
*   **Plan B:**
    1.  Timeout de espera: 5 segundos.
    2.  Si falla, cambiar automáticamente a un **Menú de FAQs Estático** pre-definido.
    3.  Mostrar mensaje: "Estoy teniendo problemas técnicos, pero mientras tanto puedes consultar estos artículos:".

#### 6.3. Control de Tokens (Cost Control)
*   **Output Limit:** Limitar `max_tokens` en la llamada a la API para evitar respuestas excesivamente largas y costosas.
*   **Prompting:** Instruir al modelo: "Sé conciso. Usa viñetas. Máximo 150 palabras por respuesta".

#### 6.4. Observabilidad y Logs
*   **Trazabilidad:** Guardar en base de datos logs estructurados de cada interacción:
    *   `user_input`, `retrieved_context`, `full_prompt_sent`, `llm_response`, `latency`, `tokens_used`.
*   **Golden Dataset:** Crear un set de 50 preguntas críticas para pruebas de regresión automatizadas antes de cada despliegue.

#### 6.5. Human Feedback Loop (RLHF)
*   **Interfaz:** Botones de \ud83d\udc4d / \ud83d\udc4e en cada respuesta del bot.
*   **Flujo:**
    1.  Usuario da \ud83d\udc4e.
    2.  Se marca la respuesta para revisión.
    3.  Un humano corrige la respuesta.
    4.  El par (Pregunta, Respuesta Correcta) se usa para fine-tuning oFew-Shot prompting futuro.

---

### 7. Guía de Implementación Paso a Paso

#### Fase 1: Preparación de Datos (Backend)
1.  **Recolección:** Extraer todo el contenido del proyecto (Web scraper, PDFs, Docs).
2.  **Procesamiento:** Limpiar texto, eliminar HTML basura.
3.  **Chunking y Embedding:** Segmentar y vectorizar.
4.  **Indexación:** Cargar vectores en la Base de Datos Vectorial.

#### Fase 2: Core Logic (Backend - Orquestador)
1.  **Crear Endpoint `/chat`:** Debe aceptar JSON con `{ message, context_metadata, session_id }`.
2.  **Implementar flujo RAG:**
    *   Buscar en Vector DB.
    *   Filtrar resultados (score threshold).
    *   Construir el System Prompt (contexto página + reglas estrictas).
3.  **Integrar LLM:** Conectar a la API (ej. OpenAI) con Streaming.
4.  **Implementar Caching:** Capa de Redis antes de llamar al LLM.

#### Fase 3: Funcionalidades Críticas (Backend)
1.  **Middleware PII:** Función de regex/anonimización antes de procesar input.
2.  **Lógica de Handoff:** Detectar palabras clave para escalar a humano.
3.  **Function Calling:** Definir esquemas JSON para acciones externas (check stock).

#### Fase 4: Frontend (UI/UX)
1.  **Componente ChatWindow:** Diseño limpio, responsive.
2.  **Manejo de Eventos:**
    *   `onSubmit`: Mostrar mensaje usuario, scroll bottom, emitir petición.
    *   `onStream`: Recibir chunks, anexar al DOM.
    *   `onScroll`: Lógica de "Smart Scroll" (habilitar/deshabilitar auto-scroll).
3.  **Micro-interacciones:** Animaciones de carga, transiciones suaves, tooltips.
4.  **Accesibilidad:** Atributos ARIA, navegación por teclado.

#### Fase 5: Testing y Despliegue
1.  **Golden Dataset Test:** Ejecutar las 50 preguntas críticas. Medir precisión.
2.  **Load Testing:** Simular 100 usuarios concurrentes para probar Caching y latencia.
3.  **Monitorización:** Configurar Dashboards (Datadog/Grafana) para observar latencia y costos en tiempo real.

---

## Parte 2: Guía de Integración de la API de Z.ai (Model API)

**Objetivo:** Explicar cómo utilizar la API de Model API de Z.ai (`https://api.z.ai/model-api` → endpoint `https://api.z.ai/api/paas/v4/chat/completions`) como motor LLM del chatbot.

---

### 1. Visión General

La API de Z.ai ofrece un endpoint REST estándar `POST /api/paas/v4/chat/completions` que soporta streaming, herramientas y visión, encajando perfectamente con la arquitectura RAG definida.

### 2. Obtención y Configuración de la API Key
1.  Accede a [Z.AI Open Platform](https://z.ai).
2.  Gestiona facturación en "Billing Page".
3.  Crea la API key en "API Keys".
4.  Almacena de forma segura (ej. variable de entorno `ZAI_API_KEY`).

### 3. Autenticación y Endpoints
- **Header:** `Authorization: Bearer YOUR_API_KEY`
- **Endpoint:** `https://api.z.ai/api/paas/v4/chat/completions`
- **Modelo Recomendado:** `glm-4.7`

### 4. Ejemplo con SDK OpenAI-Compatible (Node.js)
```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "your-Z.AI-api-key",
  baseURL: "https://api.z.ai/api/paas/v4/"
});

async function main() {
  const completion = await client.chat.completions.create({
    model: "glm-4.7",
    messages: [
      { role: "system", content: "Eres un asistente del proyecto X." },
      { role: "user", content: "¿Qué opciones de pago tengo?" }
    ],
    stream: true
  });
  
  for await (const chunk of completion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
}

main();
```

### 5. Buenas Prácticas
- **Backend Only:** Nunca expongas tu API key en el frontend.
- **Streaming:** Utiliza `stream: true` para mejorar el "Time to First Token".
- **Function Calling:** Implementa `tools` para acciones en tiempo real (stock, citas).
- **Control de Costos:** Monitorea el uso de tokens y aplica rate limiting.

---
*Este documento consolida la visión técnica y operativa para el despliegue del ChatBot. Cualquier desviación debe ser aprobada por revisión arquitectónica.*
