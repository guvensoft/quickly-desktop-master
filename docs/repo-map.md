# Repo Map (QuicklyPOS Desktop)

## Amaç

Bu doküman repo’nun **SSOT** haritasıdır: klasörlerin amacı, kritik entrypoint’ler ve Electron + Angular runtime akışı.

## Generated Map

Bu repo’da ayrıca indexer tarafından üretilen otomatik harita vardır:

- `docs/repo-map.generated.md` (üretmek için: `npm run index`)

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
- `tools/`: Repo ops araçları (verify/indexer vb.).
- `ops/`: Agent-understanding ops araçları (repo-map/symbol-index generator, doc verify, prompt templates).

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

## Build / Test / Lint (Repo’dan)

- Build: `npm run build` (webpack bundle + electron main compile)
- Lint: `npm run lint` (Angular CLI lint; bazı ortamlarda workspace uyarıları olabilir)
- Tests (Karma):
  - `npm run test:compile` (Chrome olmadan compile sanity)
  - `npm run test` (headless)
  - `npm run test:debug` (karma debug logs)
- Verify (repo health): `npm run verify` (default’ta test `TEST_UNSTABLE` olarak `WARN` ile skip edilebilir; `VERIFY_STRICT=1` ile enforce)

## Konfigürasyonlar

- Angular CLI (legacy): `.angular-cli.json`
- TypeScript: `tsconfig.json`, `src/tsconfig.*.json`, `tsconfig.electron.json`
- Webpack: `webpack.config.js`
- Karma: `karma.conf.js`
- Protractor: `protractor.conf.js`
- Electron packaging: `electron-builder.json`

## 3rd Party / Entegrasyonlar (Repo’dan görülen)

- Remote HQ base URL: `https://hq.quickly.com.tr` (`src/app/services/http.service.ts`)
- Local DB + sync: PouchDB (`src/app/services/main.service.ts`)
- Main process HTTP server (in-memory PouchDB): `main/appServer.ts` (Express + `express-pouchdb`)
- Device integration:
  - Printer (ESC/POS): `main/ipcPrinter.ts`
  - Caller/scaler: `main/callerServer.ts`, `main/scalerServer.ts`

## Değiştirirken Dikkat

- Electron main ↔ Angular renderer sınırı: OS/driver erişimi `main/*` içinde kalmalı.
- Test/Build toolchain: Karma `@angular/cli` plugin zinciri kullanır; webpack tarafında `@ngtools/webpack` tek fiziksel kopya hedeflenmelidir (bkz. `webpack.config.js`).
- Üretilmiş artefact’lara dokunma: `dist/`, `node_modules/`, `app-builds/` (varsa), `docs/knowledge/*.json`.

## Where to implement X?

- Yeni UI ekranı:
  - Component: `src/app/components/<area>/...`
  - Route: `src/app/app-routing.module.ts`
  - Permissions/guards: `src/app/guards/auth.guard.service.ts` + `src/app/services/auth.service.ts`
- Yeni “domain kuralı”:
  - Servisler: `src/app/services/*` (özellikle `MainService`, `SettingsService`)
  - Model/mocks: `src/app/mocks/*`
  - TODO (needs confirmation): Ayrı bir “domain layer” yok; küçük ve lokal değişikliklerle ilerle.
- Yeni remote endpoint/contract:
  - Caller map: `docs/api/endpoint-client-matrix.md`
  - HTTP wrapper: `src/app/services/http.service.ts`
  - OpenAPI stub: `docs/api/openapi.yaml` (belirsiz alanları TODO ile işaretle)
- Yeni local persistence değişikliği:
  - PouchDB catalog: `src/app/services/main.service.ts`
  - Conflict: `src/app/services/conflict.service.ts`
  - Doküman: `docs/data/persistence.md` + `docs/data/migrations.md`
- Yeni device integration (printer/scaler/caller):
  - Electron main: `main/*`
  - Renderer bridge: `src/app/providers/electron.service.ts`


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



<!-- ops:gen-repo-map:start -->

## Generated Summary (ops/scripts/gen-repo-map.sh)

- Stack: Angular 5.0.3, Electron 1.8.1, webpack 3.8.1
- Electron main entry: `main.ts`
- Electron services: `main/*.ts`
- Angular bootstrap: `src/main.ts`
- Angular routes: `src/app/app-routing.module.ts`
- Generated/artefacts (do not edit): `dist/`, `node_modules/`, `app-builds/` (if present), `out-tsc/` (if present), `coverage/` (if present)

- Key scripts (from `package.json`):
  - build: `npm run build`
  - lint: `npm run lint`
  - tests: `npm run test` / `npm run test:debug` / `npm run test:compile`
  - verify: `npm run verify`

<!-- ops:gen-repo-map:end -->
