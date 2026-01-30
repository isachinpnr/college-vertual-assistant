# College Virtual Assistant (FAQ + File Management with Chatbot)

**Real-world college assistant app** - Students can actually use this for FAQs, file downloads, and chat support.

## Tech Stack
- Backend: Node.js, Express, Socket.io (real-time chat)
- Frontend: HTML/CSS/JavaScript (vanilla, no framework needed)
- File Upload: Multer
- Real-time: Socket.io for live chat

## Project Structure
- `backend/src/index.js` – Express server with Socket.io
- `backend/public/index.html` – Full-featured UI
- `backend/uploads/` – Uploaded files storage (auto-created)

## How to Run

1. **Install dependencies:**
   ```bash
   cd "D:\cur\Project student\college-virtual-assistant\backend"
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - **Main UI:** `http://localhost:4100/`
   - **Health check:** `http://localhost:4100/health`

## Features (All Working!)

### ✅ Real-time Chat Assistant
- **Intelligent chatbot** with keyword matching (simple NLP)
- **Socket.io** for instant responses
- Ask questions about college timings, exams, library, ID card, etc.
- Chat history visible in real-time

### ✅ File Upload/Download System
- Upload files (PDF, docs, etc.) - max 10MB
- Download files with download counter
- File categories: Syllabus, Assignments, Notes, General
- Search files by name

### ✅ FAQ Management
- View all FAQs
- Search FAQs by question/answer
- Admin can add new FAQs
- FAQ categories: General, Exams, Library, Administration
- Tracks how many times each FAQ was asked

### ✅ User Authentication & Roles
- **Student login:**
  - Email: `student@college.com`
  - Password: `student123`
- **Admin login:**
  - Email: `admin@college.com`
  - Password: `admin123`
- Role-based access (students vs admin)

### ✅ Admin Panel
- Add new FAQs (question, answer, category)
- Upload files (with category selection)
- Only accessible to admin users

### ✅ Analytics Dashboard
- Total FAQs count
- Total files count
- Total questions asked
- Top 5 most asked questions
- Top 5 most downloaded files
- Category statistics

### ✅ Search Functionality
- Search FAQs by keywords
- Search files by name
- Real-time search results

### ✅ Notification System
- Real-time notifications when:
  - New FAQ is added
  - New file is uploaded
- Toast notifications appear in top-right corner

### ✅ Responsive Design
- Dark theme (professional look)
- Mobile-friendly layout
- Clean, modern UI

## How to Use

1. **As Student:**
   - Login with student credentials
   - Use chat to ask questions
   - Browse and download files
   - Search FAQs
   - View analytics (read-only)

2. **As Admin:**
   - Login with admin credentials
   - All student features +
   - Add/edit FAQs
   - Upload files
   - Full analytics dashboard

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/login` - User login
- `GET /api/faqs` - Get all FAQs
- `GET /api/faqs/search?q=query` - Search FAQs
- `POST /api/faqs` - Add FAQ (admin only)
- `GET /api/files` - Get all files
- `GET /api/files/search?q=query` - Search files
- `POST /api/files/upload` - Upload file (admin only)
- `GET /api/files/download/:id` - Download file
- `GET /api/analytics` - Get analytics data
- `GET /api/notifications` - Get recent notifications

## Socket.io Events

- `chat_message` - Send chat message
- `chat_response` - Receive bot response
- `notification` - Receive real-time notifications

## Notes

- **In-memory storage** - Data resets on server restart (can be upgraded to database later)
- **File uploads** stored in `backend/uploads/` folder
- **Simple NLP** - Keyword matching for chatbot (can be upgraded to Dialogflow/Rasa)
- **No real encryption** - Passwords stored in plain text (for demo only)

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- Real encryption for passwords
- Voice input/output
- Email notifications
- Advanced NLP/AI chatbot
- File preview
- User profiles
- Comments/ratings on files

---

**This is a REAL, working college assistant app** - Students can actually use it for their daily college needs!
