#!/usr/bin/env bash
#
# Deploy SACS Edge Function to Supabase
# Equivalent of deploy-sacs-edge-function.ps1 for Unix systems
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FUNCTION_PATH="$PROJECT_ROOT/database/supabase/functions/verify-doctor-sacs"

# ─── Defaults ────────────────────────────────────────────────────────────────
PROJECT_REF=""
CHECK_ONLY=false

# ─── Helpers ─────────────────────────────────────────────────────────────────
info()    { printf '\033[36m[info]\033[0m  %s\n' "$*"; }
ok()      { printf '\033[32m[ok]\033[0m    %s\n' "$*"; }
warn()    { printf '\033[33m[warn]\033[0m  %s\n' "$*"; }
fail()    { printf '\033[31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Deploy the SACS edge function (verify-doctor-sacs) to Supabase.

Options:
  -p, --project-ref REF   Supabase project reference ID (optional if already linked)
  -c, --check-only        Verify prerequisites without deploying
  -h, --help              Show this help message

Examples:
  $(basename "$0")
  $(basename "$0") -p abcdefghijklmnop
  $(basename "$0") --check-only
EOF
  exit 0
}

# ─── Parse args ──────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--project-ref) PROJECT_REF="$2"; shift 2 ;;
    -c|--check-only)  CHECK_ONLY=true; shift ;;
    -h|--help)        usage ;;
    *) fail "Unknown option: $1" ;;
  esac
done

# ─── Banner ──────────────────────────────────────────────────────────────────
echo ""
echo "  SACS Edge Function Deployment"
echo "  Red-Salud - Doctor Verification"
echo "  ────────────────────────────────"
echo ""

# ─── 1. Check Supabase CLI ──────────────────────────────────────────────────
info "Checking Supabase CLI..."
if ! command -v supabase &>/dev/null; then
  fail "Supabase CLI not installed. Install with: npm install -g supabase"
fi
ok "Supabase CLI installed: $(supabase --version)"

# ─── 2. Check authentication ────────────────────────────────────────────────
info "Checking authentication..."
if ! supabase projects list &>/dev/null; then
  fail "Not authenticated. Run: supabase login"
fi
ok "Authenticated with Supabase"

# ─── 3. Link project if ref provided ────────────────────────────────────────
if [[ -n "$PROJECT_REF" ]]; then
  info "Linking project: $PROJECT_REF..."
  if ! supabase link --project-ref "$PROJECT_REF"; then
    fail "Failed to link project"
  fi
  ok "Project linked"
fi

# ─── 4. Check edge function exists ──────────────────────────────────────────
if [[ ! -d "$FUNCTION_PATH" ]]; then
  fail "Edge function not found at: $FUNCTION_PATH"
fi
ok "Edge function found: verify-doctor-sacs"

# ─── 5. Check environment variables ─────────────────────────────────────────
info "Checking environment variables..."
SECRETS_LIST=$(supabase secrets list 2>&1 || true)

if echo "$SECRETS_LIST" | grep -q "SACS_BACKEND_URL"; then
  ok "Variable SACS_BACKEND_URL is set"
else
  warn "Variable SACS_BACKEND_URL not found"
  echo ""
  echo "  To set it manually:"
  echo "  supabase secrets set SACS_BACKEND_URL=https://sacs-verification-service-production.up.railway.app"
  echo ""
  read -r -p "Set it now? [y/N] " response
  if [[ "$response" =~ ^[yY]$ ]]; then
    info "Setting SACS_BACKEND_URL..."
    supabase secrets set SACS_BACKEND_URL="https://sacs-verification-service-production.up.railway.app" \
      || fail "Failed to set secret"
    ok "Variable set"
  else
    fail "Deployment cancelled. Set the variable before continuing."
  fi
fi

# ─── 6. Check-only exit ─────────────────────────────────────────────────────
if $CHECK_ONLY; then
  ok "Pre-flight check passed. Ready for deployment."
  exit 0
fi

# ─── 7. Deploy ──────────────────────────────────────────────────────────────
info "Deploying edge function..."
pushd "$PROJECT_ROOT/database/supabase/functions" > /dev/null

if ! supabase functions deploy verify-doctor-sacs; then
  popd > /dev/null
  fail "Deployment failed"
fi
popd > /dev/null

ok "Edge function deployed"

# ─── 8. Verify ──────────────────────────────────────────────────────────────
info "Verifying deployment..."
FUNCTIONS_LIST=$(supabase functions list 2>&1 || true)

if echo "$FUNCTIONS_LIST" | grep -q "verify-doctor-sacs"; then
  ok "Deployment verified"
else
  warn "Could not verify deployment"
fi

# ─── Done ────────────────────────────────────────────────────────────────────
echo ""
echo "  DEPLOYMENT COMPLETE"
echo "  ────────────────────────────────"
echo ""
info "View logs:"
echo "  supabase functions logs verify-doctor-sacs --follow"
echo ""
info "Test the function:"
echo '  supabase functions invoke verify-doctor-sacs --payload '\''{"cedula":"12345678","tipo_documento":"V"}'\'''
echo ""
