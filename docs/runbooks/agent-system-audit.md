# Agent Operating Model Audit

## 1) Executive Summary

- Agent sistemi `tasks/ACTIVE_SLICE.md` üzerinden slice→plan→patch→verify→evidence döngüsünü zorunlu kılar (`ops/ai/prompts/*.md`, `tools/agent/run-slice.js`).
- Pre-commit hook (`.githooks/pre-commit`) sadece boş Evidence’ı değil aynı zamanda `ops/scripts/verify-docs.sh` ve `tools/indexer/index.js --check` sonuçlarını da doğrular; `tasks/ACTIVE_SLICE.md` yoksa uyarır, `REQUIRE_ACTIVE_SLICE=1` ise fail olur.
- Pre-push hook (`.githooks/pre-push`) tekrar `docs` verify’i çalıştırır, `npm run verify` varsa onu, yoksa `lint/test/typecheck/build` sırasını yürütür.
- `ops/scripts/verify-docs.sh` repo-map, openapi, docs/knowledge çıktıları gibi SSOT’ları garanti eder ve `docs/runbooks/agent-system` gibi akışları referans gösterir.
- Knowledge indexer (`tools/indexer/index.js`) `docs/knowledge/*.json` ve `docs/repo-map.generated.md`, `docs/code/symbol-index.md` üretir ve pre-commit’te `--check` ile taze kalmaları sağlanır.
- Prompt şablonları (`ops/ai/prompts/{question,feature,bugfix,upgrade}.md`) read-order, plan ve verification bloklarıyla agent’ı yönlendirir.
- Docs repertuarı (`docs/repo-map.md`, `docs/code/module-boundaries.md`, `docs/decisions/*`, `docs/architecture/*`) agent’ların required okuyacağı `AGENTS.md` read order’ına uyumlu şekilde organize edilmiştir.
- Evidence sulandırılmaması, plan/patch/verify/doku arka arkaya sergilendiği için `tasks/ACTIVE_SLICE.md` hem kontrol noktası hem de kayıt deposudur.
- Auto-runner’lar (`npm run slice:*`, `npm run agent:*`, `node tools/agent/dispatch.js`) sistemin idempotent slice oluşturmasını sağlıyor; `Evidence` ekleme + `docs:verify`+`test:compile`+`build` zincirini bırakıyor.
- Bu model, `docs/runbooks/agent-tasks.md` ve `tools/agent/README.md` üzerinden içselleştirilmiş; agent’lar projenin `Electron main / Angular renderer` sınırlarına saygı duyarak çalışır.

## 2) Bileşen Envanteri

- `.githooks/pre-commit`
  - **Amaç:** Evidence bölümü ve docs/indexer güncelliğini zorunlu kılmak.
  - **Tetik:** `git commit` öncesinde.
  - **Çıktı:** Hata mesajı (Evidence boşsa) veya Warning (slice yok). `ops/scripts/verify-docs.sh` ve `node tools/indexer/index.js --check` çalıştırılır.

- `.githooks/pre-push`
  - **Amaç:** Kod push’ı öncesi herzaman docs/verify + verify/lin/test/typecheck/build akışını yürütmek.
  - **Tetik:** `git push`.
  - **Çıktı:** `npm run verify` varsa o; yoksa `lint/test/typecheck/build` çıktıları. `ops/scripts/verify-docs.sh` her seferinde çalışır.

