// Authentication module
import { api } from '../utils/api.js';

let currentUser = null;

export const auth = {
  login: async (email, password) => {
    try {
      const data = await api.login(email, password);
      if (data.success) {
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  },

  logout: () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: () => {
    if (!currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) currentUser = JSON.parse(stored);
    }
    return currentUser;
  },

  isAdmin: () => {
    const user = auth.getCurrentUser();
    return user && user.role === 'admin';
  },

  isAuthenticated: () => {
    return auth.getCurrentUser() !== null;
  }
};

// Make auth available globally for socket.js
if (typeof window !== 'undefined') {
  window.auth = auth;
}
