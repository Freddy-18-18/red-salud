# Tasks: Public Experience — Red Salud

**Change**: public-experience
**Status**: Draft
**Based on**: [proposal.md](./proposal.md), [spec.md](./spec.md), [design.md](./design.md)
**App**: `apps/paciente/web` (`@red-salud/paciente-web`)

All file paths are relative to `apps/paciente/web/src/` unless stated otherwise.

---

## Phase 0: Infrastructure

These tasks establish the foundation. Everything else depends on them.

### Task 0.1: Install npm dependencies

- **Files**: `apps/paciente/web/package.json`
- **Depends on**: None
- **Description**: Install `next-themes@^0.4.4`, `react-map-gl@^7.1.8`, and `maplibre-gl@^4.7.1` in the paciente web app. Use `pnpm --filter @red-salud/paciente-web add next-themes react-map-gl maplibre-gl`. Verify they appear in `package.json` dependencies.
- **Acceptance**: `pnpm install` succeeds. All three packages appear in `apps/paciente/web/package.json` under `dependencies`.

### Task 0.2: Theme system — CSS tokens and dark variant

- **Files**:
  - `app/globals.css` (modify)
- **Depends on**: 0.1
- **Description**: Add the `@custom-variant dark (&:where(.dark, .dark *));` directive to `globals.css`. Add semantic color tokens in `@layer base` for `:root` (light) and `.dark` (dark) as specified in design section 4.2. Tokens: `--background`, `--foreground`, `--card`, `--card-foreground`, `--muted`, `--muted-foreground`, `--border`, `--ring`, `--surface-elevated`. Add the `body` rule setting `background-color: hsl(var(--background))` and `color: hsl(var(--foreground))`. Preserve all existing `@theme` brand colors.
- **Acceptance**: Both `:root` and `.dark` token blocks exist in `globals.css`. The `@custom-variant dark` directive is present. Existing brand colors (`--color-primary-*`, `--color-accent`) are untouched.

### Task 0.3: Theme system — ThemeProvider and ThemeToggle components

- **Files**:
  - `components/theme/theme-provider.tsx` (create)
  - `components/theme/theme-toggle.tsx` (create)
- **Depends on**: 0.2
- **Description**: Create a `ThemeProvider` client component that wraps `next-themes`'s `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, and `disableTransitionOnChange`. Create a `ThemeToggle` client component with a three-way toggle (Sun/Moon/Laptop icons) using `useTheme()`. The toggle must render a skeleton placeholder until mounted (avoid hydration mismatch). Use lucide-react icons.
- **Acceptance**: Both components export correctly. `ThemeToggle` shows three icon buttons. Clicking each sets the theme to light/dark/system. No hydration warnings in console.

### Task 0.4: Wire ThemeProvider into root layout and remove force-dynamic

- **Files**:
  - `app/layout.tsx` (modify)
- **Depends on**: 0.3
- **Description**: Import and wrap `{children}` with `ThemeProvider` in the root layout. Add `suppressHydrationWarning` to the `<html>` tag. Set `lang="es"` on `<html>` if not already set. Remove `export const dynamic = 'force-dynamic'` from the root layout (this is critical — it currently forces ALL pages to be dynamic). Dashboard pages will remain dynamic automatically because they read cookies via the Supabase server client.
- **Acceptance**: `ThemeProvider` wraps children in root layout. `suppressHydrationWarning` is on `<html>`. No `export const dynamic = 'force-dynamic'` in root layout. `pnpm build` succeeds (dashboard pages still show as Dynamic due to cookie reads; static pages are no longer forced dynamic).

### Task 0.5: Public Supabase client

- **Files**:
  - `lib/supabase/public.ts` (create)
- **Depends on**: None
- **Description**: Create a singleton Supabase client using `createClient` (NOT `createServerClient`) with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. This client has no auth state, no cookies. It is used exclusively by public service functions. Add a comment explaining why it is separate from the server client.
- **Acceptance**: File exports `publicSupabase`. It uses `createClient` from `@supabase/supabase-js` (not the SSR package). No reference to cookies or auth.

### Task 0.6: Public types

- **Files**:
  - `lib/types/public.ts` (create)
- **Depends on**: None
- **Description**: Create all TypeScript interfaces from spec section 2.1: `PlatformStats`, `PublicSpecialty`, `PublicDoctor`, `PublicDoctorDetail`, `PublicReview`, `DoctorSchedule`, `DoctorLocation`, `MapDoctorPoint`, `StateMapData`, `SearchFilters`, `SearchResults`. Copy them exactly as specified.
- **Acceptance**: All 11 interfaces/types are exported. File compiles without errors.

