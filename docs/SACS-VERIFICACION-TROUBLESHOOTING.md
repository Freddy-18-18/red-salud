# 🔧 Solución de Problema: SACS Verificación Fallida

## Problema Reportado

**Error**: "No se pudo conectar con el servicio de verificación. Por favor intenta más tarde."

## Diagnóstico Realizado

### ✅ Verificaciones Completadas

1. **Servicio de Railway** ✅
   - URL: `https://sacs-verification-service-production.up.railway.app`
   - Estado: **FUNCIONANDO CORRECTAMENTE**
   - Health check: Responde con `{"status":"ok","service":"SACS Verification Service","version":"2.0.0"}`

2. **Código del Servicio Backend** ✅
   - Ubicación: `services/sacs-verification/index.js`
   - Endpoints disponibles:
     - `GET /health` - Health check
     - `POST /verify` - Verificación de médicos

3. **Edge Function de Supabase** ⚠️
   - Ubicación: `apps/web/supabase/functions/verify-doctor-sacs/index.ts`
   - Estado: **Requiere despliegue/configuración**

## Causa del Problema

El problema NO es el servicio de Railway (que funciona correctamente), sino la **Edge Function de Supabase** que no está:
- Desplegada en el proyecto de Supabase
- O no tiene configuradas las variables de entorno necesarias

## Solución

### Paso 1: Instalar Supabase CLI

```powershell
# Con Scoop (recomendado para Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# O con npm
npm install -g supabase
```

### Paso 2: Autenticarse en Supabase

```powershell
# Login en Supabase
supabase login

# Link al proyecto (si aún no está linkeado)
supabase link --project-ref YOUR_PROJECT_REF
```

Para obtener tu `PROJECT_REF`:
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a Project Settings → General
4. Copia el "Reference ID"

### Paso 3: Configurar Variables de Entorno en Supabase

La edge function necesita la variable `SACS_BACKEND_URL`. Hay dos formas de configurarla:

#### Opción A: Desde el Dashboard (Recomendado)

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Project Settings** → **Edge Functions**
4. En la sección "Secrets", añade:
   - **Key**: `SACS_BACKEND_URL`
   - **Value**: `https://sacs-verification-service-production.up.railway.app`
5. Haz clic en "Add secret"

#### Opción B: Desde CLI

```powershell
supabase secrets set SACS_BACKEND_URL=https://sacs-verification-service-production.up.railway.app
```

### Paso 4: Desplegar la Edge Function

```powershell
# Cambiar al directorio correcto
cd c:\Users\Fredd\Developer\red-salud\apps\web\supabase\functions

# Desplegar la función
supabase functions deploy verify-doctor-sacs
```

Si recibes errores de permisos o configuración, prueba:

```powershell
# Desplegar con el flag --project-ref
supabase functions deploy verify-doctor-sacs --project-ref YOUR_PROJECT_REF
```

### Paso 5: Verificar el Despliegue

```powershell
# Listar funciones desplegadas
supabase functions list
```

Deberías ver `verify-doctor-sacs` en la lista con estado "deployed".

### Paso 6: Probar la Función

Desde la aplicación web, intenta verificar un médico nuevamente. El error debería estar resuelto.

Si aún hay problemas, verifica los logs:

```powershell
# Ver logs en tiempo real
supabase functions logs verify-doctor-sacs
```

## Verificación Adicional

### Probar la Edge Function Directamente

```powershell
# Invocar la función desde CLI
supabase functions invoke verify-doctor-sacs --payload '{"cedula":"12345678","tipo_documento":"V"}'
```

### Verificar Variables de Entorno

```powershell
# Listar secretos configurados
supabase secrets list
```

## Comandos de Troubleshooting

```powershell
# Ver logs en tiempo real
supabase functions logs verify-doctor-sacs --follow

# Ver los últimos 100 logs
supabase functions logs verify-doctor-sacs --limit 100

# Probar localmente (opcional)
supabase functions serve verify-doctor-sacs
```

## Solución Alternativa (Temporal)

Si no puedes desplegar la edge function inmediatamente, puedes llamar directamente al servicio de Railway desde el frontend (NO RECOMENDADO para producción por seguridad):

**Archivo**: `apps/web/lib/supabase/services/doctor-verification-service.ts`

```typescript
// Línea 56 - Reemplazar la invocación de la edge function
// TEMPORAL - Solo para debugging
const response = await fetch('https://sacs-verification-service-production.up.railway.app/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cedula, tipo_documento: 'V' })
});

const data = await response.json();
```

⚠️ **Esta solución temporal NO debe usarse en producción** ya que expone el servicio backend directamente.

## Resumen

✅ **El servicio de Railway funciona correctamente**  
⚠️ **La edge function de Supabase necesita ser desplegada**  
🔧 **Sigue los pasos anteriores para resolver el problema**

## Contacto y Soporte

Si después de seguir estos pasos el problema persiste:
1. Verifica los logs de la edge function
2. Verifica que la variable `SACS_BACKEND_URL` esté configurada correctamente
3. Verifica que Railway no tenga rate limiting o restricciones de IP

---

**Fecha**: 2026-02-13  
**Estado del Servicio Railway**: ✅ Funcionando  
**Acción Requerida**: Desplegar edge function en Supabase
