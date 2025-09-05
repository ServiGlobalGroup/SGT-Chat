# SGT Chat

Una aplicación de mensajería de escritorio moderna desarrollada con Electron, React y Radix UI, similar a Teams o Slack.

## Características

- 🖥️ **Aplicación de escritorio nativa** con Electron
- ⚛️ **Interfaz moderna** construida con React
- 🎨 **Componentes UI elegantes** utilizando Radix UI y Lucide React
- 💬 **Sistema de chat en tiempo real**
- 👥 **Lista de contactos** con estados de presencia dinámicos
- 🔔 **Notificaciones** y contadores de mensajes no leídos
- 🔍 **Búsqueda de conversaciones** avanzada
- 📱 **Diseño responsivo** y intuitivo
- ✨ **Animaciones fluidas** y efectos visuales modernos
- 🎯 **Navegación intuitiva** con sidebar mejorado

## Tecnologías Utilizadas

- **Electron** - Framework para aplicaciones de escritorio
- **React** - Biblioteca para interfaces de usuario
- **Radix UI** - Componentes UI primitivos y accesibles
- **Lucide React** - Iconografía moderna y consistente
- **Webpack** - Bundler de módulos
- **Babel** - Transpilador de JavaScript

## Instalación y Configuración

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd sgt-chat
```

2. Instala las dependencias:
```bash
npm install
```

## Scripts Disponibles

### Desarrollo

```bash
# Iniciar la aplicación en modo desarrollo
npm run electron-dev
```

Este comando iniciará tanto el servidor de desarrollo de React (en http://localhost:3000) como la aplicación Electron.

### Build y Distribución

```bash
# Compilar la aplicación React para producción
npm run build

# Ejecutar solo Electron
npm run electron

# Crear distribución de la aplicación
npm run dist
```

## Estructura del Proyecto

```
sgt-chat/
├── public/
│   └── index.html          # Plantilla HTML principal
├── src/
│   ├── components/         # Componentes React
│   │   ├── Sidebar.js      # Barra lateral de navegación
│   │   ├── ContactList.js  # Lista de contactos/conversaciones
│   │   └── ChatArea.js     # Área principal de chat
│   ├── styles/            # Archivos CSS
│   │   ├── global.css     # Estilos globales
│   │   └── App.css        # Estilos de la aplicación
│   ├── App.js             # Componente principal
│   └── index.js           # Punto de entrada de React
├── main.js                # Proceso principal de Electron
├── preload.js            # Script de preload para IPC seguro
├── webpack.config.js     # Configuración de Webpack
└── package.json          # Dependencias y scripts
```

## Componentes Principales

### Sidebar
- Navegación principal de la aplicación
- Avatar del usuario
- Iconos de navegación con tooltips
- Configuración y opciones de salida

### ContactList
- Lista de conversaciones activas
- Búsqueda de contactos
- Estados de presencia (online, away, offline)
- Vista previa del último mensaje

### ChatArea
- Área principal de mensajería
- Historial de mensajes
- Input para nuevos mensajes
- Header con información del contacto

## Características de Seguridad

- **Context Isolation** habilitado en Electron
- **Node Integration** deshabilitado en el renderer
- **Preload script** para comunicación IPC segura
- Validación de entrada de mensajes

## Personalización

### Temas y Estilos

Los estilos están organizados en variables CSS personalizables en `src/styles/global.css`:

```css
:root {
  --color-primary: #6366f1;
  --color-bg-primary: #ffffff;
  --color-text-primary: #1e293b;
  /* ... más variables */
}
```

### Componentes Radix UI

La aplicación utiliza los siguientes componentes de Radix UI:

- `@radix-ui/react-avatar` - Avatares de usuarios
- `@radix-ui/react-dialog` - Modales y diálogos
- `@radix-ui/react-dropdown-menu` - Menús desplegables
- `@radix-ui/react-icons` - Iconografía
- `@radix-ui/react-scroll-area` - Áreas de scroll personalizadas
- `@radix-ui/react-separator` - Separadores visuales
- `@radix-ui/react-tooltip` - Tooltips informativos

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## Próximas Características

- [ ] Integración con backend real
- [ ] Notificaciones push
- [ ] Compartir archivos e imágenes
- [ ] Llamadas de voz y video
- [ ] Cifrado end-to-end
- [ ] Múltiples salas/canales
- [ ] Personalización de temas
- [ ] Modo offline

## Soporte

Si encuentras algún problema o tienes sugerencias, por favor abre un issue en el repositorio.
