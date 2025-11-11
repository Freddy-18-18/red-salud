# 🧪 Instrucciones de Prueba - Sistema de Templates y Autocompletado IA

## Preparación

### 1. Verificar que el servidor esté corriendo
```bash
npm run dev
```

### 2. Verificar variables de entorno
Asegúrate de que `.env.local` tenga:
```env
GEMINI_API_KEY=AIzaSyAt9v_eTe0-oFMEZa0A6pMiooZmy2dPajY
```

## Pruebas Paso a Paso

### Test 1: Marketplace de Templates ✅

**Objetivo:** Verificar que el marketplace funciona correctamente

1. Navega a: `http://localhost:3000/dashboard/medico/pacientes/nuevo`
2. Completa el Paso 1:
   - Cédula: `12345678`
   - Nombre: `Juan Pérez`
   - Género: Masculino
   - Fecha de nacimiento: `1990-01-01`
3. Click en "Continuar al Diagnóstico"
4. Click en botón "Templates" (debe tener badge "IA")

**Verificar:**
- ✅ Se abre modal del marketplace
- ✅ Se muestran 7 templates
- ✅ Hay barra de búsqueda
- ✅ Hay tabs de categorías (Todos, Favoritos, General, etc.)
- ✅ Cada template tiene:
  - Icono de color
  - Nombre y descripción
  - Tags
  - Badge "IA" si aplica
  - Botón de estrella (favoritos)
  - Botón "Vista Previa"
  - Botón "Usar"

### Test 2: Vista Previa de Template ✅

**Objetivo:** Verificar que la vista previa funciona sin scroll

1. En el marketplace, click en "Vista Previa" de "Consulta General"

**Verificar:**
- ✅ Se abre modal de vista previa
- ✅ Muestra el contenido completo del template
- ✅ Tiene scroll interno (no de página)
- ✅ Tiene botón "Cerrar"
- ✅ Tiene botón "Usar este Template"

2. Click en "Usar este Template"

**Verificar:**
- ✅ El modal se cierra
- ✅ El contenido del template aparece en el editor
- ✅ El cursor está en el editor

### Test 3: Sistema de Favoritos ✅

**Objetivo:** Verificar que los favoritos se guardan

1. En el marketplace, click en la estrella de "Consulta General"

**Verificar:**
- ✅ La estrella se llena de amarillo
- ✅ Se guarda en localStorage

2. Click en tab "Favoritos"

**Verificar:**
- ✅ Solo aparece "Consulta General"

3. Click en la estrella nuevamente

**Verificar:**
- ✅ La estrella se vacía
- ✅ Ya no aparece en "Favoritos"

### Test 4: Búsqueda de Templates ✅

**Objetivo:** Verificar que la búsqueda funciona

1. En el marketplace, escribe en la búsqueda: "emergencia"

**Verificar:**
- ✅ Solo aparece el template "Emergencia"

2. Escribe: "soap"

**Verificar:**
- ✅ Aparece "Consulta General" (tiene tag "soap")

3. Borra la búsqueda

**Verificar:**
- ✅ Vuelven a aparecer todos los templates

### Test 5: Autocompletado Local ✅

**Objetivo:** Verificar sugerencias locales instantáneas

1. En el editor de notas, escribe: `MOTIVO`

**Verificar:**
- ✅ Aparece sugerencia: "MOTIVO DE CONSULTA:"
- ✅ Aparece instantáneamente (< 50ms)

2. Presiona `Tab`

**Verificar:**
- ✅ Se completa a "MOTIVO DE CONSULTA:"
- ✅ El cursor queda al final

3. Escribe: `Paciente ref`

**Verificar:**
- ✅ Aparece sugerencia: "Paciente refiere"

4. Presiona `↓` para navegar

**Verificar:**
- ✅ La siguiente sugerencia se resalta

5. Presiona `Esc`

**Verificar:**
- ✅ Las sugerencias se cierran

### Test 6: Autocompletado con IA ✅

**Objetivo:** Verificar sugerencias inteligentes con IA

1. En el editor, escribe una frase más larga sin coincidencias locales:
   ```
   Paciente masculino de 45 años que acude por dolor
   ```

**Verificar:**
- ✅ Aparece indicador "Generando sugerencias con IA..."
- ✅ Después de 2-3 segundos aparecen sugerencias contextuales
- ✅ Las sugerencias son relevantes (ej: "dolor torácico", "dolor abdominal")

2. Presiona `Tab` para aplicar una sugerencia

**Verificar:**
- ✅ Se completa la frase
- ✅ El texto tiene sentido médico

### Test 7: Análisis IA de Nota ✅

**Objetivo:** Verificar que el análisis IA funciona

1. Escribe una nota médica completa (o usa un template)
2. Click en botón "IA RED-SALUD"

**Verificar:**
- ✅ Botón muestra "Analizando..." con spinner
- ✅ Después de 3-5 segundos se abre panel de recomendaciones
- ✅ Panel muestra:
  - Resumen
  - Recomendaciones (qué más preguntar)
  - Alertas (información faltante)
  - Diagnósticos sugeridos

