import React, { useMemo, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

function humanSize(bytes){
  if(bytes < 1024) return bytes + ' B';
  const kb = bytes/1024; if(kb < 1024) return kb.toFixed(1)+' KB';
  const mb = kb/1024; if(mb < 1024) return mb.toFixed(1)+' MB';
  const gb = mb/1024; return gb.toFixed(2)+' GB';
}

const typeIcon = (mime) => {
  if(!mime) return '📄';
  if(mime.startsWith('image/')) return '🖼️';
  if(mime === 'application/pdf') return '📕';
  if(mime.includes('zip')) return '🗜️';
  if(mime.startsWith('video/')) return '🎬';
  if(mime.startsWith('audio/')) return '🎵';
  return '📄';
};

function FilesPage({ files = [] }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(()=> files.filter(f => {
    const q = query.toLowerCase();
    const matchText = f.filename.toLowerCase().includes(q) || f.contactName.toLowerCase().includes(q);
    const matchType = typeFilter==='all' || (typeFilter==='images' && f.mime?.startsWith('image/')) || (typeFilter==='docs' && (f.mime==='application/pdf' || f.mime?.includes('word'))) ;
    return matchText && matchType;
  }), [files, query, typeFilter]);

  return (
    <Tooltip.Provider delayDuration={300}>
    <div className="page-container fade-in">
      <header className="page-header">
        <h1>Archivos</h1>
        <div className="page-actions files-actions">
          <div className="files-filters">
            <input className="files-search" placeholder="Buscar archivo o contacto" value={query} onChange={e=>setQuery(e.target.value)} />
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="files-filter-trigger" aria-label="Filtrar tipo de archivo">
                  <span className="fft-label">{typeFilter === 'all' ? 'Todos' : typeFilter === 'images' ? 'Imágenes' : 'Documentos'}</span>
                  <span className="fft-caret" aria-hidden="true">▾</span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="status-menu files-filter-menu" sideOffset={12} align="end">
                <DropdownMenu.Label className="status-menu-label">Tipo</DropdownMenu.Label>
                <DropdownMenu.Separator className="status-menu-separator" />
                {[{id:'all',label:'Todos',desc:'Todos los archivos'},{id:'images',label:'Imágenes',desc:'PNG, JPG, etc.'},{id:'docs',label:'Documentos',desc:'PDF y texto'}].map(opt => {
                  const active = typeFilter === opt.id;
                  return (
                    <DropdownMenu.Item
                      key={opt.id}
                      className={`status-menu-item ${active ? 'active' : ''}`}
                      onSelect={()=> setTypeFilter(opt.id)}
                    >
                      <span className="status-texts">
                        <strong>{opt.label}</strong>
                        <small>{opt.desc}</small>
                      </span>
                      {active && <span className="status-check" aria-hidden="true">✓</span>}
                    </DropdownMenu.Item>
                  );
                })}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
          <button className="btn-secondary" disabled>Subir archivo</button>
        </div>
      </header>
      <div className="page-content files-content">
        {filtered.length === 0 && (
          <div className="placeholder-box" style={{margin:'0 auto'}}>
            <h3>Sin archivos</h3>
            <p>No se encontraron archivos con los filtros actuales.</p>
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
                        <span className="file-icon" aria-hidden="true">{typeIcon(file.mime)}</span>
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
                      <div className="tooltip-description small">{file.mime || 'Archivo'} • {humanSize(file.size)}</div>
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
