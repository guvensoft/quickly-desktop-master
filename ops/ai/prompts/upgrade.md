# ACTIVE SLICE — UPGRADE

**Title:** {{TITLE}}  
**Date:** {{DATE}}  
**Repo:** {{REPO_ROOT}}

## Target versions
- TODO (needs confirmation):

## Constraints
- Big-bang upgrade yok. Fazlara böl.
- Çalışan davranışı koru; her fazda doğrulama.

## Impact map
- Renderer (Angular): `src/...`
- Main (Electron): `main/...`
- Build pipeline: `webpack.config.js`, `tsconfig*.json`, `package.json`
- Tests: `karma.conf.js`, `protractor.conf.js`, `e2e/*`

## Phased plan
1) Phase 0 — ADR + plan
2) Phase 1 — dependency alignment
3) Phase 2 — build config
4) Phase 3 — runtime changes
5) Phase 4 — cleanup + docs

## ADR requirement
- Add/update ADR under: docs/decisions/ (see docs/decisions/0001-record-architecture-decisions.md)

## Verification matrix (required)
- [ ] npm run docs:verify
- [ ] npm run build
- [ ] npm run test:compile
- [ ] npm run test
- [ ] e2e (if applicable)

## Evidence (required)
- Dosya yolu: `...` — Kısa alıntı/özet: “...”