### Task 0.7: Database migrations — platform_stats, slugs, RLS policies

- **Files**:
  - `supabase/migrations/YYYYMMDDHHMMSS_public_experience_schema.sql` (create, at repo root)
- **Depends on**: None
- **Description**: Create a single migration file with three sections: (1) Create `platform_stats` table with `id TEXT PRIMARY KEY DEFAULT 'global'`, counter columns, and seed row as per spec section 3.1. (2) Add `slug TEXT UNIQUE` column to `medical_specialties` with backfill using `unaccent()` + `regexp_replace()` and index. (3) Add `slug TEXT UNIQUE` column to `doctor_profiles` with backfill (name + first 8 chars of UUID) and index. (4) Create all 5 RLS policies from spec section 3.2: `anon_read_stats`, `anon_read_specialties`, `anon_read_active_doctors`, `anon_read_doctor_profiles`, `anon_read_reviews`. All policies are `FOR SELECT TO anon`.
- **Acceptance**: Migration SQL is syntactically valid. All CREATE TABLE, ALTER TABLE, CREATE POLICY, CREATE INDEX statements are present. Policies use the exact conditions from the spec (e.g., `anon_read_doctor_profiles` checks `role = 'medico'` and subquery on `doctor_profiles`).

### Task 0.8: Public data service layer

- **Files**:
  - `lib/services/public-data-service.ts` (create)
  - `lib/services/public-search-service.ts` (create)
- **Depends on**: 0.5, 0.6
- **Description**: Create `public-data-service.ts` with functions: `getPlatformStats()`, `getSpecialtiesWithDoctorCount()`, `getTopSpecialties(limit)`, `getSpecialtyBySlug(slug)`, `getDoctorBySlug(slug)`, `getDoctorReviews(doctorId, limit)`, `getSimilarDoctors(specialtyId, state, excludeId, limit)`, `getStateDoctorCounts()`. Create `public-search-service.ts` with `searchDoctors(filters: SearchFilters)` and `getDoctorsForMap(filters?)`. All functions use `publicSupabase`, select only public-safe columns (never email, telefono, fecha_nacimiento, cedula), and follow the query patterns from design section 7.3. All functions filter by `is_verified = true AND is_active = true` for doctor queries.
- **Acceptance**: Both files export all listed functions. Column selections match the spec (only public fields). The `searchDoctors` function supports all `SearchFilters` fields (q, specialtySlug, state, city, acceptsInsurance, minRating, maxPrice, gender, sortBy, page, limit). No private data fields appear in any query.

### Task 0.9: Public layout with navbar and footer

- **Files**:
  - `app/(public)/layout.tsx` (create)
  - `components/public/public-navbar.tsx` (create)
  - `components/public/public-footer.tsx` (create)
- **Depends on**: 0.3
- **Description**: Create the `(public)` route group layout that renders `PublicNavbar` + `<main>{children}</main>` + `PublicFooter`. The `PublicNavbar` is a client component with: logo linking to `/`, navigation links (Especialidades, Buscar Doctores, Nosotros, Soporte), ThemeToggle, auth buttons (Iniciar Sesion / Registrarse linking to `/auth/login` and `/auth/register`), and a mobile hamburger menu. The navbar should be sticky with a transparent-to-solid background transition on scroll. The `PublicFooter` is a server component with: link columns (Plataforma, Para Profesionales, Legal, Soporte), social links, copyright, and a country selector placeholder. Both components use semantic tokens (`hsl(var(--background))`, etc.) for dark mode compatibility.
- **Acceptance**: `(public)/layout.tsx` wraps children with navbar and footer. Navbar renders all specified links and ThemeToggle. Footer renders link columns. Both components use semantic CSS tokens (no hardcoded `bg-white` or `text-gray-900`). Mobile menu toggles open/closed.

### Task 0.10: Middleware — public paths skip auth

- **Files**:
  - `middleware.ts` (modify, at `apps/paciente/web/src/middleware.ts`)
- **Depends on**: None
- **Description**: Update the middleware to define a `publicPaths` array with all 9 public routes (`/`, `/especialidades`, `/buscar`, `/medicos`, `/nosotros`, `/soporte`, `/seguridad`, `/para-profesionales`, `/descargar`). Add `isPublicPath()` function that matches exact paths and path prefixes (e.g., `/especialidades/cardiologia`). Also match `/auth/*`. For public paths: skip the `supabase.auth.getUser()` call entirely and return `NextResponse.next()` immediately. For non-public paths: keep the existing auth check flow unchanged.
- **Acceptance**: Visiting any public path no longer triggers a Supabase auth call. Dashboard paths still require auth. The `isPublicPath` function correctly matches both exact routes and sub-routes.

