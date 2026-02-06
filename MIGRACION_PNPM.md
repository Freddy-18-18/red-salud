# Migración de npm a pnpm

## ✅ Migración Completada

El proyecto ha sido migrado exitosamente de npm a pnpm.

## Cambios Realizados

1. ✅ Eliminado `node_modules` de npm
2. ✅ Eliminados archivos `package-lock.json` residuales
3. ✅ Actualizado `.npmrc` con configuración optimizada para pnpm
4. ✅ Instaladas todas las dependencias con pnpm
5. ✅ Verificado `pnpm-workspace.yaml` para monorepo

## Configuración Actual

- **Package Manager**: pnpm@9.1.0 (definido en package.json)
- **Workspace**: Configurado para monorepo con apps, services y packages
- **Lock File**: pnpm-lock.yaml

## Comandos Principales

### Desarrollo
```bash
pnpm dev                    # Ejecutar app web
pnpm web:dev               # Ejecutar app web
pnpm tauri:farmacia:dev    # Ejecutar app desktop farmacia
pnpm tauri:medico:dev      # Ejecutar app desktop médico
```

### Build y Deploy
```bash
pnpm build                 # Build app web
pnpm start                 # Iniciar app web en producción
```

### Gestión de Dependencias
```bash
pnpm install               # Instalar todas las dependencias
pnpm add <paquete>         # Agregar dependencia al workspace raíz
pnpm add <paquete> -w      # Agregar dependencia al workspace raíz (explícito)
pnpm add <paquete> --filter <app>  # Agregar a una app específica
```

### Ejemplos de Filtros
```bash
pnpm --filter red-salud-web dev
pnpm --filter @red-salud/farmacia-desktop tauri:dev
pnpm --filter red-salud-web lint
```

### Limpieza
```bash
pnpm store prune           # Limpiar caché de pnpm
rm -rf node_modules        # Eliminar node_modules
pnpm install               # Reinstalar
```

## Ventajas de pnpm

- ⚡ **Más rápido**: Instalación hasta 2x más rápida que npm
- 💾 **Ahorro de espacio**: Usa enlaces simbólicos, ahorra GB de disco
- 🔒 **Más seguro**: Estructura de node_modules más estricta
- 📦 **Monorepo nativo**: Mejor soporte para workspaces

## Notas Importantes

- El archivo `.npmrc` ahora contiene configuración específica para pnpm
- Los scripts en `package.json` ya usan comandos de pnpm
- El workspace incluye: apps/*, services/*, packages/*
- No uses `npm` o `yarn` en este proyecto, solo `pnpm`

## Solución de Problemas

Si encuentras errores de peer dependencies:
```bash
pnpm install --no-strict-peer-dependencies
```

Si necesitas limpiar completamente:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```
