# Specification: Public Experience — Red Salud

**Change**: public-experience
**Status**: Draft
**Based on**: [proposal.md](./proposal.md), [design.md](./design.md)
**App**: `apps/paciente/web` (`@red-salud/paciente-web`)

---

## 1. Public Pages Specification

All pages live under `src/app/(public)/` except landing (`src/app/page.tsx`).
All data-driven pages use Server Components with `publicSupabase` (anon client, no auth).

### 1.1 Page Registry

| Route | File | Rendering | Revalidate |
|-------|------|-----------|------------|
| `/` | `app/page.tsx` | ISR | 60s |
| `/especialidades` | `app/(public)/especialidades/page.tsx` | ISR | 300s |
| `/especialidades/[slug]` | `app/(public)/especialidades/[slug]/page.tsx` | ISR | 120s |
| `/buscar` | `app/(public)/buscar/page.tsx` | Dynamic (SSR) | 0 |
| `/medicos` | `app/(public)/medicos/page.tsx` | Redirect to `/buscar` | N/A |
| `/medicos/[slug]` | `app/(public)/medicos/[slug]/page.tsx` | ISR | 120s |
| `/nosotros` | `app/(public)/nosotros/page.tsx` | Static | Build-time |
| `/soporte` | `app/(public)/soporte/page.tsx` | Static | Build-time |
| `/seguridad` | `app/(public)/seguridad/page.tsx` | Static | Build-time |
| `/para-profesionales` | `app/(public)/para-profesionales/page.tsx` | Static | Build-time |
| `/descargar` | `app/(public)/descargar/page.tsx` | Static | Build-time |

### 1.2 Page Details

#### `/` — Landing

- **Data source**: `platform_stats` table (single row), `medical_specialties` joined with `doctor_profiles` (top 8 by doctor count)
- **UI sections**:
  - PublicNavbar (sticky, transparent on hero)
  - HeroSection + SearchHero (client island)
  - TrustBadges (verified, fast, free)
  - StatsSection (doctor count, specialty count, patient count, avg rating) with animated StatsCounter
  - SpecialtyGridSection (top 8 specialties with doctor count, link to `/especialidades/[slug]`)
  - HowItWorksSection (3-step static)
  - VenezuelaMapSection with interactive SVG (client island)
  - TestimonialsSection (static for now)
  - CTASection (register + explore)
  - PublicFooter
- **SEO**:
  - Title: `Red Salud — Tu salud, en un solo lugar`
  - Description: `Encuentra al medico ideal en Venezuela. Doctores verificados, citas en minutos, 100% gratuito para pacientes.`
  - JSON-LD: `MedicalOrganization` + `WebSite` with `SearchAction`

#### `/especialidades`

- **Data source**: `medical_specialties` LEFT JOIN `doctor_profiles` (count by specialty, only `is_verified=true AND is_active=true`)
- **UI sections**:
  - Full grid of all specialties (icon, name, description, doctor count)
  - Search/filter input to narrow specialties by name
  - Link each card to `/especialidades/[slug]`
- **SEO**:
  - Title: `Especialidades Medicas | Red Salud`
  - Description: `Explora todas las especialidades medicas disponibles en Red Salud. Encuentra el especialista que necesitas en Venezuela.`

#### `/especialidades/[slug]`

- **Data source**: `medical_specialties` WHERE `slug = :slug`, `doctor_profiles` WHERE `specialty.slug = :slug AND is_verified AND is_active` (paginated, limit 12)
- **UI sections**:
  - Specialty header (icon, name, description, doctor count)
  - Doctor card grid (same `DoctorCard` component as `/buscar`)
  - "Ver mas" pagination or link to `/buscar?especialidad=[slug]`
- **SEO**:
  - Title: `{specialty.name} — Doctores en Venezuela | Red Salud`
  - Description: `Encuentra los mejores doctores de {specialty.name} en Venezuela. {doctorCount} especialistas verificados disponibles.`

#### `/buscar`

- **Data source**: `doctor_profiles` joined with `profiles` + `medical_specialties`, filtered by `searchParams`
- **UI sections**:
  - SearchHeader + SearchForm (client: input, specialty dropdown)
  - FilterPanel (client: specialty, state/city, price range, rating, insurance, gender)
  - ResultsArea (count, sort dropdown, DoctorCardList, pagination)
  - MapToggle + MapView (client, lazy-loaded via `next/dynamic ssr:false`)
