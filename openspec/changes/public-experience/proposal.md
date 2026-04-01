# Proposal: Public Experience — Red Salud

## Intent

Transform the patient app's public pages into a professional healthcare platform. Users must explore doctors, specialties, and understand the platform WITHOUT logging in. Registration must be zero-friction (email/Google only). The platform must feel Venezuelan while being architecturally ready for multi-country expansion.

## Scope

### In Scope
- Landing page redesign with real Supabase data (stats, specialties, doctor counts)
- 11 new public pages: `/especialidades`, `/especialidades/[slug]`, `/buscar`, `/medicos`, `/medicos/[slug]`, `/nosotros`, `/soporte`, `/seguridad`, `/para-profesionales`, `/descargar`, plus landing
- Interactive Venezuela map (SVG states → MapLibre drill-down → doctor locations)
- Public doctor search with filters + map (no auth required)
- Public doctor profiles with reviews, bio, availability
- Dark/light theme system (`next-themes` + Tailwind CSS 4 `@custom-variant`)
- Simplified registration (email/Google only → onboarding inside dashboard)
- Geo-localization infrastructure (IP detection → `/ve/` path → cookie)
- Public navbar + footer with full navigation

### Out of Scope
- Native mobile/desktop builds (web first until 100%)
- Blog/content CMS system
- Multi-language (Spanish only)
- Payment integration on public pages
- Real-time WebSocket features on public pages

## Approach

- **Public layout**: New `(public)` route group with its own navbar/footer, separate from `(auth)` and `dashboard`
- **Data**: Server Components with Supabase service-role for public reads; ISR revalidation (60s) for stats
- **Specialties**: Query `medical_specialties` joined with `doctor_profiles` to show only active ones
- **Map**: SVG Venezuela overview → react-map-gl/MapLibre for state/city drill-down → marker clustering
- **Geo**: Middleware detects country via IP (`ipapi.co`) → sets cookie → rewrites to `/ve/` path
- **Theme**: `next-themes` provider in root layout, `@custom-variant dark` in CSS, 3-way toggle
- **Registration**: Strip all profile fields from `/auth/register`, add onboarding modal in dashboard for new users
- **SEO**: Static metadata per page, JSON-LD for doctor profiles, specialty pages

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/page.tsx` | Rewrite | Full landing redesign with real data |
| `src/app/(public)/` | New | Route group for all public pages |
| `src/app/layout.tsx` | Modified | Add ThemeProvider, update metadata |
| `src/app/globals.css` | Modified | Add dark theme custom variant + dark palette |
| `src/app/auth/register/` | Modified | Strip to email/Google only |
| `src/app/dashboard/layout.tsx` | Modified | Add onboarding check for new users |
| `src/components/public/` | New | Navbar, footer, hero, map, specialty grid, stats |
| `src/components/theme/` | New | Theme toggle component |
| `src/components/onboarding/` | New | Post-registration profile completion |
| `src/lib/services/public-service.ts` | New | Public data queries (no auth) |
| `src/middleware.ts` | Modified | Add geo-detection + public route handling |
| `packages/types/src/` | Modified | Add public page types if needed |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| RLS blocks public doctor reads | High | Create Supabase service-role client for public pages or add anon RLS policies |
| Map library SSR issues | Medium | `next/dynamic` with `ssr: false` for all map components |
| Large SVG Venezuela map perf | Low | Lazy load, optimize SVG, only load on `/medicos` |
| IP geolocation API rate limits | Low | Cache in cookie after first detection, fallback to manual selector |

## Rollback Plan

All changes are in a new route group `(public)/` — can be removed entirely without affecting existing dashboard. Theme provider is additive. Registration simplification can be reverted by restoring the old register page from git.

## Dependencies

- `next-themes` npm package
- `react-map-gl` + `maplibre-gl` npm packages
- Venezuela GeoJSON/SVG data for map
- Supabase anon RLS policies for public doctor/specialty reads

## Success Criteria

- [ ] All 11 public pages render with real Supabase data
- [ ] Landing shows correct doctor/specialty/patient counts from DB
- [ ] Doctor search works without login
- [ ] Interactive map renders Venezuela with state-level doctor density
- [ ] Dark/light theme toggles without FOUC
- [ ] Registration takes < 30 seconds (email/Google, no extra fields)
- [ ] Onboarding flow captures profile data post-registration
- [ ] Lighthouse performance score > 90 on landing page
- [ ] All public pages have proper SEO metadata
