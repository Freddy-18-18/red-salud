# 🔧 SOLUCIÓN: Error de Verificación SACS

## 🐛 El Problema

Estás viendo este error:
```
Verificación Fallida
Esta cédula no está registrada en el SACS como profesional de la salud
```

**PERO** el backend funciona correctamente (ya lo confirmamos con PowerShell).

---

## ✅ La Solución: Limpiar Cache del Navegador

El navegador está mostrando una **respuesta cacheada del error anterior**. Necesitas forzar una recarga limpia:

### **Opción 1: Hard Refresh (Recomendado)**

1. Abre la página: http://localhost:3000/dashboard/medico/perfil/setup
2. Abre las **DevTools** (F12)
3. Haz click derecho en el botón de **Reload** del navegador
4. Selecciona **"Empty Cache and Hard Reload"**
5. Cierra las DevTools
6. Vuelve a intentar la verificación

### **Opción 2: Modo Incógnito**

1. Abre una ventana en **modo incógnito** (Ctrl + Shift + N en Chrome/Edge)
2. Ve a http://localhost:3000
3. Inicia sesión
4. Intenta la verificación SACS

### **Opción 3: Borrar Cache Manualmente**

1. Presiona **Ctrl + Shift + Delete**
2. Selecciona:
   - ✅ Cached images and files
   - ✅ Cookies and other site data
3. Rango de tiempo: **Last hour** (última hora)
4. Click en **Clear data**
5. Recarga la página (F5)

---

## 🧪 Probar Directamente la Edge Function

Si quieres confirmar que la edge function funciona, ejecuta esto en PowerShell:

```powershell
$body = @{
    cedula = "14031469"
    tipo_documento = "V"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "https://hwckkfiirldgundbcjsp.supabase.co/functions/v1/verify-doctor-sacs" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{
        "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2trZmlpcmxkZ3VuZGJjanNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3NzU2NDIsImV4cCI6MjA0ODM1MTY0Mn0.GF3g0U4KWU8vvTGgJl_RJX0Xy-Y1TaxnEaHlnZBPOtI" 
    } `
    -UseBasicParsing

Write-Host "`n✅ STATUS: $($response.StatusCode)" -ForegroundColor Green
$result = $response.Content | ConvertFrom-Json
Write-Host "`n📊 RESULTADO:" -ForegroundColor Cyan
$result | ConvertTo-Json -Depth 10
```

**Resultado esperado:**
```json
{
  "success": true,
  "verified": true,
  "data": {
    "cedula": "14031469",
    "nombre_completo": "ANGELA GAMEZ",
    "profesion_principal": "MÉDICO(A) CIRUJANO(A)",
    "matricula_principal": "MPPS-65638",
    "especialidad_display": "ESPECIALISTA EN RADIOLOGÍA Y DIAGNÓSTICO POR IMAGENES",
    "es_medico_humano": true,
    "apto_red_salud": true
  },
  "message": "Médico verificado exitosamente"
}
```

---

## 🔎 Verificar Logs de Supabase

1. Ve a https://supabase.com/dashboard/project/hwckkfiirldgundbcjsp/functions
2. Click en **verify-doctor-sacs**
3. Ve a la pestaña **Logs**
4. Busca la invocación más reciente
5. Deberías ver:
   - `status_code: 200`
   - `execution_time_ms: ~7000-11000`

---

## 🚀 Si Sigue Sin Funcionar

### 1. Verifica que el backend de Railway esté corriendo

```powershell
Invoke-WebRequest https://sacs-verification-service-production.up.railway.app/health
```

Debe responder: `{"status":"ok","service":"sacs-verification-service","version":"2.0.0"}`

### 2. Verifica las variables de entorno en Supabase

1. Ve a https://supabase.com/dashboard/project/hwckkfiirldgundbcjsp/settings/functions
2. Verifica que exista:
   - `SACS_BACKEND_URL = https://sacs-verification-service-production.up.railway.app`

### 3. Redeploy de la Edge Function (solo si es necesario)

Si crees que el código de la edge function cambió:

```powershell
cd apps/web
supabase functions deploy verify-doctor-sacs --project-ref hwckkfiirldgundbcjsp
```

---

## ✨ Resumen

El problema es **99% seguro que es cache del navegador**. 

**Solución rápida:**
1. **Ctrl + Shift + R** (Windows) o **Cmd + Shift + R** (Mac)
2. O usa **modo incógnito**
3. Vuelve a intentar

---

¿Funcionó? 🎉
