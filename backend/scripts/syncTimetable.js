const fs = require('fs');
const path = require('path');
const dbLocal = require('better-sqlite3')(path.join(__dirname, '../portal.db'));
const { admin, db } = require('../config/firebaseNode');

async function sync() {

  console.log('Fetching old timetable from local SQLite...');
  
  // Get all rows, joining with users to get the staff name
  const rows = dbLocal.prepare(`
    SELECT t.*, u.name as staff_name 
    FROM timetable t
    LEFT JOIN users u ON t.staff_id = u.id
  `).all();
  
  console.log(`Found ${rows.length} rows inside local SQLite.`);

  // Clear existing Firestore timetable
  console.log('Clearing current Firebase timetable...');
  const snapshot = await db.collection('timetable').get();
  let batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  console.log('Uploading real timetable back to Firebase...');
  
  // Upload all to Firestore
  batch = db.batch();
  let count = 0;
  for (const row of rows) {
    const ref = db.collection('timetable').doc();
    // omit 'id' and 'staff_id', just push the useful fields
    const newDoc = {
      program: row.program,
      semester: row.semester,
      day: row.day,
      start_time: row.start_time,
      end_time: row.end_time,
      course_id: row.course_id,
      course_name: row.course_name,
      room: row.room,
      staff_name: row.staff_name || 'Unknown'
    };
    batch.set(ref, newDoc);
    
    count++;
    if (count % 400 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }
  if (count % 400 !== 0) {
    await batch.commit();
  }
  
  console.log('✅ Local timetable successfully restored to Cloud!');
  process.exit(0);
}

sync().catch(err => {
  console.error(err);
  process.exit(1);
});
