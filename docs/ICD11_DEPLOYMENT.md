# 🚀 Deployment - ICD-11 API

## Checklist Pre-Deployment

### ✅ Variables de Entorno

Asegúrate de configurar en tu plataforma de deployment (Vercel, Railway, etc.):

```env
ICD_API_CLIENT_ID=6ad1234d-e494-48bf-a76b-a6eca0365465_2c9ff758-a26b-4e05-ae31-0d6fb05b9ecc
ICD_API_CLIENT_SECRET=1iC3qmJ1/F2BA9nS2GW2daySuf3njvx46dNvbnxpUYs=
```

### ✅ Verificaciones

- [ ] Variables de entorno configuradas en producción
- [ ] Build exitoso sin errores
- [ ] Tests pasando (si aplica)
- [ ] API routes accesibles
- [ ] Componente UI funcional

---

## 🔧 Deployment en Vercel

### 1. Configurar Variables de Entorno

```bash
# Opción A: Desde CLI
vercel env add ICD_API_CLIENT_ID
vercel env add ICD_API_CLIENT_SECRET

# Opción B: Desde Dashboard
# 1. Ve a tu proyecto en vercel.com
# 2. Settings → Environment Variables
# 3. Agrega las variables
```

### 2. Deploy

```bash
# Deploy a producción
vercel --prod

# O push a main/master (auto-deploy)
git push origin main
```

### 3. Verificar

```bash
# Probar endpoint de búsqueda
curl "https://tu-dominio.vercel.app/api/icd11/search?q=diabetes"

# Probar endpoint de validación
curl "https://tu-dominio.vercel.app/api/icd11/validate?code=5A11"
```

---

## 🔧 Deployment en Railway

### 1. Configurar Variables

```bash
# Desde CLI
railway variables set ICD_API_CLIENT_ID="6ad1234d-e494-48bf-a76b-a6eca0365465_2c9ff758-a26b-4e05-ae31-0d6fb05b9ecc"
railway variables set ICD_API_CLIENT_SECRET="1iC3qmJ1/F2BA9nS2GW2daySuf3njvx46dNvbnxpUYs="

# O desde Dashboard
# 1. Ve a tu proyecto en railway.app
# 2. Variables → New Variable
# 3. Agrega las variables
```

### 2. Deploy

```bash
railway up
```

---

## 🔧 Deployment en Netlify

### 1. Configurar Variables

```bash
# Desde CLI
netlify env:set ICD_API_CLIENT_ID "6ad1234d-e494-48bf-a76b-a6eca0365465_2c9ff758-a26b-4e05-ae31-0d6fb05b9ecc"
netlify env:set ICD_API_CLIENT_SECRET "1iC3qmJ1/F2BA9nS2GW2daySuf3njvx46dNvbnxpUYs="

# O desde Dashboard
# 1. Site settings → Environment variables
# 2. Add a variable
```

### 2. Deploy

```bash
netlify deploy --prod
```

---

## 🔧 Deployment en Docker

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV ICD_API_CLIENT_ID=${ICD_API_CLIENT_ID}
ENV ICD_API_CLIENT_SECRET=${ICD_API_CLIENT_SECRET}

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ICD_API_CLIENT_ID=${ICD_API_CLIENT_ID}
      - ICD_API_CLIENT_SECRET=${ICD_API_CLIENT_SECRET}
    restart: unless-stopped
```

### Deploy

```bash
# Build
docker build -t red-salud .

# Run
docker run -p 3000:3000 \
  -e ICD_API_CLIENT_ID="..." \
  -e ICD_API_CLIENT_SECRET="..." \
  red-salud

# O con docker-compose
docker-compose up -d
```

---

## 🧪 Testing Post-Deployment

### 1. Health Check

```bash
# Verificar que la app esté corriendo
curl https://tu-dominio.com/api/health
```

### 2. Test ICD-11 Search

```bash
# Búsqueda básica
curl "https://tu-dominio.com/api/icd11/search?q=diabetes"

# Búsqueda con modo suggestions
curl "https://tu-dominio.com/api/icd11/search?q=hipertension&mode=suggestions"
```

### 3. Test ICD-11 Validation

```bash
# Validar código existente
curl "https://tu-dominio.com/api/icd11/validate?code=5A11"

# Validar código inexistente
curl "https://tu-dominio.com/api/icd11/validate?code=XXXX"
```

### 4. Test UI

1. Visita: `https://tu-dominio.com/dashboard/medico/icd11-demo`
2. Prueba búsquedas: diabetes, asma, covid
3. Prueba validación: 5A11, BA00
4. Verifica que no haya errores en consola

---

## 📊 Monitoreo

### Logs a Revisar

```bash
# Vercel
vercel logs

# Railway
railway logs

# Netlify
netlify logs

# Docker
docker logs <container-id>
```

### Métricas Importantes

- **Tasa de éxito de autenticación OAuth2**
- **Tiempo de respuesta de búsquedas**
- **Errores de API**
- **Cache hit rate de tokens**

### Alertas Sugeridas

1. **Error rate > 5%**: Revisar credenciales y conectividad
2. **Response time > 2s**: Optimizar o escalar
3. **Token refresh failures**: Verificar credenciales

---

## 🔒 Seguridad en Producción

### ✅ Checklist

- [ ] Variables de entorno nunca en código
- [ ] HTTPS habilitado
- [ ] CORS configurado correctamente
- [ ] Rate limiting en API routes
- [ ] Logs sin información sensible
- [ ] Headers de seguridad configurados

### Headers Recomendados

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};
```

---

## 🐛 Troubleshooting

### Error: "credentials not configured"

**Causa**: Variables de entorno no están configuradas

**Solución**:
```bash
# Verificar variables
vercel env ls

# Agregar si faltan
vercel env add ICD_API_CLIENT_ID
vercel env add ICD_API_CLIENT_SECRET

# Re-deploy
vercel --prod
```

### Error: "Failed to get ICD API token"

**Causa**: Credenciales inválidas o problema de red

**Solución**:
1. Verificar credenciales en https://icd.who.int/icdapi
2. Verificar conectividad desde servidor
3. Revisar logs para más detalles

### Error: "CORS policy"

**Causa**: Configuración CORS incorrecta

**Solución**:
```typescript
// app/api/icd11/search/route.ts
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data);
  
  // Agregar headers CORS si es necesario
  response.headers.set('Access-Control-Allow-Origin', '*');
  
  return response;
}
```

---

## 📈 Optimizaciones

### 1. Edge Functions (Vercel)

```typescript
// app/api/icd11/search/route.ts
export const runtime = 'edge';
```

### 2. Cache de Respuestas

```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data);
  
  // Cache por 1 hora
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  );
  
  return response;
}
```

### 3. Rate Limiting

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function GET(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }
  
  // ... resto del código
}
```

---

## 📞 Soporte

Si encuentras problemas durante el deployment:

1. **Revisa logs** de tu plataforma
2. **Verifica variables** de entorno
3. **Prueba endpoints** manualmente
4. **Consulta documentación** en `ICD11_API_IMPLEMENTACION.md`
5. **Contacta soporte** de WHO ICD API si es problema de credenciales

---

## ✅ Checklist Final

Antes de considerar el deployment completo:

- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] Endpoints respondiendo correctamente
- [ ] UI funcional sin errores
- [ ] Logs limpios sin warnings críticos
- [ ] Performance aceptable (< 2s response time)
- [ ] Monitoreo configurado
- [ ] Documentación actualizada
- [ ] Equipo notificado

---

**¡Deployment Exitoso! 🎉**

La API de ICD-11 está ahora disponible en producción.
