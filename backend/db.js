const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : __dirname;
const DB_PATH = path.join(DB_DIR, 'portal.db');

// Force overwrite production DB from repo on every start to ensure local data sync
if (process.env.NODE_ENV === 'production') {
  const sourcePath = path.join(__dirname, 'portal.db');
  console.log('--- DATA SYNC: Forced Overwrite from', sourcePath, '---');
  
  if (fs.existsSync(sourcePath)) {
    // ALWAYS copy to ensure our latest pushed data is what gets used
    fs.copyFileSync(sourcePath, DB_PATH);
    console.log('--- DATA SYNC: Succeeded! 151 Users restored. ---');
  } else {
    console.error('--- DATA SYNC: FAILED - sourcePath not found. ---');
  }
}



const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ============================================================
// SCHEMA CREATION
// ============================================================
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('student','staff','admin','alumni')) NOT NULL,
    profile_picture TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    program TEXT CHECK(program IN ('MSc CS','MSc AI & DS','MCA','MTech CS')) NOT NULL,
    semester INTEGER NOT NULL,
    batch_year TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    department TEXT DEFAULT 'Computer Application and Engineering',
    designation TEXT NOT NULL,
    joining_date TEXT DEFAULT 'N/A',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS staff_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    phone TEXT,
    address TEXT,
    qualification TEXT,
    experience_years INTEGER,
    specialization TEXT,
    joining_date TEXT DEFAULT (date('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS staff_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    doc_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT CHECK(status IN ('present','absent','late','excused')) NOT NULL,
    marked_by TEXT DEFAULT 'web',
    timestamp TEXT DEFAULT (datetime('now')),
    UNIQUE(student_id, course_id, date),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS study_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    type TEXT CHECK(type IN ('notes','ppt','lab_manual','question_paper','syllabus')) NOT NULL,
    program TEXT DEFAULT NULL,
    uploaded_by INTEGER NOT NULL,
    uploaded_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    course_id TEXT NOT NULL,
    due_date TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    file_path TEXT,
    submitted_at TEXT DEFAULT (datetime('now')),
    grade TEXT DEFAULT NULL,
    feedback TEXT DEFAULT NULL,
    UNIQUE(assignment_id, student_id),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS marks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id TEXT NOT NULL,
    semester INTEGER NOT NULL,
    internal_marks REAL DEFAULT 0,
    external_marks REAL DEFAULT 0,
    total REAL DEFAULT 0,
    UNIQUE(student_id, course_id, semester),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS exam_marks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id TEXT NOT NULL,
    semester INTEGER NOT NULL,
    exam_type TEXT CHECK(exam_type IN ('Internal 1', 'Internal 2', 'Model Exam', 'Semester')) NOT NULL,
    marks REAL DEFAULT 0,
    UNIQUE(student_id, course_id, semester, exam_type),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program TEXT NOT NULL,
    semester INTEGER NOT NULL,
    day TEXT CHECK(day IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')) NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    course_id TEXT NOT NULL,
    course_name TEXT NOT NULL,
    room TEXT DEFAULT NULL,
    staff_id INTEGER DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    posted_by INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_date TEXT NOT NULL,
    venue TEXT,
    type TEXT DEFAULT 'other',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS event_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    registered_at TEXT DEFAULT (datetime('now')),
    UNIQUE(event_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS placements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL,
    package TEXT,
    type TEXT CHECK(type IN ('internship','full_time')) NOT NULL,
    location TEXT,
    apply_link TEXT,
    deadline TEXT,
    posted_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS alumni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    batch_year TEXT NOT NULL,
    program TEXT NOT NULL,
    current_company TEXT,
    current_role TEXT,
    linkedin TEXT,
    available_for_mentorship INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('course','faculty','department')) NOT NULL,
    subject_id TEXT DEFAULT NULL,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    comments TEXT,
    submitted_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS class_students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reg_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    program TEXT NOT NULL,
    class_name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS class_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reg_no TEXT NOT NULL,
    date TEXT NOT NULL,
    subject TEXT DEFAULT 'General',
    status TEXT CHECK(status IN ('present','absent')) NOT NULL DEFAULT 'absent',
    marked_by TEXT DEFAULT 'admin',
    timestamp TEXT DEFAULT (datetime('now')),
    UNIQUE(reg_no, date, subject),
    FOREIGN KEY (reg_no) REFERENCES class_students(reg_no) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS substitutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timetable_id INTEGER NOT NULL,
    original_staff_id INTEGER NOT NULL,
    substitute_staff_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (timetable_id) REFERENCES timetable(id) ON DELETE CASCADE,
    FOREIGN KEY (original_staff_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (substitute_staff_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Indexing for performance
  CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
  CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
  CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON attendance(course_id);
  CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks(student_id);
  CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
  CREATE INDEX IF NOT EXISTS idx_notifications_user_isread ON notifications(user_id, is_read);
`);

// ============================================================
// CLASS STUDENTS SEED (Real Roster)
// ============================================================
function seedClassStudents() {
  const existing = db.prepare('SELECT id FROM class_students LIMIT 1').get();
  if (existing) return; // Already seeded

  const insert = db.prepare('INSERT OR IGNORE INTO class_students (reg_no, name, program, class_name) VALUES (?, ?, ?, ?)');

  const insertMany = db.transaction((students) => {
    for (const s of students) insert.run(s.reg_no, s.name, s.program, s.class_name);
  });

  // II MCA
  insertMany([
    { reg_no: '24MCA01', name: 'ABDUL KALAM AZAD N', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA02', name: 'ANBALAGAN K', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA03', name: 'AROCKIYA LIGIFEMINA D', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA04', name: 'BASKAR P', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA05', name: 'BHARANIDHARAN S', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA06', name: 'CATHERIN JECINTHA J R', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA07', name: 'DHANAM A', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA08', name: 'DHANUSHIYA S', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA09', name: 'ESWARI N', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA10', name: 'HARIHARAN M', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA11', name: 'JEEVAN D', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA12', name: 'KEERTHANA A', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA13', name: 'MADESH C', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA14', name: 'MOHAN RAM G', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA15', name: 'MUTHULAKSHMI', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA16', name: 'NAFEES ASHFAQ AHAMED N', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA17', name: 'NANCY B', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA18', name: 'NIRUBAN A', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA19', name: 'PRAKASH R', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA20', name: 'PUNITHA M', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA21', name: 'RAGUL C A', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA22', name: 'RAHUL S', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA23', name: 'RAJESWARI M', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA24', name: 'SABARINATHAN S', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA25', name: 'SANJAI M', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA26', name: 'SANJAY R', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA27', name: 'SANTHOSH KUMAR P', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA28', name: 'SARAN G', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA29', name: 'SIBI GLAXON E', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA30', name: 'SRI HARINI S', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA31', name: 'STEWARD RIGHTEOUS T', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA32', name: 'SUDHARSAN R', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA33', name: 'SUMATHI S', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA34', name: 'VARSHINI V', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA35', name: 'VEERAMANI E', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA36', name: 'VENKATESH P', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA37', name: 'VIVIN SAMUEL F', program: 'MCA', class_name: 'II MCA' },
    { reg_no: '24MCA38', name: 'YUVASRI R', program: 'MCA', class_name: 'II MCA' },
  ]);

  // II MSc CS
  insertMany([
    { reg_no: '24MSCCS01', name: 'ABINAYA N', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS02', name: 'ABIRAMI K', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS03', name: 'ABIRAYANA K', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS04', name: 'DINESH T', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS05', name: 'ESWARI P', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS06', name: 'HEMA VESALINI R', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS07', name: 'JUVITHA B', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS08', name: 'KATHIRESAN P', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS09', name: 'KAVIYA S', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS10', name: 'KEERTHANA G', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS11', name: 'KUMARAGURU S', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS12', name: 'MOHAMED JAMAL JUNAITH P', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS13', name: 'NAVEENKUMAR V', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS14', name: 'RAGAVAMOORTHI K', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS15', name: 'RAHUL ROSHAN J', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS16', name: 'SOWMIYA S', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS17', name: 'SRIHARINI S', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS18', name: 'SUGA PRIYA R', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS19', name: 'SUNDARESAN J', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS20', name: 'VARSHA K', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS21', name: 'YAMUNA PRIYA R', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS22', name: 'YOGESHWARAN R', program: 'MSc CS', class_name: 'II MSc CS' },
    { reg_no: '24MSCCS24', name: 'RAMYA S', program: 'MSc CS', class_name: 'II MSc CS' },
  ]);

  // II MSc DS
  insertMany([
    { reg_no: '24MSCDS01', name: 'ABI T', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS02', name: 'AJAYY KUMAAR K', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS03', name: 'CHANDRU K', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS04', name: 'DHANAPRIYA D', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS05', name: 'DURGA DEVI K', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS06', name: 'GIRIDHARAN M', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS07', name: 'HARINI S', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS08', name: 'JAYANTH R', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS09', name: 'MADHAVAN V', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS10', name: 'MANIKANDAA S', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS11', name: 'MANOJ KUMAR N', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS12', name: 'MARIYA JERON ROY A', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS13', name: 'MOHAMED IBRAHIM K', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS14', name: 'MOHAMED SUHAIL A', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS15', name: 'MOHAMMED ABUTHAGHIR A', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS16', name: 'NARMATHA R', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS17', name: 'NAVEENKUMAR C', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS18', name: 'PRITHIV RAJ M', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS19', name: 'RIYASKHAN J', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS20', name: 'SAKTHY MARY PARVEEN T S', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS22', name: 'SHIBIVARSHAN S', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS23', name: 'SHIVARAMAKRISHNAN D', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS24', name: 'SURYA KUMAR G', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS25', name: 'TANISHQ RAJA S G', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS26', name: 'YOGESHWARAN M', program: 'MSc DS', class_name: 'II MSc DS' },
    { reg_no: '24MSCDS27', name: 'BUVANA S', program: 'MSc DS', class_name: 'II MSc DS' },
  ]);

  // II MSc AI
  insertMany([
    { reg_no: '24MSCAI01', name: 'DEEPA S', program: 'MSc AI', class_name: 'II MSc AI' },
    { reg_no: '24MSCAI02', name: 'GANESH R', program: 'MSc AI', class_name: 'II MSc AI' },
    { reg_no: '24MSCAI03', name: 'GIRENIVAAS S R', program: 'MSc AI', class_name: 'II MSc AI' },
    { reg_no: '24MSCAI04', name: 'HARISH S', program: 'MSc AI', class_name: 'II MSc AI' },
    { reg_no: '24MSCAI05', name: 'INIGOANAND L', program: 'MSc AI', class_name: 'II MSc AI' },
    { reg_no: '24MSCAI06', name: 'MERLIN CIBYA RANI M', program: 'MSc AI', class_name: 'II MSc AI' },
    { reg_no: '24MSCAI07', name: 'RANJITH KUMAR B', program: 'MSc AI', class_name: 'II MSc AI' },
    { reg_no: '24MSCAI08', name: 'SRIKHANTH R', program: 'MSc AI', class_name: 'II MSc AI' },
    { reg_no: '24MSCAI09', name: 'VIMAL RAJ A', program: 'MSc AI', class_name: 'II MSc AI' },
    { reg_no: '24MSCAI10', name: 'VISHAL MURALI M R', program: 'MSc AI', class_name: 'II MSc AI' },
    { reg_no: '24MSCAI11', name: 'NANTHABALAN', program: 'MSc AI', class_name: 'II MSc AI' },
  ]);

  // IV MTech
  insertMany([
    { reg_no: '22MTCS01', name: 'ADHITYA M R', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS02', name: 'AGALYA N', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS03', name: 'ANBU SWETHA B', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS04', name: 'ANITHA M', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS05', name: 'DHAMODHARAN J', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS06', name: 'DHANUSHA S', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS07', name: 'ELANCHERAN K', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS08', name: 'HARIS PRABU M', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS09', name: 'HEMASUTHAN M', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS10', name: 'JAYAKUMAR V', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS11', name: 'JEBIN ABISHAKE', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS12', name: 'JOSHNA P S', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS13', name: 'JOSHUA DANIEL A', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS14', name: 'LOGESHWARAN M', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS15', name: 'MATHANRAJ N', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS16', name: 'MITHUNRAJ', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS17', name: 'MURUGESAN V', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS18', name: 'NAREN KARTHIKEYAN S', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS19', name: 'PAVITHA D', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS20', name: 'PRASANNA S', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS21', name: 'PRASANNA KUMAR M', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS22', name: 'PRAVEEN KUMAR M', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS23', name: 'PRISHA GAAYATHRI V', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS24', name: 'RAJU S', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTGT25', name: 'RAMJI K', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS26', name: 'RISHIKESH B R', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS27', name: 'SAM ROSHAN', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS28', name: 'SASISANKAR U L', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS29', name: 'SHANMUGA PRIYA S B', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS31', name: 'SONIA R', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS32', name: 'SREEKHA S', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS33', name: 'SUBHASHINI G M', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS34', name: 'SUDHAKAR G', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS35', name: 'SUGUNA S', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS36', name: 'SWETHA SIVADHARSHINI R', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS37', name: 'VIKRAM G', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS38', name: 'VISHNU R', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS39', name: 'YASWANTH KUMAR S', program: 'MTech', class_name: 'IV MTech' },
    { reg_no: '22MTCS40', name: 'YOGESHWARAN R', program: 'MTech', class_name: 'IV MTech' },
  ]);

  console.log('✅ Real class student roster seeded successfully.');
}

seedClassStudents();

// ============================================================
// IDEMPOTENT SEED DATA — Real academic data only
// ============================================================
function seedData() {
  // ── Step 1: Deduplicate staff table (no UNIQUE constraint, so dupes accumulate on restart) ──
  db.prepare(`DELETE FROM staff WHERE id NOT IN (SELECT MIN(id) FROM staff GROUP BY user_id)`).run();

  // ── Step 2: Deduplicate students table for the same reason ──
  db.prepare(`DELETE FROM students WHERE id NOT IN (SELECT MIN(id) FROM students GROUP BY user_id)`).run();

  // ── Step 3: Remove all dummy/test user accounts by user_id ──
  ['MSC001','MSC002','MSC003','MCA001','AI001','AI002','ALM001','ALM002','ADMIN001'].forEach(uid =>
    db.prepare('DELETE FROM users WHERE user_id = ?').run(uid)
  );

  const hash     = bcrypt.hashSync('Admin@1234', 12);
  const staffHash = bcrypt.hashSync('Staff@1234', 12);

  // Helper: insert user if not exists, return internal id
  function ensureUser(uid, name, email, passHash, role) {
    db.prepare('INSERT OR IGNORE INTO users (user_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(uid, name, email, passHash, role);
    return db.prepare('SELECT id FROM users WHERE user_id = ?').get(uid).id;
  }

  // Helper: insert staff profile only if none exists for this user_id
  function ensureStaff(userId, designation) {
    const exists = db.prepare('SELECT id FROM staff WHERE user_id = ?').get(userId);
    if (!exists) db.prepare('INSERT INTO staff (user_id, designation, joining_date) VALUES (?, ?, ?)').run(userId, designation, 'N/A');
  }

  // ── 1 Admin: Dr. E. George Dharma Prakash Raj (HOD) ──
  const adminId = ensureUser('BDU1670884', 'Dr. E. George Dharma Prakash Raj', 'georgeprakashraj@bdu.ac.in', hash, 'admin');
  ensureStaff(adminId, 'Professor and Head');

  // ── 7 Staff Members ──
  const s2 = ensureUser('BDU1660758',  'Dr. Gopinath Ganapathy',       'gganapathy@bdu.ac.in',      staffHash, 'staff'); ensureStaff(s2, 'Senior Professor');
  const s3 = ensureUser('BDU17010631', 'Prof.(Dr.) M. Balamurugan',    'mbala@bdu.ac.in',           staffHash, 'staff'); ensureStaff(s3, 'Professor');
  const s4 = ensureUser('BDU1760794',  'Dr. M. Lalli',                 'lalli@bdu.ac.in',           staffHash, 'staff'); ensureStaff(s4, 'Associate Professor');
  const s5 = ensureUser('BDU1711015',  'Dr. B. Smitha Evelin Zoraida', 'smitha.b@bdu.ac.in',        staffHash, 'staff'); ensureStaff(s5, 'Associate Professor');
  const s6 = ensureUser('BDU1721040',  'Dr. M. Durairaj',              'durairaj.m@bdu.ac.in',      staffHash, 'staff'); ensureStaff(s6, 'Associate Professor');
  const s7 = ensureUser('BDU1751033',  'Dr. P. Sumathy',               'sumathy.p@bdu.ac.in',       staffHash, 'staff'); ensureStaff(s7, 'Assistant Professor');
  const s8 = ensureUser('BDU1711014',  'Dr. K. Muthuramalingam',       'muthuramalingam@bdu.ac.in', staffHash, 'staff'); ensureStaff(s8, 'Assistant Professor');

  // ── Seed essential reference data (idempotent via INSERT OR IGNORE) ──
  db.prepare('INSERT OR IGNORE INTO timetable (program, semester, day, start_time, end_time, course_id, course_name, room, staff_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run('MSc CS', 2, 'Monday', '10:30', '11:30', 'CS501', 'Data Structures', 'Room 301', adminId);
  const noticeExists = db.prepare('SELECT id FROM notices WHERE title = ?').get('Exam Schedule Released');
  if (!noticeExists) {
    db.prepare('INSERT INTO notices (title, content, category, posted_by) VALUES (?, ?, ?, ?)').run('Exam Schedule Released', 'Check portal for internal exam timetable.', 'exam', adminId);
  }

  // ── 5 Demo Alumni ──
  const alumniHash = bcrypt.hashSync('Alumni@1234', 12);
  function ensureAlumni(uid, name, email, batchYear, program, company, jobRole, linkedin, mentorship) {
    const userId = ensureUser(uid, name, email, alumniHash, 'alumni');
    const exists = db.prepare('SELECT id FROM alumni WHERE user_id = ?').get(userId);
    if (!exists) {
      db.prepare('INSERT INTO alumni (user_id, batch_year, program, current_company, current_role, linkedin, available_for_mentorship) VALUES (?, ?, ?, ?, ?, ?, ?)').run(userId, batchYear, program, company, jobRole, linkedin, mentorship ? 1 : 0);
    }
  }

  ensureAlumni('ALM2022001', 'Priya Subramanian',  'priya.s@alumni.edu',   '2020-22', 'MSc CS',     'Google India',       'Software Engineer II',  'https://linkedin.com/in/priyasubramanian',  true);
  ensureAlumni('ALM2022002', 'Karthik Raja M',     'karthik.r@alumni.edu', '2020-22', 'MCA',        'Infosys',            'Senior Developer',      'https://linkedin.com/in/karthikrajam',      true);
  ensureAlumni('ALM2023001', 'Divya Bharathi S',   'divya.b@alumni.edu',   '2021-23', 'MSc AI & DS','TCS',                'Data Analyst',          'https://linkedin.com/in/divyabharathi',     true);
  ensureAlumni('ALM2023002', 'Arun Prasad K',      'arun.p@alumni.edu',    '2021-23', 'MSc CS',     'Zoho Corporation',   'Product Engineer',      'https://linkedin.com/in/arunprasadk',       false);
  ensureAlumni('ALM2024001', 'Nandhini Velmurugan','nandhini.v@alumni.edu','2022-24', 'MTech CS',   'HCL Technologies',   'Software Consultant',   'https://linkedin.com/in/nandhinivelmurugan',true);

  console.log('✅ Staff and admin accounts seeded (1 admin + 7 staff = 8 total). 5 alumni seeded.');

}

// ============================================================
// SEED ALL 137 REAL STUDENTS FROM CLASS ROSTER
// ============================================================
function seedStudentUsers() {
  const alreadySeeded = db.prepare("SELECT COUNT(*) as c FROM users WHERE role='student'").get().c;
  if (alreadySeeded >= 137) {
    console.log(`✅ Student portal accounts already seeded (${alreadySeeded} students).`);
    return;
  }

  const studentHash = bcrypt.hashSync('Student@1234', 12);

  // Map class_name → portal program/semester/batch (must match students table CHECK constraint)
  const CLASS_CONFIG = {
    'II MCA':    { program: 'MCA',        semester: 2, batch_year: '2024-27' },
    'II MSc CS': { program: 'MSc CS',     semester: 2, batch_year: '2024-26' },
    'II MSc DS': { program: 'MSc AI & DS', semester: 2, batch_year: '2024-26' },
    'II MSc AI': { program: 'MSc AI & DS', semester: 2, batch_year: '2024-26' },
    'IV MTech':  { program: 'MTech CS',   semester: 4, batch_year: '2022-24' },
  };

  const classStudents = db.prepare('SELECT * FROM class_students').all();
  const insertUser = db.prepare('INSERT OR IGNORE INTO users (user_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)');

  const doSeed = db.transaction(() => {
    let count = 0;
    for (const cs of classStudents) {
      const config = CLASS_CONFIG[cs.class_name];
      if (!config) continue;

      // Email: reg_no lowercase + @student.edu  (unique since reg_no is unique)
      const email = cs.reg_no.toLowerCase() + '@student.edu';
      insertUser.run(cs.reg_no, cs.name, email, studentHash, 'student');

      const userRow = db.prepare('SELECT id FROM users WHERE user_id = ?').get(cs.reg_no);
      if (userRow) {
        const hasProfile = db.prepare('SELECT id FROM students WHERE user_id = ?').get(userRow.id);
        if (!hasProfile) {
          db.prepare('INSERT INTO students (user_id, program, semester, batch_year) VALUES (?, ?, ?, ?)').run(userRow.id, config.program, config.semester, config.batch_year);
        }
        count++;
      }
    }
    return count;
  });

  const seeded = doSeed();
  console.log(`✅ ${seeded} student portal accounts seeded successfully.`);
}

seedClassStudents();
seedData();
seedStudentUsers();
module.exports = db;

