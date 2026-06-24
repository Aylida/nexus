import { useState, useRef, useEffect } from 'react';
import { escHtml } from '../../utils/match';
import { callClaude, buildArsivContext, EVENTS_FIELD_PROMPT } from '../../utils/claudeApi';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

const SUGGESTIONS = [
  ['2023 yılındaki etkinlikler neler?', '2023 etkinlikleri'],
  ['Teknik kategorideki haberler', 'Teknik haberler'],
  ['En çok katılımcı olan etkinlik hangisi?', 'En kalabalık etkinlik'],
  ['Ödül kazanan etkinlikler', 'Ödüllü etkinlikler'],
];

export default function AssistantPanel({ clubs, arsiv, addEvents, notify, onOpenArchive }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [results, setResults] = useState([]);
  const [showSugs, setShowSugs] = useState(true);
  const fileInputRef = useRef(null);
  const msgsRef = useRef(null);
  const initedRef = useRef(false);

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    setMessages([{ role: 'bot', text: 'Merhaba! Gazi topluluklarının arşivini sorgulayabilirsin. Yıl, topluluk veya kategori bazlı arama yapabilirim.' }]);
  }, []);

  useEffect(() => {
    msgsRef.current?.scrollTo({ top: msgsRef.current.scrollHeight });
  }, [messages, typing]);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const isExcel = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(file.type) || /\.(xlsx|xls)$/i.test(file.name);
    const isWord = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(file.type) || /\.(docx|doc)$/i.test(file.name);
    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (!isExcel && !isWord && !isPDF && !isImage) {
      alert('Desteklenen formatlar: PDF, Excel (.xlsx/.xls), Word (.docx), JPEG, PNG, WEBP, GIF');
      return;
    }
    if (file.size > 20 * 1024 * 1024) { alert("Dosya boyutu 20 MB'ı geçemez."); return; }

    notify(`📂 "${file.name}" okunuyor…`, 'info');

    if (isExcel) {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const parts = wb.SheetNames.map((sn) => `### Sayfa: ${sn}\n${XLSX.utils.sheet_to_csv(wb.Sheets[sn], { blankrows: false })}`);
      runAutoImport({ name: file.name, extractedText: parts.join('\n\n').slice(0, 40000), label: 'Excel' });
      return;
    }
    if (isWord) {
      const buf = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buf });
      runAutoImport({ name: file.name, extractedText: result.value.slice(0, 40000), label: 'Word' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      runAutoImport({ name: file.name, base64, mediaType: file.type });
    };
    reader.readAsDataURL(file);
  }

  async function runAutoImport(fileData) {
    setMessages((m) => [...m, { role: 'user', text: '', fileName: fileData.name }]);
    setTyping(true);
    const sys = 'Sen Gazi Universitesi etkinlik import asistanisin. Kullanicinin gonderdigi dosya iceriginden etkinlikleri cikartip JSON formatinda dondurursun. Baska hicbir aciklama veya metin yazma. Sadece EVENTS_EKLE:[...] yaz.';
    let userContent;
    if (fileData.extractedText) {
      userContent = [
        { type: 'text', text: `[${fileData.label} dosyası: ${fileData.name}]\n\n${fileData.extractedText}` },
        { type: 'text', text: EVENTS_FIELD_PROMPT },
      ];
    } else if (fileData.mediaType === 'application/pdf') {
      userContent = [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileData.base64 } },
        { type: 'text', text: EVENTS_FIELD_PROMPT },
      ];
    } else {
      userContent = [
        { type: 'image', source: { type: 'base64', media_type: fileData.mediaType, data: fileData.base64 } },
        { type: 'text', text: EVENTS_FIELD_PROMPT },
      ];
    }
    try {
      const { fullText, error } = await callClaude({ system: sys, messages: [{ role: 'user', content: userContent }], maxTokens: 2000 });
      setTyping(false);
      if (error) { notify('Bağlantı hatası: ' + error, 'error'); return; }
      const evMatch = fullText.match(/EVENTS_EKLE:\s*(\[[\s\S]*?\])/);
      let imported = [];
      if (evMatch) { try { imported = JSON.parse(evMatch[1]); } catch { imported = []; } }
      if (imported.length > 0) {
        addEvents(imported.map((ev) => ({
          d: parseInt(ev.d) || 1,
          t: String(ev.t || 'Etkinlik'),
          c: ['teknik', 'sanat', 'spor', 'sosyal'].includes(ev.c) ? ev.c : 'sosyal',
          yil: parseInt(ev.yil) || 2026,
          yer: String(ev.yer || ''),
        })));
        notify(`✅ ${imported.length} etkinlik takvime eklendi.`, 'success');
      } else {
        notify('Belgede takvime eklenecek etkinlik bulunamadı.', 'error');
      }
    } catch {
      setTyping(false);
      notify('Bağlantı hatası. Lütfen tekrar dene.', 'error');
    }
  }

  async function sendMessage(text) {
    const q = text ?? input;
    if (!q.trim()) return;
    setInput('');
    setShowSugs(false);
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setTyping(true);

    const ctx = buildArsivContext(arsiv, clubs);
    const sys = `Sen Gazi Universitesi Nexus platformunun arsiv asistanisin. Asagida ogrenci topluluklarinin etkinlik ve haber arsivi var. Kullanicinin sorusunu Turkce cevapla.

Normal sorular icin:
1. Once kisa ve net bir metin cevabi ver.
2. Sonra ilgili arsiv kayitlarinin IDlerini su formatta listele: SONUCLAR:[1,5,12]
3. Ilgili kayit yoksa SONUCLAR:[] yaz.
4. Maksimum 5 sonuc.

ARSIV:
${ctx}`;

    try {
      const recentHistory = messages.slice(-6).filter((m) => m.text).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
      const { fullText, error } = await callClaude({ system: sys, messages: [...recentHistory, { role: 'user', content: q }] });
      setTyping(false);
      if (error) {
        setMessages((m) => [...m, { role: 'bot', text: 'Bağlantı hatası: ' + error }]);
        return;
      }
      const match = fullText.match(/SONUCLAR:\[([^\]]*)\]/);
      let ids = [];
      if (match && match[1].trim()) ids = match[1].split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
      const found = ids.map((id) => arsiv.find((a) => a.id === id)).filter(Boolean);
      const clean = fullText.replace(/SONUCLAR:\[[^\]]*\]/g, '').trim();
      setMessages((m) => [...m, { role: 'bot', text: clean }]);
      setResults(found);
    } catch {
      setTyping(false);
      setMessages((m) => [...m, { role: 'bot', text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar dene.' }]);
    }
  }

  return (
    <div className="panel-content active" id="panel-asistan" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', minHeight: 540 }}>
      <div className="asistan-chat-area">
        <div className="asistan-msgs" ref={msgsRef}>
          {messages.map((m, i) => (
            <div className={`chat-msg ${m.role === 'user' ? 'user' : 'bot'}`} key={i}>
              <div className="msg-bubble" style={{ fontSize: 13 }}>
                {m.fileName && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16,48,100,.15)', border: '1px solid rgba(16,48,100,.3)', borderRadius: 2, padding: '3px 7px', fontSize: 10, color: 'var(--amber)', marginBottom: 5, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📄 {m.fileName}
                  </div>
                )}
                {m.fileName && <br />}
                {m.text ? escHtml(m.text).split('\n').map((line, j) => <span key={j}>{line}<br /></span>) : (m.fileName ? 'Dosyayı analiz et' : '')}
              </div>
            </div>
          ))}
          {typing && (
            <div className="chat-msg bot">
              <div className="chat-typing"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>
        {showSugs && (
          <div className="asistan-sugs">
            {SUGGESTIONS.map(([q, label]) => (
              <button className="chat-sug-btn" key={q} onClick={() => sendMessage(q)}>{label}</button>
            ))}
          </div>
        )}
        <div className="asistan-input-area">
          <div className="asistan-input-row">
            <input ref={fileInputRef} type="file" accept=".pdf,.xlsx,.xls,.docx,.doc,image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            <button id="asistan-attach-btn" onClick={() => fileInputRef.current.click()} title="PDF, Excel, Word veya görsel ekle">
              <svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
            </button>
            <input
              id="asistan-input"
              placeholder="Topluluklara veya arşive sor…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button id="asistan-send" onClick={() => sendMessage()}>
              <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="asistan-results-area">
        {results.length === 0 ? (
          <div className="asistan-empty-results">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            Soru sor, ilgili arşiv kayıtları burada görünür.
          </div>
        ) : (
          <>
            <div className="asistan-results-head">{results.length} Sonuç</div>
            {results.map((r) => {
              const club = clubs.find((c) => c.id === r.clubId);
              return (
                <div className={`asistan-result-card ${r.kategori}`} key={r.id} onClick={() => onOpenArchive(r.id)}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                    <span className={`arsiv-chip ${r.tur}`}>{r.tur === 'etkinlik' ? 'Etkinlik' : 'Haber'}</span>
                    <span className="arsiv-year">{r.yil}</span>
                  </div>
                  <div className="arc-title">{r.baslik}</div>
                  <div className="arc-meta">{r.tarih}{club ? ' · ' + club.name : ''}{r.katilim > 0 ? ' · ' + r.katilim + ' katılımcı' : ''}</div>
                  {r.odul && <div className="arc-odul">{r.odul}</div>}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
