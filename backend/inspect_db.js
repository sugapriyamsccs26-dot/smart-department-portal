const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'portal.db'));

try {
    console.log('--- Database Stats ---');
    console.log('Users:', db.prepare('SELECT COUNT(*) as count FROM users').get().count);
    console.log('Students:', db.prepare('SELECT COUNT(*) as count FROM students').get().count);
    console.log('Staff:', db.prepare('SELECT COUNT(*) as count FROM staff').get().count);
    console.log('Class Students:', db.prepare('SELECT COUNT(*) as count FROM class_students').get().count);

    console.log('\n--- Sample Users ---');
    console.log(db.prepare('SELECT user_id, name, role FROM users LIMIT 5').all());

    console.log('\n--- Sample Class Students ---');
    console.log(db.prepare('SELECT reg_no, name, class_name FROM class_students LIMIT 5').all());

    console.log('\n--- Staff Data Check ---');
    const staffQuery = `
        SELECT u.user_id, u.name, st.designation, st.joining_date
        FROM users u
        LEFT JOIN staff st ON u.id = st.user_id
        WHERE u.role IN ('admin', 'staff')
    `;
    console.log(db.prepare(staffQuery).all());

} catch (err) {
    console.error('Error querying database:', err);
}
