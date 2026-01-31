# Plan de Implementación: Sistema de Mensajería Médico-Paciente

## 🎯 Visión General

Sistema de mensajería seguro y en tiempo real para comunicación médico-paciente, inspirado en WhatsApp pero con características médicas específicas.

## 📋 Estado Actual

### ✅ Completado (70%)
- Tipos TypeScript completos para mensajería médica
- Servicio backend bien estructurado (canales, mensajes, participantes)
- Componentes UI base (MessageList, ChatInput, ChatLayout)
- Hooks personalizados (useChat, useChannels)
- Base de datos V2 creada (chat_channels, chat_messages, etc.)
- Proveedor de contexto (ChatProvider)

### ⚠️ Faltan (30%)
- Envío de mensajes funcional end-to-end
- Suscripciones en tiempo real de Supabase
- Interfaz de lista de conversaciones completa
- Mensajes médicos funcionales (recetas, resultados de lab)
- Carga de archivos y documentos médicos
- Indicadores de escribiendo y presencia
- Read receipts (checks azules)

## 🚀 Plan de Implementación

### FASE 1: Funcionalidad Básica de Mensajería (CRÍTICO)

#### 1.1 Envío de Mensajes
**Objetivo:** Permitir que médicos envíen mensajes a pacientes y viceversa.

**Implementación:**
```
1. Crear servicio de envío de mensajes (messageService.sendMessage)
2. Conectar ChatInput con el servicio
3. Agregar actualización optimista de UI
4. Manejo de errores y reintentos
5. Validación de contenido médico (PHI)
```

**Archivos:**
- `hooks/use-chat.ts` - Agregar función sendMessage real
- `components/messaging/input/ChatInput.tsx` - Conectar onSend
- `lib/supabase/services/messaging/message-service.ts` - Completar sendMessage

#### 1.2 Recepción de Mensajes en Tiempo Real
**Objetivo:** Los usuarios reciben mensajes automáticamente sin recargar.

**Implementación:**
```
1. Suscripción de Supabase realtime a chat_messages
2. Filtrado por canal_id
3. Actualización de estado en ChatProvider
4. Manejo de múltiples canales simultáneos
5. Ordenamiento correcto de mensajes
```

**Archivos:**
- `hooks/use-chat.ts` - Agregar useEffect con supabase.channel
- `components/messaging/ChatProvider.tsx` - Gestión de estado global
- `components/messaging/messages/MessageList.tsx` - Renderizado reactivo

#### 1.3 Indicadores de Escribiendo
**Objetivo:** Ver cuando el otro usuario está escribiendo.

**Implementación:**
```
1. Eventos typing_start/typing_stop
2. Mostrar "Escribiendo..." en ChatHeader
3. Timeout automático (10s)
4. Soporte multi-usuario
```

**Archivos:**
- `hooks/use-chat.ts` - Funciones startTyping/stopTyping
- `components/messaging/layout/ChatLayout.tsx` - TypingIndicator en header

#### 1.4 Read Receipts (Checks Azules)
**Objetivo:** Saber cuando el mensaje fue entregado y leído.

**Implementación:**
```
1. Tabla chat_message_reads para tracking
2. Actualización de last_read_at al seleccionar canal
3. Iconos de estado (enviando ✓, enviado ✓✓, leído ✓✓ azul)
4. Trigger automático al leer mensajes
```

**Archivos:**
- `hooks/use-chat.ts` - Función markAsRead
- `components/messaging/messages/MessageList.tsx` - Iconos de estado
- `lib/supabase/services/messaging/core/channel-service.ts` - Trigger de actualización

### FASE 2: Mensajería Médica Específica

#### 2.1 Tipos de Mensajes Médicos
**Objetivo:** Enviar recetas y resultados de laboratorio.

**Implementación:**
```
1. Selector de tipo de mensaje en ChatInput
2. Formularios para receta (medicamento, dosis, frecuencia)
3. Formularios para resultados de lab (prueba, resultado, rango)
4. Renderizado especializado en MessageList
5. Acciones rápidas (enviar a farmacia, agendar cita)
```

**Archivos:**
- `components/messaging/messages/medical/PrescriptionMessage.tsx` - Ya existe, conectar
- `components/messaging/messages/medical/LabResultMessage.tsx` - Ya existe, conectar
- `components/messaging/input/MedicalMessageSelector.tsx` - Nuevo
- `hooks/use-medical-messaging.ts` - Ya existe, completar

#### 2.2 Contexto Médico en Mensajes
**Objetivo:** Vincular mensajes con citas, recetas o lab tests.