- **SEO**:
  - Title: `Buscar Doctores en Venezuela | Red Salud`
  - Description: `Busca y compara doctores verificados en Venezuela. Filtra por especialidad, ubicacion, precio y valoraciones.`
  - `noindex` when search params present (avoid duplicate content)

#### `/medicos/[slug]`

- **Data source**: `doctor_profiles` WHERE `slug = :slug AND is_verified AND is_active`, joined with `profiles`, `medical_specialties`, `doctor_reviews` (top 20 by `created_at DESC`)
- **UI sections**:
  - DoctorProfileHeader (avatar, name, specialty, verified badge, rating, location, experience)
  - BookAppointmentCTA (client: links to register if anon, or dashboard if authed)
  - DoctorProfileTabs (client: tab switching):
    - Informacion: bio, office hours (from `schedule` JSONB), consultation fee, insurance
    - Ubicacion: MapView single marker (city-center coordinates from static lookup)
    - Opiniones: ReviewsList (paginated), ReviewCard (rating, comment, reviewer name, date)
  - SimilarDoctors (same specialty + same state, limit 4)
- **SEO**:
  - Title: `Dr. {name} — {specialty} en {city} | Red Salud`
  - Description: `Dr. {name}, especialista en {specialty} en {city}, Venezuela. {reviewCount} opiniones, {avgRating} estrellas. Agenda tu cita.`
  - JSON-LD: `Physician` schema with `AggregateRating`
  - `generateStaticParams`: pre-generate top 500 verified doctors

#### `/nosotros`

- **Data source**: None (static content)
- **UI sections**: Mission, vision, team, timeline, Venezuela focus
- **SEO**: Title: `Sobre Nosotros | Red Salud` / Description: `Conoce a Red Salud, la plataforma de salud digital para Venezuela.`

#### `/soporte`

- **Data source**: None (static FAQ)
- **UI sections**: FAQ accordion, contact form/email, WhatsApp link
- **SEO**: Title: `Soporte y Ayuda | Red Salud` / Description: `Preguntas frecuentes y soporte al usuario de Red Salud.`

#### `/seguridad`

- **Data source**: None (static)
- **UI sections**: Privacy practices, data encryption, RLS explanation (user-friendly), HIPAA aspirations
- **SEO**: Title: `Seguridad y Privacidad | Red Salud` / Description: `Tu informacion esta protegida. Conoce nuestras practicas de seguridad y privacidad.`

#### `/para-profesionales`

- **Data source**: None (static)
- **UI sections**: Benefits for doctors/clinics, pricing (free tier), CTA to medico app registration, feature comparison
- **SEO**: Title: `Para Profesionales de la Salud | Red Salud` / Description: `Unete a Red Salud como medico o clinica. Gestiona tu agenda, pacientes y consultorio digital.`

#### `/descargar`

- **Data source**: None (static)
- **UI sections**: App store badges (placeholder), QR codes, device mockups, feature highlights
- **SEO**: Title: `Descargar Red Salud | Red Salud` / Description: `Descarga la app de Red Salud para Android e iOS. Tu salud en la palma de tu mano.`

---

## 2. Data Contracts

### 2.1 TypeScript Interfaces

File: `apps/paciente/web/src/lib/types/public.ts`

