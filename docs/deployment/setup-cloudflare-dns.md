# 🌐 Configuración de DNS en Cloudflare para red-salud.org

## ⚠️ IMPORTANTE: Solución al Error 404

El error 404 que estás viendo es porque **el dominio en Cloudflare no está apuntando correctamente a Vercel**.

---

## 🔍 Diagnóstico Actual

Tu dominio `red-salud.org` está comprado en Cloudflare, pero necesita configuración DNS para apuntar a Vercel.

---

## ✅ Solución Paso a Paso

### Paso 1: Acceder al Dashboard de Cloudflare

1. Ve a: https://dash.cloudflare.com/
2. Inicia sesión con tu cuenta
3. Selecciona el dominio `red-salud.org`

### Paso 2: Configurar Registros DNS

Ve a la sección **DNS** > **Records** y configura los siguientes registros:

#### Opción A: Usando Cloudflare como Proxy (RECOMENDADO)

```
┌──────────┬─────────┬──────────────────────────┬────────┬──────┐
│ Tipo     │ Nombre  │ Contenido                │ Proxy  │ TTL  │
├──────────┼─────────┼──────────────────────────┼────────┼──────┤
│ CNAME    │ @       │ cname.vercel-dns.com     │ ☁️ ON  │ Auto │
│ CNAME    │ www     │ cname.vercel-dns.com     │ ☁️ ON  │ Auto │
└──────────┴─────────┴──────────────────────────┴────────┴──────┘
```

**Ventajas:**
- ✅ CDN de Cloudflare activado
- ✅ DDoS protection
- ✅ SSL automático
- ✅ Caché optimizado

#### Opción B: DNS Only (Sin Proxy)

```
┌──────────┬─────────┬──────────────────────────┬────────┬──────┐
│ Tipo     │ Nombre  │ Contenido                │ Proxy  │ TTL  │
├──────────┼─────────┼──────────────────────────┼────────┼──────┤
│ CNAME    │ @       │ cname.vercel-dns.com     │ 🌐 OFF │ Auto │
│ CNAME    │ www     │ cname.vercel-dns.com     │ 🌐 OFF │ Auto │
└──────────┴─────────┴──────────────────────────┴────────┴──────┘
```

**Usar solo si:**
- Tienes problemas con el proxy
- Necesitas debugging

---

## 📋 Instrucciones Detalladas

### 1. Eliminar Registros Existentes (si los hay)

Si ya tienes registros A, AAAA o CNAME para `@` o `www`, **elimínalos primero**.

### 2. Agregar Registro para el Dominio Raíz (@)

1. Click en **Add record**
2. Selecciona **Type**: `CNAME`
3. **Name**: `@` (representa red-salud.org)
4. **Target**: `cname.vercel-dns.com`
5. **Proxy status**: ☁️ Proxied (naranja) - ACTIVADO
6. **TTL**: Auto
7. Click **Save**

### 3. Agregar Registro para WWW

1. Click en **Add record**
2. Selecciona **Type**: `CNAME`
3. **Name**: `www`
4. **Target**: `cname.vercel-dns.com`
5. **Proxy status**: ☁️ Proxied (naranja) - ACTIVADO
6. **TTL**: Auto
7. Click **Save**

### 4. Verificar en Vercel

Ahora ve a Vercel y agrega el dominio:

```bash
# Opción 1: Desde CLI
vercel domains add red-salud.org
vercel domains add www.red-salud.org

# Opción 2: Desde Dashboard
# 1. Ve a tu proyecto en Vercel
# 2. Settings > Domains
# 3. Agrega: red-salud.org
# 4. Agrega: www.red-salud.org
```

---

## ⏱️ Tiempo de Propagación

- **Cloudflare a Vercel**: 5-10 minutos
- **Propagación global**: Hasta 24 horas (usualmente 1-2 horas)

---

## 🔍 Verificar Configuración

### Desde la Terminal

```bash
# Windows (PowerShell)
nslookup red-salud.org 1.1.1.1
nslookup www.red-salud.org 1.1.1.1

# Debería mostrar IPs de Cloudflare (si proxy está activado)
# O CNAME a Vercel (si proxy está desactivado)
```

### Desde Herramientas Online

