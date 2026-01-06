# Agent task başlatma

Bu repo’da agent işleri `tasks/ACTIVE_SLICE.md` üzerinden yürür ve pre-commit gate Evidence alanını zorunlu kılar.

## Slice başlatma

1) Bir template seç:

- `npm run slice:question -- "Soru başlığı"`
- `npm run slice:feature -- "Feature başlığı"`
- `npm run slice:bugfix -- "Bugfix başlığı"`
- `npm run slice:upgrade -- "Upgrade başlığı"`

2) `tasks/ACTIVE_SLICE.md` içindeki yönergeleri takip et:

- Plan → Patch → Verify → Docs → Evidence
- `AGENTS.md` read order zorunludur.

Notlar:
- `tasks/ACTIVE_SLICE.md` zaten varsa script overwrite etmez (idempotent). Overwrite için: `node tools/agent/run-slice.js <template> "<title>" --force`

## Evidence nasıl yazılır?

Evidence, “ne yaptım?” değil; “kanıt ne?” sorusuna cevap verir. Tercih edilen kanıtlar:

- Komut çıktısı (kısa özet + exit code)
- Dosya yolu + neyin değiştiğinin kısa özeti
- Log snippet (hata/stack trace) veya ekran görüntüsü notu

Örnekler:

- `tasks/ACTIVE_SLICE.md` → Evidence:
  - `npm run docs:verify` (PASS) — docs gate
  - `npm run test:compile` (PASS) — TS compile sanity
  - Değişiklik: `tools/agent/run-slice.js` — template tabanlı slice oluşturma eklendi

## Tamamlamadan önce

Minimum repo doğrulaması:

- `npm run docs:verify`
- `npm run test:compile`

Değişiklik türüne göre ek olarak:

- `npm run build`
- `npm run test` (çalışıyorsa)

