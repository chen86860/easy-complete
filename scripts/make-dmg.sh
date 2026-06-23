#!/bin/bash
set -euo pipefail

# ── Package Easy Complete.app into a distributable .dmg ──────────────────────
#
# Expects build/Easy Complete.app to already exist (run scripts/build-app.sh
# first). Produces a drag-to-install DMG with a custom background image.
#
# Background images (committed to the repo):
#   bundle/dmg/background.png    — 660×400, 1×
#   bundle/dmg/background@2x.png — 1320×800, 2× (Retina)
# To regenerate them: swift scripts/make-dmg-background.swift
#
# Usage: scripts/make-dmg.sh [output.dmg]
#   Default output: dist/Easy-Complete.dmg

APP_DISPLAY="Easy Complete"
VOL_NAME="Easy Complete"

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP="${REPO_DIR}/build/${APP_DISPLAY}.app"
OUT="${1:-${REPO_DIR}/dist/Easy-Complete.dmg}"
BG="${REPO_DIR}/bundle/dmg/background.png"

GREEN='\033[0;32m'; NC='\033[0m'
info() { echo -e "${GREEN}==>${NC} $*"; }

[ -d "$APP" ] || { echo "error: $APP not found — run scripts/build-app.sh first" >&2; exit 1; }
[ -f "$BG" ]  || { echo "error: $BG not found — run: swift scripts/make-dmg-background.swift" >&2; exit 1; }

command -v create-dmg >/dev/null 2>&1 \
  || { echo "error: create-dmg not found — run: brew install create-dmg" >&2; exit 1; }

mkdir -p "$(dirname "$OUT")"
rm -f "$OUT"

info "Creating DMG: $OUT"

# Icon layout (logical px, origin = top-left of window):
#   App icon center  → (165, 275)
#   Applications     → (495, 275)
#   create-dmg picks up background@2x.png automatically when it sits next to background.png
create-dmg \
  --volname         "$VOL_NAME" \
  --background      "$BG" \
  --window-pos      200 120 \
  --window-size     658 498 \
  --icon-size       128 \
  --icon            "${APP_DISPLAY}.app" 165 236 \
  --hide-extension  "${APP_DISPLAY}.app" \
  --app-drop-link   495 236 \
  --no-internet-enable \
  "$OUT" \
  "$APP"

info "Done: $OUT"
