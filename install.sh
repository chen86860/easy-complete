#!/bin/bash
set -euo pipefail

# ── Easy Complete macOS installer ──────────────────────────────────────────

APP_NAME="easy-complete"          # binary / process name (no spaces)
APP_DISPLAY="Easy Complete"       # human-readable / bundle directory name
BUNDLE_ID="dev.emmmm.easy-complete"
VERSION=$(cargo metadata --no-deps --format-version 1 | python3 -c "import sys,json; print(json.load(sys.stdin)['packages'][0]['version'])" 2>/dev/null || echo "dev")

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
STAGING_BUNDLE="${REPO_DIR}/build/${APP_DISPLAY}.app"
APP_BUNDLE="/Applications/${APP_DISPLAY}.app"
MACOS_DIR="${STAGING_BUNDLE}/Contents/MacOS"
RESOURCES_DIR="${STAGING_BUNDLE}/Contents/Resources"
LOCAL_BIN="${HOME}/.local/bin"
LAUNCH_AGENTS="${HOME}/Library/LaunchAgents"
PLIST_PATH="${LAUNCH_AGENTS}/${BUNDLE_ID}.plist"

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
info "Assembling '${APP_DISPLAY}.app'..."
rm -rf "$STAGING_BUNDLE"
mkdir -p "$MACOS_DIR"
mkdir -p "${RESOURCES_DIR}/autocomplete"
mkdir -p "${RESOURCES_DIR}/dashboard"
mkdir -p "${RESOURCES_DIR}/themes"

cp "target/release/${APP_NAME}"  "$MACOS_DIR/"
cp "target/release/ec"         "$MACOS_DIR/"
cp "target/release/ecterm"     "$MACOS_DIR/"

cp -r packages/autocomplete-app/dist/* "${RESOURCES_DIR}/autocomplete/"
cp -r packages/dashboard-app/dist/*    "${RESOURCES_DIR}/dashboard/"
cp themes/*.json                        "${RESOURCES_DIR}/themes/"

# Input Method helper app
IM_APP="${STAGING_BUNDLE}/Contents/Helpers/EasyCompleteInputMethod.app"
mkdir -p "${IM_APP}/Contents/MacOS"
mkdir -p "${IM_APP}/Contents/Resources"
cp "target/release/fig_input_method"                            "${IM_APP}/Contents/MacOS/"
cp "crates/fig_input_method/Info.plist"                         "${IM_APP}/Contents/"
cp crates/fig_input_method/resources/*                          "${IM_APP}/Contents/Resources/" 2>/dev/null || true

cat > "${STAGING_BUNDLE}/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleIdentifier</key>
    <string>${BUNDLE_ID}</string>
    <key>CFBundleName</key>
    <string>${APP_DISPLAY}</string>
    <key>CFBundleDisplayName</key>
    <string>${APP_DISPLAY}</string>
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
            <string>${APP_DISPLAY} URL</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>ec</string>
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

rm -rf "$APP_BUNDLE"
cp -r "$STAGING_BUNDLE" /Applications/

# ── 4. Symlink CLI binaries to ~/.local/bin ───────────────────────────────────
info "Linking binaries to ${LOCAL_BIN}..."
mkdir -p "$LOCAL_BIN"
ln -sf "/Applications/${APP_DISPLAY}.app/Contents/MacOS/ec"     "${LOCAL_BIN}/ec"
ln -sf "/Applications/${APP_DISPLAY}.app/Contents/MacOS/ecterm" "${LOCAL_BIN}/ecterm"


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
    <string>/Applications/${APP_DISPLAY}.app/Contents/MacOS/${APP_NAME}</string>
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
ec setup --no-confirm 2>/dev/null || {
  warn "Automatic shell setup skipped. Run manually:"
  warn "  ec setup"
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

# ── Done ───────────────────────────────────────────────────────────────────────
echo ""
info "Installation complete!"
echo ""
echo "  App:  /Applications/${APP_DISPLAY}.app"
echo "  CLI:  ${LOCAL_BIN}/ec  ($(ec --version 2>/dev/null || echo 'restart shell to verify'))"
echo ""
echo "  Reload your shell to activate Easy Complete:"
echo "    exec \$SHELL"
