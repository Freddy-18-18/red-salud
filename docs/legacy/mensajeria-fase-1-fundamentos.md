# 📋 Mensajería - Fase 1: Fundamentos

## 📅 Fecha de Inicio: 2025-01-21

## 🎯 Objetivo de la Fase 1

Establecer los fundamentos del sistema de mensajería multi-canal usando Agora.io para comunicación en tiempo real (chat, voz y video).

---

## ✅ Completado

### 1. Base de Datos (Supabase)

#### Migración Creada
- **Archivo**: `supabase/migrations/20260121230258_agora_call_system.sql`
- **Descripción**: Sistema completo de llamadas con Agora.io

#### Tablas Creadas

##### `agora_sessions`
Sesiones de llamadas activas (videollamadas, voz, conferencias)

**Campos principales**:
- `id` - UUID único
- `agora_channel_name` - Nombre único del canal en Agora
- `session_type` - Tipo de sesión (video, voice, group_video, group_voice, teleconsultation, conference, emergency)
- `session_status` - Estado (initiated, active, ended, rejected, missed, failed, timeout, cancelled)
- `initiator_id` - ID del usuario que inició la llamada
- `recipient_id` - ID del receptor (null para llamadas grupales)
- `participants` - Array de IDs de participantes
- `active_participants` - Array de IDs de participantes activos
- `agora_token` - Token de autenticación Agora
- `agora_uid` - UID de Agora del usuario
- `started_at` - Timestamp de inicio
- `ended_at` - Timestamp de finalización
- `duration_seconds` - Duración en segundos (calculado automáticamente)
- `call_quality` - Calidad de la llamada (excellent, good, fair, poor, unavailable)
- `video_quality_score` - Score de calidad de video (0.00 - 1.00)
- `audio_quality_score` - Score de calidad de audio (0.00 - 1.00)
- `network_quality_score` - Score de calidad de red (0.00 - 1.00)
- `packet_loss_percentage` - Porcentaje de paquetes perdidos
- `recording_enabled` - Habilita grabación
- `recording_url` - URL de la grabación

**Índices creados**:
- `idx_agora_sessions_initiator` - Por iniciador
- `idx_agora_sessions_recipient` - Por receptor
- `idx_agora_sessions_status` - Por estado
- `idx_agora_sessions_type` - Por tipo
- `idx_agora_sessions_started_at` - Por fecha de inicio
- `idx_agora_sessions_participants` - GIN index para array de participantes
- `idx_agora_sessions_conversation` - Por conversación relacionada
- `idx_agora_sessions_appointment` - Por cita relacionada

**Row Level Security**:
- ✅ Los usuarios pueden ver sus propias llamadas
- ✅ Los usuarios pueden actualizar sus propias llamadas
- ✅ Los usuarios pueden crear sus propias llamadas

##### `call_participants`
Participantes individuales en llamadas

**Campos principales**:
- `id` - UUID único
- `agora_session_id` - Referencia a la sesión de llamada
- `user_id` - ID del usuario participante
- `joined_at` - Timestamp de unión
- `left_at` - Timestamp de salida
- `participant_status` - Estado (joined, left, kicked)
- `can_publish_audio` - Permiso para publicar audio
- `can_publish_video` - Permiso para publicar video
- `can_publish_screen` - Permiso para compartir pantalla
- `connection_duration_seconds` - Duración de conexión (calculado automáticamente)
- `agora_uid` - UID único de Agora para el usuario

**Índices creados**:
- `idx_call_participants_session` - Por sesión
- `idx_call_participants_user` - Por usuario
- `idx_call_participants_joined_at` - Por fecha de unión

**Row Level Security**:
- ✅ Los usuarios pueden ver participantes en sus llamadas
- ✅ Los usuarios pueden insertar participantes en sus llamadas (como iniciador)
- ✅ Los usuarios pueden actualizar sus propios datos de participante

##### `call_notifications`
Notificaciones de llamadas entrantes

**Campos principales**:
- `id` - UUID único
- `agora_session_id` - Referencia a la sesión de llamada
- `caller_id` - ID del que llama
- `recipient_id` - ID del receptor
- `call_type` - Tipo de llamada
- `notification_status` - Estado (pending, accepted, rejected, missed, timeout)
- `created_at` - Timestamp de creación
- `answered_at` - Timestamp de respuesta
- `timeout_at` - Timestamp de timeout

