# SACS Integration

Documentacion completa de la integracion con el Sistema de Acreditacion de las Ciencias de la Salud (SACS) para la verificacion automatica de medicos.

---

## Overview

El SACS es el sistema oficial del gobierno venezolano para registrar profesionales de la salud. Red Salud se integra con el SACS para verificar automaticamente que un medico este registrado antes de otorgarle acceso al dashboard medico.

### Arquitectura del flujo

```
Frontend (Next.js)
    |
    v
Supabase Edge Function (verify-doctor-sacs)
    |
    v
Railway Backend (Puppeteer scraper)
    |
    v
SACS Website (gov.ve)
```

**Componentes:**
- **Frontend**: Formulario de verificacion en el setup del perfil medico
- **Edge Function**: Proxy seguro que conecta el frontend con el backend sin exponer URLs
- **Railway Backend**: Servicio Node.js con Puppeteer que realiza scraping del SACS
- **SACS Website**: Sitio gubernamental con datos de profesionales de salud

---

## Setup

### Servicio de Railway

- **URL**: `https://sacs-verification-service-production.up.railway.app`
- **Health check**: `GET /health`
- **Verificacion**: `POST /verify`
- **Version**: 2.0.0

**Endpoints disponibles:**
- `GET /health` - Health check
- `POST /verify` - Verificacion de medicos

### Edge Function de Supabase

**Ubicacion**: `apps/web/supabase/functions/verify-doctor-sacs/index.ts`

#### Paso 1: Instalar Supabase CLI

```powershell
# Con Scoop (recomendado para Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# O con npm
npm install -g supabase
```

#### Paso 2: Autenticarse en Supabase

```powershell
# Login en Supabase
supabase login

# Link al proyecto (si aun no esta linkeado)
supabase link --project-ref YOUR_PROJECT_REF
```

Para obtener tu `PROJECT_REF`:
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a Project Settings > General
4. Copia el "Reference ID"

#### Paso 3: Configurar Variables de Entorno

**Opcion A: Desde el Dashboard (Recomendado)**

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Project Settings** > **Edge Functions**
4. En la seccion "Secrets", agrega:
   - **Key**: `SACS_BACKEND_URL`
   - **Value**: `https://sacs-verification-service-production.up.railway.app`
5. Haz clic en "Add secret"

**Opcion B: Desde CLI**

```powershell
supabase secrets set SACS_BACKEND_URL=https://sacs-verification-service-production.up.railway.app
```

#### Paso 4: Desplegar la Edge Function

```powershell
cd apps/web/supabase/functions
supabase functions deploy verify-doctor-sacs
```

Si recibes errores de permisos o configuracion:

```powershell
supabase functions deploy verify-doctor-sacs --project-ref YOUR_PROJECT_REF
```

#### Paso 5: Verificar el Despliegue

```powershell
supabase functions list
```

Deberias ver `verify-doctor-sacs` en la lista con estado "deployed".

### Script de despliegue automatizado

```powershell
cd c:\Users\Fredd\Developer\red-salud
.\scripts\deploy-sacs-edge-function.ps1
```

El script automaticamente:
- Verifica la instalacion de Supabase CLI
- Configura la variable `SACS_BACKEND_URL`
- Despliega la edge function
- Verifica el deployment

---

## Troubleshooting

### Error: "No se pudo conectar con el servicio de verificacion"

**Causa**: La Edge Function de Supabase no esta desplegada o no tiene configuradas las variables de entorno necesarias.

**Diagnostico realizado:**
1. **Servicio de Railway**: FUNCIONANDO CORRECTAMENTE
2. **Codigo del Servicio Backend**: OK (ubicacion: `services/sacs-verification/index.js`)
3. **Edge Function de Supabase**: Requiere despliegue/configuracion

**Solucion**: Seguir los pasos de Setup descritos arriba para desplegar la edge function.

### Error: "Esta cedula no esta registrada en el SACS como profesional de la salud"

**Causa**: Cache del navegador mostrando una respuesta cacheada del error anterior.

**Solucion (3 Opciones):**

**Opcion 1: Hard Refresh (mas rapida)**
1. Abre DevTools (F12)
2. Click derecho en el boton Reload del navegador
3. Selecciona **"Empty Cache and Hard Reload"**
4. Intenta de nuevo

