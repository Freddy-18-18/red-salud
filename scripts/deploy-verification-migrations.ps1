# ============================================
# Script: Aplicar migraciones de verificación multi-nivel
# Fecha: 2026-02-14
# Descripción: Aplica las migraciones del sistema de verificación profesional
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "APLICANDO MIGRACIONES - SISTEMA DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SUPABASE_PROJECT_ID = "hwckkfiirldgundbcjsp"
$MIGRATIONS_DIR = "c:\Users\Fredd\Developer\red-salud\apps\web\supabase\migrations"

# Lista de migraciones en orden
$migrations = @(
    "20260214000000_create_professional_verification_system.sql",
    "20260214000001_migrate_existing_doctors_to_new_system.sql",
    "20260214000002_create_verification_functions.sql"
)

Write-Host "Proyecto Supabase: $SUPABASE_PROJECT_ID" -ForegroundColor Yellow
Write-Host "Directorio de migraciones: $MIGRATIONS_DIR" -ForegroundColor Yellow
Write-Host ""

# Verificar que el directorio de migraciones existe
if (-not (Test-Path $MIGRATIONS_DIR)) {
    Write-Host "❌ Error: El directorio de migraciones no existe" -ForegroundColor Red
    Write-Host "   Path: $MIGRATIONS_DIR" -ForegroundColor Red
    exit 1
}

Write-Host "Migraciones a aplicar:" -ForegroundColor Green
$migrations | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""

# Confirmar antes de proceder
$confirmation = Read-Host "¿Deseas continuar? (s/N)"
if ($confirmation -ne 's' -and $confirmation -ne 'S') {
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Aplicando migraciones..." -ForegroundColor Cyan
Write-Host ""

# Aplicar cada migración
$successCount = 0
$failCount = 0

foreach ($migration in $migrations) {
    $migrationPath = Join-Path $MIGRATIONS_DIR $migration
    
    Write-Host "📄 Aplicando: $migration" -ForegroundColor White
    
    # Verificar que el archivo existe
    if (-not (Test-Path $migrationPath)) {
        Write-Host "   ❌ Archivo no encontrado: $migrationPath" -ForegroundColor Red
        $failCount++
        continue
    }
    
    try {
        # Ejecutar supabase db push
        $output = supabase db push --project-ref $SUPABASE_PROJECT_ID 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Éxito" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "   ❌ Error al aplicar migración" -ForegroundColor Red
            Write-Host "   Output: $output" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "   ❌ Excepción: $_" -ForegroundColor Red
        $failCount++
    }
    
    Write-Host ""
}

# Resumen
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Migraciones exitosas: $successCount" -ForegroundColor Green
Write-Host "Migraciones fallidas: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Gray" })
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "✅ Todas las migraciones se aplicaron correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Verificar las tablas en Supabase Dashboard" -ForegroundColor Gray
    Write-Host "2. Revisar que los datos de médicos existentes se migraron correctamente" -ForegroundColor Gray
    Write-Host "3. Probar las funciones de verificación desde el frontend" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Algunas migraciones fallaron" -ForegroundColor Yellow
    Write-Host "Revisa los errores arriba y vuelve a intentar" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

# Opcional: Mostrar estadísticas
Write-Host ""
$showStats = Read-Host "¿Deseas ver las estadísticas del sistema de verificación? (s/N)"
if ($showStats -eq 's' -or $showStats -eq 'S') {
    Write-Host ""
    Write-Host "Obteniendo estadísticas..." -ForegroundColor Cyan
    
    # Aquí podrías ejecutar una query para obtener stats
    # Por ahora solo mostramos un placeholder
    Write-Host "Para ver estadísticas, ejecuta en Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host "SELECT * FROM get_verification_statistics();" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Script finalizado." -ForegroundColor Green
