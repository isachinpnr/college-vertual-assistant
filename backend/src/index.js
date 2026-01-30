import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const PORT = process.env.PORT || 4100;

// In-memory storage (can be upgraded to database later)
let faqs = [
  // General Questions
  {
    id: 1,
    question: "What are the college timings?",
    answer: "College runs from 9:00 AM to 5:00 PM, Monday to Friday. Weekend classes may vary by department.",
    category: "General",
    askedCount: 45,
    helpfulCount: 38,
  },
  {
    id: 2,
    question: "What is the college address and contact information?",
    answer: "You can find the complete college address, phone number, and email on the official college website. For urgent queries, contact the main reception at the college entrance.",
    category: "General",
    askedCount: 25,
    helpfulCount: 22,
  },
  {
    id: 3,
    question: "How do I get to the college?",
    answer: "The college is accessible by public transport. Bus routes and metro stations are listed on the college website. Parking facilities are available for students with vehicles.",
    category: "General",
    askedCount: 18,
    helpfulCount: 16,
  },
  {
    id: 4,
    question: "What facilities are available in the college?",
    answer: "The college provides library, computer labs, sports facilities, cafeteria, medical room, auditorium, and Wi-Fi connectivity throughout the campus.",
    category: "General",
    askedCount: 30,
    helpfulCount: 28,
  },
  {
    id: 5,
    question: "How can I contact my professors?",
    answer: "You can contact professors during their office hours (posted on department notice boards) or via email. Email addresses are available on the college website or department portal.",
    category: "General",
    askedCount: 42,
    helpfulCount: 38,
  },
  
  // Administration
  {
    id: 6,
    question: "How can I get my ID card?",
    answer: "Visit the admin office with your admission receipt and a passport photo. ID cards are usually issued within 2-3 working days after submission of documents.",
    category: "Administration",
    askedCount: 32,
    helpfulCount: 28,
  },
  {
    id: 7,
    question: "How do I apply for a duplicate ID card?",
    answer: "Submit an application form at the admin office with a police complaint copy (if lost) or damaged card. A fee may be applicable for duplicate ID cards.",
    category: "Administration",
    askedCount: 15,
    helpfulCount: 14,
  },
  {
    id: 8,
    question: "What documents do I need for admission?",
    answer: "Required documents include: 10th and 12th mark sheets, transfer certificate, character certificate, caste certificate (if applicable), passport photos, and admission form. Check the admission brochure for complete list.",
    category: "Administration",
    askedCount: 55,
    helpfulCount: 50,
  },
  {
    id: 9,
    question: "How can I get a bonafide certificate?",
    answer: "Apply at the admin office with your student ID. Bonafide certificates are usually issued within 2-3 working days. Some cases may require department approval.",
    category: "Administration",
    askedCount: 28,
    helpfulCount: 25,
  },
  {
    id: 10,
    question: "Where can I pay my fees?",
    answer: "Fees can be paid online through the college portal or at the accounts office during working hours. Payment receipts are issued immediately after payment.",
    category: "Administration",
    askedCount: 40,
    helpfulCount: 36,
  },
  {
    id: 11,
    question: "How do I apply for a leave of absence?",
    answer: "Submit a leave application form to your class coordinator or department head. For extended leaves, approval from the principal may be required. Medical leaves require a doctor's certificate.",
    category: "Administration",
    askedCount: 22,
    helpfulCount: 20,
  },
  {
    id: 12,
    question: "What is the procedure for course registration?",
    answer: "Course registration is done online through the student portal during the registration period. Check the academic calendar for registration dates. Contact your academic advisor for guidance.",
    category: "Administration",
    askedCount: 35,
    helpfulCount: 32,
  },
  
  // Exams
  {
    id: 13,
    question: "Where can I find exam schedules?",
    answer: "Exam schedules are uploaded on the college website and notice board 2 weeks before exams. You can also check the student portal for your personal exam timetable.",
    category: "Exams",
    askedCount: 67,
    helpfulCount: 62,
  },
  {
    id: 14,
    question: "What is the exam pattern and marking scheme?",
    answer: "Exams typically include internal assessments (40%) and end-semester exams (60%). Internal marks include assignments, quizzes, and attendance. Check your course syllabus for detailed breakdown.",
    category: "Exams",
    askedCount: 38,
    helpfulCount: 35,
  },
  {
    id: 15,
    question: "How do I apply for exam revaluation?",
    answer: "Submit a revaluation application form at the examination cell within 7 days of result declaration. A revaluation fee is applicable. Results are usually declared within 15-20 days.",
    category: "Exams",
    askedCount: 20,
    helpfulCount: 18,
  },
  {
    id: 16,
    question: "What should I do if I miss an exam?",
    answer: "Contact the examination cell immediately with a valid reason (medical emergency, etc.) and supporting documents. You may be allowed to appear for a supplementary exam if approved.",
    category: "Exams",
    askedCount: 15,
    helpfulCount: 14,
  },
  {
    id: 17,
    question: "Where can I get my exam hall ticket?",
    answer: "Hall tickets are available for download from the student portal 1 week before exams. You can also collect a printed copy from the examination cell if needed.",
    category: "Exams",
    askedCount: 25,
    helpfulCount: 23,
  },
  {
    id: 18,
    question: "What items are allowed in the examination hall?",
    answer: "Only hall ticket, student ID, pens, pencils, and calculators (if permitted) are allowed. Mobile phones, smartwatches, and electronic devices are strictly prohibited.",
    category: "Exams",
    askedCount: 30,
    helpfulCount: 28,
  },
  {
    id: 19,
    question: "When are exam results declared?",
    answer: "Results are usually declared within 3-4 weeks after the last exam. Check the college website or student portal for result announcements and updates.",
    category: "Exams",
    askedCount: 45,
    helpfulCount: 42,
  },
  
  // Library
  {
    id: 20,
    question: "What is the library timing?",
    answer: "Library is open from 8:00 AM to 8:00 PM on weekdays, and 9:00 AM to 5:00 PM on weekends. Reading room facilities are available during these hours.",
    category: "Library",
    askedCount: 28,
    helpfulCount: 25,
  },
  {
    id: 21,
    question: "How many books can I borrow from the library?",
    answer: "Students can borrow up to 3 books at a time for a period of 14 days. Books can be renewed once if not reserved by another student.",
    category: "Library",
    askedCount: 22,
    helpfulCount: 20,
  },
  {
    id: 22,
    question: "What is the fine for late return of books?",
    answer: "Late return fine is ₹5 per day per book. Maximum fine may be capped at the book's cost. Clear all dues before borrowing new books.",
    category: "Library",
    askedCount: 18,
    helpfulCount: 16,
  },
  {
    id: 23,
    question: "How do I access e-books and online journals?",
    answer: "E-books and online journals are accessible through the library portal using your student credentials. Contact the librarian for login details and access instructions.",
    category: "Library",
    askedCount: 25,
    helpfulCount: 23,
  },
  {
    id: 24,
    question: "Can I reserve a book that is currently issued?",
    answer: "Yes, you can reserve books through the library management system. You will be notified when the book becomes available. Reserved books are held for 3 days.",
    category: "Library",
    askedCount: 12,
    helpfulCount: 11,
  },
  {
    id: 25,
    question: "Does the library have study rooms or group discussion areas?",
    answer: "Yes, the library has designated study rooms and group discussion areas. These can be booked in advance through the library counter or online portal.",
    category: "Library",
    askedCount: 20,
    helpfulCount: 18,
  },
  
  // Academics
  {
    id: 26,
    question: "Where can I find my course syllabus?",
    answer: "Course syllabus is available on the college website under the academics section, in the student portal, or from your department office. You can also request it from your course instructor.",
    category: "Academics",
    askedCount: 35,
    helpfulCount: 32,
  },
  {
    id: 27,
    question: "How do I change my course or specialization?",
    answer: "Submit an application to your department head and academic advisor. Course changes are subject to availability, eligibility criteria, and approval from the academic committee.",
    category: "Academics",
    askedCount: 15,
    helpfulCount: 14,
  },
  {
    id: 28,
    question: "What is the attendance requirement?",
    answer: "Minimum 75% attendance is required to be eligible for exams. Students with less than 75% may need to apply for condonation with valid reasons and supporting documents.",
    category: "Academics",
    askedCount: 50,
    helpfulCount: 45,
  },
  {
    id: 29,
    question: "How can I check my attendance?",
    answer: "Attendance is updated regularly on the student portal. You can also check with your class coordinator or department office for attendance records.",
    category: "Academics",
    askedCount: 40,
    helpfulCount: 36,
  },
  {
    id: 30,
    question: "Where can I get assignment guidelines?",
    answer: "Assignment guidelines are provided by course instructors at the beginning of the semester. They are also available on the course portal or can be obtained from your department.",
    category: "Academics",
    askedCount: 28,
    helpfulCount: 25,
  },
  {
    id: 31,
    question: "What is the deadline for submitting assignments?",
    answer: "Assignment deadlines are announced by course instructors. Late submissions may result in grade reduction. Check your course schedule or contact your instructor for specific dates.",
    category: "Academics",
    askedCount: 32,
    helpfulCount: 29,
  },
  {
    id: 32,
    question: "How do I apply for a scholarship?",
    answer: "Scholarship applications are available at the accounts office or student welfare office. Submit required documents before the deadline. Merit-based and need-based scholarships are available.",
    category: "Academics",
    askedCount: 25,
    helpfulCount: 23,
  },
  
  // Hostel & Accommodation
  {
    id: 33,
    question: "How do I apply for hostel accommodation?",
    answer: "Hostel applications are available at the hostel office. Submit the application form with required documents during the admission period. Allocation is based on availability and distance from college.",
    category: "Hostel",
    askedCount: 20,
    helpfulCount: 18,
  },
  {
    id: 34,
    question: "What are the hostel fees and facilities?",
    answer: "Hostel fees vary by room type (single, double, triple sharing). Facilities include mess, Wi-Fi, laundry, common room, and 24/7 security. Contact the hostel office for current fee structure.",
    category: "Hostel",
    askedCount: 18,
    helpfulCount: 16,
  },
  {
    id: 35,
    question: "What are the hostel rules and regulations?",
    answer: "Hostel rules include curfew timings, visitor policies, mess timings, and code of conduct. Detailed rules are provided at the time of hostel allocation and are available at the hostel office.",
    category: "Hostel",
    askedCount: 15,
    helpfulCount: 14,
  },
  
  // Transportation
  {
    id: 36,
    question: "Does the college provide bus transportation?",
    answer: "Yes, the college operates buses on various routes. Bus passes can be obtained from the transport office. Route details and timings are available on the college website.",
    category: "Transportation",
    askedCount: 22,
    helpfulCount: 20,
  },
  {
    id: 37,
    question: "How do I get a bus pass?",
    answer: "Apply for a bus pass at the transport office with your student ID and passport photo. Bus passes are valid for one semester and can be renewed before expiry.",
    category: "Transportation",
    askedCount: 18,
    helpfulCount: 16,
  },
  
  // Sports & Activities
  {
    id: 38,
    question: "What sports facilities are available?",
    answer: "The college has facilities for cricket, football, basketball, volleyball, badminton, table tennis, and a gymnasium. Sports equipment can be borrowed from the sports office.",
    category: "Sports",
    askedCount: 20,
    helpfulCount: 18,
  },
  {
    id: 39,
    question: "How can I join a club or society?",
    answer: "Club registrations are open at the beginning of each semester. Visit the student activities office or check the college website for club listings and registration details.",
    category: "Activities",
    askedCount: 25,
    helpfulCount: 23,
  },
  {
    id: 40,
    question: "When are cultural events and festivals organized?",
    answer: "Cultural events and festivals are organized throughout the year. Major events include annual day, technical fest, and cultural fest. Check the events calendar on the college website.",
    category: "Activities",
    askedCount: 18,
    helpfulCount: 16,
  },
  
  // Placement & Career
  {
    id: 41,
    question: "How do I register for placements?",
    answer: "Register through the placement portal using your student credentials. Complete your profile, upload resume, and attend placement training sessions. Contact the placement cell for assistance.",
    category: "Placement",
    askedCount: 45,
    helpfulCount: 42,
  },
  {
    id: 42,
    question: "What companies visit for campus recruitment?",
    answer: "Various companies from IT, finance, manufacturing, and other sectors visit for recruitment. The placement cell maintains a list of visiting companies. Check the placement portal for updates.",
    category: "Placement",
    askedCount: 38,
    helpfulCount: 35,
  },
  {
    id: 43,
    question: "How can I get internship opportunities?",
    answer: "Internship opportunities are posted on the placement portal and college notice boards. You can also approach the placement cell for guidance. Some departments also provide internship assistance.",
    category: "Placement",
    askedCount: 30,
    helpfulCount: 28,
  },
  
  // IT & Technical
  {
    id: 44,
    question: "How do I get Wi-Fi access on campus?",
    answer: "Wi-Fi credentials are provided at the time of admission. Contact the IT department if you need new credentials or face connectivity issues. Wi-Fi is available throughout the campus.",
    category: "IT",
    askedCount: 35,
    helpfulCount: 32,
  },
  {
    id: 45,
    question: "What if I forget my student portal password?",
    answer: "Use the 'Forgot Password' option on the student portal login page. You can reset your password using your registered email or contact the IT department for assistance.",
    category: "IT",
    askedCount: 28,
    helpfulCount: 25,
  },
  {
    id: 46,
    question: "How do I access computer labs?",
    answer: "Computer labs are accessible during lab hours as per your timetable. For additional access, contact your department or lab in-charge. Lab rules and usage guidelines are posted in each lab.",
    category: "IT",
    askedCount: 20,
    helpfulCount: 18,
  },
  
  // Medical & Health
  {
    id: 47,
    question: "Is there a medical facility on campus?",
    answer: "Yes, the college has a medical room with a nurse available during college hours. For emergencies, contact the medical room or security office. First aid facilities are available.",
    category: "Medical",
    askedCount: 15,
    helpfulCount: 14,
  },
  {
    id: 48,
    question: "How do I get a medical certificate?",
    answer: "Visit the college medical room or get a certificate from a registered medical practitioner. Medical certificates are required for leave applications and exam exemptions.",
    category: "Medical",
    askedCount: 18,
    helpfulCount: 16,
  },
  
  // Miscellaneous
  {
    id: 49,
    question: "Where is the cafeteria located?",
    answer: "The cafeteria is located on the ground floor near the main building. It serves breakfast, lunch, snacks, and beverages. Operating hours are 8:00 AM to 6:00 PM.",
    category: "General",
    askedCount: 25,
    helpfulCount: 23,
  },
  {
    id: 50,
    question: "How can I file a complaint or suggestion?",
    answer: "Complaints and suggestions can be submitted through the student portal, suggestion box at the admin office, or via email to the student council. Anonymous complaints are also accepted.",
    category: "General",
    askedCount: 20,
    helpfulCount: 18,
  },
  {
    id: 51,
    question: "What is the dress code?",
    answer: "The college follows a formal dress code. Students are expected to wear neat and presentable attire. Specific dress code guidelines are available in the student handbook.",
    category: "General",
    askedCount: 15,
    helpfulCount: 14,
  },
  {
    id: 52,
    question: "How do I get a transcript or mark sheet?",
    answer: "Apply for transcripts at the examination cell or admin office. Transcripts are usually issued within 7-10 working days. A fee is applicable for transcript requests.",
    category: "Administration",
    askedCount: 22,
    helpfulCount: 20,
  },
];

