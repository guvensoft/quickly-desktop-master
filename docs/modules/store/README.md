# Module Pack: Store (Selling / Payment)

## Amaç

POS satış akışı: ürün seçimi, hesap yönetimi, ödeme ekranı ve satışa bağlı yardımcılar (yazdırma, cihaz entegrasyonu).

## Entry Point’ler

- Route:
  - Store home: `src/app/app-routing.module.ts` (`/store`)
  - Selling: `src/app/app-routing.module.ts` (`/selling-screen/:type/:id`)
  - Payment: `src/app/app-routing.module.ts` (`/payment/:id`)
- Components:
  - `src/app/components/store/store.component.ts`
  - `src/app/components/store/selling-screen/selling-screen.component.ts`
  - `src/app/components/store/payment-screen/payment-screen.component.ts`

## Kritik Servis/Provider’lar

- Data/DB: `src/app/services/main.service.ts`
- Order: `src/app/services/order.service.ts`
- Settings/config: `src/app/services/settings.service.ts`
- Device bridge: `src/app/providers/electron.service.ts`
- Printing: `src/app/providers/printer.service.ts` + main process `main/ipcPrinter.ts`

## Bağımlılıklar

- Local/remote DB replikasyonu (PouchDB): `MainService`
- Kullanıcı/session state (localStorage + settings docs)
- Electron IPC (yazıcı, terminal, caller, tartı)

## API / Veri Notları

- Satış akışının büyük kısmı local DB üzerinden ilerliyor; uzak sistemle senkronizasyon `MainService` katmanında.
- QR/URL üretimi gibi dış linkler UI tarafında olabilir (örn. `https://quickly.cafe/...`).

