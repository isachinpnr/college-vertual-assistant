// Netlify Function - Main API Handler
// This handles all API routes for the College Virtual Assistant

const fs = require('fs');
const path = require('path');

// MongoDB connection (optional - only loads at runtime if MONGODB_URI is set)
// Using dynamic require to prevent Netlify bundler from trying to resolve it at build time
let mongoClient = null;
let db = null;
let mongoDBLoaded = false;
let mongoDBAvailable = false;

// Data storage file path (fallback - in Netlify's /tmp directory)
const DATA_FILE = '/tmp/college-assistant-data.json';

// Initialize MongoDB connection (only if MONGODB_URI is set)
async function initMongoDB() {
  if (mongoClient) return; // Already connected
  if (mongoDBLoaded) return; // Already tried
  
  const MONGODB_URI = process.env.MONGODB_URI || null;
  if (!MONGODB_URI) {
    mongoDBLoaded = true;
    mongoDBAvailable = false;
    return; // No MongoDB URI set
  }
  
  mongoDBLoaded = true;
  
  try {
    // Dynamic require using Function constructor to prevent bundler from analyzing it
    // This ensures Netlify bundler doesn't try to resolve mongodb at build time
    const requireFunc = new Function('moduleName', 'return require(moduleName)');
    const mongodb = requireFunc('mongodb');
    const MongoClient = mongodb.MongoClient;
    
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db('college-assistant');
    mongoDBAvailable = true;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.warn('⚠️ MongoDB not available, using file storage:', error.message);
    mongoDBAvailable = false;
    db = null;
    mongoClient = null;
  }
}

// Get data from MongoDB or file
async function getData() {
  // Try MongoDB first (only if available)
  if (mongoDBAvailable && db) {
    try {
      const collection = db.collection('data');
      const doc = await collection.findOne({ _id: 'main' });
      if (doc) {
        // Ensure default FAQs are present
        const defaultFAQs = getDefaultFAQs();
        if (!doc.faqs || doc.faqs.length < defaultFAQs.length) {
          const existingIds = new Set((doc.faqs || []).map(f => f.id));
          const missingFAQs = defaultFAQs.filter(f => !existingIds.has(f.id));
          if (missingFAQs.length > 0) {
            doc.faqs = [...(doc.faqs || []), ...missingFAQs];
            await saveData(doc);
          }
        }
        return doc;
      }
    } catch (error) {
      console.error('Error reading from MongoDB:', error);
    }
  }
  
  // Fallback to file storage
  return getDataFromFile();
}

