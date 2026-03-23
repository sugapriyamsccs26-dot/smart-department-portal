const db = require('./db');
setTimeout(() => {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE name='assignment_submissions'").get();
  console.log('--- SCHEMA ---');
  console.log(row.sql);
  process.exit(0);
}, 1000);
