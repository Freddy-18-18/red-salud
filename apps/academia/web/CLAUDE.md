# Academia Red Salud Web — Red Salud

## About This App
Medical education platform with gamification. Courses, lessons, certifications, and leaderboards for healthcare professionals.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4 + Radix UI
- **Auth**: Supabase Auth via `@red-salud/auth-sdk`
- **Data**: Supabase + API Gateway
- **State**: TanStack React Query
- **Port**: 3009

## Commands
```bash
pnpm dev          # Dev server on port 3009
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
```

## Architecture
- `src/app/` — Next.js App Router pages
- `src/components/` — UI components
- `src/lib/` — Services, hooks, utilities
- `src/lib/supabase/` — Supabase client + server helpers

## Key Domain Concepts
- **Cursos**: Structured course content by specialty
- **Lecciones**: Individual lessons with video/text/quiz
- **Certificaciones**: Certificate issuance upon completion
- **Gamificacion**: Points, badges, streaks, leagues
- **Ranking**: Leaderboards by specialty/region

## Database Tables
- `academy_specialties`, `academy_units`, `academy_lessons` — Course structure
- `academy_questions` — Quiz questions
- `academy_user_progress` — Completion tracking
- `academy_achievements`, `academy_user_achievements` — Badges
- `academy_leagues`, `academy_league_participants` — Leaderboards
- `academy_gem_transactions` — Virtual currency
- `academy_streak_history` — Learning streaks

## Shared Packages
- `@red-salud/types`, `@red-salud/contracts`, `@red-salud/ui`, `@red-salud/core`, `@red-salud/auth-sdk`, `@red-salud/api-client`

## Rules
- NEVER import from other apps
- Content is free for verified healthcare professionals
- Quiz passing score: 70%
- Certificates require 100% lesson completion + quiz pass
