#!/bin/bash
set -euo pipefail

APP_PATH="${1:-build/Easy Complete.app}"
LICENSE_DIR="${APP_PATH}/Contents/Resources/Licenses"

test -f "${LICENSE_DIR}/LICENSE"
test -f "${LICENSE_DIR}/NOTICE"
test -f "${LICENSE_DIR}/THIRD_PARTY_NOTICES.txt"

grep -Fq "Copyright (c) 2024 Amazon.com, Inc. or its affiliates." "${LICENSE_DIR}/LICENSE"
grep -Fq "Copyright (c) 2026 Easy Complete contributors" "${LICENSE_DIR}/LICENSE"
grep -Fq "distributed under the MIT License" "${LICENSE_DIR}/NOTICE"
grep -Fq "@chen86860/autocomplete-specs" "${LICENSE_DIR}/THIRD_PARTY_NOTICES.txt"
grep -Eq '^Sparkle [0-9]' "${LICENSE_DIR}/THIRD_PARTY_NOTICES.txt"
grep -Fq "alacritty_terminal" "${LICENSE_DIR}/THIRD_PARTY_NOTICES.txt"

echo "Verified license payload: ${LICENSE_DIR}"
