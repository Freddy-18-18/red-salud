# 🚀 Deployment

## Preparación para Producción

### 1. Build de Producción

```bash
npm run build
```

Esto generará la carpeta `.next/` con el build optimizado.

### 2. Verificar Build Localmente

```bash
npm run start
# Abre http://localhost:3000
```

## Variables de Entorno en Producción

### Obligatorias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase | `eyJhbGciOiJIUzI1NiIs...` |

### Opcionales

| Variable | Descripción |
|----------|-------------|
| `GEMINI_API_KEY` | API key de Google Gemini (chatbot) |
| `ICD_API_CLIENT_ID` | Client ID para API ICD-11 |
| `ICD_API_CLIENT_SECRET` | Client Secret para API ICD-11 |

### Secretas (solo en servidor)

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (bypass RLS) |

> ⚠️ **IMPORTANTE:** `SUPABASE_SERVICE_ROLE_KEY` NUNCA debe exponerse al cliente. Solo usar en API Routes o Server Components.

## Deployment en Vercel

### 1. Conectar Repositorio

1. Ve a [vercel.com](https://vercel.com)
2. Importa el repositorio de GitHub
3. Vercel detectará Next.js automáticamente

### 2. Configurar Variables de Entorno

En Vercel Dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbG...
GEMINI_API_KEY = AIza...
```

### 3. Deploy

- **Producción:** Push a `main` → Deploy automático
- **Preview:** Push a cualquier branch → Deploy de preview

### Configuración de Vercel

El proyecto ya tiene `vercel.json` configurado (si aplica). Configuraciones importantes:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

## Configuración de Supabase

### 1. Proyecto en Producción

1. Crea un nuevo proyecto en [supabase.com](https://supabase.com)
2. Ejecuta las migraciones:

```bash
# Con Supabase CLI
supabase db push

# O manualmente: ejecuta cada archivo en supabase/migrations/
```

### 2. Configurar Auth

En Supabase Dashboard > Authentication > Providers:

1. **Email:** Habilitar "Email provider"
2. **Google:** 
   - Obtener credenciales en Google Cloud Console
   - Configurar redirect URL: `https://xxx.supabase.co/auth/v1/callback`

### 3. Configurar Storage (si aplica)

```sql
-- Crear bucket para archivos médicos
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-files', 'medical-files', false);

-- Policy para acceso
CREATE POLICY "Users can access own files"
ON storage.objects FOR ALL
USING (auth.uid() = owner);
```

## Checklist Pre-Deploy

- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas en Supabase
- [ ] RLS policies revisadas
- [ ] OAuth providers configurados
- [ ] `npm run build` funciona sin errores
- [ ] Tests pasando (si hay)

## Monitoreo Post-Deploy

### Vercel Analytics
- Habilitado automáticamente con `@vercel/speed-insights`
- Ver métricas en Vercel Dashboard

### Logs
- Vercel: Dashboard > Project > Logs
- Supabase: Dashboard > Logs

### Errores
- Configurar alertas en Vercel
- Revisar errores en Supabase Dashboard

## Troubleshooting

### Error: "Invalid API key"
- Verificar que las variables de entorno estén correctas
- Verificar que usen el prefijo `NEXT_PUBLIC_` las que deben ser públicas

### Error: "RLS policy violation"
- El usuario no tiene permisos
- Revisar las policies en Supabase

### Error: "Build failed"
- Revisar logs de build en Vercel
- Ejecutar `npm run build` localmente para reproducir

### Error: "500 en API Routes"
- Ver logs del servidor en Vercel
- Verificar variables de entorno del servidor
