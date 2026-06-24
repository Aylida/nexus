import { useRef } from 'react';
import ClubAvatar from './ClubAvatar';

export default function AdminBar({ clubs, photos, setClubPhoto, onAddClub, onDeleteClub }) {
  const fileInputs = useRef({});

  function triggerUpload(id) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const size = 80;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          const s = Math.min(img.width, img.height);
          const ox = (img.width - s) / 2;
          const oy = (img.height - s) / 2;
          ctx.drawImage(img, ox, oy, s, s, 0, 0, size, size);
          setClubPhoto(id, canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  return (
    <div id="admin-clubs-bar" className="visible">
      <div className="acb-head">
        <div className="acb-title">
          Topluluk yönetimi{' '}
          <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>
            — avatara tıklayarak fotoğraf yükle
          </span>
        </div>
        <button className="acb-add-btn" onClick={onAddClub}>+ Yeni topluluk</button>
      </div>
      <div className="clubs-admin-grid">
        {clubs.map((c) => (
          <div className="club-admin-row" key={c.id}>
            <div onClick={() => triggerUpload(c.id)} title="Fotoğraf yükle" style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
              <ClubAvatar club={c} photos={photos} size={26} radius={3} />
            </div>
            <span className="car-name">{c.name}</span>
            <button className="car-del" onClick={() => onDeleteClub(c)}>sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}
