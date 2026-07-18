#!/bin/bash
set -euo pipefail

# ── Easy Complete macOS installer ──────────────────────────────────────────

APP_NAME="easy-complete"          # binary / process name (no spaces)
APP_DISPLAY="Easy Complete"       # human-readable / bundle directory name
BUNDLE_ID="dev.emmmm.easy-complete"

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STAGING_BUNDLE="${REPO_DIR}/build/${APP_DISPLAY}.app"
APP_BUNDLE="/Applications/${APP_DISPLAY}.app"
LOCAL_BIN="${HOME}/.local/bin"

GREEN='\033[0;32m'; YELLOW='\033[0;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}==>${NC} $*"; }
warn()  { echo -e "${YELLOW}==>${NC} $*"; }
error() { echo -e "${RED}==>${NC} $*" >&2; }

# ── 1. Build & assemble the .app ──────────────────────────────────────────────
# Shared with CI (see .github/workflows/release.yml) so the bundle is assembled
# identically whether installed locally or packaged into a release DMG.
"${REPO_DIR}/scripts/build-app.sh"

# ── 3. Install to /Applications ───────────────────────────────────────────────
info "Installing to /Applications/..."
# If already running, quit first
pkill -x "${APP_NAME}" 2>/dev/null || true
sleep 0.5

rm -rf "$APP_BUNDLE"
cp -r "$STAGING_BUNDLE" /Applications/

# Reset the stale Accessibility grant. The rebuilt binary carries a new code
# signature, so macOS invalidates the previous grant but leaves a dead entry that
# still points at the old binary — re-ticking the box in System Settings then has
# no effect. Clearing it forces the fresh prompt issued in step 8 to take hold.
# Without Accessibility the app never receives window-focus events, so the
# autocomplete popup can never position itself and simply never appears.
info "Resetting stale Accessibility permission..."
tccutil reset Accessibility "$BUNDLE_ID" 2>/dev/null || true

# ── 4. Symlink CLI binaries to ~/.local/bin ───────────────────────────────────
info "Linking binaries to ${LOCAL_BIN}..."
mkdir -p "$LOCAL_BIN"
ln -sf "/Applications/${APP_DISPLAY}.app/Contents/MacOS/ec"     "${LOCAL_BIN}/ec"
ln -sf "/Applications/${APP_DISPLAY}.app/Contents/MacOS/ecterm" "${LOCAL_BIN}/ecterm"


# ── 6. Shell integration ───────────────────────────────────────────────────────
info "Installing shell integration..."
export PATH="${LOCAL_BIN}:${PATH}"
ec integrations install --silent dotfiles 2>/dev/null || {
  warn "Automatic shell setup skipped. Run manually:"
  warn "  ec integrations install dotfiles"
}

# ── 7. Input Method ────────────────────────────────────────────────────────────
info "Registering Input Method..."
# Kill any stale IME process so the integration installer can launch it fresh
# from the correct ~/Library/Input Methods/ symlink path (required for TIS registration).
pkill -f "fig_input_method" 2>/dev/null || true
pkill -f "EasyCompleteInputMethod" 2>/dev/null || true
sleep 1

ec integrations install input-method 2>/dev/null || {
  warn "Input method registration skipped (only needed for Kitty/Alacritty/Zed/Ghostty/WezTerm)"
}

# ── 8. Accessibility permission ─────────────────────────────────────────────────
info "Requesting Accessibility permission..."
# The autocomplete popup positions itself relative to the focused terminal window,
# which requires Accessibility (AXIsProcessTrusted). After a reinstall the grant was
# just reset in step 3, so trigger the system prompt now. `ec debug prompt-accessibility`
# talks to the running desktop process over its local socket, so launch the app and
# retry briefly while it finishes coming up.
open "$APP_BUNDLE"
prompted=false
for _ in 1 2 3 4 5; do
  if ec debug prompt-accessibility 2>/dev/null; then prompted=true; break; fi
  sleep 1
done
if [ "$prompted" = true ]; then
  warn "Grant '${APP_DISPLAY}' in System Settings → Privacy & Security → Accessibility,"
  warn "then open a terminal and start typing — autocomplete will not appear until it is granted."
else
  warn "Could not reach the desktop app to prompt for Accessibility. Once it is running, run:"
  warn "  ec debug prompt-accessibility"
fi

# ── Done ───────────────────────────────────────────────────────────────────────
echo ""
info "Installation complete!"
echo ""
echo "  App:  /Applications/${APP_DISPLAY}.app"
echo "  CLI:  ${LOCAL_BIN}/ec  ($(ec --version 2>/dev/null || echo 'restart shell to verify'))"
echo ""
echo "  Reload your shell to activate Easy Complete:"
echo "    exec \$SHELL"
echo ""
echo "  If autocomplete does not appear, grant Accessibility to '${APP_DISPLAY}' in"
echo "    System Settings → Privacy & Security → Accessibility  (re-run: ec debug prompt-accessibility)"