let files = []; // Start with empty array - files will be added through uploads only

let users = [
  {
    id: 1,
    email: "student@college.com",
    password: "student123", // In real app, hash this
    role: "student",
    name: "Rahul Kumar",
  },
  {
    id: 2,
    email: "admin@college.com",
    password: "admin123",
    role: "admin",
    name: "Admin User",
  },
];

let chatHistory = [];
let notifications = [];

// Middleware - CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);
    if (origin.includes('.netlify.app') || origin.includes('netlify.com')) return callback(null, true);
    const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// File upload setup
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Enhanced NLP-like keyword matching for chatbot
function findAnswer(userQuestion) {
  const lowerQ = userQuestion.toLowerCase().trim();
  let bestMatch = null;
  let maxScore = 0;

  // Remove common words for better matching
  const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'what', 'where', 'when', 'why', 'how', 'who', 'which', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'this', 'that', 'these', 'those'];
  
  // Extract meaningful words
  const userWords = lowerQ.split(/\s+/).filter(word => word.length > 2 && !stopWords.includes(word));

  for (const faq of faqs) {
    const faqLower = faq.question.toLowerCase();
    const faqAnswer = faq.answer.toLowerCase();
    let score = 0;

    // Check for exact phrase matches (higher weight)
    if (faqLower.includes(lowerQ) || lowerQ.includes(faqLower.substring(0, 20))) {
      score += 10;
    }

    // Check for keyword matches in question
    for (const word of userWords) {
      if (faqLower.includes(word)) {
        score += 3;
      }
      // Also check in answer for better matching
      if (faqAnswer.includes(word)) {
        score += 1;
      }
    }

    // Category-based matching
    if (lowerQ.includes('exam') && faq.category === 'Exams') score += 2;
    if (lowerQ.includes('library') && faq.category === 'Library') score += 2;
    if (lowerQ.includes('hostel') && faq.category === 'Hostel') score += 2;
    if (lowerQ.includes('placement') && faq.category === 'Placement') score += 2;
    if ((lowerQ.includes('fee') || lowerQ.includes('payment')) && faq.category === 'Administration') score += 2;
    if (lowerQ.includes('attendance') && faq.category === 'Academics') score += 2;
    if ((lowerQ.includes('wifi') || lowerQ.includes('internet')) && faq.category === 'IT') score += 2;
    if ((lowerQ.includes('sport') || lowerQ.includes('gym')) && faq.category === 'Sports') score += 2;

    if (score > maxScore) {
      maxScore = score;
      bestMatch = faq;
    }
  }

  // Return best match if score is good enough
  if (maxScore >= 3) {
    faqs.find((f) => f.id === bestMatch.id).askedCount++;
    return bestMatch.answer;
  }

  // Fallback responses with more variations
  if (lowerQ.includes("hello") || lowerQ.includes("hi") || lowerQ.includes("hey") || lowerQ.includes("greetings")) {
    return "Hello! I'm your college virtual assistant. How can I help you today? You can ask me about:\n• College timings and facilities\n• Exams and schedules\n• Library services\n• ID cards and certificates\n• Fees and payments\n• Hostel information\n• Placements and internships\n• And much more!";
  }
  
  if (lowerQ.includes("thank") || lowerQ.includes("thanks") || lowerQ.includes("thnx")) {
    return "You're welcome! Feel free to ask if you need anything else. I'm here to help!";
  }
  
  if (lowerQ.includes("bye") || lowerQ.includes("goodbye") || lowerQ.includes("see you")) {
    return "Goodbye! Have a great day. Don't hesitate to come back if you have any questions!";
  }
  
  if (lowerQ.includes("help") || lowerQ.includes("what can you do")) {
    return "I can help you with:\n• General college information\n• Administration queries (ID cards, certificates, fees)\n• Exam-related questions\n• Library services\n• Academic information\n• Hostel and accommodation\n• Placement and career guidance\n• IT and technical support\n• Sports and activities\n• And many more college-related topics!\n\nJust ask me anything!";
  }

  // Suggest searching FAQs if no match
  return "I'm not sure about that specific question. Here are some topics I can help with:\n• College timings and facilities\n• Exams, schedules, and results\n• Library services and book borrowing\n• ID cards, certificates, and documents\n• Fees and payments\n• Hostel accommodation\n• Placements and internships\n• Attendance and academics\n• Sports and activities\n\nTry rephrasing your question or check the FAQs section for more information. You can also contact the admin office for specific queries.";
}

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "college-virtual-assistant-backend" });
});

