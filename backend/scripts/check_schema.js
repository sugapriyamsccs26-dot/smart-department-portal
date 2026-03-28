const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../portal.db'));

const tablesSnapshot = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('--- DATABASE SCHEMA ---');
for (const t of tablesSnapshot) {
    console.log(`\nTable: ${t.name}`);
    const schema = db.prepare(`PRAGMA table_info(${t.name})`).all();
    console.log(schema.map(c => `${c.name} (${c.type})`).join(', '));
}
