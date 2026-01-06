# ACTIVE SLICE — UPGRADE

Title: {{TITLE}}
Date: {{DATE}}
Repo: {{REPO_ROOT}}

## Target versions (TODO)

- TODO: From X → Y (list packages/tools/OS targets).

## Constraints (no big bang)

- Keep changes incremental and reviewable (no broad refactor/migration).
- Do not break Electron main vs Angular renderer boundary (`main/*` vs `src/*`).
- Avoid adding new dependencies by default; if unavoidable, document rationale + rollback.

## Impact map

- Renderer (Angular): TODO (files/areas)
- Main (Electron): TODO (files/areas)
- Build/tooling: TODO (webpack/tsconfig/scripts)
- Tests: TODO (karma/protractor/verify)

## Phased plan

1) TODO: Phase 1 (smallest safe step)
2) TODO: Phase 2
3) TODO: Phase 3 (cleanup / follow-ups, if any)

## ADR requirement

- If scope/constraints change or a dependency/tooling change is required, add/update an ADR:
  - `docs/decisions/0001-adr-template.md` (or the closest existing ADR for this change)

## Verification matrix

- Docs:
  - [ ] `npm run docs:verify`
- Build:
  - [ ] `npm run build`
- TypeScript compile sanity (no Chrome):
  - [ ] `npm run test:compile`
- Tests (if applicable):
  - [ ] `npm run test`
  - [ ] `npm run test:debug`
- Runtime smoke:
  - [ ] TODO: electron start path + key flows

## Evidence (Required)

- TODO: At least 1 verifiable artifact per phase (command output, file path diff summary, log snippet).