**Índices creados**:
- `idx_call_notifications_recipient` - Por receptor
- `idx_call_notifications_status` - Por estado
- `idx_call_notifications_created_at` - Por fecha de creación
- `idx_call_notifications_session` - Por sesión

**Row Level Security**:
- ✅ Los usuarios pueden ver sus propias notificaciones
- ✅ Los usuarios pueden insertar sus propias notificaciones
- ✅ Los usuarios pueden actualizar sus propias notificaciones

##### `call_recordings`
Grabaciones de llamadas

**Campos principales**:
- `id` - UUID único
- `agora_session_id` - Referencia a la sesión de llamada
- `recording_url` - URL del archivo de grabación
- `recording_filename` - Nombre del archivo
- `recording_type` - Tipo (individual, composite, audio_only, video_only)
- `file_size_bytes` - Tamaño del archivo
- `duration_seconds` - Duración en segundos
- `format` - Formato (mp4, mkv, webm)
- `resolution` - Resolución (720p, 1080p)
- `is_encrypted` - Si está encriptado
- `encryption_key` - Referencia a la clave de encriptación
- `consent_obtained` - Si se obtuvo consentimiento de grabación
- `auto_delete_after_days` - Días para auto-borrado
- `delete_at` - Timestamp de eliminación programada
- `is_permanent` - Si es grabación permanente
- `access_count` - Contador de accesos
- `last_accessed_at` - Último acceso

**Índices creados**:
- `idx_call_recordings_session` - Por sesión
- `idx_call_recordings_created_at` - Por fecha de creación
- `idx_call_recordings_delete_at` - Por fecha de eliminación programada

**Row Level Security**:
- ✅ Los usuarios pueden ver grabaciones de sus llamadas
- ✅ Los usuarios pueden insertar grabaciones en sus llamadas (como iniciador)

##### `call_ratings`
Calificaciones de llamadas

**Campos principales**:
- `id` - UUID único
- `agora_session_id` - Referencia a la sesión de llamada
- `rater_id` - ID del que califica
- `rated_user_id` - ID del usuario calificado (opcional)
- `overall_rating` - Calificación general (1-5)
- `audio_quality_rating` - Calificación de audio (1-5)
- `video_quality_rating` - Calificación de video (1-5)
- `connection_stability_rating` - Calificación de estabilidad (1-5)
- `feedback_text` - Texto de feedback
- `feedback_categories` - Categorías de feedback
- `was_helpful` - Si fue útil
- `would_recommend` - Si recomendaría

**Índices creados**:
- `idx_call_ratings_session` - Por sesión
- `idx_call_ratings_rater` - Por usuario que califica
- `idx_call_ratings_created_at` - Por fecha de creación

**Row Level Security**:
- ✅ Los usuarios pueden ver sus propias calificaciones
- ✅ Los usuarios pueden insertar sus propias calificaciones
- ✅ Los usuarios pueden actualizar sus propias calificaciones

##### `call_events`
Eventos durante una llamada

**Campos principales**:
- `id` - UUID único
- `agora_session_id` - Referencia a la sesión de llamada
- `event_type` - Tipo de evento (user_joined, user_left, video_enabled, etc.)
- `event_data` - Datos del evento (JSON)
- `user_id` - ID del usuario relacionado
- `timestamp` - Timestamp del evento

**Índices creados**:
- `idx_call_events_session` - Por sesión
- `idx_call_events_user` - Por usuario
- `idx_call_events_timestamp` - Por timestamp
- `idx_call_events_type` - Por tipo de evento

**Row Level Security**:
- ✅ Los usuarios pueden ver eventos en sus llamadas

#### Tipos (Enums) Creados

- `call_session_type` - Tipos de sesión de llamada
- `call_session_status` - Estados de sesión
- `call_notification_status` - Estados de notificación
- `call_quality` - Calidades de llamada
- `recording_type` - Tipos de grabación

#### Funciones y Triggers Creados

- `update_call_duration()` - Actualiza `duration_seconds` automáticamente cuando la llamada termina
- `update_updated_at_column()` - Actualiza `updated_at` automáticamente
- `update_participant_duration()` - Actualiza `connection_duration_seconds` automáticamente
- `cleanup_old_recordings()` - Limpia grabaciones antiguas (para jobs programados)

#### Vistas Creadas

- `active_calls` - Vista de llamadas activas con información de participantes
- `call_history_with_stats` - Vista de historial de llamadas con estadísticas

### 2. Servicios (Backend)

#### Archivo Creado
- **Archivo**: `lib/supabase/services/agora/agora-sessions-service.ts`
- **Líneas**: 844

