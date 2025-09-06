import React, { useEffect, useState } from 'react';
import { LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Precargar email recordado si existe
  useEffect(() => {
    const saved = localStorage.getItem('remember_email');
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const canSubmit = email.trim().length > 3 && password.trim().length > 3 && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      // Autenticación simulada: aceptar cualquier email/password mínimos
      await new Promise(r => setTimeout(r, 450));
      // Recordar solo el correo si se marca la opción
      if (remember) localStorage.setItem('remember_email', email.trim());
      else localStorage.removeItem('remember_email');
      // Nunca persistimos token: siempre pedimos contraseña en nuevas sesiones
      onLogin && onLogin({ email });
    } catch (err) {
      setError('No se pudo iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card auth-card--split">
        <div className="auth-side">
          <div className="brand-mark lg">SGT</div>
          <h2>SGT Chat</h2>
          <ul className="auth-benefits">
            <li>Mensajería rápida y segura</li>
            <li>Calendario y recordatorios</li>
            <li>Gestión de archivos compartidos</li>
          </ul>
          <div className="auth-side-foot">
            <ShieldCheck size={16} />
            <small>Cifrado en tránsito • Demo UI</small>
          </div>
        </div>
        <div className="auth-main">
          <div className="auth-card-header">
            <h1>Iniciar sesión</h1>
            <p className="muted">Introduce tus credenciales para continuar</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span className="auth-label">Correo</span>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-ico" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  required
                />
              </div>
            </label>
            <label className="auth-field">
              <span className="auth-label">Contraseña</span>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-ico" />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  required
                />
              </div>
            </label>
            <div className="auth-row">
              <label className="auth-check">
                <input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} />
                <span>Recordar correo</span>
              </label>
              <button type="button" className="link-btn" onClick={()=>alert('Recuperación pendiente')}>¿Olvidaste tu contraseña?</button>
            </div>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <button type="submit" className="auth-submit" disabled={!canSubmit}>
              <LogIn size={16} /> {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