// Get data from file (fallback)
function getDataFromFile() {
  const defaultFAQs = getDefaultFAQs();
  const defaultUsers = [
    {
      id: 1,
      email: "student@college.com",
      password: "student123",
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
  
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      if (fileContent && fileContent.trim()) {
        const data = JSON.parse(fileContent);
        let needsSave = false;
        
        // Ensure FAQs array exists and has ALL 52 FAQs
        if (!data.faqs || data.faqs.length === 0) {
          data.faqs = defaultFAQs;
          needsSave = true;
        } else if (data.faqs.length < defaultFAQs.length) {
          // If FAQs exist but are incomplete, merge with defaults
          const existingIds = new Set(data.faqs.map(f => f.id));
          const missingFAQs = defaultFAQs.filter(f => !existingIds.has(f.id));
          if (missingFAQs.length > 0) {
            data.faqs = [...data.faqs, ...missingFAQs];
            needsSave = true;
          }
        }
        
        // Ensure users array exists
        if (!data.users || data.users.length === 0) {
          data.users = defaultUsers;
          needsSave = true;
        }
        
        // Ensure other arrays exist
        if (!data.files) data.files = [];
        if (!data.chatHistory) data.chatHistory = [];
        if (!data.notifications) data.notifications = [];
        
        if (needsSave) {
          saveDataToFile(data);
        }
        
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading data file:', error);
  }
  
  // Default data structure with ALL 52 FAQs
  const defaultData = {
    faqs: defaultFAQs,
    files: [],
    users: defaultUsers,
    chatHistory: [],
    notifications: [],
  };
  
  // Save default data to file
  saveDataToFile(defaultData);
  return defaultData;
}

// Save data to MongoDB or file
async function saveData(data) {
  // Try MongoDB first (only if available)
  if (mongoDBAvailable && db) {
    try {
      const collection = db.collection('data');
      await collection.updateOne(
        { _id: 'main' },
        { $set: { ...data, _id: 'main', updatedAt: new Date() } },
        { upsert: true }
      );
      return;
    } catch (error) {
      console.error('Error saving to MongoDB:', error);
    }
  }
  
  // Fallback to file storage
  saveDataToFile(data);
}

// Save data to file (fallback)
function saveDataToFile(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving data file:', error);
  }
}

// Note: getData() and saveData() are now async functions defined above
// This section removed to avoid duplicates

function getDefaultFAQs() {
  return [
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
    {
      id: 52,
      question: "How do I get a transcript or mark sheet?",
      answer: "Apply for transcripts at the examination cell or admin office. Transcripts are usually issued within 7-10 working days. A fee is applicable for transcript requests.",
      category: "Administration",
      askedCount: 22,
      helpfulCount: 20,
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
  ];
}

// Enhanced NLP-like keyword matching for chatbot
function findAnswer(userQuestion, faqs) {
  const lowerQ = userQuestion.toLowerCase().trim();
  let bestMatch = null;
  let maxScore = 0;

  const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'what', 'where', 'when', 'why', 'how', 'who', 'which', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'this', 'that', 'these', 'those'];
  
  const userWords = lowerQ.split(/\s+/).filter(word => word.length > 2 && !stopWords.includes(word));

  for (const faq of faqs) {
    const faqLower = faq.question.toLowerCase();
    const faqAnswer = faq.answer.toLowerCase();
    let score = 0;

    if (faqLower.includes(lowerQ) || lowerQ.includes(faqLower.substring(0, 20))) {
      score += 10;
    }

    for (const word of userWords) {
      if (faqLower.includes(word)) {
        score += 3;
      }
      if (faqAnswer.includes(word)) {
        score += 1;
      }
    }

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

  if (maxScore >= 3) {
    const faq = faqs.find((f) => f.id === bestMatch.id);
    if (faq) faq.askedCount = (faq.askedCount || 0) + 1;
    // Note: Data will be saved by the calling function
    return bestMatch.answer;
  }

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

  return "I'm not sure about that specific question. Here are some topics I can help with:\n• College timings and facilities\n• Exams, schedules, and results\n• Library services and book borrowing\n• ID cards, certificates, and documents\n• Fees and payments\n• Hostel accommodation\n• Placements and internships\n• Attendance and academics\n• Sports and activities\n\nTry rephrasing your question or check the FAQs section for more information. You can also contact the admin office for specific queries.";
}

// CORS headers
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };
}

