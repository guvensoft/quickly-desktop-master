# ACTIVE SLICE — BUGFIX

Title: {{TITLE}}
Date: {{DATE}}
Repo: {{REPO_ROOT}}

## Symptom

TODO: What breaks? Include observed error text if any.

## Repro steps

TODO: Steps to reproduce (TODO allowed if not yet reproducible).

## Suspected area (file paths)

- TODO: `path/to/file.ts` (why)

## Fix plan (minimal)

- TODO: Smallest change that fixes root cause (file paths + rationale).
- Constraints:
  - No broad refactor / rename
  - Keep Electron main vs Angular renderer boundary (`main/*` vs `src/*`)

## Verification

- TODO: Repro is fixed (steps and expected result).
- Repo gates (run unless truly impossible):
  - [ ] `npm run docs:verify`
  - [ ] `npm run build`
  - [ ] `npm run test:compile`
- Relevant tests (pick what applies):
  - [ ] `npm run test`
  - [ ] `npm run test:debug`

## Evidence (Required: BEFORE + AFTER)

- BEFORE: TODO (error/log/stack trace + where it was seen)
- AFTER: TODO (command output / screenshot note / log snippet proving fix)

