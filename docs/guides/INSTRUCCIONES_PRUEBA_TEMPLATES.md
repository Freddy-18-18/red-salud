# 🧪 Instrucciones de Prueba - Sistema de Templates

## 🎯 Objetivo de las Pruebas

Verificar que el sistema de templates estructurados funciona correctamente en todos sus aspectos.

## 📋 Checklist de Pruebas

### 1. Pruebas del Marketplace

#### 1.1 Apertura del Modal
- [ ] El modal se abre correctamente
- [ ] El modal tiene el tamaño correcto (grande, 95vw)
- [ ] El modal es responsive en diferentes tamaños de pantalla
- [ ] El botón de cerrar (X) funciona

#### 1.2 Visualización de Templates
- [ ] Se muestran todos los templates del sistema
- [ ] Los templates se muestran en un grid de 3 columnas (desktop)
- [ ] Los templates se muestran en un grid de 2 columnas (tablet)
- [ ] Los templates se muestran en un grid de 1 columna (mobile)
- [ ] Cada tarjeta muestra: icono, nombre, descripción, número de campos
- [ ] Los iconos se muestran correctamente con sus colores

#### 1.3 Búsqueda
- [ ] La búsqueda funciona en tiempo real
- [ ] Se puede buscar por nombre del template
- [ ] Se puede buscar por descripción
- [ ] Se puede buscar por tags
- [ ] Se puede buscar por especialidad
- [ ] La búsqueda es case-insensitive
- [ ] Muestra mensaje cuando no hay resultados

#### 1.4 Filtros por Categoría
- [ ] El filtro "Todos" muestra todos los templates
- [ ] El filtro "General" muestra solo templates generales
- [ ] El filtro "Especialidad" muestra solo templates de especialidad
- [ ] El filtro "Emergencia" muestra solo templates de emergencia
- [ ] El filtro "Control" muestra solo templates de control
- [ ] El filtro "Pediatría" muestra solo templates pediátricos
- [ ] El filtro "Ginecología" muestra solo templates ginecológicos
- [ ] El filtro "Quirúrgico" muestra solo templates quirúrgicos
- [ ] El filtro "Personalizados" muestra solo templates custom
- [ ] El contador de templates se actualiza según el filtro

#### 1.5 Vista Previa
- [ ] El botón "Vista Previa" abre un modal secundario
- [ ] El modal de vista previa muestra todos los campos del template
- [ ] Se muestran los badges de "Requerido" en campos obligatorios
- [ ] Se muestran los badges de tipo de campo
- [ ] Se muestran los placeholders de cada campo
- [ ] El botón "Cerrar" funciona
- [ ] El botón "Usar este Template" funciona

#### 1.6 Usar Template
- [ ] El botón "Usar" aplica el template correctamente
- [ ] Los campos se cargan en el editor estructurado
- [ ] Los campos requeridos están marcados
- [ ] Los placeholders se muestran
- [ ] El modal se cierra después de usar el template

### 2. Pruebas del Creador de Templates

#### 2.1 Apertura del Creador
- [ ] El botón "Crear Template" abre el creador
- [ ] El modal del creador tiene el tamaño correcto
- [ ] Se muestran los dos paneles (configuración y vista previa)
- [ ] Los campos están vacíos al abrir

#### 2.2 Configuración del Template
- [ ] Se puede escribir el nombre del template
- [ ] Se puede escribir la descripción
- [ ] Se puede seleccionar la categoría
- [ ] Se pueden agregar tags separados por comas
- [ ] Los campos de configuración validan correctamente

#### 2.3 Creación de Campos
- [ ] Se puede escribir el nombre del campo
- [ ] Se puede seleccionar el tipo de campo (textarea, input, vitals, medications)
- [ ] Se puede escribir un placeholder
- [ ] Se puede configurar el número de filas (para textarea)
- [ ] Se puede marcar como requerido
- [ ] El botón "Agregar Campo" está deshabilitado si falta el nombre
- [ ] El botón "Agregar Campo" agrega el campo a la lista

#### 2.4 Gestión de Campos
- [ ] Los campos agregados aparecen en la vista previa
- [ ] Se puede reordenar campos con los botones arriba/abajo
- [ ] El botón arriba está deshabilitado en el primer campo
- [ ] El botón abajo está deshabilitado en el último campo
- [ ] Se puede eliminar un campo con el botón de basura
- [ ] El contador de campos se actualiza correctamente

