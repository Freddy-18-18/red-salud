# 🩺 Red-Salud

Plataforma de telemedicina que conecta pacientes con profesionales médicos para consultas online y gestión de salud.

## 🚀 Inicio rápido

1) Instala dependencias

```bash
npm install
```

2) Configura variables de entorno (`.env.local`)

```bash
# Supabase (obligatorio)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Google Gemini (opcional para asistente IA)
GEMINI_API_KEY=

# ICD-11 (opcional)
ICD_API_CLIENT_ID=
ICD_API_CLIENT_SECRET=
```

3) Ejecuta en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

## 🏗️ Stack

- Next.js (App Router) + React + Tailwind
- Supabase (auth, DB)
- shadcn/ui + Radix UI

## 📁 Estructura clave

```
app/                 # Rutas y layouts
components/          # Componentes UI y de dominio
hooks/               # Lógica de estado por feature
lib/                 # Servicios y utilidades (i18n, supabase, templates)
public/              # Assets estáticos
docs/                # Documentación (curada y concisa)
```

Convenciones: SRP (una responsabilidad por archivo) y < 400 LOC por archivo fuente.

## 📚 Documentación

La documentación se ha reiniciado para reflejar el estado actual. Consulta:

- `docs/arquitectura.md` – visión del sistema, capas y flujos
- `docs/guia-desarrollo.md` – estándares, límites de archivo, testing, imports
- `docs/frontend-next.md` – patrones en App Router
- `docs/datos-supabase.md` – notas de datos y servicios
- `docs/deploy.md` – despliegue y variables

## 🔧 Scripts útiles

```bash
npm run dev    # desarrollo
npm run build  # build producción
npm run start  # servidor producción
npm run lint   # linter
```

—

Privado - Red-Salud © 2025
