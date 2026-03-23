# Scripts

Automation scripts for the Red Salud monorepo. Each subdirectory groups scripts by purpose.

## deploy/

Deployment scripts for Supabase resources.

### edge-functions.sh / edge-functions.ps1

Deploy the `verify-doctor-sacs` Supabase Edge Function.

**Prerequisites:**
- Supabase CLI installed and authenticated (`supabase login`)
- `SACS_BACKEND_URL` secret configured (the script can set it interactively)

**Usage:**
```bash
./scripts/deploy/edge-functions.sh                        # deploy (project must be linked)
./scripts/deploy/edge-functions.sh -p <project-ref>       # link + deploy
./scripts/deploy/edge-functions.sh --check-only            # verify prerequisites only
```

### migrations.sh / migrations.ps1

Push pending database migrations to Supabase.

**Prerequisites:**
- Supabase CLI installed and authenticated
- Migrations in `database/migrations/`

**Usage:**
```bash
./scripts/deploy/migrations.sh                            # push all pending
./scripts/deploy/migrations.sh -p <project-ref>           # link + push
./scripts/deploy/migrations.sh --dry-run                  # list migrations without applying
```

## dev/

Local development environment scripts.

### setup-env.sh

One-time setup for a new developer machine. Installs Node.js (via nvm), Claude Code, and configures Z.AI API access.

**Prerequisites:** curl, bash

**Usage:**
```bash
./scripts/dev/setup-env.sh
```

You will be prompted for your Z.AI API key.

### seed-data.sh

Populate the database with seed/test data from `database/seeds/`.

**Prerequisites:**
- Supabase CLI installed and authenticated
- Seed files in `database/seeds/`

**Usage:**
```bash
./scripts/dev/seed-data.sh                                # run seed-root.sql
./scripts/dev/seed-data.sh -p <project-ref>               # link + seed
./scripts/dev/seed-data.sh --dev-data                     # also load dev-data.sql
./scripts/dev/seed-data.sh -f dev-data.sql                # run a specific seed file
```

## tools/

Standalone utilities.

### ingest-docs.ts

Ingest markdown documentation from `docs/` into the Supabase vector store for the AI chat assistant. Splits documents into chunks, generates embeddings, and stores them.

**Prerequisites:**
- Environment variables in `.env.local` at root (Supabase URL, keys, OpenAI/embedding key)
- The `documents` table and pgvector extension enabled in the database

**Usage:**
```bash
npx tsx scripts/tools/ingest-docs.ts
```

## Notes

- `.sh` scripts require bash. `.ps1` scripts are PowerShell equivalents for Windows.
- Both shell and PowerShell versions are kept so the team can use either OS.
- All bash scripts use `set -euo pipefail` and exit on first error.
