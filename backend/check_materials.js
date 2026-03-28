const db = require('./db');
const rows = db.prepare('SELECT id, title, file_path FROM study_materials LIMIT 10').all();
console.log(JSON.stringify(rows, null, 2));
process.exit(0);
