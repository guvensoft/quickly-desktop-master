# Agent Guide (Agent-Understanding Ready)

## Purpose

Bu dosya, QuicklyPOS Desktop repo’sunda agent’ların kod tabanını **hızlı ve doğru** anlaması ve değişiklikleri **güvenli** şekilde yapması için zorunlu kuralları tanımlar.

## Read Order (Required)

- AGENTS.md → FAST_CONTEXT.md → docs/repo-map.md → docs/code/symbol-index.md → docs/knowledge/* → ...

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

## LIGHT MODE (fast, low-friction)

- Amaç: Soru/keşif/planlama ve düşük riskli değişikliklerde hızlı ilerlemek; test/build/verify zorunlu değil ama öneriliyor.
- Default read order: `AGENTS.md` → `docs/repo-map.md` → `docs/code/symbol-index.md` → `docs/knowledge/*.json` → gerekliyse hedef kod dosyaları.
- Output format: dosya yolu + kısa kanıt + önerilen bir sonraki adım. Evidence bloğu varsa kısa notlarla desteklenmeli; sadece öneri olarak yazılan verify/test komutları çalıştırılmaz.
- Eğer `npm run index` veya kod yapısı değiştiyse `docs/knowledge/*.json` güncellenmeli; `npm run index` önerilir.
- Sıkı mod (STRICT MODE) gerektiğinde `REQUIRE_VERIFY=1` ile `npm run verify`, `npm run test:compile`, `npm run build` gibi kontrolleri isteğe bağlı çalıştır.
- Sembol aramaları için `docs/knowledge/symbols.json`, `symbols.by-source.json` ve `sources.json` içindeki `sourceId`/source tanımlarını kullanarak renderer (`app`) vs main (`electron`) filtrelemesi yapılmalı.
- `docs/knowledge/symbols.json` büyük; önce `npm run symbols:*` CLI ile sorgulayarak yeterli kanıt topla.

## No Fabrication (low-token)

- Dosya/symbol id’lerini `FAST_CONTEXT.md`, `docs/repo-map.md`, `docs/code/symbol-index.md` veya `npm run symbols:*` komutlarıyla doğrulamadan söyleme.
- Query sıfır dönerse “kodda aramam gerek” diye not al veya `npm run index` çalıştırıp tekrar dene.

### Örnek: QUESTION — “PouchDB sync nerede?”
- Read order: AGENTS → repo-map → symbol-index → docs/knowledge/symbols.json → `src/app/services`.
- Evidence önerisi: `src/app/services/sync.service.ts` içindeki `syncToServer` metodu.
- Next step: “Assumption: PouchDB sync kodu main/renderer boundary’sinde, `tasks/ACTIVE_SLICE.md`’de plan hazırlanır.”

### Örnek: FEATURE — “Küçük UI değişikliği”
- Read order: AGENTS → repo-map → module-boundaries → relevant component.
- Evidence: ilgili component template ve renderer/main boundary (Angular component + Electron IPC).
- Next step: “Test: lokal serve + npm run index if component signature changed.”

### Örnek: BUGFIX — “Uygulama crash oluyor”
- Read order: AGENTS → repo-map → docs/knowledge/symbols.json → `src/app/services/`. 
- Evidence: `main/electron/index.ts` logundan crash stack trace + `src/app/providers/electron.service.ts` method referansı.
- Next step: “Retry after adding focused unit/QA, optionally `npm run agent:verify` for strict.”

### Örnek: UPGRADE — “Angular/Electron’ın küçük sürüm bump’ı”
- Read order: AGENTS → repo-map → docs/knowledge/symbols.json → `package.json`.
- Evidence: dependency list + relevant `src` entry points (renderer/main).
- Next step: “STRICT MODE: `REQUIRE_VERIFY=1` ile docs/index/test/build çalıştır.”
