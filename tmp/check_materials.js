const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'backend', 'portal.db'));

try {
    const materials = db.prepare('SELECT id, title, file_path FROM study_materials').all();
    console.log(JSON.stringify(materials, null, 2));
} catch (err) {
    console.error(err);
} finally {
    db.close();
}
