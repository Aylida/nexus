import { CAT_LABEL } from '../../data/constants';

export default function ArchiveDetailModal({ record, club, isAdmin, onClose, onDelete }) {
  if (!record) return null;
  const a = record;
  const turChip = a.tur === 'etkinlik' ? <span className="arsiv-chip etkinlik">Etkinlik</span> : <span className="arsiv-chip haber">Haber</span>;
  const katChip = <span className={`arsiv-chip ${a.kategori}`}>{CAT_LABEL[a.kategori] || a.kategori}</span>;

  return (
    <div className="modal-overlay open" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 520, maxWidth: '92vw', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
        <button className="dp-close" style={{ position: 'absolute', top: 12, right: 14 }} onClick={onClose}>✕</button>
        <div className="arsiv-detail-header">
          <div className="arsiv-detail-type">{turChip}{katChip}</div>
          <div className="arsiv-detail-title">{a.baslik}</div>
          <div className="arsiv-detail-club-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            {club ? club.name : 'Bilinmeyen topluluk'} · {a.tarih}
          </div>
        </div>
        <div className="arsiv-detail-section">
          <div className="arsiv-detail-label">Açıklama</div>
          <div className="arsiv-detail-value">{a.aciklama || '—'}</div>
        </div>
        {a.odul && (
          <div className="arsiv-detail-section">
            <div className="arsiv-detail-label">Sonuç / Ödül</div>
            <div className="arsiv-detail-value" style={{ color: 'var(--gold)', fontWeight: 500 }}>{a.odul}</div>
          </div>
        )}
        <div className="arsiv-detail-grid">
          <div className="arsiv-detail-stat"><div className="arsiv-detail-stat-num">{a.yil}</div><div className="arsiv-detail-stat-lbl">Yıl</div></div>
          {a.katilim > 0 && (
            <div className="arsiv-detail-stat"><div className="arsiv-detail-stat-num">{a.katilim}</div><div className="arsiv-detail-stat-lbl">Katılımcı</div></div>
          )}
          {a.yer && a.yer !== '—' && (
            <div className="arsiv-detail-stat" style={{ gridColumn: a.katilim > 0 ? '3' : '2/-1' }}>
              <div className="arsiv-detail-stat-num" style={{ fontSize: 13, fontWeight: 500 }}>{a.yer}</div>
              <div className="arsiv-detail-stat-lbl">Yer</div>
            </div>
          )}
        </div>
        {isAdmin && (
          <button className="mbtn danger" style={{ marginTop: 18, width: '100%' }} onClick={() => onDelete(a.id)}>Kaydı sil</button>
        )}
      </div>
    </div>
  );
}