**Opcion 2: Modo Incognito**
1. Abre ventana incognito (Ctrl + Shift + N)
2. Inicia sesion en http://localhost:3000
3. Ve a perfil setup
4. Intenta verificacion

**Opcion 3: Borrar Cache Completo**
1. Presiona **Ctrl + Shift + Delete**
2. Marca:
   - Cached images and files
   - Cookies and other site data
3. Tiempo: **Last hour**
4. Click **Clear data**
5. Recarga (F5)

### Verificar que el Backend Funciona

Test con PowerShell:

```powershell
# Test Railway Backend
$body = @{
    cedula = "14031469"
    tipo_documento = "V"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "https://sacs-verification-service-production.up.railway.app/verify" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

Write-Host "STATUS: $($response.StatusCode)" -ForegroundColor Green
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Resultado esperado:**
```json
{
  "success": true,
  "verified": true,
  "data": {
    "cedula": "14031469",
    "nombre_completo": "ANGELA GAMEZ",
    "profesion_principal": "MEDICO(A) CIRUJANO(A)",
    "matricula_principal": "MPPS-65638",
    "especialidad_display": "ESPECIALISTA EN RADIOLOGIA Y DIAGNOSTICO POR IMAGENES",
    "es_medico_humano": true,
    "apto_red_salud": true
  }
}
```

### Probar la Edge Function Directamente

```powershell
supabase functions invoke verify-doctor-sacs --payload '{"cedula":"12345678","tipo_documento":"V"}'
```

### Verificar Variables de Entorno

```powershell
supabase secrets list
```

### Verificar Logs de Supabase

1. Ve a https://supabase.com/dashboard/project/hwckkfiirldgundbcjsp/functions
2. Click en **verify-doctor-sacs**
3. Ve a la pestana **Logs**
4. Busca la invocacion mas reciente
5. Deberias ver:
   - `status_code: 200`
   - `execution_time_ms: ~7000-11000`

### Comandos de Troubleshooting

```powershell
# Ver logs en tiempo real
supabase functions logs verify-doctor-sacs --follow

# Ver los ultimos 100 logs
supabase functions logs verify-doctor-sacs --limit 100

# Probar localmente (opcional)
supabase functions serve verify-doctor-sacs
```

### Verificar que Railway esta corriendo

```powershell
Invoke-WebRequest https://sacs-verification-service-production.up.railway.app/health
```

Debe responder: `{"status":"ok","service":"sacs-verification-service","version":"2.0.0"}`

### Verificar las variables de entorno en Supabase

1. Ve a https://supabase.com/dashboard/project/hwckkfiirldgundbcjsp/settings/functions
2. Verifica que exista:
   - `SACS_BACKEND_URL = https://sacs-verification-service-production.up.railway.app`

### Redeploy de la Edge Function (solo si es necesario)

```powershell
cd apps/web
supabase functions deploy verify-doctor-sacs --project-ref hwckkfiirldgundbcjsp
```

### Solucion Alternativa (Temporal - NO para produccion)

Si no puedes desplegar la edge function inmediatamente, puedes llamar directamente al servicio de Railway desde el frontend:

**Archivo**: `apps/web/lib/supabase/services/doctor-verification-service.ts`

```typescript
// Linea 56 - Reemplazar la invocacion de la edge function
// TEMPORAL - Solo para debugging
const response = await fetch('https://sacs-verification-service-production.up.railway.app/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cedula, tipo_documento: 'V' })
});

const data = await response.json();
```

**ADVERTENCIA**: Esta solucion temporal NO debe usarse en produccion ya que expone el servicio backend directamente.

---

## Archivos Relevantes

- Edge Function: `apps/web/supabase/functions/verify-doctor-sacs/index.ts`
- Servicio Backend: `services/sacs-verification/index.js`
- Servicio de verificacion: `apps/web/lib/supabase/services/doctor-verification-service.ts`
- Script de despliegue: `scripts/deploy-sacs-edge-function.ps1`

---

**Fecha**: 2026-02-13
**Estado del Servicio Railway**: Funcionando
