/**
 * Utilidades compartidas para formateo y manejo de datos
 */

/**
 * Formatea un timestamp a hora legible
 * @param {number} timestamp - Timestamp en milisegundos
 * @returns {string} Hora formateada
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea el tamaño de archivo a formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  
  return `${size} ${sizes[i]}`;
};

/**
 * Genera mensajes de muestra para un contacto
 * @param {number} contactId - ID del contacto
 * @returns {Array} Array de mensajes de muestra
 */
export const generateSampleMessages = (contactId) => [
  { 
    id: `${contactId}-1`, 
    text: 'Hola 👋', 
    own: false, 
    timestamp: Date.now() - 600000 
  },
  { 
    id: `${contactId}-2`, 
    text: 'Adjunto el documento.', 
    own: false, 
    timestamp: Date.now() - 580000 
  },
  { 
    id: `${contactId}-f1`, 
    type: 'file', 
    filename: 'informe-proyecto.pdf', 
    size: 234567, 
    mime: 'application/pdf', 
    own: false, 
    timestamp: Date.now() - 575000 
  },
  { 
    id: `${contactId}-3`, 
    text: 'Perfecto, recibido ✅', 
    own: true, 
    timestamp: Date.now() - 550000 
  },
  { 
    id: `${contactId}-f2`, 
    type: 'file', 
    filename: 'captura.png', 
    size: 84567, 
    mime: 'image/png', 
    own: true, 
    timestamp: Date.now() - 530000 
  }
];

/**
 * Debounce function para optimizar búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Retraso en milisegundos
 * @returns {Function} Función debounced
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};