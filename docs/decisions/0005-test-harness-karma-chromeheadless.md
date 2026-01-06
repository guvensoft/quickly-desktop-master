# 0005: Karma + ChromeHeadless Test Harness

## Status

Accepted

## Context

Repo Karma test koşusu Angular CLI karma plugin zinciri ile çalışır:

- Karma config: `karma.conf.js`
- Scripts: `npm run test*` (`package.json`)

Legacy toolchain’da ChromeHeadless capture stabilitesi çevreye bağlı olabilir. Ayrıca `--port 0` ile Chrome’un `localhost:0` URL’i üzerinden capture olamaması gibi sistemik problemler gözlemlenebilir.

## Decision

Karma test koşusu için:

- Wrapper script ile deterministik Chrome profile dir yönetimi ve cleanup yapılır (`tools/agent/karma-run.js`).
- Karma ChromeHeadlessNoSandbox ayarları stabilite odaklı tutulur (`karma.conf.js`).
- `npm run test:compile` ile “Chrome launch olmadan” compile sanity sağlanır.

## Consequences

- Bazı CI/kurumsal ortamlarda UI-less koşular için `test:compile` minimum sağlık kontrolü olarak kullanılabilir.
- Gerçek browser testleri `VERIFY_STRICT=1` ile enforce edilebilir (bkz. `tools/agent/verify.js`).

## Links

- `package.json`
- `tools/agent/karma-run.js`
- `karma.conf.js`
- `docs/runbooks/tests.md`

