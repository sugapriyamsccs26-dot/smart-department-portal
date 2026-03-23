-- SUPABASE SCHEMA MIGRATION (POSTGRESQL)
-- Copy and Paste this into the Supabase SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('student','staff','admin','alumni')) NOT NULL,
  profile_picture TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program TEXT CHECK(program IN ('MSc CS','MSc AI & DS','MCA','MTech CS')) NOT NULL,
  semester INTEGER NOT NULL,
  batch_year TEXT NOT NULL
);

-- 3. Staff Tables
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department TEXT DEFAULT 'Computer Application and Engineering',
  designation TEXT NOT NULL,
  joining_date TEXT DEFAULT 'N/A'
);

CREATE TABLE IF NOT EXISTS staff_details (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  address TEXT,
  qualification TEXT,
  experience_years INTEGER,
  specialization TEXT,
  joining_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS staff_documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK(status IN ('present','absent','late','excused')) NOT NULL,
  marked_by TEXT DEFAULT 'web',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, date)
);

-- 5. Academic Content
CREATE TABLE IF NOT EXISTS study_materials (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  type TEXT CHECK(type IN ('notes','ppt','lab_manual','question_paper','syllabus')) NOT NULL,
  program TEXT DEFAULT NULL,
  uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  file_path TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  grade TEXT DEFAULT NULL,
  feedback TEXT DEFAULT NULL,
  UNIQUE(assignment_id, student_id)
);

-- 6. Marks & Results
CREATE TABLE IF NOT EXISTS marks (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  semester INTEGER NOT NULL,
  internal_marks REAL DEFAULT 0,
  external_marks REAL DEFAULT 0,
  total REAL DEFAULT 0,
  UNIQUE(student_id, course_id, semester)
);

CREATE TABLE IF NOT EXISTS exam_marks (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  semester INTEGER NOT NULL,
  exam_type TEXT CHECK(exam_type IN ('Internal 1', 'Internal 2', 'Model Exam', 'Semester')) NOT NULL,
  marks REAL DEFAULT 0,
  UNIQUE(student_id, course_id, semester, exam_type)
);

-- 7. Infrastructure
CREATE TABLE IF NOT EXISTS timetable (
  id SERIAL PRIMARY KEY,
  program TEXT NOT NULL,
  semester INTEGER NOT NULL,
  day TEXT CHECK(day IN ('Monday','Tuesday','Wednesday','Thursday','Friday')) NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_name TEXT NOT NULL,
  room TEXT DEFAULT NULL,
  staff_id INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notices (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  posted_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT,
  type TEXT DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- 8. Corporate & Career
CREATE TABLE IF NOT EXISTS placements (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  package TEXT,
  type TEXT CHECK(type IN ('internship','full_time')) NOT NULL,
  location TEXT,
  apply_link TEXT,
  deadline TEXT,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alumni (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  batch_year TEXT NOT NULL,
  program TEXT NOT NULL,
  current_company TEXT,
  user_role TEXT,
  linkedin TEXT,
  available_for_mentorship INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK(type IN ('course','faculty','department')) NOT NULL,
  subject_id TEXT DEFAULT NULL,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. External Class Students (Bulk Ops Support)
CREATE TABLE IF NOT EXISTS class_students (
  id SERIAL PRIMARY KEY,
  reg_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  program TEXT NOT NULL,
  class_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS class_attendance (
  id SERIAL PRIMARY KEY,
  reg_no TEXT NOT NULL REFERENCES class_students(reg_no) ON DELETE CASCADE,
  date DATE NOT NULL,
  subject TEXT DEFAULT 'General',
  status TEXT CHECK(status IN ('present','absent')) NOT NULL DEFAULT 'absent',
  marked_by TEXT DEFAULT 'admin',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(reg_no, date, subject)
);

CREATE TABLE IF NOT EXISTS substitutions (
  id SERIAL PRIMARY KEY,
  timetable_id INTEGER NOT NULL REFERENCES timetable(id) ON DELETE CASCADE,
  original_staff_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  substitute_staff_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
