// Main Application Controller
import { auth } from './auth.js';
import { initSocket } from '../utils/socket.js';
import { chatModule } from './chat.js';
import { faqModule } from './faq.js';
import { filesModule } from './files.js';
import { adminModule } from './admin.js';
import { analyticsModule } from './analytics.js';
import { notificationModule, showNotification } from './notifications.js';

const app = {
  currentSection: 'chat',

  init: () => {
    // Initialize socket
    initSocket();

    // Initialize notifications
    notificationModule.init();

    // Setup mobile menu toggle
    app.setupMobileMenu();

    // Check if user is already logged in
    const user = auth.getCurrentUser();
    if (user) {
      app.updateUIForUser(user);
    }

    // Setup navigation
    app.setupNavigation();

    // Initialize default section
    app.showSection('chat');
  },

  setupMobileMenu: () => {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (mobileMenuToggle && sidebar) {
      const toggleMenu = () => {
        const isOpen = sidebar.classList.contains('open');
        sidebar.classList.toggle('open');
        if (mobileOverlay) {
          mobileOverlay.classList.toggle('show', !isOpen);
        }
        mobileMenuToggle.textContent = isOpen ? '☰' : '✕';
      };
      
      mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
      });
      
      // Close sidebar when clicking overlay
      if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => {
          sidebar.classList.remove('open');
          mobileOverlay.classList.remove('show');
          mobileMenuToggle.textContent = '☰';
        });
      }
      
      // Close sidebar when clicking nav items on mobile
      document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
            if (mobileOverlay) {
              mobileOverlay.classList.remove('show');
            }
            mobileMenuToggle.textContent = '☰';
          }
        });
      });
      
      // Handle window resize
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
          sidebar.classList.remove('open');
          if (mobileOverlay) {
            mobileOverlay.classList.remove('show');
          }
          mobileMenuToggle.textContent = '☰';
        }
      });
    }
  },

  setupNavigation: () => {
    // Navigation click handlers
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        if (section) {
          app.showSection(section);
          // Close mobile menu after selection
          if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            if (sidebar && mobileMenuToggle) {
              sidebar.classList.remove('open');
              mobileMenuToggle.textContent = '☰';
            }
          }
        }
      });
    });

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await app.handleLogin();
      });
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        app.handleLogout();
      });
    }
  },

  handleLogin: async () => {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    const result = await auth.login(email, password);
    if (result.success) {
      app.updateUIForUser(result.user);
      showNotification('Login successful!', 'success');
      
      // Update chat UI when logged in
      if (window.chatModule && window.chatModule.updateChatUI) {
        window.chatModule.updateChatUI();
      }
      
      // Refresh current section if it's files to show/hide delete buttons
      if (app.currentSection === 'files') {
        filesModule.loadFiles();
      }
    } else {
      alert(result.message || 'Invalid credentials');
    }
  },

  handleLogout: () => {
    auth.logout();
    app.updateUIForUser(null);
    showNotification('Logged out successfully', 'info');
    
    // Update chat UI when logged out
    if (window.chatModule && window.chatModule.updateChatUI) {
      window.chatModule.updateChatUI();
    }
    
    // Refresh files section if active to hide delete buttons
    if (app.currentSection === 'files') {
      filesModule.loadFiles();
    }
    
    app.showSection('chat');
  },

  updateUIForUser: (user) => {
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    const adminNav = document.getElementById('adminNav');
    const analyticsNav = document.getElementById('analyticsNav');

    if (user) {
      // Show user section
      if (loginSection) loginSection.style.display = 'none';
      if (userSection) {
        userSection.style.display = 'flex';
        const userName = userSection.querySelector('#userName');
        const userRole = userSection.querySelector('#userRole');
        if (userName) userName.textContent = user.name;
        if (userRole) {
          userRole.textContent = user.role.toUpperCase();
          userRole.className = `role-badge ${user.role}`;
        }
      }

      // Show admin features if admin
      if (user.role === 'admin') {
        if (adminNav) {
          adminNav.style.display = 'flex';
          adminNav.classList.add('admin-visible');
        }
        if (analyticsNav) {
          analyticsNav.style.display = 'flex';
          analyticsNav.classList.add('admin-visible');
        }
      } else {
        if (adminNav) {
          adminNav.style.display = 'none';
          adminNav.classList.remove('admin-visible');
        }
        if (analyticsNav) {
          analyticsNav.style.display = 'none';
          analyticsNav.classList.remove('admin-visible');
        }
      }
    } else {
      // Show login section
      if (loginSection) loginSection.style.display = 'block';
      if (userSection) userSection.style.display = 'none';
      if (adminNav) {
        adminNav.style.display = 'none';
        adminNav.classList.remove('admin-visible');
      }
      if (analyticsNav) {
        analyticsNav.style.display = 'none';
        analyticsNav.classList.remove('admin-visible');
      }
    }
  },

  showSection: (section) => {
    app.currentSection = section;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.section === section) {
        item.classList.add('active');
      }
    });

    // Update section title
    const titles = {
      chat: 'Chat Assistant',
      files: 'Files & Documents',
      faqs: 'FAQs',
      analytics: 'Analytics Dashboard',
      admin: 'Admin Panel'
    };
    const titleEl = document.getElementById('sectionTitle');
    if (titleEl) {
      titleEl.textContent = titles[section] || 'College Assistant';
    }

    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => {
      sec.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(section);
    if (targetSection) {
      targetSection.classList.add('active');

      // Initialize section module (only if not already initialized)
      switch (section) {
        case 'chat':
          if (!chatModule.initialized) {
            chatModule.init(section);
          }
          break;
        case 'faqs':
          faqModule.init(section);
          break;
        case 'files':
          filesModule.init(section);
          break;
        case 'admin':
          adminModule.init(section);
          break;
        case 'analytics':
          analyticsModule.init(section);
          break;
      }
    }
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

window.app = app;
