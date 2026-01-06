# Doc Index (AI Agent Ready)

Bu indeks, repo dokümantasyonunun SSOT giriş noktalarını listeler.

## Operasyon Modeli

- Agent çalışma kuralları: `AGENTS.md`
- Repo haritası (SSOT): `docs/repo-map.md`
- Repo haritası (generated): `docs/repo-map.generated.md` (üretmek için: `npm run index`)

## Mimari (C4 + Runtime)

- Overview: `docs/architecture/overview.md`
- C4: `docs/architecture/c4-context.md`, `docs/architecture/c4-container.md`, `docs/architecture/c4-component.md`
- Deployment/runtime: `docs/architecture/runtime-deployment.md`

## Domain

- Sözlük: `docs/domain/glossary.md`
- İş akışları: `docs/domain/workflows.md`

## API

- Endpoint matrix: `docs/api/endpoint-client-matrix.md`
- OpenAPI (varsa): `docs/api/openapi.yaml`

## Data

- Persistence overview: `docs/data/persistence.md`
- ERD (varsa): `docs/data/erd.md`
- Migrations (varsa): `docs/data/migrations.md`

## Code Navigation

- Symbol index (generated): `docs/code/symbol-index.md`
- Module boundaries: `docs/code/module-boundaries.md`
- TypeScript symbol metadata: `docs/knowledge/symbols.json`
- Source-aware symbols summary: `docs/knowledge/symbols.by-source.json`
- Source hints (tsconfig): `docs/knowledge/sources.json`
- Method/service metadata (generated): `docs/knowledge/symbols.json`

## Decisions (ADR)

- ADR process: `docs/decisions/0001-record-architecture-decisions.md`
- ADR list: `docs/decisions/README.md`

## Runbooks

- Verify: `docs/runbooks/verify.md`
- Tests: `docs/runbooks/tests.md`
