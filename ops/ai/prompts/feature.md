# ACTIVE SLICE — FEATURE

Title: {{TITLE}}
Date: {{DATE}}
Repo: {{REPO_ROOT}}

## Goal

TODO: What user-facing behavior is added/changed? (1–3 sentences)

## Non-goals

- TODO: What is explicitly out of scope (to prevent creep).

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

## Plan (files + risks)

- Files to touch:
  - TODO: `path/to/file.ts`
- Risks / edge cases:
  - TODO: e.g. migration, IPC contract, offline behavior.

## Patch checklist

- [ ] Minimal diffs (no broad refactor / rename)
- [ ] Renderer/main boundary respected (`main/*` vs `src/*`)
- [ ] No secrets added (no tokens/keys/private URLs)
- [ ] Evidence section filled (required for pre-commit gate)

## Verification

- Required (repo gates):
  - [ ] `npm run docs:verify`
  - [ ] `npm run build`
  - [ ] `npm run test:compile`
- Relevant tests (pick what applies):
  - [ ] `npm run test`
  - [ ] `npm run test:debug`
  - [ ] Manual smoke: TODO (steps)

## Docs updates

- TODO: Update docs if behavior/contracts changed (file paths).

## Evidence (Required)

- TODO: At least 1 verifiable artifact (command output, file path, log snippet, screenshot note).