**Implementación:**
```
1. Campo medical_context en messages
2. Agregar contexto al enviar desde cita específica
3. Tags visuales en mensajes vinculados
4. Filtro por contexto médico
5. Búsqueda por entidad médica
```

**Archivos:**
- `lib/supabase/types/messaging-v2.ts` - Tipo MedicalContext
- `hooks/use-medical-messaging.ts` - Funciones con contexto
- `components/messaging/messages/MessageItem.tsx` - Tags de contexto

#### 2.3 Archivos Médicos
**Objetivo:** Compartir PDFs, imágenes de estudios, documentos.

**Implementación:**
```
1. Integración con Supabase Storage
2. Upload de archivos con drag & drop
3. Previsualización de documentos
4. Metadata médica (tipo de documento, paciente)
5. Control de acceso HIPAA
6. Firma digital opcional
```

**Archivos:**
- `components/messaging/input/FileUpload.tsx` - Nuevo
- `lib/supabase/services/messaging/file-service.ts` - Nuevo
- `lib/storage/chat-attachments.ts` - Bucket de Supabase

### FASE 3: Experiencia de Usuario

#### 3.1 Lista de Conversaciones Mejorada
**Objetivo:** Sidebar funcional con información útil.

**Implementación:**
```
1. Mostrar último mensaje y timestamp
2. Badge de mensajes no leídos
3. Indicador de presencia (online/offline)
4. Buscador de conversaciones
5. Filtros (todos, no leídos, directos, grupos)
6. Acciones rápidas (archivar, silenciar, eliminar)
```

**Archivos:**
- `components/messaging/layout/ChatLayout.tsx` - Sidebar ya existe, mejorar
- `hooks/use-channels.ts` - Ya existe, agregar unread count
- `components/messaging/conversation-list/ConversationItem.tsx` - Mejorar

#### 3.2 Estado Vacío y Onboarding
**Objetivo:** Guía al usuario nuevo.

**Implementación:**
```
1. Mensaje amigable cuando no hay conversaciones
2. Botón "Nueva Conversación" prominente
3. Tutorial corto (3 pasos)
4. Sugerencias de pacientes frecuentes
```

**Archivos:**
- `components/messaging/EmptyState.tsx` - Mejorar existente
- `components/messaging/OnboardingGuide.tsx` - Nuevo

#### 3.3 Búsqueda de Mensajes
**Objetivo:** Encontrar mensajes rápidamente.

**Implementación:**
```
1. SearchPanel con filtro por fecha
2. Búsqueda full-text en contenido
3. Resaltado de resultados
4. Navegación entre resultados
```

**Archivos:**
- `components/messaging/search/SearchPanel.tsx` - Ya existe, conectar
- `hooks/use-chat.ts` - Función searchMessages
- `lib/supabase/services/messaging/search-service.ts` - Nuevo

### FASE 4: Funcionalidades Avanzadas

#### 4.1 Respuestas y Threads
**Objetivo:** Conversaciones organizadas.

**Implementación:**
```
1. Swipe para responder (WhatsApp style)
2. Vista de thread (Discord style)
3. Respuestas anidadas con indentación
4. Collapse/expand threads
```

**Archivos:**
- `components/messaging/messages/ThreadView.tsx` - Mejorar existente
- `hooks/use-chat.ts` - Funciones replyToMessage, getThread

#### 4.2 Reacciones (Emojis)
**Objetivo:** Respuestas rápidas sin escribir.

**Implementación:**
```
1. Long-press para mostrar reacciones
2. Picker de emojis comunes (👍❤️😂🎉)
3. Contador de reacciones
4. Ver quién reaccionó
```

**Archivos:**
- `components/messaging/messages/ReactionBar.tsx` - Ya existe, conectar
- `hooks/use-chat.ts` - Funciones addReaction, removeReaction

#### 4.3 Videollamadas Integradas
**Objetivo:** Consultas desde el chat.

**Implementación:**
```
1. Botón de videollamada en ChatHeader
2. Integración con Agora (ya existe en código)
3. Estado de llamada en tiempo real
4. Historial de llamadas en conversación
```

**Archivos:**
- `components/messaging/calls/VideoCallButton.tsx` - Nuevo
- `lib/agora/video-call-manager.ts` - Ya existe, conectar
- `hooks/use-agora-call.ts` - Ya existe, usar

### FASE 5: Seguridad y Cumplimiento

#### 5.1 Protección de Datos Médicos (PHI)
**Objetivo:** Cumplir con HIPAA.

