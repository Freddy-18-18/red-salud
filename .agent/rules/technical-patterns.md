---
trigger: always_on
---

# Reglas de Patrones Técnicos

## TypeScript Estricto
- NUNCA usar `any` - si no sabes el tipo, investigar o usar `unknown`
- SIEMPRE definir tipos explícitos para:
  - Props de componentes
  - Retornos de funciones
  - Estados de hooks
  - Respuestas de API
- Usar `as const` para arrays/objetos inmutables
- Preferir `interface` para objetos, `type` para uniones/utilidades

## Manejo de Estado
- Estado local: `useState` para UI simple
- Estado de formularios: `react-hook-form` + `zod` SIEMPRE
- Estado servidor: `@tanstack/react-query` para fetching
- Estado global: Redux SOLO si es absolutamente necesario
- NUNCA prop drilling más de 2 niveles - usar Context o composición

## Hooks Personalizados
- Extraer lógica reutilizable a hooks en `/hooks`
- Nomenclatura: `use[Dominio][Accion].ts`
  - Ejemplos: `usePatientData.ts`, `useAppointmentForm.ts`
- CADA hook debe tener:
  ```typescript
  /**
   * @hook useNombreHook
   * @description Qué hace este hook
   * @returns {Object} Descripción del retorno
   */
  export function useNombreHook(params: Params): ReturnType {
    // Documentar lógica compleja inline
  }
  ```

## Formularios
- SIEMPRE usar react-hook-form + zod para validación
- Esquema de validación en archivo separado si > 20 líneas
- Patrón estándar:
  ```typescript
  const schema = z.object({
    campo: z.string().min(1, "Campo requerido"),
  });
  
  type FormData = z.infer<typeof schema>;
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  ```

## Fetching de Datos
- SIEMPRE usar react-query para datos del servidor
- Nomenclatura de queries: `use[Recurso]Query`
- Nomenclatura de mutations: `use[Accion][Recurso]Mutation`
- SIEMPRE manejar estados: loading, error, success
- SIEMPRE invalidar queries relacionadas después de mutations

## Supabase
- NUNCA exponer lógica de Supabase en componentes directamente
- Encapsular en funciones en `/lib/supabase/`
- SIEMPRE usar tipos generados de la base de datos
- SIEMPRE manejar errores de Supabase explícitamente

## Manejo de Errores
- NUNCA silenciar errores con try/catch vacío
- Patrón estándar:
  ```typescript
  try {
    await operacionRiesgosa();
  } catch (error) {
    // Loggear para debugging
    console.error('[NombreModulo] Error descriptivo:', error);
    // Mostrar al usuario de forma amigable
    toast.error('Mensaje amigable para el usuario');
    // Re-throw si es necesario propagar
  }
  ```

## Performance
- SIEMPRE usar `React.memo` para componentes de listas
- SIEMPRE usar `useMemo` para cálculos costosos
- SIEMPRE usar `useCallback` para funciones pasadas como props
- Lazy loading para componentes pesados:
  ```typescript
  const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <Skeleton />,
    ssr: false // si no necesita SSR
  });
  ```

## Seguridad (Datos Médicos - CRÍTICO)
- NUNCA loggear datos sensibles de pacientes
- SIEMPRE validar datos en el servidor, no solo cliente
- SIEMPRE usar RLS (Row Level Security) en Supabase
- NUNCA exponer IDs internos en URLs públicas
- Sanitizar TODA entrada de usuario

## Testing y Verificación
- SIEMPRE verificar que el build compila antes de considerar tarea completa:
  ```bash
  npm run build
  ```
- SIEMPRE probar flujos críticos manualmente
- IDs únicos y descriptivos en elementos para testing:
  ```typescript
  <button id="submit-appointment-btn" data-testid="submit-appointment">
  ```
