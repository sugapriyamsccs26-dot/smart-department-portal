const db = require('./backend/db');
console.log('--- MTech Friday Data ---');
console.log(JSON.stringify(db.prepare("SELECT * FROM timetable WHERE program='MTech CS' AND day='Friday'").all(), null, 2));
console.log('--- MTech All Data ---');
console.log(JSON.stringify(db.prepare("SELECT DISTINCT day, semester FROM timetable WHERE program='MTech CS'").all(), null, 2));
console.log('--- Current Staff Users ---');
console.log(JSON.stringify(db.prepare("SELECT u.id, u.name FROM users u JOIN staff s ON u.id = s.user_id").all(), null, 2));
