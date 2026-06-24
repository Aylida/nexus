import { useState } from 'react';

const FIELDS = [
  { key: 'ad', label: 'Etkinlik Adı', required: true },
  { key: 'tarih', label: 'Tarih / Gün' },
  { key: 'ay', label: 'Ay' },
  { key: 'yil', label: 'Yıl' },
  { key: 'yer', label: 'Yer / Konum' },
  { key: 'kat', label: 'Kategori' },
  { key: 'topluluk', label: 'Topluluk' },
];

export default function ColumnMapperModal({ rawHeader, fileName, onConfirm, onCancel }) {
  const [map, setMap] = useState(() => Object.fromEntries(FIELDS.map((f) => [f.key, -1])));

  const colOptions = ['(yok)', ...rawHeader.map((h, i) => h || `Kolon ${i + 1}`)];

  function handleOk() {
    if (map.ad < 0) { alert('"Etkinlik Adı" kolonunu seçmelisiniz.'); return; }
    onConfirm(map);
  }

  return (
    <div className="modal-overlay open" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ width: 'min(520px, 92vw)', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
            Kolon Eşleştirme <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11 }}>— {fileName}</span>
          </span>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '16px 18px' }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', margin: '0 0 14px' }}>
            Başlık satırı otomatik tanınamadı. Her alanın hangi kolona karşılık geldiğini seçin.
          </p>
          {FIELDS.map((f) => (
            <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink)', width: 130, flexShrink: 0 }}>
                {f.label}{f.required ? ' *' : ''}
              </label>
              <select
                style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, border: '1px solid var(--line2)', padding: '5px 8px', background: 'var(--white)', color: 'var(--ink)', flex: 1, cursor: 'pointer' }}
                value={map[f.key]}
                onChange={(e) => setMap((prev) => ({ ...prev, [f.key]: parseInt(e.target.value) }))}
              >
                {colOptions.map((opt, i) => (
                  <option key={i} value={i - 1}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line2)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="mbtn" onClick={onCancel}>İptal</button>
          <button className="mbtn primary" onClick={handleOk}>Devam →</button>
        </div>
      </div>
    </div>
  );
}
