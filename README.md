# 🩺 Red-Salud

Plataforma SaaS de gestión médica integral que conecta pacientes, médicos, clínicas y laboratorios. Incluye telemedicina, gestión de citas, historiales médicos, y herramientas administrativas.

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 3. Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🏗️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, Tailwind CSS, shadcn/ui |
| **Backend** | Supabase (Auth, PostgreSQL, Storage) |
| **Estado** | Redux Toolkit, React Query |
| **3D/Charts** | Three.js, Recharts |
| **AI** | Google Gemini (chatbot) |

## 📁 Estructura del Proyecto

```
app/                    # Rutas y layouts (Next.js App Router)
├── (auth)/             # Páginas de autenticación
├── (public)/           # Páginas públicas (landing, servicios)
├── api/                # API Routes
└── dashboard/          # Dashboards por rol

components/             # Componentes React
├── ui/                 # shadcn/ui components
├── dashboard/          # Componentes de dashboard
└── sections/           # Secciones de páginas públicas

lib/                    # Servicios y utilidades
├── supabase/           # Cliente y servicios de Supabase
├── security/           # Autenticación y sesiones
└── i18n/               # Internacionalización

hooks/                  # Custom hooks por feature
```

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [arquitectura.md](docs/arquitectura.md) | Arquitectura del sistema, capas y flujos |
| [guia-desarrollo.md](docs/guia-desarrollo.md) | Setup, convenciones y workflows |
| [base-datos.md](docs/base-datos.md) | Esquemas Supabase y servicios |
| [componentes.md](docs/componentes.md) | UI components y hooks |
| [features.md](docs/features.md) | Features implementadas |
| [deploy.md](docs/deploy.md) | Deployment y configuración |

## 🔧 Scripts

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # Linter
```

## 📋 Convenciones

- **Límite de archivos:** < 400 líneas por archivo
- **Responsabilidad única:** Un componente/hook = una responsabilidad
- **TypeScript:** Estricto, sin `any`

---

**Red-Salud** © 2025 | Privado
