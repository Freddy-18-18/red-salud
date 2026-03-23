#!/usr/bin/env bash
#
# Apply database migrations to Supabase
# Equivalent of deploy-verification-migrations.ps1 for Unix systems
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MIGRATIONS_DIR="$PROJECT_ROOT/database/migrations"

# ─── Defaults ────────────────────────────────────────────────────────────────
PROJECT_REF=""

# ─── Helpers ─────────────────────────────────────────────────────────────────
info()    { printf '\033[36m[info]\033[0m  %s\n' "$*"; }
ok()      { printf '\033[32m[ok]\033[0m    %s\n' "$*"; }
warn()    { printf '\033[33m[warn]\033[0m  %s\n' "$*"; }
fail()    { printf '\033[31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Apply pending database migrations to Supabase.

Options:
  -p, --project-ref REF   Supabase project reference ID (required if not already linked)
  -d, --dry-run            Show which migrations would run without applying them
  -h, --help               Show this help message

Examples:
  $(basename "$0")
  $(basename "$0") -p hwckkfiirldgundbcjsp
  $(basename "$0") --dry-run
EOF
  exit 0
}

DRY_RUN=false

# ─── Parse args ──────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--project-ref) PROJECT_REF="$2"; shift 2 ;;
    -d|--dry-run)     DRY_RUN=true; shift ;;
    -h|--help)        usage ;;
    *) fail "Unknown option: $1" ;;
  esac
done

# ─── Banner ──────────────────────────────────────────────────────────────────
echo ""
echo "  Database Migration Runner"
echo "  Red-Salud"
echo "  ────────────────────────────────"
echo ""

# ─── 1. Check prerequisites ─────────────────────────────────────────────────
info "Checking Supabase CLI..."
if ! command -v supabase &>/dev/null; then
  fail "Supabase CLI not installed. Install with: npm install -g supabase"
fi
ok "Supabase CLI installed: $(supabase --version)"

# ─── 2. Verify migrations dir ───────────────────────────────────────────────
if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  fail "Migrations directory not found at: $MIGRATIONS_DIR"
fi

MIGRATION_COUNT=$(find "$MIGRATIONS_DIR" -name '*.sql' -not -name 'README*' | wc -l)
ok "Found $MIGRATION_COUNT migration files"

# ─── 3. Link project if ref provided ────────────────────────────────────────
if [[ -n "$PROJECT_REF" ]]; then
  info "Linking project: $PROJECT_REF..."
  if ! supabase link --project-ref "$PROJECT_REF"; then
    fail "Failed to link project"
  fi
  ok "Project linked"
fi

# ─── 4. List pending migrations ─────────────────────────────────────────────
info "Checking pending migrations..."
echo ""
echo "  Migrations directory: $MIGRATIONS_DIR"
echo ""

if $DRY_RUN; then
  info "DRY RUN - no changes will be applied"
  echo ""
  find "$MIGRATIONS_DIR" -name '*.sql' -not -name 'README*' | sort | while read -r f; do
    echo "  $(basename "$f")"
  done
  echo ""
  ok "Dry run complete"
  exit 0
fi

# ─── 5. Confirm ─────────────────────────────────────────────────────────────
read -r -p "Apply migrations? [y/N] " response
if [[ ! "$response" =~ ^[yY]$ ]]; then
  info "Cancelled"
  exit 0
fi

# ─── 6. Push migrations ─────────────────────────────────────────────────────
info "Pushing migrations..."

PROJECT_REF_ARG=""
if [[ -n "$PROJECT_REF" ]]; then
  PROJECT_REF_ARG="--project-ref $PROJECT_REF"
fi

if supabase db push $PROJECT_REF_ARG; then
  ok "Migrations applied successfully"
else
  fail "Migration push failed. Check errors above."
fi

# ─── Done ────────────────────────────────────────────────────────────────────
echo ""
echo "  MIGRATIONS COMPLETE"
echo "  ────────────────────────────────"
echo ""
info "Next steps:"
echo "  1. Verify tables in Supabase Dashboard"
echo "  2. Check that existing data migrated correctly"
echo "  3. Test from the frontend"
echo ""
