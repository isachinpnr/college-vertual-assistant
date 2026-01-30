// Notification System (Advanced) module
import { initSocket, socketEvents } from '../utils/socket.js';

export const notificationModule = {
  notifications: [],

  init: () => {
    // Setup socket listener for real-time notifications
    socketEvents.onNotification((data) => {
      notificationModule.showNotification(data.message || data.title || 'New notification');
    });

    // Create notification container
    if (!document.getElementById('notificationContainer')) {
      const container = document.createElement('div');
      container.id = 'notificationContainer';
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
  },

  showNotification: (message, type = 'info') => {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type} notification-show`;
    notification.textContent = message;

    container.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('notification-show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  },

  loadNotifications: async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      notificationModule.notifications = data.notifications || [];
      return notificationModule.notifications;
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }
};

// Make it globally accessible
window.showNotification = (message, type) => {
  notificationModule.showNotification(message, type);
};

export const showNotification = notificationModule.showNotification;
