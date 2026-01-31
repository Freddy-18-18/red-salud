# Script para aplicar Dark Mode a páginas de servicios
# Este script automatiza la aplicación de clases dark: a las páginas de servicios

Write-Host "🌓 Aplicando Dark Mode a Páginas de Servicios" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Función para aplicar reemplazos
function Apply-DarkModeReplacements {
    param (
        [string]$FilePath,
        [string]$PageName
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "  ⚠️  Archivo no encontrado: $PageName" -ForegroundColor Yellow
        return $false
    }
    
    $content = Get-Content $FilePath -Raw
    $originalContent = $content
    
    # Reemplazos principales
    $replacements = @(
        @{ Old = 'className="py-20 bg-gray-50"'; New = 'className="py-20 bg-gray-50 dark:bg-gray-900"' },
        @{ Old = 'className="py-20 bg-white"'; New = 'className="py-20 bg-white dark:bg-background"' },
        @{ Old = 'className="text-4xl font-bold text-gray-900 mb-4"'; New = 'className="text-4xl font-bold text-gray-900 dark:text-white mb-4"' },
        @{ Old = 'className="text-xl text-gray-600 max-w-2xl mx-auto"'; New = 'className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"' },
        @{ Old = 'className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"'; New = 'className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"' },
        @{ Old = 'className="bg-linear-to-br from-blue-100 to-teal-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6"'; New = 'className="bg-linear-to-br from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900 w-14 h-14 rounded-xl flex items-center justify-center mb-6"' },
        @{ Old = 'className="h-7 w-7 text-blue-600"'; New = 'className="h-7 w-7 text-blue-600 dark:text-blue-400"' },
        @{ Old = 'className="text-xl font-bold text-gray-900 mb-3"'; New = 'className="text-xl font-bold text-gray-900 dark:text-white mb-3"' },
        @{ Old = 'className="text-gray-600 leading-relaxed"'; New = 'className="text-gray-600 dark:text-gray-300 leading-relaxed"' },
        @{ Old = 'className="text-4xl font-bold text-gray-900 mb-6"'; New = 'className="text-4xl font-bold text-gray-900 dark:text-white mb-6"' },
        @{ Old = 'className="text-lg text-gray-600 mb-8"'; New = 'className="text-lg text-gray-600 dark:text-gray-300 mb-8"' },
        @{ Old = 'className="text-gray-700 text-lg"'; New = 'className="text-gray-700 dark:text-gray-300 text-lg"' },
        @{ Old = 'className="aspect-square rounded-2xl bg-linear-to-br from-blue-100 to-teal-100 p-8"'; New = 'className="aspect-square rounded-2xl bg-linear-to-br from-blue-100 to-teal-100 dark:from-blue-950 dark:to-teal-950 p-8"' },
        @{ Old = 'className="text-6xl font-bold text-blue-600 mb-2"'; New = 'className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2"' },
        @{ Old = 'className="text-xl text-gray-700"'; New = 'className="text-xl text-gray-700 dark:text-gray-300"' },
        @{ Old = 'className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"'; New = 'className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"' },
        @{ Old = 'className="text-gray-700 mb-6 leading-relaxed italic"'; New = 'className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic"' },
        @{ Old = 'className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center"'; New = 'className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center"' },
        @{ Old = 'className="text-blue-600 font-bold text-lg"'; New = 'className="text-blue-600 dark:text-blue-400 font-bold text-lg"' },
        @{ Old = 'className="font-bold text-gray-900"'; New = 'className="font-bold text-gray-900 dark:text-white"' },
        @{ Old = 'className="text-sm text-gray-500"'; New = 'className="text-sm text-gray-500 dark:text-gray-400"' },
        @{ Old = 'className="bg-gray-50 border border-gray-200 rounded-xl px-6"'; New = 'className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6"' },
        @{ Old = 'className="text-left text-lg font-semibold text-gray-900 hover:text-blue-600 hover:no-underline"'; New = 'className="text-left text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:no-underline"' },
        @{ Old = 'className="text-gray-700 leading-relaxed pt-2"'; New = 'className="text-gray-700 dark:text-gray-300 leading-relaxed pt-2"' }
    )
    
    foreach ($replacement in $replacements) {
        $content = $content -replace [regex]::Escape($replacement.Old), $replacement.New
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $FilePath -Value $content
        Write-Host "  ✅ Dark mode aplicado: $PageName" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ⚠️  No se encontraron elementos para reemplazar: $PageName" -ForegroundColor Yellow
        return $false
    }
}

# Aplicar a páginas de servicios
$serviciosPages = @(
    @{ Path = "app/(public)/servicios/clinicas/page.tsx"; Name = "Clínicas" },
    @{ Path = "app/(public)/servicios/farmacias/page.tsx"; Name = "Farmacias" },
    @{ Path = "app/(public)/servicios/laboratorios/page.tsx"; Name = "Laboratorios" },
    @{ Path = "app/(public)/servicios/ambulancias/page.tsx"; Name = "Ambulancias" },
    @{ Path = "app/(public)/servicios/seguros/page.tsx"; Name = "Seguros" }
)

Write-Host "🏥 Aplicando a páginas de servicios..." -ForegroundColor Magenta
Write-Host ""

$successCount = 0
foreach ($page in $serviciosPages) {
    if (Apply-DarkModeReplacements -FilePath $page.Path -PageName $page.Name) {
        $successCount++
    }
}

Write-Host ""
Write-Host "📊 Resumen" -ForegroundColor Cyan
Write-Host "----------" -ForegroundColor Cyan
Write-Host "✅ Páginas actualizadas: $successCount de $($serviciosPages.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Ejecutar: .\scripts\check-dark-mode.ps1" -ForegroundColor White
Write-Host "  2. Verificar que todas las páginas muestren ✅ o 🟡" -ForegroundColor White
Write-Host "  3. Hacer commit de los cambios" -ForegroundColor White
Write-Host ""
