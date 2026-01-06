# FAST_CONTEXT (Low-token navigation)

## Repo X-Ray (10 lines)

- Stack: Angular 5.0.3 + Electron 1.8.1 + webpack 3.8.1 (`docs/repo-map.md`).
- Split: Electron **main** (`main.ts`, `main/*`) vs Angular **renderer** (`src/`, `src/app/*`).
- Electron main entrypoint: `main.ts` (window lifecycle + main bootstrap).
- Main bootstraps: `main/ipcPrinter.ts`, `main/appServer.ts`, `main/callerServer.ts`, `main/scalerServer.ts`.
- Renderer entrypoint: `src/main.ts` → `src/app/app.module.ts`.
- Navigation: `src/app/app-routing.module.ts` (routes + guards).
- UI loads: main process serves `dist/index.html` into `BrowserWindow` (post-build).
- IPC bridge: renderer uses `src/app/providers/electron.service.ts` (`ipcRenderer`).
- Local DB: renderer PouchDB catalog/replication lives in `src/app/services/main.service.ts`.
- Local server: in-memory PouchDB via Express lives in `main/appServer.ts` (`express-pouchdb`).

## First 8 files to read

1) `docs/repo-map.md`
2) `docs/code/symbol-index.md`
3) `docs/knowledge/services.json`
4) `docs/knowledge/components.json`
5) `docs/knowledge/imports-graph.json`
6) `docs/domain/workflows.md`
7) `docs/api/openapi.yaml`
8) `docs/decisions/README.md`

## Question type → best source

| Question | Best first source | Then |
|---|---|---|
| “Where is X?” | `docs/repo-map.md` + `docs/code/symbol-index.md` | `docs/knowledge/symbols.json` + code |
| “What exists?” | `docs/knowledge/components.json`, `docs/knowledge/services.json` | `docs/code/module-boundaries.md` |
| “How does it work?” | `docs/domain/workflows.md` + module READMEs | code + logs/tests |
| “Why is it like this?” | `docs/decisions/README.md` + ADRs | git history (if needed) |
| “API contract?” | `docs/api/openapi.yaml` + `docs/api/endpoint-client-matrix.md` | caller component/service |

## Common targets (direct file paths)

- PouchDB / replication: `src/app/services/main.service.ts`, `src/app/services/conflict.service.ts`, `main/appServer.ts`, `docs/decisions/0003-offline-first-pouchdb.md`
- End of day (Gün Sonu): `src/app/components/endoftheday/endoftheday.component.ts`, `docs/modules/endoftheday/README.md`, `docs/api/endpoint-client-matrix.md`, `docs/api/openapi.yaml`
- Printer (ESC/POS): `main/ipcPrinter.ts`, `src/app/providers/printer.service.ts`
- IPC boundary: `src/app/providers/electron.service.ts`, `main.ts`, `main/ipcPrinter.ts`

## Output contract + no-fabrication

- Output contract: **Plan → Patch summary → Verification → (Docs update if needed) → Summary + rollback**.
- No-fabrication: before naming a file/symbol, confirm it exists in `docs/repo-map.md` / `docs/code/symbol-index.md` / `docs/knowledge/*`; if not found, say “index’te görünmüyor” and propose a verification step.

