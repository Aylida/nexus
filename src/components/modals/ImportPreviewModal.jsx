import { AY_AD_FULL } from '../../data/constants';
import { matchClubId } from '../../utils/match';

const CL = { teknik: 'var(--blue)', sanat: 'var(--red)', spor: 'var(--green)', sosyal: 'var(--amber)' };
const CB = { teknik: 'var(--blue-bg)', sanat: 'var(--red-bg)', spor: 'var(--green-bg)', sosyal: 'var(--amber-bg)' };
const CN = { teknik: 'Teknik', sanat: 'Sanat', spor: 'Spor', sosyal: 'Sosyal' };

export default function ImportPreviewModal({ rows, fileName, clubs, onConfirm, onCancel }) {
  if (!rows) return null;

  const enriched = rows.map((r) => ({ ...r, clubId: matchClubId(clubs, r.topluluk, r.t) }));

  return (
    <div className="modal-overlay open" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ width: 'min(900px, 92vw)', maxHeight: '82vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
            Önizleme <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11 }}>— {fileName}</span>
          </span>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '14px 18px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--line2)' }}>
                {['Etkinlik Adı', 'Tarih', 'Ay', 'Yıl', 'Yer / Konum', 'Topluluk (dosyada)', 'Eşleşen topluluk', 'Kategori'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 9, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enriched.map((r, i) => {
                const matchedClub = r.clubId ? clubs.find((c) => c.id === r.clubId) : null;
                const cat = r.c || 'sosyal';
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '7px 8px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.t}>{r.t}</td>
                    <td style={{ padding: '7px 8px', whiteSpace: 'nowrap' }}>{r.tarihStr || r.d}</td>
                    <td style={{ padding: '7px 8px', whiteSpace: 'nowrap' }}>{r.ay ? AY_AD_FULL[r.ay] : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td style={{ padding: '7px 8px' }}>{r.yil || 2026}</td>
                    <td style={{ padding: '7px 8px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.yer || ''}>{r.yer || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td style={{ padding: '7px 8px', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.topluluk || ''}>{r.topluluk || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td style={{ padding: '7px 8px', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {matchedClub ? <span style={{ color: 'var(--green)' }}>{matchedClub.short}</span> : <span style={{ color: 'var(--red)' }}>eşleşmedi</span>}
                    </td>
                    <td style={{ padding: '7px 8px' }}>
                      <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 7, fontWeight: 500, background: CB[cat], color: CL[cat] }}>{CN[cat]}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{enriched.length} etkinlik</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="mbtn" onClick={onCancel}>İptal</button>
            <button className="mbtn primary" onClick={() => onConfirm(enriched)}>Takvime Ekle ({enriched.length})</button>
          </div>
        </div>
      </div>
    </div>
  );
}
