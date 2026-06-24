export default function StatsPanel({ clubs }) {
  const teknik = clubs.filter((c) => c.cat === 'teknik').length;
  const sanat = clubs.filter((c) => c.cat === 'sanat').length;
  const spor = clubs.filter((c) => c.cat === 'spor').length;
  const sosyal = clubs.filter((c) => c.cat === 'sosyal').length;
  const totalUye = clubs.reduce((s, c) => s + (c.uye || 0), 0);

  return (
    <div className="panel-content active" id="panel-istatistik">
      <div className="metrics">
        <div className="metric gold"><div className="m-label">Toplam topluluk</div><div className="m-num">{clubs.length}<sub>aktif</sub></div></div>
        <div className="metric blue"><div className="m-label">Toplam üye</div><div className="m-num">{(totalUye / 1000).toFixed(1)}<sub>k öğrenci</sub></div></div>
        <div className="metric"><div className="m-label">Teknik topluluk</div><div className="m-num">{teknik}<sub>adet</sub></div></div>
        <div className="metric"><div className="m-label">Sosyal topluluk</div><div className="m-num">{sosyal}<sub>adet</sub></div></div>
      </div>
      <div className="sec-head" style={{ marginBottom: 14 }}><div className="sec-title">Kategori dağılımı</div></div>
      <div className="cat-grid">
        <div className="cat-card"><div className="cat-num" style={{ color: 'var(--blue)' }}>{teknik}</div><div className="cat-lbl" style={{ color: 'var(--blue)' }}>Teknik</div><div className="cat-sub">ACM, Blockchain, Siber Güv…</div></div>
        <div className="cat-card"><div className="cat-num" style={{ color: 'var(--red)' }}>{sanat}</div><div className="cat-lbl" style={{ color: 'var(--red)' }}>Sanat & Kültür</div><div className="cat-sub">Tiyatro, Müzik, Koro…</div></div>
        <div className="cat-card"><div className="cat-num" style={{ color: 'var(--green)' }}>{spor}</div><div className="cat-lbl" style={{ color: 'var(--green)' }}>Spor</div><div className="cat-sub">Futbol, Voleybol, Ragbi…</div></div>
        <div className="cat-card"><div className="cat-num" style={{ color: 'var(--amber)' }}>{sosyal}</div><div className="cat-lbl" style={{ color: 'var(--amber)' }}>Sosyal & Gönüllü</div><div className="cat-sub">Kızılay, Çevre, Kan Bağışı…</div></div>
      </div>
    </div>
  );
}
