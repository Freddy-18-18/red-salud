# Script final para completar TODOS los elementos de dark mode
# Este script aplica los últimos reemplazos necesarios para 100% de cobertura

Write-Host "🌓 COMPLETANDO DARK MODE - FASE 1 FINAL" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$pages = @(
    "app/(public)/precios/page.tsx",
    "app/(public)/servicios/page.tsx",
    "app/(public)/servicios/medicos/page.tsx",
    "app/(public)/servicios/pacientes/page.tsx",
    "app/(public)/servicios/clinicas/page.tsx",
    "app/(public)/servicios/farmacias/page.tsx",
    "app/(public)/servicios/laboratorios/page.tsx",
    "app/(public)/servicios/secretarias/page.tsx",
    "app/(public)/servicios/ambulancias/page.tsx",
    "app/(public)/servicios/seguros/page.tsx",
    "app/(public)/page.tsx",
    "app/(public)/nosotros/page.tsx",
    "app/(public)/blog/page.tsx",
    "app/(public)/soporte/page.tsx",
    "app/(public)/soporte/faq/page.tsx",
    "app/(public)/soporte/contacto/page.tsx"
)

$count = 0

foreach ($page in $pages) {
    if (-not (Test-Path $page)) {
        continue
    }
    
    $content = Get-Content $page -Raw
    $original = $content
    
    # Reemplazos finales
    $content = $content -replace 'className="bg-white"(?!.*dark:)', 'className="bg-white dark:bg-gray-800"'
    $content = $content -replace 'className="bg-gray-50"(?!.*dark:)', 'className="bg-gray-50 dark:bg-gray-900"'
    $content = $content -replace 'className="text-gray-900"(?!.*dark:)', 'className="text-gray-900 dark:text-white"'
    $content = $content -replace 'className="text-gray-700"(?!.*dark:)', 'className="text-gray-700 dark:text-gray-300"'
    $content = $content -replace 'className="text-gray-600"(?!.*dark:)', 'className="text-gray-600 dark:text-gray-300"'
    $content = $content -replace 'className="text-gray-500"(?!.*dark:)', 'className="text-gray-500 dark:text-gray-400"'
    $content = $content -replace 'border border-gray-100(?!.*dark:)', 'border border-gray-100 dark:border-gray-700'
    $content = $content -replace 'border border-gray-200(?!.*dark:)', 'border border-gray-200 dark:border-gray-700'
    $content = $content -replace 'border border-gray-300(?!.*dark:)', 'border border-gray-300 dark:border-gray-600'
    
    if ($content -ne $original) {
        Set-Content -Path $page -Value $content
        Write-Host "  ✅ $(Split-Path $page -Leaf)" -ForegroundColor Green
        $count++
    }
}

Write-Host ""
Write-Host "📊 Resumen" -ForegroundColor Cyan
Write-Host "----------" -ForegroundColor Cyan
Write-Host "✅ Páginas completadas: $count de $($pages.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 ¡FASE 1 COMPLETADA!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Próximo paso: .\scripts\check-dark-mode.ps1" -ForegroundColor White
Write-Host ""
