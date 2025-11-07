# 🧹 Guía: Limpiar y Reconfigurar Cloudflare + Vercel

**Situación:** Tenías Vercel con la app de Cloudflare, eliminaste el proyecto, pero quedó la configuración vieja.

**Objetivo:** Limpiar todo y configurar correctamente para el nuevo proyecto.

---

## 📋 PASO 1: Limpiar Configuración Vieja de Cloudflare

### 1.1 ~~Eliminar la App de Vercel~~ (OMITIR - No aparece)

✅ **Si no encuentras la app de Vercel en Cloudflare, está bien!** Significa que no estaba instalada formalmente o ya fue eliminada. Continúa con el siguiente paso.

### 1.2 Revisar y Limpiar Registros DNS

1. Ve a tu zona: https://dash.cloudflare.com → `red-salud.org`
2. Ve a **DNS** → **Records**
3. **ELIMINA** estos registros si existen (son de la configuración vieja):
   - Cualquier registro `CNAME` que apunte a dominios viejos de Vercel
   - Registros `TXT` de verificación de Vercel viejos
   - Registros `A` o `AAAA` que no uses

### 1.3 Desactivar Configuraciones de Seguridad Viejas

#### Bot Fight Mode
1. Ve a **Security** → **Bots**
2. **Desactiva** "Bot Fight Mode"
3. **Desactiva** "Super Bot Fight Mode" (si está activo)

#### Security Level
1. Ve a **Security** → **Settings**
2. Cambia **Security Level** a **"Medium"**
3. Asegúrate de que **"I'm Under Attack Mode"** esté **OFF**

#### Firewall Rules
1. Ve a **Security** → **WAF**
2. Revisa **Firewall Rules**
3. **ELIMINA** cualquier regla que bloquee tráfico general
4. Si hay reglas específicas de Vercel viejo, elimínalas

### 1.4 Limpiar Page Rules Viejas

1. Ve a **Rules** → **Page Rules**
2. **ELIMINA** cualquier regla relacionada con Vercel viejo
3. Deja solo las reglas que necesites (si las hay)

---

## 📋 PASO 2: Configurar DNS Correctamente para Vercel

### 2.1 Registros DNS Necesarios

Necesitas crear/verificar estos registros:

#### Para `red-salud.org` (dominio raíz)

**Opción A: CNAME (Recomendado)**
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy: ON (nube naranja)
TTL: Auto
```

**Opción B: A Records (Alternativa)**
```
Type: A
Name: @
IPv4: 76.76.21.21
Proxy: ON (nube naranja)
TTL: Auto
```

#### Para `www.red-salud.org`

```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy: ON (nube naranja)
TTL: Auto
```

### 2.2 Pasos para Crear los Registros

1. Ve a **DNS** → **Records**
2. Haz clic en **"Add record"**
3. Selecciona el tipo (CNAME o A)
4. Completa los campos según la tabla arriba
5. **IMPORTANTE:** Activa el proxy (nube naranja) ☁️
6. Haz clic en **"Save"**
7. Repite para cada registro

---

## 📋 PASO 3: Configurar SSL/TLS Correctamente

### 3.1 Modo de Encriptación

1. Ve a **SSL/TLS** → **Overview**
2. Selecciona **"Full (strict)"**
   - ✅ Esto es lo correcto para Vercel
   - ❌ NO uses "Flexible" (causará problemas)

### 3.2 Configuraciones Adicionales

1. Ve a **SSL/TLS** → **Edge Certificates**
2. Activa:
   - ✅ **Always Use HTTPS**
   - ✅ **Automatic HTTPS Rewrites**
   - ✅ **Minimum TLS Version:** 1.2

---

## 📋 PASO 4: Configurar Vercel

### 4.1 Agregar Dominios en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Ve a **Settings** → **Domains**
3. Agrega estos dominios:
   - `red-salud.org`
   - `www.red-salud.org`

### 4.2 Verificar Estado

Después de agregar, Vercel mostrará:
- ⏳ "Pending" o "Configuring" (espera unos minutos)
- ✅ "Valid Configuration" (listo!)
- ❌ Si hay error, sigue las instrucciones de Vercel

---

## 📋 PASO 5: Configuración Óptima de Cloudflare

### 5.1 Speed Settings

1. Ve a **Speed** → **Optimization**
2. Activa:
   - ✅ **Auto Minify:** JS, CSS, HTML
   - ✅ **Brotli**
   - ✅ **Early Hints**
   - ✅ **HTTP/2**
   - ✅ **HTTP/3 (with QUIC)**

### 5.2 Caching Settings

1. Ve a **Caching** → **Configuration**
2. Configura:
   - **Caching Level:** Standard
   - **Browser Cache TTL:** Respect Existing Headers
   - ✅ **Always Online**

### 5.3 Network Settings

1. Ve a **Network**
2. Activa:
   - ✅ **WebSockets**
   - ✅ **IPv6 Compatibility**
   - ✅ **gRPC** (si lo necesitas)

---

## 📋 PASO 6: Verificación Final

### 6.1 Test de DNS

```powershell
# Verifica que apunte a Cloudflare
nslookup red-salud.org

