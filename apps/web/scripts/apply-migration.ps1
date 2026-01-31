# Script para aplicar migraciones a Supabase
# Uso: .\scripts\apply-migration.ps1

Write-Host "🔄 Aplicando migraciones a Supabase..." -ForegroundColor Cyan

# Verificar si Supabase CLI está instalado
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI no está instalado" -ForegroundColor Red
    Write-Host "📦 Instalando Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
}

# Aplicar migraciones
Write-Host "📤 Aplicando migraciones..." -ForegroundColor Yellow
npx supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migraciones aplicadas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al aplicar migraciones" -ForegroundColor Red
    Write-Host "💡 Puedes aplicar la migración manualmente:" -ForegroundColor Yellow
    Write-Host "   1. Abre el Dashboard de Supabase" -ForegroundColor White
    Write-Host "   2. Ve a SQL Editor" -ForegroundColor White
    Write-Host "   3. Copia y ejecuta el contenido de:" -ForegroundColor White
    Write-Host "      supabase/migrations/20241109000001_add_verification_columns.sql" -ForegroundColor Cyan
}
