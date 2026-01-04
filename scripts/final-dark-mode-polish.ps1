# Script final para pulir Dark Mode - Elimina los últimos elementos sin dark:

Write-Host "✨ Puliendo Dark Mode - Últimos Detalles" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Polish-DarkMode {
    param (
        [string]$FilePath,
        [string]$PageName
    )
    
    if (-not (Test-Path $FilePath)) {
        return $false
    }
    
    $content = Get-Content $FilePath -Raw
    $originalLength = $content.Length
    
    # Reemplazos finales para bg-white sin dark:
    $content = $content -replace 'className="bg-white"(?!.*dark:)', 'className="bg-white dark:bg-background"'
    
    # Reemplazos para text-gray-900 sin dark:
    $content = $content -replace 'className="text-gray-900"(?!.*dark:)', 'className="text-gray-900 dark:text-white"'
    
    # Reemplazos para text-gray-700 sin dark:
    $content = $content -replace 'className="text-gray-700"(?!.*dark:)', 'className="text-gray-700 dark:text-gray-300"'
    
    # Reemplazos para text-gray-600 sin dark:
    $content = $content -replace 'className="text-gray-600"(?!.*dark:)', 'className="text-gray-600 dark:text-gray-300"'
    
    # Reemplazos para bg-gray-50 sin dark:
    $content = $content -replace 'className="bg-gray-50"(?!.*dark:)', 'className="bg-gray-50 dark:bg-gray-900"'
    
    if ($content.Length -ne $originalLength) {
        Set-Content -Path $FilePath -Value $content
        Write-Host "  ✅ $PageName" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ℹ️  $PageName" -ForegroundColor Cyan
        return $false
    }
}

$pages = @(
    @{ Path = "app/(public)/servicios/page.tsx"; Name = "Servicios Index" },
    @{ Path = "app/(public)/servicios/medicos/page.tsx"; Name = "Médicos" },
    @{ Path = "app/(public)/servicios/pacientes/page.tsx"; Name = "Pacientes" },
    @{ Path = "app/(public)/servicios/clinicas/page.tsx"; Name = "Clínicas" },
    @{ Path = "app/(public)/servicios/farmacias/page.tsx"; Name = "Farmacias" },
    @{ Path = "app/(public)/servicios/laboratorios/page.tsx"; Name = "Laboratorios" },
    @{ Path = "app/(public)/servicios/secretarias/page.tsx"; Name = "Secretarias" },
    @{ Path = "app/(public)/servicios/ambulancias/page.tsx"; Name = "Ambulancias" },
    @{ Path = "app/(public)/servicios/seguros/page.tsx"; Name = "Seguros" },
    @{ Path = "app/(public)/precios/page.tsx"; Name = "Precios" },
    @{ Path = "app/(public)/page.tsx"; Name = "Home" },
    @{ Path = "app/(public)/nosotros/page.tsx"; Name = "Nosotros" },
    @{ Path = "app/(public)/blog/page.tsx"; Name = "Blog" },
    @{ Path = "app/(public)/soporte/page.tsx"; Name = "Soporte" },
    @{ Path = "app/(public)/soporte/faq/page.tsx"; Name = "Soporte - FAQ" },
    @{ Path = "app/(public)/soporte/contacto/page.tsx"; Name = "Soporte - Contacto" }
)

Write-Host "🔧 Puliendo páginas..." -ForegroundColor Magenta
Write-Host ""

$count = 0
foreach ($page in $pages) {
    if (Polish-DarkMode -FilePath $page.Path -PageName $page.Name) {
        $count++
    }
}

Write-Host ""
Write-Host "📊 Resumen" -ForegroundColor Cyan
Write-Host "----------" -ForegroundColor Cyan
Write-Host "✅ Páginas pulidas: $count de $($pages.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 ¡Fase 1 Completada!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Próximo paso: .\scripts\check-dark-mode.ps1" -ForegroundColor White
Write-Host ""
