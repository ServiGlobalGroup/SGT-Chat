import React, { useState, useMemo } from 'react';

function ContactsPage({ contacts = [] }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | online | busy | away | offline

  const relativeTime = (ts) => {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'ahora';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  };

  const filtered = useMemo(() => {
    return contacts
      .filter(c => (statusFilter === 'all' ? true : c.status === statusFilter))
      .filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  }, [contacts, query, statusFilter]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(c => {
      const letter = c.name.charAt(0).toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(c);
    });
    Object.keys(map).forEach(k => map[k].sort((a,b) => a.name.localeCompare(b.name,'es')));
    return Object.keys(map).sort().map(letter => ({ letter, items: map[letter] }));
  }, [filtered]);

  const statusOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'online', label: 'Conectados' },
    { id: 'busy', label: 'Ocupados' },
    { id: 'away', label: 'Ausentes' },
    { id: 'offline', label: 'Offline' }
  ];

  return (
    <div className="page-container fade-in contacts-page">
      <header className="page-header">
        <h1>Contactos</h1>
        <div className="contacts-toolbar">
          <div className="contacts-search-wrapper">
            <input
              type="text"
              className="contacts-search"
              placeholder="Buscar contacto..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="contacts-filters">
            {statusOptions.map(opt => (
              <button
                key={opt.id}
                className={`filter-chip ${statusFilter === opt.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div className="page-content contacts-list-container">
        {grouped.length === 0 && (
          <div className="placeholder-box" style={{margin:'60px auto'}}>
            <h3>Sin resultados</h3>
            <p>Prueba con otro término o cambia el filtro de estado.</p>
          </div>
        )}
        <div className="contacts-list" role="list">
          {grouped.map(section => (
            <div key={section.letter} className="contacts-section" role="group" aria-label={section.letter}>
              <div className="contacts-section-header">{section.letter}</div>
              {section.items.map(c => {
                const initials = c.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
                return (
                  <div key={c.id} className="contact-row" role="listitem" tabIndex={0}>
                    <div className={`contact-row-avatar status-${c.status}`}>{initials}</div>
                    <div className="contact-row-main">
                      <div className="contact-row-top">
                        <span className="contact-row-name">{c.name}</span>
                        <span className="contact-row-activity" title="Última actividad">{relativeTime(c.lastActivity)}</span>
                      </div>
                      <div className="contact-row-bottom">
                        <span className={`contact-status-chip ${c.status}`}>{c.status}</span>
                        <span className="contact-row-lastmsg" title={c.lastMessage}>{c.lastMessage}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContactsPage;
