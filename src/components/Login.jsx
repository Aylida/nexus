import { useState, useRef } from 'react';
import { PASSWORD } from '../data/constants';

export default function Login({ onSuccess }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [out, setOut] = useState(false);
  const inputRef = useRef(null);

  function doLogin() {
    if (pw === PASSWORD) {
      setOut(true);
      setTimeout(onSuccess, 500);
    } else {
      setErr('Şifre hatalı.');
      setPw('');
      inputRef.current?.focus();
    }
  }

  return (
    <div id="login-screen" className={out ? 'out' : ''} style={out ? { pointerEvents: 'none' } : undefined}>
      <div className="login-box">
        <div className="login-logo">
          Nex<em>us</em>
        </div>
        <div className="login-sub">Gazi Üniversitesi · Kültür Birimi</div>
        <div className="login-field">
          <input
            ref={inputRef}
            type="password"
            placeholder="Şifre"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doLogin()}
          />
        </div>
        <div className="login-err">{err}</div>
        <button className="login-btn" onClick={doLogin}>
          Giriş Yap
        </button>
        <div className="login-footer">Gazi Üniversitesi · 2025–26</div>
      </div>
    </div>
  );
}
