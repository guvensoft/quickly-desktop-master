# Boundaries (Preparation)

## Current State

- Bu repo’da `package.json` içinde `eslint` tabanlı bir kurulum görünmüyor.
- Mevcut lint akışı: `npm run lint` → Angular CLI + `tslint.json`.

## Goal

Agent’ların ve insanların değişiklikleri “modül sınırları” içinde tutmasını kolaylaştırmak (henüz enforce etmeden).

## Minimal Boundary Ruleset (Proposed)

ESLint’e geçildiğinde (örn. `@typescript-eslint` + `eslint-plugin-boundaries` benzeri), aşağıdaki kurallar küçük bir başlangıç seti olabilir:

1. `src/app/` içinde “feature” alanları birbirini doğrudan import etmesin (paylaşılan kod `src/app/shared/` altında).
2. `src/app/components/` sadece UI; `src/app/services/` ve `src/app/providers/` dışında “infrastructure” import etmesin.
3. Electron main process (`main/`, `main.ts`) ile Angular renderer (`src/`) arasında import olmasın (IPC/bridge üzerinden haberleşsin).

## Roadmap

1. TSLint → ESLint migration kararı (ADR) ve minimum config.
2. Boundary plugin seçimi ve “allowed import graph” tasarımı.
3. Önce “warn-only” CI kontrolü, sonra hard-enforcement.

