# 🏗️ Arquitectura Híbrida: Cloudflare + Vercel + Supabase

## 📋 Resumen Ejecutivo

Esta guía te muestra cómo aprovechar lo mejor de cada plataforma para crear una arquitectura robusta, escalable y de alto rendimiento.

---

## 🎯 División de Responsabilidades

### Cloudflare (DNS + CDN + Edge Functions + Workers)
**Ventajas sobre Vercel:**
- ✅ DNS management más potente y flexible
- ✅ CDN global con 300+ ubicaciones (vs 20+ de Vercel)
- ✅ Workers más económicos para alto tráfico
- ✅ R2 Storage (más barato que AWS S3)
- ✅ DDoS protection incluido
- ✅ Web Application Firewall (WAF)
- ✅ Rate limiting avanzado
- ✅ Image optimization con Cloudflare Images

**Usar para:**
- DNS del dominio red-salud.org
- Proxy y caché de assets estáticos
- Edge functions para lógica simple (redirects, A/B testing)
- Workers para APIs de alto tráfico
- R2 para almacenamiento de archivos grandes (imágenes médicas, documentos)
- Rate limiting y protección DDoS

### Vercel (Frontend + SSR + API Routes)
**Ventajas sobre Cloudflare:**
- ✅ Integración nativa con Next.js
- ✅ Preview deployments automáticos
- ✅ Edge Functions con acceso a Node.js APIs
- ✅ Incremental Static Regeneration (ISR)
- ✅ Analytics integrado
- ✅ CI/CD automático con GitHub

**Usar para:**
- Aplicación Next.js principal
- Server-Side Rendering (SSR)
- API Routes de Next.js
- Preview deployments para testing
- Build y deployment automático

### Supabase (Backend + Database + Auth + Storage)
**Ventajas:**
- ✅ PostgreSQL completo con RLS
- ✅ Authentication integrada
- ✅ Realtime subscriptions
- ✅ Storage para archivos
- ✅ Edge Functions (Deno)
- ✅ Vector embeddings para AI

**Usar para:**
- Base de datos PostgreSQL
- Autenticación de usuarios
- Storage de documentos médicos
- Realtime para chat/telemedicina
- Edge Functions para lógica de negocio

---

## 🔧 Configuración Paso a Paso

### Paso 1: Configurar DNS en Cloudflare

#### 1.1 Verificar que el dominio esté en Cloudflare

Tu dominio `red-salud.org` debe estar usando los nameservers de Cloudflare. Si no lo está:

1. Ve a tu registrador de dominios (donde compraste red-salud.org)
2. Cambia los nameservers a los que Cloudflare te proporcionó
3. Espera 24-48 horas para propagación

#### 1.2 Configurar registros DNS

En el dashboard de Cloudflare, ve a **DNS** > **Records** y configura:

```
Tipo    Nombre              Contenido                                   Proxy   TTL
CNAME   @                   cname.vercel-dns.com                       ✅      Auto
CNAME   www                 cname.vercel-dns.com                       ✅      Auto
CNAME   api                 cname.vercel-dns.com                       ✅      Auto
TXT     _vercel             [tu-verification-token]                     -       Auto
```

**Importante:** 
- El proxy (☁️ naranja) debe estar **ACTIVADO** para aprovechar el CDN de Cloudflare
- Vercel detectará automáticamente el dominio

### Paso 2: Configurar Dominio en Vercel

```bash
# Agregar dominio en Vercel
vercel domains add red-salud.org
vercel domains add www.red-salud.org
vercel domains add api.red-salud.org
```

O desde el dashboard:
1. Ve a tu proyecto en Vercel
2. Settings > Domains
3. Agrega: `red-salud.org`, `www.red-salud.org`, `api.red-salud.org`

### Paso 3: Configurar Cloudflare para Optimización

#### 3.1 Page Rules (Reglas de Caché)

En Cloudflare Dashboard > **Rules** > **Page Rules**:

