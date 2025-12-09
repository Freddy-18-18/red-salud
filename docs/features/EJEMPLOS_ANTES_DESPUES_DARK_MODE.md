# 🎨 Ejemplos Antes/Después - Dark Mode

Este documento muestra ejemplos concretos de cómo convertir código sin dark mode a código con dark mode.

---

## 📄 Ejemplo 1: Hero Section

### ❌ ANTES (Sin dark mode)
```tsx
<section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-24 overflow-hidden">
  <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="max-w-3xl">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
        Tu salud, a un clic de distancia
      </h1>
      <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
        Consultas médicas en línea con profesionales certificados.
      </p>
    </div>
  </div>
</section>
```

### ✅ DESPUÉS (Con dark mode)
```tsx
<section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-24 overflow-hidden">
  {/* ✅ Los gradientes oscuros NO necesitan dark: porque ya son oscuros */}
  <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="max-w-3xl">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
        {/* ✅ text-white NO necesita dark: porque ya es blanco */}
        Tu salud, a un clic de distancia
      </h1>
      <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
        {/* ✅ text-blue-100 NO necesita dark: porque ya es claro sobre fondo oscuro */}
        Consultas médicas en línea con profesionales certificados.
      </p>
    </div>
  </div>
</section>
```

**Nota:** Las secciones hero con gradientes oscuros generalmente NO necesitan cambios.

---

## 📄 Ejemplo 2: Features Grid

### ❌ ANTES (Sin dark mode)
```tsx
<section className="py-20 bg-gray-50">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Todo lo que necesitas para cuidar tu salud
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Una plataforma completa diseñada para facilitarte el acceso
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
          <Video className="h-7 w-7 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Videoconsultas
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Conecta con médicos certificados desde tu hogar
        </p>
      </div>
    </div>
  </div>
</section>
```

### ✅ DESPUÉS (Con dark mode)
```tsx
<section className="py-20 bg-gray-50 dark:bg-gray-900">
  {/* ✅ Agregado dark:bg-gray-900 */}
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {/* ✅ Agregado dark:text-white */}
        Todo lo que necesitas para cuidar tu salud
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        {/* ✅ Agregado dark:text-gray-300 */}
        Una plataforma completa diseñada para facilitarte el acceso
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        {/* ✅ Agregado dark:bg-gray-800 y dark:border-gray-700 */}
        <div className="bg-blue-100 dark:bg-blue-900 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
          {/* ✅ Agregado dark:bg-blue-900 */}
          <Video className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          {/* ✅ Agregado dark:text-blue-400 */}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {/* ✅ Agregado dark:text-white */}
          Videoconsultas
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {/* ✅ Agregado dark:text-gray-300 */}
          Conecta con médicos certificados desde tu hogar
        </p>
      </div>
    </div>
  </div>
</section>
```

---

## 📄 Ejemplo 3: Benefits Section

### ❌ ANTES (Sin dark mode)
```tsx
<section className="py-20 bg-white">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Beneficios exclusivos para ti
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Únete a miles de pacientes que ya están disfrutando
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
            <span className="text-gray-700 text-lg">
              Sin tiempos de espera prolongados
            </span>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="aspect-square rounded-2xl bg-linear-to-br from-blue-100 to-teal-100 p-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">24/7</div>
            <p className="text-xl text-gray-700">Atención disponible</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### ✅ DESPUÉS (Con dark mode)
```tsx
<section className="py-20 bg-white dark:bg-background">
  {/* ✅ Agregado dark:bg-background */}
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          {/* ✅ Agregado dark:text-white */}
          Beneficios exclusivos para ti
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {/* ✅ Agregado dark:text-gray-300 */}
          Únete a miles de pacientes que ya están disfrutando
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
            {/* ✅ Los colores brillantes como green-500 generalmente NO necesitan dark: */}
            <span className="text-gray-700 dark:text-gray-300 text-lg">
              {/* ✅ Agregado dark:text-gray-300 */}
              Sin tiempos de espera prolongados
            </span>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="aspect-square rounded-2xl bg-linear-to-br from-blue-100 to-teal-100 dark:from-blue-950 dark:to-teal-950 p-8">
          {/* ✅ Agregado dark:from-blue-950 dark:to-teal-950 */}
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</div>
            {/* ✅ Agregado dark:text-blue-400 */}
            <p className="text-xl text-gray-700 dark:text-gray-300">Atención disponible</p>
            {/* ✅ Agregado dark:text-gray-300 */}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 📄 Ejemplo 4: Testimonials

