# ADR-0001: Agent Operating Model ve Repo Yapısı (Legacy)

## Status

Accepted

## Context

QuicklyPOS Desktop (Angular + Electron) legacy bir codebase. Agent’lar tüm repo’yu baştan sona taradığında:
- Gereksiz dosya okuma maliyeti artıyor
- Yanlış modül/dosya seçimi riski yükseliyor
- Büyük refactor/migration işleri kontrolsüz büyüyebiliyor

## Decision

Repo “agent‑ready” olacak şekilde aşağıdaki yapı ve SSOT dokümanları eklendi:

- `AGENTS.md`: Agent çalışma anayasası (indeks önceliği, bütçe, guardrail).
- `docs/repo-map.md`: Dizin haritası ve kritik entrypoint’ler.
- `docs/architecture/overview.md`: Electron ↔ Angular sınırları (C4 text).
- `docs/domain/glossary.md`: Domain/teknik sözlük + naming kuralları.
- `docs/api/endpoint-client-matrix.md`: Endpoint ↔ client çağrı matrisi.
- `docs/modules/*`: Modül bazlı context pack’ler.
- `tools/indexer/`: TS dosyalarından sembol/graf çıkaran basit indeksleyici.
- `ops/`: Agent-ready ops altyapısı (context pack, prompt şablonları, doc verify script’leri).

## Consequences

- Agent’lar, değişiklik öncesi `docs/knowledge/` ve `docs/repo-map.md` ile hedefi daraltır.
- Üretilmiş knowledge çıktıları düzenli güncellenir (`node tools/indexer/index.js`).
- Büyük işler küçük ve geri alınabilir commit’lere bölünür; doğrulama komutları çalıştırılır.

## How to Operate

1. Konu alanını seç: `docs/modules/` veya `docs/repo-map.md`.
2. İlgili sembolleri bul: `docs/knowledge/*.json`.
3. Minimum dosya oku; kanıt topla.
4. Ops araçlarını kullan: `ops/ai/*` prompt şablonları ve `ops/scripts/verify-docs.sh`.
