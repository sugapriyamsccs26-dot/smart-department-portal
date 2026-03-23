const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'portal.db'));

const TIMETABLE_DATA = {
  "MSC_CS": {
    "monday": [
      { "time": "10:30–11:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "11:30–12:30", "subject": "Operating Systems", "faculty": "Dr. P. Sumathy" },
      { "time": "12:30–1:30", "subject": "AI Lab", "faculty": "Dr. Gopinath Ganapathy", "type": "lab" },
      { "time": "2:30–3:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "3:30–4:30", "subject": "Value Added Course", "faculty": "Prof.(Dr.) M. Balamurugan", "type": "vac" },
      { "time": "4:30–5:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" }
    ],
    "tuesday": [
      { "time": "10:30–11:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "11:30–12:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "12:30–1:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "2:30–3:30", "subject": "Python Lab", "faculty": "Dr. K. Muthuramalingam", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "4:30–5:30", "subject": "Operating Systems", "faculty": "Dr. P. Sumathy" }
    ],
    "wednesday": [
      { "time": "10:30–11:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "11:30–12:30", "subject": "Value Added Course", "faculty": "Dr. P. Sumathy", "type": "vac" },
      { "time": "12:30–1:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "2:30–3:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "3:30–4:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "4:30–5:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" }
    ],
    "thursday": [
      { "time": "10:30–11:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "11:30–12:30", "subject": "DBMS Lab", "faculty": "Dr. B. Smitha Evelin Zoraida", "type": "lab" },
      { "time": "12:30–1:30", "subject": "Operating Systems", "faculty": "Dr. P. Sumathy" },
      { "time": "2:30–3:30", "subject": "Computer Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "3:30–4:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "4:30–5:30", "subject": "Value Added Course", "faculty": "Dr. M. Durairaj", "type": "vac" }
    ],
    "friday": [
      { "time": "10:30–11:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Computer Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "12:30–1:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "2:30–3:30", "subject": "Operating Systems", "faculty": "Dr. P. Sumathy" },
      { "time": "3:30–4:30", "subject": "OS Lab", "faculty": "Dr. M. Lalli", "type": "lab" },
      { "time": "4:30–5:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" }
    ],
    "saturday": [
      { "time": "10:30–11:30", "subject": "Value Added Course", "faculty": "Dr. Gopinath Ganapathy", "type": "vac" },
      { "time": "11:30–12:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "12:30–1:30", "subject": "Algorithms Lab", "faculty": "Dr. M. Durairaj", "type": "lab" },
      { "time": "2:30–3:30", "subject": "Data Structures", "faculty": "Dr. P. Sumathy" },
      { "time": "3:30–4:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "4:30–5:30", "subject": "Computer Networks", "faculty": "Dr. K. Muthuramalingam" }
    ]
  },
  "MSC_DS": {
    "monday": [
      { "time": "10:30–11:30", "subject": "Data Science Fundamentals", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "12:30–1:30", "subject": "Statistical Methods", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "2:30–3:30", "subject": "Data Science Lab", "faculty": "Dr. M. Durairaj", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Big Data Analytics", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "4:30–5:30", "subject": "Value Added Course", "faculty": "Dr. P. Sumathy", "type": "vac" }
    ],
    "tuesday": [
      { "time": "10:30–11:30", "subject": "Big Data Analytics", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "11:30–12:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "12:30–1:30", "subject": "Data Visualization", "faculty": "Dr. M. Lalli" },
      { "time": "2:30–3:30", "subject": "Statistical Methods", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "3:30–4:30", "subject": "Python Lab", "faculty": "Dr. P. Sumathy", "type": "lab" },
      { "time": "4:30–5:30", "subject": "Data Science Fundamentals", "faculty": "Prof.(Dr.) M. Balamurugan" }
    ],
    "wednesday": [
      { "time": "10:30–11:30", "subject": "Statistical Methods", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "11:30–12:30", "subject": "Value Added Course", "faculty": "Dr. Gopinath Ganapathy", "type": "vac" },
      { "time": "12:30–1:30", "subject": "Big Data Analytics", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "2:30–3:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "3:30–4:30", "subject": "Machine Learning for DS", "faculty": "Dr. M. Lalli" },
      { "time": "4:30–5:30", "subject": "Big Data Lab", "faculty": "Dr. M. Durairaj", "type": "lab" }
    ],
    "thursday": [
      { "time": "10:30–11:30", "subject": "Data Science Fundamentals", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Data Visualization", "faculty": "Dr. M. Lalli" },
      { "time": "12:30–1:30", "subject": "Statistical Methods", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "2:30–3:30", "subject": "Analytics Lab", "faculty": "Dr. P. Sumathy", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Value Added Course", "faculty": "Dr. B. Smitha Evelin Zoraida", "type": "vac" },
      { "time": "4:30–5:30", "subject": "Big Data Analytics", "faculty": "Dr. E. George Dharma Prakash Raj" }
    ],
    "friday": [
      { "time": "10:30–11:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "11:30–12:30", "subject": "Data Visualization", "faculty": "Dr. M. Lalli" },
      { "time": "12:30–1:30", "subject": "Data Science Fundamentals", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "2:30–3:30", "subject": "Big Data Analytics", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "3:30–4:30", "subject": "Value Added Course", "faculty": "Dr. M. Durairaj", "type": "vac" },
      { "time": "4:30–5:30", "subject": "Stats Lab", "faculty": "Dr. K. Muthuramalingam", "type": "lab" }
    ],
    "saturday": [
      { "time": "10:30–11:30", "subject": "Value Added Course", "faculty": "Dr. P. Sumathy", "type": "vac" },
      { "time": "11:30–12:30", "subject": "Python Lab", "faculty": "Dr. B. Smitha Evelin Zoraida", "type": "lab" },
      { "time": "12:30–1:30", "subject": "Data Visualization", "faculty": "Dr. M. Lalli" },
      { "time": "2:30–3:30", "subject": "Statistical Methods", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "3:30–4:30", "subject": "Data Science Fundamentals", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "4:30–5:30", "subject": "Big Data Analytics", "faculty": "Dr. E. George Dharma Prakash Raj" }
    ]
  },
  "MSC_AI": {
    "monday": [
      { "time": "10:30–11:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "11:30–12:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "12:30–1:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "2:30–3:30", "subject": "AI Lab", "faculty": "Dr. P. Sumathy", "type": "lab" },
      { "time": "3:30–4:30", "subject": "NLP", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "4:30–5:30", "subject": "Computer Vision", "faculty": "Dr. K. Muthuramalingam" }
    ],
    "tuesday": [
      { "time": "10:30–11:30", "subject": "NLP", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Computer Vision", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "12:30–1:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "2:30–3:30", "subject": "Value Added Course", "faculty": "Dr. E. George Dharma Prakash Raj", "type": "vac" },
      { "time": "3:30–4:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "4:30–5:30", "subject": "ML Lab", "faculty": "Dr. M. Lalli", "type": "lab" }
    ],
    "wednesday": [
      { "time": "10:30–11:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "11:30–12:30", "subject": "Computer Vision", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "12:30–1:30", "subject": "NLP Lab", "faculty": "Prof.(Dr.) M. Balamurugan", "type": "lab" },
      { "time": "2:30–3:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "3:30–4:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "4:30–5:30", "subject": "Value Added Course", "faculty": "Dr. M. Durairaj", "type": "vac" }
    ],
    "thursday": [
      { "time": "10:30–11:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "11:30–12:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "12:30–1:30", "subject": "Computer Vision", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "2:30–3:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "3:30–4:30", "subject": "Vision Lab", "faculty": "Dr. P. Sumathy", "type": "lab" },
      { "time": "4:30–5:30", "subject": "NLP", "faculty": "Prof.(Dr.) M. Balamurugan" }
    ],
    "friday": [
      { "time": "10:30–11:30", "subject": "NLP", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Value Added Course", "faculty": "Dr. K. Muthuramalingam", "type": "vac" },
      { "time": "12:30–1:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "2:30–3:30", "subject": "Python Lab", "faculty": "Dr. B. Smitha Evelin Zoraida", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "4:30–5:30", "subject": "Computer Vision", "faculty": "Dr. E. George Dharma Prakash Raj" }
    ],
    "saturday": [
      { "time": "10:30–11:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "11:30–12:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "12:30–1:30", "subject": "Value Added Course", "faculty": "Dr. P. Sumathy", "type": "vac" },
      { "time": "2:30–3:30", "subject": "NLP", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "3:30–4:30", "subject": "Advanced AI Lab", "faculty": "Dr. M. Durairaj", "type": "lab" },
      { "time": "4:30–5:30", "subject": "Computer Vision", "faculty": "Dr. K. Muthuramalingam" }
    ]
  },
  "MCA": {
    "monday": [
      { "time": "10:30–11:30", "subject": "Java Programming", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "11:30–12:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "12:30–1:30", "subject": "Java Lab", "faculty": "Dr. P. Sumathy", "type": "lab" },
      { "time": "2:30–3:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "3:30–4:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "4:30–5:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" }
    ],
    "tuesday": [
      { "time": "10:30–11:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "11:30–12:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "12:30–1:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "2:30–3:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "3:30–4:30", "subject": "Java Programming", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "4:30–5:30", "subject": "DBMS Lab", "faculty": "Dr. E. George Dharma Prakash Raj", "type": "lab" }
    ],
    "wednesday": [
      { "time": "10:30–11:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "11:30–12:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "12:30–1:30", "subject": "Java Programming", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "2:30–3:30", "subject": "Value Added Course", "faculty": "Dr. M. Lalli", "type": "vac" },
      { "time": "3:30–4:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "4:30–5:30", "subject": "DS Lab", "faculty": "Dr. P. Sumathy", "type": "lab" }
    ],
    "thursday": [
      { "time": "10:30–11:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Java Programming", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "12:30–1:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "2:30–3:30", "subject": "SE Lab", "faculty": "Dr. B. Smitha Evelin Zoraida", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "4:30–5:30", "subject": "DBMS", "faculty": "Dr. E. George Dharma Prakash Raj" }
    ],
    "friday": [
      { "time": "10:30–11:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "11:30–12:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "12:30–1:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "2:30–3:30", "subject": "Java Programming", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "3:30–4:30", "subject": "Value Added Course", "faculty": "Dr. M. Durairaj", "type": "vac" },
      { "time": "4:30–5:30", "subject": "AI Lab", "faculty": "Dr. P. Sumathy", "type": "lab" }
    ],
    "saturday": [
      { "time": "10:30–11:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "11:30–12:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "12:30–1:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "2:30–3:30", "subject": "Java Lab", "faculty": "Dr. K. Muthuramalingam", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "4:30–5:30", "subject": "Value Added Course", "faculty": "Dr. E. George Dharma Prakash Raj", "type": "vac" }
    ]
  },
  "MTECH": {
    "monday": [
      { "time": "10:30–11:30", "subject": "Advanced DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "11:30–12:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "12:30–1:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "2:30–3:30", "subject": "Cloud Lab", "faculty": "Dr. P. Sumathy", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Object Oriented Design", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "4:30–5:30", "subject": "Advanced Networks", "faculty": "Dr. K. Muthuramalingam" }
    ],
    "tuesday": [
      { "time": "10:30–11:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "11:30–12:30", "subject": "Object Oriented Design", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "12:30–1:30", "subject": "Advanced DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "2:30–3:30", "subject": "Advanced Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "3:30–4:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "4:30–5:30", "subject": "ML Lab", "faculty": "Dr. Gopinath Ganapathy", "type": "lab" }
    ],
    "wednesday": [
      { "time": "10:30–11:30", "subject": "Advanced Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "11:30–12:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "12:30–1:30", "subject": "Networks Lab", "faculty": "Dr. M. Durairaj", "type": "lab" },
      { "time": "2:30–3:30", "subject": "Advanced DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "3:30–4:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "4:30–5:30", "subject": "Value Added Course", "faculty": "Dr. P. Sumathy", "type": "vac" }
    ],
    "thursday": [
      { "time": "10:30–11:30", "subject": "Object Oriented Design", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Advanced DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "12:30–1:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "2:30–3:30", "subject": "Value Added Course", "faculty": "Dr. Gopinath Ganapathy", "type": "vac" },
      { "time": "3:30–4:30", "subject": "Advanced Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "4:30–5:30", "subject": "OOD Lab", "faculty": "Dr. E. George Dharma Prakash Raj", "type": "lab" }
    ],
    "friday": [
      { "time": "10:30–11:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "11:30–12:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "12:30–1:30", "subject": "Object Oriented Design", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "2:30–3:30", "subject": "Advanced Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "3:30–4:30", "subject": "Advanced DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "4:30–5:30", "subject": "Advanced DBMS Lab", "faculty": "Dr. M. Durairaj", "type": "lab" }
    ],
    "saturday": [
      { "time": "10:30–11:30", "subject": "Advanced Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "11:30–12:30", "subject": "Value Added Course", "faculty": "Dr. M. Lalli", "type": "vac" },
      { "time": "12:30–1:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "2:30–3:30", "subject": "Object Oriented Design", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "3:30–4:30", "subject": "Advanced DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "4:30–5:30", "subject": "Research Methodology", "faculty": "Dr. Gopinath Ganapathy" }
    ]
  }
};

const PROGRAM_MAP = {
  "MSC_CS": "MSc CS",
  "MSC_DS": "MSc AI & DS",
  "MSC_AI": "MSc AI & DS",
  "MCA": "MCA",
  "MTECH": "MTech CS"
};

const SEM_MAP = {
  "MSC_CS": 2,
  "MSC_DS": 2,
  "MSC_AI": 2,
  "MCA": 2,
  "MTECH": 4
};

// Get all staff to map names to IDs
const staff = db.prepare('SELECT u.id, u.name FROM users u JOIN staff s ON u.id = s.user_id').all();
const staffMap = {};
staff.forEach(s => staffMap[s.name] = s.id);

// Drop and recreate table with correct check constraints
db.prepare('DROP TABLE IF EXISTS substitutions').run();
db.prepare('DROP TABLE IF EXISTS timetable').run();
db.exec(`
  CREATE TABLE timetable (
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
  
  CREATE TABLE substitutions (
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
`);

const insert = db.prepare('INSERT INTO timetable (program, semester, day, start_time, end_time, course_id, course_name, room, staff_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

for (const progKey in TIMETABLE_DATA) {
  const progName = PROGRAM_MAP[progKey];
  const sem = SEM_MAP[progKey];
  const days = TIMETABLE_DATA[progKey];
  
  for (const day in days) {
    const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
    days[day].forEach(slot => {
      const [start, end] = slot.time.split('–');
      const staffId = staffMap[slot.faculty] || null;
      insert.run(
        progName, 
        sem, 
        capitalizedDay, 
        start.trim(), 
        end.trim(), 
        slot.subject.substring(0, 10).toUpperCase(), // course_id dummy
        slot.subject, 
        'Room ' + (Math.floor(Math.random() * 200) + 101), 
        staffId
      );
    });
  }
}

console.log('✅ Timetable database seeded successfully!');
