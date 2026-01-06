# C4: Components (High-Level)

Bu seviyede “component” kelimesi C4 anlamındadır (Angular component değil). Amaç: ana sorumlulukları ve sınırları hızlı göstermek.

```mermaid
flowchart LR
  subgraph renderer[Angular Renderer]
    routes[Routes + Guards\nsrc/app/app-routing.module.ts\nsrc/app/guards/*]
    auth[Auth Service\nsrc/app/services/auth.service.ts]
    settings[Settings\nSettingsService + settings DB\nsrc/app/services/settings.service.ts\nsrc/app/services/main.service.ts]
    store[Store/Selling/Payment Screens\nsrc/app/components/store/*]
    eod[End of Day\nsrc/app/components/endoftheday/*]
    reports[Reports\nsrc/app/components/reports/*]
    http[HTTP Client Wrapper\nsrc/app/services/http.service.ts]
    data[Local/Remote DB Layer\nMainService + ConflictService\nsrc/app/services/main.service.ts\nsrc/app/services/conflict.service.ts]
    bridge[Electron Bridge\nsrc/app/providers/electron.service.ts]
  end

  subgraph mainproc[Electron Main Process]
    ipcPrinter[Printer IPC\nmain/ipcPrinter.ts]
    appServer[App Server\nmain/appServer.ts]
    caller[Caller Server\nmain/callerServer.ts]
    scaler[Scaler Server\nmain/scalerServer.ts]
  end

  routes --> store
  routes --> eod
  routes --> reports
  routes --> settings

  store --> data
  eod --> http
  settings --> data
  auth --> http

  bridge <--> ipcPrinter
  bridge <--> caller
  bridge <--> scaler
  bridge <--> appServer
```

## Notes / TODO (needs confirmation)

- Renderer ↔ main IPC kanalları, `src/app/providers/electron.service.ts` ve `main/*` içinde kullanılan `ipcMain.on(...)` event isimleri üzerinden dokümante edilmelidir.

