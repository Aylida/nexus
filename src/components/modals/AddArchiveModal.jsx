import { useState } from 'react';

export default function AddArchiveModal({ clubs, onConfirm, onCancel }) {
  const [baslik, setBaslik] = useState('');
  const [tur, setTur] = useState('etkinlik');
  const [clubId, setClubId] = useState(clubs[0]?.id || '');
  const [tarih, setTarih] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [yer, setYer] = useState('');
  const [katilim, setKatilim] = useState('');
  const [odul, setOdul] = useState('');

  function handleSave() {
    if (!baslik || !tarih) { onCancel(); return; }
    const yil = parseInt(tarih.split('.')[2]) || new Date().getFullYear();
    const club = clubs.find((c) => c.id === parseInt(clubId));
    onConfirm({
      baslik, tur, clubId: parseInt(clubId), kategori: club ? club.cat : 'sosyal',
      tarih, yil, aciklama, yer, katilim: parseInt(katilim) || 0, odul,
    });
  }

  return (
    <div className="modal-overlay open" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ width: 440, maxWidth: '92vw' }}>
        <div className="modal-title">Arşive kayıt ekle</div>
        <div className="form-row"><label>Başlık</label><input value={baslik} onChange={(e) => setBaslik(e.target.value)} placeholder="Etkinlik veya haber başlığı" /></div>
        <div className="form-row">
          <label>Tür</label>
          <select value={tur} onChange={(e) => setTur(e.target.value)}>
            <option value="etkinlik">Etkinlik</option>
            <option value="haber">Haber</option>
          </select>
        </div>
        <div className="form-row">
          <label>Topluluk</label>
          <select value={clubId} onChange={(e) => setClubId(e.target.value)}>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-row"><label>Tarih (GG.AA.YYYY)</label><input value={tarih} onChange={(e) => setTarih(e.target.value)} placeholder="15.03.2024" maxLength={10} /></div>
        <div className="form-row"><label>Açıklama</label><input value={aciklama} onChange={(e) => setAciklama(e.target.value)} placeholder="Kısa açıklama…" /></div>
        <div className="form-row"><label>Yer / Konum</label><input value={yer} onChange={(e) => setYer(e.target.value)} placeholder="Ör: Merkez Amfi, B Blok 201…" /></div>
        <div className="form-row"><label>Katılımcı sayısı</label><input type="number" min="0" value={katilim} onChange={(e) => setKatilim(e.target.value)} placeholder="0" /></div>
        <div className="form-row"><label>Sonuç / Ödül (isteğe bağlı)</label><input value={odul} onChange={(e) => setOdul(e.target.value)} placeholder="Ör: 1. ödül, Gümüş madalya…" /></div>
        <div className="modal-btns">
          <button className="mbtn" onClick={onCancel}>İptal</button>
          <button className="mbtn primary" onClick={handleSave}>Ekle</button>
        </div>
      </div>
    </div>
  );
}
