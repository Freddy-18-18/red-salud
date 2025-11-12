# Frontend (Next.js)

## App Router

- `app/` contiene layouts y rutas. Mantener páginas delgadas.
- Extraer formularios, tablas y paneles a `components/`.
- Extraer orquestación de datos/estado a `hooks/`.

## UI

- shadcn/ui + Radix como base
- `components/ui/` para piezas reutilizables
- `components/<dominio>/` para UI de negocio

## Rendimiento

- Dividir componentes grandes
- Lazy-load en secciones pesadas
- Evitar pasar objetos grandes por props; utilizar hooks locales

## Estándares de importación

- Alias `@/` para rutas absolutas
- No importar desde `app/` dentro de `lib/` (evitar acoplamiento)
