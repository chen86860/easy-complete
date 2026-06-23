#!/bin/bash
set -euo pipefail

APP_DISPLAY="Easy Complete"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_PATH="${1:-${REPO_DIR}/build/${APP_DISPLAY}.app}"
SIGNING_IDENTITY="${APPLE_SIGNING_IDENTITY:-}"
ENTITLEMENTS="${APPLE_CODESIGN_ENTITLEMENTS:-}"

if [ -z "$SIGNING_IDENTITY" ]; then
  echo "error: APPLE_SIGNING_IDENTITY is required" >&2
  exit 1
fi

[ -d "$APP_PATH" ] || { echo "error: app not found: $APP_PATH" >&2; exit 1; }

codesign_args=(--force --timestamp --options runtime --sign "$SIGNING_IDENTITY")
if [ -n "$ENTITLEMENTS" ]; then
  codesign_args+=(--entitlements "$ENTITLEMENTS")
fi

sign_if_exists() {
  local path="$1"
  [ -e "$path" ] || return 0
  codesign "${codesign_args[@]}" "$path"
}

sign_deep_if_exists() {
  local path="$1"
  [ -e "$path" ] || return 0
  codesign "${codesign_args[@]}" --deep "$path"
}

sign_deep_if_exists "$APP_PATH/Contents/Frameworks/Sparkle.framework"
sign_if_exists "$APP_PATH/Contents/MacOS/ec"
sign_if_exists "$APP_PATH/Contents/MacOS/ecterm"
sign_if_exists "$APP_PATH/Contents/MacOS/easy-complete"
sign_deep_if_exists "$APP_PATH/Contents/Helpers/EasyCompleteInputMethod.app"
codesign "${codesign_args[@]}" "$APP_PATH"

codesign --verify --deep --strict --verbose=2 "$APP_PATH"
