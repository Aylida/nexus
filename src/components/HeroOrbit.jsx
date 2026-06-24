import { useRef, useEffect, useState, useCallback } from 'react';
import { CAT_COLORS, CAT_BG, CAT_LABEL, ST_COLORS, ST_LABELS, getStatus } from '../data/constants';
import { currentDonem, etkinlikSayisiDonem } from '../utils/donem';

export default function HeroOrbit({ clubs, events, photos }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animIdRef = useRef(null);
  const nodesRef = useRef(null);
  const hoveredRef = useRef(null);
  const tRef = useRef(0);
  const imgCacheRef = useRef({});

  const [tooltip, setTooltip] = useState(null); // {x,y,club}
  const [selected, setSelected] = useState(null); // club for detail panel

  // Preload images for canvas drawing
  useEffect(() => {
    Object.entries(photos).forEach(([id, src]) => {
      if (!imgCacheRef.current[id]) {
        const img = new Image();
        img.src = src;
        imgCacheRef.current[id] = img;
      }
    });
  }, [photos]);

  const buildNodes = useCallback((W, H) => {
    const cx = W / 2;
    const cy = H / 2 + 26;
    const nodes = [{ id: 0, x: cx, y: cy, r: 42, label: 'GAZİ', isCenter: true }];
    const count = clubs.length;
    clubs.forEach((c, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const dist = Math.min(W, H) * 0.32 * (0.78 + Math.random() * 0.35);
      nodes.push({
        id: c.id,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        r: 18 + Math.sqrt(c.uye) * 0.7,
        label: c.short,
        club: c,
        initX: cx + Math.cos(angle) * dist,
        initY: cy + Math.sin(angle) * dist,
        phase: Math.random() * Math.PI * 2,
      });
    });
    // Gentle push — separate overlapping nodes
    for (let iter = 0; iter < 60; iter++) {
      for (let i = 1; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.initX - a.initX, dy = b.initY - a.initY;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const minD = a.r + b.r + 4;
          if (d < minD) {
            const push = (minD - d) * 0.5;
            const nx = dx / d, ny = dy / d;
            a.initX -= nx * push; a.initY -= ny * push;
            b.initX += nx * push; b.initY += ny * push;
            a.x = a.initX; a.y = a.initY;
            b.x = b.initX; b.y = b.initY;
          }
        }
      }
    }
    const pad = 20;
    nodes.slice(1).forEach((n) => {
      n.initX = Math.max(n.r + pad, Math.min(W - n.r - pad, n.initX));
      n.initY = Math.max(n.r + pad, Math.min(H - n.r - pad, n.initY));
      n.x = n.initX; n.y = n.initY;
    });
    return nodes;
  }, [clubs]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const W = container.clientWidth;
    const H = container.clientHeight;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    nodesRef.current = buildNodes(W, H);
    return { W, H };
  }, [buildNodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function animate() {
      const container = containerRef.current;
      if (!container) return;
      const W = container.clientWidth, H = container.clientHeight;
      const nodes = nodesRef.current;
      if (!nodes) { animIdRef.current = requestAnimationFrame(animate); return; }
      tRef.current += 0.006;
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);

      nodes.slice(1).forEach((n) => {
        n.x = n.initX + Math.sin(t * 0.7 + n.phase) * 5;
        n.y = n.initY + Math.cos(t * 0.5 + n.phase) * 4;
      });

      // Lines
      nodes.slice(1).forEach((n) => {
        const c = nodes[0], hov = hoveredRef.current === n;
        const col = CAT_COLORS[n.club.cat];
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = col + (hov ? '55' : '1a');
        ctx.lineWidth = hov ? 1.5 : 0.7;
        ctx.stroke();
      });

      // Nodes
      nodes.forEach((n) => {
        if (n.isCenter) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = '#0E1A2B';
          ctx.fill();
          ctx.strokeStyle = 'rgba(159,218,249,0.55)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.font = `600 ${Math.round(n.r * 0.28)}px 'DM Sans',sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#F2F6FB';
          ctx.fillText('GAZİ', n.x, n.y - n.r * 0.18);
          ctx.font = `400 ${Math.round(n.r * 0.2)}px 'DM Sans',sans-serif`;
          ctx.fillStyle = 'rgba(159,218,249,0.95)';
          ctx.fillText('ÜNİVERSİTESİ', n.x, n.y + n.r * 0.22);
          return;
        }
        const hov = hoveredRef.current === n, col = CAT_COLORS[n.club.cat], bg = CAT_BG[n.club.cat];
        if (hov) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
          ctx.fillStyle = col + '18';
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();

        const img = imgCacheRef.current[n.club.id];
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
          ctx.restore();
        } else {
          ctx.font = `${hov ? '500' : '400'} ${Math.min(10, n.r * 0.38)}px 'DM Sans',sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = col;
          const lbl = n.label.length > 6 ? n.label.slice(0, 5) + '…' : n.label;
          ctx.fillText(lbl, n.x, n.y);
        }
        ctx.strokeStyle = col + (hov ? 'cc' : '55');
        ctx.lineWidth = hov ? 2 : 1;
        ctx.stroke();
      });

      animIdRef.current = requestAnimationFrame(animate);
    }

    resizeCanvas();
    animIdRef.current = requestAnimationFrame(animate);

    function onResize() {
      cancelAnimationFrame(animIdRef.current);
      resizeCanvas();
      animIdRef.current = requestAnimationFrame(animate);
    }
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizeCanvas]);

  function getNodeAt(mx, my) {
    const nodes = nodesRef.current;
    if (!nodes) return null;
    return nodes.slice(1).find((n) => {
      const dx = n.x - mx, dy = n.y - my;
      return dx * dx + dy * dy <= (n.r + 4) * (n.r + 4);
    });
  }

  function handleMouseMove(e) {
    const canvas = canvasRef.current;
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const n = getNodeAt(mx, my) || null;
    hoveredRef.current = n;
    canvas.style.cursor = n ? 'pointer' : 'default';
    if (n) {
      setTooltip({ x: mx, y: my, n });
    } else {
      setTooltip(null);
    }
  }

  function handleClick(e) {
    const canvas = canvasRef.current;
    const r = canvas.getBoundingClientRect();
    const n = getNodeAt(e.clientX - r.left, e.clientY - r.top);
    if (n) setSelected(n.club);
    else setSelected(null);
  }

  function handleMouseLeave() {
    hoveredRef.current = null;
    setTooltip(null);
  }

  return (
    <section id="hero" ref={containerRef}>
      <canvas
        id="hero-canvas"
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
      />
      {tooltip && (
        <NodeTooltip tooltip={tooltip} events={events} containerRef={containerRef} />
      )}
      <DetailPanel club={selected} events={events} photos={photos} onClose={() => setSelected(null)} />
      <div className="hero-bottom">
        <div className="hero-text">
          <div className="hero-tag">Topluluk ağ haritası</div>
          <div className="hero-title">
            Gazi'nin
            <br />
            <em>topluluk ağı.</em>
          </div>
        </div>
        <div className="hero-hint">
          <div className="hero-hint-dot"></div>
          <span>Topluluğa tıkla, detayları gör</span>
        </div>
      </div>
    </section>
  );
}

function NodeTooltip({ tooltip, events, containerRef }) {
  const ref = useRef(null);
  const { x, y, n } = tooltip;
  const c = n.club;
  const donem = currentDonem();
  const etkSayisi = etkinlikSayisiDonem(events, c.id, donem.key);

  const [pos, setPos] = useState({ left: x, top: y - n.r - 8, anchor: 'top' });

  useEffect(() => {
    const el = ref.current;
    const container = containerRef.current;
    if (!el || !container) return;
    const W = container.clientWidth;
    const tw = el.offsetWidth, th = el.offsetHeight;
    let left = x, top = y - n.r - 8, anchor = 'top';
    if (left + tw / 2 > W) left = W - tw / 2 - 8;
    if (left - tw / 2 < 0) left = tw / 2 + 8;
    if (top - th < 0) { top = y + n.r + 8; anchor = 'bottom'; }
    setPos({ left, top, anchor });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y, n]);

  return (
    <div
      id="node-tooltip"
      className="visible"
      ref={ref}
      style={{
        left: pos.left,
        top: pos.top,
        transform: pos.anchor === 'top' ? 'translate(-50%,-100%) translateY(-10px)' : 'translate(-50%,0) translateY(10px)',
      }}
    >
      <div className="nt-name">{c.name}</div>
      <div className="nt-meta">{CAT_LABEL[c.cat]}</div>
      <div className="nt-rows">
        <div className="nt-row"><span>Üye</span><b>{c.uye}</b></div>
        <div className="nt-row"><span>Etkinlik ({donem.label})</span><b>{etkSayisi}</b></div>
        <div className="nt-row"><span>Başkan</span><b>{c.baskan || '—'}</b></div>
        <div className="nt-row"><span>Danışman</span><b>{c.danisman || '—'}</b></div>
      </div>
    </div>
  );
}

function DetailPanel({ club, events, photos, onClose }) {
  const visible = !!club;
  const c = club || {};
  const col = c.cat ? CAT_COLORS[c.cat] : undefined;
  const bg = c.cat ? CAT_BG[c.cat] : undefined;
  const st = c.score !== undefined ? getStatus(c.score) : 'ok';
  const donem = currentDonem();
  const etkSayisi = club ? etkinlikSayisiDonem(events, c.id, donem.key) : 0;
  const photo = club ? photos[c.id] : null;

  return (
    <div id="detail-panel" className={visible ? 'visible' : ''}>
      <button className="dp-close" onClick={onClose}>✕</button>
      {club && (
        <>
          <div className="dp-head">
            <div className="dp-icon" style={{ background: bg, color: col, overflow: 'hidden', padding: 0 }}>
              {photo ? (
                <img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt={c.short} />
              ) : (
                c.short.slice(0, 4)
              )}
            </div>
            <div className="dp-name">{c.name}</div>
            <div className="dp-cat" style={{ background: bg, color: col }}>
              {CAT_LABEL[c.cat]}
            </div>
          </div>
          <div className="dp-body">
            <div className="dp-score" style={{ color: ST_COLORS[st] }}>{c.score}</div>
            <div className="dp-score-lbl">Sağlık skoru</div>
            <div className="dp-row"><span className="dp-lbl">Üye sayısı</span><span className="dp-val">{c.uye} öğrenci</span></div>
            <div className="dp-row"><span className="dp-lbl">Etkinlik (dönem)</span><span className="dp-val">{etkSayisi} etkinlik ({donem.label})</span></div>
            <div className="dp-row"><span className="dp-lbl">Başkan</span><span className="dp-val">{c.baskan || '—'}</span></div>
            <div className="dp-row"><span className="dp-lbl">Danışman</span><span className="dp-val">{c.danisman || '—'}</span></div>
            <div className="dp-row"><span className="dp-lbl">Fakülte</span><span className="dp-val">{c.fakulte || '—'}</span></div>
            <div className="dp-row"><span className="dp-lbl">Kuruluş</span><span className="dp-val">{c.kurulusYili ? `${c.kurulusYili} · ${c.kacinciBaskan || '?'}. başkan` : '—'}</span></div>
            <div className="dp-row"><span className="dp-lbl">Kategori</span><span className="dp-val">{CAT_LABEL[c.cat]}</span></div>
            <div className="dp-row"><span className="dp-lbl">Durum</span><span className="dp-val" style={{ color: ST_COLORS[st] }}>{ST_LABELS[st]}</span></div>
          </div>
        </>
      )}
    </div>
  );
}
