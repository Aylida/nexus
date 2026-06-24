const TABS = [
  { id: 'saglik', label: 'Topluluk sağlığı', icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /> },
  { id: 'takvim', label: 'Etkinlik takvimi', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
  { id: 'istatistik', label: 'İstatistikler', icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
  { id: 'arsiv', label: 'Arşiv', icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></> },
  { id: 'asistan', label: 'Asistan', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
];

export default function SidebarNav({ active, onChange, arsivCount, clashCount }) {
  return (
    <div className="panels-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`pnav-item${active === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <svg viewBox="0 0 24 24">{tab.icon}</svg>
          <span>{tab.label}</span>
          {tab.id === 'takvim' && clashCount > 0 && (
            <span className="pnav-badge" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
              {clashCount} çakışma
            </span>
          )}
          {tab.id === 'arsiv' && (
            <span className="pnav-badge" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
              {arsivCount}
            </span>
          )}
          {tab.id === 'asistan' && (
            <span className="pnav-badge" style={{ background: 'var(--gold-bg)', color: 'var(--amber)' }}>
              AI
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
