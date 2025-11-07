# 📁 Organización Profesional del Proyecto

## 🎯 Estructura Objetivo

```
red-salud/
├── .github/              # GitHub workflows y configuración
├── .vscode/              # Configuración de VS Code
├── app/                  # Next.js App Router
│   ├── (public)/         # Páginas públicas (landing, blog, etc.)
│   ├── (auth)/           # Autenticación
│   ├── dashboard/        # Dashboards por rol
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Página raíz
├── components/           # Componentes React
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuración
├── public/               # Assets estáticos (imágenes, fonts)
├── supabase/             # Configuración y migraciones de Supabase
├── scripts/              # Scripts de utilidad
├── docs/                 # Documentación del proyecto
│   ├── deployment/       # Guías de despliegue
│   ├── architecture/     # Arquitectura y diseño
│   ├── guides/           # Guías de uso
│   └── checklists/       # Checklists
├── tests/                # Tests (si los hay)
├── .env.example          # Ejemplo de variables de entorno
├── .env.local            # Variables locales (git ignored)
├── .gitignore            # Git ignore
├── components.json       # Configuración de shadcn/ui
├── eslint.config.mjs     # Configuración de ESLint
├── next.config.ts        # Configuración de Next.js
├── package.json          # Dependencias
├── postcss.config.mjs    # Configuración de PostCSS
├── README.md             # Documentación principal
├── tsconfig.json         # Configuración de TypeScript
└── tsconfig.tsbuildinfo  # Cache de TypeScript
```

## 📋 Archivos a Mover

### → docs/deployment/
- DEPLOY-COMMANDS.md
- DEPLOY-INSTRUCTIONS.md
- DEPLOYMENT-SUCCESS.md
- CONFIGURACION-VERCEL-PASO-A-PASO.md
- GUIA-LIMPIEZA-CLOUDFLARE-VERCEL.md
- GUIA-RECONFIGURAR-ENV.md
- PASOS-RAPIDOS.md
- setup-cloudflare-dns.md
- VARIABLES-ENTORNO.md

### → docs/architecture/
- ARQUITECTURA-HIBRIDA.md
- REESTRUCTURACION-PROYECTO.md
- RESUMEN-EJECUTIVO.md

### → docs/guides/
- DIAGNOSTICO-VERCEL-CLOUDFLARE.md
- SOLUCION-ERROR-404.md
- README-SISTEMA-VERIFICACION.md
- COMANDOS-RAPIDOS.md

### → docs/checklists/
- CHECKLIST-DESPLIEGUE.md
- CHECKLIST-IMPLEMENTACION.md

### → scripts/
- diagnostico-dns.ps1
- reconfigurar-env-vercel.ps1
- setup-env.ps1
- verificar-estado.ps1
- test-register-users.ts

### → docs/debug/ (o eliminar si ya no se necesitan)
- debug-antes-7983901.png
- debug-certificado.png
- debug-despues-certificado.png
- informe-sacs-*.json
- resultados-sacs-*.json

### → tests/ o eliminar
- test-edge-function.html

### Eliminar (archivos obsoletos)
- proxy.disabled.ts
- proxy.ts
- middleware.disabled.ts

## ✅ Archivos que DEBEN quedar en la raíz

- .env.example
- .env.local
- .gitignore
- components.json
- eslint.config.mjs
- next-env.d.ts
- next.config.ts
- package.json
- package-lock.json
- postcss.config.mjs
- README.md
- tsconfig.json
- tsconfig.tsbuildinfo
