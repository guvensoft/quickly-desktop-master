# C4: Containers

```mermaid
flowchart TB
  subgraph desktop[User Machine]
    subgraph electron[Electron App]
      main[Electron Main Process\n(Node.js runtime)]
      renderer[Angular Renderer\n(BrowserWindow)]
    end
    localdb[(Local PouchDB\n(in renderer))]
  end

  hq[Quickly HQ\nhttps://hq.quickly.com.tr]
  serverdb[(Server/Remote DB\n(CouchDB/PouchDB-compatible))]
  appserver[Local App Server\nExpress + express-pouchdb\n(main/appServer.ts)]
  devices[Peripherals\n(ESC/POS printer, scaler, callerID)]

  renderer <--> hq
  renderer <--> localdb
  renderer <--> main

  main <--> devices
  main --> appserver
  renderer <--> appserver
  renderer <--> serverdb
```

## Notes (from repo)

- Main entry: `main.ts` (`BrowserWindow` lifecycle + main service imports).
- Renderer entry: `src/main.ts` (Angular bootstrap).
- Local app server: `main/appServer.ts` (in-memory PouchDB via `express-pouchdb`).
- Persistence + replication state: `src/app/services/main.service.ts`, conflict: `src/app/services/conflict.service.ts`.

