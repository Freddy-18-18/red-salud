#!/usr/bin/env bash
#
# Seed the local or remote database with development data.
#
# Prerequisites:
#   - Supabase CLI installed and authenticated
#   - Project linked (or pass --project-ref)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SEEDS_DIR="$PROJECT_ROOT/database/seeds"

# ─── Helpers ─────────────────────────────────────────────────────────────────
info()    { printf '\033[36m[info]\033[0m  %s\n' "$*"; }
ok()      { printf '\033[32m[ok]\033[0m    %s\n' "$*"; }
warn()    { printf '\033[33m[warn]\033[0m  %s\n' "$*"; }
fail()    { printf '\033[31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Seed the database with development/test data.

Options:
  -p, --project-ref REF   Supabase project reference ID
  -f, --file FILE          Seed file to use (default: seed-root.sql)
  --dev-data               Also load dev-data.sql after the main seed
  -h, --help               Show this help message

Seed files are located in: database/seeds/

Examples:
  $(basename "$0")
  $(basename "$0") -p hwckkfiirldgundbcjsp
  $(basename "$0") --dev-data
  $(basename "$0") -f dev-data.sql
EOF
  exit 0
}

SEED_FILE="seed-root.sql"
LOAD_DEV_DATA=false
PROJECT_REF=""

# ─── Parse args ──────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--project-ref) PROJECT_REF="$2"; shift 2 ;;
    -f|--file)        SEED_FILE="$2"; shift 2 ;;
    --dev-data)       LOAD_DEV_DATA=true; shift ;;
    -h|--help)        usage ;;
    *) fail "Unknown option: $1" ;;
  esac
done

# ─── Banner ──────────────────────────────────────────────────────────────────
echo ""
echo "  Database Seed Runner"
echo "  Red-Salud"
echo "  ────────────────────────────────"
echo ""

# ─── 1. Check prerequisites ─────────────────────────────────────────────────
info "Checking Supabase CLI..."
if ! command -v supabase &>/dev/null; then
  fail "Supabase CLI not installed. Install with: npm install -g supabase"
fi
ok "Supabase CLI installed"

# ─── 2. Verify seed file ────────────────────────────────────────────────────
SEED_PATH="$SEEDS_DIR/$SEED_FILE"
if [[ ! -f "$SEED_PATH" ]]; then
  fail "Seed file not found: $SEED_PATH"
fi
ok "Seed file: $SEED_FILE"

# ─── 3. Link project if ref provided ────────────────────────────────────────
if [[ -n "$PROJECT_REF" ]]; then
  info "Linking project: $PROJECT_REF..."
  supabase link --project-ref "$PROJECT_REF" || fail "Failed to link project"
  ok "Project linked"
fi

# ─── 4. Confirm ─────────────────────────────────────────────────────────────
warn "This will INSERT data into the database."
read -r -p "Continue? [y/N] " response
if [[ ! "$response" =~ ^[yY]$ ]]; then
  info "Cancelled"
  exit 0
fi

# ─── 5. Run seed ────────────────────────────────────────────────────────────
info "Running seed: $SEED_FILE..."
if supabase db execute < "$SEED_PATH"; then
  ok "Seed applied: $SEED_FILE"
else
  fail "Seed failed. Check errors above."
fi

# ─── 6. Dev data (optional) ─────────────────────────────────────────────────
if $LOAD_DEV_DATA; then
  DEV_DATA_PATH="$SEEDS_DIR/dev-data.sql"
  if [[ -f "$DEV_DATA_PATH" ]]; then
    info "Loading dev-data.sql..."
    if supabase db execute < "$DEV_DATA_PATH"; then
      ok "Dev data loaded"
    else
      warn "Dev data seed had errors. Check above."
    fi
  else
    warn "dev-data.sql not found at $DEV_DATA_PATH. Skipping."
  fi
fi

# ─── Done ────────────────────────────────────────────────────────────────────
echo ""
ok "Seeding complete!"
echo ""
