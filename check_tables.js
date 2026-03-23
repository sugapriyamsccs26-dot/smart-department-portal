const db = require('./backend/db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables found:', tables.map(t => t.name).join(', '));
if (!tables.some(t => t.name === 'exam_marks')) {
    console.log('--- MISSING exam_marks TABLE ---');
}
process.exit();
