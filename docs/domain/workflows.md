# Workflows (High Signal)

Bu doküman, repo’da doğrudan gözlemlenen ana kullanıcı akışlarını özetler. Emin olunmayan yerler “Assumption/TODO” ile işaretlenir.

## 1) Login → Store (POS)

**Happy path (from code)**

1. App açılır → route `''` (`src/app/app-routing.module.ts`) → `LoginComponent`.
2. Kullanıcı PIN girer (4 hane) → `MainService.getAllBy('users', { pincode })` ile local user lookup (`src/app/components/login/login.component.ts`).
3. Başarılıysa `AuthService.login()` + `AuthService.setPermissions()` localStorage’a yazar (`src/app/services/auth.service.ts`).
4. `fastSelling` açıksa `/selling-screen/Fast/New`, değilse `/store` navigasyonu (`src/app/components/login/login.component.ts`).

**Edge cases**

- Hatalı PIN: “Hatalı giriş yaptınız.”
- Guard yetkisi yoksa: `AuthService.isAuthed()` ilgili route için “Giriş Yetkiniz Yok!” mesajı üretebilir (`src/app/services/auth.service.ts`).

## 2) Gün Başlatma / Gün Sonu (End of Day)

**Guard davranışı (from code)**

- `DayStarted` guard, `localStorage['DayStatus']` içinden `started` okur; `false` ise `/endoftheday` route’una redirect eder (`src/app/guards/auth.guard.service.ts`).

**Gün Başlatma (from code)**

1. Kullanıcı `EndofthedayComponent.startDay()` çağırır (`src/app/components/endoftheday/endoftheday.component.ts`).
2. `DateSettings` `started: true` ve `time: Date.now()` ile güncellenir (`SettingsService.setAppSettings('DateSettings', ...)`).
3. Electron üzerinden program reload edilir (`ElectronService.reloadProgram()`).

**Gün Sonu (partial, from code)**

- `EndofthedayComponent.endDay()` içinde açık “checks” varsa gün sonu engellenir; kapatılmış check’ler, cashbox ve report verileri backup listesine eklenir ve local DB temizlenir (`src/app/components/endoftheday/endoftheday.component.ts`).

**Assumption / TODO (needs confirmation)**

- Remote “backup/endday/refresh” çağrılarının tam sırası ve hata davranışı (bu dosyada mevcut ama bu doküman için kapsam dışı; gerekirse ayrı runbook).

## 3) Store: Table → Order → Payment (Overview)

**Observed components**

- Main screen: `StoreComponent` (`src/app/components/store/store.component.ts`)
- Selling screen: `SellingScreenComponent` (route `selling-screen/:type/:id`)
- Payment: `PaymentScreenComponent` (route `payment/:id`)

**Local data model hints (from code)**

- Store ekranı `checks`, `orders`, `receipts`, `tables` için PouchDB change feed ile live update alır (`src/app/components/store/store.component.ts`).

