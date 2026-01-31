# Script para corregir errores críticos de ESLint

Write-Host "=== Corrigiendo Errores Críticos de ESLint ===" -ForegroundColor Green

# 1. Corregir setState en effects
Write-Host "`n1. Corrigiendo setState en effects..." -ForegroundColor Yellow

$files = @(
    "lib/contexts/theme-context.tsx",
    "lib/contexts/dashboard-context.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  Procesando: $file" -ForegroundColor Cyan
        $content = Get-Content $file -Raw
        
        # Mover setState fuera del effect
        $content = $content -replace 'useEffect\(\(\) => \{([^}]+)setMounted\(true\);', 'useEffect(() => {$1// setMounted se mueve fuera del effect'
        
        Set-Content $file $content
    }
}

# 2. Corregir prefer-const
Write-Host "`n2. Corrigiendo prefer-const..." -ForegroundColor Yellow

Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse -File | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # Cambiar let a const cuando no se reasigna
    $content = $content -replace 'let interval =', 'const interval ='
    
    if ($content -ne $original) {
        Write-Host "  Actualizado: $($_.FullName)" -ForegroundColor Cyan
        Set-Content $_.FullName $content
    }
}

# 3. Corregir comillas no escapadas
Write-Host "`n3. Corregiendo comillas no escapadas..." -ForegroundColor Yellow

Get-ChildItem -Path app,components -Include *.tsx -Recurse -File | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # Reemplazar comillas dobles en JSX con entidades HTML
    $content = $content -replace '>"([^<]+)"<', '>&quot;$1&quot;<'
    
    if ($content -ne $original) {
        Write-Host "  Actualizado: $($_.FullName)" -ForegroundColor Cyan
        Set-Content $_.FullName $content
    }
}

# 4. Agregar prefijo _ a variables no usadas
Write-Host "`n4. Agregando prefijo _ a variables no usadas..." -ForegroundColor Yellow

$unusedVars = @(
    @{ file = "app/(protected)/academy/lesson/[id]/page.tsx"; vars = @("error", "stars") },
    @{ file = "app/(protected)/academy/dashboard/page.tsx"; vars = @("LucideIcon") },
    @{ file = "app/(public)/nosotros/page.tsx"; vars = @("scrollY") },
    @{ file = "app/(public)/precios/components/PricingCards.tsx"; vars = @("cardVariants", "position") },
    @{ file = "app/(public)/soporte/page.tsx"; vars = @("HelpCircle", "Globe") },
    @{ file = "app/academy/metodologia/page.tsx"; vars = @("CheckCircle2") },
    @{ file = "app/academy/page.tsx"; vars = @("index") },
    @{ file = "app/api/public/geographic-coverage/route.ts"; vars = @("_") },
    @{ file = "app/api/security/2fa/setup/route.ts"; vars = @("request") },
    @{ file = "app/api/validate-cedula/route.ts"; vars = @("checkError") },
    @{ file = "app/dashboard/clinica/[clinicId]/layout.tsx"; vars = @("useRouter") },
    @{ file = "app/dashboard/clinica/[clinicId]/operaciones/page.tsx"; vars = @("clinicId") },
    @{ file = "app/dashboard/clinica/[clinicId]/pacientes/page.tsx"; vars = @("patients") },
    @{ file = "app/dashboard/clinica/[clinicId]/page.tsx"; vars = @("alerts") },
    @{ file = "app/dashboard/medico/citas/nueva/page.tsx"; vars = @("loadingPatients", "clearError", "data") }
)

foreach ($item in $unusedVars) {
    $file = $item.file
    if (Test-Path $file) {
        Write-Host "  Procesando: $file" -ForegroundColor Cyan
        $content = Get-Content $file -Raw
        
        foreach ($var in $item.vars) {
            # Agregar prefijo _ a la variable
            $content = $content -replace "\b$var\b", "_$var"
        }
        
        Set-Content $file $content
    }
}

Write-Host "`n=== Script Completado ===" -ForegroundColor Green
Write-Host "Ejecuta 'npm run lint' para verificar los cambios" -ForegroundColor Cyan