// Auth
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    res.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// FAQs
app.get("/api/faqs", (req, res) => {
  // Always return a copy of the array to prevent accidental modifications
  res.json({ faqs: [...faqs] });
});

app.get("/api/faqs/search", (req, res) => {
  const query = (req.query.q || "").toLowerCase();
  const results = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(query) ||
      f.answer.toLowerCase().includes(query)
  );
  res.json({ results });
});

// Admin: Add FAQ
app.post("/api/faqs", (req, res) => {
  const { question, answer, category } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: "Question and answer required" });
  }
  // Generate unique ID based on max existing ID or length
  const maxId = faqs.length > 0 ? Math.max(...faqs.map(f => f.id || 0)) : 0;
  const newFaq = {
    id: maxId + 1,
    question,
    answer,
    category: category || "General",
    askedCount: 0,
    helpfulCount: 0, // Track helpfulness
  };
  faqs.push(newFaq);
  notifications.push({
    id: notifications.length + 1,
    message: `New FAQ added: ${question}`,
    type: "info",
    timestamp: new Date().toISOString(),
  });
  io.emit("notification", notifications[notifications.length - 1]);
  res.json({ success: true, faq: newFaq });
});

// Mark FAQ as helpful
app.post("/api/faqs/:id/helpful", (req, res) => {
  const faq = faqs.find((f) => f.id === parseInt(req.params.id));
  if (faq) {
    faq.helpfulCount = (faq.helpfulCount || 0) + 1;
    res.json({ success: true, helpfulCount: faq.helpfulCount });
  } else {
    res.status(404).json({ error: "FAQ not found" });
  }
});