```
1. red-salud.org/_next/static/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 year
   - Browser Cache TTL: 1 year

2. red-salud.org/api/*
   - Cache Level: Bypass
   - Disable Performance

3. red-salud.org/*
   - Cache Level: Standard
   - Browser Cache TTL: 4 hours
```

#### 3.2 Configurar SSL/TLS

1. Ve a **SSL/TLS** > **Overview**
2. Selecciona: **Full (strict)**
3. Habilita: **Always Use HTTPS**
4. Habilita: **Automatic HTTPS Rewrites**

#### 3.3 Configurar Speed Optimizations

En **Speed** > **Optimization**:
- ✅ Auto Minify: HTML, CSS, JavaScript
- ✅ Brotli compression
- ✅ Early Hints
- ✅ Rocket Loader (opcional, puede causar problemas con React)

---

## 🚀 Arquitectura Híbrida Recomendada

### Opción A: Cloudflare como Proxy (Recomendado para empezar)

```
Usuario
  ↓
Cloudflare DNS + CDN + WAF
  ↓
Vercel (Next.js App)
  ↓
Supabase (Database + Auth)
```

**Ventajas:**
- Fácil de configurar
- Aprovechas CDN de Cloudflare
- Protecci��n DDoS automática
- Mantiene todas las ventajas de Vercel

**Configuración:**
- DNS en Cloudflare con proxy activado (☁️)
- Vercel maneja el frontend
- Supabase maneja el backend

### Opción B: Arquitectura Distribuida (Avanzado)

```
Usuario
  ↓
Cloudflare DNS
  ├─→ Cloudflare Workers (API pública, rate limiting)
  │     ↓
  │   Supabase (Database)
  │
  └─→ Vercel (Next.js App para dashboard)
        ↓
      Supabase (Auth + Database)
```

**Ventajas:**
- APIs públicas más rápidas y económicas
- Mejor control de rate limiting
- Separación de concerns

**Usar Workers para:**
- API pública de búsqueda de médicos
- API de disponibilidad de citas
- Webhooks
- Rate limiting personalizado

---

## 💾 Usar Cloudflare R2 para Storage

### ¿Cuándo usar R2 en lugar de Supabase Storage?

**Usar R2 para:**
- ✅ Archivos grandes (imágenes médicas, rayos X)
- ✅ Videos de telemedicina
- ✅ Backups de base de datos
- ✅ Archivos que necesitan CDN global

**Usar Supabase Storage para:**
- ✅ Fotos de perfil
- ✅ Documentos de identidad
- ✅ Archivos que necesitan RLS (Row Level Security)

### Configuración de R2

```typescript
// lib/cloudflare/r2-client.ts
import { S3Client } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

---

## 🔐 Configurar Cloudflare Workers para APIs

### Ejemplo: Worker para Rate Limiting

```javascript
// workers/rate-limit.js
export default {
  async fetch(request, env) {
    const ip = request.headers.get('CF-Connecting-IP');
    const key = `rate_limit:${ip}`;
    
    // Usar KV para rate limiting
    const count = await env.RATE_LIMIT_KV.get(key);
    
    if (count && parseInt(count) > 100) {
      return new Response('Too Many Requests', { status: 429 });
    }
    
    // Incrementar contador
    await env.RATE_LIMIT_KV.put(key, (parseInt(count || 0) + 1).toString(), {
      expirationTtl: 60 // 1 minuto
    });
    
    // Proxy a Vercel
    return fetch(request);
  }
}
```

### Ejemplo: Worker para Búsqueda de Médicos

```javascript
// workers/search-doctors.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const specialty = url.searchParams.get('specialty');
    
    // Consultar Supabase directamente desde el Worker
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/profiles?role=eq.medico&specialty=eq.${specialty}`,
      {
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
        }
      }
    );
    
    return response;
  }
}
```

---

## 📊 Comparación de Costos

### Escenario: 100,000 usuarios/mes

