# 🏥 Script de Deployment - SACS Edge Function
# Este script despliega la edge function de verificación SACS en Supabase

param(
    [string]$ProjectRef = "",
    [switch]$CheckOnly = $false,
    [switch]$Help = $false
)

$ErrorActionPreference = "Stop"

# Colores para output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error-Custom { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning-Custom { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }

# Banner
function Show-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║  🏥 SACS Edge Function Deployment Script           ║" -ForegroundColor Blue
    Write-Host "║  Red-Salud - Verificación de Médicos               ║" -ForegroundColor Blue
    Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

# Mostrar ayuda
function Show-Help {
    Show-Banner
    Write-Host "USO:"
    Write-Host "  .\deploy-sacs-edge-function.ps1 [-ProjectRef <REF>] [-CheckOnly] [-Help]"
    Write-Host ""
    Write-Host "OPCIONES:"
    Write-Host "  -ProjectRef <REF>    Project Reference ID de Supabase (opcional si ya está linkeado)"
    Write-Host "  -CheckOnly           Solo verifica el estado actual sin desplegar"
    Write-Host "  -Help                Muestra esta ayuda"
    Write-Host ""
    Write-Host "EJEMPLOS:"
    Write-Host "  .\deploy-sacs-edge-function.ps1"
    Write-Host "  .\deploy-sacs-edge-function.ps1 -ProjectRef abcdefghijklmnop"
    Write-Host "  .\deploy-sacs-edge-function.ps1 -CheckOnly"
    Write-Host ""
    exit 0
}

if ($Help) { Show-Help }

Show-Banner

# 1. Verificar que Supabase CLI está instalado
Write-Info "Verificando Supabase CLI..."
$supabaseCLI = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseCLI) {
    Write-Error-Custom "Supabase CLI no está instalado."
    Write-Host ""
    Write-Host "Para instalar Supabase CLI:" -ForegroundColor Yellow
    Write-Host "  1. Con Scoop:" -ForegroundColor Yellow
    Write-Host "     scoop bucket add supabase https://github.com/supabase/scoop-bucket.git" -ForegroundColor White
    Write-Host "     scoop install supabase" -ForegroundColor White
    Write-Host ""
    Write-Host "  2. O con npm:" -ForegroundColor Yellow
    Write-Host "     npm install -g supabase" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Success "Supabase CLI instalado: $(supabase --version)"

# 2. Verificar autenticación
Write-Info "Verificando autenticación..."
$authCheck = supabase projects list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "No estás autenticado en Supabase."
    Write-Host ""
    Write-Host "Para autenticarte ejecuta:" -ForegroundColor Yellow
    Write-Host "  supabase login" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Success "Autenticado en Supabase"

# 3. Link al proyecto (si se proporcionó ProjectRef)
if ($ProjectRef -ne "") {
    Write-Info "Linkeando proyecto: $ProjectRef..."
    $linkResult = supabase link --project-ref $ProjectRef 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Error al linkear el proyecto."
        Write-Host $linkResult
        exit 1
    }
    
    Write-Success "Proyecto linkeado"
}

# 4. Verificar que estamos en el proyecto correcto
Write-Info "Verificando proyecto actual..."
$projectStatus = supabase status 2>&1

# 5. Verificar que existe la edge function
$functionPath = Join-Path $PSScriptRoot "..\apps\web\supabase\functions\verify-doctor-sacs"

if (-not (Test-Path $functionPath)) {
    Write-Error-Custom "No se encontró la edge function en: $functionPath"
    exit 1
}

Write-Success "Edge function encontrada: verify-doctor-sacs"

# 6. Verificar variables de entorno
Write-Info "Verificando variables de entorno..."
$secretsList = supabase secrets list 2>&1

if ($secretsList -match "SACS_BACKEND_URL") {
    Write-Success "Variable SACS_BACKEND_URL configurada"
} else {
    Write-Warning-Custom "Variable SACS_BACKEND_URL no encontrada"
    Write-Host ""
    Write-Host "Para configurarla:" -ForegroundColor Yellow
    Write-Host "  supabase secrets set SACS_BACKEND_URL=https://sacs-verification-service-production.up.railway.app" -ForegroundColor White
    Write-Host ""
    Write-Host "¿Deseas configurarla ahora? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "S" -or $response -eq "s") {
        Write-Info "Configurando SACS_BACKEND_URL..."
        supabase secrets set SACS_BACKEND_URL="https://sacs-verification-service-production.up.railway.app"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Error al configurar la variable de entorno"
            exit 1
        }
        
        Write-Success "Variable configurada correctamente"
    } else {
        Write-Warning-Custom "Deployment cancelado. Configura la variable antes de continuar."
        exit 1
    }
}

# Si solo es check, terminar aquí
if ($CheckOnly) {
    Write-Success "Verificación completa. Todo listo para deployment."
    exit 0
}

# 7. Desplegar la edge function
Write-Info "Desplegando edge function..."
Write-Host ""
Write-Host "Esto puede tomar unos momentos..." -ForegroundColor Yellow
Write-Host ""

# Cambiar al directorio de functions
Push-Location (Join-Path $PSScriptRoot "..\apps\web\supabase\functions")

try {
    $deployResult = supabase functions deploy verify-doctor-sacs 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Error al desplegar la edge function"
        Write-Host $deployResult
        Pop-Location
        exit 1
    }
    
    Write-Success "Edge function desplegada correctamente"
} finally {
    Pop-Location
}

# 8. Verificar deployment
Write-Info "Verificando deployment..."
$functionsList = supabase functions list 2>&1

if ($functionsList -match "verify-doctor-sacs") {
    Write-Success "Deployment verificado exitosamente"
} else {
    Write-Warning-Custom "No se pudo verificar el deployment"
}

# 9. Mostrar información de logs
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           ✅ DEPLOYMENT COMPLETADO                   ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Info "Para ver los logs de la función:"
Write-Host "  supabase functions logs verify-doctor-sacs --follow" -ForegroundColor White
Write-Host ""
Write-Info "Para probar la función:"
Write-Host '  supabase functions invoke verify-doctor-sacs --payload ''{"cedula":"12345678","tipo_documento":"V"}''' -ForegroundColor White
Write-Host ""
Write-Success "El servicio SACS ahora debería funcionar correctamente en la aplicación."
Write-Host ""
