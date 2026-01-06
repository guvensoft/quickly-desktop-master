# ACTIVE SLICE — FEATURE

**Title:** {{TITLE}}  
**Date:** {{DATE}}  
**Repo:** {{REPO_ROOT}}

## Goal
## Non-goals

## Read order (required)
1) AGENTS.md  
2) docs/repo-map.md  
3) docs/code/module-boundaries.md  
4) docs/code/symbol-index.md  
5) İlgili: docs/modules/*, docs/domain/*, docs/decisions/*, docs/api/*, docs/data/*

## Plan
- Değişecek dosyalar:
  - Renderer (Angular): `src/...`
  - Main (Electron): `main/...`
- Riskler:
- Geri dönüş planı:

## Patch checklist
- [ ] Renderer/main sınırına uyuldu (module-boundaries.md)
- [ ] Minimal değişiklik yapıldı
- [ ] Yeni dependency gerekiyorsa gerekçe + alternatif + trade-off yazıldı

## Verification (required)
- [ ] npm run docs:verify
- [ ] npm run build
- [ ] npm run test:compile
- [ ] (varsa) ilgili testler: `npm run test` / e2e

## Docs updates (required if behavior changes)
- [ ] docs/repo-map.md (gerekirse)
- [ ] docs/modules/* (gerekirse)
- [ ] ADR (gerekirse)

## Evidence (required)
- Dosya yolu: `...` — Kısa alıntı/özet: “...”
