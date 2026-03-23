const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'portal.db'));

try {
    const result = db.prepare(`
        DELETE FROM notices 
        WHERE id NOT IN (
            SELECT MIN(id) 
            FROM notices 
            GROUP BY title, content
        )
    `).run();
    console.log(`Deleted ${result.changes} duplicate notices.`);
} catch (err) {
    console.error('Error deduping notices:', err);
} finally {
    db.close();
}
