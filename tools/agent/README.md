# Agent Tools

Bu klasör, repo içindeki tüm AI agent’lar için **tek giriş noktası** olacak şekilde “slice → verify → evidence” akışını otomatikleştirir.

## run-slice

- Önkoşul: `tasks/ACTIVE_SLICE.md` mevcut olmalı ve içinde `Evidence:` bölümü bulunmalı.
- Çalıştırır:
  - `npm run index` (yoksa `node tools/indexer/index.js`)
  - `npm run verify` (repo script’i)
- Komut çıktılarını `tasks/ACTIVE_SLICE.md` içindeki `Evidence:` altına tarih/saat ile append eder.
- Slice içinde `File budget:` varsa, `git diff --name-only` + `--cached` ile değişen dosya sayısını kontrol eder.

Kullanım:

- `node tools/agent/run-slice.js`

## Best Practices & Usage Examples

1) Genel Prensipler
- Agent görevleri **her zaman slice ile başlatılır**
- Kanıtsız (Evidence’sız) ilerleme yapılmaz
- Kod değiştiyse: knowledge index + docs verify zorunludur
- “Bitirdim” demek = pre-commit + pre-push geçmek demektir

2) Soru Cevaplama (Question)
Örnek:
```bash
npm run slice:question -- "Electron renderer ile main arasında IPC akışı nerede?"
```

3) Auto dispatch
- `npm run agent -- "Yeni feature için davranışı betimle"` komutu type’ı tahmin edip `run-slice` + verify/test/build zincirini çalıştırır ve sonuçları özetler.