#### 2.5 Vista Previa en Tiempo Real
- [ ] La vista previa se actualiza al agregar campos
- [ ] La vista previa muestra el nombre del campo
- [ ] La vista previa muestra el badge "Requerido" si aplica
- [ ] La vista previa muestra el tipo de campo
- [ ] La vista previa muestra el placeholder si existe

#### 2.6 Guardado del Template
- [ ] El botón "Guardar Template" está deshabilitado si falta el nombre
- [ ] El botón "Guardar Template" está deshabilitado si no hay campos
- [ ] El botón "Guardar Template" guarda el template
- [ ] El template aparece en el marketplace después de guardar
- [ ] El template tiene el badge "Personalizado"
- [ ] El template se guarda en localStorage
- [ ] El modal se cierra después de guardar

#### 2.7 Limpiar Formulario
- [ ] El botón "Limpiar" limpia todos los campos
- [ ] El botón "Limpiar" limpia la lista de campos
- [ ] El botón "Limpiar" resetea la vista previa

### 3. Pruebas de Persistencia

#### 3.1 LocalStorage
- [ ] Los templates personalizados se guardan en localStorage
- [ ] Los templates personalizados se cargan al abrir el marketplace
- [ ] Los templates personalizados persisten después de recargar la página
- [ ] Los templates personalizados persisten después de cerrar el navegador

#### 3.2 Sincronización
- [ ] Los templates del sistema y personalizados se muestran juntos
- [ ] Los templates personalizados se pueden filtrar
- [ ] Los templates personalizados se pueden buscar
- [ ] Los templates personalizados se pueden usar

### 4. Pruebas de Responsive Design

#### 4.1 Desktop (>1400px)
- [ ] El modal ocupa 95vw o 1400px máximo
- [ ] El grid muestra 3 columnas
- [ ] Los botones son visibles y accesibles
- [ ] El texto es legible

#### 4.2 Laptop (1024px-1400px)
- [ ] El modal se adapta al tamaño de pantalla
- [ ] El grid muestra 2-3 columnas
- [ ] Los botones son visibles y accesibles
- [ ] El texto es legible

#### 4.3 Tablet (768px-1024px)
- [ ] El modal se adapta al tamaño de pantalla
- [ ] El grid muestra 2 columnas
- [ ] Los botones son visibles y accesibles
- [ ] El texto es legible

#### 4.4 Mobile (<768px)
- [ ] El modal se adapta al tamaño de pantalla
- [ ] El grid muestra 1 columna
- [ ] Los botones son visibles y accesibles
- [ ] El texto es legible
- [ ] El creador de templates se adapta (paneles apilados)

### 5. Pruebas de Usabilidad

#### 5.1 Navegación
- [ ] La navegación entre modales es fluida
- [ ] Los botones tienen feedback visual al hacer hover
- [ ] Los botones tienen feedback visual al hacer click
- [ ] Los modales se pueden cerrar con ESC
- [ ] Los modales se pueden cerrar haciendo click fuera

#### 5.2 Feedback Visual
- [ ] Los campos requeridos tienen indicador visual
- [ ] Los templates personalizados tienen badge distintivo
- [ ] Los botones deshabilitados tienen estilo diferente
- [ ] Los estados de hover son claros
- [ ] Los estados de focus son claros

#### 5.3 Mensajes
- [ ] Mensaje cuando no hay templates en búsqueda
- [ ] Mensaje cuando no hay campos en vista previa
- [ ] Contador de templates actualizado
- [ ] Contador de campos actualizado

### 6. Pruebas de Rendimiento

#### 6.1 Carga Inicial
- [ ] El marketplace carga rápidamente
- [ ] Los 50+ templates se cargan sin lag
- [ ] Las imágenes/iconos cargan correctamente

#### 6.2 Búsqueda
- [ ] La búsqueda es instantánea
- [ ] No hay lag al escribir en el campo de búsqueda
- [ ] Los resultados se actualizan suavemente

#### 6.3 Filtros
- [ ] Los filtros cambian instantáneamente
- [ ] No hay lag al cambiar de categoría
- [ ] La transición es suave

### 7. Pruebas de Integración

