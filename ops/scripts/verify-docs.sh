#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$repo_root"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

require_file() {
  local path="$1"
  [[ -f "$path" ]] || fail "Missing required file: $path"
}

require_file "AGENTS.md"
require_file "docs/repo-map.md"
require_file "docs/decisions/0001-record-architecture-decisions.md"

# Optional OpenAPI: if present, must be in one of the expected locations.
if [[ -f "docs/api/openapi.yaml" ]]; then
  echo "OK: docs/api/openapi.yaml present"
fi

echo "OK: docs verification passed"

