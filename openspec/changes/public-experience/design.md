# Technical Design: Public Experience — Red Salud

**Change**: public-experience
**Status**: Draft
**Based on**: [proposal.md](./proposal.md)
**App**: `apps/paciente/web` (`@red-salud/paciente-web`)

---

## Table of Contents

1. [Architecture Decisions](#1-architecture-decisions)
2. [Component Architecture](#2-component-architecture)
3. [File Structure](#3-file-structure)
4. [Theme System Design](#4-theme-system-design)
5. [Map System Design](#5-map-system-design)
6. [Geo-localization Design](#6-geo-localization-design)
7. [Database Access Design](#7-database-access-design)
8. [Registration Simplification](#8-registration-simplification)
9. [SEO Strategy](#9-seo-strategy)
10. [Dependencies](#10-dependencies)
11. [Migration Plan](#11-migration-plan)

---

## 1. Architecture Decisions

### 1.1 Route Group Structure

Next.js App Router route groups isolate layouts without affecting URL paths. The public experience introduces a `(public)` group alongside the existing `(auth)` implicit group and `dashboard/` segment.

```
src/app/
  layout.tsx                          # Root layout (html, body, ThemeProvider)
  page.tsx                            # Landing page (rewired to public layout)
  (public)/
    layout.tsx                        # Public layout (PublicNavbar + PublicFooter)
    especialidades/
      page.tsx                        # All specialties grid
      [slug]/
        page.tsx                      # Single specialty + doctors in it
    buscar/
      page.tsx                        # Doctor search + filters + map
    medicos/
      page.tsx                        # All doctors directory (redirects to /buscar)
      [slug]/
        page.tsx                      # Public doctor profile
    nosotros/
      page.tsx                        # About Red Salud
    soporte/
      page.tsx                        # Support/FAQ page
    seguridad/
      page.tsx                        # Security & privacy info
    para-profesionales/
      page.tsx                        # Doctor/clinic sign-up CTA
    descargar/
      page.tsx                        # Download mobile apps CTA
  auth/
    login/page.tsx                    # Existing — unchanged
    register/page.tsx                 # Modified — simplified
    callback/page.tsx                 # Existing — unchanged
    forgot-password/page.tsx          # Existing — unchanged
  dashboard/
    layout.tsx                        # Existing — add onboarding check
    ...                               # Existing dashboard pages
```

**Decision**: The root `page.tsx` (landing) stays at `/` but imports the public layout components directly rather than nesting inside `(public)/`. This keeps the landing URL clean (`/` not `/(public)/`) while sharing navbar/footer code via composition.

**Alternative considered**: Moving landing into `(public)/` route group. Rejected because it forces the landing URL into the group's layout.tsx even though `/` is the most important page for SEO and must remain at root.

### 1.2 Layout Hierarchy

```
RootLayout (src/app/layout.tsx)
  |-- html lang="es"
  |-- body with theme class
  |-- ThemeProvider (next-themes)
  |-- CountryProvider (geo context)
  |
  |-- / (Landing)
  |     |-- PublicNavbar
  |     |-- LandingContent (Server Component)
  |     |-- PublicFooter
  |
  |-- (public)/ layout.tsx
  |     |-- PublicNavbar
  |     |-- <main>{children}</main>
  |     |-- PublicFooter
  |
  |-- auth/ (no shared layout — each page is standalone)
  |
  |-- dashboard/ layout.tsx
        |-- OnboardingGuard
        |-- PatientNavbar
        |-- PatientSidebar
        |-- <main>{children}</main>
        |-- MobileTabBar
```

**Key change to root layout**: Remove `export const dynamic = 'force-dynamic'` from root layout. This currently forces ALL pages to be dynamic (including public pages that should be static/ISR). Instead, each route segment declares its own rendering strategy.

### 1.3 Data Fetching Strategy

| Page | Rendering | Data Source | Revalidation |
|------|-----------|-------------|--------------|
| Landing (`/`) | ISR | Server Component + Supabase anon | 60s |
| Specialties (`/especialidades`) | ISR | Server Component + Supabase anon | 300s (5 min) |
| Specialty detail (`/especialidades/[slug]`) | ISR | Server Component + Supabase anon | 120s |
| Doctor search (`/buscar`) | Dynamic (SSR) | Server Component → searchParams | 0 (no cache) |
| Doctor profile (`/medicos/[slug]`) | ISR | Server Component + Supabase anon | 120s |
| Static pages (nosotros, soporte, seguridad, etc.) | Static | No DB queries | Build-time |
| Para profesionales, Descargar | Static | No DB queries | Build-time |

**Server Components** (default) for all public data display pages. No `"use client"` unless the component needs:
- Browser APIs (geolocation, clipboard)
- Event handlers (search input, filter toggles, map interactions)
- React state (theme toggle, mobile menu)

**Client Components** are islands within Server Component pages:
- `SearchForm` — search input with debounced query
- `FilterPanel` — collapsible filter sidebar
- `MapView` — MapLibre interactive map
- `ThemeToggle` — dark/light/system switcher
- `MobileMenuButton` — hamburger menu toggle
- `VenezuelaMapSVG` — interactive SVG with hover states
- `StatsCounter` — animated number counter on scroll

### 1.4 Caching Strategy

```
ISR Pages (revalidate in seconds):
  /                         → 60s   (stats change as doctors join)
  /especialidades           → 300s  (specialties rarely change)
  /especialidades/[slug]    → 120s  (doctor count per specialty)
  /medicos/[slug]           → 120s  (doctor profile, reviews)

Dynamic Pages (no cache):
  /buscar                   → 0     (search results depend on query params)

Static Pages (build-time):
  /nosotros                 → Infinity (only changes on deploy)
  /soporte                  → Infinity
  /seguridad                → Infinity
  /para-profesionales       → Infinity
  /descargar                → Infinity
```

Each ISR page exports:

```ts
export const revalidate = 60; // seconds
```

---

## 2. Component Architecture

### 2.1 Component Tree — Landing Page (`/`)

```
page.tsx (Server Component)
  |
  +-- PublicNavbar (Client — mobile menu, theme toggle)
  |     |-- Logo
  |     |-- NavLinks (Server-rendered list)
  |     |-- ThemeToggle (Client)
  |     |-- MobileMenuButton (Client)
  |     +-- AuthButtons
  |
  +-- HeroSection (Server)
  |     +-- SearchHero (Client — input + submit)
  |     +-- TrustBadges (Server)
  |
  +-- StatsSection (Server — data fetched at build/ISR)
  |     +-- StatsCounter (Client — animated number on scroll)
  |
  +-- SpecialtyGridSection (Server — data from DB)
  |     +-- SpecialtyCard (Server — link to /especialidades/[slug])
  |
  +-- HowItWorksSection (Server — static content)
  |
  +-- VenezuelaMapSection (Server wrapper)
  |     +-- VenezuelaMapSVG (Client — interactive SVG)
  |
  +-- TestimonialsSection (Server — static content for now)
  |
  +-- CTASection (Server — static content)
  |
  +-- PublicFooter (Server)
        |-- FooterLinks
        |-- SocialLinks
        +-- LegalLinks
```

### 2.2 Component Tree — Doctor Search (`/buscar`)

```
page.tsx (Server Component — reads searchParams)
  |
  +-- (public) layout provides PublicNavbar + PublicFooter
  |
  +-- SearchPageContent (Server — initial data fetch)
        |
        +-- SearchHeader (Server)
        |     +-- SearchForm (Client — input, specialty dropdown)
        |
        +-- SearchLayout (Server)
              |
              +-- FilterPanel (Client — collapsible, checkboxes)
              |     |-- SpecialtyFilter
              |     |-- LocationFilter (state/city cascade)
              |     |-- PriceRangeFilter
              |     |-- RatingFilter
              |     |-- InsuranceFilter
              |     +-- GenderFilter
              |
              +-- ResultsArea (Server)
              |     |-- ResultsCount + SortDropdown (Client)
              |     |-- DoctorCardList (Server)
              |     |     +-- DoctorCard (Server — presentational)
              |     |           |-- Avatar, Name, Specialty
              |     |           |-- RatingStars (Server)
              |     |           |-- PriceTag, Location
              |     |           +-- BookButton (link to /medicos/[slug])
              |     +-- Pagination (Client)
              |
              +-- MapToggle (Client — show/hide map)
              +-- MapView (Client — lazy loaded)
                    |-- MapLibre instance
                    +-- DoctorMarkers (clustered)
```

### 2.3 Component Tree — Doctor Profile (`/medicos/[slug]`)

```
page.tsx (Server Component — ISR, fetches doctor data)
  |
  +-- (public) layout provides PublicNavbar + PublicFooter
  |
  +-- DoctorProfileHeader (Server)
  |     |-- Avatar, Name, Specialty, Verified badge
  |     |-- RatingStars + ReviewCount
  |     |-- Location, Experience
  |     +-- BookAppointmentCTA (Client — link to register or dashboard)
  |
  +-- DoctorProfileTabs (Client — tab switching)
  |     |
  |     +-- Tab: Informacion
  |     |     |-- Biography (Server-rendered text)
  |     |     |-- OfficeHours (Server)
  |     |     |-- ConsultationFee (Server)
  |     |     +-- InsuranceInfo (Server)
  |     |
  |     +-- Tab: Ubicacion
  |     |     +-- OfficeMapView (Client — MapLibre single marker)
  |     |
  |     +-- Tab: Opiniones
  |           +-- ReviewsList (Server — paginated)
  |                 +-- ReviewCard (Server — presentational)
  |
  +-- SimilarDoctors (Server — same specialty, same city)
        +-- DoctorCard (Server — reused component)
  |
  +-- JSON-LD Script (Server — structured data)
```

### 2.4 Shared Components Registry

| Component | Location | Server/Client | Props |
|-----------|----------|---------------|-------|
| `PublicNavbar` | `components/public/public-navbar.tsx` | Client | `currentPath?: string` |
| `PublicFooter` | `components/public/public-footer.tsx` | Server | none |
| `ThemeToggle` | `components/theme/theme-toggle.tsx` | Client | `className?: string` |
| `SearchHero` | `components/public/search-hero.tsx` | Client | `defaultQuery?: string` |
| `SpecialtyCard` | `components/public/specialty-card.tsx` | Server | `name, slug, icon, doctorCount, color` |
| `SpecialtyGrid` | `components/public/specialty-grid.tsx` | Server | `specialties: Specialty[]` |
| `StatsCounter` | `components/public/stats-counter.tsx` | Client | `value: number, label: string, suffix?: string` |
| `StatsSection` | `components/public/stats-section.tsx` | Server | `stats: PlatformStats` |
| `DoctorCard` | `components/public/doctor-card.tsx` | Server | `doctor: PublicDoctorProfile` |
| `DoctorCardList` | `components/public/doctor-card-list.tsx` | Server | `doctors: PublicDoctorProfile[]` |
| `RatingStars` | `components/public/rating-stars.tsx` | Server | `rating: number, count?: number` |
| `VenezuelaMapSVG` | `components/public/map/venezuela-map-svg.tsx` | Client | `stateData: StateData[], onStateClick` |
| `MapView` | `components/public/map/map-view.tsx` | Client | `doctors: MapDoctor[], center, zoom` |
| `FilterPanel` | `components/public/search/filter-panel.tsx` | Client | `filters, specialties, onChange` |
| `SearchForm` | `components/public/search/search-form.tsx` | Client | `defaultQuery?, specialties` |
| `Pagination` | `components/public/pagination.tsx` | Client | `page, totalPages, onPageChange` |

### 2.5 Component Classification

**Server Components** (no `"use client"`):
- `PublicFooter` — static HTML, no interactivity
- `SpecialtyCard`, `SpecialtyGrid` — pure presentation from DB data
- `StatsSection` — fetches and displays counts
- `DoctorCard`, `DoctorCardList` — pure presentation
- `RatingStars` — pure presentation from number
- All page-level `page.tsx` files — data fetching at top

**Client Components** (`"use client"`):
- `PublicNavbar` — mobile menu toggle, scroll detection, theme toggle
- `ThemeToggle` — `useTheme()` from next-themes
- `SearchHero`, `SearchForm` — controlled input, form submission
- `StatsCounter` — IntersectionObserver for scroll-triggered animation
- `VenezuelaMapSVG` — hover states, click handlers, SVG manipulation
- `MapView` — MapLibre GL JS (no SSR), marker interactions
- `FilterPanel` — checkbox states, collapsible sections
- `Pagination` — URL manipulation via `useRouter`
- `DoctorProfileTabs` — tab state switching

---

## 3. File Structure

All paths relative to `apps/paciente/web/src/`.

### 3.1 New Files

```
# Public route group
app/(public)/layout.tsx
app/(public)/especialidades/page.tsx
app/(public)/especialidades/[slug]/page.tsx
app/(public)/buscar/page.tsx
app/(public)/medicos/page.tsx
app/(public)/medicos/[slug]/page.tsx
app/(public)/nosotros/page.tsx
app/(public)/soporte/page.tsx
app/(public)/seguridad/page.tsx
app/(public)/para-profesionales/page.tsx
app/(public)/descargar/page.tsx

# Public components
components/public/public-navbar.tsx
components/public/public-footer.tsx
components/public/search-hero.tsx
components/public/specialty-card.tsx
components/public/specialty-grid.tsx
components/public/stats-counter.tsx
components/public/stats-section.tsx
components/public/doctor-card.tsx
components/public/doctor-card-list.tsx
components/public/rating-stars.tsx
components/public/pagination.tsx
components/public/trust-badges.tsx
components/public/how-it-works.tsx
components/public/testimonials-section.tsx
components/public/cta-section.tsx
components/public/hero-section.tsx

# Map components
components/public/map/venezuela-map-svg.tsx
components/public/map/map-view.tsx
components/public/map/doctor-marker.tsx
components/public/map/map-controls.tsx

# Search components
components/public/search/search-form.tsx
components/public/search/filter-panel.tsx
components/public/search/sort-dropdown.tsx
components/public/search/active-filters.tsx

# Doctor profile components
components/public/doctor/doctor-profile-header.tsx
components/public/doctor/doctor-profile-tabs.tsx
components/public/doctor/doctor-info-tab.tsx
components/public/doctor/doctor-location-tab.tsx
components/public/doctor/doctor-reviews-tab.tsx
components/public/doctor/similar-doctors.tsx
components/public/doctor/book-cta.tsx

# Theme components
components/theme/theme-toggle.tsx
components/theme/theme-provider.tsx

# Onboarding components
components/onboarding/onboarding-modal.tsx
components/onboarding/onboarding-steps.tsx

# Service layer
lib/services/public-data-service.ts
lib/services/public-search-service.ts
lib/services/geo-service.ts

# Supabase public client
lib/supabase/public.ts

# GeoJSON/SVG data
lib/data/venezuela-geo.ts
lib/data/venezuela-states-svg-paths.ts

# Context providers
lib/context/country-context.tsx

# Types for public data
lib/types/public.ts
```

### 3.2 Modified Files

```
app/layout.tsx                        # Add ThemeProvider, CountryProvider, remove force-dynamic
app/page.tsx                          # Rewrite to Server Component with real data
app/auth/register/page.tsx            # Simplify to email + Google only
app/dashboard/layout.tsx              # Add OnboardingGuard wrapper
app/globals.css                       # Add dark theme tokens, @custom-variant dark
middleware.ts                         # Add public routes list, geo detection
next.config.ts                        # Add maplibre transpile if needed
```

### 3.3 Service Layer Organization

```
lib/services/
  public-data-service.ts    # Read-only queries: stats, specialties, doctors
  public-search-service.ts  # Search with filters, pagination, sorting
  geo-service.ts            # IP geolocation + cookie management
  booking-service.ts        # Existing — unchanged
  directory-service.ts      # Existing — unchanged (dashboard usage)
  ...                       # Other existing services unchanged
```

**Separation rationale**: Public services use a different Supabase client (anon-only, no auth cookies) and return different shaped data (no private fields). They MUST NOT reuse the dashboard service layer which depends on authenticated client.

---

## 4. Theme System Design

### 4.1 Provider Placement

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/components/theme/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

`ThemeProvider` wraps `next-themes`'s `ThemeProvider` and is a thin Client Component.

The `suppressHydrationWarning` on `<html>` prevents React hydration mismatch when `next-themes` injects the `class="dark"` attribute before hydration.

`disableTransitionOnChange` prevents FOUC during theme switch by temporarily disabling CSS transitions.

### 4.2 CSS Custom Properties

Using Tailwind CSS 4's `@custom-variant` for dark mode:

```css
/* globals.css */
@import 'tailwindcss';

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Existing brand colors — preserved */
  --color-primary: #10B981;
  --color-primary-dark: #059669;
  --color-primary-light: #D1FAE5;
  --color-primary-50: #ECFDF5;
  --color-primary-100: #D1FAE5;
  --color-primary-200: #A7F3D0;
  --color-primary-300: #6EE7B7;
  --color-primary-400: #34D399;
  --color-primary-500: #10B981;
  --color-primary-600: #059669;
  --color-primary-700: #047857;
  --color-primary-800: #065F46;
  --color-primary-900: #064E3B;
  --color-accent: #3B82F6;
  --color-accent-light: #DBEAFE;
}

@layer base {
  :root {
    /* Semantic tokens — Light mode */
    --background: 0 0% 100%;           /* #FFFFFF */
    --foreground: 0 0% 9%;             /* #171717 */
    --card: 0 0% 100%;                 /* #FFFFFF */
    --card-foreground: 0 0% 9%;        /* #171717 */
    --muted: 0 0% 96%;                 /* #F5F5F5 */
    --muted-foreground: 0 0% 45%;      /* #737373 */
    --border: 0 0% 91%;                /* #E8E8E8 */
    --ring: 160 84% 39%;               /* emerald-500 */
    --surface-elevated: 0 0% 98%;      /* #FAFAFA — cards on gray bg */
  }

  .dark {
    /* Semantic tokens — Dark mode */
    --background: 0 0% 7%;             /* #121212 */
    --foreground: 0 0% 95%;            /* #F2F2F2 */
    --card: 0 0% 10%;                  /* #1A1A1A */
    --card-foreground: 0 0% 95%;       /* #F2F2F2 */
    --muted: 0 0% 15%;                 /* #262626 */
    --muted-foreground: 0 0% 64%;      /* #A3A3A3 */
    --border: 0 0% 18%;                /* #2E2E2E */
    --ring: 160 84% 39%;               /* emerald-500 — same in dark */
    --surface-elevated: 0 0% 12%;      /* #1F1F1F */
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
}
```

### 4.3 Tailwind Integration

Components use semantic tokens via `hsl(var(--token))`:

```tsx
// Example usage in components
<div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-[hsl(var(--border))]">
  <p className="text-[hsl(var(--muted-foreground))]">Muted text</p>
</div>
```

For the emerald brand color, it stays the same in both modes since green on dark backgrounds already has sufficient contrast. The primary-* scale remains unchanged.

### 4.4 ThemeToggle Component

Three-way toggle: Light / Dark / System.

```
+------+------+--------+
| Sun  | Moon | Laptop |   (icon-only toggle group)
+------+------+--------+
```

Uses `useTheme()` from `next-themes`. Renders after mount to avoid hydration mismatch (show skeleton until mounted).

### 4.5 Dark Mode Migration Path

The dashboard pages currently hardcode `bg-white`, `text-gray-900`, `bg-gray-50`, etc. These are NOT changed in this phase. Dark mode applies ONLY to:

1. Public pages (new code — built with semantic tokens from day one)
2. Root layout body
3. Public navbar and footer

Dashboard dark mode is a separate future task. This is intentional to keep scope bounded.

---

## 5. Map System Design

### 5.1 Two-Tier Architecture

```
Tier 1: Venezuela SVG Overview
  - Static SVG with 24 state paths
  - Colored by doctor density (heatmap)
  - Click state → filter search results
  - No external library needed
  - ~15KB SVG inline

Tier 2: MapLibre Drill-Down
  - Full interactive map (pan, zoom, markers)
  - Loaded on demand: /buscar page map toggle or /medicos/[slug] location tab
  - Doctor markers with clustering
  - Uses react-map-gl wrapper for React integration
  - Tile source: MapTiler free tier or protomaps
```

### 5.2 Venezuela SVG Component Architecture

```
VenezuelaMapSVG (Client Component)
  |
  Props:
    stateData: Array<{
      stateId: string;      // e.g., "zulia", "miranda"
      stateName: string;    // e.g., "Zulia", "Miranda"
      doctorCount: number;
      color: string;        // computed from density
    }>
    onStateClick: (stateId: string) => void
    selectedState?: string
  |
  Internal:
    - <svg viewBox="0 0 800 700"> with 24 <path> elements
    - Each <path> has:
      - fill computed from doctorCount (gradient: gray-200 → emerald-100 → emerald-500)
      - onMouseEnter → tooltip with state name + count
      - onClick → onStateClick callback
    - Tooltip positioned near cursor via useState
    - selectedState gets a stroke highlight
```

SVG path data stored in `lib/data/venezuela-states-svg-paths.ts`:

```ts
export const VENEZUELA_SVG_PATHS: Record<string, { d: string; center: [number, number] }> = {
  zulia: { d: "M 120 180 L ...", center: [140, 200] },
  miranda: { d: "M 450 320 L ...", center: [470, 340] },
  // ... 24 states
};
```

### 5.3 MapLibre Integration

```
MapView (Client Component — dynamic import, ssr: false)
  |
  Props:
    doctors: Array<{
      id: string;
      slug: string;
      name: string;
      specialty: string;
      lat: number;
      lng: number;
      rating: number | null;
      avatarUrl: string | null;
    }>
    center?: [lng, lat]    // default: Venezuela center [-66.58, 6.42]
    zoom?: number          // default: 6 (country view)
    onDoctorClick?: (slug: string) => void
  |
  Internal:
    - react-map-gl <Map> component with MapLibre
    - <Source type="geojson"> with FeatureCollection of doctor points
    - <Layer type="circle"> for individual markers
    - Clustering via GeoJSON source with cluster: true
    - Cluster layer: circle with count label
    - Click cluster → zoom in (flyTo)
    - Click marker → popup with DoctorMarkerPopup
    - MapControls: zoom +/-, geolocate, fullscreen
```

Dynamic import pattern:

```tsx
// In page or parent component
import dynamic from 'next/dynamic';

const MapView = dynamic(
  () => import('@/components/public/map/map-view'),
  { ssr: false, loading: () => <MapSkeleton /> }
);
```

### 5.4 GeoJSON Data Structure

For doctor markers (fetched from Supabase, not static):

```ts
interface DoctorGeoJSON {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [number, number]; // [lng, lat]
    };
    properties: {
      id: string;
      slug: string;
      name: string;
      specialty: string;
      rating: number | null;
      avatarUrl: string | null;
      city: string;
      state: string;
    };
  }>;
}
```

For state boundaries (static, bundled):

```ts
// lib/data/venezuela-geo.ts
export const VENEZUELA_STATES_GEO: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { stateId: "zulia", name: "Zulia" },
      geometry: { type: "Polygon", coordinates: [...] }
    },
    // ... 24 states
  ]
};
```

This file will be ~200KB. Strategy: lazy import only when MapLibre view is active.

### 5.5 Doctor Marker Clustering Strategy

Using MapLibre's native GeoJSON clustering:

```ts
// Source configuration
{
  type: "geojson",
  data: doctorGeoJSON,
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50
}
```

Cluster layers:
1. **Cluster circles** — radius scales with point_count (20px for 2-10, 30px for 10-50, 40px for 50+)
2. **Cluster count labels** — white text on emerald circle
3. **Individual markers** — small emerald dot with white border

Zoom thresholds:
- Zoom 6-8: State-level clusters
- Zoom 9-11: City-level clusters
- Zoom 12+: Individual markers visible

### 5.6 Data Flow: Database to Map

```
Supabase (doctor_profiles + profiles)
  |
  v
public-search-service.ts
  |  - Query: SELECT id, slug, nombre_completo, specialty, latitud, longitud, ciudad, estado
  |  - Filter: verified = true, is_active = true, latitud IS NOT NULL
  |  - Return: PublicDoctorMapPoint[]
  v
Page Server Component (/buscar)
  |  - Fetch on server, pass to client as prop
  v
MapView Client Component
  |  - Convert to GeoJSON FeatureCollection
  |  - Render via react-map-gl
  v
MapLibre GL JS renders tiles + markers
```

**Note on coordinates**: Currently `doctor_profiles` does not have `latitud`/`longitud` columns. Two options:

1. **Option A**: Add `latitud FLOAT, longitud FLOAT` columns to `doctor_profiles`. Doctors set coordinates when configuring their office. This is the correct long-term approach.
2. **Option B**: Geocode from `estado` + `ciudad` at query time using a lookup table of city center coordinates. Less accurate but works immediately.

**Recommendation**: Implement Option B first (city-center coordinates from a static lookup in `lib/data/venezuela-geo.ts`), then migrate to Option A when the doctor app adds office address management. The map will show doctors at city-center level initially, which is acceptable for a country-level overview.

---

## 6. Geo-localization Design

### 6.1 Middleware Flow

```
Request arrives
  |
  v
Check pathname:
  Is it /_next/* or /api/* or static asset?
    YES → pass through, skip geo logic
    NO  → continue
  |
  v
Check cookie `rs-country`:
  EXISTS → use stored country code
  MISSING → detect via IP
    |
    v
  IP Detection:
    Read x-forwarded-for or request IP
    Call ipapi.co/json/ (or Vercel's x-vercel-ip-country header)
    Map to country code (VE, CO, etc.)
    Fallback: "VE" (default for Venezuela-first platform)
    Set cookie `rs-country` with 30-day expiry
  |
  v
Determine if URL has country prefix:
  /ve/buscar → already prefixed, continue
  /buscar    → rewrite to /ve/buscar (internal rewrite, URL stays the same)
  |
  v
Continue to page rendering
```

### 6.2 URL Structure

For NOW (Venezuela-only), the geo prefix is **invisible to users**. The middleware rewrites internally but the browser URL stays clean:

```
User sees:       /buscar
Internal route:  /buscar (no rewrite needed — single country)
Cookie:          rs-country=VE
```

When multi-country launches (future):

```
User sees:       /co/buscar
Internal route:  /[country]/buscar
Cookie:          rs-country=CO
```

**Decision**: Do NOT add `[country]` route segments now. The current implementation just sets a cookie and provides a React context. Pages read the country from context/cookie when making queries. The URL rewriting with country prefix is a future task.

### 6.3 Country Context Provider

```tsx
// lib/context/country-context.tsx
"use client";

import { createContext, useContext } from 'react';

export interface CountryConfig {
  code: string;           // "VE"
  name: string;           // "Venezuela"
  currency: string;       // "VES"
  locale: string;         // "es-VE"
  timezone: string;       // "America/Caracas"
  phonePrefix: string;    // "+58"
  flag: string;           // "🇻🇪"
}

const COUNTRIES: Record<string, CountryConfig> = {
  VE: {
    code: "VE",
    name: "Venezuela",
    currency: "VES",
    locale: "es-VE",
    timezone: "America/Caracas",
    phonePrefix: "+58",
    flag: "\u{1F1FB}\u{1F1EA}",
  },
  // Future: CO, EC, PE, etc.
};

const CountryContext = createContext<CountryConfig>(COUNTRIES.VE);

export function CountryProvider({ countryCode, children }: {
  countryCode: string;
  children: React.ReactNode;
}) {
  const config = COUNTRIES[countryCode] ?? COUNTRIES.VE;
  return (
    <CountryContext.Provider value={config}>
      {children}
    </CountryContext.Provider>
  );
}

export const useCountry = () => useContext(CountryContext);
```

The root layout reads the country from cookies (Server Component can read cookies) and passes it to CountryProvider.

### 6.4 Middleware Changes

```ts
// middleware.ts — updated public paths list
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

Key change: public paths skip the `getUser()` call entirely, avoiding unnecessary Supabase auth overhead on pages that don't need authentication.

```
Middleware flow for public pages:

  Request → is public path?
    YES → skip auth check → set geo cookie if missing → NextResponse.next()
    NO  → existing auth check flow (getUser, redirect if no session)
```

This is a performance win: public pages avoid the Supabase auth round-trip entirely.

---

## 7. Database Access Design

### 7.1 Public Supabase Client

Public pages use the anon key directly WITHOUT auth cookies. This ensures RLS policies for anon role apply consistently.

```ts
// lib/supabase/public.ts
import { createClient } from '@supabase/supabase-js';

// Singleton — no auth state, no cookie management
// Used ONLY by public-data-service.ts and public-search-service.ts
export const publicSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

This is intentionally different from `lib/supabase/server.ts` (which uses `createServerClient` with cookie-based auth) and `lib/supabase/client.ts` (which uses `createBrowserClient`).

**Why not use the server client?** The server client reads auth cookies and attaches user context. Public pages have no user — using the server client would create an unnecessary dependency on the cookie store and potentially leak auth context into public queries.

### 7.2 Required RLS Policy Changes

Current state: `doctor_profiles` and `medical_specialties` likely have RLS enabled but may lack policies for the `anon` role.

**New RLS policies needed:**

```sql
-- Allow anon to read active/verified doctor profiles (public data only)
CREATE POLICY "anon_read_active_doctors"
  ON doctor_profiles
  FOR SELECT
  TO anon
  USING (verified = true AND is_active = true);

-- Allow anon to read the profiles table (public fields only)
-- Note: This is safe because we SELECT only specific columns in the service layer.
-- RLS controls row access; column filtering happens in the query.
CREATE POLICY "anon_read_public_profiles"
  ON profiles
  FOR SELECT
  TO anon
  USING (
    role = 'medico' AND
    id IN (SELECT profile_id FROM doctor_profiles WHERE verified = true AND is_active = true)
  );

-- Allow anon to read all specialties
CREATE POLICY "anon_read_specialties"
  ON medical_specialties
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon to read doctor reviews (public)
CREATE POLICY "anon_read_reviews"
  ON doctor_reviews
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon to read doctor availability (for display, not booking)
CREATE POLICY "anon_read_doctor_availability"
  ON doctor_availability
  FOR SELECT
  TO anon
  USING (
    doctor_id IN (SELECT profile_id FROM doctor_profiles WHERE verified = true AND is_active = true)
    AND activo = true
  );
```

### 7.3 Query Patterns by Page

**Landing page — Platform stats:**

```ts
// public-data-service.ts
export async function getPlatformStats(): Promise<PlatformStats> {
  const [doctors, specialties, patients] = await Promise.all([
    publicSupabase
      .from('doctor_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('verified', true)
      .eq('is_active', true),
    publicSupabase
      .from('medical_specialties')
      .select('id', { count: 'exact', head: true }),
    publicSupabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'paciente'),
  ]);

  return {
    doctorCount: doctors.count ?? 0,
    specialtyCount: specialties.count ?? 0,
    patientCount: patients.count ?? 0,
  };
}
```

Note: The `patients` count query requires an anon policy on `profiles` for role=paciente. Alternatively, maintain a `platform_stats` materialized view or a simple counter table that is updated by a trigger. The counter table approach is better for performance at scale.

**Alternative — Stats counter table:**

```sql
-- Separate stats table, updated by triggers
CREATE TABLE platform_stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  doctor_count INT DEFAULT 0,
  specialty_count INT DEFAULT 0,
  patient_count INT DEFAULT 0,
  appointment_count INT DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: anon can read
CREATE POLICY "anon_read_stats" ON platform_stats FOR SELECT TO anon USING (true);
```

**Recommendation**: Use the counter table approach. It avoids COUNT(*) queries on large tables and avoids exposing patient data to anon role.

**Specialties page:**

```ts
export async function getSpecialtiesWithDoctorCount(): Promise<SpecialtyWithCount[]> {
  const { data, error } = await publicSupabase
    .from('medical_specialties')
    .select(`
      id,
      name,
      slug,
      description,
      icon,
      doctor_profiles!inner(id)
    `)
    .eq('doctor_profiles.verified', true)
    .eq('doctor_profiles.is_active', true);

  if (error) throw error;

  return (data ?? []).map(s => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    icon: s.icon,
    doctorCount: Array.isArray(s.doctor_profiles) ? s.doctor_profiles.length : 0,
  }));
}
```

**Doctor search:**

```ts
export async function searchDoctors(params: SearchParams): Promise<SearchResult> {
  let query = publicSupabase
    .from('doctor_profiles')
    .select(`
      id,
      slug,
      consultation_fee,
      accepts_insurance,
      anos_experiencia,
      biografia,
      profile:profiles!inner(
        nombre_completo, avatar_url, ciudad, estado
      ),
      specialty:medical_specialties!inner(
        id, name, slug
      )
    `, { count: 'exact' })
    .eq('verified', true)
    .eq('is_active', true);

  // Apply filters
  if (params.specialtySlug) {
    query = query.eq('specialty.slug', params.specialtySlug);
  }
  if (params.state) {
    query = query.eq('profile.estado', params.state);
  }
  if (params.city) {
    query = query.eq('profile.ciudad', params.city);
  }
  if (params.acceptsInsurance) {
    query = query.eq('accepts_insurance', true);
  }
  if (params.q) {
    // Full-text search on doctor name or specialty name
    query = query.or(
      `profile.nombre_completo.ilike.%${params.q}%,specialty.name.ilike.%${params.q}%`
    );
  }

  // Pagination
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const from = (page - 1) * limit;

  query = query.range(from, from + limit - 1);

  // Sort
  switch (params.sortBy) {
    case 'price_asc':
      query = query.order('consultation_fee', { ascending: true, nullsFirst: false });
      break;
    case 'price_desc':
      query = query.order('consultation_fee', { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order('anos_experiencia', { ascending: false, nullsFirst: false });
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    doctors: data ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}
```

**Doctor profile:**

```ts
export async function getDoctorBySlug(slug: string): Promise<PublicDoctorProfile | null> {
  const { data, error } = await publicSupabase
    .from('doctor_profiles')
    .select(`
      id, slug, consultation_fee, accepts_insurance,
      anos_experiencia, biografia, verified,
      profile:profiles!inner(
        nombre_completo, avatar_url, ciudad, estado, genero
      ),
      specialty:medical_specialties!inner(
        id, name, slug
      )
    `)
    .eq('slug', slug)
    .eq('verified', true)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  // Fetch reviews separately
  const { data: reviews } = await publicSupabase
    .from('doctor_reviews')
    .select('id, rating, comment, created_at, reviewer:profiles!reviewer_id(nombre_completo)')
    .eq('doctor_id', data.id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Compute avg rating
  const ratings = (reviews ?? []).map(r => r.rating);
  const avgRating = ratings.length > 0
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  return {
    ...data,
    reviews: reviews ?? [],
    avgRating,
    reviewCount: ratings.length,
  };
}
```

### 7.4 Doctor Slug Requirement

The proposal uses `/medicos/[slug]` URLs. Currently `doctor_profiles` may not have a `slug` column.

**Required migration:**

```sql
ALTER TABLE doctor_profiles ADD COLUMN slug TEXT UNIQUE;

-- Backfill: generate slugs from doctor name
UPDATE doctor_profiles dp
SET slug = lower(
  regexp_replace(
    regexp_replace(
      unaccent(p.nombre_completo),
      '[^a-zA-Z0-9]+', '-', 'g'
    ),
    '(^-|-$)', '', 'g'
  )
) || '-' || substr(dp.id::text, 1, 8)
FROM profiles p
WHERE p.id = dp.profile_id AND dp.slug IS NULL;

-- Index for fast lookup
CREATE INDEX idx_doctor_profiles_slug ON doctor_profiles(slug);
```

Slug format: `maria-garcia-a1b2c3d4` (name + first 8 chars of UUID for uniqueness).

---

## 8. Registration Simplification

### 8.1 Current vs New Registration Flow

```
CURRENT (heavy):
  Register page → 10+ fields
    - Full name *
    - Email *
    - Phone
    - Date of birth *
    - Gender
    - State *
    - City *
    - Password *
    - Confirm password *
    - Accept terms *
  → Submit → Email verification → Login → Dashboard

NEW (minimal):
  Register page → 3 fields + Google
    - Email *
    - Password *
    - Accept terms *
    OR
    - Google OAuth (1 click)
  → Submit → Email verification → Login → Dashboard → Onboarding modal

ONBOARDING (in dashboard, post-login):
  Modal (3 steps, skippable):
    Step 1: Full name, date of birth, gender
    Step 2: State, city, phone
    Step 3: Avatar upload (optional)
  → Save to profile → Close modal → Dashboard
```

### 8.2 Onboarding Guard in Dashboard Layout

```tsx
// dashboard/layout.tsx — add onboarding check
export default function DashboardLayout({ children }) {
  // ... existing code ...
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if profile is incomplete (missing nombre_completo or estado)
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('nombre_completo, estado, ciudad, fecha_nacimiento')
        .eq('id', user.id)
        .single();

      const isIncomplete = !profile?.nombre_completo || !profile?.estado;
      setShowOnboarding(isIncomplete);
    };
    checkProfile();
  }, []);

  return (
    <div>
      {/* ... existing layout ... */}
      {children}
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
```

### 8.3 New Register Schema

```ts
// lib/validations/auth.ts — add simplified schema
export const simpleRegisterSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Ingresa un email valido'),
  password: z
    .string()
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

The existing `registerSchema` is preserved (not deleted) for backward compatibility with any code that references it.

---

## 9. SEO Strategy

### 9.1 Metadata per Page

Each public page exports `Metadata` from Next.js:

```ts
// Example: /especialidades/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const specialty = await getSpecialtyBySlug(params.slug);
  if (!specialty) return { title: 'Especialidad no encontrada' };

  return {
    title: `${specialty.name} - Doctores en Venezuela | Red Salud`,
    description: `Encuentra los mejores doctores de ${specialty.name} en Venezuela. ${specialty.doctorCount} especialistas verificados disponibles.`,
    openGraph: {
      title: `${specialty.name} | Red Salud`,
      description: `${specialty.doctorCount} doctores de ${specialty.name} verificados en Red Salud.`,
      type: 'website',
    },
  };
}
```

### 9.2 JSON-LD Structured Data

For doctor profile pages (`/medicos/[slug]`):

```tsx
// Physician schema
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Physician",
  "name": doctor.profile.nombre_completo,
  "medicalSpecialty": doctor.specialty.name,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": doctor.profile.ciudad,
    "addressRegion": doctor.profile.estado,
    "addressCountry": "VE"
  },
  "aggregateRating": doctor.avgRating ? {
    "@type": "AggregateRating",
    "ratingValue": doctor.avgRating,
    "reviewCount": doctor.reviewCount
  } : undefined,
})}
</script>
```

For the landing page:

```tsx
// MedicalOrganization + WebSite schema
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "name": "Red Salud",
  "url": "https://redsalud.ve",
  "description": "Plataforma de salud digital para Venezuela",
  "areaServed": { "@type": "Country", "name": "Venezuela" },
})}
</script>
```

### 9.3 Static Generation for Doctor Profiles

```ts
// /medicos/[slug]/page.tsx
export async function generateStaticParams() {
  const { data } = await publicSupabase
    .from('doctor_profiles')
    .select('slug')
    .eq('verified', true)
    .eq('is_active', true)
    .limit(500); // Pre-generate top 500

  return (data ?? []).map(d => ({ slug: d.slug }));
}

export const revalidate = 120; // Re-generate every 2 minutes
```

---

## 10. Dependencies

### 10.1 New npm Packages

```json
{
  "next-themes": "^0.4.4",
  "react-map-gl": "^7.1.8",
  "maplibre-gl": "^4.7.1"
}
```

| Package | Size (gzipped) | Purpose | Alternative Considered |
|---------|---------------|---------|----------------------|
| `next-themes` | ~2KB | Theme switching with SSR support | Manual implementation — rejected (handles FOUC, system preference, storage) |
| `react-map-gl` | ~45KB | React wrapper for MapLibre GL | Direct maplibre-gl — rejected (imperative API harder to manage in React) |
| `maplibre-gl` | ~200KB | Open-source map renderer | Leaflet (~40KB) — rejected (no vector tiles, worse mobile perf); Google Maps — rejected (not free) |

### 10.2 Configuration Changes

**next.config.ts** — no changes needed. `maplibre-gl` and `react-map-gl` don't require transpilation.

**postcss.config.mjs** — no changes needed. Already configured for Tailwind CSS 4.

**package.json** — add the three packages above.

### 10.3 MapLibre Tile Source

MapLibre requires a tile source. Options:

1. **MapTiler free tier** — 100K map loads/month, requires API key stored in env
2. **Protomaps** — self-hosted PMTiles on R2/S3, no API key, ~$0 cost
3. **OpenFreeMap** — free community tiles, no key needed

**Recommendation**: Use OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`) for development and initial launch. Migrate to Protomaps self-hosted if traffic exceeds free tier.

Environment variable: `NEXT_PUBLIC_MAP_STYLE_URL` (optional, defaults to OpenFreeMap).

---

## 11. Migration Plan

### Phase Sequence

```
Phase 1: Foundation (non-breaking)
  - Add theme system (globals.css + ThemeProvider + ThemeToggle)
  - Create public Supabase client
  - Create public data service
  - Add RLS policies for anon reads
  - Add doctor_profiles.slug column + migration
  - Create platform_stats table + migration

Phase 2: Public Layout & Components
  - PublicNavbar, PublicFooter components
  - SpecialtyCard, DoctorCard, RatingStars, StatsCounter components
  - SearchForm, FilterPanel components
  - Pagination component

Phase 3: Landing Page Rewrite
  - Rewrite app/page.tsx as Server Component with real data
  - Wire up stats from platform_stats table
  - Wire up specialties from medical_specialties
  - Add VenezuelaMapSVG component with state data

Phase 4: Public Pages
  - /especialidades + /especialidades/[slug]
  - /buscar (search + filters)
  - /medicos/[slug] (doctor profile)
  - /medicos (redirect to /buscar)
  - Static pages: /nosotros, /soporte, /seguridad, /para-profesionales, /descargar

Phase 5: Map Integration
  - MapLibre setup + MapView component
  - Doctor markers on /buscar
  - Single-marker map on /medicos/[slug]

Phase 6: Registration + Onboarding
  - Simplify register page
  - Add onboarding modal to dashboard

Phase 7: Middleware + Geo
  - Update middleware with public paths (skip auth)
  - Add geo cookie logic
  - CountryProvider in root layout

Phase 8: SEO + Polish
  - Metadata for all pages
  - JSON-LD structured data
  - generateStaticParams for doctor profiles
  - OpenGraph images
```

### Key Constraint

Root layout currently has `export const dynamic = 'force-dynamic'`. This MUST be removed in Phase 1, but each dashboard page that relies on dynamic rendering needs `export const dynamic = 'force-dynamic'` added individually, or the data fetching pattern needs to use `cookies()` / `headers()` which automatically opt into dynamic rendering. The dashboard layout already reads cookies via Supabase server client, so removing the root-level force-dynamic should not break dashboard pages — they will automatically be dynamic due to cookie reads.

**Verification step**: After removing `force-dynamic` from root layout, run `pnpm build` and check the build output. Pages reading cookies/headers will show as Dynamic (D), and static pages will show as Static (S).

---

## Appendix A: Type Definitions

```ts
// lib/types/public.ts

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
  icon: string | null;
  doctorCount: number;
}

export interface PublicDoctorProfile {
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

export interface PublicDoctorDetail extends PublicDoctorProfile {
  reviews: PublicReview[];
  officeHours: OfficeHours[];
}

export interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerName: string;
}

export interface OfficeHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
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

export interface SearchParams {
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
  limit?: number;
}

export interface SearchResult {
  doctors: PublicDoctorProfile[];
  total: number;
  page: number;
  totalPages: number;
}
```

## Appendix B: City Coordinates Lookup

For the MapView before doctors have explicit lat/lng, a static lookup maps cities to approximate coordinates:

```ts
// lib/data/venezuela-geo.ts (partial)
export const CITY_COORDINATES: Record<string, [number, number]> = {
  // [lng, lat] — GeoJSON order
  "Caracas": [-66.9036, 10.4806],
  "Maracaibo": [-71.6125, 10.6427],
  "Valencia": [-68.0039, 10.1579],
  "Barquisimeto": [-69.3570, 10.0647],
  "Maracay": [-67.5911, 10.2442],
  "Ciudad Guayana": [-62.6500, 8.3500],
  "Barcelona": [-64.6867, 10.1364],
  "Maturin": [-63.1833, 9.7500],
  "Puerto La Cruz": [-64.6306, 10.2167],
  "Cumana": [-64.1667, 10.4500],
  "Merida": [-71.1433, 8.5897],
  "San Cristobal": [-72.2333, 7.7667],
  "Porlamar": [-63.8617, 11.0000],
  "Coro": [-69.6833, 11.4000],
  // ... remaining cities from VENEZUELA_STATES
};
```

This provides reasonable map placement (~city center) until per-doctor coordinates exist.
