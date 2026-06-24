import { useState, useMemo } from 'react';
import { CAT_LABEL } from '../../data/constants';
import ArchiveDetailModal from '../modals/ArchiveDetailModal';
import AddArchiveModal from '../modals/AddArchiveModal';

export default function ArchivePanel({ clubs, arsiv, addArsivRecord, deleteArsivRecord, isAdmin }) {
  const [search, setSearch] = useState('');
  const [yilFilter, setYilFilter] = useState('');
  const [topFilter, setTopFilter] = useState('');
  const [turFilter, setTurFilter] = useState('');
  const [katFilter, setKatFilter] = useState('');
  const [detailId, setDetailId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const yilSet = useMemo(() => [...new Set(arsiv.map((a) => a.yil))].sort((a, b) => b - a), [arsiv]);
  const etkinlikCount = arsiv.filter((a) => a.tur === 'etkinlik').length;
  const haberCount = arsiv.filter((a) => a.tur === 'haber').length;
  const yilMin = yilSet.length ? Math.min(...yilSet) : '—';
  const yilMax = yilSet.length ? Math.max(...yilSet) : '—';

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return arsiv
      .filter((a) => {
        if (yilFilter && a.yil != yilFilter) return false;
        if (topFilter && a.clubId != topFilter) return false;
        if (turFilter && a.tur !== turFilter) return false;
        if (katFilter && a.kategori !== katFilter) return false;
        if (q) {
          const club = clubs.find((c) => c.id === a.clubId);
          const hay = (a.baslik + ' ' + (a.aciklama || '') + ' ' + (club ? club.name : '') + ' ' + (a.yer || '')).toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.yil - a.yil || b.id - a.id);
  }, [arsiv, search, yilFilter, topFilter, turFilter, katFilter, clubs]);

  const detail = detailId ? arsiv.find((a) => a.id === detailId) : null;
  const detailClub = detail ? clubs.find((c) => c.id === detail.clubId) : null;

  return (
    <div className="panel-content active" id="panel-arsiv">
      <div className="metrics" style={{ marginBottom: 20 }}>
        <div className="metric gold"><div className="m-label">Toplam kayıt</div><div className="m-num">{arsiv.length}</div></div>
        <div className="metric blue"><div className="m-label">Etkinlik</div><div className="m-num">{etkinlikCount}</div></div>
        <div className="metric"><div className="m-label">Haber</div><div className="m-num">{haberCount}</div></div>
        <div className="metric"><div className="m-label">Yıl aralığı</div><div className="m-num">{yilMin}<sub>– {yilMax}</sub></div></div>
      </div>

      <div className="arsiv-toolbar">
        <div className="arsiv-search-wrap">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input className="arsiv-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Etkinlik veya haber ara…" />
        </div>
        <select className="arsiv-select" value={yilFilter} onChange={(e) => setYilFilter(e.target.value)}>
          <option value="">Tüm yıllar</option>
          {yilSet.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="arsiv-select" value={topFilter} onChange={(e) => setTopFilter(e.target.value)}>
          <option value="">Tüm topluluklar</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="arsiv-select" value={turFilter} onChange={(e) => setTurFilter(e.target.value)}>
          <option value="">Tür: Tümü</option>
          <option value="etkinlik">Etkinlik</option>
          <option value="haber">Haber</option>
        </select>
        <select className="arsiv-select" value={katFilter} onChange={(e) => setKatFilter(e.target.value)}>
          <option value="">Kategori: Tümü</option>
          <option value="teknik">Teknik</option>
          <option value="sanat">Sanat & Kültür</option>
          <option value="spor">Spor</option>
          <option value="sosyal">Sosyal & Gönüllü</option>
        </select>
        <span className="arsiv-count">{filtered.length} sonuç</span>
        {isAdmin && (
          <button className="mbtn primary" style={{ fontSize: 11, padding: '7px 14px' }} onClick={() => setShowAdd(true)}>+ Kayıt ekle</button>
        )}
      </div>

      <div className="arsiv-grid">
        {filtered.length === 0 ? (
          <div className="arsiv-empty" style={{ gridColumn: '1/-1' }}>
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            Aramanızla eşleşen kayıt bulunamadı.
          </div>
        ) : (
          filtered.map((a) => {
            const club = clubs.find((c) => c.id === a.clubId);
            return (
              <div className={`arsiv-card ${a.kategori}`} key={a.id} onClick={() => setDetailId(a.id)}>
                <div className="arsiv-card-top">
                  <div className="arsiv-card-meta">
                    {a.tur === 'etkinlik' ? <span className="arsiv-chip etkinlik">Etkinlik</span> : <span className="arsiv-chip haber">Haber</span>}
                    <span className={`arsiv-chip ${a.kategori}`}>{CAT_LABEL[a.kategori] || a.kategori}</span>
                  </div>
                  <span className="arsiv-year">{a.yil}</span>
                </div>
                <div className="arsiv-card-title">{a.baslik}</div>
                <div className="arsiv-card-club">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  {club ? club.name : '—'}
                </div>
                <div className="arsiv-card-desc">{a.aciklama || ''}</div>
                <div className="arsiv-card-footer">
                  <span className="arsiv-card-date">📅 {a.tarih}{a.yer ? ' · ' + a.yer : ''}</span>
                  {a.odul ? (
                    <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 500 }}>{a.odul}</span>
                  ) : (
                    <span className="arsiv-card-katilim">{a.katilim > 0 ? `${a.katilim} katılımcı` : ''}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <ArchiveDetailModal
        record={detail}
        club={detailClub}
        isAdmin={isAdmin}
        onClose={() => setDetailId(null)}
        onDelete={(id) => { deleteArsivRecord(id); setDetailId(null); }}
      />

      {showAdd && (
        <AddArchiveModal
          clubs={clubs}
          onCancel={() => setShowAdd(false)}
          onConfirm={(rec) => { addArsivRecord(rec); setShowAdd(false); }}
        />
      )}
    </div>
  );
}
