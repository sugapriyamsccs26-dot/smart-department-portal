const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { db: firestore } = require('../config/firebaseNode');

// Load DB
const dbFile = path.join(__dirname, '../portal.db');
if (!fs.existsSync(dbFile)) {
    console.error('❌ portal.db not found!');
    process.exit(1);
}
const db = new Database(dbFile);

async function fullSync() {
    console.log('🚀 Starting Full Firestore Sync...');

    const collections = [
        { table: 'users', collection: 'users', docId: 'id' },
        { table: 'students', collection: 'students', docId: 'id' },
        { table: 'staff', collection: 'staff', docId: 'id' },
        { table: 'staff_details', collection: 'staff_details', docId: 'id' },
        { table: 'attendance', collection: 'attendance' },
        { table: 'study_materials', collection: 'study_materials' },
        { table: 'assignments', collection: 'assignments' },
        { table: 'assignment_submissions', collection: 'assignment_submissions' },
        { table: 'marks', collection: 'marks' },
        { table: 'exam_marks', collection: 'exam_marks' },
        { table: 'timetable', collection: 'timetable' },
        { table: 'notices', collection: 'notices' },
        { table: 'events', collection: 'events' },
        { table: 'placements', collection: 'placements' },
        { table: 'alumni', collection: 'alumni' },
        { table: 'class_students', collection: 'class_students', docId: 'id' },
        { table: 'class_attendance', collection: 'class_attendance' }
    ];

    for (const col of collections) {
        console.log(`📦 Syncing ${col.table} -> Firestore [${col.collection}]...`);
        
        // 1. Fetch data from SQLite
        let rows = [];
        try {
            if (col.table === 'users') {
                rows = db.prepare('SELECT * FROM users').all();
            } else if (col.table === 'students') {
                rows = db.prepare('SELECT * FROM students').all();
            } else if (col.table === 'timetable') {
                rows = db.prepare('SELECT t.*, u.name as staff_name FROM timetable t LEFT JOIN users u ON t.staff_id = u.id').all();
            } else if (col.table === 'marks') {
                // Join with users/students to get relevant names if needed, but the route logic usually handles IDs
                rows = db.prepare('SELECT * FROM marks').all();
            } else {
                rows = db.prepare(`SELECT * FROM ${col.table}`).all();
            }
        } catch (e) {
            console.log(`⚠️ Skip ${col.table}: ${e.message}`);
            continue;
        }

        if (rows.length === 0) {
            console.log(`ℹ️ [${col.table}] is empty.`);
            continue;
        }

        // 2. Clear Firestore collection (optional but safer for full sync)
        const snap = await firestore.collection(col.collection).get();
        let batch = firestore.batch();
        snap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        // 3. Upload rows in batches
        batch = firestore.batch();
        let count = 0;
        for (const row of rows) {
            let docRef;
            if (col.docId && row[col.docId]) {
                docRef = firestore.collection(col.collection).doc(String(row[col.docId]));
            } else {
                docRef = firestore.collection(col.collection).doc();
            }

            // Convert numeric IDs to strings for Firestore consistency where needed
            const data = { ...row };
            
            // Special handling for staff_id, student_id, user_id (convert to string)
            ['id', 'user_id', 'student_id', 'staff_id', 'uploaded_by', 'posted_by', 'created_by', 'assignment_id', 'event_id'].forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    data[key] = String(data[key]);
                }
            });

            batch.set(docRef, data);
            count++;
            if (count % 400 === 0) {
                await batch.commit();
                batch = firestore.batch();
            }
        }
        await batch.commit();
        console.log(`✅ [${col.collection}] synced: ${count} documents.`);
    }

    console.log('✨ Full Firestore Sync Complete!');
    process.exit(0);
}

fullSync().catch(err => {
    console.error('❌ Sync Failed:', err);
    process.exit(1);
});
