# 🏥 Red-Salud

Plataforma integral de servicios de salud que conecta pacientes, médicos, clínicas, farmacias, laboratorios y seguros en un ecosistema digital completo.

## 🚀 Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19.2
- **Lenguaje:** TypeScript 5
- **Backend:** Supabase (Auth, Database, Storage)
- **Estilos:** Tailwind CSS 4
- **Componentes:** shadcn/ui + Radix UI
- **Animaciones:** Framer Motion
- **Validación:** Zod + React Hook Form

## 📁 Estructura del Proyecto

```
red-salud/
├── app/                  # Next.js App Router
│   ├── (public)/         # Páginas públicas (landing, blog, servicios)
│   ├── (auth)/           # Autenticación (login, register)
│   ├── dashboard/        # Dashboards por rol (paciente, médico, etc.)
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/           # Componentes React reutilizables
│   ├── auth/             # Componentes de autenticación
│   ├── dashboard/        # Componentes de dashboard
│   ├── layout/           # Header, Footer, etc.
│   ├── providers/        # Context providers
│   ├── sections/         # Secciones de landing
│   ├── ui/               # shadcn/ui components
│   └── video/            # Componentes de video
├── hooks/                # Custom React hooks
├── lib/                  # Utilidades y configuración
│   ├── supabase/         # Cliente y funciones de Supabase
│   ├── validations/      # Esquemas de validación Zod
│   └── utils.ts          # Funciones utilitarias
├── public/               # Assets estáticos
├── supabase/             # Configuración y migraciones
├── scripts/              # Scripts de utilidad
├── docs/                 # Documentación completa
│   ├── deployment/       # Guías de despliegue
│   ├── architecture/     # Arquitectura del sistema
│   ├── guides/           # Guías de uso
│   └── checklists/       # Checklists de implementación
└── sacs-verification-service/  # Servicio de verificación

```

## 🏗️ Arquitectura

### Route Groups de Next.js

El proyecto utiliza Route Groups para organizar las rutas sin afectar las URLs:

- **`(public)/`**: Páginas públicas accesibles sin autenticación
  - Landing page, blog, servicios, precios, etc.
  - Layout con Header y Footer

- **`(auth)/`**: Páginas de autenticación
  - Login, registro, recuperación de contraseña
  - Layout minimalista sin header/footer

- **`dashboard/`**: Dashboards protegidos por rol
  - Paciente, Médico, Clínica, Farmacia, etc.
  - Layout con sidebar y navegación específica

### Roles de Usuario

- **Paciente**: Consultas, citas, historial médico
- **Médico**: Atención de pacientes, telemedicina
- **Clínica**: Gestión de servicios médicos
- **Farmacia**: Gestión de medicamentos y recetas
- **Laboratorio**: Resultados de análisis
- **Ambulancia**: Servicios de emergencia
- **Seguro**: Gestión de pólizas y coberturas

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 22.x o superior
- npm, yarn, pnpm o bun
- Cuenta de Supabase

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/firf18/red-salud.git
cd red-salud

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Ver `docs/deployment/VARIABLES-ENTORNO.md` para más detalles.

## 📚 Documentación

- **[Guía de Despliegue](docs/deployment/)**: Instrucciones para deploy en Vercel y Cloudflare
- **[Arquitectura](docs/architecture/)**: Diseño del sistema y decisiones técnicas
- **[Guías](docs/guides/)**: Solución de problemas y tutoriales
- **[Checklists](docs/checklists/)**: Listas de verificación para implementación

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm start            # Inicia servidor de producción

# Calidad de código
npm run lint         # Ejecuta ESLint
```

## 🌐 Despliegue

El proyecto está configurado para desplegarse en:

- **Frontend**: Vercel
- **Backend**: Supabase
- **CDN**: Cloudflare

Ver `docs/deployment/` para guías detalladas.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Desarrollado por el equipo de Red-Salud.

---

**Versión:** 0.1.0  
**Última actualización:** Noviembre 2025
