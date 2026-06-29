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

# Refresh Cargo.lock so the bumped workspace versions are reflected there too.
# Without this the release commit ships a stale lock and CI's
# `cargo clippy/test --locked` fails. --workspace only touches our own crates
# (no external dependency bumps); --offline because a version bump needs no fetch.
echo "Refreshing Cargo.lock..."
(cd "$REPO_DIR" && cargo update --workspace --offline)

echo "Done. Next steps:"
echo "  1. Add a ## v${VERSION} entry to CHANGELOG.md"
echo "  2. git add -A && git commit -m \"chore: bump version to v${VERSION}\"  # includes Cargo.lock"
echo "  3. git tag v${VERSION} && git push origin main --tags"
