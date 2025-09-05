const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // Crear la ventana principal
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Opcional: icono de la app
    titleBarStyle: 'default',
    show: false // No mostrar hasta que esté listo
  });

  // Cargar la aplicación React
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Abrir DevTools en desarrollo
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Mostrar la ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Manejar el cierre de la ventana
  mainWindow.on('closed', () => {
    app.quit();
  });

  return mainWindow;
}

// Este método será llamado cuando Electron haya terminado de inicializarse
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // En macOS, recrear la ventana cuando se hace clic en el icono del dock
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
  // En macOS, es común que las aplicaciones permanezcan activas
  // hasta que el usuario las cierre explícitamente con Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejar eventos IPC para comunicación con el renderer
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

// Ejemplo de evento para enviar mensajes
ipcMain.handle('send-message', async (event, message) => {
  // Aquí puedes implementar la lógica para enviar mensajes
  console.log('Mensaje recibido:', message);
  return { success: true, timestamp: Date.now() };
});
