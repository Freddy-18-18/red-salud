# Estado de Integración Didit - Red Salud

## ✅ Configurado

1. **API Key de Didit** - Configurada
2. **Workflow ID** - Configurado (3176221b-c77c-4fea-b2b3-da185ef18122)
3. **Webhook Secret** - Configurado
4. **Ventana Emergente** - Ahora abre en popup centrado (500x700px)
5. **Polling Automático** - Se actualiza cada 5 segundos mientras la ventana está abierta
6. **Detección de Cierre** - Actualiza datos cuando cierras la ventana de verificación

## ⚠️ Pendiente

### SUPABASE_SERVICE_ROLE_KEY

**Necesitas configurar esta clave para que el webhook funcione.**

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Proyecto: hwckkfiirldgundbcjsp
3. Settings → API → Project API keys → `service_role`
4. Copia la clave y agrégala a `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=tu_clave_aqui
```

Sin esta clave, el webhook no puede actualizar la base de datos cuando Didit aprueba la verificación.

## 🔧 Problemas Resueltos

### 1. Múltiples Pestañas
**Antes**: Abría nueva pestaña y duplicaba la sesión
**Ahora**: Abre ventana emergente centrada que no duplica la sesión

### 2. Nombre Esperado vs Extraído
**Problema**: Didit comparaba "FREDDY RAMIREZ" con "Freddy Isaac Ramirez Freitez"
**Solución**: Ya no enviamos `expected_details` a menos que tengamos el nombre completo en el perfil

### 3. No se Actualiza Después de Aprobar
**Problema**: El perfil no se actualizaba automáticamente
**Solución**: 
- Polling cada 5 segundos mientras la ventana está abierta
- Actualización automática al cerrar la ventana
- Webhook mejorado con más logging

## 📊 Flujo Completo

1. Usuario hace clic en "Iniciar Verificación"
2. Se crea sesión en Didit
3. Se abre ventana emergente (500x700px)
4. Usuario completa verificación en Didit
5. Didit envía webhook a `/api/didit/webhook`
6. Webhook actualiza perfil en Supabase
7. Polling detecta cambio y actualiza UI
8. Usuario cierra ventana → UI se actualiza

## 🧪 Probar

1. Configura `SUPABASE_SERVICE_ROLE_KEY`
2. Reinicia el servidor: `npm run dev`
3. Ve al dashboard de paciente
4. Abre el modal de perfil → Tab "Documentos"
5. Haz clic en "Iniciar Verificación"
6. Completa la verificación en la ventana emergente
7. Aprueba desde el dashboard de Didit
8. Verifica que el perfil se actualice automáticamente

## 📝 Logs para Debugging

### En la Terminal del Servidor:
- `📤 Enviando solicitud a Didit`
- `✅ Respuesta de Didit`
- `🔔 Webhook recibido de Didit`
- `✅ Perfil actualizado exitosamente`

### En la Consola del Navegador:
- `🚀 Iniciando verificación...`
- `✅ Abriendo URL`
- `🔄 Verificando estado de verificación...`
- `🔄 Ventana cerrada, actualizando datos...`

## 🔗 Webhook URL

Para producción, configura en Didit:
```
https://tu-dominio.com/api/didit/webhook
```

Para desarrollo local (con ngrok o similar):
```
https://tu-ngrok-url.ngrok.io/api/didit/webhook
```

## 📚 Documentación

- `.kiro/docs/didit-configuracion.md` - Guía completa de configuración
- `.kiro/docs/supabase-service-role-key.md` - Cómo obtener la service role key
- `DIDIT_SETUP.md` - Setup rápido
