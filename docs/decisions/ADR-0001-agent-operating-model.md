# ADR-0001: Agent Operating Model ve Repo Yapısı

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
- `tasks/`: Task brief + slice şablonları ve örnek epic backlog.

## Consequences

- Agent’lar, değişiklik öncesi `docs/knowledge/` ve `docs/repo-map.md` ile hedefi daraltır.
- Üretilmiş knowledge çıktıları düzenli güncellenir (`node tools/indexer/index.js`).
- Büyük işler slice’lara bölünür; slice kapanmadan yeni slice’a geçilmez.

## How to Operate

1. Konu alanını seç: `docs/modules/` veya `docs/repo-map.md`.
2. İlgili sembolleri bul: `docs/knowledge/*.json`.
3. Minimum dosya oku; kanıt topla.
4. `tasks/templates/slice.md` ile slice’ı çalıştır ve kapat.

