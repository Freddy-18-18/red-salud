# 🔍 Instrucciones de Debug - Paso a Paso

## Paso 1: Limpiar Caché del Navegador

1. Presiona `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
2. Selecciona "Caché" y "Cookies"
3. Haz clic en "Borrar datos"
4. Cierra y vuelve a abrir el navegador

## Paso 2: Abrir Consola del Navegador

1. Presiona `F12` o `Ctrl + Shift + I`
2. Ve a la pestaña **"Console"**
3. Asegúrate de que no haya filtros activos:
   - Busca un ícono de embudo 🔽
   - Asegúrate de que diga "All levels" o "Todos los niveles"
   - Verifica que no haya texto en el filtro de búsqueda

## Paso 3: Recargar la Página

1. Con la consola abierta, presiona `Ctrl + R` o `F5`
2. O mejor aún: `Ctrl + Shift + R` (recarga forzada)

## Paso 4: Ir a Nueva Cita

1. Navega a: `/dashboard/paciente/citas/nueva`
2. **INMEDIATAMENTE** deberías ver logs como:

```
🎣 useMedicalSpecialties hook called with onlyWithDoctors: true
⏳ Loading specialties...
🚀 getMedicalSpecialties called with onlyWithDoctors: true
📡 Fetching doctors from Supabase...
📊 Supabase response: { profiles: 3, error: null, data: [...] }
👥 Processing 3 profiles
🔍 Profile: { id: ..., sacs_especialidad: "INFECTOLOGÍA PEDIÁTRICA", ... }
➕ Adding specialty from doctor_details: Infectología
🔍 Profile: { id: ..., sacs_especialidad: "MEDICINA GENERAL", ... }
➕ Adding specialty from SACS: MEDICINA GENERAL
🔍 Profile: { id: ..., sacs_especialidad: "ESPECIALISTA EN MEDICINA INTERNA", ... }
➕ Adding specialty from doctor_details: Medicina Interna
✅ Final specialties: 3 [...]
📦 Result from getMedicalSpecialties: { success: true, data: [...] }
✅ Setting specialties: 3
🎣 Hook returning: { specialties: 3, loading: false }
```

## Paso 5: Verificar Qué Ves

### ✅ Caso 1: Ves MUCHOS logs
**Perfecto!** Copia TODOS los logs y compártelos.

### ❌ Caso 2: NO ves NINGÚN log
Significa que hay un problema antes. Verifica:

1. **¿La página carga?**
   - Si ves "Agendar Nueva Cita" → Sí carga
   - Si ves error o pantalla en blanco → No carga

2. **¿Hay errores en rojo en la consola?**
   - Si hay errores rojos → Cópialos y compártelos
   - Si no hay nada → Continúa

3. **¿Estás en la pestaña correcta?**
   - Debe decir "Console" o "Consola"
   - NO "Elements", "Network", etc.

4. **¿El filtro está activo?**
   - Busca un campo de texto arriba de los logs
   - Debe estar vacío
   - Busca botones como "Errors", "Warnings", "Info"
   - Todos deben estar activos (no tachados)

### ⚠️ Caso 3: Ves ALGUNOS logs pero no todos
Copia los que veas y compártelos.

## Paso 6: Probar el Buscador

1. Escribe "medicina" en el campo de búsqueda
2. Deberías ver:

```
🔍 Search query: medicina
📋 All specialties: 3 [...]
✅ Filtered specialties: 2 [...]
```

## Paso 7: Seleccionar Especialidad

1. Haz clic en cualquier especialidad
2. Deberías ver:

```
🔍 getAvailableDoctors called with specialtyId: [id]
📊 Query result: { data: [...], error: null, count: 1 }
✅ Transformed doctors: 1 [...]
```

## 🆘 Si NO ves logs

### Opción A: Verificar en otra pestaña
1. Abre una pestaña de incógnito
2. Inicia sesión
3. Ve a nueva cita
4. Verifica si aparecen logs

### Opción B: Verificar en otro navegador
1. Abre Chrome/Firefox/Edge (el que NO estés usando)
2. Inicia sesión
3. Ve a nueva cita
4. Verifica si aparecen logs

### Opción C: Verificar errores de red
1. En DevTools, ve a la pestaña "Network" o "Red"
2. Recarga la página
3. Busca peticiones en rojo (errores)
4. Haz clic en ellas y copia el error

## 📸 Capturas de Pantalla Útiles

Si puedes, toma capturas de:
1. La consola completa (con o sin logs)
2. La pestaña Network mostrando las peticiones
3. La página de nueva cita (lo que ves)
4. Cualquier error en rojo

## 🎯 Lo Que Necesito Saber

1. **¿Ves logs?** Sí / No
2. **Si ves logs, ¿cuántos?** (cópialos todos)
3. **¿Hay errores en rojo?** Sí / No (cópialos)
4. **¿Qué navegador usas?** Chrome / Firefox / Edge / Safari
5. **¿La página carga correctamente?** Sí / No
6. **¿Dice "0 especialidades disponibles"?** Sí / No

Con esta información podré identificar exactamente dónde está el problema.
