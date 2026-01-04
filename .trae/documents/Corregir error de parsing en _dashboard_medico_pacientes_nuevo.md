## Objetivo

Resolver el build error "Parsing ecmascript source code failed" en `app/dashboard/medico/pacientes/nuevo/page.tsx:519` asegurando sintaxis válida de TSX/JSX y manteniendo la funcionalidad intacta.

## Causa probable

* El compilador reporta un `}` inesperado en la línea 519. Esto suele ocurrir cuando:

  * Hay un carácter oculto/UTF-8 no imprimible cercano al cierre del bloque `if`.

  * Existe un desequilibrio previo en JSX (etiqueta o expresión sin cerrar), que hace que el parser espere `}` en contexto de JSX en lugar de código.

* Revisión inicial del archivo muestra estructura y cierres bien balanceados, por lo que el caso más probable es un carácter invisible/formatting o una sensibilidad del parser en el patrón `if (...) { return ( ... ); }` seguido de otro `return ( ... )`.

## Cambios propuestos

1. Reescritura del retorno para evitar el cierre del bloque en 519:

   * Reemplazar el `if (currentStep === 1) { return (...) }` por un único `return currentStep === 1 ? (...) : (...)`.

   * Beneficios: elimina el `}` señalado, reduce riesgo de parsing en Turbopack, mejora legibilidad.
2. Normalizar el archivo:

   * Reguardar como UTF-8 sin BOM.

   * Formatear con Prettier para eliminar caracteres invisibles/espacios raros.
3. Limpieza menor:

   * Eliminar `useRef` importado y no usado para mantener orden, aunque no afecta el parsing.

## Verificaciones

* Compilar el proyecto (dev/build) y confirmar que la página `/dashboard/medico/pacientes/nuevo` carga sin errores.

* Navegar ambos casos del ternario:

  * `currentStep === 1`: verifica formulario, validación de cédula (CNE), cálculo de edad y navegación a paso 2.

  * `currentStep !== 1`: render de `MedicalWorkspace` con props (`paciente`, `alergias`, `diagnosticos`, `onSave`, etc.).

* Confirmar que no hubo cambios funcionales (solo refactor de retorno y limpieza).

## Riesgos y mitigación

* Si el error proviene de un carácter invisible, el refactor + formateo lo elimina.

* Si existiera un JSX sin cerrar en otra parte, el ternario lo haría más evidente; de persistir, se revisa y corrige el bloque afectado.

## Preguntas

* ¿Prefieres mantener el patrón con `if` y `return` explícito o adoptar el ternario por legibilidad y menor fricción con Turbopack?

  Respondo a tu pregunta: Vamos a adoptar el ternario por legibilidad y menor friccion para Turbopack 

* ¿Deseas que habilitemos/especifiquemos reglas de Prettier/ESLint para prevenir caracteres invisibles y detectar imports no usados?

  Respondo a tu pregunta: Si vamos a habilitar reglas de Prettier/ESLint que sea completas 

## Recomendación técnica

Usar el ternario para el render condicional en componentes cliente: además de ser idiomático en React, reduce puntos de fallo del parser en Turbopack. Complementarlo con formateo automático (Prettier) y reglas ESLint evita futuros incidentes similares.
