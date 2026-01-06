#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$repo_root"

target="docs/code/symbol-index.md"
mkdir -p "$(dirname "$target")"

start_marker="<!-- ops:gen-symbol-index:start -->"
end_marker="<!-- ops:gen-symbol-index:end -->"

if ! command -v rg >/dev/null 2>&1; then
  echo "ERROR: ripgrep (rg) is required to generate symbol index" >&2
  exit 1
fi

tmp="$(mktemp)"
cleanup() { rm -f "$tmp"; }
trap cleanup EXIT

cat > "$tmp" <<'EOF'
<!-- BEGIN: GENERATED SYMBOL INDEX -->

EOF

# TypeScript/JavaScript exports (best-effort regex).
# Keep this intentionally heuristic; correctness is “good enough” for navigation.
rg -n --hidden --no-ignore-vcs --glob '!node_modules/**' --glob '!dist/**' --glob '!app-builds/**' \
  -S "^\s*export\s+(declare\s+)?(class|function|interface|type|enum|const)\s+([A-Za-z0-9_]+)" \
  . | node -e '
    const fs = require("fs");
    const input = fs.readFileSync(0, "utf8");
    const re = /^\s*export\s+(?:declare\s+)?(class|function|interface|type|enum|const)\s+([A-Za-z0-9_]+)/;
    for (const rawLine of input.split(/\r?\n/)) {
      if (!rawLine) continue;
      const first = rawLine.indexOf(":");
      if (first < 0) continue;
      const second = rawLine.indexOf(":", first + 1);
      if (second < 0) continue;
      const file = rawLine.slice(0, first);
      const lineNo = rawLine.slice(first + 1, second);
      const text = rawLine.slice(second + 1);
      const m = text.match(re);
      if (!m) continue;
      const kind = m[1];
      const name = m[2];
      process.stdout.write(`${kind}\t${name}\t${file}:${lineNo}\n`);
    }
  ' | sort -u >> "$tmp"

cat >> "$tmp" <<'EOF'

<!-- END: GENERATED SYMBOL INDEX -->
EOF

render_block() {
  echo "$start_marker"
  echo
  echo "## Exports (TS/JS)"
  echo
  if [[ -s "$tmp" ]]; then
    awk '
      BEGIN { in_gen=0 }
      $0 ~ /^<!-- BEGIN: GENERATED SYMBOL INDEX -->/ { in_gen=1; next }
      $0 ~ /^<!-- END: GENERATED SYMBOL INDEX -->/ { in_gen=0; next }
      in_gen==1 && $0 !~ /^[[:space:]]*$/ {
        split($0, a, "\t");
        kind=a[1]; name=a[2]; loc=a[3];
        printf("- `%s` **%s** — `%s`\n", kind, name, loc);
      }
    ' "$tmp"
  else
    echo "- TODO (needs confirmation): No exports found (or rg pattern needs adjustment)."
  fi
  echo
  echo "$end_marker"
}

if [[ -f "$target" ]] && grep -Fqx "$start_marker" "$target" && grep -Fqx "$end_marker" "$target"; then
  awk -v start="$start_marker" -v end="$end_marker" '
    BEGIN { in_block=0 }
    $0==start { in_block=1; next }
    $0==end { in_block=0; next }
    in_block==0 { print }
  ' "$target" > "$target.tmp"
  mv "$target.tmp" "$target"
fi

if [[ ! -f "$target" ]]; then
  cat > "$target" <<'EOF'
# Symbol Index (Generated)

Bu dosya `ops/scripts/gen-symbol-index.sh` tarafından üretilir.

## How to regenerate

- `ops/scripts/gen-symbol-index.sh`

<!-- ops:gen-symbol-index:start -->
<!-- ops:gen-symbol-index:end -->

EOF
fi

node -e "const fs=require('fs');const p='$target';let s=fs.readFileSync(p,'utf8');s=s.replace(/\\n+$/,'\\n');fs.writeFileSync(p,s);"
printf "\n" >> "$target"
render_block >> "$target"

echo "Updated $target"
