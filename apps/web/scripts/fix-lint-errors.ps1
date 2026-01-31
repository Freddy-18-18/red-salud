# Script para corregir errores comunes de linting

Write-Host "Corrigiendo errores de linting..." -ForegroundColor Cyan

# Reemplazar 'any' con tipos más específicos en errores
Write-Host "Reemplazando 'any' en estados de error..." -ForegroundColor Yellow

$hooksFiles = Get-ChildItem -Path "hooks" -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue

foreach ($file in $hooksFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Reemplazar any en estados de error
    $content = $content -replace "useState<any>\(null\)", "useState<string | null>(null)"
    $content = $content -replace "setError\]\s*=\s*useState<any>", "setError] = useState<string | null>"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Corregido: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Correcciones completadas!" -ForegroundColor Green
