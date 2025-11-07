# 🚀 Configuración Vercel - Paso a Paso

**Objetivo:** Asegurar que la app funcione correctamente en Vercel antes de conectar Cloudflare

---

## ✅ ESTADO ACTUAL

### Deployment
- **Estado:** ✅ READY (funcionando)
- **URL:** red-salud-kf7dec486-firf1818-8965s-projects.vercel.app
- **Último commit:** "docs: agregar arquitectura hibrida y diagnostico DNS"
- **Región:** iad1 (US East)

### Dominios Configurados
- ✅ red-salud.org
- ✅ www.red-salud.org
- ✅ red-salud.vercel.app
- ✅ red-salud-firf1818-8965s-projects.vercel.app

### ⚠️ Protección Activa
Tu deployment tiene **Vercel Authentication** activada. Esto significa que requiere login para acceder.

---

## 📋 PASO 1: Verificar Protección de Deployment

### 1.1 Revisar Configuración de Protección

1. Ve a: https://vercel.com/dashboard
2. Abre tu proyecto **red-salud**
3. Ve a **Settings** → **Deployment Protection**
4. Verifica qué está activado:

**Opciones disponibles:**

#### A. Vercel Authentication (Actual)
- ✅ Actualmente ACTIVO
- Requiere login con tu cuenta Vercel
- **Para desarrollo/staging**

#### B. Password Protection
- Protege con contraseña
- **Para desarrollo/staging**

#### C. Trusted IPs
- Solo permite IPs específicas
- **Para desarrollo/staging**

#### D. Standard Protection (Recomendado para Producción)
- Sin protección adicional
- Acceso público
- **Para producción**

### 1.2 Decisión: ¿Qué tipo de protección necesitas?

**Para PRODUCCIÓN (sitio público):**
```
Settings → Deployment Protection
┌─────────────────────────────────────┐
│ Protection Method                   │
│ ○ Vercel Authentication             │
│ ○ Password Protection               │
│ ○ Trusted IPs                       │
│ ● Standard Protection (None)        │
└─────────────────────────────────────┘
```

**Para DESARROLLO/STAGING:**
- Mantén Vercel Authentication o Password Protection

---

## 📋 PASO 2: Desactivar Protección (Si es para Producción)

### 2.1 Cambiar a Standard Protection

1. En **Settings** → **Deployment Protection**
2. Selecciona **"Standard Protection"** o **"None"**
3. Click en **"Save"**
4. Espera 1-2 minutos

### 2.2 Verificar que Funcione

Abre en tu navegador:
```
https://red-salud.vercel.app
```

**Debe:**
- ✅ Cargar directamente (sin pedir login)
- ✅ Mostrar tu aplicación
- ✅ No mostrar "Authentication Required"

---

## 📋 PASO 3: Verificar Variables de Entorno

### 3.1 Revisar Variables Necesarias

1. Ve a **Settings** → **Environment Variables**
2. Verifica que tengas:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3.2 Si Faltan Variables

1. Click en **"Add New"**
2. Agrega cada variable:
   - **Key:** NEXT_PUBLIC_SUPABASE_URL
   - **Value:** (tu URL de Supabase)
   - **Environments:** Production, Preview, Development
3. Click **"Save"**

### 3.3 Redeploy Después de Agregar Variables

1. Ve a **Deployments**
2. Click en el último deployment
3. Click en **"⋯"** (tres puntos)
4. Click en **"Redeploy"**
5. Espera que termine (2-3 minutos)

---

## 📋 PASO 4: Verificar que la App Funcione

### 4.1 Test en Vercel URL

Abre: `https://red-salud.vercel.app`

**Checklist:**
- [ ] Carga sin errores
- [ ] No pide autenticación
- [ ] Estilos se ven correctamente
- [ ] Imágenes cargan
- [ ] Links funcionan
- [ ] Formularios funcionan (si los hay)

### 4.2 Revisar Console del Navegador

1. Abre DevTools (F12)
2. Ve a **Console**
3. Busca errores (texto rojo)

**Errores comunes:**
- ❌ "Failed to load resource" → Verifica rutas de archivos
- ❌ "CORS error" → Verifica configuración de Supabase
- ❌ "Invalid API key" → Verifica variables de entorno

### 4.3 Revisar Network

1. En DevTools, ve a **Network**
2. Recarga la página (Ctrl+R)
3. Verifica que todos los recursos carguen (status 200)

---

## 📋 PASO 5: Verificar Build Logs (Si hay errores)

