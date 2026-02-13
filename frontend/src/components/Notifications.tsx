import React from 'react';
import { useGameStore } from '../stores/gameStore';
import type { NotificationData } from '../types';

const Notifications: React.FC = () => {
  const notifications = useGameStore((state) => state.notifications);
  const removeNotification = useGameStore((state) => state.removeNotification);

  if (notifications.length === 0) {
    return null;
  }

  const getNotificationIcon = (type: NotificationData['type']): string => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColors = (type: NotificationData['type']): string => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      case 'info':
        return 'bg-blue-500 border-blue-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  return (
    <div className="notifications fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification flex items-center p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 ease-in-out ${getNotificationColors(
            notification.type
          )} animate-slide-in-right`}
        >
          <div className="flex items-center space-x-3 flex-1">
            <span className="text-lg">
              {getNotificationIcon(notification.type)}
            </span>
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-2 text-white hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
