# Script para eliminar variables no usadas de forma masiva

Write-Host "🔧 Eliminando variables no usadas..." -ForegroundColor Cyan

$files = @(
    "app/(protected)/academy/dashboard/page.tsx",
    "app/(protected)/academy/lesson/[id]/page.tsx",
    "app/(public)/blog/autor/[id]/page.tsx",
    "app/(public)/blog/escribir/page.tsx",
    "app/(public)/blog/page.tsx",
    "app/(public)/nosotros/page.tsx",
    "app/(public)/precios/components/PricingCards.tsx",
    "app/(public)/servicios/medicos/page.tsx",
    "app/(public)/soporte/contacto/page.tsx",
    "app/academy/page.tsx",
    "app/api/didit/check-status/route.ts",
    "app/api/didit/create-session/route.ts",
    "app/api/doctor/profile/update/route.ts",
    "app/api/icd11/search/route.ts",
    "app/api/icd11/validate/route.ts",
    "app/api/profile/get/route.ts"
)

$replacements = @{
    # Academy
    "import\s+\{\s*LucideIcon\s*\}\s+from\s+['""]lucide-react['""];\s*\n" = ""
    "import\s+\{\s*AcademyProgressService\s*\}\s+from[^;]+;\s*\n" = ""
    
    # Blog
    "import\s+\{\s*Shield\s*,?\s*\}\s+from\s+['""]lucide-react['""];\s*\n" = ""
    "import\s+\{\s*Image\s*\}\s+from\s+['""]next/image['""];\s*\n" = ""
    "import\s+\{\s*TabsContent\s*,?\s*\}\s+from[^;]+;\s*\n" = ""
    "import\s+\{\s*Calendar\s*,?\s*\}\s+from\s+['""]lucide-react['""];\s*\n" = ""
    "import\s+\{\s*User\s*,?\s*\}\s+from\s+['""]lucide-react['""];\s*\n" = ""
    "import\s+\{\s*ArrowRight\s*,?\s*\}\s+from\s+['""]lucide-react['""];\s*\n" = ""
    
    # Soporte
    "import\s+\{\s*HelpCircle\s*,?\s*\}\s+from\s+['""]lucide-react['""];\s*\n" = ""
    "import\s+\{\s*Globe\s*,?\s*\}\s+from\s+['""]lucide-react['""];\s*\n" = ""
    "import\s+\{\s*CheckCircle2\s*,?\s*\}\s+from\s+['""]lucide-react['""];\s*\n" = ""
    
    # API
    "import\s+\{\s*NextRequest\s*,?\s*\}\s+from\s+['""]next/server['""];\s*\n" = ""
    "import\s+\{\s*validateICD11Code\s*\}\s+from[^;]+;\s*\n" = ""
    
    # Variables no usadas
    ",\s*stars\s*:" = ":"
    ",\s*error\s*:" = ":"
    "const\s+scrollY\s*=\s*[^;]+;\s*\n" = ""
    "const\s+cardVariants\s*=\s*\{[^}]+\};\s*\n" = ""
}

$count = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        foreach ($pattern in $replacements.Keys) {
            $content = $content -replace $pattern, $replacements[$pattern]
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  ✓ $file" -ForegroundColor Green
            $count++
        }
    }
}

Write-Host "`n✅ $count archivos corregidos!" -ForegroundColor Green
Write-Host "📊 Verificando progreso..." -ForegroundColor Cyan

$lintOutput = npm run lint 2>&1 | Out-String
$problemsLine = $lintOutput -split "`n" | Where-Object { $_ -match "problems" } | Select-Object -Last 1
Write-Host $problemsLine -ForegroundColor Yellow
