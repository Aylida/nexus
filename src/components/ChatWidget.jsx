import { useState, useRef, useEffect } from 'react';
import { escHtml } from '../utils/match';
import { callClaude, buildArsivContext } from '../utils/claudeApi';

const SUGGESTIONS = [
  ['2023 yılındaki etkinlikler neler?', '2023 etkinlikleri'],
  ['Teknik kategorideki haberler', 'Teknik haberler'],
  ['En çok katılımcı olan etkinlik hangisi?', 'En kalabalık etkinlik'],
  ['Ödül kazanan etkinlikler', 'Ödüllü etkinlikler'],
];

export default function ChatWidget({ clubs, arsiv, onOpenArchive, onGoToAssistant }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showSugs, setShowSugs] = useState(true);
  const firstOpenRef = useRef(true);
  const msgsRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    msgsRef.current?.scrollTo({ top: msgsRef.current.scrollHeight });
  }, [messages, typing]);

  function toggle() {
    setOpen((v) => !v);
    if (firstOpenRef.current) {
      firstOpenRef.current = false;
      setMessages([{ role: 'bot', text: 'Merhaba! Gazi topluluklarının arşivini sorgulayabilirsin. Yıl, topluluk veya kategori bazlı arama yapabilirim.' }]);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }

  async function send(text) {
    const q = text ?? input;
    if (!q.trim()) return;
    setInput('');
    setShowSugs(false);
    setMessages((m) => [...m, { role: 'user', text: q, results: null }]);
    setTyping(true);

    const ctx = buildArsivContext(arsiv, clubs);
    const sys = `Sen Gazi Üniversitesi Nexus platformunun arşiv asistanısın. Aşağıda öğrenci topluluklarının etkinlik ve haber arşivi var. Kullanıcının sorusunu Türkçe cevapla.

Önemli kurallar:
1. Önce kısa ve net bir metin cevabı ver.
2. Sonra cevabınla ilgili arşiv kayıtlarının ID'lerini şu formatta listele: SONUCLAR:[1,5,12]
3. Eğer ilgili kayıt yoksa SONUCLAR:[] yaz.
4. Maksimum 5 sonuç göster.

ARŞİV VERİSİ:
${ctx}`;

    try {
      const { fullText, error } = await callClaude({ system: sys, messages: [{ role: 'user', content: q }] });
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
      setMessages((m) => [...m, { role: 'bot', text: clean, results: found }]);
    } catch {
      setTyping(false);
      setMessages((m) => [...m, { role: 'bot', text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar dene.' }]);
    }
  }

  return (
    <>
      <button id="chat-btn" onClick={toggle} title="Arşiv asistanı">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      </button>
      <div id="chat-window" className={open ? 'open' : ''}>
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">N</div>
            <div>
              <div className="chat-title">Nexus Asistan</div>
              <div className="chat-sub">Arşiv & topluluk sorgulama</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => { setOpen(false); onGoToAssistant(); }}
              title="Geniş görünüm"
              style={{ background: 'none', border: '1px solid var(--line2)', cursor: 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, color: 'var(--muted)' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
            </button>
            <button id="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>
        </div>
        <div className="chat-msgs" ref={msgsRef}>
          {messages.map((m, i) => (
            <div className={`chat-msg ${m.role === 'user' ? 'user' : 'bot'}`} key={i}>
              <div className="msg-bubble">{escHtml(m.text)}</div>
              {m.results && m.results.length > 0 && (
                <div className="chat-results">
                  {m.results.map((r) => {
                    const club = clubs.find((c) => c.id === r.clubId);
                    return (
                      <div className="chat-result-card" key={r.id} onClick={() => { onOpenArchive(r.id); setOpen(false); }}>
                        <div className="crc-title">{r.baslik}</div>
                        <div className="crc-meta">📅 {r.tarih} · {club ? club.name : '—'} · {r.katilim > 0 ? r.katilim + ' katılımcı' : (r.odul || '')}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="chat-msg bot">
              <div className="chat-typing"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>
        {showSugs && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map(([q, label]) => (
              <button className="chat-sug-btn" key={q} onClick={() => send(q)}>{label}</button>
            ))}
          </div>
        )}
        <div className="chat-input-wrap">
          <input
            ref={inputRef}
            id="chat-input"
            placeholder="Sor… (örn: 2022'deki spor etkinlikleri)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button id="chat-send" onClick={() => send()}>
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}
