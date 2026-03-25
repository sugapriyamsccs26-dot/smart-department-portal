const fs = require('fs');
const dbLocal = require('better-sqlite3')('portal.db');
const admin = require('firebase-admin');

try {
  const sa = JSON.parse(fs.readFileSync('config/nexusportal-service-key.json', 'utf8'));
  sa.private_key = sa.private_key.replace(/\\n/g, '\n');
  
  admin.initializeApp({
    credential: admin.credential.cert(sa)
  });
  console.log('Firebase OK');
} catch(e) {
  console.log("Error:", e.message);
  process.exit(1);
}

async function run() {
  const db = admin.firestore();
  console.log('Fetching old timetable...');
  const rows = dbLocal.prepare(`SELECT t.*, u.name as staff_name FROM timetable t LEFT JOIN users u ON t.staff_id = u.id`).all();
  
  console.log(`Uploading ${rows.length} rows...`);
  
  const snap = await db.collection('timetable').get();
  let batch = db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  batch = db.batch();
  for (let i=0; i<rows.length; i++) {
    const row = rows[i];
    const newDoc = {
      program: row.program, semester: row.semester, day: row.day,
      start_time: row.start_time, end_time: row.end_time,
      course_id: row.course_id, course_name: row.course_name,
      room: row.room, staff_name: row.staff_name || 'Unknown'
    };
    batch.set(db.collection('timetable').doc(), newDoc);
    if ((i+1) % 400 === 0) { await batch.commit(); batch = db.batch(); }
  }
  await batch.commit();
  console.log('Upload Complete!');
}
run();
