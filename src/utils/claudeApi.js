// Sunucu tarafındaki /api/claude proxy'sine istek atar.
// API key tarayıcıda hiç tutulmaz — Vercel ortam değişkeninde (ANTHROPIC_API_KEY) saklanır.
const API_URL = '/api/claude';

export function buildArsivContext(arsiv, clubs) {
  return arsiv
    .map((a) => {
      const club = clubs.find((c) => c.id === a.clubId);
      return `ID:${a.id} | ${a.yil} | ${a.tur} | ${a.kategori} | ${a.baslik} | ${club ? club.name : '?'} | ${a.tarih} | ${a.aciklama} | Yer:${a.yer || '—'} | Katılım:${a.katilim} | Ödül:${a.odul || '—'}`;
    })
    .join('\n');
}

export async function callClaude({ system, messages, maxTokens = 1500 }) {
  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, messages, max_tokens: maxTokens }),
    });
    const data = await resp.json();
    if (!resp.ok || data.error) {
      return { error: data.error?.message || data.error || 'Sunucu hatası' };
    }
    const fullText = (data.content || []).map((b) => b.text || '').join('');
    return { fullText };
  } catch (err) {
    return { error: err.message || 'Bağlantı hatası' };
  }
}

export const EVENTS_FIELD_PROMPT = `
Görevin: yüklenen belgeden etkinlik bilgilerini çıkarıp aşağıdaki JSON formatına dönüştürmek.
Sütun/alan adları farklı, eksik veya Türkçe/İngilizce karışık olabilir — bağlama göre yorumla.

Alan eşleştirme kuralları:
- d (gün, 1-31 arası sayı): "gün", "gun", "day", "tarih" vb. → sadece gün rakamını al. Tarih "15 Nisan" ise d=15.
- t (etkinlik adı, string): "etkinlik", "ad", "isim", "name", "başlık", "konu" vb.
- c (kategori, string): "teknik" | "sanat" | "spor" | "sosyal" — içeriğe göre tahmin et.
  Örnek: robotik→teknik, konser→sanat, futbol→spor, bağış→sosyal
- yil (yıl, sayı): "yıl", "year" vb. Yoksa 2026 kullan.
- yer (konum, string): "yer", "konum", "location", "mekan", "salon" vb. Yoksa "" kullan.

Yanıt formatı — SADECE bu JSON bloğunu yaz, başka hiçbir şey ekleme:
EVENTS_EKLE:[
  {"d":15,"t":"Etkinlik Adı","c":"teknik","yil":2026,"yer":"Konum"},
  ...
]

Hiç etkinlik bulamazsan: EVENTS_EKLE:[]
`;
