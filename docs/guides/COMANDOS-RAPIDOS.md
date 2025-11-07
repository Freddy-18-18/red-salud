# ⚡ Comandos Rápidos - Despliegue Sistema de Verificación

## 🚀 Despliegue Completo (15 minutos)

### 1. Base de Datos (Supabase Dashboard)

Ir a: **SQL Editor** y ejecutar:

```sql
-- Agregar campo de verificación
ALTER TABLE doctor_profiles 
ADD COLUMN IF NOT EXISTS verification_data JSONB DEFAULT '{}'::jsonb;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_doctor_verification 
ON doctor_profiles USING gin(verification_data);

-- Verificar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'doctor_profiles' 
AND column_name = 'verification_data';
```

### 2. Edge Function (Terminal)

```bash
# Login
supabase login

# Link proyecto (reemplaza TU_PROJECT_REF)
supabase link --project-ref TU_PROJECT_REF

# Desplegar
supabase functions deploy verify-doctor-sacs

# Verificar
supabase functions list
```

### 3. Frontend (Terminal)

```bash
# Instalar dependencias (si es necesario)
npm install

# Build
npm run build

# Verificar que no hay errores
npm run lint
```

---

## 🧪 Testing Rápido

### Test Edge Function

```bash
# Ver logs
supabase functions logs verify-doctor-sacs --limit 10

# Test con curl (reemplaza valores)
curl -i --location --request POST \
  'https://TU_PROJECT_REF.supabase.co/functions/v1/verify-doctor-sacs' \
  --header 'Authorization: Bearer TU_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"cedula":"12345678"}'
```

### Test desde Navegador

```javascript
// Abrir consola en tu app y ejecutar:
const { data, error } = await supabase.functions.invoke('verify-doctor-sacs', {
  body: { cedula: '12345678' }
});
console.log('Resultado:', data);
console.log('Error:', error);
```

---

## 🔍 Verificación Rápida

### Verificar Migración

```sql
-- Ver estructura de doctor_profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'doctor_profiles'
ORDER BY ordinal_position;

-- Ver índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'doctor_profiles';
```

### Verificar Políticas RLS

```sql
-- Ver todas las políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('doctor_profiles', 'medical_specialties')
ORDER BY tablename, policyname;
```

### Verificar Especialidades

```sql
-- Contar especialidades
SELECT COUNT(*) as total FROM medical_specialties;

-- Ver todas
SELECT id, name, icon, color FROM medical_specialties ORDER BY name;
```

---

## 🐛 Troubleshooting Rápido

### Error: "Function not found"

```bash
# Re-desplegar
supabase functions deploy verify-doctor-sacs --no-verify-jwt

# Ver logs
supabase functions logs verify-doctor-sacs
```

### Error: "Column does not exist"

```sql
-- Aplicar migración nuevamente
ALTER TABLE doctor_profiles 
ADD COLUMN IF NOT EXISTS verification_data JSONB DEFAULT '{}'::jsonb;
```

### Error: "Permission denied"

```sql
-- Re-crear políticas
DROP POLICY IF EXISTS "Médicos pueden insertar su propio perfil" ON doctor_profiles;
DROP POLICY IF EXISTS "Médicos pueden actualizar su propio perfil" ON doctor_profiles;

CREATE POLICY "Médicos pueden insertar su propio perfil"
  ON doctor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Médicos pueden actualizar su propio perfil"
  ON doctor_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
```

### Error: "Specialties not loading"

```sql
-- Verificar política
DROP POLICY IF EXISTS "Especialidades son públicas" ON medical_specialties;

CREATE POLICY "Especialidades son públicas"
  ON medical_specialties FOR SELECT
  TO authenticated
  USING (true);

-- Verificar datos
SELECT COUNT(*) FROM medical_specialties;
```

---

## 📊 Monitoreo Rápido

### Ver Logs de Edge Function

```bash
# Últimos 50 logs
supabase functions logs verify-doctor-sacs --limit 50

# Logs en tiempo real
supabase functions logs verify-doctor-sacs --follow
```

### Ver Perfiles Creados

```sql
-- Últimos 10 perfiles
SELECT 
  id,
  created_at,
  is_verified,
  license_number,
  verification_data->>'sacs_verified' as sacs_verified,
  verification_data->>'cedula' as cedula
FROM doctor_profiles
ORDER BY created_at DESC
LIMIT 10;
```

### Ver Estadísticas

```sql
-- Total de médicos
SELECT COUNT(*) as total_medicos FROM doctor_profiles;

-- Médicos verificados
SELECT COUNT(*) as verificados 
FROM doctor_profiles 
WHERE is_verified = true;

-- Por especialidad
SELECT 
  ms.name as especialidad,
  COUNT(dp.id) as total
FROM medical_specialties ms
LEFT JOIN doctor_profiles dp ON ms.id = dp.specialty_id
GROUP BY ms.name
ORDER BY total DESC;
```

---

## 🔄 Rollback Rápido

### Revertir Migración

```sql
-- Eliminar columna
ALTER TABLE doctor_profiles DROP COLUMN IF EXISTS verification_data;

-- Eliminar índice
DROP INDEX IF EXISTS idx_doctor_verification;
```

### Eliminar Edge Function

```bash
supabase functions delete verify-doctor-sacs
```

---

## 📱 URLs Importantes

### Supabase Dashboard
```
https://app.supabase.com/project/TU_PROJECT_REF
```

### Edge Functions
```
https://app.supabase.com/project/TU_PROJECT_REF/functions
```

### SQL Editor
```
https://app.supabase.com/project/TU_PROJECT_REF/sql
```

### Database
```
https://app.supabase.com/project/TU_PROJECT_REF/database/tables
```

---

## 🎯 Checklist Rápido

Antes de marcar como completado:

- [ ] Migración aplicada sin errores
- [ ] Edge Function desplegada
- [ ] Políticas RLS verificadas
- [ ] Especialidades cargadas
- [ ] Test de Edge Function exitoso
- [ ] Frontend compila sin errores
- [ ] Dashboard muestra overlay
- [ ] Formulario de verificación funciona
- [ ] No hay errores en consola

---

## 💾 Backup Rápido

### Antes de Desplegar

```bash
# Backup de base de datos
supabase db dump -f backup-$(date +%Y%m%d).sql

# Backup de funciones
supabase functions download
```

---

## 🔑 Variables de Entorno

### Verificar que existen:

```bash
# En .env.local
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

---

## 📞 Comandos de Ayuda

```bash
# Ayuda de Supabase CLI
supabase --help

# Ayuda de funciones
supabase functions --help

# Ayuda de base de datos
supabase db --help

# Ver versión
supabase --version
```

---

## ⚡ One-Liner para Despliegue Completo

```bash
# Desplegar todo (después de aplicar migración SQL)
supabase login && \
supabase link --project-ref TU_PROJECT_REF && \
supabase functions deploy verify-doctor-sacs && \
npm run build && \
echo "✅ Despliegue completado!"
```

---

## 🎉 Verificación Final

```bash
# Test completo
echo "Testing Edge Function..." && \
supabase functions invoke verify-doctor-sacs --body '{"cedula":"12345678"}' && \
echo "✅ Edge Function OK" && \
npm run build && \
echo "✅ Build OK" && \
echo "🎉 Todo listo para producción!"
```

---

**Nota**: Reemplaza `TU_PROJECT_REF` y `TU_ANON_KEY` con tus valores reales.

**Tiempo total estimado**: 15 minutos

**Dificultad**: Baja (comandos copy-paste)
