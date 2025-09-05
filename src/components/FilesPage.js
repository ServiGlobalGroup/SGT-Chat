import React, { useMemo, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

function humanSize(bytes){
  if(bytes < 1024) return bytes + ' B';
  const kb = bytes/1024; if(kb < 1024) return kb.toFixed(1)+' KB';
  const mb = kb/1024; if(mb < 1024) return mb.toFixed(1)+' MB';
  const gb = mb/1024; return gb.toFixed(2)+' GB';
}

// Icono genérico para todos los archivos
const fileIcon = () => '📄';

function FilesPage({ files = [] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(()=> files.filter(f => {
    const q = query.toLowerCase();
    const matchText = f.filename.toLowerCase().includes(q) || f.contactName.toLowerCase().includes(q);
    return matchText;
  }), [files, query]);

  return (
    <Tooltip.Provider delayDuration={300}>
    <div className="page-container fade-in files-page">
      <header className="page-header">
        <h1>Archivos</h1>
        <div className="page-actions files-actions">
          <div className="files-filters">
            <input className="files-search" placeholder="Buscar archivo o contacto" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>
        </div>
      </header>
      <div className="page-content files-content">
        {filtered.length === 0 && (
          <div className="files-table-wrapper modern">
            <div className="placeholder-box" style={{margin:'auto', textAlign:'center'}}>
              <h3>Sin archivos</h3>
              <p>No se encontraron archivos que coincidan con la búsqueda.</p>
            </div>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="files-table-wrapper modern">
            <div className="files-table-head">
              <span className="col-head name">Nombre</span>
              <span className="col-head contact">Contacto</span>
              <span className="col-head direction">Dirección</span>
              <span className="col-head size">Tamaño</span>
              <span className="col-head date">Fecha</span>
            </div>
            <div className="files-table-body">
              {filtered.map(file => (
                <Tooltip.Root key={file.id}>
                  <Tooltip.Trigger asChild>
                    <div className="files-row">
                      <div className="file-name-cell">
                        <span className="file-icon" aria-hidden="true">{fileIcon()}</span>
                        <button className="file-name ellipsis" title={file.filename} onClick={(e)=>{e.stopPropagation(); /* placeholder acción abrir */}}>{file.filename}</button>
                      </div>
                      <span className="cell-contact ellipsis">{file.contactName}</span>
                      <span className={`file-direction ${file.direction==='Enviado'?'sent':'received'}`}>{file.direction}</span>
                      <span className="cell-size">{humanSize(file.size)}</span>
                      <span className="cell-date">{new Date(file.timestamp).toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit', year:'2-digit'})} {new Date(file.timestamp).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="tooltip-content" side="top" sideOffset={10}>
                      <div className="tooltip-header"><strong>{file.filename}</strong></div>
                      <div className="tooltip-description small">Archivo • {humanSize(file.size)}</div>
                      <Tooltip.Arrow className="tooltip-arrow" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </Tooltip.Provider>
  );
}

export default FilesPage;
