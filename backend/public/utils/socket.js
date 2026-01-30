// Socket.io utility for real-time communication
let socket = null;
const listeners = {
  chatResponse: null,
  notification: null,
  chatHistory: null
};

export const initSocket = () => {
  if (!socket) {
    // Socket.io URL - supports both development and production
    // In production, set this via Netlify environment variable or update directly
    const SOCKET_URL = window.SOCKET_IO_URL || 
                       (window.location.hostname === 'localhost' ? '' : 'https://your-college-assistant-backend.railway.app');
    socket = io(SOCKET_URL);
  }
  return socket;
};

export const getSocket = () => socket;

export const socketEvents = {
  onChatResponse: (callback) => {
    if (socket) {
      // Remove existing listener if any
      if (listeners.chatResponse) {
        socket.off('chat_response', listeners.chatResponse);
      }
      listeners.chatResponse = callback;
      socket.on('chat_response', callback);
    }
  },
  
  onNotification: (callback) => {
    if (socket) {
      // Remove existing listener if any
      if (listeners.notification) {
        socket.off('notification', listeners.notification);
      }
      listeners.notification = callback;
      socket.on('notification', callback);
    }
  },
  
  onChatHistory: (callback) => {
    if (socket) {
      // Remove existing listener if any
      if (listeners.chatHistory) {
        socket.off('chat_history', listeners.chatHistory);
      }
      listeners.chatHistory = callback;
      socket.on('chat_history', callback);
    }
  },
  
  sendChatMessage: (message, user) => {
    if (socket) {
      // Check authentication status from window.auth (set by auth.js)
      const isAuthenticated = window.auth && typeof window.auth.isAuthenticated === 'function'
        ? window.auth.isAuthenticated()
        : false;
      
      socket.emit('chat_message', { message, user, isAuthenticated });
    }
  },
  
  disconnect: () => {
    if (socket) socket.disconnect();
    socket = null;
    listeners.chatResponse = null;
    listeners.notification = null;
    listeners.chatHistory = null;
  }
};
