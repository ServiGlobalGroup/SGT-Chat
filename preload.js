const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Obtener versión de la aplicación
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  
  // Enviar mensajes
  sendMessage: (message) => ipcRenderer.invoke('send-message', message),
  
  // Escuchar eventos del main process
  onNotification: (callback) => {
    ipcRenderer.on('notification', callback);
  },
  
  // Remover listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
