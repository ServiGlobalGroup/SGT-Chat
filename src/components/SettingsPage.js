import React from 'react';

function SettingsPage() {
  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <h1>Configuración</h1>
      </header>
      <div className="page-content settings-grid">
        <section className="setting-card">
          <h3>Apariencia</h3>
          <p className="small muted">Modo oscuro/claro (por implementar).</p>
          <button className="btn-secondary" disabled>Alternar tema</button>
        </section>
        <section className="setting-card">
          <h3>Notificaciones</h3>
          <p className="small muted">Configura sonidos y avisos.</p>
          <button className="btn-secondary" disabled>Abrir ajustes</button>
        </section>
        <section className="setting-card">
          <h3>Cuenta</h3>
          <p className="small muted">Datos del perfil y seguridad.</p>
          <button className="btn-secondary" disabled>Gestionar cuenta</button>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;