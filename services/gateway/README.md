# Red Salud Gateway

Thin Axum-based façade that sits between the browser apps
(`apps/paciente/web`, `apps/medico/web`, …) and the Supabase project. It
exists so the web apps can move off their per-app BFF routes onto a single
versioned API over time, without each app re-implementing auth, rate
limits, and Supabase auth plumbing.

## Current surface

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness probe (200 OK text). |
| `GET` | `/api/v1/health` | Same thing under the versioned prefix. |
| `GET` | `/api/v1/version` | Build metadata (`service`, `version`). |
| `GET` | `/api/v1/doctors/search` | Public doctor search. Proxies to Supabase PostgREST `doctor_profiles` with filters: `specialty_id`, `accepts_insurance`, `min_rating`, `page`, `page_size`. |
| `GET` | `/api/v1/doctors/{id}/availability` | Wraps the `get_doctor_public_availability` / `get_doctor_available_dates` RPCs from Phase 1. |

`src/middleware.rs` ships `require_auth` (401 on invalid/missing
`Authorization: Bearer …`) and `optional_auth`. Neither is wired into the
routes yet — the two public endpoints above are read-only over already-public
data. Future mutating routes (appointments, messaging) will layer
`require_auth` on top.

## Environment variables

All required at boot.

| Name | Notes |
|---|---|
| `HOST` | Defaults to `0.0.0.0` (set by Dockerfile). |
| `PORT` | Defaults to `8080`. |
| `ALLOWED_ORIGINS` | Comma-separated list. |
| `JWT_SECRET` | Supabase project JWT secret (HS256). |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` — no trailing slash. |
| `SUPABASE_ANON_KEY` | Public anon key — used when proxying unauthenticated read traffic. |

## Local run

```bash
# From the repo root
cargo run -p red-salud-gateway
```

## Deploy (Railway)

The repo has a Railway project called `sacs-verification-clean-20260215`.
Either link that project or create a new one:

```bash
cd services/gateway
railway login
railway link           # pick a project, or `railway init` for a new one
railway up             # uploads Dockerfile + builds there
```

Set the env vars above via `railway variables set KEY=VALUE`.

## Next steps

1. Wire the paciente/medico `@red-salud/api-client` instance to point at the
   deployed URL and migrate one BFF route as a proof (doctor search).
2. Add `require_auth` and implement `/api/v1/appointments` (POST + GET) as
   a thin wrapper over the `check_slot_available` + `check_time_block_conflict`
   RPCs.
3. Introduce sqlx for routes that need transactional behavior (booking,
   prescription signing) once the proxy pattern is exercised.
