import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Dialog from '@radix-ui/react-dialog';
import EmojiPicker from './EmojiPicker';
import '../styles/chat.css';
import { Smile, Paperclip, FileText, ArrowUp, Copy, CalendarPlus, Download, X } from 'lucide-react';

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

function ChatView({ contact, messages, onSendMessage, onAddReminder }) {
  const [text, setText] = useState('');
  const [lastCopiedId, setLastCopiedId] = useState(null);
  const [lastDownloadedId, setLastDownloadedId] = useState(null);
  const [lastReminderAddedId, setLastReminderAddedId] = useState(null);
  // Estado modal recordatorio (versión dialog calendar)
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderMessage, setReminderMessage] = useState(null);
  const [reminderText, setReminderText] = useState('');
  const pad = n=>String(n).padStart(2,'0');
  const todayStr = (()=>{ const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })();
  const [formDate, setFormDate] = useState(todayStr);
  const startOfMonth = d=> new Date(d.getFullYear(), d.getMonth(),1);
  const addMonths = (d,n)=> new Date(d.getFullYear(), d.getMonth()+n,1);
  const formatKey = d=> `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const [pickerMonth, setPickerMonth] = useState(startOfMonth(new Date()));
  const buildMatrix = (baseDate)=>{
    const first=startOfMonth(baseDate); const firstDay=(first.getDay()+6)%7; const dim=new Date(first.getFullYear(), first.getMonth()+1,0).getDate(); const cells=[];
    for(let i=0;i<firstDay;i++){ cells.push({date:new Date(first.getFullYear(), first.getMonth(), i-firstDay+1), outside:true}); }
    for(let d=1; d<=dim; d++){ cells.push({date:new Date(first.getFullYear(), first.getMonth(), d), outside:false}); }
    while(cells.length%7!==0){ const last=cells[cells.length-1].date; cells.push({date:new Date(last.getFullYear(), last.getMonth(), last.getDate()+1), outside:true}); }
    const weeks=[]; for(let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i,i+7)); return weeks;
  };
  const pickerMatrix = useMemo(()=> buildMatrix(pickerMonth),[pickerMonth]);
  const pickerMonthLabel = pickerMonth.toLocaleDateString('es-ES',{month:'long', year:'numeric'});
  const [showEmojis, setShowEmojis] = useState(false);
  const [showActions, setShowActions] = useState(false); // menú desplegable del botón +
  const [pendingFile, setPendingFile] = useState(null); // archivo seleccionado aún no enviado
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
    if (!value && !pendingFile) return; // nada que enviar
    if (pendingFile) {
      // Enviar como mensaje de archivo con posible caption
      onSendMessage(contact.id, {
        type: 'file',
        filename: pendingFile.name,
        size: pendingFile.size,
        mime: pendingFile.type,
        text: value || undefined
      });
      setPendingFile(null);
    } else if (value) {
      onSendMessage(contact.id, value);
    }
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
    setPendingFile(file); // solo preparar, no enviar
    // Reset input para permitir mismo archivo otra vez
    e.target.value='';
    setShowActions(false);
    // Enfocar textarea para que usuario añada mensaje opcional
    requestAnimationFrame(()=> textareaRef.current?.focus());
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const humanFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    const thresh = 1024;
    if (bytes < thresh) return bytes + ' B';
    const units = ['KB','MB','GB','TB'];
    let u = -1;
    do { bytes /= thresh; ++u; } while (bytes >= thresh && u < units.length - 1);
    return bytes.toFixed(bytes < 10 ? 1 : 0) + ' ' + units[u];
  };

  const getExt = (name='') => {
    const parts = name.split('.');
    if (parts.length < 2) return '';
    return parts.pop().toLowerCase().slice(0,6);
  };

  const getFileKind = (file) => {
    if(!file) return { label:'Archivo', color:'#6366f1' };
    const ext = getExt(file.name||'');
    const map = [
      { exts:['pdf'], label:'Documento PDF', color:'#dc2626' },
      { exts:['doc','docx'], label:'Documento Word', color:'#2563eb' },
      { exts:['xls','xlsx'], label:'Hoja de cálculo', color:'#16a34a' },
      { exts:['csv'], label:'Datos CSV', color:'#0d9488' },
      { exts:['ppt','pptx'], label:'Presentación', color:'#d97706' },
      { exts:['txt','md'], label:'Texto plano', color:'#6b7280' },
      { exts:['png','jpg','jpeg','gif','webp','svg'], label:'Imagen', color:'#7c3aed' },
      { exts:['mp4','mov','avi','mkv'], label:'Video', color:'#0d9488' },
      { exts:['mp3','wav','ogg','flac'], label:'Audio', color:'#9333ea' }
    ];
    for(const g of map){ if(g.exts.includes(ext)) return { label:g.label, color:g.color }; }
    return { label:'Archivo', color:'#6366f1' };
  };

  const handleCopyMessage = (m) => {
    const content = m.type === 'file' ? m.filename : m.text;
    if (!content) return;
    navigator.clipboard?.writeText(content).then(()=>{
      setLastCopiedId(m.id);
      setTimeout(()=> setLastCopiedId(null), 1800);
    }).catch(()=>{});
  };

  const handleAddReminder = (m) => {
    setFormDate(todayStr);
    setPickerMonth(startOfMonth(new Date()));
    setReminderMessage(m);
    setReminderText(m.type==='file'? m.filename : (m.text||''));
    setReminderOpen(true);
  };

  const saveReminder = () => {
    if(!onAddReminder || !reminderMessage) return;
    onAddReminder({
      contactId: contact.id,
      messageId: reminderMessage.id,
      text: reminderText || '(sin texto)',
      date: formDate
    });
    setLastReminderAddedId(reminderMessage.id);
    setTimeout(()=> setLastReminderAddedId(null), 1400);
    setReminderOpen(false);
    setReminderMessage(null);
    setReminderText('');
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
          {messages.map(m => {
            const ext = m.type === 'file' ? getExt(m.filename) : '';
            return (
              <div key={m.id} className={`chat-msg ${m.own ? 'own' : ''}`}>
                <div className={`chat-msg-bubble ${m.type==='file'?'file':''} ${lastCopiedId===m.id?'copied':''} ${lastReminderAddedId===m.id?'reminder-added':''}`}>
                  {m.type !== 'file' && (
                    <div className="chat-msg-actions" aria-label="Acciones mensaje">
                      <button className={`chat-msg-action ${lastCopiedId===m.id ? 'copied-anim' : ''}`} title="Copiar" onClick={()=>handleCopyMessage(m)} aria-label="Copiar mensaje">
                        <Copy size={14} />
                      </button>
                      <button className="chat-msg-action" title="Añadir a recordatorios" onClick={()=>handleAddReminder(m)} aria-label="Añadir a recordatorios">
                        <CalendarPlus size={14} />
                      </button>
                    </div>
                  )}
                  {m.type === 'file' && (
                    <div className="chat-msg-actions" aria-label="Acciones archivo">
                      <button className={`chat-msg-action ${lastDownloadedId===m.id?'downloading-anim':''}`} title="Descargar" onClick={()=>{
                        const blob = new Blob(['Simulación de contenido'], { type: m.mime||'application/octet-stream' });
                        const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=m.filename||'archivo'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1500);
                        setLastDownloadedId(m.id); setTimeout(()=> setLastDownloadedId(null), 800);
                      }} aria-label="Descargar archivo">
                        <Download size={14} />
                      </button>
                    </div>
                  )}
                  {m.type === 'file' ? (
                    <>
                      <div className="chat-file-card">
                        <div className="chat-file-icon-wrap" aria-hidden="true">
                          <FileText size={18} />
                        </div>
                        <div className="chat-file-info">
                          <div className="chat-file-row">
                            <strong className="chat-file-name" title={m.filename}>{m.filename}</strong>
                          </div>
                          <div className="chat-file-meta-line">
                            <span className="chat-file-size">{humanFileSize(m.size)}</span>
                            {ext && <span className="chat-file-dot" />}
                            {ext && <span className="chat-file-ext-badge">{ext}</span>}
                          </div>
                        </div>
                      </div>
                      {m.text && <p className="chat-file-caption">{m.text}</p>}
                    </>
                  ) : (
                    <p>{m.text}</p>
                  )}
                  <span className="chat-msg-time" aria-label="Hora del mensaje">{new Date(m.timestamp).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</span>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>
      <div className="chat-input-container-new">
        <div className={`chat-input-wrapper-new chat-input-wrapper-has-plus ${pendingFile? 'has-attachment':''}`}>
            {pendingFile && (()=>{ const kind=getFileKind(pendingFile); return (
              <div className="attachment-pill" aria-label={`Archivo adjunto: ${pendingFile.name}`} onDoubleClick={()=> triggerFileDialog()}>
                <div className="ap-icon" style={{backgroundColor:kind.color}} aria-hidden="true"><FileText size={16} /></div>
                <div className="ap-info">
                  <div className="ap-name" title={pendingFile.name}>{pendingFile.name}</div>
                  <div className="ap-meta">{kind.label}</div>
                </div>
                <button type="button" className="ap-remove" aria-label="Quitar archivo" onClick={(e)=>{ e.stopPropagation(); setPendingFile(null); }}>×</button>
              </div>
            ); })()}
            <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    className={`chat-plus-inline fixed-inline ${showActions ? 'active' : ''}`}
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
            disabled={!text.trim() && !pendingFile}
            className={`chat-send-circle ${ (text.trim() || pendingFile) ? 'ready' : ''}`}
            aria-label="Enviar mensaje"
          >
            <ArrowUp size={20} strokeWidth={2} />
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
      <Dialog.Root open={reminderOpen} onOpenChange={setReminderOpen}>
        <Dialog.Portal>
          {reminderOpen && <Dialog.Overlay className="dialog-overlay" />}
          {reminderOpen && (
            <Dialog.Content className="dialog-content reminder-dialog" aria-label="Nuevo recordatorio">
              <div className="dialog-header">
                <Dialog.Title>Nuevo recordatorio</Dialog.Title>
                <Dialog.Close asChild>
                  <button className="dialog-close" aria-label="Cerrar" onClick={()=> setReminderOpen(false)}>×</button>
                </Dialog.Close>
              </div>
              <div className="dialog-body">
                <div className="form-field">
                  <span>Fecha</span>
                  <div className="mini-date-picker" role="group" aria-label="Selector de fecha">
                    <div className="mdp-header">
                      <button type="button" className="mdp-nav" onClick={()=>setPickerMonth(m=>addMonths(m,-1))} aria-label="Mes anterior">‹</button>
                      <span className="mdp-title">{pickerMonthLabel.charAt(0).toUpperCase()+pickerMonthLabel.slice(1)}</span>
                      <button type="button" className="mdp-nav" onClick={()=>setPickerMonth(m=>addMonths(m,1))} aria-label="Mes siguiente">›</button>
                    </div>
                    <div className="mdp-weekdays" aria-hidden="true">{['L','M','X','J','V','S','D'].map(d=> <div key={d}>{d}</div>)}</div>
                    <div className="mdp-grid">
                      {pickerMatrix.map((week,wi)=>(
                        <div key={wi} className="mdp-week">
                          {week.map(cell=>{
                            const key = formatKey(cell.date); const selected = key===formDate;
                            return (
                              <button key={key} type="button" className={`mdp-day ${cell.outside?'outside':''} ${selected?'selected':''}`} onClick={()=>{ if(!cell.outside) setFormDate(key); }} aria-pressed={selected} tabIndex={cell.outside?-1:0}>{cell.date.getDate()}</button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <label className="form-field">
                  <span>Descripción</span>
                  <textarea rows={3} maxLength={200} value={reminderText} onChange={e=>setReminderText(e.target.value)} placeholder="Ej: Llamar a cliente" />
                  <div className="char-counter">{reminderText.length}/200</div>
                </label>
                {reminderMessage && (
                  <div className="form-field">
                    <span>Origen</span>
                    <div className="reminder-msg-preview">{reminderMessage.type==='file'? reminderMessage.filename : reminderMessage.text}</div>
                  </div>
                )}
              </div>
              <div className="dialog-footer">
                <button className="btn-secondary" onClick={()=> setReminderOpen(false)}>Cancelar</button>
                <button className="btn-primary" disabled={!reminderText.trim()} onClick={saveReminder}>Guardar</button>
              </div>
            </Dialog.Content>
          )}
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default ChatView;
