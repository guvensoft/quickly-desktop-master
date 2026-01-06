# Data Persistence Overview

## Summary (from code)

- Uygulama, UI tarafında (Angular renderer) PouchDB kullanır: `src/app/services/main.service.ts`.
- Local DB isimleri `local_*` prefix’i ile birden fazla “logical DB” olarak tutulur (örn. `local_checks`, `local_orders`, `local_settings`).
- Remote/Server bağlantısı, ayarlardan okunan bilgilerle kurulabilir:
  - AuthInfo’dan: `hostname + db_prefix` (`src/app/services/main.service.ts`)
  - ServerSettings’ten: `http://<ip>:<port>/<key>/appServer` (`src/app/services/main.service.ts`)
- Conflict çözümü için `ConflictService` `ServerDB.resolveConflicts` kullanır: `src/app/services/conflict.service.ts`.

## Assumptions / TODO (needs confirmation)

- Local DB adapter olarak `memory` kullanımı (PouchDB adapter) prod ortamında kalıcılık sağlar mı? (Şu an `db_opts.adapter='memory'` görülüyor; “disk persistence” beklentisi varsa doğrulanmalı.)
- Remote DB’nin CouchDB/PouchDB uyumlu olduğu varsayılır; sync/repl stratejisi (push/pull, checkpointing) dokümante edilmelidir.