3. Click en "X" para cerrar el panel

**Verificar:**
- ✅ El panel se cierra
- ✅ Los diagnósticos sugeridos se mantienen

### Test 8: Historial Clínico Colapsable ✅

**Objetivo:** Verificar que no hay scroll horizontal

1. En el workspace médico, observa el panel derecho (Historial Clínico)

**Verificar:**
- ✅ Panel está expandido por defecto
- ✅ Muestra "Sin historial" (primera consulta)

2. Click en el botón `>` (colapsar)

**Verificar:**
- ✅ El panel se colapsa a 48px de ancho
- ✅ Solo muestra icono de actividad
- ✅ NO hay scroll horizontal en la página

3. Click en el botón `<` (expandir)

**Verificar:**
- ✅ El panel se expande
- ✅ Animación suave

4. Si hay historial, verifica que textos largos:

**Verificar:**
- ✅ Se ajustan con `break-words`
- ✅ No generan scroll horizontal
- ✅ Se truncan apropiadamente

### Test 9: Búsqueda ICD-11 ✅

**Objetivo:** Verificar que la búsqueda de diagnósticos funciona

1. Click en tab "ICD-11"
2. Escribe en búsqueda: "gastritis"
3. Click en buscar

**Verificar:**
- ✅ Aparecen resultados de ICD-11
- ✅ Cada resultado tiene código y descripción
- ✅ Click en resultado lo agrega a diagnósticos

### Test 10: Guardar Paciente ✅

**Objetivo:** Verificar que todo se guarda correctamente

1. Completa toda la información:
   - Nota médica (con template o manual)
   - Diagnósticos (ICD-11 o sugeridos por IA)
   - Alergias (opcional)
   - Condiciones crónicas (opcional)
   - Medicamentos actuales (opcional)

2. Click en "Guardar"

**Verificar:**
- ✅ Botón muestra "Guardando..." con spinner
- ✅ Después de 1-2 segundos redirige
- ✅ Paciente aparece en lista de pacientes

## Tests de Rendimiento

### Test 11: Velocidad de Autocompletado

**Objetivo:** Medir tiempos de respuesta

1. Escribe rápidamente varias palabras
2. Observa el footer del editor

**Verificar:**
- ✅ Badge "Autocompletado IA" siempre visible
- ✅ Badge "IA activa" aparece solo cuando carga
- ✅ Sugerencias locales: < 50ms
- ✅ Sugerencias IA: 2-3 segundos

### Test 12: Carga del Marketplace

**Objetivo:** Verificar que carga rápido

1. Abre el marketplace
2. Mide tiempo de carga

**Verificar:**
- ✅ Carga en < 100ms
- ✅ No hay parpadeos
- ✅ Animaciones suaves

## Tests de Edge Cases

### Test 13: Sin Conexión a Internet

**Objetivo:** Verificar comportamiento offline

1. Desconecta internet
2. Intenta usar autocompletado IA

**Verificar:**
- ✅ Autocompletado local sigue funcionando
- ✅ IA muestra error apropiado
- ✅ No se rompe la aplicación

### Test 14: Texto Muy Largo

**Objetivo:** Verificar límites

1. Escribe o pega una nota muy larga (> 5000 caracteres)

**Verificar:**
- ✅ Editor maneja bien el texto
- ✅ Contador de caracteres actualiza
- ✅ Autocompletado sigue funcionando

### Test 15: Caracteres Especiales

**Objetivo:** Verificar sanitización

1. Escribe caracteres especiales: `<script>alert('test')</script>`

**Verificar:**
- ✅ Se guarda como texto plano
- ✅ No ejecuta código
- ✅ No rompe el layout

## Checklist Final

Antes de considerar las pruebas completas, verifica:

- [ ] Todos los tests 1-15 pasaron
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en consola del servidor
- [ ] No hay warnings de TypeScript
- [ ] La aplicación es responsive
- [ ] Los tiempos de respuesta son aceptables
- [ ] La UX es fluida y sin bugs visuales

## Reportar Bugs

Si encuentras algún bug, documenta:

1. **Qué estabas haciendo:** Pasos exactos
2. **Qué esperabas:** Comportamiento esperado
3. **Qué pasó:** Comportamiento actual
4. **Consola:** Errores en consola (si hay)
5. **Navegador:** Chrome/Firefox/Safari + versión
6. **Screenshot:** Si es visual

## Notas Adicionales

### Limpiar localStorage (si es necesario)
```javascript
// En consola del navegador
localStorage.clear();
```

### Ver favoritos guardados
```javascript
// En consola del navegador
console.log(localStorage.getItem('favorites_[USER_ID]'));
```

### Forzar recarga de templates
```javascript
// Refresca la página con Ctrl+Shift+R (hard reload)
```

## Conclusión

Si todos los tests pasan, el sistema está listo para:
- ✅ Uso en producción
- ✅ Testing con usuarios reales
- ✅ Implementación de features adicionales

---

**Última actualización:** 11 de noviembre de 2025
**Versión de prueba:** 1.0.0