- `ops/scripts/verify-docs.sh`
  - **Amaç:** Doküman kapasitelerini (docs/api/openapi.yaml, docs/repo-map*, docs/knowledge/*) doğrulamak.
  - **Tetik:** pre-commit/pre-push hook’ları, `npm run docs:verify`.
  - **Çıktı:** `OK`/`FAIL` logları, eksik dosya mesajı (openapi yok gibi).

- `tools/indexer/index.js`
  - **Amaç:** Repo haritası + symbol index + knowledge json’ları üretmek.
  - **Tetik:** `npm run index`, pre-commit check, auto dispatch/runner’lar (index script varsa).
  - **Çıktı:** `docs/repo-map.generated.md`, `docs/code/symbol-index.md`, `docs/knowledge/*.json`.

- `tools/agent/run-slice.js`
  - **Amaç:** Aktif slice’ı okuyup file budget’ı, Evidence’ı ve verify komutlarını yürütmek.
  - **Tetik:** `npm run slice:*`, `node tools/agent/run-slice.js` (evidence eklemek için) veya auto runnerlar.
  - **Çıktı:** `tasks/ACTIVE_SLICE.md`’ye appended Evidence block, `npm run index`/`verify`/`lint` çıktıları, file budget uyarısı.

- `ops/ai/*`
  - `ops/ai/prompts/{question,feature,bugfix,upgrade}.md`: Her template read order (AGENTS.md→repo-map→symbol-index→doc set), plan/patch/verify/evidence bloklarını tanımlar.
  - `ops/ai/context-pack.md`, `ops/ai/doc-index.md`: Agent’lara repository knowledge’ını sunar; `docs/runbooks/agent-system` gibi referanslar bunlara bağlanır.
  - **Tetik:** Agent’ların slice başlatması, docs/runbooks/guides referansları.
  - **Çıktı:** `tasks/ACTIVE_SLICE.md`’deki yapı, Evidence teşviki.

- `docs/*`
  - `docs/repo-map.md`, `docs/repo-map.generated.md`, `docs/code/symbol-index.md`: SSOT ve sembol haritası; `ops/scripts/gen-*` ve `tools/indexer` üretir.
  - `docs/decisions/*`: ADR + decision log (0001…/ADR-0001…); agent’lar için referans.
  - `docs/architecture/*`, `docs/domain/*`, `docs/api/*`, `docs/data/*`: Read order’ı tamamlar; `runbooks/agent-tasks.md` ve `tools/agent/README.md` bunları işaret eder.

## 3) Kurallar ve Gate’ler

- **Evidence gate (`tasks/ACTIVE_SLICE.md`)**
  - `tasks/ACTIVE_SLICE.md` yoksa `.githooks/pre-commit` WARN verir; `REQUIRE_ACTIVE_SLICE=1` ise exit 1.
  - Evidence bölümünde en az bir satır (dosya yolu + özet) bulunmalı; awk script boşsa pre-commit fail eder.

- **Docs gate (`ops/scripts/verify-docs.sh`)**
  - `docs/api/openapi.yaml`, `docs/repo-map.md`, `docs/repo-map.generated.md`, `docs/knowledge/*` ve `docs/code/symbol-index.md` varlığını doğrular; `OK: ... present` çıktısı üretir.
  - Pre-commit/pre-push her seferinde scripti çalıştırır; eksik dosya msg atar.

- **Knowledge gate (`tools/indexer/index.js --check`)**
  - `node tools/indexer/index.js --check` pre-commit’te run edilip `docs/knowledge/*.json` ile `docs/repo-map.generated.md` günceliyse success; değilse “docs/knowledge/*.json indexer çıktıları güncel değil” hatası atar.

- **Pre-push kalite bariyeri**
  - Önce `ops/scripts/verify-docs.sh`.
  - `npm run verify` varsa çalışır ve script sonlandırır; yoksa `lint`, `test`, `typecheck`, `build` (varlarsa) sırayla çalıştırılır.
  - Her script yoksa “npm run … scripti tanımlı değil; atlandı” logu atılır.

## 4) Sistem agent davranışını nasıl yönlendiriyor?

### Question
  - Trigger: `npm run slice:question -- "<başlık>"` veya dispatch komutu.
  - Required reads: `ops/ai/prompts/question.md` (AGENTS.md→repo-map→symbol-index→docs/architecture|domain|api|decisions).
  - Expected artifacts: `tasks/ACTIVE_SLICE.md` içinde Question template (goal/read order/evidence) + Evidence satırı (command/log).
  - Verification: `npm run docs:verify`, `npm run test:compile` (prompt tavsiyesi), dispatch da `npm run index`.
  - Failure modes: `Evidence` bölümü boş (pre-commit fail), read order atlanırsa spec violations.
  - Recovery: Evidence satır ekle, `npm run docs:verify` yeniden çalıştır.

### Feature
  - Trigger: `npm run slice:feature -- ...` veya `npm run agent:feature`.
  - Required reads: `ops/ai/prompts/feature.md` + `docs/code/module-boundaries.md`.
  - Expected artifacts: `tasks/ACTIVE_SLICE.md` plan/patch checklist/verification checkboxes + Evidence.
  - Verification: `npm run docs:verify`, `npm run build`, `npm run test:compile`, `npm run index`.
  - Failure modes: File budget aşımı (run-slice kontrolü), Evidence eksik (pre-commit fail), verify a fail (pre-push).
  - Recovery: Budgetu aşılmayan minimal patch, Evidence ve verify loglarını `tasks/ACTIVE_SLICE.md` evidence’a yaz.

### Bugfix
  - Trigger: `npm run slice:bugfix`.
  - Required reads: `ops/ai/prompts/bugfix.md` + bug mapi (docs/api, docs/domain).
  - Expected artifacts: Minimal fix plan, reproducible steps, Evidence before/after, verify/test loggable commands.
  - Verification: `npm run docs:verify`, `npm run test:compile`; optionally `npm run test`/`npm run test:debug`.
  - Failure modes: Repro steps belirsiz (reviewer risk), docs verify/test fail (pre-push).
  - Recovery: Document reproduction + fix, rerun verify/test, capture logs.

### Upgrade
  - Trigger: `npm run slice:upgrade` (genelde dispatch/agent runner’la).
  - Required reads: `ops/ai/prompts/upgrade.md`, ADR` docs/decisions/0001*` (veya `ADR-0001*`).
  - Expected artifacts: Target version list, phased plan, ADR linkage, Evidence per phase.
  - Verification: `npm run docs:verify`, `npm run build`, `npm run test:compile`, `npm run test`, `npm run index`.
  - Failure modes: ADR/Evidence eksik (pre-commit fail), `build`/`test` failure (pre-push).
  - Recovery: ADR eklensin, `docs:verify` + `build` tekrar, doygun Evidence.

## 5) SSOT & Çakışma Riskleri

- `docs/repo-map.md` (manuel rehber) ile `docs/repo-map.generated.md` (indexer çıktısı) birlikte referans; `ops/scripts/gen-repo-map.sh` hem haritayı hem de generated versiyonu üretir. Üst üste yazılıyor, bu nedenle bir değişikliğin her iki dosyada da senkron olması gerekir.
- `docs/decisions` klasöründe hem `0001-...` hem `ADR-0001-...` gibi sıralanmış kararlar var; agent’lar bir ADR referansını `ops/ai/prompts/upgrade.md` içindeki “ADR requirement” alanıyla ilişkilendirmeli.
- `docs/api/openapi.yaml` `verify-docs.sh` içinde açıkça kontrol ediliyor; dosya yoksa script hata verir: “OK: docs/api/openapi.yaml present”.
- `tasks/ACTIVE_SLICE.md` yoksa pre-commit WARN verir ama `REQUIRE_ACTIVE_SLICE=1` çevre değişkeni set edilirse fail olur; bu, sıfır slice’lı commit’leri engellemek için kullanılıyor.

## 6) Güvenlik / Gizlilik

- Repo’da `.env` tarzı dosya yok; ajanlar `ops/ai` ve `docs` içinden sadece doküman referansları okuyor.
- Hook’lar sadece doküman/verify komutları çalıştırıyor, loglarında özel bilgiler yok (sadece `OK:`/`ERROR:` satırları), böylece secrets sızması riski minimal.
- `tools/agent/dispatch.js` ve `agent-task.js` loglarında `cmd` çıktısı var, ancak sadece terminal çıkışlarını içeriyor; focus agent verifying, BDD logu yok.

## 7) Bakım & Sürdürülebilirlik

- `ops/scripts/gen-repo-map.sh` ve `ops/scripts/gen-symbol-index.sh` her çalıştırıldığında aynı dosyaları (`docs/repo-map.generated.md`, `docs/code/symbol-index.md`, `docs/knowledge/*`) yazıyor; deterministik çıktılar (iki ardışık run arasında diff yok).
- En sık bozulacak noktalar:
  - `tasks/ACTIVE_SLICE.md` evidence formatı değişirse pre-commit fail olur (regex hassas).
  - `tools/indexer/index.js` bağımlı olduğu dosya yapısı değişirse `--check` fail olur.
  - `docs/decisions/*` isimlendirme karışıklığı risk; `ops/ai/prompts/upgrade.md` ADR linki manuel.
- Öneriler:
  - `tools/indexer/index.js` çıktıları `git status`’ta kontrol etmeden otomatik check (mevcut script check).
  - `ops/ai/prompts` read-order listesine `docs/code/module-boundaries.md` gibi kritik dosyalar eklensin (zaten feature prompt’ta var).

## Kapanış

- ✅ Güçlü yanlar: pre-commit/pre-push gate’leri Evidence + docs + indexer + verify zincirini sağlıyor; prompt şablonları agent’ları yürütülen adımlara zorluyor.
- ⚠️ Riskler:
  1. Evidence formatı (markdown) değişirse pre-commit fail olur (yüksek).
  2. `tools/indexer/index.js` i̇lerlemelerde `docs/knowledge/*.json` formatı bozulursa `--check` fail (orta).
  3. `ops/ai/prompts/upgrade.md`’deki ADR link hatası agent’ı yalan yönlendirebilir (düşük).
- İyileştirmeler (kod değiştirmeden):
  1. `docs/runbooks/agent-tasks.md` veya `.githooks/pre-commit` içinde Evidence formatını örnekle göstermek.
  2. `docs/decisions/README.md`’ye `0001-` vs `ADR-0001-` eşlenmesini ekleyip confusion azaltmak.
  3. `tools/indexer/index.js` çıktılarının `docs/repo-map.generated.md` encode’ını (timestamp gibi) sabitlemek, `gen-repo-map.sh` da `env` varyasyonuna neden olmuyorsa temize çekmek.
