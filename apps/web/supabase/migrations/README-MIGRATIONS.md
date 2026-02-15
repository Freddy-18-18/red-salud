# 🚀 Guía de Aplicación de Migraciones

## Migraciones creadas:

1. **`20260213000000_add_professional_info_fields.sql`**
   - Agrega 13 campos nuevos a `doctor_profiles`
   - Publicaciones, asociaciones, condiciones tratadas, experiencia, seguros, redes sociales
   - Índices para búsquedas optimizadas
   - Función helper para buscar médicos por condición

2. **`20260213000001_setup_doctor_storage.sql`**
   - Crea bucket `doctor-documents` en Supabase Storage
   - Políticas RLS para upload/view/delete de archivos
   - Tabla `doctor_documents` para tracking de metadata
   - Funciones helper para limpieza y estadísticas

---

## 📋 Opción 1: Script Automático (Recomendado)

### Pre-requisitos:
```bash
# Asegúrate de tener estas variables en .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### Ejecutar:
```bash
cd apps/web
npx tsx scripts/apply-professional-info-migrations.ts
```

### ¿Qué hace?
- Lee las migraciones de `supabase/migrations/`
- Ejecuta cada statement SQL
- Verifica que se apliquen correctamente
- Reporta éxitos y errores

---

## 📋 Opción 2: Supabase CLI

### Pre-requisitos:
```bash
# Instalar Supabase CLI si no lo tienes:
npm install -g supabase

# Login
npx supabase login
```

### Ejecutar:
```bash
# Desde la raíz del proyecto
cd apps/web

# Aplicar todas las migraciones pendientes
npx supabase db push

# O aplicar migraciones específicas
npx supabase db push --include-all
```

---

## 📋 Opción 3: Supabase Dashboard (Manual)

### Paso 1: Abrir SQL Editor
1. Ir a https://supabase.com/dashboard
2. Seleccionar tu proyecto
3. Ir a **SQL Editor** (icono de terminal en sidebar)

### Paso 2: Ejecutar Migración 1
1. Abrir archivo: `supabase/migrations/20260213000000_add_professional_info_fields.sql`
2. Copiar **TODO** el contenido
3. Pegar en SQL Editor
4. Click en **Run** (o Ctrl+Enter)
5. Verificar que muestra "Success"

### Paso 3: Ejecutar Migración 2
1. Abrir archivo: `supabase/migrations/20260213000001_setup_doctor_storage.sql`
2. Copiar **TODO** el contenido
3. Pegar en SQL Editor
4. Click en **Run** (o Ctrl+Enter)
5. Verificar que muestra "Success"

### Paso 4: Verificar
En SQL Editor, ejecuta:
```sql
-- Verificar nuevas columnas
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'doctor_profiles'
  AND column_name IN (
    'university', 'college_number', 'graduation_year',
    'awards', 'publications', 'associations',
    'conditions_treated', 'age_groups', 'work_experience',
    'accepted_insurances', 'social_media', 'website'
  )
ORDER BY column_name;

-- Verificar bucket
SELECT * FROM storage.buckets WHERE id = 'doctor-documents';

-- Verificar políticas de Storage
SELECT * FROM storage.policies 
WHERE bucket_id = 'doctor-documents';
```

---

## ✅ Verificación Post-Migración

### 1. Verificar columnas nuevas:
```sql
-- En SQL Editor
SELECT * FROM doctor_profiles LIMIT 1;
```

Deberías ver las nuevas columnas:
- `university`
- `college_number`  
- `graduation_year`
- `awards`
- `publications`
- `associations`
- `conditions_treated`
- `age_groups`
- `work_experience`
- `accepted_insurances`
- `social_media`
- `website`

### 2. Verificar Storage Bucket:
1. Ir a **Storage** en Dashboard
2. Deberías ver bucket: `doctor-documents`
3. Click en el bucket
4. Deberías poder ver las políticas RLS en la pestaña "Policies"

### 3. Verificar tabla de documentos:
```sql
-- En SQL Editor
SELECT * FROM doctor_documents LIMIT 1;
```

### 4. Probar desde la aplicación:
1. Iniciar dev server: `npm run dev`
2. Ir a: http://localhost:3000/dashboard/medico/configuracion?tab=info-profesional
3. No deberías ver el error de loading
4. Deberías poder editar y guardar cambios
5. En tab "Certificaciones", probar subir un PDF

---

## 🔍 Troubleshooting

### Error: "column does not exist"
```bash
# Verificar que la migración se aplicó:
SELECT * FROM information_schema.columns 
WHERE table_name = 'doctor_profiles' 
AND column_name = 'publications';

