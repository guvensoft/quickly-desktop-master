# 0001: Record Architecture Decisions

## Status

Accepted

## Context

QuicklyPOS Desktop legacy bir repo (Angular 5 + Electron + webpack). Zaman içinde:

- “Neden böyle?” soruları cevaplanamaz hale gelir,
- Yeni katkıda bulunanlar riskli refactor’lara yönelebilir,
- Toolchain/ops değişiklikleri deterministik ilerlemez.

## Decision

Bu repo’da mimari ve süreç kararları, `docs/decisions/` altında ADR (Architecture Decision Record) formatıyla tutulur.

## Consequences

- Her anlamlı karar bir ADR ile kayda girer.
- ADR’ler kısa, kanıta dayalı ve geri alınabilir olmalı.
- ADR formatı standardize edilir; linklerle koda bağlanır.

## ADR Template

- Title
- Status (Proposed | Accepted | Deprecated | Superseded)
- Context
- Decision
- Consequences (trade-offs)
- Links (ilgili dosyalar/dokümanlar)