**Implementación:**
```
1. Detección automática de PHI
2. Etiquetado de mensajes con is_phi
3. Advertencias al compartir datos sensibles
4. Cifrado de mensajes médicos
5. Audit log de acceso a PHI
```

**Archivos:**
- `lib/utils/phi-detector.ts` - Nuevo
- `lib/encryption/message-encryption.ts` - Nuevo
- `lib/supabase/services/messaging/audit-service.ts` - Nuevo

#### 5.2 Retención de Mensajes
**Objetivo:** Políticas de retención legales.

**Implementación:**
```
1. Configuración de retención por tipo
2. Eliminación automática después de X tiempo
3. Archivado de mensajes importantes
4. Export antes de eliminar
```

**Archivos:**
- `lib/supabase/services/messaging/retention-service.ts` - Nuevo
- `components/messaging/settings/RetentionSettings.tsx` - Nuevo

## 🎨 Diseño UI/UX

### Paleta de Colores
- Primario: `#3B82F6` (Azul médico)
- Secundario: `#10B981` (Verde éxito)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Rojo)
- Fondo: `#F9FAFB` (Gris claro)

### Tipografía
- Títulos: Inter, semibold, 16-18px
- Mensajes: Inter, regular, 14px
- Metadata: Inter, regular, 12px, gray-500

### Componentes Clave
```
┌─────────────────────────────────────────────┐
│  Header: Nombre, online status, actions     │
├─────────────────────────────────────────────┤
│  Messages Area (scrollable)                 │
│  ┌───────────────────────────────────────┐  │
│  │ [Avatar] Name              Time ✓✓   │  │
│  │ Message content                   │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │                                  [Avatar]│
│  │                         My message ✓✓  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  Input Area (emoji, attach, mic, send)      │
└─────────────────────────────────────────────┘
```

## 📊 Métricas de Éxito

### Funcionalidad
- ✅ Envío de mensajes funciona 100%
- ✅ Recepción en tiempo real < 500ms
- ✅ Read receipts funciona 100%
- ✅ Typing indicators funciona 100%

### Performance
- < 1s tiempo de carga inicial
- < 100ms respuesta a interacción
- < 50ms renderizado de mensaje

### UX
- NPS > 50
- Tasa de error < 1%
- Retención > 80% después de 1 mes

## 🔧 Implementación Inmediata (PRÓXIMOS PASOS)

### Paso 1: Arreglar envío de mensajes (CRÍTICO)
1. Completar `messageService.sendMessage()`
2. Conectar con `ChatInput.onSend()`
3. Probar envío médico → paciente

### Paso 2: Agregar suscripciones en tiempo real
1. Implementar `useChat` real-time subscription
2. Probar recepción de mensajes
3. Manejar reconexiones

### Paso 3: Read receipts
1. Implementar `markAsRead()`
2. Mostrar iconos de estado
3. Actualizar last_read_at

### Paso 4: Typing indicators
1. Eventos typing_start/stop
2. Mostrar "Escribiendo..."
3. Timeout automático

### Paso 5: Testing end-to-end
1. Crear conversación médico-paciente
2. Envar mensajes ambos sentidos
3. Verificar read receipts
4. Probar typing indicators
5. Validar experiencia completa

## 📝 Notas Técnicas

### Stack Tecnológico
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Realtime + Storage)
- **Estado:** Context API + Hooks personalizados
- **Realtime:** Supabase Realtime (WebSocket)
- **Video:** Agora.io SDK

### Decisiones de Arquitectura
1. **Optimistic Updates** para UX fluida
2. **Event Sourcing** para auditoría médica
3. **CQRS** para separar lectura/escritura
4. **WebSockets** para comunicación real-time
5. **Storage Buckets** separados por tipo de archivo

### Seguridad
1. **Row Level Security (RLS)** en Supabase
2. **JWT** para autenticación
3. **Cifrado AES-256** para mensajes médicos
4. **Audit logs** inmutables
5. **PHI detection** automática

## 🎯 Próximos Pasos Inmediatos

Voy a implementar ahora:
1. ✅ Corregir error de `searchChannels` dependencia en useMemo
2. ✅ Hacer funcional el envío de mensajes
3. ✅ Agregar suscripción real-time
4. ✅ Implementar read receipts
5. ✅ Agregar typing indicators
6. ✅ Probar flujo completo médico-paciente

---

**Estado del Plan:** 🟡 En Progreso
**Última Actualización:** 2025-01-22
**Responsable:** Claude AI Assistant
