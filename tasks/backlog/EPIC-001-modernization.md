# EPIC-001: Modernization (Angular/Electron)

Bu epic, modernizasyonu kontrollü slice’lara bölmek için örnek backlog iskeletidir.

## Goals (High Level)

- Angular legacy yapısını modern Angular’a taşımaya hazırlanmak
- Electron main/renderer sınırlarını netleştirmek
- Build/paketleme sürecini deterministik hale getirmek

## Proposed Slices (Başlıklar)

- Slice: Build pipeline keşfi ve stabilize etme
- Slice: Angular CLI/webpack stratejisi kararı (ADR)
- Slice: Electron main process güncelleme stratejisi
- Slice: HTTP katmanı standardizasyonu (tek client)
- Slice: Auth/token akışının konsolidasyonu
- Slice: PouchDB replication katmanı güvenliği ve gözlemlenebilirliği
- Slice: Device/driver entegrasyonları için IPC sözleşmeleri

