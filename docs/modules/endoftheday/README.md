# Module Pack: End of Day (Gün Sonu)

## Amaç

Gün sonu kapanışı: yerel backup, uzak tarafa upload, token refresh ve purge/endday işlemleri.

## Entry Point’ler

- UI: `src/app/components/endoftheday/endoftheday.component.ts`
- HTTP: `src/app/services/http.service.ts`
- Local backup/file: `src/app/providers/electron.service.ts`
- Printing: `src/app/providers/printer.service.ts`

## Kritik Akışlar (High Level)

1. Yerel süreç: rapor oluşturma + local backup.
2. Remote upload: `/store/backup`.
3. Token refresh: `/store/refresh`.
4. Remote purge/endday: `/store/endday`.
5. DB reset/replication: `MainService` üzerinden.

## Bağımlılıklar

- Token: `localStorage['AccessToken']`
- Store header: `HttpService` içinde `RestaurantInfo` → store id
- Local DB lifecycle: `src/app/services/main.service.ts`

## API / Veri Notları

- Endpoint listesi SSOT: `docs/api/endpoint-client-matrix.md`

