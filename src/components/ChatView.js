import React, { useState, useRef, useEffect } from 'react';
import '../styles/chat.css';

// Genera un color determinista basado en el nombre
const generateAvatarColor = (name) => {
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#10b981'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name) => name.split(' ').map(w => w[0]?.toUpperCase()).slice(0,2).join('');

function ChatView({ contact, messages, onSendMessage }) {
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const textareaRef = useRef(null);
  const MAX_TEXTAREA_HEIGHT = 180; // px

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, contact]);

  // Auto-resize del textarea estilo ChatGPT
  const adjustTextareaHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    
    // Resetear para medir correctamente
    ta.style.height = '44px'; // altura base
    
    const scrollHeight = ta.scrollHeight;
    const maxHeight = 200; // límite máximo
    
    if (scrollHeight > 44) {
      const newHeight = Math.min(scrollHeight, maxHeight);
      ta.style.height = newHeight + 'px';
      ta.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    } else {
      ta.style.overflowY = 'hidden';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  useEffect(() => {
    // Reset al cambiar contacto
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.overflowY = 'hidden';
    }
  }, [contact]);

  if (!contact) {
    return (
      <div className="chat-panel chat-panel-empty">
        <div className="chat-panel-placeholder">
          <h3>Selecciona un contacto</h3>
          <p>Elige alguien de la lista para ver la conversación.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSendMessage(contact.id, value);
    setText('');
  };

  const handleTextareaChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className="chat-panel">
      <div className="chat-header-new">
        <div className="chat-header-left">
          <div
            className="avatar-round chat-header-avatar"
            style={{ backgroundColor: generateAvatarColor(contact.name) }}
          >
            {getInitials(contact.name)}
          </div>
          <div>
            <h4 className="chat-contact-name">{contact.name}</h4>
            <span className={`chat-contact-status status-${contact.status}`}>{
              contact.status === 'online' ? 'En línea' :
              contact.status === 'away' ? 'Ausente' :
              contact.status === 'busy' ? 'Ocupado' : 'Desconectado'
            }</span>
          </div>
        </div>
      </div>
      <div className="chat-messages-wrapper">
        <div className="chat-messages-list">
          {messages.map(m => (
            <div key={m.id} className={`chat-msg ${m.own ? 'own' : ''}`}>
              <div className={`chat-msg-bubble ${m.type==='file'?'file':''}`}>
                {m.type === 'file' ? (
                  <div className="chat-file">
                    <div className="chat-file-icon" aria-hidden="true">📎</div>
                    <div className="chat-file-meta">
                      <strong className="chat-file-name">{m.filename}</strong>
                      <span className="chat-file-size">{(m.size/1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                ) : (
                  <p>{m.text}</p>
                )}
                <span className="chat-msg-time">{new Date(m.timestamp).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</span>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
      <div className="chat-input-container-new">
        <div className="chat-input-wrapper-new">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Escribe un mensaje..."
            className="chat-textarea-new"
            rows={1}
          />
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="chat-send-btn-new"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatView;