// Delete FAQ (admin only)
app.delete("/api/faqs/:id", (req, res) => {
  const faqId = parseInt(req.params.id);
  if (isNaN(faqId)) {
    return res.status(400).json({ error: "Invalid FAQ ID" });
  }
  
  const faqIndex = faqs.findIndex((f) => f.id === faqId);
  if (faqIndex === -1) {
    return res.status(404).json({ error: "FAQ not found" });
  }

  const deletedFaq = faqs[faqIndex];
  // Safely remove FAQ from array - only delete if explicitly requested
  faqs.splice(faqIndex, 1);
  
  // Safety check: verify deletion
  const stillExists = faqs.find(f => f.id === faqId);
  if (stillExists) {
    console.error("Warning: FAQ deletion verification failed - FAQ still exists");
  }

  // Add notification
  notifications.push({
    id: notifications.length + 1,
    message: `FAQ deleted: ${deletedFaq.question}`,
    type: "info",
    timestamp: new Date().toISOString(),
  });
  io.emit("notification", notifications[notifications.length - 1]);

  res.json({ success: true, message: "FAQ deleted successfully" });
});

// Files
app.get("/api/files", (req, res) => {
  res.json({ files });
});

app.get("/api/files/search", (req, res) => {
  const query = (req.query.q || "").toLowerCase();
  const results = files.filter((f) => f.name.toLowerCase().includes(query));
  res.json({ results });
});

