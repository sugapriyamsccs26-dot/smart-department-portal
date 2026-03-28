const Database = require('better-sqlite3');
const db = new Database('portal.db');
const id = 105;
const row = db.prepare('SELECT * FROM study_materials WHERE id = ?').get(id);
console.log(JSON.stringify(row, null, 2));
db.close();
