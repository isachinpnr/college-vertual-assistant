// Admin Panel module
import { auth } from './auth.js';
import { faqModule } from './faq.js';
import { filesModule } from './files.js';

export const adminModule = {
  init: (containerId) => {
    if (!auth.isAdmin()) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '<p>Admin access required</p>';
      }
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="admin-panel">
        <div class="admin-section">
          <h2>Add New FAQ</h2>
          <div class="form-group">
            <label>Question</label>
            <input type="text" id="faqQuestion" />
          </div>
          <div class="form-group">
            <label>Answer</label>
            <textarea id="faqAnswer" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select id="faqCategory">
              <option>General</option>
              <option>Exams</option>
              <option>Library</option>
              <option>Administration</option>
              <option>Academics</option>
              <option>Hostel</option>
              <option>Placement</option>
              <option>IT</option>
              <option>Sports</option>
              <option>Activities</option>
              <option>Medical</option>
              <option>Transportation</option>
            </select>
          </div>
          <button onclick="window.adminModule.addFaq()">Add FAQ</button>
        </div>

        <div class="admin-section">
          <h2>Upload File</h2>
          <div class="form-group">
            <label>File</label>
            <input type="file" id="fileUpload" />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select id="fileCategory">
              <option>Syllabus</option>
              <option>Assignments</option>
              <option>Notes</option>
              <option>General</option>
            </select>
          </div>
          <button onclick="window.adminModule.uploadFile()">Upload File</button>
        </div>
      </div>
    `;
  },

  addFaq: async () => {
    const question = document.getElementById('faqQuestion')?.value;
    const answer = document.getElementById('faqAnswer')?.value;
    const category = document.getElementById('faqCategory')?.value;

    if (!question || !answer) {
      alert('Please fill in all fields');
      return;
    }

    const success = await faqModule.addFaq(question, answer, category);
    if (success) {
      document.getElementById('faqQuestion').value = '';
      document.getElementById('faqAnswer').value = '';
    }
  },

  uploadFile: async () => {
    const fileInput = document.getElementById('fileUpload');
    const categorySelect = document.getElementById('fileCategory');
    
    if (fileInput && categorySelect) {
      await filesModule.uploadFile(fileInput, categorySelect);
    }
  }
};

window.adminModule = adminModule;