# Si no devuelve resultados, la migración no se aplicó
# Volver a ejecutar la migración 1
```

### Error: "bucket does not exist"
```bash
# Verificar bucket:
SELECT * FROM storage.buckets WHERE id = 'doctor-documents';

# Si no existe, ejecutar solo la parte de crear bucket:
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('doctor-documents', 'doctor-documents', FALSE, 5242880)
ON CONFLICT (id) DO NOTHING;
```

### Error: "permission denied" al subir archivo
```bash
# Verificar políticas RLS:
SELECT * FROM storage.policies 
WHERE bucket_id = 'doctor-documents';

# Deberías ver 4 políticas para doctors:
# - upload their own documents
# - view their own documents  
# - update their own documents
# - delete their own documents
```

### Hook sigue mostrando error {}
```bash
# 1. Verificar que las migraciones se aplicaron
# 2. Limpiar cache de Next.js:
rm -rf .next
npm run dev

# 3. Verificar consola del navegador para ver error específico
# 4. Verificar que el usuario está autenticado y tiene rol 'medico'
```

---

## 📊 Datos de Prueba (Opcional)

Para agregar datos de prueba a tu perfil:

```sql
-- Reemplaza 'TU_USER_ID' con tu ID de usuario
UPDATE doctor_profiles
SET 
  university = 'Universidad Central de Venezuela',
  college_number = 'CMV-12345',
  graduation_year = 2015,
  conditions_treated = ARRAY['Diabetes', 'Hipertensión', 'Obesidad'],
  age_groups = ARRAY['Adultos', 'Ancianos'],
  publications = '[
    {
      "title": "Manejo integral de diabetes",
      "journal": "Revista Médica Venezolana",
      "year": 2023
    }
  ]'::jsonb,
  awards = '[
    {
      "name": "Mejor Médico del Año",
      "issuer": "Colegio de Médicos",
      "year": 2024
    }
  ]'::jsonb,
  associations = '[
    {
      "name": "Sociedad Venezolana de Medicina Interna",
      "role": "Miembro Activo",
      "since_year": 2020
    }
  ]'::jsonb,
  work_experience = '[
    {
      "institution": "Hospital Universitario",
      "position": "Médico Internista",
      "start_date": "2018-01-01",
      "is_current": true
    }
  ]'::jsonb,
  accepted_insurances = '[
    {
      "name": "Seguros Caracas",
      "plans": ["Plan Oro", "Plan Platino"],
      "copay_info": "20% copago"
    }
  ]'::jsonb,
  social_media = '{
    "linkedin": "https://linkedin.com/in/drjuan",
    "instagram": "https://instagram.com/drjuanmedico"
  }'::jsonb,
  website = 'https://drjuan.com'
WHERE id = 'TU_USER_ID';
```

---

## 🎯 Resumen

**Mejor opción para desarrollo local**: Opción 3 (Dashboard) - más visual y fácil de debuggear

**Mejor opción para producción**: Opción 2 (CLI) - más automatizado y versionado

**Backup**: Opción 1 (Script) - si las otras fallan por permisos o configuración

---

**Después de aplicar las migraciones**, el error de "Error loading professional data" debería desaparecer y podrás:
✅ Ver información profesional
✅ Editar y guardar cambios
✅ Subir certificados en PDF
✅ Sincronizar con SACS
✅ Agregar experiencia laboral
✅ Configurar seguros aceptados
✅ Agregar redes sociales
