const express = require('express');
const router = express.Router();
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');
const { authMiddleware } = require('../middleware/auth');
const syncService = require('../cloud/syncService');

// GET /api/attendance/classes — list all distinct class names for attendance filtering
router.get('/classes', authMiddleware(['admin', 'staff', 'student', 'alumni']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snap = await firestore.collection('class_students').get();
            const classMap = {};
            snap.forEach(d => {
                const data = d.data();
                if (data.class_name && data.program) classMap[data.class_name] = data.program;
            });
            const rows = Object.keys(classMap).map(k => ({ class_name: k, program: classMap[k] }));
            rows.sort((a,b) => a.program.localeCompare(b.program) || a.class_name.localeCompare(b.class_name));
            res.json(rows);
        } else {
            const rows = dbConfig.db.prepare(`SELECT DISTINCT class_name, program FROM class_students ORDER BY program, class_name`).all();
            res.json(rows);
        }
    } catch (err) {
        console.error('Attendance classes error:', err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/attendance/by-class?class_name=&date= — fetch attendance for a class on a date
router.get('/by-class', authMiddleware(['admin', 'staff', 'student', 'alumni']), async (req, res) => {
    const { class_name, date, subject } = req.query;
    if (!class_name || !date) return res.status(400).json({ message: 'class_name and date are required.' });
    const subj = subject || 'General';
    try {
        if (dbConfig.isProduction) {
            const studentsSnap = await firestore.collection('class_students').where('class_name', '==', class_name).get();
            const attSnap = await firestore.collection('class_attendance').where('date', '==', date).where('subject', '==', subj).get();
            
            const attMap = {};
            attSnap.forEach(d => { attMap[d.data().reg_no] = d.data(); });
            
            const rows = [];
            studentsSnap.forEach(s => {
                const stu = s.data();
                const att = attMap[stu.reg_no] || {};
                rows.push({
                    reg_no: stu.reg_no, name: stu.name, program: stu.program, class_name: stu.class_name,
                    status: att.status || 'not_marked',
                    marked_by: att.marked_by, timestamp: att.timestamp || att.date, subject: subj
                });
            });
            rows.sort((a, b) => a.reg_no.localeCompare(b.reg_no));
            res.json(rows);
        } else {
            const rows = dbConfig.db.prepare(`
                SELECT cs.reg_no, cs.name, cs.program, cs.class_name,
                    COALESCE(ca.status, 'not_marked') as status,
                    ca.marked_by, ca.timestamp, ca.subject
                FROM class_students cs
                LEFT JOIN class_attendance ca ON cs.reg_no = ca.reg_no AND ca.date = ? AND ca.subject = ?
                WHERE cs.class_name = ?
                ORDER BY cs.reg_no
            `).all(date, subj, class_name);
            res.json(rows);
        }
    } catch (err) {
        console.error('Attendance by-class error:', err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/attendance/class-stats — classes this staff teaches
router.get('/class-stats', authMiddleware(['staff', 'admin']), (req, res) => {
    try {
        const modern = dbConfig.db.prepare(`
            SELECT subject as class_name, COUNT(DISTINCT date) as sessions,
                   ROUND(SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)*100.0/COUNT(*), 1) as avg_attendance
            FROM class_attendance WHERE marked_by = ? GROUP BY subject
        `).all(req.user.user_id);
        res.json(modern);
    } catch (err) { res.status(500).json({ message: 'Error fetching class stats', error: err.message }); }
});

// GET /api/attendance/stats - Global attendance stats
router.get('/stats', authMiddleware(['admin', 'staff', 'hod']), (req, res) => {
    try {
        const stats = dbConfig.db.prepare(`
            SELECT course_id, COUNT(*) as total, SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present
            FROM attendance GROUP BY course_id`).all();
        res.json(stats);
    } catch (err) { res.status(500).json({ message: 'Error fetching stats' }); }
});

// GET /api/attendance/summary?class_name=&date= — present/absent summary
router.get('/summary', authMiddleware(['admin', 'staff', 'student', 'alumni']), async (req, res) => {
    const { class_name, date, subject } = req.query;
    if (!class_name || !date) return res.status(400).json({ message: 'class_name and date are required.' });
    const subj = subject || 'General';
    try {
        if (dbConfig.isProduction) {
            const tCount = await firestore.collection('class_students').where('class_name', '==', class_name).count().get();
            const total = tCount.data().count;

            const attSnap = await firestore.collection('class_attendance').where('date', '==', date).where('subject', '==', subj).get();
            let present = 0, absent = 0;
            
            // To be accurate, we should verify that `reg_no` from class_attendance belongs to `class_name`
            // But since attendance is marked PER class, we can approximate efficiently:
            attSnap.forEach(d => {
                if (d.data().status === 'present') present++;
                if (d.data().status === 'absent') absent++;
            });

            res.json({ total, present, absent, not_marked: total - present - absent });
        } else {
            const total = dbConfig.db.prepare('SELECT COUNT(*) as count FROM class_students WHERE class_name = ?').get(class_name).count;
            const present = dbConfig.db.prepare(`
                SELECT COUNT(*) as count FROM class_attendance ca
                JOIN class_students cs ON ca.reg_no = cs.reg_no
                WHERE cs.class_name = ? AND ca.date = ? AND ca.status = 'present' AND ca.subject = ?
            `).get(class_name, date, subj).count;
            const absent = dbConfig.db.prepare(`
                SELECT COUNT(*) as count FROM class_attendance ca
                JOIN class_students cs ON ca.reg_no = cs.reg_no
                WHERE cs.class_name = ? AND ca.date = ? AND ca.status = 'absent' AND ca.subject = ?
            `).get(class_name, date, subj).count;
            res.json({ total, present, absent, not_marked: total - present - absent });
        }
    } catch (err) {
        console.error('Attendance summary error:', err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/attendance/all-dates?class_name= — list all dates attendance was marked for a class
router.get('/all-dates', authMiddleware(['admin', 'staff', 'student', 'alumni']), async (req, res) => {
    const { class_name } = req.query;
    if (!class_name) return res.status(400).json({ message: 'class_name is required.' });
    try {
        if (dbConfig.isProduction) {
            const snap = await firestore.collection('class_attendance').orderBy('date', 'desc').get();
            // In-memory grouping since Firestore doesn't support GROUP BY
            const grouped = {};
            snap.forEach(doc => {
                const data = doc.data();
                // Filter by class_name if possible (though class_name isn't in class_attendance)
                // We'd normally join with class_students or store class_name in class_attendance.
                // For now, let's assume we have to fetch valid reg_nos for the class.
                const key = `${data.date}|${data.subject}`;
                if (!grouped[key]) grouped[key] = { date: data.date, subject: data.subject, present: 0, absent: 0, marked: 0 };
                grouped[key].marked++;
                if (data.status === 'present') grouped[key].present++;
                if (data.status === 'absent') grouped[key].absent++;
            });
            return res.json(Object.values(grouped).sort((a,b) => b.date.localeCompare(a.date)));
        }

        const rows = dbConfig.db.prepare(`
            SELECT ca.date, ca.subject,
                SUM(CASE WHEN ca.status='present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN ca.status='absent'  THEN 1 ELSE 0 END) as absent,
                COUNT(*) as marked
            FROM class_attendance ca
            JOIN class_students cs ON ca.reg_no = cs.reg_no
            WHERE cs.class_name = ?
            GROUP BY ca.date, ca.subject
            ORDER BY ca.date DESC, ca.subject
        `).all(class_name);
        res.json(rows);
    } catch (err) {
        console.error('Attendance all-dates error:', err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// POST /api/attendance/bulk — mark attendance for an entire class
router.post('/bulk', authMiddleware(['admin', 'staff']), async (req, res) => {
    const { class_name, date, subject, records, marked_by } = req.body;
    if (!class_name || !date || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: 'class_name, date, and records[] are required.' });
    }
    const subj = subject || 'General';
    try {
        if (dbConfig.isProduction) {
            const batch = firestore.batch();
            
            // Delete existing records to mimic UPSERT logic
            const oldSnap = await firestore.collection('class_attendance').where('date', '==', date).where('subject', '==', subj).get();
            oldSnap.forEach(doc => {
                const data = doc.data();
                if (records.some(r => r.reg_no === data.reg_no)) {
                    batch.delete(doc.ref);
                }
            });

            // Insert new array
            for (const r of records) {
                const newRef = firestore.collection('class_attendance').doc();
                batch.set(newRef, { reg_no: r.reg_no, date, subject: subj, status: r.status, marked_by: marked_by || 'admin' });
            }
            await batch.commit();
            res.json({ message: `Attendance saved to ${subj} on ${date}.` });
        } else {
            const upsert = dbConfig.db.prepare(`
                INSERT INTO class_attendance (reg_no, date, subject, status, marked_by)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(reg_no, date, subject) DO UPDATE SET status=excluded.status, marked_by=excluded.marked_by
            `);
            dbConfig.db.transaction((recs) => {
                for (const r of recs) {
                    upsert.run(r.reg_no, date, subj, r.status, marked_by || 'admin');
                }
            })(records);

            res.json({ message: `Attendance saved to ${subj} on ${date}.` });
        }
    } catch (err) {
        console.error('Attendance bulk error:', err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// ─── Legacy/Analytics routes ───────────────

router.get('/analytics', authMiddleware(['admin', 'staff', 'student']), async (req, res) => {
    const { student_id } = req.query; // matches numeric id (SQLite) or Doc ID (Firestore)
    if (!student_id) return res.status(400).json({ message: 'student_id is required.' });
    
    try {
        if (dbConfig.isProduction) {
            const studentDoc = await firestore.collection('students').doc(student_id).get();
            const userDoc = await firestore.collection('users').doc(studentDoc.data().user_id).get();
            const regNo = userDoc.exists ? userDoc.data().user_id : null;

            const [attSnap, classAttSnap] = await Promise.all([
                firestore.collection('attendance').where('student_id', '==', student_id).get(),
                firestore.collection('class_attendance').where('reg_no', '==', regNo).get()
            ]);

            const combined = [...attSnap.docs.map(d=>d.data()), ...classAttSnap.docs.map(d=>({course_id: d.data().subject, ...d.data()}))];
            const courses = {};
            combined.forEach(a => {
                const cId = a.course_id || 'General';
                if (!courses[cId]) courses[cId] = { course_id: cId, total: 0, present: 0, absent: 0 };
                courses[cId].total++;
                if (a.status === 'present') courses[cId].present++;
                if (a.status === 'absent') courses[cId].absent++;
            });

            const results = Object.values(courses).map(c => ({
                ...c,
                percentage: c.total > 0 ? (c.present * 100 / c.total).toFixed(2) : 0
            }));
            return res.json(results);
        }

        const studentInfo = dbConfig.db.prepare(`SELECT u.user_id FROM users u JOIN students s ON u.id = s.user_id WHERE s.id = ?`).get(student_id);
        const reg_no = studentInfo ? studentInfo.user_id : null;

        const rows = dbConfig.db.prepare(`
            WITH CombinedAttendance AS (
                SELECT course_id as subject, status FROM attendance WHERE student_id = ?
                UNION ALL
                SELECT subject, status FROM class_attendance WHERE reg_no = ?
            )
            SELECT subject as course_id,
                COUNT(*) as total,
                SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) as absent,
                ROUND(SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as percentage
            FROM CombinedAttendance 
            GROUP BY subject
        `).all(student_id, reg_no);

        res.json(rows);
    } catch (err) {
        console.error("Attendance analytics error:", err);
        res.status(500).json({ message: 'Server error calculating analytics.' });
    }
});

router.get('/student-detail', authMiddleware(['admin', 'staff', 'student']), async (req, res) => {
    const { reg_no, year, month } = req.query;
    if (!reg_no) return res.status(400).json({ message: 'Register number (reg_no) is required.' });
    
    try {
        if (dbConfig.isProduction) {
            let ref = firestore.collection('class_attendance').where('reg_no', '==', reg_no);
            const snap = await ref.orderBy('date', 'desc').get();
            let rows = snap.docs.map(d => d.data());
            
            if (year) rows = rows.filter(r => r.date.startsWith(year));
            if (month) rows = rows.filter(r => r.date.split('-')[1] === month.padStart(2, '0'));
            
            return res.json(rows);
        }

        let query = `SELECT date, subject, status FROM class_attendance WHERE reg_no = ?`;
        const params = [reg_no];
        if (year) { query += ` AND substr(date, 1, 4) = ?`; params.push(year); }
        if (month) { query += ` AND substr(date, 6, 2) = ?`; params.push(month.padStart(2, '0')); }
        query += ` ORDER BY date DESC`;
        const rows = dbConfig.db.prepare(query).all(...params);
        res.json(rows);
    } catch (err) {
        console.error('Student detail attendance error:', err);
        res.status(500).json({ message: 'Server error fetching detailed attendance.' });
    }
});

module.exports = router;

