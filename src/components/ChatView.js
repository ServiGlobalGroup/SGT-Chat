import React, { useState, useRef, useEffect } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import EmojiPicker from './EmojiPicker';
import '../styles/chat.css';
import { Smile, Paperclip, FileText, Send } from 'lucide-react';

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
  const [showEmojis, setShowEmojis] = useState(false);
  const [showActions, setShowActions] = useState(false); // menú desplegable del botón +
  const pickerRef = useRef(null);
  const endRef = useRef(null);
  const textareaRef = useRef(null);
  const MAX_TEXTAREA_HEIGHT = 180; // px
  const actionsRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Cerrar panel emojis con Escape (una sola vez, independiente del estado)
  useEffect(()=>{
    const onKey = (e) => { if (e.key === 'Escape'){ setShowEmojis(false); setShowActions(false);} };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[]);

  // Cerrar al hacer click fuera (acciones + emoji)
  useEffect(()=>{
    if(!(showEmojis || showActions)) return;
    const handleClick = (e) => {
      const target = e.target;
      const clickedToggle = target.closest && target.closest('.chat-plus-inline');
      if(clickedToggle) return;
      const insidePicker = pickerRef.current && pickerRef.current.contains(target);
      const insideActions = actionsRef.current && actionsRef.current.contains(target);
      if(!insidePicker && !insideActions){
        setShowEmojis(false); setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return ()=> document.removeEventListener('mousedown', handleClick);
  },[showEmojis, showActions]);

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

  const insertEmoji = (emoji) => {
    setText(prev => prev + emoji); // TODO: insertar en posición del cursor en mejora futura
    // Enfocar y ajustar altura
    requestAnimationFrame(()=>{
      textareaRef.current?.focus();
      adjustTextareaHeight();
    });
    setShowEmojis(false);
  };

  const handleSelectFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if(!file || !contact) return;
    // Enviar como mensaje de archivo usando protocolo flexible (objeto)
    onSendMessage(contact.id, { type:'file', filename:file.name, size:file.size, mime:file.type });
    // Reset input para permitir mismo archivo otra vez
    e.target.value='';
    setShowActions(false);
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

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
                    <div className="chat-file-icon" aria-hidden="true"><FileText size={18} /></div>
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
        <div className="chat-input-wrapper-new chat-input-wrapper-has-plus">
            <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    className={`chat-plus-inline ${showActions ? 'active' : ''}`}
                    aria-label="Abrir menú de acciones"
                    aria-haspopup="true"
                    aria-expanded={showActions}
                    onClick={()=> {
                      // Si está abierto el panel de emojis lo cerramos y togglamos acciones
                      setShowEmojis(false);
                      setShowActions(v=>!v);
                    }}
                  >
                    +
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="tooltip-content" side="top" sideOffset={10}>
                    <div className="tooltip-header"><strong>Añadir archivos y más</strong></div>
                    <div className="tooltip-description">Adjunta archivos o inserta emojis</div>
                    <Tooltip.Arrow className="tooltip-arrow" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
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
            aria-label="Enviar mensaje"
          >
            <Send size={22} strokeWidth={2} />
          </button>
            <input ref={fileInputRef} type="file" style={{display:'none'}} onChange={handleSelectFile} />
            {showActions && (
              <div className="chat-actions-popover" ref={actionsRef}>
                <div className="status-menu actions-menu" role="menu" aria-label="Acciones de inserción">
                  <div className="status-menu-label">ACCIONES</div>
                  <div className="status-menu-item" tabIndex={0} onClick={()=>{ setShowActions(false); setShowEmojis(true); }} role="menuitem">
                    <span className="chat-action-ico" aria-hidden="true"><Smile size={18} /></span>
                    <div className="status-texts">
                      <strong>Emoji</strong>
                      <small>Insertar símbolo</small>
                    </div>
                  </div>
                  <div className="status-menu-item" tabIndex={0} onClick={triggerFileDialog} role="menuitem">
                    <span className="chat-action-ico" aria-hidden="true"><Paperclip size={18} /></span>
                    <div className="status-texts">
                      <strong>Archivo</strong>
                      <small>Adjuntar documento</small>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showEmojis && !showActions && (
              <div className="emoji-popover" ref={pickerRef}>
                <EmojiPicker onSelect={(em)=>{ insertEmoji(em); }} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default ChatView;
