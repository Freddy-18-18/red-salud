# ⚡ Pasos Rápidos: Arreglar Cloudflare + Vercel

**Tiempo:** 10 minutos  
**Problema:** 403 Forbidden - Cloudflare bloqueando el sitio

---

## 🎯 PASO 1: Desactivar Bot Fight Mode (CRÍTICO)

1. Ve a: https://dash.cloudflare.com
2. Selecciona **red-salud.org**
3. En el menú izquierdo, ve a **Security** → **Bots**
4. Busca **"Bot Fight Mode"**
5. Si está activado (ON), **desactívalo** (OFF)
6. Guarda los cambios

**Captura de referencia:** Debe decir "Bot Fight Mode: OFF"

---

## 🎯 PASO 2: Bajar Security Level

1. Estando en **red-salud.org**
2. Ve a **Security** → **Settings**
3. Busca **"Security Level"**
4. Cámbialo a **"Medium"** (o "Low" si Medium no funciona)
5. Busca **"I'm Under Attack Mode"**
6. Asegúrate de que esté **OFF**
7. Guarda los cambios

---

## 🎯 PASO 3: Configurar SSL Correctamente

1. Ve a **SSL/TLS** → **Overview**
2. Selecciona **"Full (strict)"**
3. Guarda

**Importante:** NO uses "Flexible" - causará problemas con Vercel

---

## 🎯 PASO 4: Verificar DNS

1. Ve a **DNS** → **Records**
2. Busca estos registros:

### Debe existir:
```
Type: CNAME
Name: @ (o red-salud.org)
Target: cname.vercel-dns.com
Proxy: ☁️ ON (nube naranja)
```

```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy: ☁️ ON (nube naranja)
```

### Si NO existen, créalos:

**Para el dominio raíz (@):**
1. Click en **"Add record"**
2. Type: **CNAME**
3. Name: **@**
4. Target: **cname.vercel-dns.com**
5. Proxy status: **Proxied** (nube naranja ☁️)
6. Click **"Save"**

**Para www:**
1. Click en **"Add record"**
2. Type: **CNAME**
3. Name: **www**
4. Target: **cname.vercel-dns.com**
5. Proxy status: **Proxied** (nube naranja ☁️)
6. Click **"Save"**

---

## 🎯 PASO 5: Verificar en Vercel

1. Ve a: https://vercel.com/dashboard
2. Abre tu proyecto **red-salud**
3. Ve a **Settings** → **Domains**
4. Verifica que estén agregados:
   - red-salud.org
   - www.red-salud.org
5. Deben mostrar **"Valid Configuration"** ✅

### Si NO están agregados:
1. Click en **"Add"**
2. Escribe: **red-salud.org**
3. Click **"Add"**
4. Repite para **www.red-salud.org**

---

## ✅ PASO 6: Verificar que Funcione

### Opción A: Navegador
1. Abre https://red-salud.org
2. Debe cargar **directamente** (sin "Just a moment...")
3. Verifica el candado SSL (verde)

### Opción B: Script
```powershell
.\verificar-estado.ps1
```

Debe mostrar:
- ✅ Status: 200 OK
- ✅ CF-RAY presente
- ✅ SSL Válido

---

## ⏱️ Tiempo de Propagación

Después de hacer los cambios:
- **Cloudflare:** Inmediato (1-2 minutos)
- **DNS:** 5-10 minutos
- **Vercel:** 2-5 minutos

Si no funciona inmediatamente, espera 10 minutos y prueba de nuevo.

---

## 🆘 Si Sigue Sin Funcionar

### Error: "Too many redirects"
**Solución:** Cambia SSL a "Full (strict)" en Cloudflare

### Error: Sigue 403
**Solución:** 
1. Ve a **Security** → **WAF**
2. Revisa **Firewall Rules**
3. Elimina cualquier regla que bloquee tráfico

### Error: "Invalid Configuration" en Vercel
**Solución:**
1. Espera 10 minutos (propagación DNS)
2. En Vercel, elimina el dominio y agrégalo de nuevo

---

## 📸 Capturas de Referencia

### Bot Fight Mode OFF:
```
Security → Bots
┌─────────────────────────────┐
│ Bot Fight Mode         [OFF]│
└─────────────────────────────┘
```

### Security Level Medium:
```
Security → Settings
┌─────────────────────────────┐
│ Security Level    [Medium ▼]│
│ I'm Under Attack      [OFF] │
└─────────────────────────────┘
```

### SSL Full (strict):
```
SSL/TLS → Overview
┌─────────────────────────────┐
│ ○ Off                       │
│ ○ Flexible                  │
│ ○ Full                      │
│ ● Full (strict)             │
└─────────────────────────────┘
```

### DNS Records:
```
DNS → Records
┌──────┬──────┬─────────────────────┬───────┐
│ Type │ Name │ Target              │ Proxy │
├──────┼──────┼─────────────────────┼───────┤
│ CNAME│  @   │ cname.vercel-dns.com│  ☁️   │
│ CNAME│ www  │ cname.vercel-dns.com│  ☁️   │
└──────┴──────┴─────────────────────┴───────┘
```

---

## ✅ Checklist

Marca cada paso cuando lo completes:

- [ ] Bot Fight Mode desactivado
- [ ] Security Level en Medium
- [ ] I'm Under Attack Mode OFF
- [ ] SSL en Full (strict)
- [ ] DNS @ apunta a cname.vercel-dns.com
- [ ] DNS www apunta a cname.vercel-dns.com
- [ ] Proxy activado (nube naranja) en ambos
- [ ] Dominios agregados en Vercel
- [ ] Vercel muestra "Valid Configuration"
- [ ] Sitio carga en navegador sin errores
- [ ] Script de verificación muestra ✅

---

**¿Necesitas ayuda?** Dime en qué paso estás y te ayudo específicamente.