app.post("/api/files/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  // Generate unique ID based on max existing ID or length
  const maxId = files.length > 0 ? Math.max(...files.map(f => f.id || 0)) : 0;
  const newFile = {
    id: maxId + 1,
    name: req.file.originalname,
    category: req.body.category || "General",
    uploadedBy: req.body.uploadedBy || "Admin",
    uploadedAt: new Date().toISOString(),
    size: (req.file.size / (1024 * 1024)).toFixed(2) + " MB",
    downloadCount: 0,
    path: req.file.filename,
  };
  files.push(newFile);
  notifications.push({
    id: notifications.length + 1,
    message: `New file uploaded: ${newFile.name}`,
    type: "success",
    timestamp: new Date().toISOString(),
  });
  io.emit("notification", notifications[notifications.length - 1]);
  res.json({ success: true, file: newFile });
});

app.get("/api/files/download/:id", (req, res) => {
  const file = files.find((f) => f.id === parseInt(req.params.id));
  if (!file || !file.path) {
    return res.status(404).json({ error: "File not found" });
  }
  file.downloadCount++;
  const filePath = path.join(uploadsDir, file.path);
  if (fs.existsSync(filePath)) {
    res.download(filePath, file.name);
  } else {
    res.status(404).json({ error: "File not found on server" });
  }
});