```ts
export interface PlatformStats {
  doctorCount: number;
  specialtyCount: number;
  patientCount: number;
  appointmentCount: number;
  avgRating: number;
}

export interface PublicSpecialty {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;       // lucide-react icon name
  color: string | null;      // hex or tailwind color
  doctorCount: number;
}

export interface PublicDoctor {
  id: string;
  slug: string;
  consultationFee: number | null;
  acceptsInsurance: boolean;
  yearsExperience: number | null;
  biography: string | null;
  verified: boolean;
  profile: {
    name: string;
    avatarUrl: string | null;
    city: string | null;
    state: string | null;
    gender: string | null;
  };
  specialty: {
    id: string;
    name: string;
    slug: string;
  };
  avgRating: number | null;
  reviewCount: number;
}

export interface PublicDoctorDetail extends PublicDoctor {
  reviews: PublicReview[];
  schedule: DoctorSchedule;
}

export interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;        // ISO 8601
  reviewerName: string;
  isAnonymous: boolean;
}

export interface DoctorSchedule {
  [day: string]: {
    enabled: boolean;
    slots: Array<{ start: string; end: string }>;
  };
}

export interface DoctorLocation {
  lat: number;
  lng: number;
  city: string;
  state: string;
  address: string | null;
}

export interface MapDoctorPoint {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  lat: number;
  lng: number;
  rating: number | null;
  avatarUrl: string | null;
  city: string;
  state: string;
}

export interface StateMapData {
  stateId: string;
  stateName: string;
  doctorCount: number;
}

export interface SearchFilters {
  q?: string;
  specialtySlug?: string;
  state?: string;
  city?: string;
  acceptsInsurance?: boolean;
  minRating?: number;
  maxPrice?: number;
  gender?: string;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  limit?: number;              // default: 12, max: 50
}

export interface SearchResults {
  doctors: PublicDoctor[];
  total: number;
  page: number;
  totalPages: number;
}
```

### 2.2 Supabase Query Definitions

| Query | Table(s) | Select Columns | Joins | Filters | Order | Limit |
|-------|----------|---------------|-------|---------|-------|-------|
| `getPlatformStats` | `platform_stats` | `doctor_count, specialty_count, patient_count, appointment_count, avg_rating` | None | `id = 'global'` | N/A | 1 |
| `getSpecialtiesWithCount` | `medical_specialties` | `id, name, slug, description, icon, color` + count of `doctor_profiles` | LEFT JOIN `doctor_profiles` on `specialty_id` | `doctor_profiles.is_verified = true AND is_active = true` | `doctorCount DESC` | None |
| `getSpecialtyBySlug` | `medical_specialties` | `id, name, slug, description, icon, color` | None | `slug = :slug` | N/A | 1 |
| `getDoctorsBySpecialty` | `doctor_profiles` | See `searchDoctors` | `profiles`, `medical_specialties` | `specialty.slug = :slug, is_verified, is_active` | `years_experience DESC` | 12 (paginated) |
| `searchDoctors` | `doctor_profiles` | `id, slug, consultation_price, accepts_insurance, years_experience, bio` | INNER JOIN `profiles` (nombre_completo, avatar_url, ciudad, estado), INNER JOIN `medical_specialties` (id, name, slug) | Dynamic from `SearchFilters` + `is_verified=true, is_active=true` | Dynamic from `sortBy` | Paginated (default 12) |
| `getDoctorBySlug` | `doctor_profiles` | `id, slug, consultation_price, accepts_insurance, years_experience, bio, is_verified, schedule` | INNER JOIN `profiles` (nombre_completo, avatar_url, ciudad, estado, genero), INNER JOIN `medical_specialties` (id, name, slug) | `slug = :slug, is_verified = true, is_active = true` | N/A | 1 |
| `getDoctorReviews` | `doctor_reviews` | `id, rating, comment, created_at, is_anonymous` | INNER JOIN `profiles` on `patient_id` (nombre_completo) | `doctor_id = :id` | `created_at DESC` | 20 |
| `getDoctorsForMap` | `doctor_profiles` | `id, slug, years_experience` | INNER JOIN `profiles` (nombre_completo, avatar_url, ciudad, estado), INNER JOIN `medical_specialties` (name) | `is_verified = true, is_active = true, ciudad IS NOT NULL` | None | 500 |
| `getStateDoctorCounts` | `doctor_profiles` | `count(*)` grouped by `profiles.estado` | INNER JOIN `profiles` | `is_verified = true, is_active = true` | `count DESC` | None |

---

## 3. Database Migrations

### 3.1 Required Schema Changes

#### Migration: `platform_stats` table

```sql
CREATE TABLE IF NOT EXISTS platform_stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  doctor_count INT DEFAULT 0,
  specialty_count INT DEFAULT 0,
  patient_count INT DEFAULT 0,
  appointment_count INT DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO platform_stats (id) VALUES ('global') ON CONFLICT DO NOTHING;
```

#### Migration: `slug` column on `medical_specialties`

