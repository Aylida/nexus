export default function Nav({ isAdmin, onLogout }) {
  return (
    <nav>
      <a className="logo" href="#">
        Nex<em>us</em>
      </a>
      <div className="nav-meta">Gazi Üniversitesi · Kültür Birimi</div>
      <div className="nav-right">
        <span className={`admin-badge${isAdmin ? ' visible' : ''}`}>Admin modu</span>
        <button id="logout-btn" onClick={onLogout}>
          Çıkış
        </button>
      </div>
    </nav>
  );
}