#### Funciones Implementadas

##### Sesiones de Llamada

1. `createAgoraSession()` - Crea nueva sesión de llamada
   - Genera nombre único de canal Agora
   - Agrega el iniciador como participante automáticamente

2. `getAgoraSession()` - Obtiene sesión por ID
   - Incluye datos del iniciador y receptor

3. `getAgoraSessionByChannel()` - Obtiene sesión por nombre de canal Agora

4. `updateAgoraSession()` - Actualiza sesión
   - Establece `ended_at` automáticamente cuando el estado cambia a 'ended'
   - Establece `started_at` si no está establecido

5. `getUserActiveCalls()` - Obtiene llamadas activas de un usuario
   - Filtra por estado 'active'
   - Incluye llamadas donde el usuario es iniciador, receptor o participante

6. `getUserCallHistory()` - Obtiene historial de llamadas
   - Paginado con `limit` y `offset`
   - Filtra por estados finalizados
   - Incluye datos de perfil del iniciador y receptor

##### Participantes

7. `createCallParticipant()` - Agrega participante a llamada
   - Actualiza `active_participants` en la sesión
   - Registra evento `user_joined`

8. `updateCallParticipant()` - Actualiza participante
   - Si el participante sale, actualiza `active_participants`
   - Registra evento `user_left`

9. `getCallParticipants()` - Obtiene todos los participantes de una sesión
   - Incluye datos de perfil de cada usuario

##### Notificaciones

10. `createCallNotification()` - Crea notificación de llamada entrante

11. `getUserPendingCallNotifications()` - Obtiene notificaciones pendientes
    - Filtra por estado 'pending'
    - Incluye datos del caller y sesión

12. `respondToCallNotification()` - Responde a notificación
    - Establece estado como 'accepted' o 'rejected'
    - Actualiza `answered_at` o `timeout_at`

##### Grabaciones

13. `createCallRecording()` - Crea registro de grabación
    - Opción de encriptación
    - Consentimiento de grabación
    - Política de retención

14. `getSessionRecordings()` - Obtiene grabaciones de una sesión

##### Calificaciones

15. `createCallRating()` - Crea calificación de llamada
    - Calificaciones individuales (audio, video, conexión)
    - Feedback textual y categorías

16. `getSessionRatings()` - Obtiene calificaciones de una sesión
    - Incluye datos del rater y usuario calificado

##### Eventos

17. `logCallEvent()` - Registra evento durante llamada
    - Tipos de eventos: user_joined, user_left, video_enabled, etc.

18. `getSessionEvents()` - Obtiene eventos de una sesión
    - Ordenados cronológicamente
    - Incluye datos de usuario

##### Utilidades

19. `cleanupOldRecordings()` - Limpia grabaciones antiguas
    - Usa función SQL `cleanup_old_recordings()`

20. `getUserCallStats()` - Obtiene estadísticas de llamadas de usuario
    - Total de llamadas
    - Llamadas completadas, perdidas, rechazadas
    - Duración total y promedio
    - Calidad promedio
    - Llamadas por tipo

### 3. Tipos TypeScript

#### Archivo Creado
- **Archivo**: `lib/agora/types/agora-types.ts`
- **Líneas**: 605

#### Tipos Definidos

##### Enums

- `CallSessionType` - Tipos de sesión de llamada
  - video, voice, group_video, group_voice
  - teleconsultation, conference, emergency

- `CallSessionStatus` - Estados de sesión
  - initiated, active, ended, rejected, missed, failed, timeout, cancelled

- `CallNotificationStatus` - Estados de notificación
  - pending, accepted, rejected, missed, timeout

- `CallQuality` - Calidades de llamada
  - excellent, good, fair, poor, unavailable

- `ParticipantStatus` - Estados de participante
  - joined, left, kicked

- `RecordingType` - Tipos de grabación
  - individual, composite, audio_only, video_only

##### Interfaces Principales

- `AgoraSession` - Sesión de llamada completa
- `CallParticipant` - Participante en llamada
- `CallNotification` - Notificación de llamada
- `CallRecording` - Grabación de llamada
- `CallRating` - Calificación de llamada
- `CallEvent` - Evento durante llamada

##### Interfaces de Input

