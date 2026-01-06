# Endpoint ↔ Client Matrix

Bu liste, mevcut kodda görülen frontend çağrılarından çıkarılmıştır. SSOT olarak tutulur; yeni endpoint eklendiğinde güncellenir.

## Base URL

- `https://hq.quickly.com.tr` (bkz. `src/app/services/http.service.ts`, `src/app/components/setup/setup.component.ts`)

## Matrix

| Endpoint | Method | Client code (caller) | Notes |
|---|---:|---|---|
| `/store/login/` | POST | `src/app/components/setup/setup.component.ts` | Kullanıcı adı/şifre ile token alımı |
| `/store/login` | POST | `src/app/components/admin/admin.component.ts` | Admin aracı fallback login (legacy/test) |
| `/store/list/` | GET | `src/app/components/setup/setup.component.ts` | Store listesi (Authorization header ile) |
| `/store/backup` | POST | `src/app/components/endoftheday/endoftheday.component.ts` | Gün sonu yedeğini gönderme |
| `/store/refresh` | POST | `src/app/components/endoftheday/endoftheday.component.ts`, `src/app/components/admin/admin.component.ts` | Token yenileme |
| `/store/endday` | POST | `src/app/components/endoftheday/endoftheday.component.ts` | Uzak tarafta gün sonu/purge işlemi |
| `v1/management/restaurants/:restaurantID/report_generator/` | POST | `src/app/components/admin/admin.component.ts` | Admin test aracı (management) |

## Notlar / Gaps

- Bu repo’da endpoint kullanımı iki şekilde yapılır:
  - Wrapper: `HttpService` (`src/app/services/http.service.ts`)
  - Direkt `Http`: setup akışı (`src/app/components/setup/setup.component.ts`)
- “GET/DELETE/PUT” wrapper metotları mevcut olsa da kullanım örnekleri sınırlı; ihtiyaç olursa indeks üzerinden tespit edilmelidir.
