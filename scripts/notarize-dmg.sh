#!/bin/bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DMG_PATH="${1:-${REPO_DIR}/dist/Easy-Complete-arm64.dmg}"
SIGNING_IDENTITY="${APPLE_SIGNING_IDENTITY:-}"

if [ -z "$SIGNING_IDENTITY" ]; then
  echo "error: APPLE_SIGNING_IDENTITY is required" >&2
  exit 1
fi

[ -f "$DMG_PATH" ] || { echo "error: dmg not found: $DMG_PATH" >&2; exit 1; }

codesign --force --timestamp --sign "$SIGNING_IDENTITY" "$DMG_PATH"

notary_args=()
if [ -n "${APPLE_NOTARY_KEYCHAIN_PROFILE:-}" ]; then
  notary_args+=(--keychain-profile "$APPLE_NOTARY_KEYCHAIN_PROFILE")
elif { [ -n "${APPLE_NOTARY_KEY:-}" ] || [ -n "${APPLE_NOTARY_KEY_BASE64:-}" ]; } \
  && [ -n "${APPLE_NOTARY_KEY_ID:-}" ] && [ -n "${APPLE_NOTARY_ISSUER_ID:-}" ]; then
  notary_key_file="$(mktemp)"
  trap 'rm -f "$notary_key_file"' EXIT
  if [ -n "${APPLE_NOTARY_KEY_BASE64:-}" ]; then
    printf '%s' "$APPLE_NOTARY_KEY_BASE64" | base64 --decode > "$notary_key_file"
  else
    printf '%s' "$APPLE_NOTARY_KEY" > "$notary_key_file"
  fi
  notary_args+=(--key "$notary_key_file" --key-id "$APPLE_NOTARY_KEY_ID" --issuer "$APPLE_NOTARY_ISSUER_ID")
elif [ -n "${APPLE_ID:-}" ] && [ -n "${APPLE_APP_SPECIFIC_PASSWORD:-}" ] && [ -n "${APPLE_TEAM_ID:-}" ]; then
  notary_args+=(--apple-id "$APPLE_ID" --password "$APPLE_APP_SPECIFIC_PASSWORD" --team-id "$APPLE_TEAM_ID")
else
  echo "error: provide APPLE_NOTARY_KEYCHAIN_PROFILE, App Store Connect API key envs, or Apple ID notarization envs" >&2
  exit 1
fi

xcrun notarytool submit "$DMG_PATH" "${notary_args[@]}" --wait
xcrun stapler staple "$DMG_PATH"
xcrun stapler validate "$DMG_PATH"
spctl -a -t open --context context:primary-signature -v "$DMG_PATH"
