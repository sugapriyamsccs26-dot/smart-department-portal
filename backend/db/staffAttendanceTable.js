const db = require('../db');

// Create staff_attendance table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS staff_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT NOT NULL,
    date TEXT NOT NULL,
    check_in_time TEXT,
    latitude REAL,
    longitude REAL,
    distance_meters REAL,
    status TEXT DEFAULT 'outside'
  );
`);

console.log('✅ Staff Attendance table ensured.');
