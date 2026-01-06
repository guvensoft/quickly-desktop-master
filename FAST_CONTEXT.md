# FAST_CONTEXT (Low-token navigation)

## Repo X-Ray (10 lines)

- Ürün: QuicklyPOS Desktop (Electron main + Angular renderer).
- Entrypoints: `main.ts` (Electron shell), `src/main.ts` (Angular bootstrap), `src/app/app-routing.module.ts` (routes).
- Auth + setup: guards + `LoginComponent`, `SetupComponent`, `auth.guard.service.ts`.
- Store & selling: `StoreComponent` → `SellingScreenComponent` → `PaymentScreenComponent`.
- End of day: `EndofthedayComponent` + `/store/backup`, `/store/refresh`, `/store/endday`.
- Offline-first: PouchDB catalog + replication (`src/app/services/main.service.ts`).
- Local app server: in-memory PouchDB via `main/appServer.ts`, `express-pouchdb`.
- Devices: printers + IPC handlers live in `main/ipcPrinter.ts` + `ElectronService`.
- Build/runtime: webpack bundles into `dist` → `BrowserWindow` serves `index.html`.
- Stack: Angular 5.0.3 + Electron 1.8.1 + webpack 3.8.1 (per `docs/repo-map.md`).

## First files to read

1. `AGENTS.md`
2. `docs/repo-map.md`
3. `docs/code/symbol-index.md`
4. `docs/knowledge/symbols.json`
5. `docs/domain/workflows.md`
6. `docs/architecture/overview.md`
7. `docs/api/openapi.yaml`
8. `docs/decisions/README.md`

## Question Type → Best Source

| Question | Best first source |
|---|---|
| “Nerede?” | `npm run symbols:name -- "EndofthedayComponent"` veya `docs/code/symbol-index.md` |
| “Hangi methodlar var?” | `npm run symbols:name -- "MainService"` |
| “Bu methodun imzası?” | `npm run symbols:method -- "uploadBackup"` |
| “Renderer mi, main mi?” | `npm run symbols:source -- "app"` / `"electron"` |
| “Etkisi ne?” | `docs/knowledge/imports-graph.json` |
| “Nasıl çalışıyor?” | `docs/domain/workflows.md` → kod (minimum dosya) |

## Common targets

- PouchDB: `src/app/services/main.service.ts`, `src/app/services/conflict.service.ts`, `main/appServer.ts`.
- End of day: `src/app/components/endoftheday/endoftheday.component.ts`.
- Printer: `main/ipcPrinter.ts`, `src/app/providers/printer.service.ts`.
- IPC Bridge: `src/app/providers/electron.service.ts`, `main.ts`, `main/ipcPrinter.ts`.

## Output contract

- Dosya yolu + kanıt + kısa özet + next step.
- Uydurma yok: kaynak `docs` veya `npm run symbols:*` ile doğrula, yoksa “kodda aramam gerek” de.
