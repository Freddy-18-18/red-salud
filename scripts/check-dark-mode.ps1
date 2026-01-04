# Script para verificar implementación de Dark Mode en páginas públicas
# Uso: .\scripts\check-dark-mode.ps1

Write-Host "🌓 Verificador de Dark Mode - Páginas Públicas" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Función para contar ocurrencias
function Count-Occurrences {
    param (
        [string]$File,
        [string]$Pattern
    )
    
    if (Test-Path $File) {
        $content = Get-Content $File -Raw
        $matches = [regex]::Matches($content, $Pattern)
        return $matches.Count
    }
    return 0
}

# Función para verificar una página
function Check-Page {
    param (
        [string]$Path,
        [string]$Name
    )
    
    if (-not (Test-Path $Path)) {
        Write-Host "  ⚠️  Archivo no encontrado: $Name" -ForegroundColor Yellow
        return
    }
    
    # Contar elementos que necesitan dark mode
    $bgWhite = Count-Occurrences -File $Path -Pattern 'bg-white(?!\s+dark:)'
    $bgGray50 = Count-Occurrences -File $Path -Pattern 'bg-gray-50(?!\s+dark:)'
    $bgGray100 = Count-Occurrences -File $Path -Pattern 'bg-gray-100(?!\s+dark:)'
    $textGray900 = Count-Occurrences -File $Path -Pattern 'text-gray-900(?!\s+dark:)'
    $textGray700 = Count-Occurrences -File $Path -Pattern 'text-gray-700(?!\s+dark:)'
    $textGray600 = Count-Occurrences -File $Path -Pattern 'text-gray-600(?!\s+dark:)'
    $borderGray = Count-Occurrences -File $Path -Pattern 'border-gray-\d+(?!\s+dark:)'
    
    # Contar elementos con dark mode
    $darkClasses = Count-Occurrences -File $Path -Pattern 'dark:'
    
    $total = $bgWhite + $bgGray50 + $bgGray100 + $textGray900 + $textGray700 + $textGray600 + $borderGray
    
    Write-Host "  📄 $Name" -ForegroundColor White
    
    if ($darkClasses -eq 0 -and $total -gt 0) {
        Write-Host "    ❌ SIN dark mode ($total elementos sin dark:)" -ForegroundColor Red
    } elseif ($total -gt 5) {
        Write-Host "    ⚠️  PARCIAL ($total elementos sin dark:, $darkClasses con dark:)" -ForegroundColor Yellow
    } elseif ($total -gt 0) {
        Write-Host "    🟡 CASI COMPLETO ($total elementos sin dark:, $darkClasses con dark:)" -ForegroundColor Yellow
    } else {
        Write-Host "    ✅ COMPLETO ($darkClasses clases dark:)" -ForegroundColor Green
    }
    
    if ($total -gt 0) {
        if ($bgWhite -gt 0) { Write-Host "      • bg-white sin dark: $bgWhite" -ForegroundColor Gray }
        if ($bgGray50 -gt 0) { Write-Host "      • bg-gray-50 sin dark: $bgGray50" -ForegroundColor Gray }
        if ($bgGray100 -gt 0) { Write-Host "      • bg-gray-100 sin dark: $bgGray100" -ForegroundColor Gray }
        if ($textGray900 -gt 0) { Write-Host "      • text-gray-900 sin dark: $textGray900" -ForegroundColor Gray }
        if ($textGray700 -gt 0) { Write-Host "      • text-gray-700 sin dark: $textGray700" -ForegroundColor Gray }
        if ($textGray600 -gt 0) { Write-Host "      • text-gray-600 sin dark: $textGray600" -ForegroundColor Gray }
        if ($borderGray -gt 0) { Write-Host "      • border-gray-* sin dark: $borderGray" -ForegroundColor Gray }
    }
    
    Write-Host ""
}

# Verificar páginas de servicios
Write-Host "🏥 PÁGINAS DE SERVICIOS" -ForegroundColor Magenta
Write-Host "------------------------" -ForegroundColor Magenta
Check-Page -Path "app/(public)/servicios/page.tsx" -Name "Index"
Check-Page -Path "app/(public)/servicios/pacientes/page.tsx" -Name "Pacientes"
Check-Page -Path "app/(public)/servicios/medicos/page.tsx" -Name "Médicos"
Check-Page -Path "app/(public)/servicios/clinicas/page.tsx" -Name "Clínicas"
Check-Page -Path "app/(public)/servicios/farmacias/page.tsx" -Name "Farmacias"
Check-Page -Path "app/(public)/servicios/laboratorios/page.tsx" -Name "Laboratorios"
Check-Page -Path "app/(public)/servicios/secretarias/page.tsx" -Name "Secretarias"
Check-Page -Path "app/(public)/servicios/ambulancias/page.tsx" -Name "Ambulancias"
Check-Page -Path "app/(public)/servicios/seguros/page.tsx" -Name "Seguros"

# Verificar otras páginas públicas
Write-Host "📄 OTRAS PÁGINAS PÚBLICAS" -ForegroundColor Magenta
Write-Host "-------------------------" -ForegroundColor Magenta
Check-Page -Path "app/(public)/page.tsx" -Name "Home"
Check-Page -Path "app/(public)/nosotros/page.tsx" -Name "Nosotros"
Check-Page -Path "app/(public)/precios/page.tsx" -Name "Precios"
Check-Page -Path "app/(public)/blog/page.tsx" -Name "Blog"
Check-Page -Path "app/(public)/soporte/page.tsx" -Name "Soporte"
Check-Page -Path "app/(public)/soporte/faq/page.tsx" -Name "Soporte - FAQ"
Check-Page -Path "app/(public)/soporte/contacto/page.tsx" -Name "Soporte - Contacto"

# Resumen
Write-Host "📊 RESUMEN" -ForegroundColor Cyan
Write-Host "----------" -ForegroundColor Cyan
Write-Host ""
Write-Host "Leyenda:" -ForegroundColor White
Write-Host "  ✅ COMPLETO      - Página con dark mode implementado" -ForegroundColor Green
Write-Host "  🟡 CASI COMPLETO - Pocos elementos sin dark mode" -ForegroundColor Yellow
Write-Host "  ⚠️  PARCIAL      - Algunos elementos con dark mode" -ForegroundColor Yellow
Write-Host "  ❌ SIN dark mode - Página sin implementar" -ForegroundColor Red
Write-Host ""
Write-Host "💡 Tip: Usa /servicios/medicos como referencia para implementar dark mode" -ForegroundColor Cyan
Write-Host ""