exports.handler = async (event, context) => {
  // Initialize MongoDB connection
  await initMongoDB();
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: '',
    };
  }

  // Extract path - handle both direct function calls and redirects
  let path = event.path;
  if (path.startsWith('/.netlify/functions/api')) {
    path = path.replace('/.netlify/functions/api', '');
  }
  // If path is empty or just '/', check query string for route
  if (!path || path === '/') {
    path = event.path;
  }
  const method = event.httpMethod;
  const data = await getData();

  try {
    // Health check
    if (path === '/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ status: 'ok', service: 'college-virtual-assistant-backend' }),
      };
    }

    // Auth - Login
    if (path === '/api/auth/login' && method === 'POST') {
      const { email, password } = JSON.parse(event.body || '{}');
      const user = data.users.find((u) => u.email === email && u.password === password);
      if (user) {
        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify({
            success: true,
            user: { id: user.id, email: user.email, role: user.role, name: user.name },
          }),
        };
      } else {
        return {
          statusCode: 401,
          headers: getCorsHeaders(),
          body: JSON.stringify({ success: false, message: 'Invalid credentials' }),
        };
      }
    }

    // Get all FAQs
    if (path === '/api/faqs' && method === 'GET') {
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ faqs: data.faqs }),
      };
    }

    // Search FAQs
    if (path.startsWith('/api/faqs/search') && method === 'GET') {
      const query = (event.queryStringParameters?.q || '').toLowerCase();
      const results = data.faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(query) ||
          f.answer.toLowerCase().includes(query)
      );
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ results }),
      };
    }

    // Add FAQ (Admin)
    if (path === '/api/faqs' && method === 'POST') {
      const { question, answer, category } = JSON.parse(event.body || '{}');
      if (!question || !answer) {
        return {
          statusCode: 400,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Question and answer required' }),
        };
      }
      const maxId = data.faqs.length > 0 ? Math.max(...data.faqs.map(f => f.id || 0)) : 0;
      const newFaq = {
        id: maxId + 1,
        question,
        answer,
        category: category || 'General',
        askedCount: 0,
        helpfulCount: 0,
      };
      data.faqs.push(newFaq);
      data.notifications.push({
        id: data.notifications.length + 1,
        message: `New FAQ added: ${question}`,
        type: 'info',
        timestamp: new Date().toISOString(),
      });
      await saveData(data);
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ success: true, faq: newFaq }),
      };
    }

    // Mark FAQ as helpful
    if (path.match(/^\/api\/faqs\/\d+\/helpful$/) && method === 'POST') {
      const id = parseInt(path.split('/')[3]);
      const faq = data.faqs.find((f) => f.id === id);
      if (faq) {
        faq.helpfulCount = (faq.helpfulCount || 0) + 1;
        await saveData(data);
        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify({ success: true, helpfulCount: faq.helpfulCount }),
        };
      } else {
        return {
          statusCode: 404,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'FAQ not found' }),
        };
      }
    }

    // Delete FAQ
    if (path.match(/^\/api\/faqs\/\d+$/) && method === 'DELETE') {
      const id = parseInt(path.split('/')[3]);
      const index = data.faqs.findIndex((f) => f.id === id);
      if (index === -1) {
        return {
          statusCode: 404,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'FAQ not found' }),
        };
      }
      const deletedFaq = data.faqs[index];
      data.faqs.splice(index, 1);
      data.notifications.push({
        id: data.notifications.length + 1,
        message: `FAQ deleted: ${deletedFaq.question}`,
        type: 'info',
        timestamp: new Date().toISOString(),
      });
      await saveData(data);
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ success: true, message: 'FAQ deleted successfully' }),
      };
    }

    // Get all files
    if (path === '/api/files' && method === 'GET') {
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ files: data.files }),
      };
    }

    // Search files
    if (path.startsWith('/api/files/search') && method === 'GET') {
      const query = (event.queryStringParameters?.q || '').toLowerCase();
      const results = data.files.filter((f) => f.name.toLowerCase().includes(query));
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ results }),
      };
    }

    // Upload file (handles base64 encoded files)
    if (path === '/api/files/upload' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { fileData, fileName, fileType, category, uploadedBy } = body;
      
      if (!fileData || !fileName) {
        return {
          statusCode: 400,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'File data and name required' }),
        };
      }

      const maxId = data.files.length > 0 ? Math.max(...data.files.map(f => f.id || 0)) : 0;
      const fileSize = Math.round((fileData.length * 3) / 4); // Approximate size from base64
      const newFile = {
        id: maxId + 1,
        name: fileName,
        category: category || 'General',
        uploadedBy: uploadedBy || 'Admin',
        uploadedAt: new Date().toISOString(),
        size: (fileSize / (1024 * 1024)).toFixed(2) + ' MB',
        downloadCount: 0,
        fileData: fileData, // Store base64 encoded file
        fileType: fileType || 'application/octet-stream',
      };
      data.files.push(newFile);
      data.notifications.push({
        id: data.notifications.length + 1,
        message: `New file uploaded: ${fileName}`,
        type: 'success',
        timestamp: new Date().toISOString(),
      });
      await saveData(data);
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ success: true, file: { ...newFile, fileData: undefined } }), // Don't send fileData in response
      };
    }

    // Download file
    if (path.match(/^\/api\/files\/download\/\d+$/) && method === 'GET') {
      const id = parseInt(path.split('/')[4]);
      const file = data.files.find((f) => f.id === id);
      if (!file) {
        return {
          statusCode: 404,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'File not found' }),
        };
      }
      file.downloadCount = (file.downloadCount || 0) + 1;
      await saveData(data);
      return {
        statusCode: 200,
        headers: {
          ...getCorsHeaders(),
          'Content-Type': file.fileType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${file.name}"`,
        },
        body: file.fileData, // Return base64 data
        isBase64Encoded: true,
      };
    }

    // Delete file
    if (path.match(/^\/api\/files\/\d+$/) && method === 'DELETE') {
      const id = parseInt(path.split('/')[3]);
      const index = data.files.findIndex((f) => f.id === id);
      if (index === -1) {
        return {
          statusCode: 404,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'File not found' }),
        };
      }
      const deletedFile = data.files[index];
      data.files.splice(index, 1);
      data.notifications.push({
        id: data.notifications.length + 1,
        message: `File deleted: ${deletedFile.name}`,
        type: 'info',
        timestamp: new Date().toISOString(),
      });
      await saveData(data);
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ success: true, message: 'File deleted successfully' }),
      };
    }

    // Chat message (replaces Socket.io)
    if (path === '/api/chat' && method === 'POST') {
      const { message, user, isAuthenticated } = JSON.parse(event.body || '{}');
      
      if (!isAuthenticated || !user) {
        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify({
            type: 'bot',
            message: '🔐 Please login first to use the chat assistant! Click the login button in the top-right corner.',
            timestamp: new Date().toISOString(),
          }),
        };
      }
      
      const botAnswer = findAnswer(message, data.faqs);
      const userMsg = { type: 'user', message, user: user || 'Student', timestamp: new Date().toISOString() };
      const botMsg = { type: 'bot', message: botAnswer, timestamp: new Date().toISOString() };
      
      data.chatHistory.push(userMsg, botMsg);
      if (data.chatHistory.length > 100) {
        data.chatHistory = data.chatHistory.slice(-50);
      }
      await saveData(data);
      
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify(botMsg),
      };
    }

    // Get chat history
    if (path === '/api/chat/history' && method === 'GET') {
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ history: data.chatHistory.slice(-50) }),
      };
    }

    // Analytics
    if (path === '/api/analytics' && method === 'GET') {
      const topFaqs = [...data.faqs]
        .sort((a, b) => (b.askedCount || 0) - (a.askedCount || 0))
        .slice(0, 5);
      const topFiles = [...data.files]
        .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
        .slice(0, 5);
      const categoryStats = {};
      data.faqs.forEach((f) => {
        categoryStats[f.category] = (categoryStats[f.category] || 0) + 1;
      });
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({
          topFaqs,
          topFiles,
          categoryStats,
          totalFaqs: data.faqs.length,
          totalFiles: data.files.length,
          totalQuestions: data.faqs.reduce((sum, f) => sum + (f.askedCount || 0), 0),
        }),
      };
    }

    // Notifications
    if (path === '/api/notifications' && method === 'GET') {
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ notifications: data.notifications.slice(-10).reverse() }),
      };
    }

    // 404 for unknown routes
    return {
      statusCode: 404,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: error.message }),
    };
  }
};
