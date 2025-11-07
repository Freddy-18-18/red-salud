# 🔧 Guía: Reconfigurar Variables de Entorno en Vercel

**Objetivo:** Limpiar y reconfigurar las variables de entorno desde la CLI

---

## 📊 Estado Actual

### Variables Existentes en Vercel:
```
✅ NEXT_PUBLIC_SUPABASE_URL (Production)
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY (Production)
✅ SUPABASE_SERVICE_ROLE_KEY (Production)
```

### Variables en .env.local:
```
✅ NEXT_PUBLIC_SUPABASE_URL=https://hwckkfiirldgundbcjsp.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (presente)
⚠️  SUPABASE_SERVICE_ROLE_KEY= (vacío)
```

---

## 🎯 Plan de Acción

Vamos a:
1. Eliminar variables actuales de Vercel
2. Agregar variables correctas desde CLI
3. Redeploy para aplicar cambios
4. Verificar que funcione

---

## 📋 PASO 1: Eliminar Variables Actuales

### 1.1 Eliminar NEXT_PUBLIC_SUPABASE_URL

```powershell
vercel env rm NEXT_PUBLIC_SUPABASE_URL production
```

Cuando pregunte, confirma con: `y`

### 1.2 Eliminar NEXT_PUBLIC_SUPABASE_ANON_KEY

```powershell
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

Confirma con: `y`

### 1.3 Eliminar SUPABASE_SERVICE_ROLE_KEY (si existe)

```powershell
vercel env rm SUPABASE_SERVICE_ROLE_KEY production
```

Confirma con: `y`

### 1.4 Verificar que se eliminaron

```powershell
vercel env ls
```

Debe mostrar la lista vacía o sin esas variables.

---

## 📋 PASO 2: Agregar Variables Correctas

### 2.1 Agregar NEXT_PUBLIC_SUPABASE_URL

```powershell
vercel env add NEXT_PUBLIC_SUPABASE_URL production
```

**Cuando pregunte:**
1. `What's the value of NEXT_PUBLIC_SUPABASE_URL?`
   - Pega: `https://hwckkfiirldgundbcjsp.supabase.co`
   - Presiona Enter

2. `Add NEXT_PUBLIC_SUPABASE_URL to which Environments?`
   - Selecciona: `Production` (debe estar seleccionado)
   - Presiona Enter

### 2.2 Agregar NEXT_PUBLIC_SUPABASE_ANON_KEY

```powershell
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

**Cuando pregunte:**
1. `What's the value of NEXT_PUBLIC_SUPABASE_ANON_KEY?`
   - Pega: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2trZmlpcmxkZ3VuZGJjanNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDA4MjcsImV4cCI6MjA3Nzc3NjgyN30.6Gh2U3mx7NsePvQEYMGnh23DqhJV43QRlPvYRynO8fY`
   - Presiona Enter

2. `Add NEXT_PUBLIC_SUPABASE_ANON_KEY to which Environments?`
   - Selecciona: `Production`
   - Presiona Enter

### 2.3 Verificar Variables Agregadas

```powershell
vercel env ls
```

Debe mostrar:
```
✅ NEXT_PUBLIC_SUPABASE_URL (Production)
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY (Production)
```

---

## 📋 PASO 3: Redeploy para Aplicar Cambios

### 3.1 Hacer Redeploy a Producción

```powershell
vercel --prod
```

**Esto hará:**
1. Build del proyecto
2. Deploy a producción
3. Aplicar las nuevas variables de entorno

**Tiempo estimado:** 2-3 minutos

### 3.2 Esperar a que Termine

Verás algo como:
```
✓ Build Completed
✓ Deployment Ready
🔗 https://red-salud.vercel.app
```

---

## 📋 PASO 4: Verificar que Funcione

### 4.1 Abrir en Navegador

```
https://red-salud.vercel.app
```

**Debe:**
- ✅ Cargar sin errores
- ✅ No pedir autenticación
- ✅ Mostrar tu aplicación correctamente

### 4.2 Verificar Console (F12)

1. Abre DevTools (F12)
2. Ve a **Console**
3. No debe haber errores relacionados con Supabase

### 4.3 Verificar Network

1. En DevTools, ve a **Network**
2. Recarga la página
3. Busca requests a Supabase
4. Deben tener status 200

---

## 📋 PASO 5: Desactivar Protección de Deployment

### 5.1 Ir a Settings

1. Ve a: https://vercel.com/dashboard
2. Abre proyecto **red-salud**
3. Ve a **Settings** → **Deployment Protection**

### 5.2 Cambiar a Standard Protection

```
Protection Method
○ Vercel Authentication
○ Password Protection
○ Trusted IPs
● Standard Protection (None)  ← Selecciona esta
```

Click en **"Save"**

### 5.3 Verificar Acceso Público

Abre en una ventana de incógnito:
```
https://red-salud.vercel.app
```

Debe cargar **sin pedir login**.

---

## ✅ Checklist Final

Marca cada paso cuando lo completes:

- [ ] Variables antiguas eliminadas
- [ ] NEXT_PUBLIC_SUPABASE_URL agregada
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY agregada
- [ ] Variables verificadas con `vercel env ls`
- [ ] Redeploy completado
- [ ] App carga en red-salud.vercel.app
- [ ] Sin errores en console
- [ ] Protección de deployment desactivada
- [ ] Acceso público funciona (ventana incógnito)

---

## 🆘 Troubleshooting

### Error: "Invalid Supabase URL"
**Solución:** Verifica que la URL no tenga espacios o caracteres extra

### Error: "Failed to fetch"
**Solución:** Verifica que las variables estén en Production environment

### Error: Sigue pidiendo autenticación
**Solución:** Desactiva Deployment Protection en Settings

### Error: Build falla
**Solución:** Revisa los logs del build en Vercel dashboard

---

## 📊 Comandos Rápidos de Referencia

```powershell
# Ver variables
vercel env ls

# Eliminar variable
vercel env rm NOMBRE_VARIABLE production

# Agregar variable
vercel env add NOMBRE_VARIABLE production

# Redeploy
vercel --prod

# Ver logs
vercel logs
```

---

## 🚀 Siguiente Paso

Una vez que **red-salud.vercel.app** funcione perfectamente:

➡️ **Continuar con:** Configuración de Cloudflare  
📄 **Archivo:** CONFIGURACION-CLOUDFLARE-FINAL.md (lo crearemos después)

---

**¿Listo para empezar?**

Ejecuta el primer comando:
```powershell
vercel env rm NEXT_PUBLIC_SUPABASE_URL production
```

Y dime cómo va. 👍
