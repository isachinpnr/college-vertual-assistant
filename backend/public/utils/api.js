// API utility functions for making HTTP requests
// API Base URL - uses Netlify Functions when deployed
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:4100' 
  : '/.netlify/functions/api';

export const api = {
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  // FAQ endpoints
  getFaqs: async () => {
    const response = await fetch(`${API_BASE}/api/faqs`);
    return response.json();
  },

  searchFaqs: async (query) => {
    const response = await fetch(`${API_BASE}/api/faqs/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  addFaq: async (question, answer, category) => {
    const response = await fetch(`${API_BASE}/api/faqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, category })
    });
    return response.json();
  },

  markFaqHelpful: async (id) => {
    const response = await fetch(`${API_BASE}/api/faqs/${id}/helpful`, {
      method: 'POST'
    });
    return response.json();
  },

  deleteFaq: async (id) => {
    const response = await fetch(`${API_BASE}/api/faqs/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // File endpoints
  getFiles: async () => {
    const response = await fetch(`${API_BASE}/api/files`);
    return response.json();
  },

  searchFiles: async (query) => {
    const response = await fetch(`${API_BASE}/api/files/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  uploadFile: async (file, category, uploadedBy) => {
    // Convert file to base64 for Netlify Functions
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1]; // Remove data:type;base64, prefix
        const response = await fetch(`${API_BASE}/api/files/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
            fileType: file.type,
            category: category,
            uploadedBy: uploadedBy
          })
        });
        const result = await response.json();
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  downloadFile: (id) => {
    window.open(`${API_BASE}/api/files/download/${id}`, '_blank');
  },

  deleteFile: async (id) => {
    const response = await fetch(`${API_BASE}/api/files/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Analytics endpoints
  getAnalytics: async () => {
    const response = await fetch(`${API_BASE}/api/analytics`);
    return response.json();
  },

  // Notifications endpoints
  getNotifications: async () => {
    const response = await fetch(`${API_BASE}/api/notifications`);
    return response.json();
  },

  // Chat endpoints (replaces Socket.io)
  sendChatMessage: async (message, user, isAuthenticated) => {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, user, isAuthenticated })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat API error:', response.status, errorText);
      throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Invalid response type, got:', contentType, text.substring(0, 100));
      throw new Error('Server returned non-JSON response');
    }
    
    return response.json();
  },

  getChatHistory: async () => {
    const response = await fetch(`${API_BASE}/api/chat/history`);
    
    if (!response.ok) {
      // If history endpoint doesn't exist or fails, return empty history
      if (response.status === 404) {
        return { history: [] };
      }
      const errorText = await response.text();
      console.error('Chat history API error:', response.status, errorText);
      throw new Error(`Chat history API error: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, return empty history instead of throwing
      return { history: [] };
    }
    
    return response.json();
  }
};
