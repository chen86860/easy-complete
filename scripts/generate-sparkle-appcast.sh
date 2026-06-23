#!/bin/bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DMG_PATH="${1:-${REPO_DIR}/dist/Easy-Complete-arm64.dmg}"
APPCAST_DIR="${APPCAST_DIR:-${REPO_DIR}/dist/sparkle}"
SPARKLE_VERSION="${SPARKLE_VERSION:-2.9.3}"
DOWNLOAD_URL_PREFIX="${SPARKLE_DOWNLOAD_URL_PREFIX:-}"

[ -f "$DMG_PATH" ] || { echo "error: dmg not found: $DMG_PATH" >&2; exit 1; }

if [ -z "${SPARKLE_PRIVATE_ED_KEY:-}" ]; then
  echo "error: SPARKLE_PRIVATE_ED_KEY is required" >&2
  exit 1
fi

if [ -z "$DOWNLOAD_URL_PREFIX" ]; then
  if [ -n "${GITHUB_REPOSITORY:-}" ] && [ -n "${GITHUB_REF_NAME:-}" ]; then
    DOWNLOAD_URL_PREFIX="https://github.com/${GITHUB_REPOSITORY}/releases/download/${GITHUB_REF_NAME}/"
  else
    echo "error: SPARKLE_DOWNLOAD_URL_PREFIX is required outside GitHub Actions" >&2
    exit 1
  fi
fi

SPARKLE_ROOT="${REPO_DIR}/build/sparkle/${SPARKLE_VERSION}"
"${REPO_DIR}/scripts/fetch-sparkle.sh" >/dev/null

rm -rf "$APPCAST_DIR"
mkdir -p "$APPCAST_DIR"
cp "$DMG_PATH" "$APPCAST_DIR/"

printf '%s\n' "${SPARKLE_RELEASE_NOTES:-See the GitHub release for details.}" > \
  "$APPCAST_DIR/$(basename "$DMG_PATH" .dmg).md"

printf '%s' "$SPARKLE_PRIVATE_ED_KEY" | \
  "$SPARKLE_ROOT/bin/generate_appcast" \
    --ed-key-file - \
    --download-url-prefix "$DOWNLOAD_URL_PREFIX" \
    --embed-release-notes \
    --link "https://github.com/${GITHUB_REPOSITORY:-chen86860/easy-complete}" \
    --maximum-versions 1 \
    "$APPCAST_DIR"

[ -f "$APPCAST_DIR/appcast.xml" ] || { echo "error: appcast.xml was not generated" >&2; exit 1; }
printf '%s\n' "$APPCAST_DIR/appcast.xml"
