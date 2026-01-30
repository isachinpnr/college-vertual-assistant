// FAQ Management System module
import { api } from '../utils/api.js';
import { auth } from './auth.js';
import { notificationModule } from './notifications.js';

export const faqModule = {
  manageMode: false, // Track if manage mode is active

  init: (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Reset manage mode when initializing
    faqModule.manageMode = false;

    const isAdmin = auth.isAdmin();
    
    container.innerHTML = `
      <div class="faq-section">
        ${isAdmin ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem;">
            <input type="text" class="search-box" id="faqSearch" placeholder="Search FAQs..." style="flex: 1;" />
            <button id="manageFaqToggle" onclick="window.faqModule.toggleManageMode()" style="padding: 0.75rem 1.5rem; border-radius: 10px; border: none; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; cursor: pointer; font-weight: 600; font-size: 0.875rem; transition: all 0.3s ease; white-space: nowrap; box-shadow: var(--shadow-md);">
              ⚙️ Manage FAQs
            </button>
          </div>
        ` : `
          <input type="text" class="search-box" id="faqSearch" placeholder="Search FAQs..." />
        `}
        <div id="faqList" class="faq-list"></div>
      </div>
    `;

    const searchInput = document.getElementById('faqSearch');
    if (searchInput) {
      searchInput.addEventListener('keyup', () => {
        faqModule.searchFaqs();
      });
    }

    faqModule.loadFaqs();
  },

  loadFaqs: async () => {
    try {
      // Always clear search when loading all FAQs
      const searchInput = document.getElementById('faqSearch');
      if (searchInput) {
        searchInput.value = '';
      }
      
      const data = await api.getFaqs();
      if (!data || !data.faqs) {
        console.error('Invalid FAQ data received:', data);
        // Try to load from localStorage backup
        const backupFaqs = faqModule.getBackupFaqs();
        if (backupFaqs.length > 0) {
          console.log('Loading FAQs from localStorage backup');
          faqModule.renderFaqs(backupFaqs);
          // Try to restore to backend
          faqModule.restoreBackupFaqs(backupFaqs);
        } else {
          faqModule.renderFaqs([]);
        }
        return;
      }
      
      // Ensure we have an array
      const faqsArray = Array.isArray(data.faqs) ? data.faqs : [];
      
      // Merge with localStorage backup (user-added FAQs)
      const backupFaqs = faqModule.getBackupFaqs();
      const backendIds = new Set(faqsArray.map(f => f.id));
      const newBackupFaqs = backupFaqs.filter(f => !backendIds.has(f.id));
      
      // Combine backend FAQs with new backup FAQs
      const allFaqs = [...faqsArray, ...newBackupFaqs];
      
      // Save backup
      faqModule.saveBackupFaqs(allFaqs);
      
      faqModule.renderFaqs(allFaqs);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      // Try to load from localStorage backup
      const backupFaqs = faqModule.getBackupFaqs();
      if (backupFaqs.length > 0) {
        console.log('Loading FAQs from localStorage backup (error fallback)');
        faqModule.renderFaqs(backupFaqs);
      } else {
        faqModule.renderFaqs([]);
      }
    }
  },
  
  // Backup FAQs to localStorage
  saveBackupFaqs: (faqs) => {
    try {
      // Only backup user-added FAQs (IDs > 52, which are the default FAQs)
      const userAddedFaqs = faqs.filter(f => f.id > 52 || f.isUserAdded);
      localStorage.setItem('college_assistant_faqs_backup', JSON.stringify(userAddedFaqs));
    } catch (error) {
      console.error('Error saving FAQ backup:', error);
    }
  },
  
  // Get backup FAQs from localStorage
  getBackupFaqs: () => {
    try {
      const backup = localStorage.getItem('college_assistant_faqs_backup');
      return backup ? JSON.parse(backup) : [];
    } catch (error) {
      console.error('Error loading FAQ backup:', error);
      return [];
    }
  },
  
  // Restore backup FAQs to backend
  restoreBackupFaqs: async (backupFaqs) => {
    if (!auth.isAdmin()) return;
    
    try {
      for (const faq of backupFaqs) {
        // Skip if already exists
        const existing = await api.getFaqs();
        const exists = existing.faqs && existing.faqs.some(f => f.id === faq.id);
        if (!exists) {
          await api.addFaq(faq.question, faq.answer, faq.category || 'General');
        }
      }
    } catch (error) {
      console.error('Error restoring backup FAQs:', error);
    }
  },

  searchFaqs: async () => {
    const query = document.getElementById('faqSearch')?.value || '';
    if (!query.trim()) {
      // If search is empty, load all FAQs
      faqModule.loadFaqs();
      return;
    }

    try {
      const data = await api.searchFaqs(query);
      // Ensure we have an array and render it
      const results = Array.isArray(data.results) ? data.results : [];
      faqModule.renderFaqs(results);
    } catch (error) {
      console.error('Error searching FAQs:', error);
      // On error, load all FAQs instead of showing empty
      faqModule.loadFaqs();
    }
  },

  renderFaqs: (faqs) => {
    const listDiv = document.getElementById('faqList');
    if (!listDiv) return;

    // Ensure we have a valid array
    if (!Array.isArray(faqs)) {
      console.error('Invalid FAQs array:', faqs);
      listDiv.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Error loading FAQs. Please refresh the page.</p>';
      return;
    }

    const isAdmin = auth.isAdmin();
    const helpfulFaqs = faqModule.getHelpfulFaqs(); // Get list of FAQs user has marked as helpful

    listDiv.innerHTML = '';
    
    // Show empty state if no FAQs
    if (faqs.length === 0) {
      listDiv.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No FAQs available. Add some FAQs from the Admin Panel!</p>';
      return;
    }
    
    faqs.forEach((faq) => {
      // Validate FAQ object
      if (!faq || !faq.id || !faq.question) {
        console.warn('Invalid FAQ object:', faq);
        return; // Skip invalid FAQs
      }
      const div = document.createElement('div');
      div.className = 'faq-card';
      const isHelpful = helpfulFaqs.includes(faq.id);
      const deleteButton = (isAdmin && faqModule.manageMode) ? `
        <button onclick="window.faqModule.deleteFaq(${faq.id})" class="delete-btn" style="background: linear-gradient(135deg, var(--danger), #dc2626); padding: 0.5rem 1rem; border-radius: 8px; border: none; color: white; cursor: pointer; font-weight: 600; font-size: 0.875rem; transition: all 0.3s ease; margin-top: 0.75rem;">🗑️ Delete FAQ</button>
      ` : '';
      
      div.innerHTML = `
        <h3>${faq.question}</h3>
        <p>${faq.answer}</p>
        <div class="faq-meta">
          <span class="faq-category">${faq.category}</span>
          <span class="faq-count">Asked ${faq.askedCount || 0} times</span>
          <span class="faq-helpful">${faq.helpfulCount || 0} found helpful</span>
        </div>
        ${!isHelpful ? `
          <button onclick="window.faqModule.markHelpful(${faq.id})" class="helpful-btn">👍 Helpful</button>
        ` : `
          <button class="helpful-btn" disabled style="opacity: 0.6; cursor: not-allowed;">✓ Already Marked Helpful</button>
        `}
        ${deleteButton}
      `;
      listDiv.appendChild(div);
    });
  },

  toggleManageMode: () => {
    faqModule.manageMode = !faqModule.manageMode;
    const toggleBtn = document.getElementById('manageFaqToggle');
    if (toggleBtn) {
      if (faqModule.manageMode) {
        toggleBtn.textContent = '✖️ Cancel Manage';
        toggleBtn.style.background = 'linear-gradient(135deg, var(--danger), #dc2626)';
      } else {
        toggleBtn.textContent = '⚙️ Manage FAQs';
        toggleBtn.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
      }
    }
    
    // Clear search and load all FAQs when toggling manage mode
    const searchInput = document.getElementById('faqSearch');
    if (searchInput) {
      searchInput.value = '';
    }
    
    faqModule.loadFaqs(); // Re-render with delete buttons
  },

  deleteFaq: async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
      return;
    }

    try {
      const data = await api.deleteFaq(id);
      if (data.success) {
        // Also remove from backup
        const backupFaqs = faqModule.getBackupFaqs();
        const filtered = backupFaqs.filter(f => f.id !== id);
        faqModule.saveBackupFaqs(filtered);
        
        notificationModule.showNotification('FAQ deleted successfully!', 'success');
        
        // Clear search box to show all FAQs
        const searchInput = document.getElementById('faqSearch');
        if (searchInput) {
          searchInput.value = '';
        }
        
        // Load all FAQs (not filtered by search)
        faqModule.loadFaqs();
      } else {
        alert(data.error || 'Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      // Still remove from backup even if backend fails
      const backupFaqs = faqModule.getBackupFaqs();
      const filtered = backupFaqs.filter(f => f.id !== id);
      faqModule.saveBackupFaqs(filtered);
      notificationModule.showNotification('FAQ removed from local storage', 'info');
      faqModule.loadFaqs();
    }
  },

  getHelpfulFaqs: () => {
    // Get list of FAQ IDs that current user has marked as helpful
    const user = auth.getCurrentUser();
    if (!user) return [];
    
    const key = `helpful_faqs_${user.email}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  },

  setHelpfulFaq: (faqId) => {
    // Store that current user has marked this FAQ as helpful
    const user = auth.getCurrentUser();
    if (!user) return;
    
    const key = `helpful_faqs_${user.email}`;
    const helpfulFaqs = faqModule.getHelpfulFaqs();
    if (!helpfulFaqs.includes(faqId)) {
      helpfulFaqs.push(faqId);
      localStorage.setItem(key, JSON.stringify(helpfulFaqs));
    }
  },

  markHelpful: async (id) => {
    // Check if user has already marked this FAQ as helpful
    const helpfulFaqs = faqModule.getHelpfulFaqs();
    if (helpfulFaqs.includes(id)) {
      notificationModule.showNotification('You have already marked this FAQ as helpful!', 'info');
      return;
    }

    try {
      const data = await api.markFaqHelpful(id);
      if (data.success) {
        // Store that user has marked this FAQ as helpful
        faqModule.setHelpfulFaq(id);
        notificationModule.showNotification('Thank you for your feedback!', 'success');
        faqModule.loadFaqs();
      }
    } catch (error) {
      console.error('Error marking FAQ as helpful:', error);
    }
  },

  addFaq: async (question, answer, category) => {
    if (!auth.isAdmin()) {
      alert('Admin access required');
      return;
    }

    try {
      const data = await api.addFaq(question, answer, category);
      if (data.success) {
        // Mark as user-added and save to backup
        const newFaq = { ...data.faq, isUserAdded: true };
        const backupFaqs = faqModule.getBackupFaqs();
        backupFaqs.push(newFaq);
        faqModule.saveBackupFaqs(backupFaqs);
        
        notificationModule.showNotification('FAQ added successfully!', 'success');
        
        // Clear search box to show all FAQs including the new one
        const searchInput = document.getElementById('faqSearch');
        if (searchInput) {
          searchInput.value = '';
        }
        
        // Load all FAQs (not filtered by search)
        faqModule.loadFaqs();
        return true;
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
      // Even if backend fails, save to localStorage as backup
      const backupFaqs = faqModule.getBackupFaqs();
      const maxId = backupFaqs.length > 0 ? Math.max(...backupFaqs.map(f => f.id || 0), 52) : 52;
      const newFaq = {
        id: maxId + 1,
        question,
        answer,
        category: category || 'General',
        askedCount: 0,
        helpfulCount: 0,
        isUserAdded: true
      };
      backupFaqs.push(newFaq);
      faqModule.saveBackupFaqs(backupFaqs);
      notificationModule.showNotification('FAQ saved locally (backend unavailable). Set up MongoDB for permanent storage.', 'info');
      faqModule.loadFaqs();
      return true;
    }
    return false;
  }
};

window.faqModule = faqModule;
