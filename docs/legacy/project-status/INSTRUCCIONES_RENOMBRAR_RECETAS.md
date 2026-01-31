# Instrucciones para Renombrar Carpetas: "recetas" → "recipes"

## ⚠️ IMPORTANTE - LEE PRIMERO

He actualizado todos los **textos visibles** en la interfaz de usuario de "Receta" a "Recipe". Sin embargo, las carpetas físicas NO pudieron renombrarse automáticamente debido a permisos de archivos abiertos en VS Code.

**Debes renombrar las carpetas MANUALMENTE** siguiendo estas instrucciones:

---

## 📋 PASO 1: Cerrar VS Code

**CRITICAL**: Cierra completamente VS Code antes de renombrar las carpetas para evitar conflictos de permisos.

---

## 📁 PASO 2: Renombrar Carpetas usando Explorador de Windows

### Carpeta 1: Médico - Recetas
**Ruta actual**: `C:\Users\Fredd\Dev\red-salud\app\dashboard\medico\recetas\`
**Renombrar a**: `recipes`

1. Abre el Explorador de Windows
2. Navega a: `C:\Users\Fredd\Dev\red-salud\app\dashboard\medico\`
3. Haz clic derecho en la carpeta `recetas`
4. Selecciona "Renombrar"
5. Cambia el nombre a: `recipes`
6. Presiona Enter

### Carpeta 2: Componentes - Recetas
**Ruta actual**: `C:\Users\Fredd\Dev\red-salud\components\dashboard\medico\recetas\`
**Renombrar a**: `recipes`

1. En el Explorador, navega a: `C:\Users\Fredd\Dev\red-salud\components\dashboard\medico\`
2. Haz clic derecho en la carpeta `recetas`
3. Selecciona "Renombrar"
4. Cambia el nombre a: `recipes`
5. Presiona Enter

### Carpetas 3 y 4: Paciente (si existen)

Si existen estas carpetas, también renómbralas:
- `C:\Users\Fredd\Dev\red-salud\app\dashboard\paciente\telemedicina\recetas\` → `recipes`
- `C:\Users\Fredd\Dev\red-salud\app\dashboard\paciente\medicamentos\recetas\` → `recipes`

---

## 📝 PASO 3: Reabrir VS Code

Una vez renombradas todas las carpetas:

1. Abre VS Code nuevamente
2. Abre el proyecto: `C:\Users\Fredd\Dev\red-salud`

---

## ✅ PASO 4: Verificar Cambios

### Verificar que no haya errores:

1. Abre la terminal integrada de VS Code (Ctrl + Ñ)
2. Ejecuta: `npm run dev`
3. Verifica que no haya errores de importación

### Probar la aplicación:

1. Navega a: `http://localhost:3000/dashboard/medico`
2. Verifica que el menú lateral diga "Recipes" (no "Recetas")
3. Haz clic en "Recipes"
4. Verifica que la página cargue correctamente

---

## 📊 Cambios Realizados Automáticamente

He actualizado los siguientes archivos **automáticamente**:

### ✅ Menú Lateral
- `components/dashboard/layout/dashboard-layout-client.tsx`
  - Cambiado: `"Recetas"` → `"Recipes"`
  - Cambiado: `/dashboard/medico/recetas` → `/dashboard/medico/recipes`

### ✅ Páginas del Médico
- `app/dashboard/medico/recetas/nueva/page.tsx`
  - "Nueva Receta Médica" → "Nueva Recipe Médica"
  - "Emite una nueva receta" → "Emite una nueva recipe"
  - "Escanear Receta" → "Escanear Recipe"
  - "Receta Rápida" → "Recipe Rápida"
  - Todas las rutas actualizadas

- `app/dashboard/medico/recetas/page.tsx`
  - "Recetas Médicas" → "Recipes Médicas"
  - "Nueva Receta" → "Nueva Recipe"
  - "No hay recetas registradas" → "No hay recipes registradas"
  - "Las recetas que emitas aparecerán aquí" → "Las recipes que emitas aparecerán aquí"

### ✅ Componentes del Médico
- `components/dashboard/medico/features/patient-quick-actions.tsx`
  - "Crear Receta" → "Crear Recipe"
  - Ruta actualizada

- `components/dashboard/medico/features/verification-guard.tsx`
  - Referencias a "receta" → "recipe"

- `components/dashboard/medico/dashboard/widgets/quick-actions-widget.tsx`
  - Referencias actualizadas

- `components/dashboard/medico/estadisticas/tabs/laboratorio-tab.tsx`
  - Referencias actualizadas

- `components/dashboard/profile/doctor/user-profile-modal-doctor.tsx`
  - Referencias actualizadas

### ✅ Páginas del Paciente
- `app/dashboard/paciente/medicamentos/page.tsx`
  - "recetas" → "recipes"

- `app/dashboard/paciente/telemedicina/recipes/page.tsx`
  - Referencias actualizadas

- `app/dashboard/farmacia/page.tsx`
  - Referencias actualizadas

---

## 🔍 Qué NO se cambió

### Base de Datos
- Las tablas de BD **NO** se renombraron (por compatibilidad):
  - `farmacia_recetas` - Se mantiene igual
  - `prescription_templates` - Se mantiene igual

### Comentarios de Código
- Los comentarios en el código pueden seguir diciendo "receta"
- Esto es aceptable y no afecta la UI

---

## 🎯 Resultado Esperado

Después de renombrar las carpetas manualmente:

1. **Menú Lateral**: Debe decir "Recipes" ✅
2. **Navegación**: Todas las rutas deben funcionar ✅
3. **Textos**: Todos los textos visibles dicen "Recipe" ✅
4. **Base de Datos**: Tablas mantienen su nombre original ✅

---

## 💡 Si Tienes Problemas

### Error: "Module not found"

Si después de renombrar ves errores de importación:

1. Busca archivos que todavía importen de `recetas`:
```bash
grep -r "from.*recetas" app/dashboard/medico/
grep -r "from.*recetas" components/dashboard/medico/
```

2. Actualiza manualmente las rutas de importación

### Error: "Cannot find module"

Si Git está causando problemas:

```bash
git mv app/dashboard/medico/recetas app/dashboard/medico/recipes
git mv components/dashboard/medico/recetas components/dashboard/medico/recipes
```

---

## ✨ Resumen

- **Textos UI**: ✅ Actualizados automáticamente (Receta → Recipe)
- **Rutas en código**: ✅ Actualizadas automáticamente (/recetas → /recipes)
- **Carpetas físicas**: ⚠️ **DEBES RENOMBRARLAS MANUALMENTE**

Sigue los pasos del 1 al 4 y todo funcionará correctamente.

---

## 📞 ¿Necesitas Ayuda?

Si tienes algún problema después de renombrar las carpetas, avísame y te ayudaré a resolverlo.
