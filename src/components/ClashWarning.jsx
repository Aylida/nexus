import { useState, useEffect, useRef } from 'react';

export default function ClashWarning({ events }) {
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const ref = useRef(null);

  const clashes = events.filter((e) => e.cl);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    if (clashes.length > 0) setPaused(false);
  }, [clashes.length]);

  if (clashes.length === 0) return null;

  const byDay = {};
  clashes.forEach((e) => {
    byDay[e.d] = byDay[e.d] || [];
    byDay[e.d].push(e.t);
  });

  function toggle(e) {
    e.stopPropagation();
    setOpen((v) => !v);
    setPaused(true);
  }

  return (
    <button id="clash-warn-btn" className="visible" onClick={toggle} title="Çakışan etkinlikler" ref={ref}>
      <div id="clash-warn-icon" className={paused ? 'paused' : ''}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 8 C30 8 18 26 18 46 L18 62 L10 72 L90 72 L82 62 L82 46 C82 26 70 8 50 8Z" fill="#103064" />
          <path d="M50 8 C30 8 18 26 18 46 L18 62 L10 72 L90 72 L82 62 L82 46 C82 26 70 8 50 8Z" fill="url(#bellGrad)" />
          <ellipse cx="50" cy="78" rx="10" ry="5" fill="#888" />
          <rect x="47" y="72" width="6" height="8" rx="2" fill="#999" />
          <path d="M44 8 Q50 2 56 8" stroke="#999" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="46" y="28" width="8" height="24" rx="4" fill="white" />
          <circle cx="50" cy="62" r="4" fill="white" />
          <path d="M12 36 Q6 42 12 48" stroke="#103064" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M6 30 Q-2 42 6 54" stroke="#103064" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".6" />
          <path d="M88 36 Q94 42 88 48" stroke="#103064" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M94 30 Q102 42 94 54" stroke="#103064" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".6" />
          <defs>
            <linearGradient id="bellGrad" x1="30%" y1="10%" x2="70%" y2="90%">
              <stop offset="0%" stopColor="#3D6FB5" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#103064" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div id="clash-warn-popup" className={open ? 'open' : ''}>
        <div className="cwp-head">
          <div className="cwp-head-dot"></div>
          <div className="cwp-head-title">Çakışan Etkinlikler</div>
        </div>
        <div className="cwp-list">
          {Object.entries(byDay)
            .sort((a, b) => a[0] - b[0])
            .map(([d, names]) => (
              <div className="cwp-item" key={d}>
                <div className="cwp-day">{d} Nisan</div>
                <div className="cwp-names">{names.join(' · ')}</div>
              </div>
            ))}
        </div>
      </div>
    </button>
  );
}
