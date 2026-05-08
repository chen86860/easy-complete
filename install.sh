#!/bin/bash
set -euo pipefail

# ── autocomplete-v5 macOS installer ──────────────────────────────────────────

APP_NAME="autocomplete-v5"
BUNDLE_ID="dev.emmmm.autocomplete-v5"
VERSION=$(cargo metadata --no-deps --format-version 1 | python3 -c "import sys,json; print(json.load(sys.stdin)['packages'][0]['version'])" 2>/dev/null || echo "dev")

APP_BUNDLE="/Applications/${APP_NAME}.app"
MACOS_DIR="${APP_BUNDLE}/Contents/MacOS"
RESOURCES_DIR="${APP_BUNDLE}/Contents/Resources"
LOCAL_BIN="${HOME}/.local/bin"
LAUNCH_AGENTS="${HOME}/Library/LaunchAgents"
PLIST_PATH="${LAUNCH_AGENTS}/${BUNDLE_ID}.plist"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'; YELLOW='\033[0;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}==>${NC} $*"; }
warn()  { echo -e "${YELLOW}==>${NC} $*"; }
error() { echo -e "${RED}==>${NC} $*" >&2; }

# ── 1. Build ──────────────────────────────────────────────────────────────────
info "Building Rust binaries (release)..."
cd "$REPO_DIR"
cargo build --release -p fig_desktop -p figterm -p q_cli -p fig_input_method

info "Building TypeScript frontend..."
pnpm turbo build --filter="./packages/*"

# ── 2. Assemble .app bundle ───────────────────────────────────────────────────
info "Assembling ${APP_NAME}.app..."
rm -rf "$APP_BUNDLE"
mkdir -p "$MACOS_DIR"
mkdir -p "${RESOURCES_DIR}/autocomplete"
mkdir -p "${RESOURCES_DIR}/dashboard"

cp "target/release/${APP_NAME}"  "$MACOS_DIR/"
cp "target/release/acv5"         "$MACOS_DIR/"
cp "target/release/acv5term"     "$MACOS_DIR/"

cp -r packages/autocomplete-app/dist/* "${RESOURCES_DIR}/autocomplete/"
cp -r packages/dashboard-app/dist/*    "${RESOURCES_DIR}/dashboard/"

# Input Method helper app
IM_APP="${APP_BUNDLE}/Contents/Helpers/AutocompleteInputMethod.app"
mkdir -p "${IM_APP}/Contents/MacOS"
mkdir -p "${IM_APP}/Contents/Resources"
cp "target/release/fig_input_method"                            "${IM_APP}/Contents/MacOS/"
cp "crates/fig_input_method/Info.plist"                         "${IM_APP}/Contents/"
cp crates/fig_input_method/resources/*                          "${IM_APP}/Contents/Resources/" 2>/dev/null || true

cat > "${APP_BUNDLE}/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleIdentifier</key>
    <string>${BUNDLE_ID}</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleDisplayName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleExecutable</key>
    <string>${APP_NAME}</string>
    <key>CFBundleVersion</key>
    <string>${VERSION}</string>
    <key>CFBundleShortVersionString</key>
    <string>${VERSION}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSUIElement</key>
    <true/>
    <key>NSSupportsAutomaticGraphicsSwitching</key>
    <true/>
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>${APP_NAME} URL</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>acv5</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
PLIST

# ── 3. Install to /Applications ───────────────────────────────────────────────
info "Installing to /Applications/..."
# If already running, quit first
pkill -x "${APP_NAME}" 2>/dev/null || true
sleep 0.5

# Remove old launchd job if loaded
launchctl unload "$PLIST_PATH" 2>/dev/null || true

cp -r "$APP_BUNDLE" /Applications/

# ── 4. Symlink CLI binaries to ~/.local/bin ───────────────────────────────────
info "Linking binaries to ${LOCAL_BIN}..."
mkdir -p "$LOCAL_BIN"
ln -sf "/Applications/${APP_NAME}.app/Contents/MacOS/acv5"     "${LOCAL_BIN}/acv5"
ln -sf "/Applications/${APP_NAME}.app/Contents/MacOS/acv5term" "${LOCAL_BIN}/acv5term"

# Ensure ~/.local/bin is in PATH
SHELL_RC=""
case "${SHELL:-}" in
  */zsh)  SHELL_RC="${HOME}/.zshrc" ;;
  */bash) SHELL_RC="${HOME}/.bashrc" ;;
esac

if [[ -n "$SHELL_RC" ]] && ! grep -q '\.local/bin' "$SHELL_RC" 2>/dev/null; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
  warn "Added ~/.local/bin to PATH in ${SHELL_RC}"
fi

# ── 5. LaunchAgent (autostart on login) ───────────────────────────────────────
info "Installing LaunchAgent for autostart..."
mkdir -p "$LAUNCH_AGENTS"
cat > "$PLIST_PATH" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${BUNDLE_ID}</string>
    <key>Program</key>
    <string>/Applications/${APP_NAME}.app/Contents/MacOS/${APP_NAME}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>ThrottleInterval</key>
    <integer>10</integer>
    <key>StandardOutPath</key>
    <string>${HOME}/.local/share/${APP_NAME}/launch.log</string>
    <key>StandardErrorPath</key>
    <string>${HOME}/.local/share/${APP_NAME}/launch.log</string>
</dict>
</plist>
PLIST

launchctl load "$PLIST_PATH"

# ── 6. Shell integration ───────────────────────────────────────────────────────
info "Installing shell integration..."
export PATH="${LOCAL_BIN}:${PATH}"
acv5 setup --no-confirm 2>/dev/null || {
  warn "Automatic shell setup skipped. Run manually:"
  warn "  acv5 setup"
}

# ── 7. Input Method ────────────────────────────────────────────────────────────
info "Registering Input Method..."
# Kill old IME and start new one so it can self-register with TIS
pkill -f "fig_input_method" 2>/dev/null || true
sleep 1
open "${IM_APP}"
sleep 3  # Wait for the IME to start and register with TIS

acv5 integrations install input-method 2>/dev/null || {
  warn "Input method registration skipped (only needed for Kitty/Alacritty/Zed/Ghostty/WezTerm)"
}

# ── Done ───────────────────────────────────────────────────────────────────────
echo ""
info "Installation complete!"
echo ""
echo "  App:  /Applications/${APP_NAME}.app"
echo "  CLI:  ${LOCAL_BIN}/acv5  ($(acv5 --version 2>/dev/null || echo 'restart shell to verify'))"
echo ""
echo "  Reload your shell to activate autocomplete:"
echo "    exec \$SHELL"