- `CreateAgoraSessionInput` - Datos para crear sesión
- `UpdateAgoraSessionInput` - Datos para actualizar sesión
- `CreateCallParticipantInput` - Datos para crear participante
- `UpdateCallParticipantInput` - Datos para actualizar participante
- `CreateCallNotificationInput` - Datos para crear notificación
- `CreateCallRecordingInput` - Datos para crear grabación
- `CreateCallRatingInput` - Datos para crear calificación
- `CreateCallEventInput` - Datos para registrar evento

##### Interfaces de Respuesta

- `AgoraServiceResponse<T>` - Respuesta estándar de servicio
- `ActiveCallView` - Vista de llamada activa
- `CallHistoryWithStats` - Historial con estadísticas
- `UserCallStats` - Estadísticas de usuario

##### Interfaces de Configuración

- `AgoraClientConfig` - Configuración de cliente Agora
- `RTCConnectionOptions` - Opciones de conexión RTC
- `RTMSubscriptionOptions` - Opciones de suscripción RTM
- `RecordingConfig` - Configuración de grabación
- `CallQualityConfig` - Configuración de calidad
- `ScreenShareOptions` - Opciones de pantalla compartida
- `AudioControlOptions` - Opciones de control de audio
- `VideoControlOptions` - Opciones de control de video

### 4. Cliente Agora (Frontend)

#### Archivo Creado
- **Archivo**: `lib/agora/client.ts`
- **Líneas**: 707

#### Clase: AgoraClient

##### Propiedades

- `config` - Configuración del cliente
- `rtmClient` - Cliente RTM (messaging)
- `rtcClient` - Cliente RTC (video/voz)
- `localAudioTrack` - Track de audio local
- `localVideoTrack` - Track de video local
- `screenTrack` - Track de pantalla compartida

##### Métodos Implementados

**Inicialización**

1. `initialize()` - Inicializa RTM y RTC
2. `initializeRTM()` - Inicializa cliente RTM
3. `initializeRTC()` - Inicializa cliente RTC

**Conexión RTM**

4. `loginRTM(userId, token?)` - Login al servicio RTM
5. `logoutRTM()` - Logout del servicio RTM

**Conexión RTC**

6. `joinRTC(options, qualityConfig?)` - Unirse a canal RTC
7. `leaveRTC()` - Dejar canal RTC

**Canales RTM**

8. `joinRTMChannel(channelName, options?)` - Unirse a canal RTM
9. `leaveRTMChannel()` - Dejar canal RTM
10. `sendRTMMessage(channelName, message)` - Enviar mensaje al canal
11. `sendRTMPeerMessage(userId, message)` - Enviar mensaje P2P

**Tracks Locales**

12. `publishLocalTracks(qualityConfig?)` - Publicar tracks de audio/video (privado)
13. `unpublishLocalTracks()` - Depublicar tracks (privado)
14. `toggleMicrophone(enabled)` - Toggle de micrófono
15. `toggleCamera(enabled)` - Toggle de cámara
16. `startScreenShare(options?)` - Comenzar compartir pantalla
17. `stopScreenShare()` - Detener compartir pantalla

**Tracks Remotos**

18. `subscribeUser(user, mediaType?)` - Suscribirse a usuario remoto
19. `unsubscribeUser(user, mediaType?)` - Desuscribirse de usuario remoto

**Eventos**

20. `on(callbacks)` - Registrar callbacks de eventos
21. `off()` - Remover todos los callbacks

**Cleanup**

22. `cleanup()` - Limpiar todos los recursos

**Getters**

23. `getLocalAudioTrack()` - Obtener track de audio local
24. `getLocalVideoTrack()` - Obtener track de video local
25. `getScreenTrack()` - Obtener track de pantalla
26. `isInitialized()` - Verificar si está inicializado
27. `isConnected()` - Verificar si está conectado

##### Eventos Soportados

**RTM Events**
- `onRTMMessage` - Mensaje recibido
- `onRTMUserJoined` - Usuario se unió
- `onRTMUserLeft` - Usuario salió
- `onRTMPresenceUpdate` - Actualización de presencia
- `onRTMConnectionStateChanged` - Cambio de estado de conexión

**RTC Events**
- `onRTCUserJoined` - Usuario se unió a llamada
- `onRTCUserLeft` - Usuario salió de llamada
- `onRTCUserPublished` - Usuario publicó media
- `onRTCUserUnpublished` - Usuario depublicó media
- `onRTCConnectionStateChanged` - Cambio de estado de conexión RTC
- `onRTCAudioVolume` - Volumen de audio

**Common Events**
- `onError` - Error ocurrido
- `onTokenWillExpire` - Token expirará pronto

