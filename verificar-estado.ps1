# Script de Verificación Cloudflare + Vercel
# Red-Salud.org

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Verificación Cloudflare + Vercel" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar DNS
Write-Host "1. Verificando DNS..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   red-salud.org:" -ForegroundColor White
nslookup red-salud.org 8.8.8.8 | Select-String "Address"
Write-Host ""
Write-Host "   www.red-salud.org:" -ForegroundColor White
nslookup www.red-salud.org 8.8.8.8 | Select-String "Address"
Write-Host ""

# 2. Verificar HTTP Status
Write-Host "2. Verificando HTTP Status..." -ForegroundColor Yellow
Write-Host ""
try {
    $response = Invoke-WebRequest -Uri "https://red-salud.org" -Method HEAD -MaximumRedirection 0 -ErrorAction SilentlyContinue
    $status = $response.StatusCode
    if ($status -eq 200) {
        Write-Host "   ✅ Status: $status OK" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Status: $status" -ForegroundColor Yellow
    }
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 403) {
        Write-Host "   ❌ Status: 403 Forbidden (Cloudflare Challenge activo)" -ForegroundColor Red
    } else {
        Write-Host "   ❌ Status: $status" -ForegroundColor Red
    }
}
Write-Host ""

# 3. Verificar Headers de Cloudflare
Write-Host "3. Verificando Headers de Cloudflare..." -ForegroundColor Yellow
Write-Host ""
try {
    $response = Invoke-WebRequest -Uri "https://red-salud.org" -Method HEAD -ErrorAction SilentlyContinue
    
    if ($response.Headers['Server']) {
        Write-Host "   Server: $($response.Headers['Server'])" -ForegroundColor White
    }
    
    if ($response.Headers['CF-RAY']) {
        Write-Host "   ✅ CF-RAY: $($response.Headers['CF-RAY'])" -ForegroundColor Green
    } else {
        Write-Host "   ❌ CF-RAY: No encontrado" -ForegroundColor Red
    }
    
    if ($response.Headers['cf-mitigated']) {
        Write-Host "   ⚠️  cf-mitigated: $($response.Headers['cf-mitigated']) (Challenge activo)" -ForegroundColor Yellow
    }
    
    if ($response.Headers['x-vercel-id']) {
        Write-Host "   ✅ x-vercel-id: $($response.Headers['x-vercel-id'])" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Error al obtener headers" -ForegroundColor Red
}
Write-Host ""

# 4. Verificar SSL
Write-Host "4. Verificando SSL..." -ForegroundColor Yellow
Write-Host ""
try {
    $request = [System.Net.WebRequest]::Create("https://red-salud.org")
    $response = $request.GetResponse()
    Write-Host "   ✅ SSL Válido" -ForegroundColor Green
    $response.Close()
} catch {
    Write-Host "   ❌ Error SSL: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 5. Verificar WWW
Write-Host "5. Verificando WWW..." -ForegroundColor Yellow
Write-Host ""
try {
    $response = Invoke-WebRequest -Uri "https://www.red-salud.org" -Method HEAD -MaximumRedirection 0 -ErrorAction SilentlyContinue
    $status = $response.StatusCode
    if ($status -eq 200) {
        Write-Host "   ✅ www.red-salud.org: $status OK" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  www.red-salud.org: $status" -ForegroundColor Yellow
    }
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 403) {
        Write-Host "   ❌ www.red-salud.org: 403 Forbidden" -ForegroundColor Red
    } else {
        Write-Host "   ❌ www.red-salud.org: $status" -ForegroundColor Red
    }
}
Write-Host ""

# Resumen
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si ves:" -ForegroundColor White
Write-Host "  ✅ = Todo bien" -ForegroundColor Green
Write-Host "  ⚠️  = Requiere atención" -ForegroundColor Yellow
Write-Host "  ❌ = Problema crítico" -ForegroundColor Red
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor White
Write-Host "  1. Revisa GUIA-LIMPIEZA-CLOUDFLARE-VERCEL.md" -ForegroundColor Cyan
Write-Host "  2. Sigue los pasos en orden" -ForegroundColor Cyan
Write-Host "  3. Ejecuta este script nuevamente para verificar" -ForegroundColor Cyan
Write-Host ""
