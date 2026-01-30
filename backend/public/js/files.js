// File Management System module
import { api } from '../utils/api.js';
import { auth } from './auth.js';
import { notificationModule } from './notifications.js';

export const filesModule = {
  init: (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="files-section">
        <input type="text" class="search-box" id="fileSearch" placeholder="Search files..." />
        <div id="fileList" class="file-list"></div>
      </div>
    `;

    const searchInput = document.getElementById('fileSearch');
    if (searchInput) {
      searchInput.addEventListener('keyup', () => {
        filesModule.searchFiles();
      });
    }

    filesModule.loadFiles();
  },

  loadFiles: async () => {
    try {
      const data = await api.getFiles();
      filesModule.renderFiles(data.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  },

  searchFiles: async () => {
    const query = document.getElementById('fileSearch')?.value || '';
    if (!query.trim()) {
      filesModule.loadFiles();
      return;
    }

    try {
      const data = await api.searchFiles(query);
      filesModule.renderFiles(data.results || []);
    } catch (error) {
      console.error('Error searching files:', error);
    }
  },

  renderFiles: (files) => {
    const listDiv = document.getElementById('fileList');
    if (!listDiv) return;

    const isAdmin = auth.isAdmin();
    listDiv.innerHTML = '';
    files.forEach((file) => {
      const card = document.createElement('div');
      card.className = 'file-card';
      
      // Show delete button only for admin
      const deleteButton = isAdmin 
        ? `<button onclick="window.filesModule.deleteFile(${file.id}, '${file.name}')" class="delete-btn">Delete</button>`
        : '';
      
      card.innerHTML = `
        <h3>${file.name}</h3>
        <p><strong>Category:</strong> ${file.category}</p>
        <p><strong>Uploaded by:</strong> ${file.uploadedBy}</p>
        <p><strong>Size:</strong> ${file.size}</p>
        <p><strong>Downloads:</strong> ${file.downloadCount || 0}</p>
        <div class="file-actions">
          <button onclick="window.filesModule.downloadFile(${file.id}, '${file.name}')" class="download-btn">Download</button>
          ${deleteButton}
        </div>
      `;
      listDiv.appendChild(card);
    });
  },

  downloadFile: (id, name) => {
    api.downloadFile(id);
  },

  uploadFile: async (fileInput, categorySelect) => {
    if (!auth.isAdmin()) {
      alert('Admin access required');
      return;
    }

    const file = fileInput.files[0];
    if (!file) {
      alert('Please select a file');
      return;
    }

    const category = categorySelect.value;
    const user = auth.getCurrentUser();

    try {
      const data = await api.uploadFile(file, category, user?.name || 'Admin');
      if (data.success) {
        notificationModule.showNotification('File uploaded successfully!', 'success');
        fileInput.value = '';
        filesModule.loadFiles();
        return true;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    }
    return false;
  },

  deleteFile: async (id, fileName) => {
    if (!auth.isAdmin()) {
      alert('Admin access required');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const data = await api.deleteFile(id);
      if (data.success) {
        notificationModule.showNotification('File deleted successfully!', 'success');
        filesModule.loadFiles();
      } else {
        alert(data.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  }
};

window.filesModule = filesModule;
