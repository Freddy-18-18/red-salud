# Database

Canonical location for all database-related files in the Red Salud monorepo.

## Directory Structure

```
database/
├── migrations/      # All SQL migration files (YYYYMMDDHHMMSS_description.sql)
├── seeds/           # Seed data for development and testing
│   ├── seed-root.sql    # Pharmacy ERP seed data (main)
│   ├── seed.sql         # Copy from supabase/seed.sql (same content)
│   └── dev-data.sql     # Development test profiles
└── schemas/         # Schema documentation by domain (not executable SQL)
    ├── README.md
    ├── auth.md      # Authentication, profiles, roles, security
    ├── medical.md   # Doctors, appointments, prescriptions, verification
    ├── dental.md    # Dental clinical, perio, imaging, RCM
    ├── pharmacy.md  # Inventory, POS, deliveries, loyalty
    ├── clinic.md    # Clinic management, resources, RCM, payments
    └── lab.md       # Laboratory, telemedicine, messaging, community
```

## Running Migrations

### With Supabase CLI (recommended)

```bash
# Link your project (first time only)
supabase link --project-ref <your-project-ref>

# Push all pending migrations
supabase db push

# Or use the deploy script
./scripts/deploy/migrations.sh -p <your-project-ref>
```

### With Supabase Dashboard (manual)

1. Open your project in the Supabase Dashboard
2. Go to SQL Editor
3. Copy-paste the migration SQL and run it

## Seeding Data

```bash
# Using the seed script
./scripts/dev/seed-data.sh

# Or manually
supabase db execute < database/seeds/seed-root.sql

# For dev test profiles
supabase db execute < database/seeds/dev-data.sql
```

## Setting Up a Local Database

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start local Supabase:
   ```bash
   supabase start
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

4. Seed with test data:
   ```bash
   ./scripts/dev/seed-data.sh --dev-data
   ```

5. Access the local dashboard at http://localhost:54323

## Migration Naming Convention

All migration files follow this format:

```
YYYYMMDDHHMMSS_description.sql
```

- **YYYY**: Year (4 digits)
- **MM**: Month (2 digits)
- **DD**: Day (2 digits)
- **HHMMSS**: Hour, minute, second (6 digits)
- **description**: Snake_case description of the change

Example: `20260214000000_create_professional_verification_system.sql`

Migrations are applied in alphabetical order, so the timestamp prefix ensures correct ordering.

## Relationship to supabase/

The root `supabase/` directory contains:
- `config.toml` -- Supabase local development configuration
- `seed.sql` -- Legacy seed file (canonical version is in `database/seeds/`)
- `migrations/` -- Subset of migrations (all are also present in `database/migrations/`)

The canonical location for migrations is `database/migrations/`. The `supabase/migrations/` directory contains only the migrations that were added when the web app lived at the repo root.
