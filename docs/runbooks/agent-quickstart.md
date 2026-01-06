- **question** → `npm run agent -- "Renderer ile main arası IPC nerede?"`
- **feature** → `npm run agent -- "Yeni POS ekranı eklenecek, hangi servisler etkilenir?"`
- **bugfix** → `npm run agent -- "Bugfix: senkronizasyon verisi kayboluyor"`
- **upgrade** → `npm run agent -- "Güncelleme: Electron 1.8 → 1.9"`
## Günlük kullanım (test yok)

1. `npm run agent -- "Proje genel durumu hakkında bilgi ver?"`
   - Default: sadece doğru slice şablonu oluşturulur (`run-slice.js`) ve `npm run index` çalışır.
   - Test/build/verify adımları otomatikte yok; `Evidence:` bloğunu elle doldur ve çalışmana devam et.

2. `npm run agent -- "X özelliğini ekle"`
   - Agent type`ı tahmin eder, `tasks/ACTIVE_SLICE.md` içinde plan + patch + verification bloklarını oluşturur.
   - Sadece `npm run index` koşturulur; finalize sonrası `Evidence` yazıp commit at.

3. Eğer `REQUIRE_VERIFY=1` (ya da `npm run agent:verify -- "..."`) set edersen:
   - `docs:verify`, `test:compile`, `build` (varsa) gibi pipeline adımları da çalışır; release/CI senaryoları için bu mod tercih edilir.

## Ne zaman verify / test çalıştırmalıyım?

- Release veya deployment sonrası: tüm doc/index/test/build kombinasyonu için `REQUIRE_VERIFY=1` yı kullan.
- Riskli refactor veya dependency upgrade: `--verify` bayrağını ekleyerek ekstra kontrolleri tetikle.
- CI / team review: aynı ortam koşullarını yakalamak için `npm run agent:verify` ki pipelines benzetimi olsun.
- **question** → `npm run agent -- "Renderer ile main arası IPC nerede?"`
- **feature** → `npm run agent -- "Yeni POS ekranı eklenecek, hangi servisler etkilenir?"`
- **bugfix** → `npm run agent -- "Bugfix: senkronizasyon verisi kayboluyor"`
- **upgrade** → `npm run agent -- "Güncelleme: Electron 1.8 → 1.9"`

Her durumda slice template’leri (`ops/ai/prompts/*.md`) read order → plan → evidence şeklinde yönlendirir.

## Ne zaman verify açmalıyım?

- Release veya paketleme öncesinde (`REQUIRE_VERIFY=1`), çünkü bu, `docs/verify`, `index`, `test:compile`, `build` gibi ağır adımları çalıştırır.
- Riskli değişiklikler (domain/architecture, dependency upgrade) için `--verify` veya `REQUIRE_VERIFY=1` ile snapshot at.
- Günlük küçük sorular/feature’ler için `npm run agent -- "…"` yeter; heavy komutlar optional.
