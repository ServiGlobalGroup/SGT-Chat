import React from 'react';

function FilesPage() {
  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <h1>Archivos</h1>
        <div className="page-actions">
          <button className="btn-secondary" disabled>Subir archivo</button>
        </div>
      </header>
      <div className="page-content placeholder-center">
        <div className="placeholder-box">
          <h3>Gestor de archivos pendiente</h3>
          <p>Podrás compartir y buscar documentos aquí.</p>
        </div>
      </div>
    </div>
  );
}

export default FilesPage;
