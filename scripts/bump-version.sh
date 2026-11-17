#!/bin/bash
# Usage: ./scripts/bump-version.sh <version>
# Example: ./scripts/bump-version.sh 2.0.11
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${1:-}"

if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>" >&2
  echo "Example: $0 2.0.11" >&2
  exit 1
fi

# Strip leading 'v' if present
VERSION="${VERSION#v}"

echo "Bumping version to $VERSION"

# Cargo workspace (all crates inherit this)
sed -i '' "s/^version = \".*\"$/version = \"$VERSION\"/" "$REPO_DIR/Cargo.toml"

# App-facing TS packages (version shown in Dashboard About section)
for pkg in dashboard-app autocomplete-app; do
  PKG_JSON="$REPO_DIR/packages/$pkg/package.json"
  sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" "$PKG_JSON"
done

# App version published in the website's SoftwareApplication structured data.
sed -i '' \
  "s/^export const APP_VERSION = \".*\";$/export const APP_VERSION = \"$VERSION\";/" \
  "$REPO_DIR/website/src/seo.tsx"
grep -qxF "export const APP_VERSION = \"$VERSION\";" "$REPO_DIR/website/src/seo.tsx" \
  || { echo "Failed to update website/src/seo.tsx" >&2; exit 1; }

# Refresh Cargo.lock so the bumped workspace versions are reflected there too.
# Without this the release commit ships a stale lock and CI's
# `cargo clippy/test --locked` fails. --workspace only touches our own crates
# (no external dependency bumps); --offline because a version bump needs no fetch.
echo "Refreshing Cargo.lock..."
(cd "$REPO_DIR" && cargo update --workspace --offline)

# The vendored crates carry the workspace version, so every bump makes the generated
# notices stale — and `build-app.sh` refuses to assemble the bundle until they match.
echo "Regenerating THIRD_PARTY_NOTICES.txt..."
(cd "$REPO_DIR" && node scripts/generate-third-party-notices.mjs)

echo "Done. Next steps:"
# main is protected: the bump lands through a pull request, and the tag goes on the
# merge commit once it is on main, so a tag never points at a commit main does not have.
BRANCH="chore/release-${VERSION}"
STEP=1
# Prereleases get no CHANGELOG section (see AGENTS.md); the stable release covers them.
# Same pattern release.yml uses to publish a tag as a prerelease.
if [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+-(alpha|beta|rc)(\.[0-9A-Za-z-]+)*$ ]]; then
  echo "  (prerelease: leave ## Unreleased in CHANGELOG as it is; copy any notes into the GitHub prerelease body)"
else
  echo "  ${STEP}. Rename ## Unreleased to ## v${VERSION} - $(date +%Y-%m-%d) in both CHANGELOG.md (English) and CHANGELOG.zh-CN.md (Chinese)"
  STEP=$((STEP + 1))
fi
echo "  ${STEP}. git switch -c ${BRANCH} && git add -A && git commit -m \"chore: bump version to v${VERSION}\"  # includes Cargo.lock"
echo "  $((STEP + 1)). git push -u origin ${BRANCH} && gh pr create --fill"
echo "  $((STEP + 2)). Merge the pull request after CI passes"
echo "  $((STEP + 3)). git switch main && git pull --ff-only && git tag v${VERSION} && git push origin v${VERSION}"
