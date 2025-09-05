import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ContactList from './components/ContactList';
import ChatView from './components/ChatView';
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
  pinned: true
    },
    {
      id: 2,
      name: 'María García',
      avatar: 'MG',
      status: 'away',
      lastMessage: 'Perfecto, nos vemos mañana',
      timestamp: '09:15',
  unreadCount: 0,
  pinned: false
    },
    {
      id: 3,
      name: 'Carlos López',
      avatar: 'CL',
      status: 'offline',
      lastMessage: 'Gracias por la información',
      timestamp: 'Ayer',
  unreadCount: 1,
  pinned: false
    },
    {
      id: 4,
      name: 'Ana Martínez',
      avatar: 'AM',
      status: 'busy',
      lastMessage: 'Estoy en reunión, te escribo luego',
      timestamp: '08:45',
  unreadCount: 0,
  pinned: false
    },
    {
      id: 5,
      name: 'Luis Rodríguez',
      avatar: 'LR',
      status: 'online',
      lastMessage: '¿Podemos revisar el proyecto?',
      timestamp: '07:30',
  unreadCount: 3,
  pinned: false
    }
  ]);

  const [selectedContactId, setSelectedContactId] = useState(null);

  // Mensajes por contacto (id => array)
  const [messagesByContact, setMessagesByContact] = useState({});

  const handleSelectContact = (id) => {
    setSelectedContactId(id);
    // Marcar como leído: eliminar burbuja de notificación
    setContacts(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
    // Inicializar array si no existe
    setMessagesByContact(prev => prev[id] ? prev : { ...prev, [id]: sampleMessages(id) });
  };

  const handleSendMessage = (contactId, text) => {
    setMessagesByContact(prev => ({
      ...prev,
      [contactId]: [
        ...(prev[contactId] || []),
        { id: Date.now(), text, own: true, timestamp: Date.now() }
      ]
    }));
    // Actualizar preview en la lista (último mensaje y hora)
    setContacts(prev => prev.map(c => c.id === contactId ? {
      ...c,
      lastMessage: text,
      timestamp: new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}),
    } : c));
  };

  const togglePinContact = (contactId) => {
    setContacts(prev => {
      const updated = prev.map(c => c.id === contactId ? { ...c, pinned: !c.pinned } : c);
      // Orden estable: separar pinned y no pinned respetando orden original
      const pinned = updated.filter(c => c.pinned);
      const unpinned = updated.filter(c => !c.pinned);
      return [...pinned, ...unpinned];
    });
  };

  // Mensajes de ejemplo iniciales
  const sampleMessages = (id) => [
    { id: `${id}-1`, text: 'Hola 👋', own: false, timestamp: Date.now() - 600000 },
    { id: `${id}-2`, text: 'Esto es una vista de ejemplo del chat.', own: false, timestamp: Date.now() - 550000 },
  ];

  const selectedContact = contacts.find(c => c.id === selectedContactId) || null;
  const currentMessages = selectedContact ? (messagesByContact[selectedContact.id] || sampleMessages(selectedContact.id)) : [];

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

  // Orden derivada (ya mantenemos estable en togglePin, pero aseguramos en render)
  const orderedContacts = [...contacts].sort((a,b) => (a.pinned === b.pinned) ? 0 : (a.pinned ? -1 : 1));

  return (
    <div className="app">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        totalUnread={totalUnread}
      />
      <ContactList 
        contacts={orderedContacts}
        selectedContactId={selectedContactId}
        onSelectContact={handleSelectContact}
  onTogglePin={togglePinContact}
      />
      <ChatView 
        contact={selectedContact}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

export default App;
