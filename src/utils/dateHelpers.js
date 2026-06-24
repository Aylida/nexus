export function guessCategory(text) {
  const s = (text || '').toLowerCase();
  if (
    /robot|yazılım|yazilim|bilgisayar|mühendis|muhendis|teknik|kodlama|hackathon|yapay zeka|ai\b|elektrik|elektronik|makine|siber|kuantum|fotonik|optik|fizik|kimya/.test(
      s
    )
  )
    return 'teknik';
  if (/müzik|muzik|konser|tiyatro|dans|resim|sergi|sanat|fotoğraf|fotograf|edebiyat|şiir|siir|sinema|illüstrasyon/.test(s))
    return 'sanat';
  if (/spor|futbol|basketbol|voleybol|yüzme|yuzme|koşu|kosu|turnuva|atletizm|fitness|bisiklet|doğa|kamp|tırmanma/.test(s))
    return 'spor';
  return 'sosyal';
}

export const AY_MAP = {
  ocak: 1, şubat: 2, subat: 2, mart: 3, nisan: 4, mayıs: 5, mayis: 5,
  haziran: 6, temmuz: 7, ağustos: 8, agustos: 8, eylül: 9, eylul: 9,
  ekim: 10, kasım: 11, kasim: 11, aralık: 12, aralik: 12,
};

export function parseDateStr(s) {
  if (!s) return null;
  s = String(s).trim();
  let m = s.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
  if (m) return { d: +m[1], mo: +m[2], y: +m[3] };
  m = s.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2})/);
  if (m) return { d: +m[1], mo: +m[2], y: 2000 + +m[3] };
  return null;
}