### ❌ ANTES (Sin dark mode)
```tsx
<section className="py-20 bg-gray-50">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Lo que dicen nuestros pacientes
      </h2>
    </div>
    
    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex gap-1 mb-4">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        </div>
        <p className="text-gray-700 mb-6 leading-relaxed italic">
          "Increíble servicio. Pude consultar con un cardiólogo..."
        </p>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">MG</span>
          </div>
          <div>
            <div className="font-bold text-gray-900">María González</div>
            <div className="text-sm text-gray-500">Caracas</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### ✅ DESPUÉS (Con dark mode)
```tsx
<section className="py-20 bg-gray-50 dark:bg-gray-900">
  {/* ✅ Agregado dark:bg-gray-900 */}
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {/* ✅ Agregado dark:text-white */}
        Lo que dicen nuestros pacientes
      </h2>
    </div>
    
    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        {/* ✅ Agregado dark:bg-gray-800 y dark:border-gray-700 */}
        <div className="flex gap-1 mb-4">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          {/* ✅ Los colores brillantes como yellow-400 NO necesitan dark: */}
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
          {/* ✅ Agregado dark:text-gray-300 */}
          "Increíble servicio. Pude consultar con un cardiólogo..."
        </p>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center">
            {/* ✅ Agregado dark:bg-blue-900 */}
            <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">MG</span>
            {/* ✅ Agregado dark:text-blue-400 */}
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">María González</div>
            {/* ✅ Agregado dark:text-white */}
            <div className="text-sm text-gray-500 dark:text-gray-400">Caracas</div>
            {/* ✅ Agregado dark:text-gray-400 */}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 📄 Ejemplo 5: FAQ Section

### ❌ ANTES (Sin dark mode)
```tsx
<section className="py-20 bg-white">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Preguntas frecuentes
      </h2>
    </div>
    
    <div className="max-w-3xl mx-auto">
      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem 
          value="item-1"
          className="bg-gray-50 border border-gray-200 rounded-xl px-6"
        >
          <AccordionTrigger className="text-left text-lg font-semibold text-gray-900">
            ¿Cómo funciona una videoconsulta?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 leading-relaxed pt-2">
            Una videoconsulta es una cita médica virtual...
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
</section>
```

### ✅ DESPUÉS (Con dark mode)
```tsx
<section className="py-20 bg-white dark:bg-background">
  {/* ✅ Agregado dark:bg-background */}
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {/* ✅ Agregado dark:text-white */}
        Preguntas frecuentes
      </h2>
    </div>
    
    <div className="max-w-3xl mx-auto">
      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem 
          value="item-1"
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6"
        >
          {/* ✅ Agregado dark:bg-gray-800 y dark:border-gray-700 */}
          <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 dark:text-white">
            {/* ✅ Agregado dark:text-white */}
            ¿Cómo funciona una videoconsulta?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed pt-2">
            {/* ✅ Agregado dark:text-gray-300 */}
            Una videoconsulta es una cita médica virtual...
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
</section>
```

---

## 📄 Ejemplo 6: CTA Section

### ❌ ANTES (Sin dark mode)
```tsx
<section className="py-20 bg-gradient-to-br from-blue-600 to-teal-600 text-white">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-4xl md:text-5xl font-bold mb-6">
      ¿Listo para comenzar?
    </h2>
    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
      Regístrate hoy y obtén tu primera consulta con descuento
    </p>
    <Button 
      size="lg" 
      className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
    >
      Crear Cuenta Gratis
    </Button>
  </div>
</section>
```

### ✅ DESPUÉS (Con dark mode)
```tsx
<section className="py-20 bg-gradient-to-br from-blue-600 to-teal-600 text-white">
  {/* ✅ Los gradientes oscuros NO necesitan dark: */}
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-4xl md:text-5xl font-bold mb-6">
      {/* ✅ text-white NO necesita dark: */}
      ¿Listo para comenzar?
    </h2>
    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
      {/* ✅ text-blue-100 NO necesita dark: */}
      Regístrate hoy y obtén tu primera consulta con descuento
    </p>
    <Button 
      size="lg" 
      className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
    >
      {/* ✅ Los botones con bg-white sobre fondo oscuro NO necesitan dark: */}
      Crear Cuenta Gratis
    </Button>
  </div>
</section>
```

