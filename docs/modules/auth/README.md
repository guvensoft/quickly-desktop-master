# Module Pack: Auth

## Amaç

Kullanıcı oturumu, token yönetimi ve route guard’ları.

## Entry Point’ler

- Routing + guard wiring: `src/app/app-routing.module.ts`
- Guard implementasyonu: `src/app/guards/auth.guard.service.ts`
- Auth service: `src/app/services/auth.service.ts`
- Setup login flow (HQ): `src/app/components/setup/setup.component.ts`

## Kritik Bileşenler

- Components:
  - `src/app/components/login/login.component.ts`
  - `src/app/components/setup/setup.component.ts`
  - `src/app/components/activation/activation.component.ts`
- Services/Guards:
  - `src/app/services/auth.service.ts`
  - `src/app/services/http.service.ts` (Authorization header üretimi)
  - `src/app/guards/auth.guard.service.ts`

## Bağımlılıklar

- Token storage: `localStorage` (örn. `AccessToken`)
- HTTP baseUrl: `https://hq.quickly.com.tr`
- Settings DB: store seçimi / store header için `MainService` üzerinden `RestaurantInfo`

## API / Veri Notları

- `/store/login/` ile token alınır, `/store/list/` ile store seçimi yapılır.
- `HttpService` her isteğe `Authorization` + `Store` header set eder.

