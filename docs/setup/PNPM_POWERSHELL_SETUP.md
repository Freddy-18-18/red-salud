# Configuración Permanente de pnpm en PowerShell

## Problema Resuelto ✅

El proyecto ahora está completamente configurado para usar `pnpm` en lugar de `npm`.

## Solución Aplicada

Se creó una función de PowerShell que redirige `pnpm` a su instalación global correcta en:
```
C:\Users\Fredd\AppData\Roaming\npm\pnpm.cmd
```

## Hacer la Solución Permanente

Para que `pnpm` funcione en todas las sesiones futuras de PowerShell, sigue estos pasos:

### Paso 1: Abrir tu perfil de PowerShell

```powershell
# Crear o editar tu perfil (si no existe, se creará)
if (!(Test-Path -Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
}

# Abrir el perfil en el editor
notepad $PROFILE
```

### Paso 2: Agregar estas líneas al final del archivo

```powershell
# pnpm function - Permite usar pnpm sin problemas en PowerShell
function pnpm {
    & "C:\Users\Fredd\AppData\Roaming\npm\pnpm.cmd" @args
}

# Alias opcional para escribir menos
Set-Alias -Name pn -Value pnpm -Scope Global -Force
```

### Paso 3: Guardar y cerrar PowerShell completamente

Luego abre una **nueva ventana de PowerShell** y prueba:

```powershell
pnpm --version
pnpm run lint
pnpm run dev
```

## Verificación

Para confirmar que todo está funcionando:

```powershell
# Ver la versión de pnpm
pnpm --version    # Debe mostrar: 9.1.0

# Ver los scripts disponibles
pnpm run          # Lista todos los scripts disponibles

# Ejecutar el linter
pnpm run lint

# Iniciar desarrollo
pnpm run dev
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm run dev` | Inicia servidor web dev |
| `pnpm run build` | Compila el proyecto |
| `pnpm run lint` | Ejecuta ESLint |
| `pnpm run test` | Ejecuta tests |
| `pnpm install` | Instala dependencias |

## Notas Importantes

⚠️ **IMPORTANTE**: Si cambias de máquina o tu usuario de Windows cambia, actualiza la ruta en el perfil de PowerShell:

```powershell
# Encuentra la ruta actual de pnpm con:
npm config get prefix
# Luego actualiza "C:\Users\Fredd" con tu usuarios actual si es necesario
```

✅ Una vez configurado, no necesitarás volver a hacer esto en esta máquina.

## Alternativa: Usar npm run

Si por algún motivo no puedes usar PowerShell, puedes usar npm directamente desde cmd.exe:

```cmd
npm run lint
npm run dev
npm run build
```