---

## Phase 1: Landing Page

### Task 1.1: Hero section with search bar

- **Files**:
  - `components/public/hero-section.tsx` (create)
  - `components/public/search-hero.tsx` (create)
  - `components/public/trust-badges.tsx` (create)
- **Depends on**: 0.9
- **Description**: Create `HeroSection` (server component) as the landing page hero with headline ("Encuentra al medico ideal en Venezuela"), subtitle, and background gradient. Create `SearchHero` (client component) with a search input and "Buscar" button that navigates to `/buscar?q={query}` on submit. Supports an optional specialty dropdown. Create `TrustBadges` (server component) showing 3 badges: "Doctores Verificados", "Citas en Minutos", "100% Gratuito". All components use semantic tokens.
- **Acceptance**: Hero renders with headline, search input, and trust badges. Typing a query and submitting navigates to `/buscar?q=...`. Trust badges display 3 items with icons.

### Task 1.2: Stats section with animated counters

- **Files**:
  - `components/public/stats-section.tsx` (create)
  - `components/public/stats-counter.tsx` (create)
- **Depends on**: 0.8
- **Description**: Create `StatsSection` (server component) that receives `PlatformStats` as prop and renders 4 stat cards: doctor count, specialty count, patient count, avg rating. Create `StatsCounter` (client component) that animates a number from 0 to target value using `IntersectionObserver` (starts animation when the element scrolls into view). The counter should format numbers with locale `es-VE` (e.g., "1.200"). Accepts `value`, `label`, and optional `suffix` props.
- **Acceptance**: Stats section displays 4 cards. Numbers animate from 0 to target when scrolled into view. Numbers format with Venezuelan locale separators.

### Task 1.3: Specialty grid section

- **Files**:
  - `components/public/specialty-card.tsx` (create)
  - `components/public/specialty-grid.tsx` (create)
- **Depends on**: 0.8
- **Description**: Create `SpecialtyCard` (server component) showing a specialty icon (lucide-react by name), name, and doctor count. Each card links to `/especialidades/{slug}`. Create `SpecialtyGrid` (server component) that renders up to 8 `SpecialtyCard` components in a responsive grid (2 cols mobile, 4 cols desktop). Include a "Ver todas las especialidades" link to `/especialidades`.
- **Acceptance**: Grid displays up to 8 specialty cards from real data. Each card links to the correct specialty page. Grid is responsive.

### Task 1.4: How It Works, Testimonials, and CTA sections

- **Files**:
  - `components/public/how-it-works.tsx` (create)
  - `components/public/testimonials-section.tsx` (create)
  - `components/public/cta-section.tsx` (create)
- **Depends on**: 0.9
- **Description**: Create `HowItWorksSection` with a 3-step visual: (1) Busca tu especialista, (2) Agenda tu cita, (3) Consulta al instante. Static content with icons. Create `TestimonialsSection` with 3 hardcoded testimonial cards (placeholder names, photos, and quotes). Create `CTASection` with two prominent buttons: "Crear cuenta gratis" (link to `/auth/register`) and "Explorar doctores" (link to `/buscar`). All use semantic tokens for dark mode.
- **Acceptance**: All three sections render with correct content. CTA buttons link to the right routes. Sections look correct in both light and dark modes.

### Task 1.5: Landing page assembly

- **Files**:
  - `app/page.tsx` (rewrite)
- **Depends on**: 0.4, 0.8, 0.9, 1.1, 1.2, 1.3, 1.4
- **Description**: Rewrite the root `page.tsx` as a Server Component. Import and render: `PublicNavbar`, `HeroSection` (with `SearchHero`), `TrustBadges`, `StatsSection` (with data from `getPlatformStats()`), `SpecialtyGridSection` (with data from `getTopSpecialties(8)`), `HowItWorksSection`, `TestimonialsSection`, `CTASection`, `PublicFooter`. Export `revalidate = 60` for ISR. Add SEO metadata: title `"Red Salud - Tu salud, en un solo lugar"`, description from spec. Add JSON-LD for `MedicalOrganization` + `WebSite` with `SearchAction`. The landing page does NOT use the `(public)` layout — it composes navbar/footer directly.
- **Acceptance**: Landing page renders with all sections. Data comes from Supabase (stats and specialties). `revalidate = 60` is exported. SEO metadata and JSON-LD are present. Page builds as ISR (not Dynamic) in `pnpm build` output.

