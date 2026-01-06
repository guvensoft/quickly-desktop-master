#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$repo_root"

target="docs/repo-map.md"

if [[ ! -f "$target" ]]; then
  echo "ERROR: $target not found" >&2
  exit 1
fi

start_marker="<!-- ops:gen-repo-map:start -->"
end_marker="<!-- ops:gen-repo-map:end -->"

tmp="$(mktemp)"
cleanup() { rm -f "$tmp"; }
trap cleanup EXIT

stack_summary() {
  local pkg="package.json"
  if [[ ! -f "$pkg" ]]; then
    echo "- Stack: TODO (package.json not found)"
    return
  fi
  local angular_ver electron_ver webpack_ver
  angular_ver="$(node -e "const p=require('./package.json');process.stdout.write((p.dependencies&&p.dependencies['@angular/core'])||'')" 2>/dev/null || true)"
  electron_ver="$(node -e "const p=require('./package.json');process.stdout.write((p.devDependencies&&p.devDependencies['electron'])||'')" 2>/dev/null || true)"
  webpack_ver="$(node -e "const p=require('./package.json');process.stdout.write((p.devDependencies&&p.devDependencies['webpack'])||'')" 2>/dev/null || true)"
  echo "- Stack: Angular ${angular_ver:-?}, Electron ${electron_ver:-?}, webpack ${webpack_ver:-?}"
}

generated_dirs() {
  cat <<'EOF'
- Generated/artefacts (do not edit): `dist/`, `node_modules/`, `app-builds/` (if present), `out-tsc/` (if present), `coverage/` (if present)
EOF
}

entrypoints() {
  cat <<'EOF'
- Electron main entry: `main.ts`
- Electron services: `main/*.ts`
- Angular bootstrap: `src/main.ts`
- Angular routes: `src/app/app-routing.module.ts`
EOF
}

scripts_summary() {
  cat <<'EOF'
- Key scripts (from `package.json`):
  - build: `npm run build`
  - lint: `npm run lint`
  - tests: `npm run test` / `npm run test:debug` / `npm run test:compile`
  - verify: `npm run verify`
EOF
}

block_content() {
  echo "$start_marker"
  echo
  echo "## Generated Summary (ops/scripts/gen-repo-map.sh)"
  echo
  stack_summary
  entrypoints
  generated_dirs
  echo
  scripts_summary
  echo
  echo "$end_marker"
}

if grep -Fqx "$start_marker" "$target" && grep -Fqx "$end_marker" "$target"; then
  awk -v start="$start_marker" -v end="$end_marker" -v repl_file="/dev/null" '
    BEGIN { in_block=0 }
    $0==start { in_block=1; next }
    $0==end { in_block=0; next }
    in_block==0 { print }
  ' "$target" > "$tmp"

  # Re-insert the generated block at the end to keep the update deterministic.
  # (Repo-map is SSOT; generated summary is an appended helper section.)
  node -e "const fs=require('fs');const p='$tmp';let s=fs.readFileSync(p,'utf8');s=s.replace(/\\n+$/,'\\n');fs.writeFileSync(p,s);"
  printf "\n" >> "$tmp"
  block_content >> "$tmp"
else
  cat "$target" > "$tmp"
  node -e "const fs=require('fs');const p='$tmp';let s=fs.readFileSync(p,'utf8');s=s.replace(/\\n+$/,'\\n');fs.writeFileSync(p,s);"
  printf "\n" >> "$tmp"
  block_content >> "$tmp"
fi

mv "$tmp" "$target"
echo "Updated $target"
