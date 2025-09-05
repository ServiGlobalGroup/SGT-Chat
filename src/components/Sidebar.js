import React, { useState } from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  MessageCircle,
  Users,
  Calendar,
  Files,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';

function Sidebar({ activeSection, onSectionChange, totalUnread = 0 }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const navigationItems = [
    { 
      id: 'chats', 
      icon: MessageCircle, 
      label: 'Conversaciones', 
      description: 'Tus mensajes y chats activos',
      badge: totalUnread > 0 ? totalUnread : null
    },
    { 
      id: 'contacts', 
      icon: Users, 
      label: 'Contactos', 
      description: 'Gestionar tu lista de contactos'
    },
    { 
      id: 'calendar', 
      icon: Calendar, 
      label: 'Calendario', 
      description: 'Eventos y reuniones programadas'
    },
    { 
      id: 'files', 
      icon: Files, 
      label: 'Archivos', 
      description: 'Documentos y archivos compartidos'
    }
  ];

  const settingsItems = [
    { 
      id: 'notifications', 
      icon: Bell, 
      label: 'Notificaciones', 
      description: notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones',
      action: () => setNotificationsEnabled(!notificationsEnabled),
      active: notificationsEnabled
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'Configuración', 
      description: 'Ajustes de la aplicación'
    },
    { 
      id: 'logout', 
      icon: LogOut, 
      label: 'Cerrar Sesión', 
      description: 'Salir de la aplicación'
    }
  ];

  const renderNavItem = (item, isActive = false, onClick = null) => {
    const IconComponent = item.icon;
    return (
      <Tooltip.Root key={item.id}>
        <Tooltip.Trigger asChild>
          <button 
            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClick || (() => onSectionChange && onSectionChange(item.id))}
          >
            <div className="sidebar-nav-icon-container">
              <IconComponent size={20} strokeWidth={2} />
              {item.badge && (
                <span className="sidebar-nav-badge">{item.badge}</span>
              )}
            </div>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tooltip-content" side="right" sideOffset={12}>
            <div className="tooltip-header">
              <strong>{item.label}</strong>
            </div>
            {item.description && (
              <div className="tooltip-description">
                {item.description}
              </div>
            )}
            <Tooltip.Arrow className="tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  };

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="sidebar">
        {/* Header con avatar */}
        <div className="sidebar-header">
          <Avatar.Root className="sidebar-avatar">
            <Avatar.Image src="/api/placeholder/44/44" alt="Mi avatar" />
            <Avatar.Fallback className="sidebar-avatar-fallback">
              TU
            </Avatar.Fallback>
          </Avatar.Root>
          <div className="sidebar-status-indicator online" />
        </div>
        
        {/* Navegación principal */}
        <nav className="sidebar-nav">
          {navigationItems.map((item) => 
            renderNavItem(item, activeSection === item.id)
          )}
        </nav>

        {/* Footer con configuración */}
        <div className="sidebar-footer">
          {settingsItems.map((item) => 
            renderNavItem(item, item.active, item.action)
          )}
        </div>
      </div>
    </Tooltip.Provider>
  );
}

export default Sidebar;
