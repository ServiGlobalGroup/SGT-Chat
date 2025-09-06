/**
 * Utilidades compartidas para generación de avatares
 */

// Colores disponibles para avatares
const AVATAR_COLORS = [
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

/**
 * Genera un color único basado en el nombre del usuario
 * @param {string} name - Nombre del usuario
 * @returns {string} Color en formato hexadecimal
 */
export const generateAvatarColor = (name) => {
  if (!name || typeof name !== 'string') {
    return AVATAR_COLORS[0]; // Color por defecto
  }
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

/**
 * Extrae las iniciales del nombre del usuario
 * @param {string} name - Nombre del usuario
 * @returns {string} Iniciales del nombre (máximo 2 caracteres)
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') {
    return '??';
  }
  
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};