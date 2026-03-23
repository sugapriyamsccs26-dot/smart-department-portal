const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'portal.db'));

const users = db.prepare("SELECT role, COUNT(*) as count FROM users GROUP BY role").all();
process.stdout.write('USER COUNTS:\n');
users.forEach(u => process.stdout.write(u.role + ': ' + u.count + '\n'));

const total = db.prepare("SELECT COUNT(*) as c FROM users").get();
process.stdout.write('TOTAL: ' + total.c + '\n');

const classStudents = db.prepare("SELECT COUNT(*) as c FROM class_students").get();
process.stdout.write('CLASS STUDENTS: ' + classStudents.c + '\n');
