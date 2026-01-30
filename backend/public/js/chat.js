// Chat Assistant module (HTTP-based for Netlify)
import { api } from '../utils/api.js';
import { auth } from './auth.js';

export const chatModule = {
  initialized: false,

  init: (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Only initialize once
    if (chatModule.initialized && document.getElementById('chatMessages')) {
      return;
    }

    const isLoggedIn = auth.isAuthenticated();
    const welcomeMessage = isLoggedIn 
      ? `Welcome! I'm your intelligent college virtual assistant, here to help you 24/7. I can assist you with:
            
• 📚 Academic queries (exams, schedules, attendance)
• 🏛️ Administration (ID cards, certificates, fees)
• 📖 Library services and resources
• 🏠 Hostel and accommodation
• 💼 Placements and career guidance
• 💻 IT support and technical help
• 🎯 And much more!

Just ask me anything, and I'll provide you with the information you need!`
      : `👋 Welcome to College Virtual Assistant!

🔐 **Please login first to use the chat assistant.**

To get started:
1. Click on the login button in the top-right corner
2. Enter your email and password
3. Once logged in, you can ask me anything about college!

I can help you with:
• 📚 Academic queries (exams, schedules, attendance)
• 🏛️ Administration (ID cards, certificates, fees)
• 📖 Library services and resources
• 🏠 Hostel and accommodation
• 💼 Placements and career guidance
• 💻 IT support and technical help

**Login now to start chatting!** 🔓`;

    container.innerHTML = `
      <div class="chat-container">
        <div class="chat-messages" id="chatMessages">
          <div class="message bot">
            <div class="message-header">🎓 College Assistant</div>
            <div>${welcomeMessage}</div>
          </div>
        </div>
        <div class="chat-input-area">
          <input type="text" id="chatInput" placeholder="${isLoggedIn ? 'Ask me anything about college...' : 'Please login first to ask questions...'}" ${!isLoggedIn ? 'disabled' : ''} />
          <button onclick="window.chatModule.sendMessage()" ${!isLoggedIn ? 'disabled' : ''}>Send</button>
        </div>
      </div>
    `;

    // Load chat history if available
    chatModule.loadChatHistory();

    // Enter key to send
    const input = document.getElementById('chatInput');
    if (input) {
      // Remove existing listener if any
      const newInput = input.cloneNode(true);
      input.parentNode.replaceChild(newInput, input);
      
      newInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          chatModule.sendMessage();
        }
      });
    }

    chatModule.initialized = true;
  },

  addMessage: (text, type) => {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    const user = auth.getCurrentUser();
    msgDiv.innerHTML = `
      <div class="message-header">${type === 'user' ? (user?.name || 'You') : 'Assistant'}</div>
      <div>${text}</div>
    `;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  },

  sendMessage: async () => {
    // Check if user is logged in
    if (!auth.isAuthenticated()) {
      const loginMessages = [
        "🔐 Please login first to use the chat assistant! Click the login button in the top-right corner.",
        "⚠️ You need to be logged in to ask questions. Please login to continue.",
        "🚫 Access denied! Please login first to chat with the assistant.",
        "👤 Authentication required! Please login to ask questions.",
        "🔒 This feature requires login. Please login to access the chat assistant."
      ];
      
      // Show random login message to avoid repetition
      const randomMessage = loginMessages[Math.floor(Math.random() * loginMessages.length)];
      chatModule.addMessage(randomMessage, 'bot');
      return;
    }

    const input = document.getElementById('chatInput');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    // Prevent sending duplicate messages immediately
    const messagesDiv = document.getElementById('chatMessages');
    if (messagesDiv) {
      const lastUserMsg = Array.from(messagesDiv.children).reverse().find(
        msg => msg.classList.contains('user')
      );
      if (lastUserMsg && lastUserMsg.textContent.includes(message)) {
        // Same message sent recently, ignore
        input.value = '';
        return;
      }
    }

    const user = auth.getCurrentUser();
    chatModule.addMessage(message, 'user');
    input.value = '';

    // Send message via HTTP API (replaces Socket.io)
    try {
      const response = await api.sendChatMessage(
        message, 
        user?.name || 'Student', 
        auth.isAuthenticated()
      );
      if (response && response.message) {
        chatModule.addMessage(response.message, 'bot');
      }
    } catch (error) {
      console.error('Chat error:', error);
      chatModule.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
  },

  loadChatHistory: async () => {
    try {
      const response = await api.getChatHistory();
      if (response && response.history) {
        const messagesDiv = document.getElementById('chatMessages');
        if (messagesDiv && response.history.length > 0) {
          // Clear existing messages except welcome message
          const welcomeMsg = messagesDiv.firstElementChild;
          messagesDiv.innerHTML = '';
          if (welcomeMsg) messagesDiv.appendChild(welcomeMsg);
          
          // Add history messages
          response.history.forEach(msg => {
            if (msg.type === 'user' || msg.type === 'bot') {
              chatModule.addMessage(msg.message, msg.type);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  },

  updateChatUI: () => {
    // Update chat UI when login status changes
    const isLoggedIn = auth.isAuthenticated();
    const input = document.getElementById('chatInput');
    const sendButton = document.querySelector('.chat-input-area button');
    
    if (input) {
      input.disabled = !isLoggedIn;
      input.placeholder = isLoggedIn 
        ? 'Ask me anything about college...' 
        : 'Please login first to ask questions...';
    }
    
    if (sendButton) {
      sendButton.disabled = !isLoggedIn;
    }

    // Update welcome message if chat is initialized
    if (chatModule.initialized) {
      const messagesDiv = document.getElementById('chatMessages');
      if (messagesDiv && messagesDiv.children.length > 0) {
        const welcomeMsg = messagesDiv.firstElementChild;
        if (welcomeMsg && welcomeMsg.classList.contains('bot')) {
          const isLoggedIn = auth.isAuthenticated();
          const welcomeMessage = isLoggedIn 
            ? `Welcome! I'm your intelligent college virtual assistant, here to help you 24/7. I can assist you with:
            
• 📚 Academic queries (exams, schedules, attendance)
• 🏛️ Administration (ID cards, certificates, fees)
• 📖 Library services and resources
• 🏠 Hostel and accommodation
• 💼 Placements and career guidance
• 💻 IT support and technical help
• 🎯 And much more!

Just ask me anything, and I'll provide you with the information you need!`
            : `👋 Welcome to College Virtual Assistant!

🔐 **Please login first to use the chat assistant.**

To get started:
1. Click on the login button in the top-right corner
2. Enter your email and password
3. Once logged in, you can ask me anything about college!

I can help you with:
• 📚 Academic queries (exams, schedules, attendance)
• 🏛️ Administration (ID cards, certificates, fees)
• 📖 Library services and resources
• 🏠 Hostel and accommodation
• 💼 Placements and career guidance
• 💻 IT support and technical help

**Login now to start chatting!** 🔓`;
          
          welcomeMsg.querySelector('div:last-child').textContent = welcomeMessage;
        }
      }
    }
  }
};

// Make it globally accessible
window.chatModule = chatModule;
