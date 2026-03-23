const Database = require('better-sqlite3');
const db = new Database('portal.db');
console.log(JSON.stringify(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all(), null, 2));
