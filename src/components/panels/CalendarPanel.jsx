import { useState, useMemo, useRef } from 'react';
import { AY_ADI } from '../../data/constants';
import { escHtml } from '../../utils/match';
import { handleImportFile } from '../../utils/importHelpers';
import ImportPreviewModal from '../modals/ImportPreviewModal';
import ColumnMapperModal from '../modals/ColumnMapperModal';
import { donemOf } from '../../utils/donem';
import { matchClubId } from '../../utils/match';

export default function CalendarPanel({ clubs, events, addEvents, isAdmin, notify }) {
  const [view, setView] = useState('list'); // 'list' | 'cal'
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [clashOnly, setClashOnly] = useState(false);
  const [perPage, setPerPage] = useState(50);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: 'd', dir: 1 });
  const [importStatus, setImportStatus] = useState('');
  const [pendingPreview, setPendingPreview] = useState(null); // {rows, fileName}
  const [pendingMapper, setPendingMapper] = useState(null); // {rawHeader, rows, headerIdx, fileName}
  const fileInputRef = useRef(null);

  const clashes = events.filter((e) => e.cl);

  const filtered = useMemo(() => {
    let f = events.filter((e) => {
      if (catFilter && e.c !== catFilter) return false;
      if (clashOnly && !e.cl) return false;
      if (search && !e.t.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    f = [...f].sort((a, b) => {
      let va = a[sort.key], vb = b[sort.key];
      if (typeof va === 'string') return va.localeCompare(vb, 'tr') * sort.dir;
      return ((va || 0) - (vb || 0)) * sort.dir;
    });
    return f;
  }, [events, catFilter, clashOnly, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const curPage = Math.min(page, totalPages);
  const start = (curPage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  function sortBy(key) {
    setSort((prev) => (prev.key === key ? { key, dir: -prev.dir } : { key, dir: 1 }));
    setPage(1);
  }

  async function onFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setImportStatus(`"${file.name}" okunuyor…`);
    notify(`"${file.name}" okunuyor…`, 'info');
    try {
      const result = await handleImportFile(file);
      if (result.error) {
        setImportStatus(result.error);
        notify(result.error, 'error');
        return;
      }
      if (result.needsMapping) {
        setPendingMapper({ ...result, fileName: file.name });
        return;
      }
      if (!result.events || result.events.length === 0) {
        notify('⚠ Dosyada etkinlik bulunamadı.', 'error');
        return;
      }
      setPendingPreview({ rows: result.events, fileName: file.name });
    } catch (err) {
      notify('⚠ Dosya okunamadı: ' + err.message, 'error');
    }
  }

  function confirmMapper(colMap) {
    const { rows, headerIdx, fileName } = pendingMapper;
    setPendingMapper(null);
    // Basit satır->etkinlik dönüşümü (importHelpers.rowsToEventList mantığı tekrar kullanılmıyor burada
    // çünkü export edilmemişti — basit fallback)
    const out = [];
    const nowYear = new Date().getFullYear();
    for (let ri = headerIdx + 1; ri < rows.length; ri++) {
      const row = rows[ri];
      if (row.every((c) => String(c).trim() === '')) continue;
      const name = colMap.ad >= 0 ? String(row[colMap.ad] || '').trim() : '';
      if (!name) continue;
      out.push({ d: 1, t: name, c: 'sosyal', yil: nowYear, ay: null, yer: colMap.yer >= 0 ? String(row[colMap.yer] || '') : '', topluluk: colMap.topluluk >= 0 ? String(row[colMap.topluluk] || '') : '', tarihStr: '' });
    }
    setPendingPreview({ rows: out, fileName });
  }

  function confirmImport(rows) {
    setPendingPreview(null);
    const withDonem = rows.map((ev) => {
      const dn = donemOf(ev.ay, ev.yil || new Date().getFullYear());
      return { ...ev, clubId: ev.clubId ?? matchClubId(clubs, ev.topluluk, ev.t), donem: dn ? dn.key : null, donemLabel: dn ? dn.label : null };
    });
    addEvents(withDonem);
    const matched = withDonem.filter((r) => r.clubId).length;
    notify(`✅ ${rows.length} etkinlik takvime eklendi. (${matched}/${rows.length} topluluğa eşleşti)`, 'success');
  }

  return (
    <div className="panel-content active" id="panel-takvim">
      <div className="metrics">
        <div className="metric gold"><div className="m-label">Toplam etkinlik</div><div className="m-num">{events.length}</div></div>
        <div className="metric blue"><div className="m-label">Çakışma</div><div className="m-num">{clashes.length}<sub>uyarı</sub></div></div>
        <div className="metric"><div className="m-label">Katılan topluluk</div><div className="m-num">{new Set(events.map((e) => e.clubId).filter(Boolean)).size}</div></div>
        <div className="metric"><div className="m-label">Kategori sayısı</div><div className="m-num">{new Set(events.map((e) => e.c)).size}</div></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="sec-title">Etkinlikler</div>
        <button className="tvt-small-btn" onClick={() => setView((v) => (v === 'list' ? 'cal' : 'list'))}>
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          <span>{view === 'list' ? 'Takvim' : 'Listeye dön'}</span>
        </button>
      </div>

      {view === 'list' && (
        <>
          <div className="ev-list-toolbar">
            <div className="ev-list-search-wrap">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input className="ev-list-search" placeholder="Etkinlik ara…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="ev-list-select" value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}>
              <option value="">Tüm kategoriler</option>
              <option value="teknik">Teknik</option>
              <option value="sanat">Sanat & Kültür</option>
              <option value="spor">Spor</option>
              <option value="sosyal">Sosyal & Gönüllü</option>
            </select>
            <select className="ev-list-select" value={clashOnly ? 'clash' : ''} onChange={(e) => { setClashOnly(e.target.value === 'clash'); setPage(1); }}>
              <option value="">Tümü</option>
              <option value="clash">Sadece çakışanlar</option>
            </select>
            <select className="ev-list-select" value={perPage} onChange={(e) => { setPerPage(parseInt(e.target.value)); setPage(1); }}>
              <option value="25">25 / sayfa</option>
              <option value="50">50 / sayfa</option>
              <option value="100">100 / sayfa</option>
            </select>
            <span className="ev-list-count">{filtered.length} etkinlik</span>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.docx,.doc,.csv" style={{ display: 'none' }} onChange={onFileSelected} />
            <button
              onClick={() => fileInputRef.current.click()}
              title="Excel (.xlsx), Word (.docx) veya CSV dosyasından etkinlik içe aktar"
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--gold-bg)', border: '1px solid rgba(16,48,100,.35)', color: 'var(--amber)', fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500, padding: '6px 11px', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '.02em' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              Dosyadan Ekle
            </button>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{importStatus}</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="ev-table">
              <thead>
                <tr>
                  {[['ay', 'Ay'], ['tarihStr', 'Etkinlik Tarihi'], ['t', 'Etkinlik Adı'], ['topluluk', 'Topluluk Adı'], ['yer', 'Etkinlik Yeri']].map(([key, label]) => (
                    <th key={key} className={sort.key === key ? 'sorted' : ''} onClick={() => sortBy(key)}>
                      {label} <span className="sort-arrow">{sort.key === key ? (sort.dir === 1 ? '↑' : '↓') : '↕'}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 28, color: 'var(--muted)', fontSize: 12 }}>Sonuç bulunamadı.</td></tr>
                ) : (
                  pageItems.map((e, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{AY_ADI[e.ay || 0] || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--ink2)' }}>{e.tarihStr || (e.d ? `${e.d} ${AY_ADI[e.ay || 0]}` : '—')}</td>
                      <td style={{ fontWeight: 500 }}>{escHtml(e.t)}</td>
                      <td style={{ fontSize: 11, color: 'var(--ink2)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.topluluk || <span style={{ opacity: 0.4 }}>—</span>}</td>
                      <td style={{ fontSize: 11, color: 'var(--muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.yer || <span style={{ opacity: 0.4 }}>—</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="ev-pagination">
              <span className="ev-page-info">{start + 1}–{Math.min(start + perPage, filtered.length)} / {filtered.length}</span>
              <button className="ev-page-btn" disabled={curPage === 1} onClick={() => setPage(curPage - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - curPage) <= 3)
                .map((p, idx, arr) => (
                  <span key={p} style={{ display: 'inline-flex' }}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: 'var(--muted)', fontSize: 11, padding: '0 2px' }}>…</span>}
                    <button className={`ev-page-btn${p === curPage ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  </span>
                ))}
              <button className="ev-page-btn" disabled={curPage === totalPages} onClick={() => setPage(curPage + 1)}>›</button>
            </div>
          )}
        </>
      )}

      {view === 'cal' && <CalendarGrid events={events} isAdmin={isAdmin} />}

      {pendingMapper && (
        <ColumnMapperModal
          rawHeader={pendingMapper.rawHeader}
          fileName={pendingMapper.fileName}
          onConfirm={confirmMapper}
          onCancel={() => setPendingMapper(null)}
        />
      )}
      {pendingPreview && (
        <ImportPreviewModal
          rows={pendingPreview.rows}
          fileName={pendingPreview.fileName}
          clubs={clubs}
          onConfirm={confirmImport}
          onCancel={() => setPendingPreview(null)}
        />
      )}
    </div>
  );
}

function CalendarGrid({ events, isAdmin }) {
  const cells = [];
  for (let i = 0; i < 2; i++) cells.push(<div className="cal-cell" key={'pad' + i} />);
  for (let d = 1; d <= 30; d++) {
    const de = events.filter((e) => e.d === d);
    const hasClash = de.some((e) => e.cl);
    cells.push(
      <div className="cal-cell" key={d}>
        <div className="cal-num">
          {d === 12 ? <span className="today-circle">12</span> : <span>{d}</span>}
          {hasClash && (
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#103064" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          )}
        </div>
        {de.slice(0, 2).map((e, i) => (
          <div className={`ev ${e.c}${e.cl ? ' clash' : ''}`} key={i} title={e.t}>{e.t}</div>
        ))}
      </div>
    );
  }
  return (
    <div className="two-col">
      <div className="cal-wrap">
        <div className="cal-head-days">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d) => <div className="cal-dn" key={d}>{d}</div>)}
        </div>
        <div className="cal-grid">{cells}</div>
      </div>
      <div>
        <div className="sec-head"><div className="sec-title">Çakışma uyarıları</div></div>
        <div style={{ fontSize: 11, color: 'var(--muted)', padding: '10px 0' }}>
          {events.filter((e) => e.cl).length === 0 ? 'Çakışma yok.' : `${events.filter((e) => e.cl).length} çakışma bulundu.`}
        </div>
      </div>
    </div>
  );
}
