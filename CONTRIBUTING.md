# Contributing

Bu repo legacy bir Angular 5 + Electron codebase’tir. Katkıların güvenli ve deterministik olması için aşağıdaki kuralları takip edin.

## PR İlkeleri

- Küçük ve odaklı PR’lar (tek amaç).
- Üretim davranışını değiştiren refactor’ları ayrı PR/ADR ile yapın.
- Yeni dependency eklemeden önce gerekçe + alternatif + lisans/size notu yazın.

## Commit Mesajı

- Kısa “why + what” formatı önerilir.
  - Örn: `docs: add symbol index (why: faster navigation)`

## Doğrulama Checklist

- [ ] `ops/scripts/verify-docs.sh`
- [ ] `npm run build`
- [ ] `npm run test:compile`
- [ ] (çalışıyorsa) `npm run test` veya `npm run test:debug`
- [ ] (workspace uygunsa) `npm run lint`

## Dokümantasyon

- Davranış/kontrat değiştiyse:
  - `docs/repo-map.md`
  - `docs/domain/*` (workflow/glossary)
  - `docs/api/*` (endpoint matrix / OpenAPI)
  - `docs/decisions/*` (ADR gerekiyorsa)