# Debe mostrar IPs de Cloudflare (104.x.x.x o 172.x.x.x)
```

### 6.2 Test de Acceso

```powershell
# Debe devolver 200 OK (no 403)
curl -I https://red-salud.org
```

**Busca:**
- ✅ `HTTP/1.1 200 OK` o `HTTP/2 200`
- ✅ `server: cloudflare`
- ✅ `cf-ray: [ID]`
- ❌ NO debe tener `cf-mitigated: challenge`

### 6.3 Test en Navegador

1. Abre https://red-salud.org
2. Debe cargar directamente (sin "Just a moment...")
3. Verifica el candado SSL (verde)
4. Abre las DevTools → Network
5. Verifica headers:
   - Debe tener `cf-ray`
   - Debe tener `server: cloudflare`

### 6.4 Test de Vercel

1. Ve a Vercel Dashboard → tu proyecto
2. Ve a **Domains**
3. Ambos dominios deben mostrar ✅ "Valid Configuration"

---

## 🎯 Configuración Final Recomendada

### Cloudflare Settings Summary

```yaml
Security:
  Security Level: Medium
  Bot Fight Mode: OFF
  Challenge Passage: 30 minutes
  Browser Integrity Check: ON

SSL/TLS:
  Mode: Full (strict)
  Always Use HTTPS: ON
  Automatic HTTPS Rewrites: ON
  Minimum TLS Version: 1.2

Speed:
  Auto Minify: JS, CSS, HTML
  Brotli: ON
  Early Hints: ON
  HTTP/2: ON
  HTTP/3: ON

Caching:
  Level: Standard
  Browser Cache TTL: Respect Existing Headers
  Always Online: ON

Network:
  WebSockets: ON
  IPv6: ON
```

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Too many redirects"
**Causa:** SSL en "Flexible"  
**Solución:** Cambia a "Full (strict)"

### Error: "403 Forbidden"
**Causa:** Bot Fight Mode o Security Level muy alto  
**Solución:** Desactiva Bot Fight Mode, baja Security Level

### Error: "DNS_PROBE_FINISHED_NXDOMAIN"
**Causa:** DNS no configurado correctamente  
**Solución:** Verifica registros DNS, espera propagación (5-10 min)

### Error: "Invalid Configuration" en Vercel
**Causa:** DNS no apunta a Vercel  
**Solución:** Verifica que los registros apunten a `cname.vercel-dns.com`

### Error: Sitio carga pero sin estilos
**Causa:** CORS o CSP bloqueando recursos  
**Solución:** Verifica headers, desactiva reglas de firewall

---

## 📞 Checklist Final

Antes de dar por terminado, verifica:

- [ ] App de Vercel eliminada de Cloudflare
- [ ] Registros DNS viejos eliminados
- [ ] Nuevos registros DNS creados (@ y www)
- [ ] Proxy activado (nube naranja) en DNS
- [ ] Bot Fight Mode desactivado
- [ ] Security Level en Medium
- [ ] SSL/TLS en Full (strict)
- [ ] Always Use HTTPS activado
- [ ] Dominios agregados en Vercel
- [ ] Vercel muestra "Valid Configuration"
- [ ] Sitio carga correctamente en navegador
- [ ] Sin errores 403 o redirects infinitos
- [ ] SSL funciona (candado verde)
- [ ] Headers de Cloudflare presentes

---

## 🚀 Próximos Pasos (Opcional)

Una vez todo funcione:

1. **Configurar Analytics:**
   - Cloudflare Web Analytics
   - Vercel Analytics

2. **Optimizaciones:**
   - Configurar Page Rules para cache
   - Activar Argo Smart Routing (si tienes plan Pro)
   - Configurar Workers para funcionalidad custom

3. **Monitoreo:**
   - Configurar alertas en Cloudflare
   - Configurar Uptime Monitoring

4. **SEO:**
   - Verificar sitemap.xml
   - Configurar redirects 301 si es necesario
   - Verificar robots.txt

---

**Tiempo estimado:** 10-15 minutos  
**Dificultad:** Fácil  
**Resultado:** Sitio funcionando correctamente en producción

