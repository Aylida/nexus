// Tüm kategori ve durum renkleri tek lacivert tonunda — sadece etiket metniyle ayrışır
export const CAT_COLORS = { teknik: '#103064', sanat: '#103064', spor: '#103064', sosyal: '#103064' };
export const CAT_BG = { teknik: '#E8F0FA', sanat: '#E8F0FA', spor: '#E8F0FA', sosyal: '#E8F0FA' };
export const CAT_LABEL = { teknik: 'Teknik', sanat: 'Sanat & Kültür', spor: 'Spor', sosyal: 'Sosyal & Gönüllü' };

export const ST_COLORS = { ok: '#103064', warn: '#103064', bad: '#103064' };
export const ST_LABELS = { ok: 'Sağlıklı', warn: 'Dikkat', bad: 'Kritik' };

export const PASSWORD = 'nexus2026';

export const AY_ADI = ['', 'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
export const AY_AD_FULL = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export function getStatus(score) {
  return score >= 70 ? 'ok' : score >= 50 ? 'warn' : 'bad';
}
