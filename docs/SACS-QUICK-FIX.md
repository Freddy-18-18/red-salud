# 🚀 Instrucciones Rápidas - Resolver Error SACS

## El Problema
**Error**: "No se pudo conectar con el servicio de verificación"

## La Causa
✅ Servicio de Railway funcionando correctamente  
❌ Edge Function de Supabase no desplegada o sin configuración

## Solución en 3 Pasos

### 1️⃣ Instalar Supabase CLI

```powershell
# Con Scoop (recomendado)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# O con npm
npm install -g supabase
```

### 2️⃣ Autenticarse en Supabase

```powershell
supabase login
```

### 3️⃣ Ejecutar el Script

```powershell
cd c:\Users\Fredd\Developer\red-salud
.\scripts\deploy-sacs-edge-function.ps1
```

El script automáticamente:
- ✅ Verifica la instalación de Supabase CLI
- ✅ Configura la variable `SACS_BACKEND_URL`
- ✅ Despliega la edge function
- ✅ Verifica el deployment

## ¿Problemas?

Si el script falla o necesitas más información, consulta:
📄 [Guía completa de troubleshooting](./SACS-VERIFICACION-TROUBLESHOOTING.md)

## Verificar que Funciona

1. Ve a tu aplicación web
2. Intenta verificar un médico
3. ✅ El error debería estar resuelto

---

**Tiempo estimado**: 5 minutos  
**Dificultad**: Fácil ⭐
