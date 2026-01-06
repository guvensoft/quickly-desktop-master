# Verify Runbook

Bu repo legacy Angular 5 + Electron + webpack toolchain kullanır ve Angular CLI workspace formatı (`angular.json`) yerine `.angular-cli.json` içerir. Bu yüzden `ng lint` bazı ortamlarda **"Angular CLI outside a workspace"** hatası verebilir.

## `npm run verify` davranışı

`npm run verify` `tools/agent/verify.js` tarafından yönetilir:

- `readiness`: Fail-fast. Toolchain hazır değilse (örn. `node_modules` yoksa veya gerekli local bin’ler eksikse) **diğer step’ler denenmeden** `FAIL` ile çıkar ve net aksiyon önerir:
  - `package-lock.json` varsa: `npm ci`
  - yoksa: `npm install`
- `lint`: Best-effort. Başarısız olursa `WARN` basar ve devam eder.
- `test`: Varsa çalışır. Başarısız olursa `FAIL` (exit 1).
- `build`: Varsa çalışır. Başarısız olursa `FAIL` (exit 1).
- `index`: Readiness `PASS` ise her durumda çalışır. Başarısız olursa `FAIL` (exit 1).

Makine okunur çıktı formatı:

- `VERIFY_STEP <name> <PASS|WARN|FAIL> ...`
- `VERIFY_SUMMARY <PASS|WARN|FAIL>`

## Readiness (hazırlık) kontrolü

Readiness kontrolü, `test` ve/veya `build` step’leri mevcutsa devreye girer.

Kontrol edilenler:

- `node_modules/` klasörü var mı?
- `node_modules/.bin/` var mı?
- `test` çalışacaksa: `node_modules/.bin/karma` var mı?
- `build` çalışacaksa: `node_modules/.bin/webpack` var mı?

Readiness `FAIL` olduğunda beklenen aksiyon:

- `package-lock.json` varsa: `npm ci`
- değilse: `npm install`

## Legacy toolchain notları (yaygın kurulum sorunları)

- NPM v7+ (peer-deps strict): Kurulumda `ERESOLVE unable to resolve dependency tree` görürsen `npm install --legacy-peer-deps` (opsiyonel: `--no-package-lock`) kullan.
- Native dependency’ler (özellikle `serialport` / `node-sass`) güncel Node sürümlerinde derlenemeyebilir. Bu repo için pratikte daha eski bir Node sürümü (örn. `nvm` ile) gerekebilir.
- `@ngtools/webpack` duplication / "wrong class" hatası: Test tarafı `@angular/cli` üzerinden `@ngtools/webpack` yüklerken, build tarafı farklı bir fiziksel kopyayı yüklerse sınıf kimlikleri uyuşmayabilir. Bu yüzden `webpack.config.js` içinde `AngularCompilerPlugin` ve loader için tercih edilen path `@angular/cli/node_modules/@ngtools/webpack` olmalıdır (fallback sadece bu path bulunamazsa devreye girer).
