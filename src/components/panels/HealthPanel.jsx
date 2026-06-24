import { CAT_LABEL, CAT_BG, CAT_COLORS } from '../../data/constants';
import ClubAvatar from '../ClubAvatar';

export default function HealthPanel({ clubs, photos, onOpenClub }) {
  const teknik = clubs.filter((c) => c.cat === 'teknik').length;
  const sanat = clubs.filter((c) => c.cat === 'sanat').length;
  const spor = clubs.filter((c) => c.cat === 'spor').length;
  const total = clubs.length;
  const sorted = [...clubs].sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  return (
    <div className="panel-content active" id="panel-saglik">
      <div className="metrics" id="health-metrics">
        <div className="metric"><div className="m-label">Sağlıklı</div><div className="m-num st-green">{teknik}</div></div>
        <div className="metric"><div className="m-label">Dikkat</div><div className="m-num st-amber">{sanat}</div></div>
        <div className="metric"><div className="m-label">Kritik</div><div className="m-num st-red">{spor}</div></div>
        <div className="metric gold"><div className="m-label">Topluluk sayısı</div><div className="m-num">{total}</div></div>
      </div>
      <div className="sec-head">
        <div className="sec-title">Tüm topluluklar — <span>{total} topluluk</span></div>
        <div className="sec-hint">Alfabetik</div>
      </div>
      <div className="health-grid">
        {sorted.map((c) => {
          const col = CAT_COLORS[c.cat], bg = CAT_BG[c.cat];
          return (
            <div className="hcard" style={{ cursor: 'pointer' }} key={c.id} onClick={() => onOpenClub(c.id)}>
              <ClubAvatar club={c} photos={photos} size={30} radius={3} />
              <div className="hcard-info">
                <div className="hcard-name">{c.name}</div>
                <div className="hbar-wrap">
                  <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 6, background: bg, color: col, fontWeight: 500, letterSpacing: '.03em' }}>
                    {CAT_LABEL[c.cat]}
                  </span>
                  {c.baskan && (
                    <span style={{ fontSize: 9, color: 'var(--muted)', marginLeft: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>
                      {c.baskan}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
