import React, { useState, useRef, useEffect } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Separator from '@radix-ui/react-separator';
import { 
  Send, 
  Smile, 
  Plus,
  MoreVertical,
  MessageCircle
} from 'lucide-react';

function ChatArea({ selectedContact, messages, onSendMessage }) {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const MAX_TEXTAREA_HEIGHT = 180; // px — límite antes de activar scroll interno

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize del textarea mientras no supere el límite
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    // Reset para calcular correctamente
    ta.style.height = 'auto';
    const newHeight = Math.min(ta.scrollHeight, MAX_TEXTAREA_HEIGHT);
    ta.style.height = newHeight + 'px';
    ta.style.overflowY = ta.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  }, [messageInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  if (!selectedContact) {
    return (
      <div className="chat-area">
        <div className="chat-empty">
          <div className="chat-empty-content">
            <MessageCircle className="chat-empty-icon" size={64} />
            <h3>Selecciona un chat</h3>
            <p>Elige un contacto para comenzar a conversar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      {/* Header del chat */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div 
            className="chat-header-avatar-new"
            style={{ backgroundColor: generateAvatarColor(selectedContact.name) }}
          >
            {getInitials(selectedContact.name)}
          </div>
          <div>
            <h3 className="chat-header-name">{selectedContact.name}</h3>
            <p className="chat-header-status">
              {selectedContact.status === 'online' ? 'En línea' : 
               selectedContact.status === 'away' ? 'Ausente' : 
               selectedContact.status === 'busy' ? 'Ocupado' :
               'Desconectado'}
            </p>
          </div>
        </div>
        <button className="chat-header-menu">
          <MoreVertical size={20} />
        </button>
      </div>

      <Separator.Root className="chat-separator" />

      {/* Área de mensajes */}
      <ScrollArea.Root className="chat-messages-scroll">
        <ScrollArea.Viewport className="chat-messages-viewport">
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isOwn ? 'message-own' : 'message-other'}`}
              >
                {!message.isOwn && (
                  <div 
                    className="message-avatar-new"
                    style={{ backgroundColor: generateAvatarColor(selectedContact.name) }}
                  >
                    {getInitials(selectedContact.name)}
                  </div>
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    <p className="message-text">{message.content}</p>
                  </div>
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="scrollbar" orientation="vertical">
          <ScrollArea.Thumb className="scrollbar-thumb" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* Input de mensaje */}
      <div className="chat-input-container">
        <Separator.Root className="chat-separator" />
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="chat-input-wrapper">
            <span className="chat-input-plus" aria-label="Agregar" role="button">+</span>
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="chat-input"
              rows={1}
            />
            <button type="button" className="chat-input-button">
              <Smile size={18} />
            </button>
          </div>
          <button 
            type="submit" 
            className="chat-send-button"
            disabled={!messageInput.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatArea;