| Servicio | Cloudflare | Vercel | Diferencia |
|----------|-----------|--------|------------|
| **Bandwidth** | Ilimitado gratis | 100GB gratis, luego $40/TB | 💰 Ahorro con CF |
| **Edge Functions** | 100k req gratis, $0.50/millón | 100k gratis, $2/millón | 💰 Ahorro con CF |
| **Storage (R2)** | $0.015/GB | N/A (usar S3) | 💰 Ahorro con CF |
| **CDN** | Incluido | Incluido | ⚖️ Similar |
| **Build Minutes** | N/A | 6000 min gratis | ✅ Vercel mejor |

**Recomendación:** Usa Cloudflare para tráfico alto y Vercel para desarrollo rápido.

---

## 🛠️ Variables de Entorno Adicionales

Agrega estas variables en Vercel:

```bash
# Cloudflare R2
R2_ACCESS_KEY_ID=tu_access_key
R2_SECRET_ACCESS_KEY=tu_secret_key
R2_BUCKET_NAME=red-salud-medical-files
CLOUDFLARE_ACCOUNT_ID=1322c385fa719249976c6ce3c2d87031

# Cloudflare Workers (si usas)
CLOUDFLARE_API_TOKEN=tu_api_token
CLOUDFLARE_ZONE_ID=tu_zone_id
```

---

## 🔄 Migración Gradual

### Fase 1: DNS + CDN (Ahora)
1. ✅ Configurar DNS en Cloudflare
2. ✅ Activar proxy para CDN
3. ✅ Configurar SSL/TLS
4. ✅ Optimizar caché

### Fase 2: Workers para APIs Públicas (Próximo mes)
1. Crear Workers para búsqueda
2. Implementar rate limiting
3. Migrar APIs de alto tráfico

### Fase 3: R2 Storage (Cuando sea necesario)
1. Configurar bucket R2
2. Migrar archivos grandes
3. Configurar CDN para R2

---

## 📝 Checklist de Configuración

### Cloudflare
- [ ] Dominio usando nameservers de Cloudflare
- [ ] Registros DNS configurados (CNAME a Vercel)
- [ ] Proxy activado (☁️ naranja)
- [ ] SSL/TLS en modo Full (strict)
- [ ] Page Rules configuradas
- [ ] Auto Minify activado
- [ ] Brotli compression activado

### Vercel
- [ ] Dominio agregado en proyecto
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] Preview deployments funcionando

### Supabase
- [ ] Variables de entorno en Vercel
- [ ] RLS policies configuradas
- [ ] Migraciones aplicadas

---

## 🆘 Solución de Problemas

### Error 404 en el dominio

**Causa:** DNS no apunta correctamente o dominio no verificado en Vercel

**Solución:**
1. Verifica que el CNAME apunte a `cname.vercel-dns.com`
2. Verifica que el dominio esté agregado en Vercel
3. Espera 5-10 minutos para propagación

### Error 525 (SSL Handshake Failed)

**Causa:** Configuración SSL incorrecta

**Solución:**
1. En Cloudflare, ve a SSL/TLS
2. Cambia a **Full (strict)**
3. Espera 5 minutos

### Contenido no se actualiza

**Causa:** Caché de Cloudflare

**Solución:**
1. Ve a Cloudflare Dashboard
2. Caching > Configuration
3. Click en "Purge Everything"

---

## 🎯 Próximos Pasos

1. **Ahora:** Configurar DNS en Cloudflare
2. **Esta semana:** Optimizar caché y SSL
3. **Próximo mes:** Implementar Workers para APIs
4. **Futuro:** Migrar storage a R2

---

## 📚 Recursos

- [Cloudflare DNS Docs](https://developers.cloudflare.com/dns/)
- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

---

**¿Necesitas ayuda?** Revisa los logs en:
- Cloudflare: Analytics > Traffic
- Vercel: Deployments > Logs
- Supabase: Logs Explorer
