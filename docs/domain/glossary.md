# Domain & Technical Glossary

## İş Terimleri (Domain)

- **Restaurant / Store**: POS’un bağlı olduğu işletme/şube.
- **Check**: Hesap/fiş (satışın ana agregası; ürünler/ödemeler buna bağlanır).
- **Order**: Mutfağa/servise giden sipariş kalemi veya sipariş seti.
- **Cashbox**: Kasa işlemleri ve kasa raporları.
- **End of Day (Gün Sonu)**: Gün kapanışı; backup, token refresh ve uzak tarafta “endday” işlemi.
- **Day Start (Gün Başlatma)**: “DayStatus.started” true olacak şekilde günün açılması (guard’ların store/reports akışlarını açar).
- **Menu / Product**: Ürün kataloğu.
- **Table / Floor**: Masa ve salon planı (varsa).
- **Printer**: Yazdırma aygıtı (fiş, mutfak çıktısı vb.).

## Teknik Terimler

- **Electron main process**: Node.js tarafı; pencere, OS entegrasyonu, IPC.
- **Renderer**: Angular UI tarafı; BrowserWindow içinde çalışır.
- **IPC**: Electron inter-process communication (renderer ↔ main).
- **PouchDB / CouchDB**: Offline-first local DB + remote replication modeli.
- **Token**: `Authorization` header için kullanılan erişim anahtarı (genelde `AccessToken` olarak saklanır).
- **DayStatus**: LocalStorage’da gün durumu (`started`, `day`, `time`) (`SettingsService.setLocalStorage()` ve `DayStarted` guard).

## Naming Kuralları (Repo İçin)

- Angular:
  - Component: `*.component.ts` / selector `app-*`
  - Service: `*.service.ts` (`@Injectable()`)
  - Guard: `*.guard.service.ts` (legacy pattern)
- Electron:
  - Main entry: `main.ts`
  - Main servisleri: `main/*.ts` (tek sorumluluk odaklı)
- Dokümanlar:
  - SSOT: `docs/repo-map.md`
  - Kararlar: `docs/decisions/ADR-*.md`
  - Üretilmiş indeks: `docs/knowledge/*.json`
