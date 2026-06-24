import { useState } from 'react';

export default function AddClubModal({ onConfirm, onCancel }) {
  const [name, setName] = useState('');
  const [short, setShort] = useState('');
  const [cat, setCat] = useState('teknik');
  const [uye, setUye] = useState('');
  const [score, setScore] = useState('');

  function handleSave() {
    if (!name.trim()) { onCancel(); return; }
    onConfirm({
      name,
      short: short.trim().toUpperCase() || name.slice(0, 5).toUpperCase(),
      cat,
      uye: parseInt(uye) || 20,
      score: parseInt(score) || 70,
    });
  }

  return (
    <div className="modal-overlay open" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <div className="modal-title">Yeni topluluk ekle</div>
        <div className="form-row"><label>İsim</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Topluluk adı" /></div>
        <div className="form-row"><label>Kısa ad</label><input value={short} onChange={(e) => setShort(e.target.value)} placeholder="KISA" style={{ textTransform: 'uppercase' }} /></div>
        <div className="form-row">
          <label>Kategori</label>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="teknik">Teknik</option>
            <option value="sanat">Sanat & Kültür</option>
            <option value="spor">Spor</option>
            <option value="sosyal">Sosyal & Gönüllü</option>
          </select>
        </div>
        <div className="form-row"><label>Üye sayısı</label><input type="number" min="1" max="500" value={uye} onChange={(e) => setUye(e.target.value)} placeholder="0" /></div>
        <div className="form-row"><label>Sağlık skoru (1–100)</label><input type="number" min="1" max="100" value={score} onChange={(e) => setScore(e.target.value)} placeholder="75" /></div>
        <div className="modal-btns">
          <button className="mbtn" onClick={onCancel}>İptal</button>
          <button className="mbtn primary" onClick={handleSave}>Ekle</button>
        </div>
      </div>
    </div>
  );
}