```sql
ALTER TABLE medical_specialties ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

UPDATE medical_specialties
SET slug = lower(regexp_replace(regexp_replace(unaccent(name), '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE slug IS NULL;

CREATE INDEX IF NOT EXISTS idx_medical_specialties_slug ON medical_specialties(slug);
```

#### Migration: `slug` column on `doctor_profiles`

```sql
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

UPDATE doctor_profiles dp
SET slug = lower(
  regexp_replace(
    regexp_replace(unaccent(p.nombre_completo), '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-|-$)', '', 'g'
  )
) || '-' || substr(dp.id::text, 1, 8)
FROM profiles p
WHERE p.id = dp.id AND dp.slug IS NULL;

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_slug ON doctor_profiles(slug);
```

### 3.2 RLS Policies

All policies are `FOR SELECT TO anon` (read-only for anonymous users).

| Table | Policy Name | Condition |
|-------|-------------|-----------|
| `platform_stats` | `anon_read_stats` | `true` (all rows) |
| `medical_specialties` | `anon_read_specialties` | `true` (all rows) |
| `doctor_profiles` | `anon_read_active_doctors` | `is_verified = true AND is_active = true` |
| `profiles` | `anon_read_doctor_profiles` | `role = 'medico' AND id IN (SELECT id FROM doctor_profiles WHERE is_verified = true AND is_active = true)` |
| `doctor_reviews` | `anon_read_reviews` | `doctor_id IN (SELECT id FROM doctor_profiles WHERE is_verified = true AND is_active = true)` |

**Important**: The `profiles` anon policy only exposes rows for verified active doctors. Patient profiles are NEVER exposed to anon. Column filtering (excluding email, telefono, fecha_nacimiento) is enforced at the query layer, not RLS. RLS controls row access; the service layer controls column access.

**Columns exposed via anon queries on `profiles`**: `nombre_completo`, `avatar_url`, `ciudad`, `estado`, `genero`. Never: `email`, `telefono`, `fecha_nacimiento`, `cedula`, `two_factor_secret`.

---

## 4. Simplified Registration

### 4.1 Registration Form (New)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | email input | Yes | Valid email, unique |
| password | password input | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| confirmPassword | password input | Yes | Must match password |
| acceptTerms | checkbox | Yes | Must be checked |
| **Google OAuth** | button | Alternative | One-click, bypasses all fields |

### 4.2 Fields Removed from Registration

Moved to onboarding (post-login, inside dashboard):

| Field | Previous Location | New Location |
|-------|-------------------|--------------|
| `full_name` (nombre_completo) | Register form | Onboarding Step 1 |
| `phone` (telefono) | Register form | Onboarding Step 2 |
| `date_of_birth` (fecha_nacimiento) | Register form | Onboarding Step 1 |
| `gender` (genero) | Register form | Onboarding Step 1 |
| `state` (estado) | Register form | Onboarding Step 2 |
| `city` (ciudad) | Register form | Onboarding Step 2 |

### 4.3 Onboarding Flow

Triggered in `dashboard/layout.tsx` when `!profile.nombre_completo || !profile.estado`.
Rendered as a modal overlay (not a separate page). Skippable but nudges completion.

| Step | Fields | Required |
|------|--------|----------|
| 1 — Personal | nombre_completo, fecha_nacimiento, genero | nombre_completo required |
| 2 — Location | estado (dropdown), ciudad (dropdown, cascades from estado), telefono | estado required |
| 3 — Avatar | avatar_url (file upload to Supabase Storage) | Optional, can skip |

- Each step saves to `profiles` table independently (partial saves allowed)
- Progress persists across sessions (checks DB, not local state)
- Completion triggers `setShowOnboarding(false)` and refreshes profile context

### 4.4 Validation Schema

```ts
// Simplified register schema (replaces old registerSchema usage on register page)
export const simpleRegisterSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Ingresa un email valido'),
  password: z.string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayuscula')
    .regex(/[a-z]/, 'Debe contener al menos una minuscula')
    .regex(/[0-9]/, 'Debe contener al menos un numero'),
  confirmPassword: z.string().min(1, 'Confirma tu contrasena'),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los terminos'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});
```

The old `registerSchema` is preserved in `lib/validations/auth.ts` (not deleted) for backward compatibility.

---

## 5. Theme Specification

