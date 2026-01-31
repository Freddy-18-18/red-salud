# Script para verificar la configuración DNS de red-salud.org

Write-Host "=== Verificación DNS para red-salud.org ===" -ForegroundColor Cyan
Write-Host ""

# Verificar dominio principal
Write-Host "1. Verificando red-salud.org..." -ForegroundColor Yellow
nslookup red-salud.org
Write-Host ""

# Verificar www
Write-Host "2. Verificando www.red-salud.org..." -ForegroundColor Yellow
nslookup www.red-salud.org
Write-Host ""

# Verificar registros CNAME
Write-Host "3. Verificando registros CNAME..." -ForegroundColor Yellow
nslookup -type=CNAME red-salud.org
Write-Host ""

# Verificar registros A
Write-Host "4. Verificando registros A..." -ForegroundColor Yellow
nslookup -type=A red-salud.org
Write-Host ""

Write-Host "=== Verificación completada ===" -ForegroundColor Green
Write-Host ""
Write-Host "Notas:" -ForegroundColor Cyan
Write-Host "- Si ves 'cname.vercel-dns.com', la configuración es correcta" -ForegroundColor White
Write-Host "- Si ves '76.76.21.21', también es correcto (A record de Vercel)" -ForegroundColor White
Write-Host "- Si ves otra IP, necesitas actualizar los registros DNS en Cloudflare" -ForegroundColor White
