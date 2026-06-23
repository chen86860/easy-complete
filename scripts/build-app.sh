#!/bin/bash
set -euo pipefail

# ── Build & assemble Easy Complete.app ──────────────────────────────────────
#
# Builds the Rust binaries and TypeScript frontend, then assembles a complete
# `build/Easy Complete.app` bundle. Does NOT install to /Applications or touch
# any system state — that is install.sh's job. This script is the single source
# of truth for how the .app is put together, shared by install.sh and CI.
#
# Output: build/Easy Complete.app  (ad-hoc code-signed)

APP_NAME="easy-complete"          # binary / process name (no spaces)
APP_DISPLAY="Easy Complete"       # human-readable / bundle directory name
BUNDLE_ID="dev.emmmm.easy-complete"
DEFAULT_SPARKLE_APPCAST_URL="https://github.com/chen86860/easy-complete/releases/latest/download/appcast.xml"

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VERSION=$(cargo metadata --no-deps --format-version 1 | python3 -c "import sys,json; print(json.load(sys.stdin)['packages'][0]['version'])" 2>/dev/null || echo "dev")

STAGING_BUNDLE="${REPO_DIR}/build/${APP_DISPLAY}.app"
MACOS_DIR="${STAGING_BUNDLE}/Contents/MacOS"
RESOURCES_DIR="${STAGING_BUNDLE}/Contents/Resources"
FRAMEWORKS_DIR="${STAGING_BUNDLE}/Contents/Frameworks"
SPARKLE_APPCAST_URL="${SPARKLE_APPCAST_URL:-$DEFAULT_SPARKLE_APPCAST_URL}"

GREEN='\033[0;32m'; NC='\033[0m'
info() { echo -e "${GREEN}==>${NC} $*"; }

cd "$REPO_DIR"

# ── 1. Build ──────────────────────────────────────────────────────────────────
info "Building Rust binaries (release)..."
cargo build --release -p fig_desktop -p figterm -p ec_cli -p fig_input_method

info "Building TypeScript frontend..."
pnpm turbo build --filter="./packages/*"

# ── 2. Assemble .app bundle ───────────────────────────────────────────────────
info "Assembling '${APP_DISPLAY}.app'..."
rm -rf "$STAGING_BUNDLE"
mkdir -p "$MACOS_DIR"
mkdir -p "${RESOURCES_DIR}/autocomplete"
mkdir -p "${RESOURCES_DIR}/dashboard"
mkdir -p "${RESOURCES_DIR}/themes"

if [ ! -f "${REPO_DIR}/bundle/specs/index.json" ]; then
  info "Bundled specs are missing; syncing them now..."
  node "${REPO_DIR}/scripts/sync-bundled-specs.mjs"
fi

info "Embedding Sparkle.framework..."
SPARKLE_FRAMEWORK="${SPARKLE_FRAMEWORK:-$("${REPO_DIR}/scripts/fetch-sparkle.sh")}"
[ -d "$SPARKLE_FRAMEWORK" ] || { echo "error: Sparkle framework not found: $SPARKLE_FRAMEWORK" >&2; exit 1; }
mkdir -p "$FRAMEWORKS_DIR"
cp -R "$SPARKLE_FRAMEWORK" "$FRAMEWORKS_DIR/"

SPARKLE_PUBLIC_KEY_ENTRY=""
if [ -n "${SPARKLE_PUBLIC_ED_KEY:-}" ]; then
  read -r -d '' SPARKLE_PUBLIC_KEY_ENTRY <<PLIST || true
    <key>SUPublicEDKey</key>
    <string>${SPARKLE_PUBLIC_ED_KEY}</string>
PLIST
fi

read -r -d '' SPARKLE_PLIST_ENTRIES <<PLIST || true
    <key>SUFeedURL</key>
    <string>${SPARKLE_APPCAST_URL}</string>
${SPARKLE_PUBLIC_KEY_ENTRY}    <key>SUEnableInstallerLauncherService</key>
    <true/>
PLIST

cp "target/release/${APP_NAME}" "$MACOS_DIR/"
cp "target/release/ec"          "$MACOS_DIR/"
cp "target/release/ecterm"      "$MACOS_DIR/"

cp -r packages/autocomplete-app/dist/* "${RESOURCES_DIR}/autocomplete/"
cp -r packages/dashboard-app/dist/*    "${RESOURCES_DIR}/dashboard/"
cp themes/*.json                       "${RESOURCES_DIR}/themes/"
cp -R bundle/specs                     "${RESOURCES_DIR}/specs"

# Input Method helper app
IM_APP="${STAGING_BUNDLE}/Contents/Helpers/EasyCompleteInputMethod.app"
mkdir -p "${IM_APP}/Contents/MacOS"
mkdir -p "${IM_APP}/Contents/Resources"
cp "target/release/fig_input_method"   "${IM_APP}/Contents/MacOS/"
cp "crates/fig_input_method/Info.plist" "${IM_APP}/Contents/"
cp crates/fig_input_method/resources/*  "${IM_APP}/Contents/Resources/" 2>/dev/null || true

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
    <key>CFBundleIconFile</key>
    <string>icon</string>
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
${SPARKLE_PLIST_ENTRIES}
</dict>
</plist>
PLIST

# Copy app icon to Resources
cp "${REPO_DIR}/crates/fig_desktop/icons/icon.icns" "${RESOURCES_DIR}/icon.icns"

# ── 3. Ad-hoc code sign ───────────────────────────────────────────────────────
# Release builds replace this with Developer ID signing in CI.
info "Ad-hoc code signing..."
codesign --force --deep --sign - "${FRAMEWORKS_DIR}/Sparkle.framework" 2>/dev/null || true
codesign --force --deep --sign - "${IM_APP}" 2>/dev/null || true
codesign --force --deep --sign - "${STAGING_BUNDLE}" 2>/dev/null || true

info "Built: ${STAGING_BUNDLE}"
