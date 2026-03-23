const db = require('./backend/db');

console.log('--- DATABASE REPAIR: ADDING MISSING TABLES ---');

try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS exam_marks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            course_id TEXT NOT NULL,
            semester INTEGER NOT NULL,
            exam_type TEXT NOT NULL,
            marks REAL DEFAULT 0,
            uploaded_by TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    `).run();
    console.log('✅ table "exam_marks" created successfully!');
    
    // Also check for 'class_students' (appears in logs)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS class_students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reg_no TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            class_name TEXT NOT NULL
        )
    `).run();
    console.log('✅ table "class_students" ensured!');

} catch (err) {
    console.error('❌ MIGRATION FAILED:', err.message);
}

process.exit();
