# Agent Quickstart (Light Mode)

## 3 dakikada akış

1. `npm run agent -- "Proje genel durumu hakkında bilgi ver?"`
   - `tools/agent/dispatch.js` task text’ten type tahmin eder (question/feature/bugfix/upgrade).
   - `run-slice.js` çağrılır ve `tasks/ACTIVE_SLICE.md` otomatik oluşturulur.
   - Evidence/Plan/Verification blokları hazır olur; sende sadece patch + `Evidence:` yazarsın.
2. Eğer daha fazla doğrulama istiyorsan:
   - `npm run agent:verify -- "..."` veya `REQUIRE_VERIFY=1 npm run agent -- "..."`
   - Bu durumda `npm run index`, `npm run docs:verify`, `npm run test:compile`, `npm run build` (varsa) adım adım çalışır.
3. Değişiklikleri kaydet + `tasks/ACTIVE_SLICE.md` → Evidence:
   - Komut çıktısı
   - Dosya yolu + kısa özet
   - Gerekirse log/snippet
4. Commit/push öncesi:
   - `REQUIRE_ACTIVE_SLICE=1` tanımlanmışsa pre-commit stricter hale gelir (örneğin release branch’lerinde).
   - `REQUIRE_VERIFY=1` ile pre-push’ta docs+verify/verify frais’ı tetiklenir.

## Sık senaryolar

- **question** → `npm run agent -- "Renderer ile main arası IPC nerede?"`
- **feature** → `npm run agent -- "Yeni POS ekranı eklenecek, hangi servisler etkilenir?"`
- **bugfix** → `npm run agent -- "Bugfix: senkronizasyon verisi kayboluyor"`
- **upgrade** → `npm run agent -- "Güncelleme: Electron 1.8 → 1.9"`

Her durumda slice template’leri (`ops/ai/prompts/*.md`) read order → plan → evidence şeklinde yönlendirir.

## Ne zaman verify açmalıyım?

- Release veya paketleme öncesinde (`REQUIRE_VERIFY=1`), çünkü bu, `docs/verify`, `index`, `test:compile`, `build` gibi ağır adımları çalıştırır.
- Riskli değişiklikler (domain/architecture, dependency upgrade) için `--verify` veya `REQUIRE_VERIFY=1` ile snapshot at.
- Günlük küçük sorular/feature’ler için `npm run agent -- "…"` yeter; heavy komutlar optional.
