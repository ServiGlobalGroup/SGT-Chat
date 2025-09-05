import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ContactList from './components/ContactList';
import ChatView from './components/ChatView';
import CalendarPage from './components/CalendarPage';
import FilesPage from './components/FilesPage';
import './styles/App.css';

function App() {
  const [activeSection, setActiveSection] = useState('chats');
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'Juan Pérez',
      avatar: 'JP',
      status: 'online',
      lastMessage: 'Hola, ¿cómo estás?',
      timestamp: '10:30',
  unreadCount: 2,
  pinned: true,
  lastActivity: Date.now() - 1000 * 60 * 5 // hace 5 min
    },
    {
      id: 2,
      name: 'María García',
      avatar: 'MG',
      status: 'away',
      lastMessage: 'Perfecto, nos vemos mañana',
      timestamp: '09:15',
  unreadCount: 0,
  pinned: false,
  lastActivity: Date.now() - 1000 * 60 * 60 // hace 1 hora
    },
    {
      id: 3,
      name: 'Carlos López',
      avatar: 'CL',
      status: 'offline',
      lastMessage: 'Gracias por la información',
      timestamp: 'Ayer',
  unreadCount: 1,
  pinned: false,
  lastActivity: Date.now() - 1000 * 60 * 60 * 24 // ayer
    },
    {
      id: 4,
      name: 'Ana Martínez',
      avatar: 'AM',
      status: 'busy',
      lastMessage: 'Estoy en reunión, te escribo luego',
      timestamp: '08:45',
  unreadCount: 0,
  pinned: false,
  lastActivity: Date.now() - 1000 * 60 * 90 // hace 90 min
    },
    {
      id: 5,
      name: 'Luis Rodríguez',
      avatar: 'LR',
      status: 'online',
      lastMessage: '¿Podemos revisar el proyecto?',
      timestamp: '07:30',
  unreadCount: 3,
  pinned: false,
  lastActivity: Date.now() - 1000 * 60 * 150 // hace 150 min
    }
  ]);

  const [selectedContactId, setSelectedContactId] = useState(null);

  // Mensajes por contacto (id => array)
  const [messagesByContact, setMessagesByContact] = useState({});
  // Intervalo para lectura progresiva
  const readingIntervalRef = useRef(null);

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
      }, 450); // velocidad de decremento
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

  // Mensajes de ejemplo iniciales
  const sampleMessages = (id) => [
    { id: `${id}-1`, text: 'Hola 👋', own: false, timestamp: Date.now() - 600000 },
    { id: `${id}-2`, text: 'Adjunto el documento.', own: false, timestamp: Date.now() - 580000 },
    { id: `${id}-f1`, type: 'file', filename: 'informe-proyecto.pdf', size: 234567, mime: 'application/pdf', own: false, timestamp: Date.now() - 575000 },
    { id: `${id}-3`, text: 'Perfecto, recibido ✅', own: true, timestamp: Date.now() - 550000 },
    { id: `${id}-f2`, type: 'file', filename: 'captura.png', size: 84567, mime: 'image/png', own: true, timestamp: Date.now() - 530000 }
  ];

  const selectedContact = contacts.find(c => c.id === selectedContactId) || null;
  const currentMessages = selectedContact ? (messagesByContact[selectedContact.id] || sampleMessages(selectedContact.id)) : [];

  // Lista agregada de archivos (enviados y recibidos)
  const allFileMessages = contacts.flatMap(c => {
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

  // Simular actualizaciones de estado en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setContacts(prevContacts => 
        prevContacts.map(contact => ({
          ...contact,
          status: Math.random() > 0.8 ? 
            ['online', 'away', 'busy', 'offline'][Math.floor(Math.random() * 4)] : 
            contact.status
        }))
      );
    }, 30000); // Cambiar estados cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const totalUnread = contacts.reduce((acc,c) => acc + (c.unreadCount || 0), 0);

  // Orden derivada: primero pinned por última actividad desc, luego no pinned por última actividad desc
  const orderedContacts = [...contacts].sort((a,b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const aTime = a.lastActivity || 0;
    const bTime = b.lastActivity || 0;
    return bTime - aTime; // más reciente primero
  });

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
