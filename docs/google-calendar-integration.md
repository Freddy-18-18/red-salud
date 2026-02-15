# Integración con Google Calendar

Esta guía explica cómo configurar la integración bidireccional con Google Calendar en Red Salud.

## Características

✅ **Sincronización TO Google Calendar**
- Las citas se crean automáticamente en Google Calendar
- Los cambios de estado se reflejan en tiempo real
- Los colores se asignan según el estado de la cita
- Recordatorios automáticos (1 día y 30 minutos antes)

✅ **Sincronización FROM Google Calendar**
- Los eventos externos aparecen como tiempo bloqueado
- Prevención automática de doble reserva
- Importación de eventos de los próximos 3 meses

✅ **Bidireccional**
- Sincronización en ambas direcciones
- Detección de conflictos
- Actualización en tiempo real

## Configuración

### 1. Crear credenciales OAuth en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)

2. Crea un nuevo proyecto o selecciona uno existente

3. Habilita la **Google Calendar API**:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Calendar API"
   - Click en "Enable"

4. **Configura la pantalla de consentimiento OAuth**:
   - Ve a "APIs & Services" > "OAuth consent screen"
   - Tipo de usuario: **External** (para testing) o **Internal** (solo Google Workspace)
   - Completa la información básica:
     - App name: "Red Salud"
     - User support email: tu email
     - Developer contact: tu email
   - En **Scopes**, agrega:
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/calendar.events`
   - **IMPORTANTE**: En **Test users**, agrega los emails que necesiten acceso:
     ```
     tu-email@gmail.com
     otro-medico@example.com
     ```
   - Guarda los cambios
   
   ⚠️ **Nota**: Si no agregas test users, recibirás error "403: access_denied"

5. Crea credenciales OAuth 2.0:
   - Ve a "APIs & Services" > "Credentials"
   - Click en "Create Credentials" > "OAuth client ID"
   - Tipo de aplicación: **Web application**
   - Nombre: "Red Salud - Google Calendar Integration"
   
6. Configura los URIs de redireccionamiento autorizados:
   ```
   http://localhost:3000/api/calendar/google/callback
   https://tu-dominio.com/api/calendar/google/callback
   ```

7. Guarda el **Client ID** y **Client Secret**

### 2. Configurar variables de entorno

Edita el archivo `.env.local` y agrega:

```env
# Google Calendar OAuth
GOOGLE_CALENDAR_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=tu_client_secret_aqui
```

### 3. Ejecutar migración de base de datos

```bash
# Desde la raíz del proyecto
cd apps/web

# Ejecutar migración
supabase db push
```

O si usas Supabase remoto:

```bash
supabase link --project-ref tu-project-ref
supabase db push
```

### 4. Reiniciar el servidor de desarrollo

```bash
pnpm dev
```

## Uso

### Conectar Google Calendar

1. Inicia sesión como médico
2. Ve a **Configuración** > **Integraciones**
3. Click en "Conectar Google Calendar"
4. Autoriza el acceso en la ventana de Google
5. ¡Listo! Tus citas se sincronizarán automáticamente

### Sincronización automática

- **Crear cita**: Se crea automáticamente en Google Calendar
- **Actualizar cita**: Se actualiza en Google Calendar
- **Cambiar estado**: Se refleja el cambio en Google Calendar
- **Eliminar cita**: Se elimina de Google Calendar

### Sincronización manual

Puedes forzar una sincronización manual en cualquier momento:

1. Ve a **Configuración** > **Integraciones**
2. Click en "Sincronizar ahora"
3. Verás el resultado de la sincronización

### Eventos externos

Los eventos de Google Calendar (creados fuera de Red Salud) aparecen como **tiempo bloqueado** en el calendario del médico, evitando conflictos.

## Arquitectura

### Base de datos

- **`google_calendar_tokens`**: Almacena tokens OAuth por usuario
- **`google_calendar_event_mappings`**: Mapea citas con eventos de Google Calendar
- **`google_calendar_imported_events`**: Almacena eventos externos como tiempo bloqueado

### Servicios

- **`google-calendar-service.ts`**: Servicio principal de integración
- **`use-google-calendar.ts`**: Hook de React para gestión de estado
- **API Routes**:
  - `GET /api/calendar/google/connect` - Inicia OAuth
  - `GET /api/calendar/google/callback` - Callback OAuth
  - `POST /api/calendar/google/sync` - Sincronización manual
  - `GET /api/calendar/google/sync` - Estado de sincronización
  - `POST /api/calendar/google/disconnect` - Desconectar

### Componentes UI

- **`GoogleCalendarCard`**: Card de configuración e información
- **`IntegrationsSection`**: Sección de integraciones en configuración

## Seguridad

- ✅ Tokens almacenados con Row Level Security (RLS)
- ✅ Tokens renovados automáticamente antes de expirar
- ✅ Scopes mínimos necesarios (calendar, calendar.events)
- ✅ Refresh tokens para acceso offline
- ✅ Validación de permisos por rol

## Troubleshooting

### Error: "403: access_denied" - Acceso bloqueado

**Síntoma**: Al intentar conectar Google Calendar aparece:
```
Acceso bloqueado: Red-Salud no ha completado el proceso de verificación de Google
Error 403: access_denied
```

**Causa**: Tu aplicación OAuth está en modo "Testing" y tu email no está en la lista de test users.

**Solución**:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **OAuth consent screen**
4. En la sección **Test users**, haz clic en **+ ADD USERS**
5. Agrega el email con el que quieres conectar (ej: `firf.1818@gmail.com`)
6. Haz clic en **Save**
7. Intenta conectar nuevamente

**Nota**: En modo Testing puedes agregar hasta 100 test users. Para producción, necesitarás publicar la app y pasar la verificación de Google.

### Error: "Google Calendar not connected"

→ El usuario no ha autorizado el acceso. Ir a Configuración > Integraciones y conectar.

### Error: "Failed to obtain access or refresh token"

→ Verifica que las credenciales OAuth estén correctamente configuradas en `.env.local`

### Las citas no se sincronizan

1. Verifica que la sincronización esté habilitada
2. Revisa los logs del navegador (F12)
3. Fuerza una sincronización manual
4. Verifica que el token no haya expirado

### Error: "Invalid redirect URI"

→ Asegúrate de que el URI de callback esté configurado correctamente en Google Cloud Console

## Próximas mejoras

- [ ] Watch API para notificaciones push en tiempo real
- [ ] Sincronización incremental con sync tokens
- [ ] Soporte para múltiples calendarios
- [ ] Integración con Outlook Calendar
- [ ] Exportación masiva de citas históricas

## Referencias

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)
