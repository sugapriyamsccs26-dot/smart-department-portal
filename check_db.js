const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'portal.db'));

try {
    const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const studentsCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    const staffCount = db.prepare('SELECT COUNT(*) as count FROM staff').get().count;
    const classStudentsCount = db.prepare('SELECT COUNT(*) as count FROM class_students').get().count;

    console.log(`Users: ${usersCount}`);
    console.log(`Students (profile): ${studentsCount}`);
    console.log(`Staff (profile): ${staffCount}`);
    console.log(`Class Roster (class_students): ${classStudentsCount}`);

    const staffSample = db.prepare('SELECT user_id, name, role FROM users WHERE role IN ("admin", "staff") LIMIT 5').all();
    console.log('Staff Sample:', JSON.stringify(staffSample, null, 2));

} catch (err) {
    console.error(err);
}