**Nota:** Las secciones CTA con gradientes oscuros generalmente NO necesitan cambios.

---

## 🎨 Tabla de Referencia Rápida

| Elemento | Clase Original | Agregar Dark Mode |
|----------|---------------|-------------------|
| **Fondos de Sección** |
| Fondo claro | `bg-white` | `dark:bg-background` |
| Fondo gris claro | `bg-gray-50` | `dark:bg-gray-900` |
| Fondo gris medio | `bg-gray-100` | `dark:bg-gray-800` |
| **Cards y Contenedores** |
| Card blanco | `bg-white` | `dark:bg-gray-800` |
| Card gris | `bg-gray-50` | `dark:bg-gray-800` |
| **Títulos** |
| Título principal | `text-gray-900` | `dark:text-white` |
| Título secundario | `text-gray-800` | `dark:text-gray-100` |
| **Textos** |
| Texto principal | `text-gray-700` | `dark:text-gray-300` |
| Texto secundario | `text-gray-600` | `dark:text-gray-400` |
| Texto terciario | `text-gray-500` | `dark:text-gray-500` (sin cambio) |
| **Bordes** |
| Borde claro | `border-gray-100` | `dark:border-gray-700` |
| Borde medio | `border-gray-200` | `dark:border-gray-700` |
| Borde oscuro | `border-gray-300` | `dark:border-gray-600` |
| **Gradientes** |
| Gradiente claro | `from-blue-100 to-teal-100` | `dark:from-blue-900 dark:to-teal-900` |
| Gradiente medio | `from-blue-200 to-teal-200` | `dark:from-blue-800 dark:to-teal-800` |
| **Iconos** |
| Icono azul | `text-blue-600` | `dark:text-blue-400` |
| Icono teal | `text-teal-600` | `dark:text-teal-400` |
| Icono purple | `text-purple-600` | `dark:text-purple-400` |
| **Colores Brillantes** (generalmente NO necesitan dark:) |
| Verde | `text-green-500` | (sin cambio) |
| Amarillo | `text-yellow-400` | (sin cambio) |
| Rojo | `text-red-500` | (sin cambio) |

---

## 🚫 Elementos que NO necesitan dark:

1. **Gradientes oscuros** (from-blue-600, to-teal-600, etc.)
2. **Texto blanco** (text-white)
3. **Colores brillantes** (green-500, yellow-400, red-500)
4. **Fondos oscuros** (bg-gray-900, bg-black)
5. **Secciones hero con gradientes oscuros**
6. **Botones blancos sobre fondos oscuros**

---

## ✅ Workflow de Conversión

### Paso 1: Identificar elementos
```bash
# Buscar elementos que necesitan dark mode
grep -n "bg-white\|bg-gray-50\|text-gray-900" archivo.tsx
```

### Paso 2: Agregar clases dark:
- Fondos: `dark:bg-*`
- Textos: `dark:text-*`
- Bordes: `dark:border-*`

### Paso 3: Verificar
- Abrir en navegador
- Cambiar a modo oscuro
- Verificar legibilidad

### Paso 4: Ajustar si es necesario
- Si algo se ve mal, ajustar el color
- Usar la tabla de referencia

---

## 🎯 Resultado Final

### Antes:
```
Modo Claro: ✅ Se ve bien
Modo Oscuro: ❌ Fondo blanco, texto negro (mal)
```

### Después:
```
Modo Claro: ✅ Se ve bien
Modo Oscuro: ✅ Fondo oscuro, texto claro (bien)
```

---

## 💡 Tips Finales

1. **Usa `/servicios/medicos` como referencia** - Es la única página que funciona correctamente
2. **Copia el patrón** - No inventes, usa lo que ya funciona
3. **Prueba constantemente** - Cambia entre modos mientras trabajas
4. **Sé consistente** - Usa los mismos colores en todas las páginas
5. **No te compliques** - Si algo ya es oscuro, no necesita dark:

---

¡Listo! Con estos ejemplos puedes convertir cualquier página a dark mode. 🚀
