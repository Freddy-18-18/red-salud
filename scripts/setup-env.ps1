# Script para configurar variables de entorno en Vercel
Write-Host "🔧 Configurando variables de entorno en Vercel..." -ForegroundColor Cyan

# Variable 1: NEXT_PUBLIC_SUPABASE_URL
Write-Host "`n📝 Configurando NEXT_PUBLIC_SUPABASE_URL..." -ForegroundColor Yellow
$env1 = "https://hwckkfiirldgundbcjsp.supabase.co"
echo $env1 | vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
Write-Host "`n📝 Configurando NEXT_PUBLIC_SUPABASE_ANON_KEY..." -ForegroundColor Yellow
$env2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2trZmlpcmxkZ3VuZGJjanNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDA4MjcsImV4cCI6MjA3Nzc3NjgyN30.6Gh2U3mx7NsePvQEYMGnh23DqhJV43QRlPvYRynO8fY"
echo $env2 | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Variable 3: SUPABASE_SERVICE_ROLE_KEY
Write-Host "`n📝 Configurando SUPABASE_SERVICE_ROLE_KEY..." -ForegroundColor Yellow
$env3 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2trZmlpcmxkZ3VuZGJjanNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIwMDgyNywiZXhwIjoyMDc3Nzc2ODI3fQ.RpI3Rw3U_r3KvdSRSNTsNnN7jKkoeuNVeLoQ7wptKfY"
echo $env3 | vercel env add SUPABASE_SERVICE_ROLE_KEY production

Write-Host "`n✅ Variables de entorno configuradas!" -ForegroundColor Green
Write-Host "`n🚀 Ahora puedes hacer deploy con: vercel --prod" -ForegroundColor Cyan
