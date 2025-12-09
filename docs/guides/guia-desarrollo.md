# Guía de desarrollo

## Estándares

- Un archivo, una responsabilidad (SRP)
- Máximo 400 líneas por archivo fuente (excluye binarios/lockfiles)
- Evitar lógica pesada en páginas (`app/.../page.tsx`): extraer a `hooks/` y `components/`
- Imports absolutos con alias `@/`

## Estructura recomendada

- `components/feature/...`: UI de dominio
- `components/ui/...`: UI base
- `hooks/feature/useX.ts`: estado y llamadas
- `lib/supabase/services/...`: funciones por entidad/uso
- `lib/i18n/<lang>/<ns>.ts`: traducciones por namespace

## Testing

- Priorizar tests en servicios críticos (supabase y validaciones)
- Smoke tests para rutas complejas tras refactors

## Linting y formato

```bash
npm run lint
```

## Pull requests

- Commits atómicos, mensajes claros (`feat:`, `fix:`, `refactor:`, `docs:`)
- Describir impacto en rutas y servicios si aplica
