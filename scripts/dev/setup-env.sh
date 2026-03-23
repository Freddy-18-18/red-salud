#!/usr/bin/env bash
#
# Development environment setup
# Installs Node.js (via nvm), Claude Code, and configures Z.AI API access.
#
# Originally: claude_code_zai_env.sh
#
set -euo pipefail

SCRIPT_NAME=$(basename "$0")
NODE_MIN_VERSION=18
NODE_INSTALL_VERSION=22
NVM_VERSION="v0.40.3"
CLAUDE_PACKAGE="@anthropic-ai/claude-code"
CONFIG_DIR="$HOME/.claude"
CONFIG_FILE="$CONFIG_DIR/settings.json"
API_BASE_URL="https://api.z.ai/api/anthropic"
API_KEY_URL="https://z.ai/manage-apikey/apikey-list"
API_TIMEOUT_MS=3000000

# ─── Helpers ─────────────────────────────────────────────────────────────────
info()    { printf '\033[36m[info]\033[0m  %s\n' "$*"; }
ok()      { printf '\033[32m[ok]\033[0m    %s\n' "$*"; }
fail()    { printf '\033[31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

ensure_dir_exists() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    mkdir -p "$dir" || fail "Failed to create directory: $dir"
  fi
}

# ─── Node.js ─────────────────────────────────────────────────────────────────
install_nodejs() {
  local platform
  platform=$(uname -s)

  case "$platform" in
    Linux|Darwin)
      info "Installing Node.js on $platform..."
      info "Installing nvm ($NVM_VERSION)..."
      curl -s "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash
      # shellcheck disable=SC1091
      \. "$HOME/.nvm/nvm.sh"
      info "Installing Node.js $NODE_INSTALL_VERSION..."
      nvm install "$NODE_INSTALL_VERSION"
      node -v &>/dev/null || fail "Node.js installation failed"
      ok "Node.js installed: $(node -v)"
      ok "npm version: $(npm -v)"
      ;;
    *)
      fail "Unsupported platform: $platform"
      ;;
  esac
}

check_nodejs() {
  if command -v node &>/dev/null; then
    local current_version major_version
    current_version=$(node -v | sed 's/v//')
    major_version=$(echo "$current_version" | cut -d. -f1)

    if [[ "$major_version" -ge "$NODE_MIN_VERSION" ]]; then
      ok "Node.js is already installed: v$current_version"
      return 0
    else
      info "Node.js v$current_version < $NODE_MIN_VERSION. Upgrading..."
      install_nodejs
    fi
  else
    info "Node.js not found. Installing..."
    install_nodejs
  fi
}

# ─── Claude Code ─────────────────────────────────────────────────────────────
install_claude_code() {
  if command -v claude &>/dev/null; then
    ok "Claude Code is already installed: $(claude --version)"
  else
    info "Installing Claude Code..."
    npm install -g "$CLAUDE_PACKAGE" || fail "Failed to install claude-code"
    ok "Claude Code installed"
  fi
}

configure_claude_json() {
  node --eval '
    const os = require("os");
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(os.homedir(), ".claude.json");
    const content = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
      : {};
    fs.writeFileSync(filePath, JSON.stringify({ ...content, hasCompletedOnboarding: true }, null, 2), "utf-8");
  '
}

# ─── API Key ─────────────────────────────────────────────────────────────────
configure_claude() {
  info "Configuring Claude Code..."
  echo "  Get your API key from: $API_KEY_URL"
  read -s -r -p "  Enter your Z.AI API key: " api_key
  echo

  [[ -z "$api_key" ]] && fail "API key cannot be empty"

  ensure_dir_exists "$CONFIG_DIR"

  node --eval '
    const os = require("os");
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(os.homedir(), ".claude", "settings.json");
    const apiKey = "'"$api_key"'";
    const content = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
      : {};
    fs.writeFileSync(filePath, JSON.stringify({
      ...content,
      env: {
        ANTHROPIC_AUTH_TOKEN: apiKey,
        ANTHROPIC_BASE_URL: "'"$API_BASE_URL"'",
        API_TIMEOUT_MS: "'"$API_TIMEOUT_MS"'",
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: 1
      }
    }, null, 2), "utf-8");
  ' || fail "Failed to write settings.json"

  ok "Claude Code configured"
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo "  Development Environment Setup"
  echo "  ────────────────────────────────"
  echo ""

  check_nodejs
  install_claude_code
  configure_claude_json
  configure_claude

  echo ""
  ok "Setup complete! Run 'claude' to start."
  echo ""
}

main "$@"
