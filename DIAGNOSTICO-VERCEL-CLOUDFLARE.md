# 🔍 Diagnóstico Vercel + Cloudflare - Red-Salud

**Fecha:** 7 de Noviembre, 2025  
**Dominio:** red-salud.org  
**Estado:** ⚠️ REQUIERE CONFIGURACIÓN

---

## ✅ Estado de Conexión

### Vercel
- **Proyecto:** red-salud
- **ID:** prj_iieZ7FMCmLGCWk9LvRCtntgv48M7
- **Team:** firf1818-8965's projects
- **Último Deploy:** READY (Production)
- **URL Deploy:** red-salud-kf7dec486-firf1818-8965s-projects.vercel.app

### Dominios Configurados en Vercel
✅ red-salud.org  
✅ www.red-salud.org  
✅ red-salud.vercel.app  
✅ red-salud-firf1818-8965s-projects.vercel.app  
✅ red-salud-firf1818-8965-firf1818-8965s-projects.vercel.app

### Cloudflare
- **Zona:** red-salud.org
- **ID:** 967df5167bf564fbb87b1ab0d649c19f
- **Estado:** Active
- **Plan:** Free Website
- **Name Servers:** 
  - stevie.ns.cloudflare.com
  - zahir.ns.cloudflare.com

---

## ✅ DNS Configuración

### Resolución DNS
```
red-salud.org
├── IPv4: 104.21.44.105, 172.67.198.186
└── IPv6: 2606:4700:3031::6815:2c69, 2606:4700:3035::ac43:c6ba

www.red-salud.org
├── IPv4: 172.67.198.186, 104.21.44.105
└── IPv6: 2606:4700:3031::6815:2c69, 2606:4700:3035::ac43:c6ba
```

**✅ DNS apunta correctamente a Cloudflare**

---

## ⚠️ PROBLEMA CRÍTICO: Cloudflare Challenge Activo

### Estado Actual
```
HTTP/1.1 403 Forbidden
cf-mitigated: challenge
Server: cloudflare
CF-RAY: 99aeda5df8317b37-MIA
```

### Descripción del Problema
Cloudflare está bloqueando el acceso al sitio con un **JavaScript Challenge** ("Just a moment..."). Esto significa que:

1. ❌ El sitio NO es accesible públicamente
2. ❌ Los usuarios ven una página de verificación
3. ❌ Los bots y crawlers no pueden acceder
4. ❌ SEO está siendo afectado

### Causa
Cloudflare tiene activado uno de estos modos de seguridad:
- **Bot Fight Mode** (modo gratuito)
- **Security Level: High/Under Attack**
- **Firewall Rules** bloqueando tráfico

---

## 🔧 ACCIONES REQUERIDAS PARA PRODUCCIÓN

### 1. Desactivar Bot Fight Mode (CRÍTICO)


**Pasos:**
1. Ve a Cloudflare Dashboard: https://dash.cloudflare.com
2. Selecciona el dominio `red-salud.org`
3. Ve a **Security** → **Bots**
4. Desactiva **"Bot Fight Mode"**

### 2. Verificar Security Level

**Pasos:**
1. En Cloudflare Dashboard
2. Ve a **Security** → **Settings**
3. Cambia **Security Level** a **"Medium"** o **"Low"**
4. Asegúrate de que **"I'm Under Attack Mode"** esté DESACTIVADO

### 3. Configurar SSL/TLS Correctamente

**Pasos:**
1. Ve a **SSL/TLS** → **Overview**
2. Configura el modo de encriptación:
   - **Recomendado:** Full (strict)
   - **Alternativa:** Full

**⚠️ NO uses "Flexible"** - causará redirect loops con Vercel

### 4. Verificar Firewall Rules

**Pasos:**
1. Ve a **Security** → **WAF**
2. Revisa **Firewall Rules**
3. Asegúrate de que NO haya reglas bloqueando todo el tráfico
4. Si hay reglas, verifica que permitan tráfico legítimo

### 5. Configurar Page Rules (Opcional pero Recomendado)

**Pasos:**
1. Ve a **Rules** → **Page Rules**
2. Crea una regla para `red-salud.org/*`:
   - **Cache Level:** Standard
   - **Browser Cache TTL:** Respect Existing Headers
   - **SSL:** Full (strict)

---

## 📊 Deployments Recientes

