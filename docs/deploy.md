# Despliegue

## Variables de entorno

Configurar `.env.production` (similar a `.env.local`). Mantener secretos fuera de commits.

## Build

```bash
npm run build
npm run start
```

## Verificación rápida

- Revisar logs de inicio
- Probar rutas clave `/dashboard/medico` y `/dashboard/paciente`

## Próximos pasos

- Automatizar verificación post-deploy (script smoke tests)
- Unificar documentación de despliegue histórico en este archivo
