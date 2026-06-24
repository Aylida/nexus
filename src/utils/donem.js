// ── DÖNEM HESAPLAMA ────────────────────────────────────────────
// Güz dönemi: Eylül(9) - Ocak(1)  |  Bahar dönemi: Şubat(2) - Haziran(6)
// Temmuz-Ağustos: dönem dışı (tatil), en yakın döneme dahil edilmez.
export function donemOf(ay, yil) {
  if (!ay) return null;
  if (ay >= 9 && ay <= 12) return { key: `guz-${yil}-${yil + 1}`, label: `Güz ${yil}-${yil + 1}` };
  if (ay === 1) return { key: `guz-${yil - 1}-${yil}`, label: `Güz ${yil - 1}-${yil}` };
  if (ay >= 2 && ay <= 6) return { key: `bahar-${yil}`, label: `Bahar ${yil}` };
  return null; // Temmuz/Ağustos — dönem dışı
}

// Şu anki akademik dönemi döndürür (sistem tarihine göre)
export function currentDonem() {
  const now = new Date();
  const ay = now.getMonth() + 1;
  const yil = now.getFullYear();
  const d = donemOf(ay, yil);
  if (d) return d;
  // Temmuz/Ağustos'taysak en yakın geçmiş dönem (Bahar) gösterilir
  return { key: `bahar-${yil}`, label: `Bahar ${yil}` };
}

// Bir topluluğun güncel dönemdeki etkinlik sayısını EVENTS'ten hesaplar
export function etkinlikSayisiDonem(events, clubId, donemKey) {
  const key = donemKey || currentDonem().key;
  return events.filter((e) => e.clubId === clubId && e.donem === key).length;
}
