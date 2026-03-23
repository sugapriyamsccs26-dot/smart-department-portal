const express = require('express');
const router = express.Router();
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');
const { authMiddleware } = require('../middleware/auth');

router.get('/migrate', async (req, res) => {
    try {
        // Read old SQLite table
        const rows = dbConfig.db.prepare(`SELECT t.*, u.name as staff_name FROM timetable t LEFT JOIN users u ON t.staff_id = u.id`).all();
        
        // Clear Firebase timetable
        const snap = await firestore.collection('timetable').get();
        let batch = firestore.batch();
        snap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        
        // Write all rows
        batch = firestore.batch();
        let count = 0;
        for (const row of rows) {
            batch.set(firestore.collection('timetable').doc(), {
                program: row.program, semester: row.semester, day: row.day,
                start_time: row.start_time, end_time: row.end_time,
                course_id: row.course_id, course_name: row.course_name,
                room: row.room, staff_name: row.staff_name || 'Unknown'
            });
            count++;
            if (count % 400 === 0) { await batch.commit(); batch = firestore.batch(); }
        }
        await batch.commit();
        
        res.json({ message: `Migrated ${rows.length} timetable records successfully.` });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', authMiddleware(), async (req, res) => {
    const { program, semester } = req.query;
    try {
        if (dbConfig.isProduction) {
            let ref = firestore.collection('timetable');
            if (program) ref = ref.where('program', '==', program);
            if (semester) ref = ref.where('semester', '==', Number(semester));
            const snap = await ref.get();
            const daysOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5 };
            
            const rows = [];
            snap.forEach(d => rows.push({ id: d.id, ...d.data() }));
            
            rows.sort((a, b) => {
                if (daysOrder[a.day] !== daysOrder[b.day]) return (daysOrder[a.day] || 9) - (daysOrder[b.day] || 9);
                return a.start_time.localeCompare(b.start_time);
            });
            res.json(rows);
        } else {
            let query = `
                SELECT t.*, u.name as staff_name 
                FROM timetable t 
                LEFT JOIN users u ON t.staff_id = u.id 
                WHERE 1=1
            `;
            const params = [];
            if (program) { query += ' AND t.program = ?'; params.push(program); }
            if (semester) { query += ' AND t.semester = ?'; params.push(Number(semester)); }
            query += " ORDER BY CASE t.day WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 END, t.start_time";
            res.json(dbConfig.db.prepare(query).all(...params));
        }
    } catch (err) { res.status(500).json({ message: 'Server error fetching timetable.' }); }
});

router.post('/', authMiddleware(['admin']), async (req, res) => {
    const { program, semester, day, start_time, end_time, course_id, course_name, room, staff_id } = req.body;
    if (!program || !semester || !day || !start_time || !end_time || !course_id || !course_name) return res.status(400).json({ message: 'Required fields missing.' });
    try {
        if (dbConfig.isProduction) {
            let staff_name = null;
            if (staff_id) {
                const userSnap = await firestore.collection('users').doc(String(staff_id)).get();
                if (userSnap.exists) staff_name = userSnap.data().name;
            }
            await firestore.collection('timetable').add({
                program, semester: Number(semester), day, start_time, end_time, course_id, course_name, 
                room: room || '', staff_id: staff_id ? String(staff_id) : null, staff_name
            });
        } else {
            dbConfig.db.prepare('INSERT INTO timetable (program, semester, day, start_time, end_time, course_id, course_name, room, staff_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(program, semester, day, start_time, end_time, course_id, course_name, room || '', staff_id || null);
        }
        res.status(201).json({ message: 'Added.' });
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.put('/:id', authMiddleware(['admin']), async (req, res) => {
    const { id } = req.params;
    const { program, semester, day, start_time, end_time, course_id, course_name, room, staff_id } = req.body;
    try {
        if (dbConfig.isProduction) {
            let staff_name = null;
            if (staff_id) {
                const userSnap = await firestore.collection('users').doc(String(staff_id)).get();
                if (userSnap.exists) staff_name = userSnap.data().name;
            }
            await firestore.collection('timetable').doc(id).update({
                program, semester: Number(semester), day, start_time, end_time, course_id, course_name,
                room: room || '', staff_id: staff_id ? String(staff_id) : null, staff_name
            });
        } else {
            dbConfig.db.prepare(`UPDATE timetable SET program=?, semester=?, day=?, start_time=?, end_time=?, course_id=?, course_name=?, room=?, staff_id=? WHERE id=?`)
              .run(program, semester, day, start_time, end_time, course_id, course_name, room || '', staff_id || null, id);
        }
        res.json({ message: 'Updated.' });
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.post('/substitute', authMiddleware(['admin']), async (req, res) => {
    const { timetable_id, original_staff_id, substitute_staff_id, date } = req.body;
    if (!timetable_id || !original_staff_id || !substitute_staff_id || !date) {
        return res.status(400).json({ message: 'Missing fields.' });
    }
    try {
        if (dbConfig.isProduction) {
            await firestore.collection('substitutions').add({
                timetable_id: String(timetable_id), original_staff_id: String(original_staff_id),
                substitute_staff_id: String(substitute_staff_id), date, created_at: new Date().toISOString()
            });
            const slotDoc = await firestore.collection('timetable').doc(String(timetable_id)).get();
            if (slotDoc.exists) {
                const slot = slotDoc.data();
                const msg = `This class (${slot.course_name} at ${slot.start_time}) is allotted to you for today (${date}) (Substitution).`;
                await firestore.collection('notifications').add({
                    user_id: String(substitute_staff_id), message: msg, is_read: false, created_at: new Date().toISOString()
                });
            }
        } else {
            dbConfig.db.prepare('INSERT INTO substitutions (timetable_id, original_staff_id, substitute_staff_id, date) VALUES (?, ?, ?, ?)').run(timetable_id, original_staff_id, substitute_staff_id, date);
            const slot = dbConfig.db.prepare('SELECT course_name, start_time FROM timetable WHERE id = ?').get(timetable_id);
            const msg = `This class (${slot.course_name} at ${slot.start_time}) is allotted to you for today (${date}) (Substitution).`;
            dbConfig.db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(substitute_staff_id, msg);
        }
        res.status(201).json({ message: 'Substitution assigned and staff notified!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error assigning substitution.' });
    }
});

router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
    try { 
        if (dbConfig.isProduction) await firestore.collection('timetable').doc(req.params.id).delete();
        else dbConfig.db.prepare('DELETE FROM timetable WHERE id = ?').run(req.params.id); 
        res.json({ message: 'Deleted.' }); 
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;
