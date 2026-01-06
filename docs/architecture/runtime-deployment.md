# Runtime & Deployment

## Runtime Model (from repo)

- Electron main process:
  - Entry: `main.ts`
  - Services: `main/*` (printer/app server/caller/scaler)
- Angular renderer:
  - Bootstrap: `src/main.ts`
  - App module: `src/app/app.module.ts`
  - Routes: `src/app/app-routing.module.ts`
- Electron, build sonrası `dist/index.html` yükler (`main.ts`).

## Environments / Config

- Angular environment flag:
  - `src/environments/index.ts` (dev): `production: false`
  - `src/environments/index.prod.ts` (prod): `production: true`
- Webpack build: `webpack.config.js`
- Electron main TS compile: `tsconfig.electron.json` (`outDir: ./dist`)

## Build & Packaging

- Dev:
  - `npm run start` (webpack watch + electron serve)
  - `npm run start:web` (webpack-dev-server, port 4200)
- Build:
  - `npm run build` (webpack bundle + `npm run build:electron:main`)
  - `npm run build:prod` (`NODE_ENV=production`)
- Packaging:
  - `electron-builder.json` output: `app-builds/` (artefact; edit etmeyin)

## Logging / Metrics / Tracing

- Logging: repo genelinde `console.log` ağırlıklı (legacy).
- Assumption: merkezi log/metrics/trace entegrasyonu yok; gerekiyorsa ADR ile ele alınmalı.

## Security Notes (minimal)

- Secrets/config:
  - Repo içinde “secret store” mekanizması görülmüyor; token vb. değerler uygulama ayarları/LocalStorage üzerinden yönetiliyor (ör: `src/app/guards/*`, `src/app/services/*`).
  - TODO (needs confirmation): Prod dağıtımında secrets nasıl enjekte ediliyor?

