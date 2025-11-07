# Script para Reconfigurar Variables de Entorno en Vercel
# Red-Salud

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Reconfiguración de Variables de Entorno" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Leer variables del .env.local
Write-Host "1. Leyendo variables de .env.local..." -ForegroundColor Yellow
$envContent = Get-Content .env.local -Raw

# Extraer valores
$supabaseUrl = ($envContent | Select-String -Pattern 'NEXT_PUBLIC_SUPABASE_URL=(.+)' -AllMatches).Matches.Groups[1].Value.Trim()
$supabaseAnonKey = ($envContent | Select-String -Pattern 'NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)' -AllMatches).Matches.Groups[1].Value.Trim()

Write-Host "   ✅ NEXT_PUBLIC_SUPABASE_URL: $supabaseUrl" -ForegroundColor Green
Write-Host "   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: $($supabaseAnonKey.Substring(0, 20))..." -ForegroundColor Green
Write-Host ""

# Confirmar
Write-Host "2. ¿Deseas continuar con la reconfiguración?" -ForegroundColor Yellow
Write-Host "   Esto eliminará las variables actuales y las volverá a crear." -ForegroundColor White
Write-Host ""
$confirm = Read-Host "   Escribe 'SI' para continuar"

if ($confirm -ne "SI") {
    Write-Host ""
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "3. Eliminando variables actuales..." -ForegroundColor Yellow

# Eliminar variables existentes
Write-Host "   Eliminando NEXT_PUBLIC_SUPABASE_URL..." -ForegroundColor White
vercel env rm NEXT_PUBLIC_SUPABASE_URL production --yes 2>$null
vercel env rm NEXT_PUBLIC_SUPABASE_URL preview --yes 2>$null
vercel env rm NEXT_PUBLIC_SUPABASE_URL development --yes 2>$null

Write-Host "   Eliminando NEXT_PUBLIC_SUPABASE_ANON_KEY..." -ForegroundColor White
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes 2>$null
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY preview --yes 2>$null
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY development --yes 2>$null

Write-Host "   Eliminando SUPABASE_SERVICE_ROLE_KEY..." -ForegroundColor White
vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes 2>$null
vercel env rm SUPABASE_SERVICE_ROLE_KEY preview --yes 2>$null
vercel env rm SUPABASE_SERVICE_ROLE_KEY development --yes 2>$null

Write-Host "   ✅ Variables eliminadas" -ForegroundColor Green
Write-Host ""

Write-Host "4. Agregando nuevas variables..." -ForegroundColor Yellow

# Agregar NEXT_PUBLIC_SUPABASE_URL
Write-Host "   Agregando NEXT_PUBLIC_SUPABASE_URL..." -ForegroundColor White
Write-Output $supabaseUrl | vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Agregar NEXT_PUBLIC_SUPABASE_ANON_KEY
Write-Host "   Agregando NEXT_PUBLIC_SUPABASE_ANON_KEY..." -ForegroundColor White
Write-Output $supabaseAnonKey | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

Write-Host ""
Write-Host "   ✅ Variables agregadas a Production" -ForegroundColor Green
Write-Host ""

Write-Host "5. Verificando variables..." -ForegroundColor Yellow
vercel env ls
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ RECONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor White
Write-Host "  1. Redeploy el proyecto: vercel --prod" -ForegroundColor Cyan
Write-Host "  2. Espera 2-3 minutos" -ForegroundColor Cyan
Write-Host "  3. Prueba: https://red-salud.vercel.app" -ForegroundColor Cyan
Write-Host ""