---

## Phase 2: Static Public Pages

### Task 2.1: /nosotros page

- **Files**:
  - `app/(public)/nosotros/page.tsx` (create)
- **Depends on**: 0.9
- **Description**: Create the About page with static content: mission statement, vision, team section (placeholder), timeline of milestones, and Venezuela focus statement. Export metadata with title `"Sobre Nosotros | Red Salud"` and description `"Conoce a Red Salud, la plataforma de salud digital para Venezuela."`. Use semantic tokens for dark mode. No database queries.
- **Acceptance**: Page renders at `/nosotros` with all sections. Metadata is correct. Page builds as Static in build output.

### Task 2.2: /soporte page

- **Files**:
  - `app/(public)/soporte/page.tsx` (create)
- **Depends on**: 0.9
- **Description**: Create the Support page with: an FAQ accordion (at least 8 common questions like "Como agendo una cita?", "Es gratis para pacientes?", "Como verifico mi cuenta?"), a contact section with email address and a WhatsApp link button. Use a collapsible/accordion pattern for FAQ items (can use Radix UI Accordion or a simple details/summary). Export metadata: title `"Soporte y Ayuda | Red Salud"`.
- **Acceptance**: FAQ accordion expands/collapses correctly. Contact information is displayed. Page is Static at build time.

### Task 2.3: /seguridad page

- **Files**:
  - `app/(public)/seguridad/page.tsx` (create)
- **Depends on**: 0.9
- **Description**: Create the Security & Privacy page with sections: data encryption practices, Row Level Security explanation (user-friendly, non-technical), HIPAA aspiration statement, how user data is protected, and what data is never shared. Static content only. Export metadata: title `"Seguridad y Privacidad | Red Salud"`.
- **Acceptance**: Page renders at `/seguridad` with security/privacy content. Metadata is correct. Page is Static.

### Task 2.4: /para-profesionales page

- **Files**:
  - `app/(public)/para-profesionales/page.tsx` (create)
- **Depends on**: 0.9
- **Description**: Create the professionals landing page targeting doctors and clinics. Sections: benefits list (digital agenda, patient management, online presence), pricing information (free tier emphasis), feature comparison table (free vs premium placeholder), and a CTA button linking to the medico app registration (`https://medico.redsalud.ve/auth/register` or equivalent). Export metadata: title `"Para Profesionales de la Salud | Red Salud"`.
- **Acceptance**: Page renders with benefits, pricing, comparison, and CTA. CTA links to doctor registration. Page is Static.

### Task 2.5: /descargar page

- **Files**:
  - `app/(public)/descargar/page.tsx` (create)
- **Depends on**: 0.9
- **Description**: Create the Download page with: app store badge placeholders (Google Play, App Store), QR code placeholders, device mockup images (placeholder or simple illustration), and feature highlights for the mobile app. This is a future-facing page — all download links can be placeholder `#` hrefs. Export metadata: title `"Descargar Red Salud | Red Salud"`.
- **Acceptance**: Page renders at `/descargar` with store badges, device mockups, and features. Links are placeholders. Page is Static.

---

## Phase 3: Search & Discovery

### Task 3.1: DoctorCard and RatingStars components

- **Files**:
  - `components/public/doctor-card.tsx` (create)
  - `components/public/doctor-card-list.tsx` (create)
  - `components/public/rating-stars.tsx` (create)
- **Depends on**: 0.6
- **Description**: Create `RatingStars` (server component) that renders 1-5 star icons (filled, half, empty) from a numeric rating value, plus an optional review count label. Create `DoctorCard` (server component) displaying: avatar (with fallback initials), full name, specialty, `RatingStars`, consultation fee (formatted with `es-VE` locale), location (city, state), verified badge, and a "Ver perfil" link to `/medicos/{slug}`. Create `DoctorCardList` (server component) rendering a responsive grid of `DoctorCard` components (1 col mobile, 2 cols tablet, 3 cols desktop). All use semantic tokens.
- **Acceptance**: `DoctorCard` renders all specified fields. `RatingStars` shows correct filled/empty star count. `DoctorCardList` renders a responsive grid. All components use dark-mode-compatible tokens.

### Task 3.2: /especialidades page

- **Files**:
  - `app/(public)/especialidades/page.tsx` (create)