// Delete file (admin only)
app.delete("/api/files/:id", (req, res) => {
  const file = files.find((f) => f.id === parseInt(req.params.id));
  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  // Delete physical file
  if (file.path) {
    const filePath = path.join(uploadsDir, file.path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  }

  // Remove from files array
  const index = files.findIndex((f) => f.id === parseInt(req.params.id));
  if (index > -1) {
    files.splice(index, 1);
  }

  // Add notification
  notifications.push({
    id: notifications.length + 1,
    message: `File deleted: ${file.name}`,
    type: "info",
    timestamp: new Date().toISOString(),
  });
  io.emit("notification", notifications[notifications.length - 1]);

  res.json({ success: true, message: "File deleted successfully" });
});

// Analytics
app.get("/api/analytics", (req, res) => {
  const topFaqs = [...faqs]
    .sort((a, b) => b.askedCount - a.askedCount)
    .slice(0, 5);
  const topFiles = [...files]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 5);
  const categoryStats = {};
  faqs.forEach((f) => {
    categoryStats[f.category] = (categoryStats[f.category] || 0) + 1;
  });
  res.json({
    topFaqs,
    topFiles,
    categoryStats,
    totalFaqs: faqs.length,
    totalFiles: files.length,
    totalQuestions: faqs.reduce((sum, f) => sum + f.askedCount, 0),
  });
});

