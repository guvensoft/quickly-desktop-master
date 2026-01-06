# AGENTS.md — Agent Operating Guide (v1.1)

## Purpose

Bu dosya, QuicklyPOS Desktop repo’sunda agent’ların kod tabanını **minimum token**, **maksimum isabet** ile anlaması ve çalışması için bağlayıcı kuralları tanımlar.

Amaç:

* Rastgele dosya taramasını önlemek
* Büyük dosyaları (örn. `symbols.json`) açmadan hedefe inmek
* Agent’ın **ne bildiğini / ne bilemeyeceğini** netleştirmek
* Halüsinasyon (dosya/symbol uydurma) riskini engellemek

---

## Read Order (Required)

**Varsayılan akış (low-token):**

```
AGENTS.md
→ FAST_CONTEXT.md
→ docs/repo-map.md
→ docs/code/symbol-index.md
→ npm run symbols:*   (query)
→ docs/knowledge/*
→ (gerekirse) hedef kod dosyası
```

Detay dokümantasyon (ihtiyaca göre):

1. `docs/architecture/*`
2. `docs/domain/*`
3. `docs/api/*`
4. `docs/data/*`
5. `docs/decisions/*`

---

## Knowledge Coverage (No Code Read)

Kod dosyalarını açmadan elde edilebilecek bilgi sınırları:

| Alan                                                  | Kapsama                 |
| ----------------------------------------------------- | ----------------------- |
| Structure / Navigation (repo-map, symbols, knowledge) | **90–100%**             |
| Architecture (C4, ADR)                                | **80–90%**              |
| Domain / Business flow                                | **60–75%**              |
| Behavior / How it works                               | **25–50%**              |
| Implementation details                                | **0–20% (kod gerekir)** |

> Agent bu sınırların ötesinde iddia kurmamalıdır.

---

## Allowed Actions / Guardrails

* **Üretilmiş/indirilen artefact’lara dokunma**:
  `dist/`, `node_modules/`, `app-builds/`, `out-tsc/`, `coverage/`
* **Secrets ekleme yok**: API key, token, password, private URL.

  * `.env` gerekiyorsa sadece placeholder:
    `TODO (needs confirmation)`
* **Büyük refactor yok**: geniş rename/move, cleanup PR’ları, toolchain migration.
* **Yeni dependency**:

  * Varsayılan: ❌
  * Zorunluysa: gerekçe + alternatifler + lisans/size + rollback notu (ADR).

---

## Coding Conventions (Repo’ya Uygun)

### Angular (legacy)

* Component: `*.component.ts`
* Service: `*.service.ts`
* Guard: `*.guard.service.ts`
* Routing/guard sınırlarını koru:

  * `src/app/app-routing.module.ts`
  * `src/app/guards/*`

### Electron (main process)

* OS/driver işleri **sadece** `main/*.ts`
* Renderer tarafına Node/OS logic sızdırma
* IPC mesajlarını minimal ve kontrollü tut

### Logging / Error Handling

* Mevcut yapı `console.log` ağırlıklı
* Yeni logging framework ekleme
* Sessiz `catch {}` bloklarından kaçın

---

## Golden Paths (High-Level)

* **Login / Setup**
  `app-routing.module.ts` → `LoginComponent`, `SetupComponent`

* **Sales Flow**
  `StoreComponent` → `SellingScreenComponent` → `PaymentScreenComponent`

* **End of Day**
  `EndofthedayComponent`
  Remote endpoints:
  `/store/backup`, `/store/refresh`, `/store/endday`

---

## FAST_CONTEXT.md (Critical)

`FAST_CONTEXT.md` bu repo için **tek bakışta mimari** sunar.

* İlk **60 saniyede** okunması önerilir
* Hangi soruda nereye bakılacağını söyler
* Agent’ı doğrudan hedef dosyaya indirir

---

## Low-Token Symbol Navigation (Mandatory)

`docs/knowledge/symbols.json` **büyüktür**.
Doğrudan okumak **yasaktır**.

Önce **query CLI** kullanılır:

```bash
npm run symbols:name -- "EndofthedayComponent"
npm run symbols:method -- "uploadBackup"
npm run symbols:source -- "electron"
```

Bu komutlar:

* dosya yolu
* sourceId (app / electron)
* class / method imzaları
  bilgisini **büyük dosya açmadan** verir.

---

## LIGHT MODE (Default)

### Amaç

* Soru, keşif, planlama
* Düşük riskli değişiklikler

### Varsayılan Akış

* AGENTS → FAST_CONTEXT → repo-map → symbol-index → `npm run symbols:*`
* Test / build / verify **zorunlu değil**

### Ne Zaman Kod Açılır?

* Query sonucu 0 ise
* Davranış bilgisi gerekiyorsa
  → **sadece ilgili dosya** açılır

---

## STRICT MODE (Opt-in)

Aşağıdaki durumlarda kullanılır:

* Release
* Geniş etki alanı olan değişiklikler
* `REQUIRE_VERIFY=1` açıkken

### Recommended Checks (Strict Only)

* Docs verify: `ops/scripts/verify-docs.sh`
* Build: `npm run build`
* TS sanity: `npm run test:compile`
* Tests (çalışıyorsa): `npm run test`
* Lint (uygunsa): `npm run lint`
* Repo health: `npm run verify`

> Varsayılan değildir.

---

## Output Contract (Mandatory)

Her cevap şu yapıyı izler:

1. **Hedef** (ne aranıyor?)
2. **Kanıt**

   * repo-map / symbol-index / `npm run symbols:*`
3. **Sonuç** (kısa ve net)
4. **Next Step** (gerekirse)

Notlar:

* Kod dosyası açıldıysa **açıkça belirt**
* Açılmadıysa özellikle belirt

---

## No Fabrication (Hard Rule)

* Dosya / class / method adı:

  * repo-map
  * symbol-index
  * `npm run symbols:*`
    ile doğrulanmadan **asla söylenmez**
* Query sonucu 0 ise:

  * “Kodda aramam gerekiyor” denir
  * veya `npm run index` önerilir
* Örnekler bile uydurma olamaz

---

## Task Examples (Calibrated)

### QUESTION — “PouchDB sync nerede?”

* Query: `npm run symbols:method -- "sync"`
* Kanıt: bulunan class/file
* Not: Dosya adı varsayımı yapılmaz

### FEATURE — “Küçük UI değişikliği”

* Query: `symbols:name` (component)
* Boundary check: renderer vs electron
* Test önerisi: sadece gerekirse

### BUGFIX — “Crash”

* Kanıt: log → symbol query → hedef dosya
* Kod: **yalnızca ilgili dosya**

### UPGRADE — “Sürüm bump”

* STRICT MODE
* `REQUIRE_VERIFY=1`

---

**Bu dosya, agent için bağlayıcıdır.**
Kurallara uymayan cevaplar geçersiz sayılır.
