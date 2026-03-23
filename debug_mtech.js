const fs = require('fs');
const db = require('./backend/db');
fs.writeFileSync('debug_out.json', JSON.stringify({
friday: db.prepare("SELECT * FROM timetable WHERE program='MTech CS' AND day='Friday'").all(),
allMtech: db.prepare("SELECT DISTINCT day, semester FROM timetable WHERE program='MTech CS'").all(),
staffIds: db.prepare("SELECT u.id, u.name as staff_name FROM users u JOIN staff s ON u.id = s.user_id").all()
}, null, 2));
