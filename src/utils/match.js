// ── TOPLULUK ADI EŞLEŞTİRME ────────────────────────────────────
// İçe aktarılan satırdaki serbest metin "topluluk" adını CLUBS'taki
// gerçek kayda (id) eşler. Tam eşleşme yoksa normalize edilmiş
// içerme/benzerlik kontrolü yapılır.
export function normTr(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/topluluğu|toplulugu|topluluk/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

let clubMatchCache = null;
let cachedLength = 0;

function buildClubMatchCache(clubs) {
  clubMatchCache = clubs.map((c) => ({
    id: c.id,
    normName: normTr(c.name),
    normShort: normTr(c.short),
  }));
  cachedLength = clubs.length;
}

export function matchClubId(clubs, topluluk, etkinlikAdi) {
  if (!clubMatchCache || cachedLength !== clubs.length) buildClubMatchCache(clubs);
  const q = normTr(topluluk);
  if (q) {
    let hit = clubMatchCache.find((c) => c.normName === q || c.normShort === q);
    if (hit) return hit.id;
    hit = clubMatchCache
      .filter((c) => c.normShort.length >= 3 && (q.includes(c.normShort) || c.normShort.includes(q)))
      .sort((a, b) => b.normShort.length - a.normShort.length)[0];
    if (hit) return hit.id;
    hit = clubMatchCache
      .filter((c) => c.normName.length >= 4 && (q.includes(c.normName) || c.normName.includes(q)))
      .sort((a, b) => b.normName.length - a.normName.length)[0];
    if (hit) return hit.id;
  }
  if (etkinlikAdi) {
    const qa = normTr(etkinlikAdi);
    const hit = clubMatchCache
      .filter((c) => c.normName.length >= 5 && qa.includes(c.normName))
      .sort((a, b) => b.normName.length - a.normName.length)[0];
    if (hit) return hit.id;
  }
  return null;
}

export function escHtml(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
