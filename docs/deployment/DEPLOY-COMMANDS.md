# ⚡ Comandos Rápidos de Despliegue

Copia y pega estos comandos para desplegar rápidamente.

---

## 🗄️ Base de Datos

```bash
# Conectar a Supabase
supabase link --project-ref TU_PROJECT_REF

# Aplicar migración
supabase db push

# Verificar
supabase db diff
```

---

## ⚡ Edge Function

```bash
# Desplegar
supabase functions deploy verify-doctor-sacs

# Ver logs
supabase functions logs verify-doctor-sacs --tail

# Listar funciones
supabase functions list
```

---

## 🖥️ Servicio Backend - Local

```bash
# Instalar y ejecutar
cd sacs-verification-service
npm install
npm start

# En otra terminal - Probar
node test-quick.js
```

---

## 🚀 Servicio Backend - Railway

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Desplegar
cd sacs-verification-service
railway init
railway up

# Ver logs
railway logs
```

---

## 🧪 Pruebas Rápidas

### Health Check
```bash
curl http://localhost:3001/health
```

### Verificar Cédula
```bash
curl -X POST http://localhost:3001/verify \
  -H "Content-Type: application/json" \
  -d '{"cedula":"12345678","tipo_documento":"V"}'
```

### Probar Edge Function
```bash
curl -X POST https://TU_PROJECT_REF.supabase.co/functions/v1/verify-doctor-sacs \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"cedula":"12345678","tipo_documento":"V"}'
```

---

## 🔍 Verificación SQL

```sql
-- Ver tabla
SELECT * FROM doctor_verifications_cache LIMIT 10;

-- Ver perfiles de médicos
SELECT 
  dd.full_name,
  dd.document_type,
  dd.document_number,
  dd.main_profession,
  dd.is_verified,
  s.name as specialty
FROM doctor_details dd
LEFT JOIN specialties s ON dd.specialty_id = s.id
ORDER BY dd.created_at DESC;

-- Estadísticas
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE verified = true) as verificados,
  COUNT(*) FILTER (WHERE es_medico_humano = true) as medicos_humanos,
  COUNT(*) FILTER (WHERE es_veterinario = true) as veterinarios
FROM doctor_verifications_cache;
```

---

## 🐛 Debug

```bash
# Ver logs de Edge Function
supabase functions logs verify-doctor-sacs --tail

# Ver logs de Railway
railway logs --tail

# Probar servicio backend
cd sacs-verification-service
node test-quick.js
```

---

## 📦 Variables de Entorno

### Edge Function (Supabase Dashboard)
```
SACS_BACKEND_URL=https://tu-servicio.railway.app
```

### Backend (Railway/Render)
```
NODE_ENV=production
PORT=3001
```

---

## 🔄 Actualizar Código

```bash
# Pull cambios
git pull origin main

# Re-desplegar Edge Function
supabase functions deploy verify-doctor-sacs

# Re-desplegar Backend (Railway)
cd sacs-verification-service
railway up

# Re-aplicar migración (si cambió)
supabase db push
```

---

## ✅ Checklist Rápido

```bash
# 1. Base de datos
supabase db push

# 2. Edge Function
supabase functions deploy verify-doctor-sacs

# 3. Backend
cd sacs-verification-service && npm install && npm start

# 4. Probar
node test-quick.js
```

---

## 🎯 Todo en Uno

```bash
# Desplegar todo de una vez
supabase link --project-ref TU_PROJECT_REF && \
supabase db push && \
supabase functions deploy verify-doctor-sacs && \
cd sacs-verification-service && \
npm install && \
npm start
```
