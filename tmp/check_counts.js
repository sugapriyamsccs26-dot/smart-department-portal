const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'backend', 'portal.db'));

const users = db.prepare("SELECT role, COUNT(*) as count FROM users GROUP BY role").all();
console.log('=== USER COUNTS IN LOCAL DATABASE ===');
users.forEach(u => console.log(u.role + ': ' + u.count));

const total = db.prepare("SELECT COUNT(*) as c FROM users").get();
console.log('TOTAL USERS:', total.c);

const classStudents = db.prepare("SELECT COUNT(*) as c FROM class_students").get();
console.log('CLASS STUDENTS (roster):', classStudents.c);

console.log('\n=== SAMPLE STUDENTS ===');
const sample = db.prepare("SELECT user_id, name, role FROM users WHERE role='student' LIMIT 5").all();
sample.forEach(s => console.log(s.user_id, '-', s.name));
