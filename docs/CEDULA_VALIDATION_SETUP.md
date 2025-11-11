# Configuración del Sistema de Validación de Cédula

## ✅ Implementación Completada

Se ha implementado exitosamente el sistema de validación automática de cédulas venezolanas usando la API de cedula.com.ve.

## 🎯 Funcionalidades

1. **Validación automática**: Al ingresar la cédula, el sistema valida automáticamente con la API
2. **Autocompletado**: El nombre completo se autocompleta con los datos oficiales
3. **Datos CNE**: Se guardan estado, municipio, parroquia y centro electoral
4. **Indicadores visuales**: Loading, success y error states
5. **Seguridad**: Solo el usuario puede actualizar su propio perfil

## 📁 Archivos Creados/Modificados

### API Routes
- ✅ `app/api/validate-cedula/route.ts` - Validación de cédula
- ✅ `app/api/profile/update/route.ts` - Actualización de perfil
- ✅ `app/api/profile/get/route.ts` - Obtención de perfil

### Componentes
- ✅ `components/dashboard/profile/tabs/profile-tab.tsx` - Campo de cédula con validación
- ✅ `components/dashboard/profile/user-profile-modal.tsx` - Modal con carga de datos
- ✅ `components/dashboard/profile/types.ts` - Tipos actualizados

### Base de Datos
- ✅ `supabase/migrations/20241108000001_add_cne_fields.sql` - Migración aplicada
- ✅ Campos CNE agregados a la tabla `profiles`

### Utilidades
- ✅ `lib/supabase/server.ts` - Cliente de Supabase para servidor

### Documentación
- ✅ `docs/CEDULA_VALIDATION.md` - Documentación completa del sistema

## 🚀 Cómo Probar

### 1. Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 2. Acceder al dashboard de paciente

1. Inicia sesión como paciente
2. Ve al dashboard
3. Haz clic en tu avatar o nombre para abrir el modal de perfil

### 3. Probar la validación de cédula

1. En el modal, haz clic en "Editar"
2. Ingresa una cédula en el formato: `V-12345678` o `E-12345678`
3. Haz clic fuera del campo (blur)
4. Observa:
   - Spinner de carga mientras valida
   - Checkmark verde si es válida
   - Error rojo si no es válida
   - El nombre se autocompleta automáticamente

### 4. Guardar los cambios

1. Completa los demás campos requeridos
2. Haz clic en "Guardar"
3. Los datos se guardan en Supabase incluyendo:
   - Nombre completo
   - Datos CNE
   - RIF
   - Cédula verificada = true

## 🔑 Credenciales API

Las credenciales están configuradas en el código:
- **APP-ID**: 1461
- **Access Token**: 96bc48c83b180e4529fe91c6700e98d3

## 📊 Campos en la Base de Datos

Nuevos campos en `profiles`:

```sql
- nacionalidad (V o E)
- rif
- primer_nombre
- segundo_nombre
- primer_apellido
- segundo_apellido
- cne_estado
- cne_municipio
- cne_parroquia
- cne_centro_electoral
- cedula_verificada (boolean)
```

## 🎨 Estados Visuales

El campo de cédula muestra:

1. **Idle** (gris): "Ingrese su cédula para validar automáticamente"
2. **Loading** (azul): Spinner animado
3. **Success** (verde): ✓ Cédula validada correctamente
4. **Error** (rojo): Mensaje de error específico

## 🔒 Seguridad

- ✅ Credenciales API en servidor (no expuestas al cliente)
- ✅ Autenticación requerida
- ✅ Usuarios solo pueden actualizar su propio perfil
- ✅ Registro de actividad en `user_activity_log`

## 📝 Ejemplo de Uso

```typescript
// El usuario ingresa: V-12345678
// El sistema automáticamente:
// 1. Valida el formato
// 2. Consulta la API
// 3. Autocompleta: "Juan Carlos Pérez González"
// 4. Guarda datos CNE: Miranda, Chacao, etc.
// 5. Marca cedula_verificada = true
```

## ⚠️ Notas Importantes

1. **Formato de cédula**: Debe ser `V-XXXXXXXX` o `E-XXXXXXXX`
2. **Solo números**: La API solo acepta dígitos en el número de cédula
3. **Validación automática**: Se dispara al salir del campo (onBlur)
4. **Datos obligatorios**: Cédula, nombre, teléfono, dirección, ciudad y estado

## 🐛 Solución de Problemas

### Error: "No se encuentra el módulo @/lib/supabase/server"

Este es un error temporal de TypeScript. Soluciones:

1. Reinicia el servidor de desarrollo
2. Reinicia el servidor de TypeScript en tu IDE
3. Ejecuta: `npm run build` para verificar que compila

### Error: "Cédula no encontrada"

- Verifica que la cédula exista en el sistema del CNE
- Asegúrate de usar el formato correcto: V-12345678

### Error: "Error al conectar con el servicio"

- Verifica tu conexión a internet
- Verifica que la API de cedula.com.ve esté disponible

## 📚 Documentación Adicional

Ver `docs/CEDULA_VALIDATION.md` para documentación técnica completa.

## ✨ Próximas Mejoras

1. Caché de validaciones
2. Rate limiting
3. Validación en registro
4. Detección de duplicados
