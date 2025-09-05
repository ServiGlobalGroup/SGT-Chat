import React from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Search, Pin, Trash2 } from 'lucide-react';
import '../styles/avatars.css';

function ContactList({ contacts, selectedContactId, onSelectContact, onTogglePin, onDeleteContact }) {
  // Función para generar color único basado en el nombre
  const generateAvatarColor = (name) => {
    const colors = [
      '#ef4444', // Rojo
      '#f97316', // Naranja
      '#eab308', // Amarillo
      '#22c55e', // Verde
      '#06b6d4', // Cyan
      '#3b82f6', // Azul
      '#6366f1', // Indigo
      '#8b5cf6', // Violeta
      '#ec4899', // Rosa
      '#10b981', // Esmeralda
    ];
    
    // Usar el código hash del nombre para seleccionar un color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Función para extraer iniciales del nombre
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
  <div className="contact-list compact">
      <div className="contact-list-header">
        <h2>Chats</h2>
        <div className="search-container">
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Buscar conversaciones..." 
            className="search-input"
          />
        </div>
      </div>

      <ScrollArea.Root className="contact-list-scroll">
        <ScrollArea.Viewport className="contact-list-viewport">
          <div className="contact-list-content">
            {contacts.map((contact) => {
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
            })}
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
