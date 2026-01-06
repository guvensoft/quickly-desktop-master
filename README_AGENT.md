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

