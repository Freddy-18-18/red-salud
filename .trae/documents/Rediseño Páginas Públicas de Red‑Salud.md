# Objetivos del Rediseño
- Alinear páginas públicas con funcionalidades núcleo (citas, telemedicina, mensajería, laboratorio, perfil)
- Mejorar claridad del valor y conversión hacia registro/inicio de sesión
- Unificar estilo con el dashboard y componentes UI existentes (Tailwind + shadcn/ui)
- Garantizar SEO, accesibilidad y performance en App Router

## Alcance
- Páginas: Inicio, Nosotros, Servicios (y subverticales), Precios, Blog, Soporte (FAQ y Contacto)
- Layout compartido: reutilizar `Header`/`Footer` actuales con ajustes menores
- Sin cambiar flujos de autenticación ni API; solo marketing/UX y contenido

# Estructura por Página
## Inicio
- Hero impactante con video de fondo (reusar `VideoBackground`) y claim claro
- Beneficios clave (6 tarjetas) con iconografía `lucide-react` (reusar `FeaturesSection`)
- Especialidades en carrusel infinito (reusar `InfiniteSpecialtiesScroll`)
- Prueba social/estadísticas (reusar `DashboardStats` con datos reales)
- CTA dual: `Registrarse` y `Agendar cita` (deep‑link a `dashboard/paciente/citas` si hay sesión)

## Nosotros
- Historia y propósito con timeline
- Valores de marca (seguridad, humanidad, eficiencia)
- Equipo directivo con tarjetas (nombre, rol, especialidad)
- Compromisos/regulaciones (HIPAA, privacidad) enlazando a `Privacidad` y `Términos`

## Servicios
- Grid de funcionalidades por público: Pacientes, Médicos, Clínicas, Laboratorios, Farmacias, Ambulancias, Seguros
- Cada tarjeta con: descripción breve, 3 beneficios, CTA contextual (p. ej., “Ver demo” → `dashboard/medico/icd11-demo`)
- Subpáginas existentes por vertical se mantienen con texto y visuales coherentes

## Precios
- Tabla comparativa por rol (Pacientes / Médicos / Clínicas...) usando `components/ui/table`
- Destacar plan recomendado, FAQ de billing y notas legales
- CTA persistente “Crear cuenta” y enlace a soporte de facturación

## Blog
- Listado de artículos (estático o MDX inicial) con categorías (Telemedicina, Salud Digital, Seguridad)
- Paginación liviana; tarjetas con `Card` y `framer-motion`
- Detalle futuro: rutas dinámicas `blog/[slug]` (planificado, no inmediato)

## Soporte
- FAQ con acordeones (`components/ui/accordion`) y búsqueda simple
- Contacto: formulario con validaciones (`components/ui/input`, `textarea`, `Button`), info de `CONTACT_INFO`
- Recursos: enlaces a documentación y políticas

# Lineamientos de Diseño
## Paleta
- Primario: Azul (`from-blue-600`) y Teal (`to-teal-600`) en gradientes
- Neutros: variables HSL ya definidas en `app/globals.css` (`--background`, `--foreground`, `--border`)
- Estados: `blue-50/600/700`, `teal-400/600`; destructivo reutiliza `--destructive`

## Tipografía
- `Inter` para cuerpo y `Poppins` para titulares (ya cargadas en `app/layout.tsx`)
- Jerarquía: H1 48–64px, H2 40–56px, cuerpo 16–18px

## Iconografía e Imágenes
- `lucide-react` consistente; tamaños 20–32px según contexto
- Imágenes reales de atención médica, vídeo hero (`public/videos/doctors-bg.mp4`); optimizar carga

## Responsive
- Breakpoints Tailwind estándar; controles de altura `svh` para hero; navegación móvil con menú actual

## Accesibilidad
- Contraste AA mínimo, `aria-labels` en controles, focus visible (`globals.css` ya define outline)
- Semántica en headings y landmarks (header/main/footer)

# Integración con la App
- Coherencia visual: reusar `components/ui/*`, gradientes y animaciones de dashboard
- Flujos complementarios: CTAs dirigen a login/registro y a módulos (`/dashboard/paciente/citas`, `/dashboard/medico`)
- Patrones de interacción: acordeones, modales y tablas iguales a dashboard
- i18n: preparar textos para `useI18n` (módulo `common`/`dashboard`), comenzando en `es` con posibilidad de `en`

# SEO y Performance
- Mantener `metadata` por sección; añadir `sitemap` y `robots.txt` en siguiente fase
- Imágenes y vídeo con lazy‑loading; evitar CLS en hero; medir con `@vercel/speed-insights`

# Requerimientos Técnicos Identificados
- Next.js App Router + RSC, TypeScript, Tailwind, shadcn/ui
- Animaciones con `framer-motion`; iconos `lucide-react`
- Proveedores: `AppProviders` (tema y preferencias) + `SupabaseAuthProvider`
- i18n modular (`lib/i18n/translations`) y `PreferencesProvider` (
  idioma/tema persistentes)

# Público Objetivo (Inferido)
- Pacientes que agendan y gestionan salud
- Médicos que atienden, documentan y prescriben
- Clínicas/Labs/Farmacias/Seguros que coordinan servicios
- Secretarías que administran agendas

# Funcionalidades Clave (Repositorio)
- Citas y agenda, historial clínico, medicamentos y recordatorios
- Telemedicina (sesiones, recetas), mensajería segura
- Laboratorio (resultados), verificación y perfiles
- i18n, seguridad (2FA, eventos), Supabase backend

# Estilo de Marca Existente
- Nombre “Red‑Salud”, tono profesional y humano
- Uso consistente de gradientes Azul↔Teal y neutrales limpios
- Tipografías `Inter`/`Poppins`; animaciones suaves

# Plan de Implementación
## Fase 1: Fundaciones
- Auditar contenido actual y definir copy por página (es → en futuro)
- Unificar tokens de color primario (helper CSS para gradientes)

## Fase 2: Estructuras
- Inicio: consolidar hero + beneficios + especialidades + stats + CTA
- Nosotros: secciones Historia/Valores/Equipo/Compromisos
- Servicios: grid por rol + subpáginas existentes con contenido
- Precios: tabla comparativa + FAQ + CTA
- Blog: listado estático inicial (MDX opcional)
- Soporte: FAQ y Contacto con validaciones

## Fase 3: Integración y SEO
- CTAs con deep‑links por sesión
- Textos en `i18n`; metadata optimizada; preparar `sitemap/robots`

## Validación
- Pruebas de accesibilidad (teclado, contrastes) y responsive
- Verificación en preview y medición de rendimiento

# Datos Útiles para Ajuste (opcionales)
- Tonalidades exactas de Azul/Teal de marca
- Estrategia de precios por rol (si varía)
- Fuente del contenido del Blog (CMS/MDX)
- Imágenes de equipo e historias reales

¿Te parece bien este plan para comenzar con la implementación del rediseño?