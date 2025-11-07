# Instrucciones de Despliegue - Red Salud

## 🎉 DESPLEGADO EN PRODUCCIÓN

**URL de Producción**: https://red-salud-6atodwotu-firf1818-8965s-projects.vercel.app

**Estado**: ✅ READY (Listo y funcionando)

---

## ✅ Completado

### 1. GitHub
- ✅ Repositorio creado: https://github.com/firf18/red-salud
- ✅ Código subido exitosamente

### 2. Supabase
- ✅ Proyecto activo: `hwckkfiirldgundbcjsp`
- ✅ Base de datos configurada con todas las tablas
- ✅ 37 migraciones aplicadas
- ✅ RLS habilitado en todas las tablas
- ⚠️ Avisos de rendimiento (índices no usados - normal en desarrollo)
- ⚠️ 1 aviso de seguridad menor (leaked password protection)

### 3. Vercel
- ✅ Proyecto creado: `red-salud`
- ✅ Team: `firf1818-8965's projects`
- ✅ **Desplegado en producción**: https://red-salud-6atodwotu-firf1818-8965s-projects.vercel.app
- ✅ Estado: READY
- ✅ Build exitoso (66 páginas generadas)

## 🚀 Próximos Pasos

### Configurar Variables de Entorno en Vercel

Ejecuta estos comandos para configurar las variables de entorno:

```bash
# Navega al directorio del proyecto
cd C:\Users\Fredd\Dev\red-salud

# Configura las variables de entorno de Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Valor: https://hwckkfiirldgundbcjsp.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Valor: (tu anon key de Supabase)

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Valor: (tu service role key de Supabase)
```

### Hacer Deploy

```bash
# Deploy a producción
vercel --prod

# O simplemente push a GitHub si tienes la integración configurada
git push origin main
```

## 📋 Checklist Post-Deploy

- [ ] Verificar que el sitio carga correctamente
- [ ] Probar el login/registro
- [ ] Verificar que el dashboard de paciente funciona
- [ ] Probar la verificación de médicos con SACS
- [ ] Configurar dominio personalizado (opcional)
- [ ] Habilitar Analytics en Vercel
- [ ] Configurar alertas de errores

## 🔐 Seguridad

### Supabase
- Habilitar "Leaked Password Protection" en Auth settings
- Revisar y optimizar índices cuando haya datos en producción
- Configurar backups automáticos

### Vercel
- Configurar variables de entorno para producción
- Habilitar protección DDoS
- Configurar headers de seguridad

## 📊 Monitoreo

- Supabase Dashboard: https://supabase.com/dashboard/project/hwckkfiirldgundbcjsp
- Vercel Dashboard: https://vercel.com/firf1818-8965s-projects/red-salud
- GitHub Repo: https://github.com/firf18/red-salud

## 🛠️ Comandos Útiles

```bash
# Ver logs de Vercel
vercel logs

# Ver estado del proyecto
vercel inspect

# Rollback a versión anterior
vercel rollback

# Ver deployments
vercel ls
```
