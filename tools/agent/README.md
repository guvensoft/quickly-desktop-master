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

