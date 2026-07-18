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

# Sparkle derives delta names from the app bundle display name ("Easy Complete")
# and writes files with spaces on disk. GitHub normalizes those spaces to dots in
# release asset names, so normalize the files ourselves and keep the appcast URLs
# aligned with the exact names uploaded to the release.
python3 - "$APPCAST_DIR/appcast.xml" "$VERSION" "$APPCAST_DIR" <<'PY'
import pathlib
import re
import sys

appcast_path = pathlib.Path(sys.argv[1])
version = sys.argv[2]
appcast_dir = pathlib.Path(sys.argv[3])
appcast = appcast_path.read_text()

for delta_path in appcast_dir.glob("*.delta"):
    normalized_path = delta_path.with_name(delta_path.name.replace(" ", "."))
    if normalized_path == delta_path:
        continue
    if normalized_path.exists():
        raise SystemExit(
            f"error: cannot normalize delta filename because target exists: {normalized_path.name}"
        )
    delta_path.rename(normalized_path)
    print(f"Normalized delta filename: {delta_path.name} -> {normalized_path.name}")

appcast = re.sub(r'(?<=/)[^"/]+(?=\.delta")', lambda m: m.group(0).replace("%20", "."), appcast)

# generate_appcast can preserve an older item from the input appcast even with
# --maximum-versions 1. Since every enclosure receives the current tag's URL
# prefix, that stale item points at a full DMG that is not uploaded to the new
# release. Keep only the item generated for this release.
items = list(re.finditer(r"\s*<item>.*?</item>", appcast, flags=re.DOTALL))
version_marker = f"<sparkle:version>{version}</sparkle:version>"
current_items = [match.group(0) for match in items if version_marker in match.group(0)]
if len(current_items) != 1:
    raise SystemExit(
        f"error: expected exactly one appcast item for {version}, found {len(current_items)}"
    )
if items:
    appcast = (
        appcast[: items[0].start()]
        + "\n"
        + current_items[0].lstrip()
        + appcast[items[-1].end() :]
    )

# generate_appcast can leave delta enclosures in the appcast without writing
# the corresponding delta files. Publishing those references would make
# Sparkle request release assets that do not exist, so keep only enclosures
# backed by files in the output directory.
available_deltas = {path.name for path in appcast_dir.glob("*.delta")}

def prune_delta_block(match):
    block = match.group(0)

    def prune_enclosure(enclosure_match):
        url = enclosure_match.group(1)
        name = pathlib.PurePosixPath(url).name
        return enclosure_match.group(0) if name in available_deltas else ""

    block = re.sub(
        r'\s*<enclosure\b[^>]*url="([^"]+\.delta)"[^>]*/>',
        prune_enclosure,
        block,
    )
    return block if "<enclosure" in block else ""

appcast = re.sub(
    r'\s*<sparkle:deltas>.*?</sparkle:deltas>',
    prune_delta_block,
    appcast,
    flags=re.DOTALL,
)
appcast_path.write_text(appcast)

# Do not upload delta files inherited from an older appcast item.
referenced_deltas = {
    pathlib.PurePosixPath(url).name
    for url in re.findall(r'url="([^"]+\.delta)"', appcast)
}
for delta_path in appcast_dir.glob("*.delta"):
    if delta_path.name not in referenced_deltas:
        delta_path.unlink()

print(f"Kept {len(referenced_deltas)} referenced delta file(s)")
PY

printf '%s\n' "$APPCAST_DIR/appcast.xml"