| Deploy | Estado | Fecha | Commit |
|--------|--------|-------|--------|
| dpl_N4Tp68U4gPR7UPYrfk3XBsKrWHYA | ✅ READY | Último | docs: agregar arquitectura hibrida |
| dpl_5bpXnG9R8CHV4Ke9awkCLfmJ47EH | ✅ READY | Anterior | fix: agregar página raíz |
| dpl_EeUn1rd5u2gbGzijZQaDSGFQALy8 | ✅ READY | Anterior | docs: guía variables entorno |
| dpl_4e7YS1Exx5Po2bSfaiHViFcXjaL4 | ❌ ERROR | Anterior | docs: guía variables entorno |

---

## ✅ Verificaciones Post-Configuración

Después de hacer los cambios, verifica:

### 1. Test de Acceso Directo
```powershell
curl -I https://red-salud.org
```
**Esperado:** `HTTP/1.1 200 OK` (no 403)

### 2. Test de Headers
```powershell
curl -I https://red-salud.org
```
**Busca:**
- ✅ `server: cloudflare`
- ✅ `cf-ray: [ID]`
- ✅ `x-vercel-id: [ID]` (si está presente)
- ❌ NO debe tener `cf-mitigated: challenge`

### 3. Test en Navegador
1. Abre https://red-salud.org
2. Debe cargar directamente (sin "Just a moment...")
3. Verifica el candado SSL (debe ser verde)

### 4. Test de Propagación DNS
```powershell
nslookup red-salud.org 8.8.8.8
nslookup red-salud.org 1.1.1.1
```
**Esperado:** Mismas IPs de Cloudflare

---

## 🎯 Configuración Óptima para Producción

### Cloudflare Settings Recomendados

#### Security
- **Security Level:** Medium
- **Bot Fight Mode:** OFF
- **Challenge Passage:** 30 minutes
- **Browser Integrity Check:** ON

#### SSL/TLS
- **Mode:** Full (strict)
- **Always Use HTTPS:** ON
- **Automatic HTTPS Rewrites:** ON
- **Minimum TLS Version:** 1.2

#### Speed
- **Auto Minify:** JS, CSS, HTML (ON)
- **Brotli:** ON
- **Early Hints:** ON
- **HTTP/2:** ON
- **HTTP/3 (QUIC):** ON

#### Caching
- **Caching Level:** Standard
- **Browser Cache TTL:** Respect Existing Headers
- **Always Online:** ON

#### Network
- **WebSockets:** ON
- **gRPC:** ON (si lo necesitas)
- **IPv6 Compatibility:** ON

---

## 🔐 Headers de Seguridad

Vercel ya incluye estos headers (verificado en la respuesta):
```
✅ cross-origin-embedder-policy: require-corp
✅ cross-origin-opener-policy: same-origin
✅ cross-origin-resource-policy: same-origin
✅ x-content-type-options: nosniff
✅ x-frame-options: SAMEORIGIN
✅ referrer-policy: same-origin
```

---

## 📈 Próximos Pasos

1. **INMEDIATO:** Desactivar Bot Fight Mode en Cloudflare
2. **INMEDIATO:** Verificar Security Level (debe estar en Medium o Low)
3. **INMEDIATO:** Configurar SSL/TLS en Full (strict)
4. Verificar que el sitio carga correctamente
5. Configurar Page Rules para optimización
6. Habilitar Auto Minify y Brotli
7. Configurar Analytics y Monitoring

---

## 🆘 Troubleshooting

### Si el sitio sigue sin cargar:

1. **Purge Cache de Cloudflare:**
   - Caching → Configuration → Purge Everything

2. **Verificar DNS:**
   - DNS → Records
   - Asegúrate de que los registros tengan la "nube naranja" (proxied)

3. **Verificar en Vercel:**
   - Domains → red-salud.org
   - Debe mostrar "Valid Configuration"

4. **Logs de Vercel:**
   - Ve a Deployments → [último deploy] → Logs
   - Busca errores

---

## 📞 Contacto y Soporte

- **Cloudflare Support:** https://dash.cloudflare.com/support
- **Vercel Support:** https://vercel.com/support
- **Documentación Cloudflare:** https://developers.cloudflare.com
- **Documentación Vercel:** https://vercel.com/docs

---

**Generado automáticamente por Kiro**  
**Última actualización:** 2025-11-07 18:21 UTC
