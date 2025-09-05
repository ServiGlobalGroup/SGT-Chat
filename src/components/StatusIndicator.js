import React from 'react';

function StatusIndicator({ status, size = 'default' }) {
  const sizeClasses = {
    small: 'w-2 h-2',
    default: 'w-3 h-3',
    large: 'w-4 h-4'
  };

  const statusClasses = {
    online: 'bg-green-500 shadow-green-500/50',
    away: 'bg-yellow-500 shadow-yellow-500/50',
    busy: 'bg-red-500 shadow-red-500/50',
    offline: 'bg-gray-400 shadow-gray-400/50'
  };

  return (
    <div 
      className={`
        status-indicator 
        ${sizeClasses[size]} 
        ${statusClasses[status]} 
        ${status === 'online' ? 'animate-pulse' : ''}
      `}
    />
  );
}

export default StatusIndicator;
