# Development Guide

This guide outlines the development workflow, verification scripts, and best practices for the Red-Salud monorepo.

## Verification Scripts

We have a set of scripts in `apps/web/scripts` to help maintain code quality and architectural integrity. Run these regularly, especially before pushing changes.

### `verify-workspace-setup`
Verifies that the workspace is correctly set up, including environment variables and critical files.
```bash
pnpm --filter red-salud-web tsx scripts/verify-workspace-setup.ts
```

### `verify-imports`
Checks for circular dependencies and import violations according to our architectural rules (e.g., UI components should not import business logic).
```bash
pnpm --filter red-salud-web tsx scripts/verify-imports.ts
```

### `verify-single-responsibility`
Analyzes components to detect potential Single Responsibility Principle violations, such as components that are too large or have too many props/imports.
```bash
pnpm --filter red-salud-web tsx scripts/verify-single-responsibility.ts
```

### `verify-file-sizes`
Flag files that exceed recommended size limits, encouraging modularization.
```bash
pnpm --filter red-salud-web tsx scripts/verify-file-sizes.ts
```

### `verify-routes`
Ensures that all application routes are valid and reachable.
```bash
pnpm --filter red-salud-web tsx scripts/verify-routes.ts
```

## Common Tasks

### Building
```bash
pnpm run build
```
Builds all packages in the correct order (`types` -> `web`).

### Linting
```bash
pnpm run lint
```
Runs ESLint on the web application.
