import React, { useRef, useState, useMemo } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Search, Pin, Trash2, X } from 'lucide-react';
import { generateAvatarColor, getInitials } from '../utils/avatarUtils';
import { debounce } from '../utils/formatUtils';
import '../styles/avatars.css';

function ContactList({ contacts, selectedContactId, onSelectContact, onTogglePin, onDeleteContact }) {
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar contactos basado en búsqueda - memoizado
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    
    const term = searchTerm.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(term) ||
      contact.lastMessage.toLowerCase().includes(term)
    );
  }, [contacts, searchTerm]);

  // Función debounced para búsqueda
  const debouncedSearch = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  return (
  <div className="contact-list compact">
      <div className="contact-list-header">
        <h2>Chats</h2>
        <div className="search-container">
          <Search className="search-icon" size={16} aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar conversaciones..."
            className="search-input"
            aria-label="Buscar conversaciones"
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear"
              aria-label="Limpiar búsqueda"
              title="Limpiar"
              onClick={clearSearch}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <ScrollArea.Root className="contact-list-scroll">
        <ScrollArea.Viewport className="contact-list-viewport">
          <div className="contact-list-content">
            {filteredContacts.length === 0 && searchTerm ? (
              <div className="no-results">
                <p>No se encontraron conversaciones</p>
                <small>Intenta con otro término de búsqueda</small>
              </div>
            ) : (
              filteredContacts.map((contact) => {
              const avatarColor = generateAvatarColor(contact.name);
              const initials = getInitials(contact.name);
              
              return (
                <div
                  key={contact.id}
                  className={`contact-item ${selectedContactId === contact.id ? 'selected' : ''} ${contact.pinned ? 'pinned' : ''}`}
                  onClick={(e) => {
                    // Evitar que click en botones de acción seleccione contacto
                    if (e.target.closest('.pin-btn') || e.target.closest('.delete-btn')) return;
                    onSelectContact && onSelectContact(contact.id);
                  }}
                >
                  <div className="avatar-with-status">
                    <div 
                      className="avatar-round"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials}
                    </div>
                    <span 
                      className={`avatar-status-indicator ${contact.status || 'offline'}`}
                      title={contact.status}
                      aria-label={`Estado ${contact.status}`}
                    />
                  </div>
                
                <div className="contact-info">
                  <div className="contact-header">
                    <h3 className="contact-name">{contact.name}</h3>
                    <div className="contact-meta">
                      <span className="contact-timestamp">{contact.timestamp}</span>
                      {contact.unreadCount > 0 && (
                        <span className="contact-unread-badge">{contact.unreadCount}</span>
                      )}
                      <div className="contact-actions">
                        <button 
                          type="button"
                          className={`pin-btn ${contact.pinned ? 'active' : ''}`}
                          title={contact.pinned ? 'Desfijar' : 'Fijar chat'}
                          onClick={() => onTogglePin && onTogglePin(contact.id)}
                        >
                          <Pin size={14} />
                        </button>
                        <button
                          type="button"
                          className="delete-btn"
                          title="Eliminar chat"
                          onClick={() => {
                            if (!onDeleteContact) return;
                            const ok = window.confirm('¿Eliminar este chat? Esta acción no se puede deshacer.');
                            if (ok) onDeleteContact(contact.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="contact-last-message">{contact.lastMessage}</p>
                </div>
              </div>
              );
            })
            )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="scrollbar" orientation="vertical">
          <ScrollArea.Thumb className="scrollbar-thumb" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}

export default ContactList;
