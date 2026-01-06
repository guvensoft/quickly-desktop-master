# C4: System Context

```mermaid
flowchart LR
  user_cashier[Cashier / Staff]
  user_admin[Admin / Manager]

  subgraph system[QuicklyPOS Desktop]
    app[Desktop App\n(Electron + Angular)]
  end

  hq[Quickly HQ\n(hq.quickly.com.tr)]
  remote_db[(CouchDB/PouchDB-compatible DB)]
  peripherals[Peripherals\n(Printer / Scaler / CallerID)]

  user_cashier --> app
  user_admin --> app

  app <--> hq
  app <--> remote_db
  app <--> peripherals
```

## Notes (from repo)

- UI (renderer) Angular tarafında çalışır: `src/`.
- OS/driver entegrasyonları Electron main tarafındadır: `main/` ve `main.ts`.
- Remote servis çağrıları `https://hq.quickly.com.tr` base URL’i ile yapılır: `src/app/services/http.service.ts`.
- Local data layer PouchDB tabanlıdır: `src/app/services/main.service.ts`.

