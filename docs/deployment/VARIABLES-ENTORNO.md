# 🔐 Variables de Entorno - Red Salud

## ✅ RESUMEN DE VERIFICACIÓN

### GitHub ✅
- **Repositorio**: https://github.com/firf18/red-salud
- **Estado**: Código subido exitosamente
- **Último commit**: "docs: agregar README del proyecto"
- **Archivos**: package.json, README.md, y todo el código fuente

### Supabase ✅
- **Proyecto ID**: `hwckkfiirldgundbcjsp`
- **Estado**: ACTIVE_HEALTHY
- **Región**: us-east-1
- **Base de datos**: PostgreSQL 17.6.1
- **Migraciones**: 37 aplicadas correctamente
- **Tablas**: 48 tablas con RLS habilitado

### Vercel ✅
- **Proyecto**: red-salud
- **Team**: firf1818-8965's projects
- **Estado**: Proyecto creado, sin deployments aún
- **Estado**: Proyecto creado, sin deployments aún
- **Node Version**: 22.x

---

## 📋 VARIABLES DE ENTORNO PARA VERCEL

### Opción 1: Configurar desde la línea de comandos

Ejecuta estos comandos uno por uno en tu terminal:

```bash
# 1. Variable pública - URL de Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Cuando te pregunte el valor, pega:
https://hwckkfiirldgundbcjsp.supabase.co

# 2. Variable pública - Anon Key de Supabase
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Cuando te pregunte el valor, pega:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2trZmlpcmxkZ3VuZGJjanNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDA4MjcsImV4cCI6MjA3Nzc3NjgyN30.6Gh2U3mx7NsePvQEYMGnh23DqhJV43QRlPvYRynO8fY

# 3. Variable privada - Service Role Key (IMPORTANTE: Esta es sensible)
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Cuando te pregunte el valor, ve a:
# https://supabase.com/dashboard/project/hwckkfiirldgundbcjsp/settings/api
# Y copia el "service_role" key (secret)
```

### Opción 2: Configurar desde el Dashboard de Vercel

1. Ve a: https://vercel.com/firf1818-8965s-projects/red-salud/settings/environment-variables

2. Agrega estas 3 variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hwckkfiirldgundbcjsp.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2trZmlpcmxkZ3VuZGJjanNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDA4MjcsImV4cCI6MjA3Nzc3NjgyN30.6Gh2U3mx7NsePvQEYMGnh23DqhJV43QRlPvYRynO8fY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | **(Ve a Supabase Dashboard → Settings → API → service_role key)** | Production |

---

## 🚀 PASOS PARA HACER DEPLOY

### Paso 1: Configurar Variables de Entorno
Usa cualquiera de las opciones de arriba para configurar las variables.

### Paso 2: Hacer Deploy

```bash
# Opción A: Deploy directo desde CLI
vercel --prod

# Opción B: Conectar con GitHub (recomendado)
# 1. Ve a https://vercel.com/firf1818-8965s-projects/red-salud/settings/git
# 2. Conecta el repositorio: firf18/red-salud
# 3. Cada push a main hará deploy automático
```

### Paso 3: Verificar el Deploy

Después del deploy, verifica:

```bash
# Ver el URL del deploy
vercel ls

# Ver logs en tiempo real
vercel logs --follow

# Inspeccionar el deployment
vercel inspect
```

---

## 📝 ARCHIVO .env.local PARA DESARROLLO LOCAL

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hwckkfiirldgundbcjsp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2trZmlpcmxkZ3VuZGJjanNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDA4MjcsImV4cCI6MjA3Nzc3NjgyN30.6Gh2U3mx7NsePvQEYMGnh23DqhJV43QRlPvYRynO8fY

# Service Role Key (solo para desarrollo, NO subir a Git)
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

**⚠️ IMPORTANTE**: El archivo `.env.local` ya está en `.gitignore` y NO se subirá a GitHub.

---

## 🔗 LINKS IMPORTANTES

### Dashboards
- **Supabase**: https://supabase.com/dashboard/project/hwckkfiirldgundbcjsp
- **Vercel**: https://vercel.com/firf1818-8965s-projects/red-salud
- **GitHub**: https://github.com/firf18/red-salud

### Configuración
- **Supabase API Keys**: https://supabase.com/dashboard/project/hwckkfiirldgundbcjsp/settings/api
- **Vercel Env Vars**: https://vercel.com/firf1818-8965s-projects/red-salud/settings/environment-variables
- **Vercel Git Integration**: https://vercel.com/firf1818-8965s-projects/red-salud/settings/git

---

## ✅ CHECKLIST FINAL

- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy realizado exitosamente
- [ ] Sitio accesible en el URL de Vercel
- [ ] Login/Registro funcionando
- [ ] Dashboard de paciente cargando
- [ ] Conexión a Supabase verificada
- [ ] (Opcional) Dominio personalizado configurado
- [ ] (Opcional) Integración con GitHub configurada

---

## 🆘 TROUBLESHOOTING

### Error: "supabaseUrl is required"
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que los nombres sean exactos (case-sensitive)

### Error: "Invalid API key"
- Verifica que copiaste la anon key completa desde Supabase
- No debe tener espacios al inicio o final

### Error de build en Vercel
- Revisa los logs: `vercel logs`
- Verifica que todas las dependencias estén en package.json
- Asegúrate de que el build funciona localmente: `npm run build`

### No puedo hacer login
- Verifica que las variables de entorno estén en "Production"
- Revisa los logs de Supabase Auth
- Asegúrate de que el Site URL esté configurado en Supabase

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa los logs de Vercel: `vercel logs`
2. Revisa los logs de Supabase en el dashboard
3. Verifica que todas las variables estén configuradas
4. Asegúrate de que el proyecto compile localmente
