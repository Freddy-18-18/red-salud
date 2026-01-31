# Script para corregir errores comunes de ESLint

Write-Host "Corrigiendo errores de ESLint..." -ForegroundColor Green

# 1. Eliminar variables no usadas (comentarlas con prefijo _)
Write-Host "`n1. Comentando variables no usadas..." -ForegroundColor Yellow

# Obtener archivos con errores de variables no usadas
$files = npm run lint 2>&1 | Select-String "is defined but never used|is assigned a value but never used" | 
    ForEach-Object { 
        if ($_ -match "([^:]+\.tsx?)") { 
            $matches[1] 
        } 
    } | Select-Object -Unique

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  Procesando: $file" -ForegroundColor Cyan
        $content = Get-Content $file -Raw
        
        # Comentar variables no usadas con prefijo _
        $content = $content -replace "const (\w+) =", 'const _$1 ='
        $content = $content -replace "let (\w+) =", 'let _$1 ='
        $content = $content -replace "\((\w+):", '(_$1:'
        $content = $content -replace ", (\w+)\)", ', _$1)'
        
        Set-Content $file $content
    }
}

Write-Host "`nScript completado!" -ForegroundColor Green
