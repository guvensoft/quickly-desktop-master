# Agent Operating Constitution (QuicklyPOS Desktop)

Bu repo, Codex ve diğer agent’ların **deterministik** ve **düşük maliyetli** şekilde doğru dosyalara inebilmesi için “önce indeks → sonra dosya” prensibiyle işletilir.

## 0) Altın Kurallar (Asla İhlal Etme)

1. **Önce kanıt topla, sonra değiştir**: Her değişiklik önerisi, ilgili dosyalardan alınmış kanıt (dosya yolu + kısa alıntı/özet) ile başlar.
2. **Önce indeks → sonra dosya**: İhtiyacın olan bağlamı önce `docs/knowledge/` çıktılarından ve `docs/repo-map.md`’den al; ardından minimum sayıda kaynak dosya oku.
3. **SSOT**: Yapısal bilgi tek yerde yaşar. Repo haritası → `docs/repo-map.md`, kararlar → `docs/decisions/`, indeks çıktıları → `docs/knowledge/`.
4. **Slice disiplini**: Slice kapanmadan yeni slice açılmaz (bkz. `tasks/templates/slice.md`).

## 1) Repo Sınırları

- Çalışma kökü: repo root (`quickly-desktop-master`). Üst dizine çıkma.
- Dokunma/özel dikkat:
  - `docs/knowledge/*.json`: Üretilmiş çıktılar; elle düzenleme yerine `node tools/indexer/index.js` çalıştır.
  - `dist/`, `app-builds/`, `node_modules/`: Üretilmiş/indirilen artefaktlar (varsa) — değişiklik yapma.

## 2) Dosya Okuma Bütçesi (Varsayılan)

- **Keşif (Discovery) bütçesi**: max **10 dosya** veya **800 satır**.
- Bütçe aşımı gerekiyorsa önce “neden”i yaz ve alternatiflerini belirt (indeks/graf vs.).

## 3) Zorunlu İş Akışı (Agent Flow)

1. `docs/repo-map.md` ile doğru alanı seç.
2. `docs/knowledge/` (components/services/modules/imports graph) ile hedef dosyaları daralt.
3. Gerekirse ilgili modül pack’ini oku: `docs/modules/<module>/README.md`.
4. Değişiklikten önce: “Etki alanı”, “risk”, “test/verify” ve “rollback” notu üret.

## 4) Slice Guardrails

- Slice başına:
  - max **12 dosya** değişikliği
  - max **400 satır** net değişiklik (ekleme+silme)
- Slice kapanış kriteri:
  - Acceptance criteria ✅
  - Doğrulama komutları çalıştı ✅ (veya neden çalışmadı)
  - Değişen dosyalar listelendi ✅

## 5) Build / Test / Verify (Mevcut Script’ler)

> Proje Angular 5 + Electron (legacy) ve webpack tabanlıdır.

- Install: `npm install`
- Lint: `npm run lint`
- Unit test: `npm test`
- Dev (Electron): `npm run start` veya `npm run electron:serve`
- Build (webpack + electron main compile): `npm run build`
- Prod build: `npm run build:prod`
- Paketleme: `npm run electron:mac` / `npm run electron:windows` / `npm run electron:linux`

## 6) Kod İstihbaratı (Indexer)

- Çalıştır: `node tools/indexer/index.js`
- Üretir:
  - `docs/knowledge/components.json`
  - `docs/knowledge/services.json`
  - `docs/knowledge/modules.json`
  - `docs/knowledge/imports-graph.json`

