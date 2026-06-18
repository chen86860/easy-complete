#!/bin/bash
set -euo pipefail

# ── Package Easy Complete.app into a distributable .dmg ──────────────────────
#
# Expects build/Easy Complete.app to already exist (run scripts/build-app.sh
# first). Produces a compressed DMG with a drag-to-Applications layout.
#
# Usage: scripts/make-dmg.sh [output.dmg]
#   Default output: dist/Easy-Complete.dmg

APP_DISPLAY="Easy Complete"
VOL_NAME="Easy Complete"

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP="${REPO_DIR}/build/${APP_DISPLAY}.app"
OUT="${1:-${REPO_DIR}/dist/Easy-Complete.dmg}"

GREEN='\033[0;32m'; NC='\033[0m'
info() { echo -e "${GREEN}==>${NC} $*"; }

[ -d "$APP" ] || { echo "error: $APP not found — run scripts/build-app.sh first" >&2; exit 1; }

mkdir -p "$(dirname "$OUT")"
rm -f "$OUT"

# Stage the DMG contents in a temp dir: the app + a symlink to /Applications.
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
cp -R "$APP" "$STAGE/"
ln -s /Applications "$STAGE/Applications"

# Optional volume icon
if [ -f "${REPO_DIR}/bundle/dmg/VolumeIcon.icns" ]; then
  cp "${REPO_DIR}/bundle/dmg/VolumeIcon.icns" "$STAGE/.VolumeIcon.icns"
  SetFile -a C "$STAGE" 2>/dev/null || true
fi

info "Creating DMG: $OUT"
hdiutil create \
  -volname "$VOL_NAME" \
  -srcfolder "$STAGE" \
  -fs HFS+ \
  -format UDZO \
  -ov \
  "$OUT" >/dev/null

info "Done: $OUT"
