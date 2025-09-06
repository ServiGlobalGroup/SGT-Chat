/**
 * Constantes de datos iniciales para la aplicación
 */

/**
 * Datos iniciales de contactos
 */
export const INITIAL_CONTACTS = [
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
];

/**
 * Estados posibles de los usuarios
 */
export const USER_STATUSES = ['online', 'away', 'busy', 'offline'];

/**
 * Configuración de intervalos
 */
export const INTERVALS = {
  STATUS_UPDATE: 30000, // 30 segundos
  READING_PROGRESS: 450 // 450 ms para lectura de mensajes
};