### 5. Generador de Tokens

#### Archivo Creado
- **Archivo**: `lib/agora/utils/token-generator.ts`
- **Líneas**: 350

#### Funciones Implementadas

**Generación de Tokens**

1. `generateRTCToken(config, role)` - Genera token RTC
   - Usa `RtcTokenBuilder` de Agora
   - Valida tiempo de expiración

2. `generateRTMToken(config)` - Genera token RTM
   - Usa `RtmTokenBuilder` de Agora
   - Valida tiempo de expiración

3. `generateSessionTokens(config, rtcRole)` - Genera ambos tokens
   - Retorna objeto con `rtcToken`, `rtmToken` y `expiresAt`

**Validación**

4. `validateExpiration(seconds)` - Valida tiempo de expiración
   - Mínimo: 60 segundos
   - Máximo: 86400 segundos (24 horas)

5. `isTokenExpired(expiresAt, bufferSeconds?)` - Verifica si token expiró
   - Buffer por defecto: 300 segundos (5 minutos)

6. `getTokenRemainingSeconds(expiresAt)` - Obtiene segundos restantes

**Formato**

7. `formatExpirationTime(seconds)` - Formatea tiempo para display
   - Retorna formato "1h 30m" o "30m" o "45s"

**Configuración desde Entorno**

8. `getAgoraConfigFromEnv()` - Obtiene config de variables de entorno
   - `NEXT_PUBLIC_AGORA_APP_ID`
   - `AGORA_APP_CERTIFICATE`

9. `generateTokensFromEnv(channelName, uid, expirationInSeconds)` - Genera tokens usando env

**Renovación**

10. `shouldRefreshToken(expiresAt, refreshThresholdSeconds?)` - Verifica si necesita renovar
    - Umbral por defecto: 300 segundos (5 minutos)

11. `autoRefreshTokens(tokens, refreshCallback, checkIntervalMs?)` - Renovación automática
    - Intervalo por defecto: 60000 ms (1 minuto)
    - Retorna función para detener el intervalo

**Tipos**

- `TokenConfig` - Configuración para generar tokens
- `GeneratedTokens` - Tokens generados con fecha de expiración
- `TokenRefreshCallback` - Callback para renovación

### 6. Dependencias Agregadas

#### package.json

```json
{
  "dependencies": {
    "agora-access-token": "^2.0.5",    // Para generar tokens
    "agora-rtm-sdk": "^2.1.3",        // SDK RTM (messaging)
    "agora-rtc-sdk-ng": "^4.22.0"       // SDK RTC (video/voz)
  }
}
```

**Nota**: Estas dependencias deben ser instaladas con:
```bash
npm install
```

---

## 📝 Variables de Entorno Necesarias

Para completar la configuración de Agora.io, necesitas agregar estas variables a tu archivo `.env.local`:

```bash
# Agora.io Configuration
NEXT_PUBLIC_AGORA_APP_ID=tu_app_id_aqui
AGORA_APP_CERTIFICATE=tu_app_certificate_aqui
```

### Cómo obtener las credenciales de Agora.io

