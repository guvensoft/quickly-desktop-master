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
require_file "docs/architecture/c4-context.md"
require_file "docs/domain/glossary.md"
require_file "docs/decisions/0001-record-architecture-decisions.md"
require_file "docs/code/symbol-index.md"

if [[ -f "docs/knowledge/symbols.json" ]]; then
  echo "OK: docs/knowledge/symbols.json present"
else
  echo "WARN: docs/knowledge/symbols.json missing (run npm run index)" >&2
fi

if [[ -f "docs/knowledge/symbols.by-source.json" ]]; then
  echo "OK: docs/knowledge/symbols.by-source.json present"
else
  echo "WARN: docs/knowledge/symbols.by-source.json missing (run npm run index)" >&2
fi

if [[ -f "docs/knowledge/sources.json" ]]; then
  echo "OK: docs/knowledge/sources.json present"
else
  echo "WARN: docs/knowledge/sources.json missing (run npm run index)" >&2
fi

if [[ -f "docs/api/openapi.yaml" ]]; then
  echo "OK: docs/api/openapi.yaml present"
else
  echo "WARN: docs/api/openapi.yaml missing (allowed if no formal contract exists yet)" >&2
fi

echo "OK: docs verification passed"
