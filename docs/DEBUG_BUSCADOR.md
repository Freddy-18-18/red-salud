# Debug del Buscador de Especialidades - LOGS COMPLETOS

## ⚠️ IMPORTANTE: Ahora hay MUCHOS logs

Si no ves NINGÚN log en la consola, significa que:
1. La página no se está cargando correctamente
2. Hay un error de JavaScript que detiene la ejecución
3. El navegador tiene la consola filtrada

## Debug del Buscador de Especialidades

## Estado Actual

### Datos en Base de Datos ✅
- **3 médicos** con `sacs_verificado = true`
- **2 con doctor_details** (Karim, Marlin)
- **1 sin doctor_details** (Juan)

### Especialidades Esperadas
1. **Infectología** (Dr. Karim) - ID real: `974c831d-0965-4160-9eba-d51cc763294f`
2. **Medicina Interna** (Dra. Marlin) - ID real: `cafb2886-70ca-4abb-ab52-e828ee62275f`
3. **MEDICINA GENERAL** (Dr. Juan) - ID temporal: `sacs-medicina-general`

## Logs Agregados

### En `getMedicalSpecialties`:
```
👥 Profiles found: 3 [...]
🔍 Processing profile: { id, sacs_especialidad, has_doctor_details, specialty }
📋 Specialties with doctors: 3 [...]
```

### En el Filtro de Búsqueda:
```
🔍 Search query: "medicina"
📋 All specialties: 3 [...]
✅ Filtered specialties: 2 [...]
```

### En `getAvailableDoctors`:
```
🔍 getAvailableDoctors called with specialtyId: [id]
📊 Query result: { data: [...], error: null, count: 3 }
✅ Transformed doctors: 3 [...]
```

## Pasos para Debug

### 1. Abrir Consola del Navegador
- Presiona F12
- Ve a la pestaña "Console"

### 2. Ir a Nueva Cita
- Navega a `/dashboard/paciente/citas/nueva`

### 3. Verificar Logs Iniciales
Deberías ver:
```
👥 Profiles found: 3
🔍 Processing profile: (3 veces)
📋 Specialties with doctors: 3
```

Si ves `Specialties with doctors: 0` → Problema en la consulta

### 4. Probar el Buscador
- Escribe "medicina" en el buscador
- Deberías ver:
```
🔍 Search query: "medicina"
📋 All specialties: 3
✅ Filtered specialties: 2 (Medicina Interna, MEDICINA GENERAL)
```

### 5. Seleccionar Especialidad
- Haz clic en una especialidad
- Deberías ver:
```
🔍 getAvailableDoctors called with specialtyId: [id]
📊 Query result: { count: 1 o más }
✅ Transformed doctors: 1 o más
```

## Problemas Comunes

### Problema 1: No aparecen especialidades
**Síntoma:** `Specialties with doctors: 0`

**Causa:** La consulta no encuentra médicos verificados

**Solución:**
```sql
-- Verificar en Supabase
SELECT * FROM profiles 
WHERE role = 'medico' AND sacs_verificado = true;
```

### Problema 2: Buscador no filtra
**Síntoma:** Al escribir, no cambia el número de resultados

**Causa:** `searchQuery` no se está actualizando

**Verificar:**
- Estado `searchQuery` en React DevTools
- Evento `onChange` del Input

### Problema 3: No aparecen médicos al seleccionar
**Síntoma:** `Transformed doctors: 0`

**Causa:** Filtro de especialidad no coincide

**Verificar:**
- El `specialtyId` que se pasa
- Los IDs en los objetos de médicos

## Código Relevante

### Filtro de Búsqueda
```typescript
const filtered = specialties.filter((specialty) => {
  const nameMatch = specialty.name?.toLowerCase().includes(query);
  const descMatch = specialty.description?.toLowerCase().includes(query);
  return nameMatch || descMatch;
});
```

### Generación de ID Temporal
```typescript
const tempId = `sacs-${profile.sacs_especialidad.toLowerCase().replace(/\s+/g, '-')}`;
// Ejemplo: "MEDICINA GENERAL" → "sacs-medicina-general"
```

### Filtro por Especialidad
```typescript
if (doc.specialty_id) {
  return doc.specialty_id === specialtyId;
}
const tempId = `sacs-${doc.specialty.name.toLowerCase().replace(/\s+/g, '-')}`;
return tempId === specialtyId;
```

## Verificación Manual

### Consulta SQL Directa
```sql
-- Ver especialidades que deberían aparecer
SELECT DISTINCT
  COALESCE(s.name, p.sacs_especialidad) as especialidad,
  COALESCE(s.id::text, 'sacs-' || lower(replace(p.sacs_especialidad, ' ', '-'))) as id
FROM profiles p
LEFT JOIN doctor_details dd ON dd.profile_id = p.id
LEFT JOIN specialties s ON s.id = dd.especialidad_id
WHERE p.role = 'medico' 
  AND p.sacs_verificado = true;
```

Resultado esperado:
```
especialidad              | id
--------------------------|----------------------------------
Infectología              | 974c831d-0965-4160-9eba-d51cc763294f
Medicina Interna          | cafb2886-70ca-4abb-ab52-e828ee62275f
MEDICINA GENERAL          | sacs-medicina-general
```

## Siguiente Paso

1. Abre la consola
2. Ve a `/dashboard/paciente/citas/nueva`
3. Copia y pega TODOS los logs que veas
4. Compártelos para análisis

Los logs te dirán exactamente dónde está el problema.