- **Depends on**: 0.8, 1.3
- **Description**: Create the specialties directory page. Fetch all specialties with doctor counts using `getSpecialtiesWithDoctorCount()`. Render a full grid of `SpecialtyCard` components (reuse from Task 1.3). Add a client-side search/filter input at the top to narrow specialties by name (filter the already-fetched list, no new DB query). Export `revalidate = 300`. Export metadata: title `"Especialidades Medicas | Red Salud"`.
- **Acceptance**: Page shows all specialties with doctor counts. Filter input narrows the displayed cards. Page builds as ISR (300s). Metadata is correct.

### Task 3.3: /especialidades/[slug] page

- **Files**:
  - `app/(public)/especialidades/[slug]/page.tsx` (create)
- **Depends on**: 0.8, 3.1
- **Description**: Create the specialty detail page. Fetch specialty data by slug using `getSpecialtyBySlug(slug)`. Fetch doctors in this specialty using `getDoctorsBySpecialty()` (paginated, limit 12). Render a specialty header (icon, name, description, doctor count) and a `DoctorCardList`. Include a "Ver mas en busqueda" link to `/buscar?especialidad={slug}` if more doctors exist. Handle 404 with `notFound()` if slug is invalid. Export `revalidate = 120`. Generate dynamic metadata using `generateMetadata()` with specialty name and doctor count.
- **Acceptance**: Page renders specialty header and doctor grid. Invalid slugs return 404. "Ver mas" link appears when there are more than 12 doctors. Metadata includes specialty name. Builds as ISR (120s).

### Task 3.4: Search page — form, filters, and results

- **Files**:
  - `app/(public)/buscar/page.tsx` (create)
  - `components/public/search/search-form.tsx` (create)
  - `components/public/search/filter-panel.tsx` (create)
  - `components/public/search/sort-dropdown.tsx` (create)
  - `components/public/search/active-filters.tsx` (create)
  - `components/public/pagination.tsx` (create)
- **Depends on**: 0.8, 3.1
- **Description**: Create the search page as a Server Component that reads `searchParams` and calls `searchDoctors(filters)`. Render: `SearchForm` (client — text input + specialty dropdown, submits by updating URL params), `FilterPanel` (client — collapsible sidebar with filters: specialty, state/city cascade, price range, rating, insurance, gender), `ActiveFilters` (client — shows removable tags for active filters), `SortDropdown` (client — relevance, price asc/desc, rating), results count, `DoctorCardList`, and `Pagination` (client — page numbers that update URL params). Empty state shows "No encontramos doctores con estos filtros" with suggestion to broaden search. Export metadata: title `"Buscar Doctores en Venezuela | Red Salud"`. Add `noindex` when search params are present.
- **Acceptance**: Search page loads with all doctors (no filters). Filtering by specialty updates URL and results. State/city cascade works (selecting a state narrows city options). Pagination works. Empty state shows when no results match. All filter interactions update URL search params (shareable URLs).

### Task 3.5: /medicos redirect and /medicos/[slug] doctor profile

- **Files**:
  - `app/(public)/medicos/page.tsx` (create)
  - `app/(public)/medicos/[slug]/page.tsx` (create)
  - `components/public/doctor/doctor-profile-header.tsx` (create)
  - `components/public/doctor/doctor-profile-tabs.tsx` (create)
  - `components/public/doctor/doctor-info-tab.tsx` (create)
  - `components/public/doctor/doctor-reviews-tab.tsx` (create)
  - `components/public/doctor/similar-doctors.tsx` (create)
  - `components/public/doctor/book-cta.tsx` (create)
- **Depends on**: 0.8, 3.1
- **Description**: Create `/medicos/page.tsx` as a redirect to `/buscar` using `redirect()` from `next/navigation`. Create `/medicos/[slug]/page.tsx` that fetches a doctor by slug using `getDoctorBySlug(slug)`. Render: `DoctorProfileHeader` (server — avatar, name, specialty, verified badge, rating, location, experience), `BookAppointmentCTA` (client — links to `/auth/register` if anon or `/dashboard/appointments` if authenticated), `DoctorProfileTabs` (client — tab switching between Info/Location/Reviews), `DoctorInfoTab` (bio, office hours from schedule JSONB, consultation fee, insurance), `DoctorReviewsTab` (paginated reviews with `ReviewCard`), `SimilarDoctors` (server — same specialty + same state, limit 4). Handle 404 with `notFound()`. Export `revalidate = 120`. Add `generateMetadata()` with doctor name, specialty, city. Add `generateStaticParams()` that pre-generates the top 500 verified doctors. Add JSON-LD `Physician` schema with `AggregateRating`.
- **Acceptance**: `/medicos` redirects to `/buscar`. Doctor profile page renders all sections. Tabs switch between info/location/reviews. Invalid slugs return 404. JSON-LD script tag is present. `generateStaticParams` returns slugs for pre-generation. Metadata includes doctor name and specialty.

