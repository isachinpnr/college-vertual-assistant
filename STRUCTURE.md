# College Virtual Assistant - Project Structure

## Project Architecture

This project has been restructured with a **component-based architecture** for better maintainability and scalability.

## Directory Structure

```
college-virtual-assistant/
├── backend/
│   ├── src/
│   │   └── index.js          # Backend server (Express + Socket.io)
│   ├── public/               # Frontend files
│   │   ├── index.html        # Main HTML entry point
│   │   ├── css/
│   │   │   ├── main.css      # Main styles
│   │   │   └── components.css # Component styles
│   │   ├── js/
│   │   │   ├── app.js        # Main application controller
│   │   │   ├── auth.js       # Authentication module
│   │   │   ├── chat.js       # Chat Assistant module
│   │   │   ├── faq.js        # FAQ Management module
│   │   │   ├── files.js      # File Management module
│   │   │   ├── admin.js      # Admin Panel module
│   │   │   ├── analytics.js  # Analytics Dashboard module
│   │   │   └── notifications.js # Notification System module
│   │   └── utils/
│   │       ├── api.js        # API utility functions
│   │       └── socket.js     # Socket.io utility functions
│   ├── uploads/              # File upload storage
│   └── package.json
└── README.md
```

## Features Implemented

### ✅ 1. Real-time Chat Assistant
- **File:** `js/chat.js`
- Intelligent chatbot with keyword matching
- Socket.io for instant responses
- Chat history display
- Fallback responses

### ✅ 2. FAQ Management System
- **File:** `js/faq.js`
- View all FAQs
- Search FAQs by keywords
- FAQ categories (General, Exams, Library, Administration)
- Track how many times each FAQ is asked
- FAQ helpfulness tracking
- Admin can add new FAQs

### ✅ 3. File Management System
- **File:** `js/files.js`
- Upload files (PDF, docs, etc.) - max 10MB
- Download files with counter
- File categories (Syllabus, Assignments, Notes, General)
- Search files by name
- File metadata display
- Download count tracking

### ✅ 4. User Authentication & Roles
- **File:** `js/auth.js`
- Student login system
- Admin login system
- Role-based access control
- User session management
- Secure authentication
- Role-based UI display

### ✅ 5. Admin Panel
- **File:** `js/admin.js`
- Add new FAQs (question, answer, category)
- Upload files with category selection
- Content management interface
- Admin-only access
- Quick content updates

### ✅ 6. Analytics Dashboard
- **File:** `js/analytics.js`
- Total FAQs count
- Total files count
- Total questions asked
- Top 5 most asked questions
- Top 5 most downloaded files
- Category statistics
- Usage analytics

### ✅ 7. Notification System (Advanced)
- **File:** `js/notifications.js`
- Real-time notifications
- Toast notifications display
- New FAQ added notifications
- New file uploaded notifications
- Auto-dismiss notifications
- Notification history

## How to Run

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Main UI: `http://localhost:4100/`
   - Health check: `http://localhost:4100/health`

## Login Credentials

- **Student:**
  - Email: `student@college.com`
  - Password: `student123`

- **Admin:**
  - Email: `admin@college.com`
  - Password: `admin123`

## Module System

All JavaScript modules use **ES6 modules** for better code organization:
- Each feature is in its own module file
- Shared utilities in `utils/` folder
- Main app controller manages routing and initialization
- Clean separation of concerns

## Benefits of New Structure

1. **Modularity:** Each feature is self-contained
2. **Maintainability:** Easy to find and update code
3. **Scalability:** Easy to add new features
4. **Reusability:** Components can be reused
5. **Testability:** Each module can be tested independently
