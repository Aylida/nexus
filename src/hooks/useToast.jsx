import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const notify = useCallback((msg, type = 'info') => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return { toasts, notify };
}

export function ToastContainer({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', maxWidth: 340 }}>
      {toasts.map((t) => {
        const bg = t.type === 'error' ? 'var(--red-bg)' : t.type === 'success' ? 'var(--green-bg)' : 'var(--gold-bg)';
        const fg = t.type === 'error' ? 'var(--red)' : t.type === 'success' ? 'var(--green)' : 'var(--amber)';
        return (
          <div
            key={t.id}
            style={{
              background: bg, color: fg, border: `1px solid ${fg}`, borderRadius: 3, padding: '10px 14px',
              fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, lineHeight: 1.4,
              whiteSpace: 'pre-line', boxShadow: '0 4px 14px rgba(0,0,0,.14)',
            }}
          >
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}
