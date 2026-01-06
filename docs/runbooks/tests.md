# Tests Runbook

## Hedef

- `npm run test` Karma’yı **headless + single-run** modda çalıştırır.
- `npm run test:trace` aynı koşuyu, `EISDIR` tespiti için `fs-trace` preload ile çalıştırır.
- Karma port’u gerekirse otomatik artar (örn. 9876 doluysa 9877). `--port 0` kullanılmaz (Chrome `localhost:0` ile capture olamayabilir).
- `EISDIR: illegal operation on a directory, read` hatası olduğunda path’i ve callsite stack’i loglar.

## Komutlar

- `npm run test`
- `npm run test:trace`
- `npm run test:debug` (Karma debug log)
- `npm run test:compile` (Chrome olmadan `tsc --noEmit`)
- `npm run verify` (içinde `test` step’i varsa `npm run test` çağırır)

## EISDIR Trace

`npm run test:trace` Node’u şu şekilde başlatır:

- `NODE_OPTIONS=--require ./tools/agent/fs-trace-eisdir.js`

Bu preload, şu API’lerde `EISDIR` yakalayınca log basar:

- `fs.readFile`
- `fs.readFileSync`
- `fs.createReadStream` (stream `error` event)

Log formatı:

- `FS_EISDIR op=<...> path="<...>" message="<...>"` + stack

## Kök Neden Tespiti (Karma / Webpack)

1) `FS_EISDIR ... path="..."` satırındaki path’i not al.
2) Aynı log’un altındaki stack’te, repo içinden ilk görünen frame genelde config kaynaklıdır:
   - `karma.conf.js` içindeki `files` / `preprocessors`
   - `@angular/cli` karma plugin zinciri (webpack config’ine bağlanabilir)
   - `webpack.config.js` içinde yanlışlıkla “directory path” gönderilen bir okuma
3) Hızlı doğrulama:
   - `rg -n \"<path'ın son segmenti>\" karma.conf.js webpack.config.js src -S`
4) Fix stratejisi: Bir “directory” yanlışlıkla file gibi okunuyorsa, config’te ilgili entry’yi dosya pattern’ine çevir veya o okuma çağrısının hedefini dosyaya indir.

## Bilinen Kök Neden: `src` Directory Read (`EISDIR`)

- Trace edilen path: `.../quickly-desktop-master/src`
- Callsite: `@angular/cli/plugins/scripts-webpack-plugin.js` (Angular CLI test webpack pipeline)
- Sebep: `.angular-cli.json` içindeki boş script entry’si `""` root ile birleşip `src` path’ine resolve oluyor ve plugin `readFile()` deniyor.
- Kanıt: `.angular-cli.json:26` altında `"scripts": [""]`
- Önerilen düzeltme: `scripts` listesindeki boş string’i kaldır (`[]` yap veya entry’yi sil).
  - Not: Bu slice kapsamında config değişikliği yapılmadı; sadece tespit/runbook eklendi.

## Notlar

- Karma `ChromeHeadlessNoSandbox` (ChromeHeadless + `--no-sandbox --disable-gpu`) ile çalışır.
- macOS’te `CHROME_BIN` set değilse default olarak `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` kullanılır (`tools/agent/karma-run.js` içinde).
- `ChromeHeadless` bazen `/private/tmp/karma-chrome*/SingletonLock` yüzünden start edemeyebilir; bu durumda `rm -rf /private/tmp/karma-chrome*` ile manuel cleanup yap.
