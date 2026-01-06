# Agent Guide (Agent-Understanding Ready)

## Purpose

Bu dosya, QuicklyPOS Desktop repo’sunda agent’ların kod tabanını **hızlı ve doğru** anlaması ve değişiklikleri **güvenli** şekilde yapması için zorunlu kuralları tanımlar.

## Read Order (Required)

1) `AGENTS.md`
2) `docs/repo-map.md`
3) `docs/architecture/*`
4) `docs/domain/*`
5) `docs/api/*`
6) `docs/data/*`
7) `docs/decisions/*`

Opsiyonel ama önerilen:

- Code navigation: `docs/code/symbol-index.md`, `docs/code/module-boundaries.md`
- Generated indeks: `docs/knowledge/*` (manuel düzenleme yok; `npm run index`)

## Allowed Actions / Guardrails

- Üretilmiş/indirilen artefact’lara dokunma: `dist/`, `node_modules/`, `app-builds/` (varsa), `out-tsc/` (varsa), `coverage/` (varsa)
- Secrets/credential ekleme yok (API key, token, password, private URL).
  - `.env` örneği gerekiyorsa placeholder ile: `TODO (needs confirmation)` + dummy values.
- Büyük refactor yok: geniş çaplı rename/move, “cleanup” PR’ları, toolchain migration bu kapsamda yapılmaz.
- Yeni dependency:
  - Varsayılan: ekleme yok.
  - Zorunluysa: gerekçe + alternatifler + lisans/size + rollback notu (ADR veya Change Request) şart.

## Required Checks BEFORE Finalize

Repo’da gerçek olan komutlarla minimum doğrulama:

- Docs verify: `ops/scripts/verify-docs.sh`
- Build: `npm run build`
- TypeScript compile sanity (Chrome olmadan): `npm run test:compile`
- Unit-ish tests (çalışıyorsa): `npm run test` veya `npm run test:debug`
- Lint (workspace uygunsa): `npm run lint`
- Repo health: `npm run verify` (default test `WARN skipped=TEST_UNSTABLE`; `VERIFY_STRICT=1` ile enforce)

## Coding Conventions (Repo’ya Uygun)

- Angular (legacy):
  - Component: `*.component.ts`, Service: `*.service.ts`, Guard: `*.guard.service.ts`
  - Route/guard sınırlarını koru: `src/app/app-routing.module.ts`, `src/app/guards/*`
- Electron main process:
  - OS/driver işleri `main/*.ts` altında; renderer tarafına sızdırma.
  - IPC mesajlarını kontrollü ve minimal tut.
- Error handling/logging:
  - Mevcut kod `console.log` ağırlıklı; yeni logging framework ekleme.
  - Sessiz catch blokları eklemekten kaçın; en azından hata yüzeyi bırak.

## Golden Paths (Repo’dan görülen kritik akışlar)

- Login/Setup: `src/app/app-routing.module.ts` (route `''`) → `LoginComponent`, `SetupComponent`.
- Satış: `StoreComponent` → `SellingScreenComponent` → `PaymentScreenComponent`.
- Gün Sonu: `EndofthedayComponent` + remote çağrılar (`/store/backup`, `/store/refresh`, `/store/endday`).

## Test-as-Spec

- Unit-ish (Karma): `karma.conf.js` + `src/test.ts`
- E2E (Protractor, legacy): `e2e/` + `protractor.conf.js`

## Output Format for Every Task

Her iş tesliminde şu sırayı takip et (kısa ve kanıta dayalı):

1) Plan
2) Patch summary (hangi dosyalar, neden)
3) Verification (çalıştırılan komutlar + sonuç)
5) Doküman güncellemesi (gerekliyse)
6) Özet + rollback
