import React, { useState, useEffect, useRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';
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

function Sidebar({ activeSection, onSectionChange, totalUnread = 0, onLogout }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [bellAnimating, setBellAnimating] = useState(false);
  const [userStatus, setUserStatus] = useState('online'); // 'online' | 'busy' | 'away'
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ opacity: 0 });

  const navigationItems = [
    { 
      id: 'chats', 
      icon: MessageCircle, 
      label: 'Conversaciones', 
      description: 'Tus mensajes y chats activos',
      badge: totalUnread > 0 ? totalUnread : null
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
      action: () => {
        setNotificationsEnabled(prev => !prev);
        setBellAnimating(true);
        // quitar clase animación tras terminar ciclo
        setTimeout(()=> setBellAnimating(false), 700);
      },
      active: notificationsEnabled
    },
    onLogout && {
      id: 'logout', 
      icon: LogOut, 
      label: 'Cerrar Sesión', 
      description: 'Salir de la aplicación',
      action: () => onLogout && onLogout()
    }
  ];

  const renderNavItem = (item, isActive = false, onClick = null) => {
  const IconComponent = item.icon;
    return (
      <Tooltip.Root key={item.id}>
        <Tooltip.Trigger asChild>
          <button 
            className={`sidebar-nav-item ${item.id === 'logout' ? 'logout-item' : ''} ${isActive ? 'active' : ''}`}
            onClick={onClick || (() => onSectionChange && onSectionChange(item.id))}
          >
            <div className="sidebar-nav-icon-container">
        <IconComponent size={20} strokeWidth={2} className={item.id === 'notifications' && bellAnimating ? (notificationsEnabled ? 'bell-on' : 'bell-off') : ''} />
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

  useEffect(() => {
    // Recalcular posición del indicador cuando cambia la sección activa o el totalUnread (badge puede alterar altura)
    const activeEl = navRef.current?.querySelector('.sidebar-nav-item.active');
    if (activeEl && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      const top = elRect.top - navRect.top;
      setIndicatorStyle({
        opacity: 1,
        top: top + 'px',
        height: elRect.height + 'px'
      });
    }
  }, [activeSection, totalUnread]);

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="sidebar">
        {/* Header con avatar */}
        <div className="sidebar-header">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="avatar-trigger-btn" aria-label="Cambiar estado">
                <Avatar.Root className="sidebar-avatar">
                  <Avatar.Image src="/api/placeholder/44/44" alt="Mi avatar" />
                  <Avatar.Fallback className="sidebar-avatar-fallback">TU</Avatar.Fallback>
                </Avatar.Root>
                <div className={`sidebar-status-indicator ${userStatus}`} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="status-menu" side="right" sideOffset={12} align="start">
              <DropdownMenu.Label className="status-menu-label">Estado</DropdownMenu.Label>
              <DropdownMenu.Separator className="status-menu-separator" />
              {[
                { id: 'online', label: 'Conectado', color: '#22c55e', desc: 'Disponible para chatear' },
                { id: 'busy', label: 'Ocupado', color: '#ef4444', desc: 'No molestar' },
                { id: 'away', label: 'Ausente', color: '#f59e0b', desc: 'Volveré pronto' }
              ].map(opt => {
                const active = userStatus === opt.id;
                return (
                  <DropdownMenu.Item
                    key={opt.id}
                    className={`status-menu-item ${active ? 'active' : ''}`}
                    onSelect={() => setUserStatus(opt.id)}
                  >
                    <span className="status-dot" style={{ backgroundColor: opt.color }} />
                    <span className="status-texts">
                      <strong>{opt.label}</strong>
                      <small>{opt.desc}</small>
                    </span>
                    {active && (
                      <span className="status-check" aria-hidden="true">
                        <Check size={14} />
                      </span>
                    )}
                  </DropdownMenu.Item>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        
        {/* Navegación principal */}
        <nav className="sidebar-nav" ref={navRef}>
          <div className="sidebar-active-indicator" style={indicatorStyle} />
          {navigationItems.map((item) => 
            renderNavItem(item, activeSection === item.id)
          )}
        </nav>

        {/* Footer con configuración */}
        <div className="sidebar-footer">
          {settingsItems.filter(Boolean).map((item) => 
            renderNavItem(item, item.active, item.action)
          )}
        </div>
      </div>
    </Tooltip.Provider>
  );
}

export default Sidebar;
