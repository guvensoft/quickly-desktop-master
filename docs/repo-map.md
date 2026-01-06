# Repo Map (QuicklyPOS Desktop)

## Amaç

Bu doküman repo’nun **SSOT** haritasıdır: klasörlerin amacı, kritik entrypoint’ler ve Electron + Angular runtime akışı.

## Dizin Haritası

- `main.ts`: Electron main process entrypoint (window lifecycle + IPC/servers bootstrap).
- `main/`: Electron main process yan servisleri (IPC printer, app server, caller/scaler servisleri).
- `src/`: Angular uygulaması (renderer) + statik asset’ler.
  - `src/main.ts`: Angular bootstrap.
  - `src/app/`: Uygulama kaynakları (components/services/providers/guards/pipes).
  - `src/environments/`: Env flag’leri (`production` vb.).
- `drivers/`: Donanım/driver ilgili yardımcılar (varsa).
- `e2e/`: Protractor e2e testleri (legacy).
- `webpack.config.js`: Bundle/build pipeline (Angular CLI yerine webpack).
- `electron-builder.json`: Paketleme (Electron Builder) ayarları.

## Runtime Akışı (Electron + Angular)

1. Electron main: `main.ts` çalışır.
2. `main.ts` içinden main process servisleri yüklenir:
   - `main/ipcPrinter.ts`
   - `main/appServer.ts`
   - `main/callerServer.ts`
   - `main/scalerServer.ts`
3. Electron `BrowserWindow` `dist/index.html` yükler (build sonrası).
4. Angular renderer: `src/main.ts` → `AppModule` (`src/app/app.module.ts`) bootstrap.
5. Uygulama rotaları: `src/app/app-routing.module.ts`.

## Kritik Entrypoint’ler (Hızlı Erişim)

- Electron:
  - `main.ts`
  - `main/ipcPrinter.ts`
  - `main/appServer.ts`
- Angular:
  - `src/main.ts`
  - `src/app/app.module.ts`
  - `src/app/app-routing.module.ts`
  - `src/app/app.component.ts`

## Sık Kullanılan Altyapı Bileşenleri (Kısa Rehber)

- Auth / guard:
  - Guards: `src/app/guards/auth.guard.service.ts`
  - Token storage: `localStorage['AccessToken']` (kullanım noktaları koddan doğrulanmalı)
- HTTP:
  - Wrapper: `src/app/services/http.service.ts` (baseUrl + auth/store header)
  - Direkt `Http` kullanımı: `src/app/components/setup/setup.component.ts`
- Config / settings:
  - Local settings store: `src/app/services/settings.service.ts` + `MainService` DB katmanı
- State / data:
  - PouchDB / replication: `src/app/services/main.service.ts` (LocalDB/ServerDB/RemoteDB)
- Device integration (Electron):
  - `src/app/providers/electron.service.ts` (renderer tarafı Electron bridge)
  - `main/ipcPrinter.ts` (printer IPC)

