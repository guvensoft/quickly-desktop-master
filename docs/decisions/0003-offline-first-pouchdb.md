# 0003: Offline-First Persistence with PouchDB

## Status

Accepted

## Context

Repo’da `MainService` içinde local PouchDB DB’leri ve remote/server bağlantısı görülür:

- Local DB’ler: `local_*` isimleri (`src/app/services/main.service.ts`)
- Conflict çözümü: `ConflictService` `ServerDB.resolveConflicts` (`src/app/services/conflict.service.ts`)

POS kullanım senaryosunda offline çalışabilme ve daha sonra sync ihtiyacı vardır.

## Decision

Kalıcı veri katmanı olarak PouchDB (document store) kullanılacak; remote/server tarafıyla sync/replication desteklenecek.

## Consequences

- Veri “schema”sı doküman seviyesindedir; migration stratejisi ayrıca ele alınmalıdır.
- Conflict handling ayrı bir sorumluluktur ve test edilmesi zordur.

## Links

- `src/app/services/main.service.ts`
- `src/app/services/conflict.service.ts`
- `docs/data/persistence.md`
- `docs/data/erd.md`

