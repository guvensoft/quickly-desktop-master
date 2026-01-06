# Developer Guide (QuicklyPOS Desktop)

Bu repo legacy bir Angular 5 + Electron uygulamasıdır. Amaç: mevcut davranışı kırmadan geliştirme ve bakım süreçlerini daha deterministik hale getirmek.

## Stack (Repo’dan)

- Angular: `@angular/core` 5.0.3
- Angular CLI: 1.6.2 (karma plugin zinciri için kullanılır)
- Electron: 1.8.1
- Build: webpack 3 (`webpack.config.js`)
- Tests:
  - Unit-ish: Karma (`karma.conf.js`)
  - E2E: Protractor (`e2e/`, `protractor.conf.js`)

## Kurulum

- `npm install`

> Not: Native dependency’ler ve legacy toolchain nedeniyle bazı ortamlarda eski bir Node sürümü gerekebilir (`.nvmrc`).

## Günlük Komutlar

- Dev (Electron): `npm run start`
- Build: `npm run build`
- Lint: `npm run lint`
- Tests:
  - Compile-only: `npm run test:compile`
  - Headless run: `npm run test`
  - Debug logs: `npm run test:debug`
- Verify (repo health): `npm run verify`

## Branch / PR

- Küçük PR tercih et (tek konu, düşük risk).
- Büyük refactor/migration, ayrı bir ADR ve plan ile yapılmalı.

### PR Checklist

- [ ] Değişiklik amacı net
- [ ] `npm run build` çalıştı
- [ ] Dokümantasyon güncellendi (gerekliyse)
- [ ] Riskli alanlar (Electron↔Angular, DB/replication) gözden geçirildi

## AI Agent Ready

- Agent operasyon modeli: `AGENTS.md`
- Doküman doğrulama: `ops/scripts/verify-docs.sh`