### 5.1 Ver Logs del Último Build

1. Ve a **Deployments**
2. Click en el último deployment
3. Ve a **"Building"** tab
4. Revisa los logs

**Busca:**
- ✅ "Build Completed" → Todo bien
- ❌ "Error:" → Hay problemas

### 5.2 Errores Comunes en Build

#### Error: "Module not found"
**Solución:**
```bash
npm install [paquete-faltante]
git add .
git commit -m "fix: agregar dependencia faltante"
git push
```

#### Error: "Type error"
**Solución:** Revisa errores de TypeScript en tu código

#### Error: "Environment variable not found"
**Solución:** Agrega la variable en Settings → Environment Variables

---

## 📋 PASO 6: Configurar Dominios Personalizados

### 6.1 Verificar Estado de Dominios

1. Ve a **Settings** → **Domains**
2. Verifica el estado de cada dominio:

```
red-salud.org
Status: ⚠️ Invalid Configuration (esperado, Cloudflare no configurado)

www.red-salud.org
Status: ⚠️ Invalid Configuration (esperado, Cloudflare no configurado)

red-salud.vercel.app
Status: ✅ Valid Configuration
```

**Esto es NORMAL** - Los dominios custom mostrarán "Invalid" hasta que configuremos Cloudflare.

### 6.2 Si los Dominios NO Están Agregados

1. Click en **"Add"**
2. Escribe: `red-salud.org`
3. Click **"Add"**
4. Repite para `www.red-salud.org`

---

## 📋 PASO 7: Verificar Configuración de Framework

### 7.1 Revisar Framework Detection

1. Ve a **Settings** → **General**
2. Busca **"Framework Preset"**
3. Debe decir: **"Next.js"**

### 7.2 Verificar Build Settings

```
Build Command: npm run build (o next build)
Output Directory: .next
Install Command: npm install
```

**Si está incorrecto:**
1. Click en **"Edit"**
2. Corrige los valores
3. Click **"Save"**
4. Redeploy

---

## 📋 PASO 8: Test Final en Vercel

### 8.1 Checklist Completo

Antes de conectar Cloudflare, verifica:

- [ ] Deployment en estado READY
- [ ] Protección desactivada (si es producción)
- [ ] Variables de entorno configuradas
- [ ] App carga en red-salud.vercel.app
- [ ] Sin errores en console
- [ ] Todos los recursos cargan (Network tab)
- [ ] Build logs sin errores
- [ ] Framework detectado correctamente

### 8.2 URLs para Probar

Prueba estas URLs en tu navegador:

1. `https://red-salud.vercel.app` → Debe funcionar ✅
2. `https://red-salud-firf1818-8965s-projects.vercel.app` → Debe funcionar ✅
3. `https://red-salud.org` → Puede dar error (normal, Cloudflare no configurado)

---

## 🎯 Resultado Esperado

Al terminar este paso, debes tener:

✅ App funcionando perfectamente en `red-salud.vercel.app`  
✅ Sin errores en console  
✅ Todos los recursos cargando correctamente  
✅ Variables de entorno configuradas  
✅ Build exitoso  

---

## ⚠️ Problemas Comunes

### Problema: "Authentication Required"
**Causa:** Deployment Protection activa  
**Solución:** Paso 2 - Desactivar protección

### Problema: Página en blanco
**Causa:** Error en el código o variables faltantes  
**Solución:** Revisa console y build logs

### Problema: Estilos no cargan
**Causa:** Rutas incorrectas o build incompleto  
**Solución:** Redeploy y verifica rutas

### Problema: "500 Internal Server Error"
**Causa:** Error en el servidor o variables faltantes  
**Solución:** Revisa Function Logs en Vercel

---

## 📞 Siguiente Paso

Una vez que **red-salud.vercel.app** funcione perfectamente:

➡️ **Continuar con:** Configuración de Cloudflare  
📄 **Archivo:** CONFIGURACION-CLOUDFLARE-PASO-A-PASO.md (lo crearemos después)

---

**¿Dónde estás ahora?**
- [ ] Paso 1: Revisar protección
- [ ] Paso 2: Desactivar protección (si aplica)
- [ ] Paso 3: Verificar variables
- [ ] Paso 4: Verificar que funcione
- [ ] Paso 5: Revisar logs
- [ ] Paso 6: Verificar dominios
- [ ] Paso 7: Verificar framework
- [ ] Paso 8: Test final

**Dime en qué paso estás y te ayudo específicamente.**
