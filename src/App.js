import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ContactList from './components/ContactList';
import ChatView from './components/ChatView';
import CalendarPage from './components/CalendarPage';
import FilesPage from './components/FilesPage';
import { generateSampleMessages } from './utils/formatUtils';
import { INITIAL_CONTACTS, USER_STATUSES, INTERVALS } from './constants/appConstants';
import './styles/App.css';

function App() {
  const [activeSection, setActiveSection] = useState('chats');
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);

  const [selectedContactId, setSelectedContactId] = useState(null);

  // Mensajes por contacto (id => array)
  const [messagesByContact, setMessagesByContact] = useState({});
  // Intervalo para lectura progresiva
  const readingIntervalRef = useRef(null);
  // Recordatorios (simples)
  const [reminders, setReminders] = useState([]); // {id, contactId, messageId, text, date, createdAt}

  const handleSelectContact = (id) => {
    setSelectedContactId(id);
    // Limpiar intervalo anterior si existía
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current);
      readingIntervalRef.current = null;
    }
    // Lectura progresiva: reducimos de uno en uno para reflejar animación de "lectura"
    setContacts(prev => prev.map(c => c.id === id ? { ...c } : c));
    const targetContact = contacts.find(c => c.id === id);
    if (targetContact && targetContact.unreadCount > 0) {
      readingIntervalRef.current = setInterval(() => {
        setContacts(prev => prev.map(c => {
          if (c.id === id) {
            if (c.unreadCount <= 1) {
              // Último -> limpiar intervalo
              if (readingIntervalRef.current) {
                clearInterval(readingIntervalRef.current);
                readingIntervalRef.current = null;
              }
              return { ...c, unreadCount: 0 };
            }
            return { ...c, unreadCount: c.unreadCount - 1 };
          }
          return c;
        }));
      }, INTERVALS.READING_PROGRESS); // velocidad de decremento usando constante
    }
    // Inicializar array si no existe
    setMessagesByContact(prev => prev[id] ? prev : { ...prev, [id]: sampleMessages(id) });
  };

  const handleSendMessage = (contactId, payload) => {
    const isFile = typeof payload === 'object' && payload && payload.type === 'file';
    const message = isFile
      ? { id: Date.now(), ...payload, own: true, timestamp: Date.now() }
      : { id: Date.now(), text: String(payload), own: true, timestamp: Date.now() };

    setMessagesByContact(prev => ({
      ...prev,
      [contactId]: [
        ...(prev[contactId] || []),
        message
      ]
    }));

    // Actualizar preview en la lista (último mensaje y hora)
    setContacts(prev => prev.map(c => c.id === contactId ? {
      ...c,
      lastMessage: isFile ? `📎 ${message.filename}` : message.text,
      timestamp: new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}),
      lastActivity: Date.now()
    } : c));
  };

  const togglePinContact = (contactId) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, pinned: !c.pinned } : c));
  };

  const deleteContact = (contactId) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
    setMessagesByContact(prev => {
      const clone = { ...prev };
      delete clone[contactId];
      return clone;
    });
    if (selectedContactId === contactId) {
      setSelectedContactId(null);
    }
  };

  const addReminder = ({ contactId, messageId, text, date }) => {
    setReminders(prev => [
      ...prev,
      {
        id: Date.now() + '-' + Math.random().toString(36).slice(2,8),
        contactId,
        messageId,
        text: text?.slice(0,300) || '(sin texto)',
        date,
        createdAt: Date.now()
      }
    ]);
    // Futuro: integración con calendario real
    console.log('Recordatorio añadido:', { contactId, messageId, text, date });
  };

  // Mensajes de ejemplo iniciales usando utilidad compartida
  const sampleMessages = useCallback(generateSampleMessages, []);

  // Memoizar contacto seleccionado y mensajes actuales para evitar recálculos
  const selectedContact = useMemo(() => 
    contacts.find(c => c.id === selectedContactId) || null, 
    [contacts, selectedContactId]
  );

  const currentMessages = useMemo(() => 
    selectedContact ? (messagesByContact[selectedContact.id] || sampleMessages(selectedContact.id)) : [],
    [selectedContact, messagesByContact, sampleMessages]
  );

  // Lista agregada de archivos (enviados y recibidos) - memoizada
  const allFileMessages = useMemo(() => {
    return contacts.flatMap(c => {
      const msgs = messagesByContact[c.id] || sampleMessages(c.id);
      return msgs.filter(m => m.type === 'file').map(m => ({
        contactId: c.id,
        contactName: c.name,
        direction: m.own ? 'Enviado' : 'Recibido',
        timestamp: m.timestamp,
        filename: m.filename,
        size: m.size,
        mime: m.mime,
        id: m.id
      }));
    }).sort((a,b)=> b.timestamp - a.timestamp);
  }, [contacts, messagesByContact, sampleMessages]);

  // Simular actualizaciones de estado en tiempo real - con cleanup mejorado
  useEffect(() => {
    const interval = setInterval(() => {
      setContacts(prevContacts => 
        prevContacts.map(contact => ({
          ...contact,
          status: Math.random() > 0.8 ? 
            USER_STATUSES[Math.floor(Math.random() * USER_STATUSES.length)] : 
            contact.status
        }))
      );
    }, INTERVALS.STATUS_UPDATE); // Cambiar estados usando constante

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Cleanup para el intervalo de lectura cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (readingIntervalRef.current) {
        clearInterval(readingIntervalRef.current);
        readingIntervalRef.current = null;
      }
    };
  }, []);

  // Memoizar total de mensajes no leídos
  const totalUnread = useMemo(() => 
    contacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
    [contacts]
  );

  // Orden derivada: primero pinned por última actividad desc, luego no pinned por última actividad desc - memoizada
  const orderedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const aTime = a.lastActivity || 0;
      const bTime = b.lastActivity || 0;
      return bTime - aTime; // más reciente primero
    });
  }, [contacts]);

  return (
    <div className="app">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        totalUnread={totalUnread}
      />
      {activeSection === 'chats' && (
        <>
          <ContactList 
            contacts={orderedContacts}
            selectedContactId={selectedContactId}
            onSelectContact={handleSelectContact}
	onTogglePin={togglePinContact}
            onDeleteContact={deleteContact}
          />
          <ChatView 
            contact={selectedContact}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onAddReminder={addReminder}
          />
        </>
      )}
      {activeSection === 'calendar' && (
        <CalendarPage />
      )}
      {activeSection === 'files' && (
        <FilesPage files={allFileMessages} />
      )}
    </div>
  );
}

export default App;
