# ✅ Implementación Final - Sistema de Verificación de Cédula

## 🎯 Flujo Completo Implementado

### 1. **Validación de Cédula en Mi Perfil**
```
Usuario ingresa cédula: V-12345678
         ↓
Sistema valida con cedula.com.ve
         ↓
Obtiene datos oficiales del CNE
         ↓
Autocompleta nombre y lo bloquea
         ↓
Usuario completa otros campos
         ↓
Hace clic en "Guardar"
         ↓
✅ Cédula se ANCLA a la cuenta
         ↓
Se establece deadline de 30 días para foto
```

### 2. **Verificación con Foto en Documentos**
```
Usuario va a tab "Documentos"
         ↓
Ve contador de días restantes
         ↓
Sube foto frontal (y opcional trasera)
         ↓
Didit extrae datos con IA
         ↓
Sistema compara:
  - Número de cédula
  - Nombre completo
         ↓
Si coinciden: ✅ Verificación completa
         ↓
Deadline se elimina
```

## 🔒 Reglas de Anclaje

### Cédula NO Anclada
- ✅ Puede editar nombre
- ✅ Puede editar cédula
- ✅ Puede editar todos los campos

### Cédula ANCLADA (después de guardar)
- ❌ NO puede cambiar nombre
- ❌ NO puede cambiar cédula
- ✅ Puede editar otros campos (teléfono, dirección, etc.)
- ⏰ Tiene 30 días para subir foto

### Foto Verificada
- ✅ Verificación completa
- ✅ Sin deadline
- ✅ Cuenta totalmente verificada

## 📊 Campos en Base de Datos

```sql
-- Validación de número
cedula_verificada: boolean
cedula_verified_at: timestamp
cne_estado, cne_municipio, cne_parroquia: varchar

-- Verificación de foto
cedula_photo_verified: boolean
cedula_photo_verified_at: timestamp
didit_request_id: varchar

-- Deadline
photo_upload_deadline: timestamp (30 días desde anclaje)
```

## 🎨 Interfaz de Usuario

### Tab "Mi Perfil"

**Antes de Anclar:**
```
[V ▼] [12345678_______]
✓ Cédula validada correctamente. Haz clic en "Guardar" para anclarla.

[Cancelar] [Guardar]
```

**Después de Anclar:**
```
🔒 Cédula anclada - No se puede modificar

✅ Tu cédula ha sido anclada a tu cuenta
Tu cédula fue validada con datos oficiales del CNE. 
Por seguridad, no puedes modificar tu nombre ni cédula.
⚠️ Tienes 30 días para subir la foto de tu cédula en la sección de Documentos.
```

### Tab "Documentos"

**Sin Cédula Anclada:**
```
Primero Ancla tu Cédula
Para verificar tu cédula con foto, primero debes:
1. Ir a la sección "Mi Perfil"
2. Ingresar tu número de cédula
3. Validar con datos oficiales del CNE
4. Hacer clic en "Guardar" para anclar tu cédula
5. Regresar aquí para subir la foto
```

**Con Cédula Anclada (Pendiente Foto):**
```
📅 Recordatorio
Te quedan 25 días para subir la foto de tu cédula.

[Área de upload de foto frontal]
[Área de upload de foto trasera (opcional)]
[Verificar Cédula]
```

**Con Foto Verificada:**
```
✅ Verificación Completa
Tu cédula ha sido verificada exitosamente con foto. 
Tu cuenta está completamente verificada.
```

## 📁 Archivos Modificados

### Componentes
1. ✅ `components/dashboard/profile/tabs/profile-tab.tsx`
   - Eliminada verificación de foto
   - Agregado mensaje de anclaje
   - Bloqueado nombre y cédula después de anclar

2. ✅ `components/dashboard/profile/tabs/documents-tab.tsx`
   - Reemplazado completamente
   - Integración con CedulaPhotoUpload
   - Contador de días restantes
   - Estados de verificación

3. ✅ `components/dashboard/profile/user-profile-modal.tsx`
   - Mejorado manejo de errores
   - Recarga de datos después de guardar

4. ✅ `components/dashboard/profile/types.ts`
   - Agregados campos de verificación

### API Routes
5. ✅ `app/api/profile/update/route.ts`
   - Lógica de anclaje al guardar
   - Validación de cambios en cédula/nombre
   - Cálculo de deadline de 30 días
   - Manejo de verificación de foto

6. ✅ `app/api/profile/get/route.ts`
   - Incluye deadline y fechas de verificación

### Base de Datos
7. ✅ `supabase/migrations/20241108000002_add_photo_deadline.sql`
   - Campos: cedula_verified_at, photo_upload_deadline

