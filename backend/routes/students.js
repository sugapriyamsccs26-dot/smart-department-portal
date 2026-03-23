const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');

// GET /api/students/classes — list all distinct classes
router.get('/classes', authMiddleware(['admin', 'staff', 'student', 'alumni']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snap = await firestore.collection('class_students').get();
            const classes = {};
            snap.forEach(d => {
                const data = d.data();
                const key = `${data.class_name}|${data.program}`;
                if (!classes[key]) {
                    classes[key] = { class_name: data.class_name, program: data.program, student_count: 0 };
                }
                classes[key].student_count++;
            });
            return res.json(Object.values(classes).sort((a,b) => a.program.localeCompare(b.program)));
        }

        const rows = dbConfig.db.prepare(`
            SELECT DISTINCT class_name, program,
                COUNT(*) as student_count
            FROM class_students
            GROUP BY class_name, program
            ORDER BY program, class_name
        `).all();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/students/by-class — fetch students for a class
router.get('/by-class', authMiddleware(['admin', 'staff', 'student', 'alumni']), async (req, res) => {
    const { class_name, program } = req.query;
    try {
        if (dbConfig.isProduction) {
            let ref = firestore.collection('class_students');
            if (class_name) ref = ref.where('class_name', '==', class_name);
            if (program) ref = ref.where('program', '==', program);
            const snap = await ref.orderBy('reg_no').get();
            const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return res.json(rows);
        }

        let query = 'SELECT * FROM class_students WHERE 1=1';
        const params = [];
        if (class_name) { query += ' AND class_name = ?'; params.push(class_name); }
        if (program)    { query += ' AND program = ?'; params.push(program); }
        query += ' ORDER BY reg_no';
        const rows = dbConfig.db.prepare(query).all(...params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/students — full login-based student list
router.get('/', authMiddleware(['admin', 'staff', 'student', 'alumni']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const usersSnap = await firestore.collection('users').where('role', '==', 'student').get();
            const studentsSnap = await firestore.collection('students').get();
            
            const studentsMap = {};
            studentsSnap.forEach(d => studentsMap[d.data().user_id] = d.data());
            
            const rows = usersSnap.docs.map(u => {
                const s = studentsMap[u.id] || {};
                return {
                    id: u.id, user_id: u.data().user_id, name: u.data().name, email: u.data().email,
                    program: s.program || '', semester: s.semester || '', batch_year: s.batch_year || ''
                };
            });
            return res.json(rows);
        }

        const rows = dbConfig.db.prepare(`
            SELECT u.id, u.user_id, u.name, u.email, s.program, s.semester, s.batch_year
            FROM users u JOIN students s ON u.id = s.user_id
            ORDER BY s.program, s.semester, u.name
        `).all();
        res.json(rows);
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

// GET /api/students/:id — single student profile
router.get('/:id', authMiddleware(['admin', 'staff', 'student']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const uDoc = await firestore.collection('users').doc(req.params.id).get();
            if (!uDoc.exists) return res.status(404).json({ message: 'Student not found.' });
            
            const sSnap = await firestore.collection('students').where('user_id', '==', req.params.id).limit(1).get();
            const sData = sSnap.empty ? {} : sSnap.docs[0].data();
            
            return res.json({
                id: uDoc.id, ...uDoc.data(), ...sData
            });
        }

        const row = dbConfig.db.prepare(`
            SELECT u.id, u.user_id, u.name, u.email, u.profile_picture, s.program, s.semester, s.batch_year
            FROM users u JOIN students s ON u.id = s.user_id WHERE u.id = ?
        `).get(req.params.id);
        if (!row) return res.status(404).json({ message: 'Student not found.' });
        res.json(row);
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;

