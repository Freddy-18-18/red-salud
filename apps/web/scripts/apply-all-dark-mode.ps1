# Script para aplicar Dark Mode a TODAS las páginas públicas restantes
# Esto completa la Fase 1 completamente

Write-Host "🌓 Aplicando Dark Mode a Todas las Páginas Públicas" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

function Apply-AllDarkMode {
    param (
        [string]$FilePath,
        [string]$PageName
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "  ⚠️  No encontrado: $PageName" -ForegroundColor Yellow
        return $false
    }
    
    $content = Get-Content $FilePath -Raw
    $originalLength = $content.Length
    
    # Reemplazos principales
    $replacements = @(
        # Fondos de sección
        @{ Old = 'className="py-24 lg:py-32 bg-gray-50"'; New = 'className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-900"' },
        @{ Old = 'className="py-20 bg-gray-50"'; New = 'className="py-20 bg-gray-50 dark:bg-gray-900"' },
        @{ Old = 'className="py-24 bg-gray-50"'; New = 'className="py-24 bg-gray-50 dark:bg-gray-900"' },
        @{ Old = 'className="py-20 bg-white"'; New = 'className="py-20 bg-white dark:bg-background"' },
        @{ Old = 'className="py-24 bg-white"'; New = 'className="py-24 bg-white dark:bg-background"' },
        
        # Títulos
        @{ Old = 'className="text-4xl font-bold text-gray-900 mb-4"'; New = 'className="text-4xl font-bold text-gray-900 dark:text-white mb-4"' },
        @{ Old = 'className="text-3xl font-bold text-gray-900 mb-4"'; New = 'className="text-3xl font-bold text-gray-900 dark:text-white mb-4"' },
        @{ Old = 'className="text-4xl font-bold text-gray-900 mb-6"'; New = 'className="text-4xl font-bold text-gray-900 dark:text-white mb-6"' },
        
        # Textos
        @{ Old = 'className="text-xl text-gray-600 max-w-2xl mx-auto"'; New = 'className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"' },
        @{ Old = 'className="text-lg text-gray-600 mb-8"'; New = 'className="text-lg text-gray-600 dark:text-gray-300 mb-8"' },
        @{ Old = 'className="text-gray-600 leading-relaxed"'; New = 'className="text-gray-600 dark:text-gray-300 leading-relaxed"' },
        @{ Old = 'className="text-gray-700 leading-relaxed"'; New = 'className="text-gray-700 dark:text-gray-300 leading-relaxed"' },
        @{ Old = 'className="text-gray-600"'; New = 'className="text-gray-600 dark:text-gray-300"' },
        @{ Old = 'className="text-gray-700"'; New = 'className="text-gray-700 dark:text-gray-300"' },
        @{ Old = 'className="text-gray-500"'; New = 'className="text-gray-500 dark:text-gray-400"' },
        
        # Cards
        @{ Old = 'className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"'; New = 'className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"' },
        @{ Old = 'className="bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100"'; New = 'className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"' },
        
        # Bordes
        @{ Old = 'border border-gray-100'; New = 'border border-gray-100 dark:border-gray-700' },
        @{ Old = 'border border-gray-200'; New = 'border border-gray-200 dark:border-gray-700' },
        @{ Old = 'border border-gray-300'; New = 'border border-gray-300 dark:border-gray-600' }
    )
    
    foreach ($replacement in $replacements) {
        $content = $content -replace [regex]::Escape($replacement.Old), $replacement.New
    }
    
    if ($content.Length -ne $originalLength) {
        Set-Content -Path $FilePath -Value $content
        Write-Host "  ✅ $PageName" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ℹ️  $PageName (sin cambios)" -ForegroundColor Cyan
        return $false
    }
}

# Páginas a procesar
$pages = @(
    @{ Path = "app/(public)/servicios/page.tsx"; Name = "Servicios Index" },
    @{ Path = "app/(public)/servicios/medicos/page.tsx"; Name = "Médicos" },
    @{ Path = "app/(public)/precios/page.tsx"; Name = "Precios" },
    @{ Path = "app/(public)/page.tsx"; Name = "Home" },
    @{ Path = "app/(public)/nosotros/page.tsx"; Name = "Nosotros" },
    @{ Path = "app/(public)/blog/page.tsx"; Name = "Blog" },
    @{ Path = "app/(public)/soporte/page.tsx"; Name = "Soporte" },
    @{ Path = "app/(public)/soporte/faq/page.tsx"; Name = "Soporte - FAQ" },
    @{ Path = "app/(public)/soporte/contacto/page.tsx"; Name = "Soporte - Contacto" }
)

Write-Host "📄 Procesando páginas..." -ForegroundColor Magenta
Write-Host ""

$count = 0
foreach ($page in $pages) {
    if (Apply-AllDarkMode -FilePath $page.Path -PageName $page.Name) {
        $count++
    }
}

Write-Host ""
Write-Host "📊 Resumen" -ForegroundColor Cyan
Write-Host "----------" -ForegroundColor Cyan
Write-Host "✅ Páginas procesadas: $count de $($pages.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Próximo paso:" -ForegroundColor Yellow
Write-Host "  .\scripts\check-dark-mode.ps1" -ForegroundColor White
Write-Host ""
