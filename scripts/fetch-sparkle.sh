#!/bin/bash
set -euo pipefail

SPARKLE_VERSION="${SPARKLE_VERSION:-2.9.3}"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SPARKLE_ROOT="${REPO_DIR}/build/sparkle/${SPARKLE_VERSION}"
SPARKLE_FRAMEWORK="${SPARKLE_ROOT}/Sparkle.framework"
ARCHIVE="${SPARKLE_ROOT}/Sparkle-${SPARKLE_VERSION}.tar.xz"
URL="https://github.com/sparkle-project/Sparkle/releases/download/${SPARKLE_VERSION}/Sparkle-${SPARKLE_VERSION}.tar.xz"

mkdir -p "$SPARKLE_ROOT"

if [ ! -f "$ARCHIVE" ]; then
  curl -L --fail --retry 3 "$URL" -o "$ARCHIVE"
fi

if [ ! -d "$SPARKLE_FRAMEWORK" ]; then
  tar -xf "$ARCHIVE" -C "$SPARKLE_ROOT" ./Sparkle.framework ./bin/generate_appcast ./bin/generate_keys ./bin/sign_update
fi

if [ ! -f "${SPARKLE_ROOT}/LICENSE" ]; then
  tar -xf "$ARCHIVE" -C "$SPARKLE_ROOT" ./LICENSE
fi

printf '%s\n' "$SPARKLE_FRAMEWORK"
