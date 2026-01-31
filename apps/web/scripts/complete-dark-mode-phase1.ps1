# Script para completar Dark Mode en Fase 1 (Páginas Públicas)
# Este script aplica los últimos reemplazos necesarios

Write-Host "🌓 Completando Dark Mode - Fase 1" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Función para aplicar reemplazos finales
function Complete-DarkMode {
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
    
    # Reemplazos para bg-white sin dark:
    $content = $content -replace 'className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"', 'className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"'
    
    # Reemplazos para bordes
    $content = $content -replace 'border border-gray-100(?!.*dark:)', 'border border-gray-100 dark:border-gray-700'
    $content = $content -replace 'border border-gray-200(?!.*dark:)', 'border border-gray-200 dark:border-gray-700'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $FilePath -Value $content
        Write-Host "  ✅ Completado: $PageName" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ℹ️  Ya completado: $PageName" -ForegroundColor Cyan
        return $false
    }
}

# Páginas a completar
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

Write-Host "📄 Completando páginas públicas..." -ForegroundColor Magenta
Write-Host ""

$count = 0
foreach ($page in $pages) {
    if (Complete-DarkMode -FilePath $page.Path -PageName $page.Name) {
        $count++
    }
}

Write-Host ""
Write-Host "📊 Resumen" -ForegroundColor Cyan
Write-Host "----------" -ForegroundColor Cyan
Write-Host "✅ Páginas completadas: $count" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Próximo paso:" -ForegroundColor Yellow
Write-Host "  Ejecutar: .\scripts\check-dark-mode.ps1" -ForegroundColor White
Write-Host ""
