# 0004: Webpack-Based Build Pipeline (Legacy)

## Status

Accepted

## Context

Repo Angular CLI workspace formatı (`angular.json`) kullanmıyor; build pipeline webpack config ile yönetiliyor:

- Build command: `npm run build` → `npx webpack ...` (`package.json`)
- Config: `webpack.config.js`
- Electron main compile: `tsconfig.electron.json` → `dist/`

## Decision

Build pipeline, Angular CLI builder yerine webpack config üzerinden sürdürülecek (legacy uyumluluk).

## Consequences

- Toolchain güncellemesi/migration (Angular CLI modernization) ayrı bir proje/ADR olarak ele alınmalı.
- Webpack/Karma/AngularCompilerPlugin uyumluluğu kırılgan olabilir; tek fiziksel `@ngtools/webpack` kopyası kullanılmalıdır.

## Links

- `package.json`
- `webpack.config.js`
- `tsconfig.electron.json`

