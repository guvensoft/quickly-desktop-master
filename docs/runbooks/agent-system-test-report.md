# Agent System Test Report

## 1) Smoke Tests

| Command | Exit | Summary |
| --- | --- | --- |
| `bash ops/scripts/verify-docs.sh` | 0 | `OK: docs/api/openapi.yaml present` + `OK: docs verification passed`. |
| `node tools/indexer/index.js --check` | 0 | Sessiz çıkış; `verify`/`pre-commit`’te kullanılan kontrol aynı script. |
| `npm run docs:verify` | 0 | `> quickly-desktop@1.9.5 docs:verify ...` + `OK` satırları (ops/scripts/verify-docs.sh çalıştırıldı). |
| `npm run index` | 0 | `Indexer complete.` + liste: `docs/knowledge/*.json`, `docs/repo-map.generated.md`. |
| `npm run test:compile` | 0 | `cross-env node tools/agent/karma-run.js --compile-only` (Chrome olmadan derleme). |
| `npm run build` | 0 | Webpack + Electron main build; `Hash: 67e54d5...`, `found 462 vulnerabilities` (nota bene). |

> Not: `npm run build` çıktısı 13400ms’lik webpack/tsc run; logun ilk/son bölümleri büyük; sadece `Hash` ve `found ... vulnerabilities` satırları öne çıktı.

## 2) Hook Simulation

- `tasks/ACTIVE_SLICE.md` içinde Evidence bölümü boş iken `.githooks/pre-commit`:
  - Komut: `.githooks/pre-commit`
  - Exit: 1
  - Output: `ERROR: tasks/ACTIVE_SLICE.md içinde Evidence bölümü boş (veya yok).` (hook commit’i engeller).

- `tasks/ACTIVE_SLICE.md` yokken `.githooks/pre-commit`:
  - Komut: `.githooks/pre-commit`
  - Exit: 0
  - Output: `WARN: tasks/ACTIVE_SLICE.md yok; slice guard atlandı. ... ops/scripts/verify-docs.sh` (hook uyarı verip doküman verify/tail ve index check olmaz).

- `tasks/ACTIVE_SLICE.md` yokken `REQUIRE_ACTIVE_SLICE=1 .githooks/pre-commit`:
  - Komut: `REQUIRE_ACTIVE_SLICE=1 .githooks/pre-commit`
  - Exit: 1
  - Output: `ERROR: tasks/ACTIVE_SLICE.md bulunamadı ve REQUIRE_ACTIVE_SLICE=1.` (force zorunlu slice).

## 3) Determinism Check

- Komut: `bash ops/scripts/gen-repo-map.sh` (ardışık iki kez).
  - Sonuç: `docs/repo-map.generated.md` dosyası her iki çalıştırmada da aynı içeriği üretti (diff = 0 satır).
  - Revert: `git checkout -- docs/repo-map.md docs/repo-map.generated.md` (çalıştırmadan önceki state geri geldi).

- Komut: `bash ops/scripts/gen-symbol-index.sh` (ardışık iki kez).
  - Sonuç: `docs/code/symbol-index.md` her iki run’da da birebir aynı çıktı (diff 0).
  - Revert: `git checkout -- docs/code/symbol-index.md`.

## 4) Kapanış

- Test çalışıyor mu?: ✅ evet; smoke komutları (docs verify, index, test:compile, build) hepsi başarılı.
- Detected risks: pre-commit Evidence kuralı, pre-push verify zinciri, indexer deterministik (Ops scripts ile; diff yok).
