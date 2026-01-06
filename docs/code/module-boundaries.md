# Module Boundaries (Heuristic)

Bu repo legacy bir Angular 5 + Electron uygulamasıdır ve “strict layered architecture” garantisi yoktur. Yine de agent’lar için pratik sınırlar:

## Renderer (Angular) vs Main (Electron)

- **Renderer (Angular UI):** `src/`
- **Main (Electron/Node):** `main/` ve `main.ts`
- Kural: OS/driver erişimi (printer/scaler/caller gibi) renderer’da yapılmaz; IPC ile main’e delege edilir.

## Angular (Renderer) Katmanları (Observed)

- UI components: `src/app/components/*`
- Routing/guards: `src/app/app-routing.module.ts`, `src/app/guards/*`
- Services (data/auth/http): `src/app/services/*`
- Providers (platform bridging): `src/app/providers/*`
- Data model / mocks: `src/app/mocks/*`

## Electron Main (Observed)

- IPC + device integration: `main/ipcPrinter.ts`, `main/scalerServer.ts`, `main/callerServer.ts`
- Local app server: `main/appServer.ts`

## TODO (needs confirmation)

- Renderer ↔ main IPC event isimlerinin tam listesi ve payload contract’ları (`src/app/providers/electron.service.ts` + `main/*` üzerinden çıkarılmalı).