## 🔄 Flujo de Estados

```
Estado 1: Sin Verificar
├─ cedula_verificada: false
├─ cedula_photo_verified: false
└─ Puede editar todo

Estado 2: Cédula Anclada
├─ cedula_verificada: true
├─ cedula_verified_at: timestamp
├─ photo_upload_deadline: timestamp (+30 días)
├─ cedula_photo_verified: false
├─ NO puede editar: nombre, cédula
└─ Puede editar: otros campos

Estado 3: Verificación Completa
├─ cedula_verificada: true
├─ cedula_photo_verified: true
├─ cedula_photo_verified_at: timestamp
├─ photo_upload_deadline: null
└─ Cuenta completamente verificada
```

## ⚠️ Validaciones Implementadas

### Al Guardar Perfil
```typescript
// Si cédula ya está anclada
if (currentProfile?.cedula_verificada) {
  // No permitir cambio de cédula
  if (profileData.cedula !== currentProfile.cedula) {
    return error("No puedes cambiar tu cédula");
  }
  
  // No permitir cambio de nombre
  if (profileData.nombre !== currentProfile.nombre_completo) {
    return error("No puedes cambiar tu nombre");
  }
}

// Si es primera vez que se ancla
if (profileData.cedula && profileData.cneEstado && !currentProfile?.cedula_verificada) {
  cedula_verificada = true;
  cedula_verified_at = now();
  photo_upload_deadline = now() + 30 días;
}
```

### Al Verificar Foto
```typescript
// Comparar datos
const cedulaMatch = fotoCedula === cedulaIngresada;
const nombreMatch = fotoNombre === nombreCNE;

if (cedulaMatch && nombreMatch) {
  cedula_photo_verified = true;
  cedula_photo_verified_at = now();
  photo_upload_deadline = null;
}
```

## 🎯 Casos de Uso

### Caso 1: Usuario Nuevo
```
1. Registra cuenta
2. Va a "Mi Perfil"
3. Ingresa cédula V-12345678
4. Sistema valida y autocompleta nombre
5. Completa otros campos
6. Hace clic en "Guardar"
7. ✅ Cédula anclada
8. Ve mensaje: "Tienes 30 días para subir foto"
9. Va a "Documentos"
10. Sube foto de cédula
11. Sistema verifica
12. ✅ Cuenta completamente verificada
```

### Caso 2: Usuario Intenta Cambiar Cédula
```
1. Cédula ya anclada: V-12345678
2. Intenta cambiar a: V-87654321
3. Hace clic en "Guardar"
4. ❌ Error: "No puedes cambiar tu cédula porque ya está anclada"
5. Cambio rechazado
```

### Caso 3: Usuario Sube Foto Incorrecta
```
1. Cédula anclada: V-12345678
2. Sube foto de cédula: V-87654321
3. Sistema compara
4. ❌ No coinciden
5. Muestra error: "La cédula de la foto no coincide"
6. Usuario debe subir foto correcta
```

## 📝 Mensajes de Error

| Situación | Mensaje |
|-----------|---------|
| Cambiar cédula anclada | "No puedes cambiar tu cédula porque ya está anclada a tu cuenta." |
| Cambiar nombre anclado | "No puedes cambiar tu nombre porque tu cédula ya está anclada." |
| Foto no coincide (cédula) | "La cédula de la foto (V-87654321) no coincide con la ingresada (V-12345678)" |
| Foto no coincide (nombre) | "El nombre de la foto (María González) no coincide con el esperado (Juan Pérez)" |
| Sin cédula anclada | "Primero debes anclar tu cédula en Mi Perfil" |

## ✨ Características Destacadas

1. **Anclaje al Guardar**: La cédula se ancla solo cuando el usuario hace clic en "Guardar"
2. **Deadline de 30 Días**: Tiempo suficiente para subir la foto
3. **Contador Visual**: Muestra días restantes en tab de Documentos
4. **Validación Doble**: Número (cedula.com.ve) + Foto (Didit)
5. **Bloqueo Selectivo**: Solo nombre y cédula bloqueados, otros campos editables
6. **Sin Código Obsoleto**: Limpieza completa de código no utilizado

## 🚀 Estado Final

✅ Cédula se ancla al hacer clic en "Guardar"
✅ Verificación de foto movida a tab "Documentos"
✅ Deadline de 30 días implementado
✅ Contador de días restantes
✅ Validación de cambios en cédula/nombre
✅ Código limpio sin obsoletos
✅ Error de guardado solucionado

**Estado**: ✅ COMPLETADO Y LISTO PARA PRODUCCIÓN
