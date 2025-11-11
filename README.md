# 🩺 Red-Salud

Plataforma de telemedicina que conecta pacientes con profesionales médicos para consultas online y gestión de salud.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env.local` y configura:

```bash
# Supabase (Obligatorio)
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key

# Google Gemini AI (Obligatorio para asistente médico)
GEMINI_API_KEY=tu_api_key  # Obtén gratis en: https://aistudio.google.com/app/apikey

# ICD-11 API (Opcional)
ICD_API_CLIENT_ID=tu_client_id
ICD_API_CLIENT_SECRET=tu_secret
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📚 Documentación

Toda la documentación está en la carpeta `/docs`:

- **[docs/EMPEZAR_AQUI.md](docs/EMPEZAR_AQUI.md)** - Guía de inicio rápido
- **[docs/CONFIGURACION_GEMINI_AI.md](docs/CONFIGURACION_GEMINI_AI.md)** - Configurar asistente IA
- **[docs/WORKSPACE_MEDICO_NUEVO.md](docs/WORKSPACE_MEDICO_NUEVO.md)** - Workspace médico

## 🏗️ Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19.2 + Tailwind CSS 4
- **Base de datos:** Supabase
- **IA:** Google Gemini 1.5 Flash
- **Componentes:** shadcn/ui + Radix UI

## 🎯 Características Principales

### Para Pacientes
- 📋 Perfil médico completo
- 💬 Mensajería con doctores
- 📅 Gestión de citas
- 📄 Historial médico

### Para Médicos
- 🤖 Asistente IA para notas médicas
- 🔍 Búsqueda de códigos ICD-11
- 👥 Gestión de pacientes
- 📝 Generación de recetas

### Para Administradores
- 📊 Dashboard de métricas
- 👨‍⚕️ Verificación de médicos
- 💳 Gestión de pagos

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run verify-workspace  # Verificar configuración del workspace médico
```

## 📁 Estructura del Proyecto

```
red-salud/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboards por rol
│   └── auth/              # Autenticación
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn)
│   └── dashboard/        # Componentes específicos
├── lib/                   # Utilidades y servicios
│   ├── supabase/         # Cliente Supabase
│   └── services/         # Servicios (Gemini, ICD-11)
├── docs/                  # Documentación completa
└── public/               # Assets estáticos
```

## 🐛 Solución de Problemas

### Error: "GEMINI_API_KEY no está configurada"

1. Obtén tu API key gratis en: https://aistudio.google.com/app/apikey
2. Agrégala al archivo `.env.local`
3. Reinicia el servidor

### La búsqueda ICD-11 no funciona

Es opcional. Configura las credenciales en `.env.local` o usa las sugerencias del asistente IA.

## 📄 Licencia

Privado - Red-Salud © 2025

## 🤝 Equipo

Desarrollado por el equipo de Red-Salud

---

**Versión:** 2.0.0  
**Última actualización:** Noviembre 2025