// Notifications
app.get("/api/notifications", (req, res) => {
  res.json({ notifications: notifications.slice(-10).reverse() });
});

// Chat via Socket.io
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("chat_message", (data) => {
    const { message, user, isAuthenticated } = data;
    
    // Check if user is authenticated (frontend should handle this, but backend double-check)
    if (!isAuthenticated || !user) {
      const loginMessages = [
        "🔐 Please login first to use the chat assistant! Click the login button in the top-right corner.",
        "⚠️ You need to be logged in to ask questions. Please login to continue.",
        "🚫 Access denied! Please login first to chat with the assistant.",
        "👤 Authentication required! Please login to ask questions.",
        "🔒 This feature requires login. Please login to access the chat assistant."
      ];
      const randomMessage = loginMessages[Math.floor(Math.random() * loginMessages.length)];
      const botMsg = { type: "bot", message: randomMessage, timestamp: new Date().toISOString() };
      socket.emit("chat_response", botMsg);
      return;
    }
    
    const botAnswer = findAnswer(message);
    const userMsg = { type: "user", message, user: user || "Student", timestamp: new Date().toISOString() };
    const botMsg = { type: "bot", message: botAnswer, timestamp: new Date().toISOString() };
    
    // Add to history
    chatHistory.push(userMsg, botMsg);
    
    // Emit response only to the sender (not broadcast to all)
    socket.emit("chat_response", botMsg);
    
    // Limit history to prevent memory issues
    if (chatHistory.length > 100) {
      chatHistory.splice(0, chatHistory.length - 50);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`College Virtual Assistant backend running on port ${PORT}`);
  console.log(`UI available at: http://localhost:${PORT}`);
});