---

## Phase 4: Interactive Map

### Task 4.1: Venezuela SVG map component

- **Files**:
  - `lib/data/venezuela-states-svg-paths.ts` (create)
  - `components/public/map/venezuela-map-svg.tsx` (create)
- **Depends on**: 0.8
- **Description**: Create `venezuela-states-svg-paths.ts` with an exported `VENEZUELA_SVG_PATHS` record mapping each of Venezuela's 24 states (including DC) to `{ d: string, center: [x, y] }` with actual SVG path data for each state outline. Create `VenezuelaMapSVG` (client component) that renders an `<svg viewBox="0 0 800 700">` with one `<path>` per state. Each path: fill color computed from doctor count (gradient from `gray-200` to `emerald-500`), `onMouseEnter` shows a tooltip with state name + doctor count, `onClick` navigates to `/buscar?estado={stateName}`. Selected state gets a highlighted stroke. The component receives `stateData: StateMapData[]` and `onStateClick` callback as props.
- **Acceptance**: SVG renders Venezuela with all 24 states. Hovering shows tooltip with state name and count. Clicking navigates to search filtered by state. States are color-coded by doctor density.

### Task 4.2: Venezuela map section on landing page

- **Files**:
  - `app/page.tsx` (modify — add map section)
- **Depends on**: 1.5, 4.1
- **Description**: Add a `VenezuelaMapSection` to the landing page between `HowItWorksSection` and `TestimonialsSection`. Fetch state doctor counts using `getStateDoctorCounts()` from the public data service. Pass the data to `VenezuelaMapSVG`. Wrap the map in a section with a heading like "Doctores en todo Venezuela" and a brief description.
- **Acceptance**: Landing page shows the interactive Venezuela map. State hover and click work as described. Map section has heading and description.

### Task 4.3: MapLibre map view component

- **Files**:
  - `components/public/map/map-view.tsx` (create)
  - `components/public/map/doctor-marker.tsx` (create)
  - `components/public/map/map-controls.tsx` (create)
- **Depends on**: 0.1
- **Description**: Create `MapView` (client component) using `react-map-gl` with MapLibre as the underlying engine. Use `next/dynamic` with `ssr: false` for the export. Configure: map style URL from `NEXT_PUBLIC_MAP_STYLE_URL` env var (default to OpenFreeMap `https://tiles.openfreemap.org/styles/liberty`), center on Venezuela `[-66.58, 6.42]` at zoom 6. Accept `doctors: MapDoctorPoint[]` prop. Convert doctors to GeoJSON FeatureCollection. Enable clustering via GeoJSON source `cluster: true, clusterMaxZoom: 14, clusterRadius: 50`. Add three layers: cluster circles (scaled by `point_count`), cluster count labels, and individual markers (emerald dots). Click cluster to zoom in (`flyTo`). Click marker to show a popup with doctor name, specialty, rating, and link to `/medicos/{slug}`. Create `MapControls` with zoom buttons.
- **Acceptance**: MapView renders a MapLibre map centered on Venezuela. Doctor markers appear and cluster at low zoom. Clicking clusters zooms in. Clicking markers shows popup. No SSR errors (component is dynamically imported).

### Task 4.4: Map toggle on search page

- **Files**:
  - `app/(public)/buscar/page.tsx` (modify)
- **Depends on**: 3.4, 4.3
- **Description**: Add a "Ver mapa" / "Ver lista" toggle button to the search page. When toggled to map view, dynamically import and render `MapView` with the current search results' doctors converted to `MapDoctorPoint[]`. Fetch map data using `getDoctorsForMap()` with current filters. Show a loading skeleton while MapLibre loads. The map and list views should be switchable without losing filter state.
- **Acceptance**: Toggle button switches between list and map views. Map shows clustered doctor markers matching current filters. Switching views preserves filter state. MapLibre loads asynchronously with a skeleton placeholder.

### Task 4.5: Doctor profile location tab with map

- **Files**:
  - `components/public/doctor/doctor-location-tab.tsx` (create)
  - `app/(public)/medicos/[slug]/page.tsx` (modify — wire location tab)
