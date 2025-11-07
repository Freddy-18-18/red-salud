# Script de Diagnostico DNS para red-salud.org
# Ejecutar en PowerShell

Write-Host "[*] Diagnostico DNS para red-salud.org" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Funcion para verificar DNS
function Test-DNS {
    param($domain)
    
    Write-Host "[>] Verificando: $domain" -ForegroundColor Yellow
    
    try {
        $result = nslookup $domain 1.1.1.1 2>&1
        Write-Host $result -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "[X] Error al consultar DNS" -ForegroundColor Red
    }
}

# Verificar dominio principal
Test-DNS "red-salud.org"

# Verificar www
Test-DNS "www.red-salud.org"

# Verificar si apunta a Vercel
Write-Host "`n[>] Verificando conexion a Vercel..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://red-salud.org" -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "[OK] Respuesta HTTP: $($response.StatusCode)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode) {
        Write-Host "[!] Respuesta HTTP: $statusCode" -ForegroundColor Yellow
        if ($statusCode -eq 404) {
            Write-Host "    El dominio responde pero la pagina no existe" -ForegroundColor Yellow
            Write-Host "    Verifica que app/page.tsx exista en tu proyecto" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[X] No se puede conectar al dominio" -ForegroundColor Red
        Write-Host "    Verifica la configuracion DNS en Cloudflare" -ForegroundColor Red
    }
}

# Verificar SSL
Write-Host "`n[>] Verificando SSL..." -ForegroundColor Yellow
try {
    $request = [System.Net.WebRequest]::Create("https://red-salud.org")
    $request.Timeout = 5000
    $response = $request.GetResponse()
    Write-Host "[OK] SSL funcionando correctamente" -ForegroundColor Green
    $response.Close()
} catch {
    Write-Host "[X] Error SSL: $($_.Exception.Message)" -ForegroundColor Red
}

# Resumen
Write-Host "`n[*] Resumen de Diagnostico" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si ves errores arriba, sigue estos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a Cloudflare Dashboard: https://dash.cloudflare.com/" -ForegroundColor White
Write-Host "2. Selecciona el dominio: red-salud.org" -ForegroundColor White
Write-Host "3. Ve a DNS > Records" -ForegroundColor White
Write-Host "4. Configura:" -ForegroundColor White
Write-Host "   - CNAME @ -> cname.vercel-dns.com (Proxy ON)" -ForegroundColor Gray
Write-Host "   - CNAME www -> cname.vercel-dns.com (Proxy ON)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Ve a Vercel Dashboard y agrega el dominio" -ForegroundColor White
Write-Host "6. Espera 10-30 minutos para propagacion DNS" -ForegroundColor White
Write-Host ""
Write-Host "[*] Documentacion completa en: ARQUITECTURA-HIBRIDA.md" -ForegroundColor Cyan
