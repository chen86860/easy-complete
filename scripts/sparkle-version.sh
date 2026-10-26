#!/bin/bash
# Usage: ./scripts/sparkle-version.sh <version>
# Prints the bundle version Sparkle compares (CFBundleVersion / sparkle:version).
#
# Sparkle's version comparator stops reading at the first "-", so it treats
# 2.4.0-beta.0, 2.4.0-beta.1 and 2.4.0 as the same version: testers would never
# be offered the next beta or the final release. Dropping the separators gives
# 2.4.0beta1, which Sparkle orders as 2.4.0alpha1 < 2.4.0beta1 < 2.4.0beta2 <
# 2.4.0rc1 < 2.4.0. Stable versions pass through unchanged.
set -euo pipefail

VERSION="${1:-}"
VERSION="${VERSION#v}"

if [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "$VERSION"
elif [[ "$VERSION" =~ ^([0-9]+\.[0-9]+\.[0-9]+)-(alpha|beta|rc)(\.([0-9]+))?$ ]]; then
  echo "${BASH_REMATCH[1]}${BASH_REMATCH[2]}${BASH_REMATCH[4]}"
else
  echo "error: unsupported version '$VERSION' (expected X.Y.Z or X.Y.Z-alpha|beta|rc[.N])" >&2
  exit 1
fi
