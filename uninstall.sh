#!/bin/bash
set -euo pipefail

# ── autocomplete-v5 macOS uninstaller ────────────────────────────────────────

APP_NAME="autocomplete-v5"
BUNDLE_ID="dev.emmmm.autocomplete-v5"
IME_BUNDLE_ID="dev.emmmm.autocomplete-v5.inputmethod"

APP_BUNDLE="/Applications/${APP_NAME}.app"
LOCAL_BIN="${HOME}/.local/bin"
LAUNCH_AGENTS="${HOME}/Library/LaunchAgents"
PLIST_PATH="${LAUNCH_AGENTS}/${BUNDLE_ID}.plist"
INPUT_METHODS_DIR="${HOME}/Library/Input Methods"
IME_SYMLINK="${INPUT_METHODS_DIR}/AutocompleteInputMethod.app"
APP_SUPPORT="${HOME}/Library/Application Support/${APP_NAME}"
LOGS_DIR="${HOME}/.local/share/${APP_NAME}"

GREEN='\033[0;32m'; YELLOW='\033[0;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}==>${NC} $*"; }
warn()  { echo -e "${YELLOW}==>${NC} $*"; }
error() { echo -e "${RED}==>${NC} $*" >&2; }

# ── Confirm ───────────────────────────────────────────────────────────────────
if [[ "${1:-}" != "--yes" ]]; then
  echo ""
  warn "This will completely remove ${APP_NAME} and all its data."
  echo "  • /Applications/${APP_NAME}.app"
  echo "  • ${IME_SYMLINK}"
  echo "  • ${PLIST_PATH}"
  echo "  • ${LOCAL_BIN}/acv5  and  acv5term"
  echo "  • ${APP_SUPPORT}/"
  echo "  • ${LOGS_DIR}/"
  echo "  • Shell integration lines in ~/.zshrc / ~/.bashrc / ~/.config/fish/config.fish"
  echo ""
  read -r -p "Continue? [y/N] " confirm
  [[ "${confirm}" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
fi

# ── 1. Uninstall input method via CLI (disables TIS source cleanly) ───────────
info "Uninstalling input method integration..."
if command -v acv5 &>/dev/null; then
  acv5 integrations uninstall input-method 2>/dev/null || true
fi

# ── 2. Kill running processes ─────────────────────────────────────────────────
info "Stopping processes..."
pkill -x "${APP_NAME}"       2>/dev/null || true
pkill -f "fig_input_method"  2>/dev/null || true
pkill -f "acv5term"          2>/dev/null || true
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
info "Removing /Applications/${APP_NAME}.app..."
rm -rf "$APP_BUNDLE"

# ── 6. Remove CLI symlinks ─────────────────────────────────────────────────────
info "Removing CLI symlinks..."
rm -f "${LOCAL_BIN}/acv5"
rm -f "${LOCAL_BIN}/acv5term"

# ── 7. Remove shell integration from rc files ─────────────────────────────────
info "Cleaning shell integration..."

strip_shell_integration() {
  local rc_file="$1"
  [[ -f "$rc_file" ]] || return 0

  # Lines added by acv5 setup / install.sh
  local tmp
  tmp="$(mktemp)"
  grep -v 'autocomplete-v5\|acv5\|\.local/bin.*PATH\|fig_integration\|QTERM_SESSION\|acv5term\|fig\.sh\|figterm' \
    "$rc_file" > "$tmp" || true
  mv "$tmp" "$rc_file"
}

strip_shell_integration "${HOME}/.zshrc"
strip_shell_integration "${HOME}/.bashrc"
strip_shell_integration "${HOME}/.bash_profile"

# Fish shell
FISH_CONFIG="${HOME}/.config/fish/config.fish"
if [[ -f "$FISH_CONFIG" ]]; then
  tmp="$(mktemp)"
  grep -v 'autocomplete-v5\|acv5\|fig_integration\|QTERM_SESSION\|acv5term\|fig\.fish\|figterm' \
    "$FISH_CONFIG" > "$tmp" || true
  mv "$tmp" "$FISH_CONFIG"
fi

# Remove acv5-generated shell integration files
rm -f "${HOME}/.local/share/fig/zsh_fig_integration.sh"
rm -f "${HOME}/.local/share/fig/bash_fig_integration.sh"
rm -f "${HOME}/.config/fish/functions/fig.fish"

# ── 8. Remove application data ────────────────────────────────────────────────
info "Removing application data..."
rm -rf "$APP_SUPPORT"
rm -rf "$LOGS_DIR"

# IPC sockets / temp dirs
rm -rf "${TMPDIR}acv5run"  2>/dev/null || true
rm -rf "/tmp/acv5run"      2>/dev/null || true

# Preferences
defaults delete "$BUNDLE_ID"     2>/dev/null || true
defaults delete "$IME_BUNDLE_ID" 2>/dev/null || true

# Keychain entries (best-effort)
security delete-generic-password -s "$BUNDLE_ID" 2>/dev/null || true

# ── Done ───────────────────────────────────────────────────────────────────────
echo ""
info "autocomplete-v5 has been fully uninstalled."
echo ""
echo "  To remove the ~/.local/bin directory itself (if empty):"
echo "    rmdir ~/.local/bin 2>/dev/null"
echo ""
echo "  Reload your shell to apply PATH changes:"
echo "    exec \$SHELL"
