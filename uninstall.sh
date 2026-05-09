#!/bin/bash
set -euo pipefail

# ── Easy Complete macOS uninstaller ────────────────────────────────────────

APP_NAME="easy-complete"
APP_DISPLAY="Easy Complete"
BUNDLE_ID="dev.emmmm.easy-complete"
IME_BUNDLE_ID="dev.emmmm.easy-complete.inputmethod"

APP_BUNDLE="/Applications/${APP_DISPLAY}.app"
LOCAL_BIN="${HOME}/.local/bin"
LAUNCH_AGENTS="${HOME}/Library/LaunchAgents"
PLIST_PATH="${LAUNCH_AGENTS}/${BUNDLE_ID}.plist"
INPUT_METHODS_DIR="${HOME}/Library/Input Methods"
IME_SYMLINK="${INPUT_METHODS_DIR}/EasyCompleteInputMethod.app"
APP_SUPPORT="${HOME}/Library/Application Support/${APP_NAME}"
LOGS_DIR="${HOME}/.local/share/${APP_NAME}"

GREEN='\033[0;32m'; YELLOW='\033[0;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}==>${NC} $*"; }
warn()  { echo -e "${YELLOW}==>${NC} $*"; }
error() { echo -e "${RED}==>${NC} $*" >&2; }

# ── Confirm ───────────────────────────────────────────────────────────────────
if [[ "${1:-}" != "--yes" ]]; then
  echo ""
  warn "This will completely remove ${APP_DISPLAY} and all its data."
  echo "  • /Applications/${APP_DISPLAY}.app"
  echo "  • ${IME_SYMLINK}"
  echo "  • ${PLIST_PATH}"
  echo "  • ${LOCAL_BIN}/ec  and  ecterm"
  echo "  • ${APP_SUPPORT}/"
  echo "  • ${LOGS_DIR}/"
  echo "  • Shell integration lines in ~/.zshrc / ~/.bashrc / ~/.config/fish/config.fish"
  echo ""
  read -r -p "Continue? [y/N] " confirm
  [[ "${confirm}" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
fi

# ── 1. Uninstall integrations via CLI (must run before binary is removed) ─────
info "Uninstalling input method integration..."
if command -v ec &>/dev/null; then
  ec integrations uninstall input-method 2>/dev/null || true
fi

info "Uninstalling shell integration..."
if command -v ec &>/dev/null; then
  ec integrations uninstall shell 2>/dev/null || true
fi

# ── 2. Kill running processes ─────────────────────────────────────────────────
info "Stopping processes..."
pkill -x "${APP_NAME}"       2>/dev/null || true
pkill -f "fig_input_method"  2>/dev/null || true
pkill -f "ecterm"          2>/dev/null || true
sleep 0.5

# ── 3. Unload and remove LaunchAgent ─────────────────────────────────────────
info "Removing LaunchAgent..."
if [[ -f "$PLIST_PATH" ]]; then
  launchctl unload "$PLIST_PATH" 2>/dev/null || true
  rm -f "$PLIST_PATH"
fi

# ── 4. Remove IME symlink ──────────────────────────────────────────────────────
info "Removing Input Method..."
if [[ -L "$IME_SYMLINK" || -d "$IME_SYMLINK" ]]; then
  rm -rf "$IME_SYMLINK"
fi

# Remove IME from HIToolbox prefs so it no longer appears in System Settings
# (best-effort — macOS cleans this up on next login if the bundle is gone)
defaults delete com.apple.HIToolbox AppleEnabledInputSources 2>/dev/null || true

# ── 5. Remove app bundle ───────────────────────────────────────────────────────
info "Removing /Applications/${APP_DISPLAY}.app..."
rm -rf "$APP_BUNDLE"

# ── 6. Remove CLI symlinks ─────────────────────────────────────────────────────
info "Removing CLI symlinks..."
rm -f "${LOCAL_BIN}/ec"
rm -f "${LOCAL_BIN}/ecterm"

# ── 7. Fallback shell integration cleanup (in case ec was already removed) ────
# ec integrations uninstall shell was already called in step 1.
# This fallback removes any remaining lines using targeted patterns only.
info "Verifying shell integration removal..."

strip_shell_integration_fallback() {
  local rc_file="$1"
  [[ -f "$rc_file" ]] || return 0

  local tmp
  tmp="$(mktemp)"
  # Only remove lines that are specifically part of the Easy Complete integration block:
  #   - The block comment headers
  #   - The source lines referencing our shell data directory
  grep -Ev \
    'Easy Complete (pre|post) block|easy-complete/shell/(zshrc|zprofile|bashrc|bash_profile)\.(pre|post)\.(zsh|bash)' \
    "$rc_file" > "$tmp" || true
  mv "$tmp" "$rc_file"
}

strip_shell_integration_fallback "${HOME}/.zshrc"
strip_shell_integration_fallback "${HOME}/.zprofile"
strip_shell_integration_fallback "${HOME}/.bashrc"
strip_shell_integration_fallback "${HOME}/.bash_profile"

# Fish shell — remove the dedicated fish integration conf files directly
rm -f "${HOME}/.config/fish/conf.d/00_fig_pre.fish"
rm -f "${HOME}/.config/fish/conf.d/99_fig_post.fish"

# ── 8. Remove application data ────────────────────────────────────────────────
info "Removing application data..."
rm -rf "$APP_SUPPORT"
rm -rf "$LOGS_DIR"

# IPC sockets / temp dirs
rm -rf "${TMPDIR}ecrun"  2>/dev/null || true
rm -rf "/tmp/ecrun"      2>/dev/null || true

# Preferences
defaults delete "$BUNDLE_ID"     2>/dev/null || true
defaults delete "$IME_BUNDLE_ID" 2>/dev/null || true

# Keychain entries (best-effort)
security delete-generic-password -s "$BUNDLE_ID" 2>/dev/null || true

# ── Done ───────────────────────────────────────────────────────────────────────
echo ""
info "Easy Complete has been fully uninstalled."
echo ""
echo "  To remove the ~/.local/bin directory itself (if empty):"
echo "    rmdir ~/.local/bin 2>/dev/null"
echo ""
echo "  Reload your shell to apply PATH changes:"
echo "    exec \$SHELL"
