const Database = require('better-sqlite3');
const db = new Database('portal.db');

console.log('🌱 Seeding sample analytics data...');

// 1. Seed some attendance
const students = db.prepare("SELECT id FROM students").all();
const courses = ['Advanced Java', 'Network Security', 'Machine Learning', 'Cloud Computing', 'IoT', 'Data Structures', 'Operating Systems'];
const states = ['present', 'present', 'present', 'absent']; // 75% present rateish

const insertAtt = db.prepare("INSERT OR IGNORE INTO attendance (student_id, course_id, date, status, marked_by) VALUES (?, ?, ?, ?, ?)");

db.transaction(() => {
    for (const s of students) {
        for (const c of courses) {
            for (let i = 1; i <= 5; i++) { // 5 days of attendance
                const status = states[Math.floor(Math.random() * states.length)];
                insertAtt.run(s.id, c, `2026-03-${String(10 + i).padStart(2, '0')}`, status, 'Dr. George');
            }
        }
    }
})();

// 2. Seed some marks
const insertMarks = db.prepare("INSERT OR IGNORE INTO marks (student_id, course_id, semester, internal_marks, external_marks, total) VALUES (?, ?, ?, ?, ?, ?)");

db.transaction(() => {
    for (const s of students) {
        for (const c of courses) {
            const internal = Math.floor(Math.random() * 10) + 15; // 15-25
            const external = Math.floor(Math.random() * 40) + 30; // 30-70
            insertMarks.run(s.id, c, 2, internal, external, internal + external);
        }
    }
})();

console.log('✅ Sample analytics data seeded.');