1. Ve a: https://www.whatsmydns.net/
2. Busca: `red-salud.org`
3. Tipo: `CNAME`
4. Verifica que apunte a `cname.vercel-dns.com` o IPs de Cloudflare

---

## 🛠️ Configuración SSL/TLS en Cloudflare

### Paso 1: Configurar Modo SSL

1. En Cloudflare Dashboard, ve a **SSL/TLS** > **Overview**
2. Selecciona: **Full (strict)**
3. Esto asegura conexión encriptada entre Cloudflare y Vercel

### Paso 2: Habilitar HTTPS Automático

1. Ve a **SSL/TLS** > **Edge Certificates**
2. Activa:
   - ✅ **Always Use HTTPS**
   - ✅ **Automatic HTTPS Rewrites**
   - ✅ **Minimum TLS Version**: 1.2

---

## 🚀 Optimizaciones Adicionales

### 1. Page Rules para Caché

Ve a **Rules** > **Page Rules** y crea:

#### Regla 1: Assets Estáticos
```
URL: red-salud.org/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 year
  - Browser Cache TTL: 1 year
```

#### Regla 2: API Routes
```
URL: red-salud.org/api/*
Settings:
  - Cache Level: Bypass
```

### 2. Speed Optimizations

Ve a **Speed** > **Optimization**:
- ✅ Auto Minify: HTML, CSS, JavaScript
- ✅ Brotli
- ✅ Early Hints

---

## 🔧 Solución de Problemas Comunes

### Error: "This domain is not registered with Vercel"

**Solución:**
1. Ve a Vercel Dashboard
2. Settings > Domains
3. Agrega manualmente: `red-salud.org` y `www.red-salud.org`

### Error 525: SSL Handshake Failed

**Solución:**
1. En Cloudflare: SSL/TLS > Overview
2. Cambia a **Full (strict)**
3. Espera 5 minutos

### Error 522: Connection Timed Out

**Solución:**
1. Verifica que Vercel esté funcionando
2. Temporalmente desactiva el proxy (🌐 DNS only)
3. Prueba si funciona
4. Reactiva el proxy

### Dominio muestra "404: NOT_FOUND"

**Causas posibles:**
1. DNS no propagado (espera 10-30 minutos)
2. Dominio no agregado en Vercel
3. Vercel no tiene deployment activo

**Solución:**
```bash
# 1. Verificar deployment en Vercel
vercel ls

# 2. Hacer nuevo deployment
vercel --prod

# 3. Verificar dominios
vercel domains ls
```

---

## 📊 Estado Esperado

Después de la configuración correcta:

```
✅ red-salud.org → Cloudflare CDN → Vercel → Tu App
✅ www.red-salud.org → Cloudflare CDN → Vercel → Tu App
✅ SSL/TLS: Activo (candado verde en navegador)
✅ Caché: Funcionando
✅ DDoS Protection: Activo
```

---

## 🎯 Checklist de Verificación

- [ ] Registros DNS creados en Cloudflare
- [ ] Proxy activado (☁️ naranja)
- [ ] SSL/TLS en modo Full (strict)
- [ ] Dominios agregados en Vercel
- [ ] Deployment activo en Vercel
- [ ] Esperado 10-30 minutos para propagación
- [ ] Verificado con nslookup o whatsmydns.net
- [ ] Sitio accesible en navegador
- [ ] SSL funcionando (candado verde)

---

## 🆘 ¿Aún tienes el error 404?

Si después de seguir todos los pasos aún ves el error, verifica:

1. **En Cloudflare:**
   - Ve a DNS > Records
   - Captura de pantalla de tus registros
   - Verifica que apunten a `cname.vercel-dns.com`

2. **En Vercel:**
   - Ve a Settings > Domains
   - Verifica que `red-salud.org` esté listado
   - Verifica que el estado sea "Valid"

3. **Deployment:**
   - Ve a Deployments
   - Verifica que haya un deployment en "Production"
   - Verifica que el estado sea "Ready"

---

## 📞 Próximos Pasos

Una vez que el dominio funcione:

1. ✅ Configurar Page Rules para optimización
2. ✅ Configurar Analytics en Cloudflare
3. ✅ Configurar Workers (opcional)
4. ✅ Configurar R2 Storage (opcional)

---

**Tiempo estimado total:** 30-60 minutos (incluyendo propagación DNS)