#### 7.1 Con Editor Estructurado
- [ ] Los templates se aplican correctamente al editor
- [ ] Los campos se cargan en el orden correcto
- [ ] Los campos requeridos están marcados
- [ ] Los placeholders se muestran

#### 7.2 Con Sistema de Consultas
- [ ] Los templates funcionan en el flujo de consulta
- [ ] Los datos se guardan correctamente
- [ ] Los templates se pueden cambiar durante la consulta

## 🐛 Casos de Prueba Específicos

### Caso 1: Crear Template Personalizado Simple
```
1. Abrir marketplace
2. Click en "Crear Template"
3. Nombre: "Test Simple"
4. Descripción: "Template de prueba"
5. Agregar campo: "MOTIVO" (textarea, requerido)
6. Agregar campo: "DIAGNÓSTICO" (input, requerido)
7. Click en "Guardar Template"
8. Verificar que aparece en "Personalizados"
9. Usar el template
10. Verificar que los campos se cargan correctamente
```

### Caso 2: Buscar Template por Especialidad
```
1. Abrir marketplace
2. Escribir "cardiología" en búsqueda
3. Verificar que aparecen templates de cardiología
4. Limpiar búsqueda
5. Escribir "pediatría"
6. Verificar que aparecen templates pediátricos
```

### Caso 3: Filtrar por Categoría
```
1. Abrir marketplace
2. Click en "Emergencia"
3. Verificar que solo aparecen templates de emergencia
4. Click en "Control"
5. Verificar que solo aparecen templates de control
6. Click en "Todos"
7. Verificar que aparecen todos los templates
```

### Caso 4: Vista Previa de Template
```
1. Abrir marketplace
2. Seleccionar "Consulta General Completa"
3. Click en "Vista Previa"
4. Verificar que se muestran todos los 15 campos
5. Verificar badges de "Requerido"
6. Click en "Usar este Template"
7. Verificar que se aplica correctamente
```

### Caso 5: Reordenar Campos en Template Personalizado
```
1. Abrir creador de templates
2. Agregar 3 campos
3. Verificar orden inicial
4. Mover el tercer campo arriba
5. Verificar nuevo orden
6. Mover el primer campo abajo
7. Verificar nuevo orden
8. Guardar template
9. Verificar que el orden se mantiene
```

## 📊 Criterios de Aceptación

### Funcionalidad
- ✅ Todas las funciones principales funcionan
- ✅ No hay errores en consola
- ✅ No hay warnings de TypeScript
- ✅ Los datos se persisten correctamente

### Usabilidad
- ✅ La interfaz es intuitiva
- ✅ Los botones son claros
- ✅ El feedback visual es adecuado
- ✅ La navegación es fluida

### Rendimiento
- ✅ Carga rápida (<2 segundos)
- ✅ Búsqueda instantánea
- ✅ Sin lag en interacciones

### Responsive
- ✅ Funciona en desktop
- ✅ Funciona en tablet
- ✅ Funciona en mobile
- ✅ Se adapta correctamente

## 🎯 Resultado Esperado

Al completar todas las pruebas, el sistema debe:
1. Funcionar sin errores
2. Ser intuitivo y fácil de usar
3. Responder rápidamente
4. Adaptarse a diferentes pantallas
5. Persistir datos correctamente

## 📝 Reporte de Bugs

Si encuentras algún bug, documenta:
- **Descripción**: ¿Qué pasó?
- **Pasos para reproducir**: ¿Cómo llegaste ahí?
- **Resultado esperado**: ¿Qué debería pasar?
- **Resultado actual**: ¿Qué pasó realmente?
- **Navegador/Dispositivo**: ¿Dónde ocurrió?
- **Screenshots**: Si es posible

## ✅ Checklist Final

- [ ] Todas las pruebas del marketplace pasaron
- [ ] Todas las pruebas del creador pasaron
- [ ] Todas las pruebas de persistencia pasaron
- [ ] Todas las pruebas de responsive pasaron
- [ ] Todas las pruebas de usabilidad pasaron
- [ ] Todas las pruebas de rendimiento pasaron
- [ ] Todas las pruebas de integración pasaron
- [ ] Todos los casos de prueba específicos pasaron
- [ ] No hay bugs críticos
- [ ] No hay bugs de alta prioridad

## 🎉 ¡Sistema Listo para Producción!

Una vez completadas todas las pruebas exitosamente, el sistema está listo para ser usado en producción.
