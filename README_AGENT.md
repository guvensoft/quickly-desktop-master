# Agent Quickstart (QuicklyPOS Desktop)

Bu repo “agent‑ready” çalışır: önce indeksle daralt, sonra minimum dosya oku.

## Başlangıç Sırası

1. `docs/repo-map.md` (entrypoint’ler + çalışma akışı)
2. `docs/architecture/overview.md` (Electron ↔ Angular sınırı)
3. `docs/knowledge/` (mevcut semboller + import grafı)
4. İhtiyacın olan modül pack’i:
   - `docs/modules/auth/README.md`
   - `docs/modules/store/README.md`
   - `docs/modules/endoftheday/README.md`

## İndeks Güncelleme

- `node tools/indexer/index.js`

## İş Dilimleme (Task Slicing)

- Brief: `tasks/templates/task-brief.md`
- Slice: `tasks/templates/slice.md`
- Örnek epic: `tasks/backlog/EPIC-001-modernization.md`

Hedef: fix test duplication. Restore deterministically.
 

  1) Re-run npm run build.
  2) If "wrong class" reappears in tests, change webpack.config.js to require AngularCompilerPlugin from '@angular/cli/node_modules/@ngtools/webpack' so both build and test use the same
  physical copy.
  3) Update docs/runbooks/verify.md with this constraint.
