# Change Request (Template)

## Goal

<!-- What outcome do we want? Be specific. -->

## Constraints

- Do not break existing behavior.
- Keep changes minimal and focused.
- Prefer docs/runbooks/ops changes before refactors.

## Context

- Repo: QuicklyPOS Desktop (Angular 5 + Electron 1.8 + webpack 3).
- Entry points:
  - Electron main: `main.ts`
  - Angular bootstrap: `src/main.ts`
  - Routes: `src/app/app-routing.module.ts`

## Evidence (Required)

List the exact file paths you inspected and what you found (short quotes/summary).

- Path + summary
- Path + summary

## Plan

1)
2)
3)

## Verification

Run the smallest relevant commands:

- `npm run build`
- `npm run test:compile` (compile-only sanity)
- `npm run test` or `npm run test:debug` (if stable in environment)
- `npm run lint` (if workspace is configured)

## Rollback

How to revert safely:

- List files to revert and command(s).

