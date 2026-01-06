# ACTIVE SLICE — QUESTION

Title: {{TITLE}}
Date: {{DATE}}
Repo: {{REPO_ROOT}}

## Goal

TODO: What question should be answered? (1–3 sentences)

## Read order (Required)

1) `AGENTS.md`
2) `docs/repo-map.md`
3) `docs/code/symbol-index.md`
4) Relevant docs (pick what applies):
   - `docs/architecture/*`
   - `docs/domain/*`
   - `docs/api/*`
   - `docs/data/*`
   - `docs/decisions/*`

Boundary guidance:
- Electron main process: OS/driver/IPC work stays in `main/*`.
- Angular renderer: UI/state/HTTP stays in `src/app/*`. Renderer talks to main only via the existing Electron bridge (`src/app/providers/electron.service.ts`).

## Evidence (Required)

- TODO: Add at least 1 verifiable artifact (command output, file path, log snippet, screenshot note).

## Answer outline

### Plan

- TODO: What you will inspect / run (with file paths).

### Patch (if needed)

- TODO: Minimal code/doc changes (file paths).

### Verify

- TODO: Commands run + expected result (e.g. `npm run docs:verify`, `npm run test:compile`).

### Docs

- TODO: Docs to update (if any) with file paths.

### Final answer

- TODO: Short, file-path-referenced answer.

