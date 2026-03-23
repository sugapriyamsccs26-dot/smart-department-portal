const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'portal.db'));

try {
    const result = db.prepare(`
        DELETE FROM assignments 
        WHERE id NOT IN (
            SELECT MIN(id) 
            FROM assignments 
            GROUP BY title, course_id, due_date
        )
    `).run();
    console.log(`Deleted ${result.changes} duplicate assignments.`);
} catch (err) {
    console.error('Error deduping assignments:', err);
} finally {
    db.close();
}
