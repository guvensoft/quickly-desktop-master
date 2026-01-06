# Agent Operating Guide (AI Agent Ready)

Bu dosya, QuicklyPOS Desktop repo’sunda bir agent’ın **deterministik**, **düşük maliyetli** ve **güvenli** şekilde ilerlemesi için operasyon modelini tanımlar.

## 1) Okuma Sırası (SSOT)

1) `AGENTS.md`
2) `docs/repo-map.md`
3) İlgili alan dokümanları:
   - Mimari: `docs/architecture/*`
   - Domain: `docs/domain/*`
   - API: `docs/api/*`
   - Data: `docs/data/*`
   - Kararlar: `docs/decisions/*`
4) Kodda minimum okuma ile kanıt topla:
   - İndeks/graf: `docs/knowledge/*` (manuel düzenleme yok; `npm run index` ile üretilir)

## 2) Değişiklik Öncesi Zorunlu Kontroller

Değişiklik türüne göre en az şu komutlar çalıştırılır:

- Build: `npm run build`
- Tests (en az): `npm run test:compile`
- Tests (çalışıyorsa): `npm run test` veya `npm run test:debug`
- Lint (workspace uygunsa): `npm run lint`
- Repo health: `npm run verify` (default’ta test `TEST_UNSTABLE` olarak `WARN` ile skip edilebilir; `VERIFY_STRICT=1` ile zorlanır)

## 3) Güvenli Çalışma Kuralları

- Minimum değişiklik: aynı PR’da refactor + davranış değişikliği karıştırma.
- Riskli refactor yok: Angular/Electron legacy kodu “temizlemek” için geniş çaplı rename/move yapma.
- Yeni dependency ekleme:
  - Varsayılan: ekleme yok.
  - Zorunluysa: neden, alternatifler, risk ve rollback dokümante et (ADR veya Change Request).
- Küçük ve geri alınabilir commit’ler: her commit tek bir niyet taşısın.

## 4) Dokunma/Yasaklı Alanlar

Üretilmiş/indirilen artefact’lara dokunma:

- `dist/`
- `node_modules/`
- `app-builds/` (varsa)
- `out-tsc/` (varsa)
- `coverage/` (varsa)
- `docs/knowledge/*.json` (elle düzenleme yok; `npm run index`)

## 5) Kod Standartları (Repo’nun mevcut stili)

- Angular (legacy):
  - Component: `*.component.ts`, Service: `*.service.ts`, Guard: `*.guard.service.ts`
  - Route/guard sınırlarını koru: `src/app/app-routing.module.ts`, `src/app/guards/*`
- Electron main process:
  - OS/driver işleri `main/*.ts` altında; renderer tarafına sızdırma.
  - IPC mesajlarını kontrollü ve minimal tut.
- Error handling/logging:
  - Mevcut kod `console.log` ağırlıklı; yeni logging framework ekleme.
  - Sessiz catch blokları eklemekten kaçın; en azından hata yüzeyi bırak.

## 6) Golden Paths (Repo’dan görülen kritik akışlar)

- Login/Setup: `src/app/app-routing.module.ts` (route `''`) → `LoginComponent`, `SetupComponent`.
- Satış: `StoreComponent` → `SellingScreenComponent` → `PaymentScreenComponent`.
- Gün Sonu: `EndofthedayComponent` + remote çağrılar (`/store/backup`, `/store/refresh`, `/store/endday`).

## 7) Test-as-Spec

- Unit-ish (Karma): `karma.conf.js` + `src/test.ts`
- E2E (Protractor, legacy): `e2e/` + `protractor.conf.js`

## 8) Çıktı Formatı (Agent Output)

Her iş tesliminde şu sırayı takip et:

1) Plan
2) Kanıt (dosya yolu + kısa alıntı/özet)
3) Uygulama (minimum değişiklik)
4) Doğrulama (çalıştırılan komutlar + sonuç)
5) Doküman güncellemesi (gerekliyse)
6) Özet + rollback

