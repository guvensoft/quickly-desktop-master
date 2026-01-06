# AI Context Pack (QuicklyPOS Desktop)

Bu dosya, bir AI agent’ın repo’yu hızlı ve deterministik şekilde anlayıp doğru dosyalara inmesi için “başlangıç context pack”idir.

## Hızlı Özet

- Stack: Angular 5 (renderer) + Electron 1.8 (main) + webpack 3 (build) + Karma/Protractor (tests).
- Runtime: Electron `BrowserWindow` içinde Angular UI çalışır; OS/driver işleri Electron main process’te yapılır.
- Kalıcı veri: PouchDB tabanlı offline-first yaklaşım (replication + conflict çözümü).

## Başlangıç Okuma Sırası

1) `AGENTS.md`
2) `docs/repo-map.md`
3) `docs/architecture/overview.md` + `docs/architecture/c4-*.md`
4) Değişiklik alanına göre:
   - UI/flows: `docs/domain/workflows.md`
   - API: `docs/api/endpoint-client-matrix.md` (+ varsa `docs/api/openapi.yaml`)
   - Data: `docs/data/erd.md` / `docs/data/persistence.md`

## Golden Paths (Repo’dan görülen)

- Login/Setup: Angular route `''` → `LoginComponent`; setup akışı `SetupComponent`.
- Gün Sonu: `EndofthedayComponent` + `/store/backup`, `/store/refresh`, `/store/endday`.
- Satış: `StoreComponent` → `SellingScreenComponent` → `PaymentScreenComponent`.

> Not: Domain detayları için `docs/domain/workflows.md` ve `src/app/app-routing.module.ts` referans alın.

