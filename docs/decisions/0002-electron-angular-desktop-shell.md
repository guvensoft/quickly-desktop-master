# 0002: Electron Shell + Angular Renderer

## Status

Accepted

## Context

Repo’da:

- Electron main entry `main.ts` ile pencere yaşam döngüsü ve servis bootstrap yapılır.
- Angular UI renderer tarafında `src/main.ts` üzerinden bootstrap edilir.

Bu yapı, OS/driver entegrasyonları için Node.js runtime gerektirir.

## Decision

Desktop uygulama shell’i Electron olacak; UI renderer Angular (legacy) olarak çalışacak.

## Consequences

- Electron main ↔ Angular renderer sınırı kritik: OS/driver işleri `main/*` altında kalır.
- UI-only geliştirmeler `src/` içinde yapılır; native erişim gerekiyorsa IPC ile main process’e delege edilir.

## Links

- `main.ts`
- `src/main.ts`
- `docs/architecture/overview.md`