### 5.1 Color Tokens (HSL)

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--background` | `0 0% 100%` (#FFF) | `0 0% 7%` (#121212) | Page background |
| `--foreground` | `0 0% 9%` (#171717) | `0 0% 95%` (#F2F2F2) | Primary text |
| `--card` | `0 0% 100%` (#FFF) | `0 0% 10%` (#1A1A1A) | Card backgrounds |
| `--card-foreground` | `0 0% 9%` (#171717) | `0 0% 95%` (#F2F2F2) | Card text |
| `--muted` | `0 0% 96%` (#F5F5F5) | `0 0% 15%` (#262626) | Muted backgrounds (sections) |
| `--muted-foreground` | `0 0% 45%` (#737373) | `0 0% 64%` (#A3A3A3) | Secondary/muted text |
| `--border` | `0 0% 91%` (#E8E8E8) | `0 0% 18%` (#2E2E2E) | Borders, dividers |
| `--ring` | `160 84% 39%` | `160 84% 39%` | Focus rings (emerald, same both modes) |
| `--surface-elevated` | `0 0% 98%` (#FAFAFA) | `0 0% 12%` (#1F1F1F) | Cards on muted background |

Brand colors (`--color-primary-*`, emerald scale) remain unchanged in both modes.

### 5.2 CSS Setup

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Applied in `globals.css`. Tokens set in `:root` (light) and `.dark` (dark).

### 5.3 Component Usage

Components reference tokens as `bg-[hsl(var(--card))]`, `text-[hsl(var(--foreground))]`, etc.

### 5.4 Scope

Dark mode applies ONLY to:
- All `(public)` route pages (built with semantic tokens)
- Root layout `<body>` background
- PublicNavbar, PublicFooter

Dark mode does NOT apply to:
- Dashboard pages (existing hardcoded Tailwind colors, separate future task)
- Auth pages (keep current styling)

### 5.5 ThemeToggle

Three-way toggle: Light / Dark / System. Icon-only button group (Sun, Moon, Laptop).
Uses `useTheme()` from `next-themes`. Renders skeleton until mounted (prevents hydration mismatch).

### 5.6 FOUC Prevention

- `next-themes` with `attribute="class"` + `disableTransitionOnChange`
- `suppressHydrationWarning` on `<html>` element
- `defaultTheme="system"` + `enableSystem`

---

## 6. Scenarios

### 6.1 Landing Page Loads with Real Data

**Scenario: Stats reflect actual database counts**
- **Given** the `platform_stats` table has `doctor_count=47, specialty_count=23, patient_count=1200, avg_rating=4.7`
- **When** an anonymous user visits `/`
- **Then** the stats section shows `47 Doctores`, `23 Especialidades`, `1,200 Pacientes`, `4.7 Satisfaccion`
- **And** the specialty grid shows the top 8 specialties by doctor count from `medical_specialties`
- **And** each specialty card shows its real doctor count

**Scenario: Landing is ISR, not dynamic**
- **Given** the root `page.tsx` exports `revalidate = 60`
- **When** the page is built
- **Then** it generates as Static (ISR) in the Next.js build output
- **And** it re-fetches data at most once per 60 seconds

### 6.2 Public Doctor Search

**Scenario: Search without login**
- **Given** an anonymous user (no session)
- **When** they navigate to `/buscar`
- **Then** the middleware does NOT redirect to `/auth/login`
- **And** the page shows a list of verified active doctors
- **And** the filter panel is functional (specialty, state, price, rating)

**Scenario: Filter by specialty and state**
- **Given** the user is on `/buscar`
- **When** they select specialty "Cardiologia" and state "Miranda"
- **Then** the URL updates to `/buscar?especialidad=cardiologia&estado=Miranda`
- **And** only cardiologists in Miranda are shown
- **And** the result count updates to reflect the filtered total

**Scenario: Empty search results**
- **Given** the user searches for a specialty with no doctors in a specific state
- **When** zero results are returned
- **Then** an empty state message is shown: "No encontramos doctores con estos filtros"
- **And** a suggestion to broaden the search is displayed

### 6.3 Map Drill-Down

**Scenario: SVG state click filters search**
- **Given** the user is on the landing page and sees the Venezuela SVG map
- **When** they hover over "Zulia"
- **Then** a tooltip shows "Zulia — 12 doctores"
- **When** they click "Zulia"
- **Then** they navigate to `/buscar?estado=Zulia`

**Scenario: MapLibre loads on demand**
- **Given** the user is on `/buscar`
- **When** they click "Ver mapa"
- **Then** MapLibre loads asynchronously (shows skeleton during load)
- **And** doctor markers appear clustered at the zoom level
- **When** they click a cluster
- **Then** the map zooms in to show individual markers

### 6.4 Registration + Onboarding

**Scenario: Email registration is minimal**
- **Given** an anonymous user visits `/auth/register`
- **When** they see the form
- **Then** it shows ONLY: email, password, confirm password, accept terms, and Google button
- **And** there are NO fields for name, phone, date of birth, gender, state, or city

**Scenario: Google OAuth registration**
- **Given** an anonymous user clicks "Registrarse con Google"
- **When** OAuth completes successfully
- **Then** the user is redirected to `/dashboard`
- **And** the onboarding modal appears (because `nombre_completo` and `estado` are null)

**Scenario: Onboarding completion**
- **Given** a newly registered user with incomplete profile
- **When** they land on `/dashboard`
- **Then** an onboarding modal appears with step 1 (name, date of birth, gender)
- **When** they complete step 1 and step 2 (state, city, phone)
- **Then** the profile is saved to the `profiles` table
- **And** the modal closes
- **And** the dashboard reflects the updated profile

### 6.5 Theme Switching

**Scenario: Toggle light to dark**
- **Given** the user is on any public page in light mode
- **When** they click the Moon icon in the ThemeToggle
- **Then** the `<html>` element gets class `dark`
- **And** all semantic tokens resolve to dark mode values
- **And** no Flash of Unstyled Content (FOUC) occurs
- **And** the preference is persisted in localStorage

**Scenario: System preference detection**
- **Given** the user has never set a theme preference on Red Salud
- **And** their OS is set to dark mode
- **When** they visit `/`
- **Then** the page renders in dark mode
- **And** the ThemeToggle shows the Laptop icon as active (system mode)

---

## 7. Middleware Changes

### 7.1 Updated Public Paths

```ts
const publicPaths = [
  '/',
  '/especialidades',
  '/buscar',
  '/medicos',
  '/nosotros',
  '/soporte',
  '/seguridad',
  '/para-profesionales',
  '/descargar',
];

