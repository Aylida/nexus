import { useState } from 'react';
import { CAT_LABEL, CAT_BG, CAT_COLORS } from '../../data/constants';
import ClubAvatar from '../ClubAvatar';

export function ClubDetailModal({ club, photos, onClose, onEdit }) {
  if (!club) return null;
  const c = club;
  const rows = [
    ['Başkan', c.baskan || '—'],
    ['Danışman', c.danisman || '—'],
    ['Danışman mail', c.danismanMail || '—'],
    ['Kuruluş yılı', c.kurulusYili || '—'],
    ['Bağlı fakülte', c.fakulte || '—'],
    ['Kaçıncı başkan', c.kacinciBaskan ? `${c.kacinciBaskan}. başkan` : '—'],
  ];
  return (
    <div className="modal-overlay open" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 380 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <ClubAvatar club={c} photos={photos} size={40} radius={4} />
          <div>
            <div className="modal-title" style={{ marginBottom: 2 }}>{c.name}</div>
            <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, display: 'inline-block', background: CAT_BG[c.cat], color: CAT_COLORS[c.cat] }}>
              {CAT_LABEL[c.cat]}
            </div>
          </div>
        </div>
        <div>
          {rows.map(([l, v]) => (
            <div className="club-detail-row" key={l}>
              <span className="club-detail-lbl">{l}</span>
              <span className="club-detail-val">{v}</span>
            </div>
          ))}
        </div>
        <div className="modal-btns" style={{ marginTop: 14 }}>
          <button className="mbtn" onClick={onClose}>Kapat</button>
          <button className="mbtn primary" onClick={onEdit}>Düzenle</button>
        </div>
      </div>
    </div>
  );
}

export function EditClubInfoModal({ club, onConfirm, onCancel }) {
  const [kurulusYili, setKurulusYili] = useState(club?.kurulusYili || '');
  const [fakulte, setFakulte] = useState(club?.fakulte || '');
  const [kacinciBaskan, setKacinciBaskan] = useState(club?.kacinciBaskan || '');
  const [baskan, setBaskan] = useState(club?.baskan || '');
  const [danisman, setDanisman] = useState(club?.danisman || '');

  if (!club) return null;

  function handleSave() {
    onConfirm(club.id, {
      kurulusYili: parseInt(kurulusYili) || club.kurulusYili || null,
      fakulte: fakulte.trim() || club.fakulte || '',
      kacinciBaskan: parseInt(kacinciBaskan) || club.kacinciBaskan || null,
      baskan: baskan.trim() || club.baskan || '',
      danisman: danisman.trim() || club.danisman || '',
    });
  }

  return (
    <div className="modal-overlay open" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ width: 380 }}>
        <div className="modal-title">Topluluk bilgilerini düzenle</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14 }}>{club.name}</div>
        <div className="form-row"><label>Kuruluş yılı</label><input type="number" min="1990" max="2030" value={kurulusYili} onChange={(e) => setKurulusYili(e.target.value)} placeholder="2018" /></div>
        <div className="form-row"><label>Bağlı fakülte</label><input value={fakulte} onChange={(e) => setFakulte(e.target.value)} placeholder="Mühendislik Fakültesi" /></div>
        <div className="form-row"><label>Kaçıncı başkan</label><input type="number" min="1" max="50" value={kacinciBaskan} onChange={(e) => setKacinciBaskan(e.target.value)} placeholder="3" /></div>
        <div className="form-row"><label>Başkan adı</label><input value={baskan} onChange={(e) => setBaskan(e.target.value)} placeholder="Ad Soyad" /></div>
        <div className="form-row"><label>Danışman</label><input value={danisman} onChange={(e) => setDanisman(e.target.value)} placeholder="Prof. Dr. Ad Soyad" /></div>
        <div className="modal-btns">
          <button className="mbtn" onClick={onCancel}>İptal</button>
          <button className="mbtn primary" onClick={handleSave}>Kaydet</button>
        </div>
      </div>
    </div>
  );
}
