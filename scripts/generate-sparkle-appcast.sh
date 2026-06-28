#!/bin/bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DMG_PATH="${1:-${REPO_DIR}/dist/Easy-Complete-arm64.dmg}"
APPCAST_DIR="${APPCAST_DIR:-${REPO_DIR}/dist/sparkle}"
SPARKLE_VERSION="${SPARKLE_VERSION:-2.9.3}"
SPARKLE_MAXIMUM_VERSIONS="${SPARKLE_MAXIMUM_VERSIONS:-1}"
SPARKLE_MAXIMUM_DELTAS="${SPARKLE_MAXIMUM_DELTAS:-8}"
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

mkdir -p "$APPCAST_DIR"

VERSION="${SPARKLE_BUNDLE_VERSION:-$(cargo metadata --no-deps --format-version 1 | python3 -c "import sys,json; print(json.load(sys.stdin)['packages'][0]['version'])" 2>/dev/null || echo "")}"
if [ -z "$VERSION" ]; then
  echo "error: SPARKLE_BUNDLE_VERSION is required when Cargo metadata is unavailable" >&2
  exit 1
fi

ARCHIVE_NAME="${SPARKLE_ARCHIVE_NAME:-Easy-Complete-${VERSION}-arm64.dmg}"
ARCHIVE_PATH="${APPCAST_DIR}/${ARCHIVE_NAME}"
DMG_DIR="$(cd "$(dirname "$DMG_PATH")" && pwd)"
APPCAST_ABS_DIR="$(cd "$APPCAST_DIR" && pwd)"
if [ "$DMG_DIR/$(basename "$DMG_PATH")" != "$APPCAST_ABS_DIR/$ARCHIVE_NAME" ]; then
  cp "$DMG_PATH" "$ARCHIVE_PATH"
fi

printf '%s\n' "${SPARKLE_RELEASE_NOTES:-See the GitHub release for details.}" > \
  "$APPCAST_DIR/$(basename "$ARCHIVE_NAME" .dmg).md"

printf '%s' "$SPARKLE_PRIVATE_ED_KEY" | \
  "$SPARKLE_ROOT/bin/generate_appcast" \
    --ed-key-file - \
    --download-url-prefix "$DOWNLOAD_URL_PREFIX" \
    --embed-release-notes \
    --link "https://github.com/${GITHUB_REPOSITORY:-chen86860/easy-complete}" \
    --maximum-versions "$SPARKLE_MAXIMUM_VERSIONS" \
    --maximum-deltas "$SPARKLE_MAXIMUM_DELTAS" \
    "$APPCAST_DIR"

[ -f "$APPCAST_DIR/appcast.xml" ] || { echo "error: appcast.xml was not generated" >&2; exit 1; }

# Sparkle derives delta names from the app bundle display name ("Easy Complete"),
# but the generated delta files use dots on disk ("Easy.Complete...delta").
# GitHub release assets are uploaded from disk, so keep appcast URLs aligned with
# the real asset names or Sparkle will fall back to the full DMG after a 404.
python3 - "$APPCAST_DIR/appcast.xml" <<'PY'
import pathlib
import re
import sys

appcast_path = pathlib.Path(sys.argv[1])
appcast = appcast_path.read_text()
appcast = re.sub(r'(?<=/)[^"/]+(?=\.delta")', lambda m: m.group(0).replace("%20", "."), appcast)
appcast_path.write_text(appcast)
PY

printf '%s\n' "$APPCAST_DIR/appcast.xml"
