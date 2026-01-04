---
trigger: always_on
---

# Reglas de Documentación en Código

## Principio Fundamental
- TODA la documentación DEBE estar en el código mismo, NO en archivos .md externos
- Los comentarios son ciudadanos de primera clase, no una ocurrencia tardía
- Si necesitas explicar algo en un archivo .md, probablemente tu código no es lo suficientemente claro

## Comentarios de Archivo (Obligatorio en cada archivo)
- Cada archivo DEBE comenzar con un bloque de comentario que explique:
  ```typescript
  /**
   * @file NombreArchivo.tsx
   * @description Breve descripción de qué hace este archivo
   * @module NombreDelModulo (si aplica)
   * 
   * @example
   * // Ejemplo de uso básico
   * <MiComponente prop="valor" />
   */
  ```

## Comentarios de Función/Componente (JSDoc Obligatorio)
- TODA función exportada DEBE tener documentación JSDoc:
  ```typescript
  /**
   * Descripción clara de qué hace la función
   * 
   * @param {string} parametro1 - Descripción del parámetro
   * @param {number} parametro2 - Descripción del segundo parámetro
   * @returns {ReturnType} Descripción de lo que retorna
   * 
   * @example
   * const resultado = miFuncion("valor", 42);
   */
  export function miFuncion(parametro1: string, parametro2: number): ReturnType {
    // implementación
  }
  ```

## Comentarios de Props (Obligatorio)
- TODAS las interfaces de Props DEBEN tener comentarios en cada propiedad:
  ```typescript
  interface PatientCardProps {
    /** Nombre completo del paciente */
    name: string;
    /** Edad del paciente en años */
    age: number;
    /** Callback cuando se hace click en la tarjeta */
    onClick?: () => void;
    /** Estado de carga del componente */
    isLoading?: boolean;
  }
  ```

## Comentarios de Lógica Compleja
- Cada bloque de lógica no trivial DEBE tener un comentario explicativo:
  ```typescript
  // Filtramos pacientes activos que tengan citas en los próximos 7 días
  // y los ordenamos por fecha de próxima cita
  const upcomingPatients = patients
    .filter(p => p.status === 'active' && p.nextAppointment)
    .filter(p => isWithinDays(p.nextAppointment, 7))
    .sort((a, b) => compareAsc(a.nextAppointment, b.nextAppointment));
  ```

## Comentarios TODO/FIXME
- Usar formato estándar para tareas pendientes:
  ```typescript
  // TODO: [FECHA] [AUTOR] Descripción de la tarea pendiente
  // FIXME: [FECHA] [AUTOR] Descripción del bug conocido
  // HACK: [FECHA] [AUTOR] Explicación de por qué este código es temporal
  // NOTE: Información importante que otros desarrolladores deben saber
  ```

## Lo que NO se debe documentar
- No documentar lo obvio (`// Suma dos números` para `a + b`)
- No duplicar información que TypeScript ya proporciona
- No usar comentarios para código muerto (eliminarlo directamente)
