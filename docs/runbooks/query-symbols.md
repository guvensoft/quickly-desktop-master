# Query Symbols (CLI runbook)

## Why this exists

- `docs/knowledge/symbols.json` is huge; prefer focused queries.
- Gives deterministic, sorted answers without loading entire JSON in memory or editor.
- Works while offline/without IDE support: just `node` + the generated index.

## Common commands

1. `npm run symbols:name -- "EndofthedayComponent"`
2. `npm run symbols:name -- "MainService"`
3. `npm run symbols:method -- "uploadBackup"`
4. `npm run symbols:source -- "electron"`
5. `npm run symbols:file -- "src/app/providers/electron.service.ts"`
6. `npm run symbols -- --contains "/store/backup"`

Each command returns sorted file → export → member fragments with `matches` metadata.

## Rule of thumb

- **Before you open `docs/knowledge/symbols.json`, run the matching `npm run symbols:*` query.**
- Combine filters (`--name`, `--method`, `--source`, `--decorator`) to narrow scope before touching code.
- If the query returns `matches: 0`, verify the spelling or rerun after `npm run index`.