- **Depends on**: 3.5, 4.3
- **Description**: Create `DoctorLocationTab` (client component) that renders a `MapView` with a single marker for the doctor's location. Use city-center coordinates from a static lookup table (`lib/data/venezuela-geo.ts` with city centers per state). The map should be centered on the doctor's city at zoom 12. Wire this into the "Ubicacion" tab of `DoctorProfileTabs`.
- **Acceptance**: The Ubicacion tab shows a MapLibre map with one marker at the doctor's city center. Map is centered and zoomed appropriately.

---

## Phase 5: Registration & Onboarding

### Task 5.1: Simplify registration page

- **Files**:
  - `app/auth/register/page.tsx` (modify)
  - `lib/validations/auth.ts` (modify — add `simpleRegisterSchema`)
- **Depends on**: None
- **Description**: Add the `simpleRegisterSchema` to `lib/validations/auth.ts` (preserve the old `registerSchema` for backward compat). Modify the register page to show ONLY: email input, password input, confirm password input, accept terms checkbox, and Google OAuth button. Remove all other fields (name, phone, DOB, gender, state, city) — these move to onboarding. The form should use `simpleRegisterSchema` for validation. Google OAuth flow remains unchanged. The page should link back to `/auth/login` and to the public landing.
- **Acceptance**: Registration form shows only email, password, confirm password, terms checkbox, and Google button. No personal data fields. `simpleRegisterSchema` validates correctly. Old `registerSchema` still exists in the file. Form submits successfully.

### Task 5.2: Onboarding modal component

- **Files**:
  - `components/onboarding/onboarding-modal.tsx` (create)
  - `components/onboarding/onboarding-steps.tsx` (create)
- **Depends on**: None
- **Description**: Create `OnboardingModal` (client component) as a modal overlay with 3 steps. Step 1 (Personal): `nombre_completo` (required), `fecha_nacimiento` (date picker), `genero` (select). Step 2 (Location): `estado` (dropdown of Venezuelan states), `ciudad` (dropdown cascading from selected estado), `telefono` (phone input with +58 prefix). Step 3 (Avatar): file upload for `avatar_url` (optional, can skip). Each step saves to the `profiles` table independently via Supabase client. The modal shows a step indicator (1/3, 2/3, 3/3). Include "Omitir" (skip) and "Siguiente" (next) buttons. On final step, close the modal and call `onComplete` callback. Progress persists across sessions (reads current profile data from DB on mount).
- **Acceptance**: Modal renders with 3 steps. Each step saves independently. Estado/ciudad cascade works. Step indicator shows progress. Skip and Next buttons function. Modal closes on completion.

### Task 5.3: Wire onboarding into dashboard layout

- **Files**:
  - `app/dashboard/layout.tsx` (modify)
- **Depends on**: 5.2
- **Description**: In the dashboard layout, add an effect that checks if the authenticated user's profile is incomplete (`!nombre_completo || !estado`). If incomplete, show the `OnboardingModal`. When the modal completes, hide it and refresh the profile context. The check should run once on mount and use the existing Supabase client to query the `profiles` table.
- **Acceptance**: New users landing on dashboard see the onboarding modal. Users who complete onboarding (have `nombre_completo` and `estado`) do not see it. Completing the modal closes it and the dashboard reflects updated data.

---

## Phase 6: Geo-localization

### Task 6.1: Country context provider and geo cookie

- **Files**:
  - `lib/context/country-context.tsx` (create)
  - `lib/services/geo-service.ts` (create)
- **Depends on**: None
- **Description**: Create `CountryProvider` (client component) and `useCountry()` hook as specified in design section 6.3. The `COUNTRIES` record starts with `VE` only. Create `geo-service.ts` with a function `detectCountry()` that reads the `rs-country` cookie. If missing, attempts to detect via `x-vercel-ip-country` header (Vercel) or falls back to `"VE"`. The function sets the `rs-country` cookie with 30-day expiry.
- **Acceptance**: `useCountry()` returns `CountryConfig` for Venezuela. Cookie `rs-country` is set with correct expiry. Fallback to `"VE"` when detection fails.

### Task 6.2: Wire country provider and geo cookie into middleware

- **Files**:
  - `app/layout.tsx` (modify — add CountryProvider)
  - `middleware.ts` (modify — add geo cookie logic)
- **Depends on**: 0.10, 6.1
- **Description**: In root layout, read the `rs-country` cookie (Server Component can read cookies) and pass the country code to `CountryProvider` wrapping children. In middleware, for public paths: after the public path check, check if `rs-country` cookie exists. If not, read `x-vercel-ip-country` header (or default to `"VE"`), set the cookie on the response with 30-day maxAge, then return `NextResponse.next()`. No URL rewriting in this phase.
- **Acceptance**: Middleware sets `rs-country` cookie on first visit. Root layout reads cookie and provides country context. `useCountry()` returns correct config in any client component.