1. Ve a [console.agora.io](https://console.agora.io/)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Copia el **App ID** (público) → `NEXT_PUBLIC_AGORA_APP_ID`
5. Habilita **App Certificate** en el proyecto
6. Genera un **App Certificate** (privado, nunca se comparte) → `AGORA_APP_CERTIFICATE`

**⚠️ Importante**: El `AGORA_APP_CERTIFICATE` es una clave privada y solo debe estar en el servidor (backend). Nunca se debe exponer en el cliente.

---

## 🔄 Siguientes Pasos (Fase 1 - Continuación)

### Pendientes para completar la Fase 1:

1. **[ ] Ejecutar las migraciones de base de datos**
   ```bash
   # Usando Supabase CLI
   supabase db push
   
   # O aplicar manualmente el SQL en la consola de Supabase
   ```

2. **[ ] Instalar las dependencias de Agora**
   ```bash
   npm install
   ```

3. **[ ] Crear API Route para generar tokens** (Server-side)
   - `app/api/agora/tokens/route.ts`
   - Debe usar el `AGORA_APP_CERTIFICATE` (privado)
   - Generar tokens RTC y RTM bajo demanda

4. **[ ] Crear Provider React para Agora**
   - `components/agora/AgoraProvider.tsx`
   - Contexto para manejar el cliente Agora global
   - Hooks personalizados para usar el cliente

5. **[ ] Crear componentes UI básicos de chat**
   - `components/messaging/chat/MessageList.tsx`
   - `components/messaging/chat/MessageInput.tsx`
   - `components/messaging/chat/ConversationList.tsx`

6. **[ ] Integrar RTM para mensajería en tiempo real**
   - Conectar RTM al ChatProvider existente
   - Manejar mensajes en tiempo real
   - Implementar indicadores de "escribiendo..."

---

## 📊 Resumen del Progreso Fase 1

| Componente | Estado | Progreso |
|-------------|--------|----------|
| Base de Datos | ✅ Completado | 100% |
| Servicios Backend | ✅ Completado | 100% |
| Tipos TypeScript | ✅ Completado | 100% |
| Cliente Agora | ✅ Completado | 100% |
| Generador de Tokens | ✅ Completado | 100% |
| Dependencias | ✅ Agregadas | 100% |
| Migraciones ejecutadas | ⏳ Pendiente | 0% |
| API Routes | ⏳ Pendiente | 0% |
| Agora Provider React | ⏳ Pendiente | 0% |
| Componentes UI básicos | ⏳ Pendiente | 0% |

**Progreso Total Fase 1**: 50% (Fundamentos listos, falta implementación frontend)

---

## 🎨 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │ AgoraProvider │ ──── │  ChatProvider│                   │
│  │              │      │              │                   │
│  │ - RTM Client │      │ - Messages   │                   │
│  │ - RTC Client │      │ - Channels   │                   │
│  │ - Tokens     │      │ - Typing     │                   │
│  └──────────────┘      └──────────────┘                   │
│          │                     │                            │
│          └──────────┬──────────┘                            │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────┐        │
│  │          UI Components                        │        │
│  │  - MessageList, MessageInput                 │        │
│  │  - ConversationList, CallUI                  │        │
│  └──────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  API Routes (Next.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  /api/agora/tokens - Generar tokens (server-side)           │
│  /api/agora/calls - Gestión de llamadas                     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Agora.io Services                               │
├─────────────────────────────────────────────────────────────────┤
│  RTM (Real-Time Messaging) - Chat en tiempo real            │
│  RTC (Real-Time Communication) - Video/Voz                  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)                           │
├─────────────────────────────────────────────────────────────────┤
│  - agora_sessions                                            │
│  - call_participants                                         │
│  - call_notifications                                        │
│  - call_recordings                                           │
│  - call_ratings                                              │
│  - call_events                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Referencias

### Documentación de Agora.io

- [Agora RTM SDK](https://docs.agora.io/en/real-time-messaging/messaging-sdk/landing-page)
- [Agora RTC SDK (Web)](https://docs.agora.io/en/video-calling/landing-page)
- [Token Server](https://docs.agora.io/en/interactive-live/standard-high-quality/token-server)
- [Access Token](https://docs.agora.io/en/interactive-live/standard-high-quality/access-token)

### Archivos del Proyecto

- Migración: `supabase/migrations/20260121230258_agora_call_system.sql`
- Servicios: `lib/supabase/services/agora/agora-sessions-service.ts`
- Tipos: `lib/agora/types/agora-types.ts`
- Cliente: `lib/agora/client.ts`
- Tokens: `lib/agora/utils/token-generator.ts`

---

## 🐛 Conocimientos y Problemas Conocidos

### Problema: Dependencias de Agora.io en el servidor

**Descripción**: Los SDK de Agora.io están diseñados para el navegador (client-side). No funcionan directamente en Node.js (server-side).

**Solución**: Usar el SDK de token de Agora para generar tokens en el servidor. El cliente (browser) usa los tokens generados.

**Nota**: La función `generateTokensFromEnv()` está diseñada para usarse en el cliente con tokens pre-generados, o en el servidor con el certificado privado.

---

## ✅ Checklist para Continuar

Para continuar con la Fase 1, necesitas:

- [ ] Obtener credenciales de Agora.io (App ID y Certificate)
- [ ] Agregar variables de entorno al archivo `.env.local`
- [ ] Ejecutar `npm install` para instalar dependencias
- [ ] Ejecutar las migraciones en Supabase
- [ ] Crear API Route para generar tokens
- [ ] Crear AgoraProvider React
- [ ] Integrar con ChatProvider existente
- [ ] Crear componentes UI básicos
- [ ] Testing de integración RTM
- [ ] Testing de integración RTC

---

**Fecha de última actualización**: 2025-01-21

**Estado**: Fundamentos listos - Falta implementación frontend