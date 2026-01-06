# Architecture Overview (C4 – Text)

## Context

- Ürün: QuicklyPOS Desktop (Angular renderer + Electron shell).
- Aktörler:
  - Kasiyer / işletme personeli (POS işlemleri)
  - Yönetici (ayarlar, raporlar, admin araçları)
- Dış sistemler:
  - Quickly HQ (örn. `https://hq.quickly.com.tr`) – auth/management endpoint’leri
  - CouchDB/PouchDB uyumlu veri katmanı (replikasyon/remote DB)
  - Donanımlar: yazıcı, tartı, caller ID (Electron main servisleri + driver/IPC)

## Containers

- Electron Main Process
  - Sorumluluk: pencere yaşam döngüsü, OS entegrasyonları, IPC, yerel servisler.
  - Kod: `main.ts`, `main/*.ts`
- Angular Renderer (UI)
  - Sorumluluk: ekranlar/akışlar, kullanıcı etkileşimi, local state, HTTP çağrıları.
  - Kod: `src/` ve özellikle `src/app/`
- Local Data Layer (PouchDB)
  - Sorumluluk: offline-first veri, replikasyon, conflict çözümü.
  - Kod: `src/app/services/main.service.ts`, `src/app/services/conflict.service.ts`

## Components (Seçilmiş)

- Auth & Navigation
  - Routes/guards: `src/app/app-routing.module.ts`, `src/app/guards/auth.guard.service.ts`
- Store / Selling / Payment
  - Store screens: `src/app/components/store/` (selling/payment alt bileşenleri)
- End of Day
  - Gün sonu akışı + backup/upload: `src/app/components/endoftheday/endoftheday.component.ts`
- Device/Peripheral
  - Renderer bridge: `src/app/providers/electron.service.ts`
  - Main process IPC: `main/ipcPrinter.ts`, `main/scalerServer.ts`, `main/callerServer.ts`

## Sınırlar (Electron ↔ Angular)

- Angular tarafı **UI ve uygulama akışı** içindir; OS/driver erişimi **Electron main** tarafında kalır.
- Angular → Electron iletişimi `ipcRenderer` üzerinden (bridge provider) yapılır.
- Electron main process, renderer’dan gelen IPC mesajlarını doğrular ve kontrollü şekilde OS/driver işlemi yapar.