const isPublicPath = (pathname: string) => {
  return publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
    || pathname.startsWith('/auth/');
};
```

### 7.2 Public Path Optimization

Public paths skip the `supabase.auth.getUser()` call entirely. The current middleware calls `getUser()` for every request, including `/`. The new middleware:

1. Checks `isPublicPath` first
2. If public: set geo cookie if missing, return `NextResponse.next()` (no auth check)
3. If not public: existing auth check flow

### 7.3 Geo Cookie

- Cookie name: `rs-country`
- Default value: `VE`
- Expiry: 30 days
- Detection: `x-vercel-ip-country` header (on Vercel) or `ipapi.co` fallback
- No URL rewriting in this phase (Venezuela-only)

---

## 8. Acceptance Criteria Checklist

- [ ] All 11 public pages render with correct data
- [ ] Landing shows real counts from `platform_stats`
- [ ] Doctor search works without authentication
- [ ] Venezuela SVG map shows doctor density per state and navigates on click
- [ ] MapLibre loads on `/buscar` map toggle and `/medicos/[slug]` location tab
- [ ] Dark/light theme toggles without FOUC on all public pages
- [ ] Registration form has only email, password, confirm password, terms, and Google OAuth
- [ ] Onboarding modal appears for incomplete profiles in dashboard
- [ ] Onboarding saves partial progress (step-by-step)
- [ ] All public pages have proper `<title>` and `<meta description>`
- [ ] Doctor profile pages include `Physician` JSON-LD
- [ ] Middleware skips `getUser()` for public paths
- [ ] New RLS policies allow anon reads on specified tables
- [ ] No patient data (email, phone, DOB) is exposed via anon queries
- [ ] Lighthouse performance > 90 on landing page
- [ ] `pnpm build` succeeds with public pages as Static/ISR (not forced Dynamic)
