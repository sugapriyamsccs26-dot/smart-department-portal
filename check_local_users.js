const Database = require('better-sqlite3');
const db = new Database('portal.db');
const users = db.prepare('SELECT user_id, name, role FROM users LIMIT 10').all();
console.log('--- LOCAL USERS ---');
console.table(users);
console.log(`TOTAL USERS: ${db.prepare('SELECT count(*) as count FROM users').get().count}`);
db.close();