---

## Phase 7: Polish

### Task 7.1: SEO metadata for all public pages

- **Files**:
  - All `app/(public)/*/page.tsx` files (modify)
  - `app/page.tsx` (modify)
- **Depends on**: 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.3, 3.4, 3.5
- **Description**: Audit and ensure every public page exports proper `Metadata` (or `generateMetadata()` for dynamic pages). Each page must have: unique `title`, descriptive `description`, and `openGraph` properties. Dynamic pages (`/especialidades/[slug]`, `/medicos/[slug]`) must use `generateMetadata()` fetching the entity name. The `/buscar` page adds `robots: { index: false }` when search params are present. Verify JSON-LD scripts on landing page (MedicalOrganization + WebSite) and doctor profiles (Physician + AggregateRating).
- **Acceptance**: Every public page has a unique `<title>` and `<meta name="description">`. Dynamic pages generate metadata from DB data. JSON-LD script tags are present on landing and doctor profiles. `/buscar` with params has noindex.

### Task 7.2: Mobile responsiveness pass

- **Files**:
  - All `components/public/*.tsx` files (modify as needed)
  - All `app/(public)/*/page.tsx` files (modify as needed)
- **Depends on**: All Phase 1-3 tasks
- **Description**: Review all public pages and components at mobile breakpoints (320px, 375px, 428px). Fix any layout issues: ensure navbar hamburger menu works, grids collapse to single column, search filters collapse to a slide-over panel on mobile, doctor cards stack vertically, map section has appropriate height, footer stacks columns. Test touch targets are at least 44x44px.
- **Acceptance**: All public pages render correctly at 320px width. No horizontal overflow. Touch targets are adequate. Mobile menu functions. Filter panel collapses on mobile.

### Task 7.3: Dark mode QA across all pages

- **Files**:
  - All `components/public/*.tsx` files (modify as needed)
  - All `app/(public)/*/page.tsx` files (modify as needed)
- **Depends on**: All Phase 1-4 tasks
- **Description**: Toggle dark mode on every public page and verify: no white backgrounds leaking through (all sections use `hsl(var(--background))` or `hsl(var(--muted))`), text is readable (foreground tokens used everywhere), cards have proper dark backgrounds, borders use `hsl(var(--border))`, map components render correctly in dark mode, SVG map colors adapt. Fix any hardcoded color values (e.g., `bg-white`, `text-gray-900`) in public components.
- **Acceptance**: All public pages render correctly in dark mode. No hardcoded light-mode colors in any public component. Cards, text, and borders all use semantic tokens. Map renders correctly in dark mode.

---

## Summary

| Phase | Tasks | Estimated Total |
|-------|-------|----------------|
| Phase 0: Infrastructure | 0.1 - 0.10 | 10 tasks |
| Phase 1: Landing Page | 1.1 - 1.5 | 5 tasks |
| Phase 2: Static Pages | 2.1 - 2.5 | 5 tasks |
| Phase 3: Search & Discovery | 3.1 - 3.5 | 5 tasks |
| Phase 4: Interactive Map | 4.1 - 4.5 | 5 tasks |
| Phase 5: Registration & Onboarding | 5.1 - 5.3 | 3 tasks |
| Phase 6: Geo-localization | 6.1 - 6.2 | 2 tasks |
| Phase 7: Polish | 7.1 - 7.3 | 3 tasks |
| **Total** | | **38 tasks** |

### Critical Path

```
0.5 + 0.6 → 0.8 → 1.5 (landing with real data)
0.2 → 0.3 → 0.4 → 0.9 → all public pages
0.7 → database must be migrated before data services return meaningful results
0.8 + 3.1 → 3.4 (search page) → 4.4 (map on search)
0.8 + 3.1 → 3.5 (doctor profile) → 4.5 (map on profile)
4.1 → 4.2 (SVG map on landing)
5.1 + 5.2 → 5.3 (registration + onboarding flow)
```

### Parallelization Opportunities

These groups can run in parallel:
- **Group A**: Tasks 0.1, 0.5, 0.6, 0.7, 0.10 (no dependencies between them)
- **Group B**: Tasks 2.1, 2.2, 2.3, 2.4, 2.5 (all independent static pages, only need 0.9)
- **Group C**: Tasks 5.1, 5.2 (registration and onboarding components are independent)
- **Group D**: Tasks 4.1, 4.3 (SVG map and MapLibre map are independent components)
