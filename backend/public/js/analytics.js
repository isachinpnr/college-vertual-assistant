// Analytics Dashboard module
import { api } from '../utils/api.js';

export const analyticsModule = {
  init: (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="analytics-section">
        <h2>Analytics Dashboard</h2>
        <div class="analytics-grid" id="analyticsGrid"></div>
        <div class="analytics-details">
          <div class="analytics-column">
            <h3>Top Asked Questions</h3>
            <div id="topFaqs"></div>
          </div>
          <div class="analytics-column">
            <h3>Most Downloaded Files</h3>
            <div id="topFiles"></div>
          </div>
        </div>
      </div>
    `;

    analyticsModule.loadAnalytics();
  },

  loadAnalytics: async () => {
    try {
      const data = await api.getAnalytics();
      analyticsModule.renderAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  },

  renderAnalytics: (data) => {
    // Stats grid
    const grid = document.getElementById('analyticsGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="stat-card">
          <h3>Total FAQs</h3>
          <div class="value">${data.totalFaqs || 0}</div>
        </div>
        <div class="stat-card">
          <h3>Total Files</h3>
          <div class="value">${data.totalFiles || 0}</div>
        </div>
        <div class="stat-card">
          <h3>Total Questions Asked</h3>
          <div class="value">${data.totalQuestions || 0}</div>
        </div>
      `;
    }

    // Top FAQs
    const topFaqsDiv = document.getElementById('topFaqs');
    if (topFaqsDiv) {
      topFaqsDiv.innerHTML = '';
      (data.topFaqs || []).forEach((faq) => {
        const div = document.createElement('div');
        div.className = 'analytics-item';
        div.innerHTML = `
          <h4>${faq.question}</h4>
          <p>Asked ${faq.askedCount || 0} times</p>
        `;
        topFaqsDiv.appendChild(div);
      });
    }

    // Top Files
    const topFilesDiv = document.getElementById('topFiles');
    if (topFilesDiv) {
      topFilesDiv.innerHTML = '';
      (data.topFiles || []).forEach((file) => {
        const div = document.createElement('div');
        div.className = 'analytics-item';
        div.innerHTML = `
          <h4>${file.name}</h4>
          <p>Downloaded ${file.downloadCount || 0} times</p>
        `;
        topFilesDiv.appendChild(div);
      });
    }
  }
};

window.analyticsModule = analyticsModule;
