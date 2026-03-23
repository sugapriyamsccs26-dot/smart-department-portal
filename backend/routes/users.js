const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');

const uploadDir = path.join(__dirname, '../uploads/staff_docs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});
const upload = multer({ storage });

// GET /api/users — list all users
router.get('/', authMiddleware(['admin', 'staff', 'student', 'alumni']), async (req, res) => {
    const { role: targetRole } = req.query;
    try {
        if (dbConfig.isProduction) {
            let usersRef = firestore.collection('users');
            if (targetRole && targetRole !== 'all') {
                usersRef = usersRef.where('role', '==', targetRole);
            }
            const snap = await usersRef.orderBy('created_at', 'desc').get();
            const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            // For the user directory, we need to merge with student/staff/alumni data
            // We'll fetch relevant collections and merge in memory for the list view
            const [studentsSnap, staffSnap, alumniSnap] = await Promise.all([
                firestore.collection('students').get(),
                firestore.collection('staff').get(),
                firestore.collection('alumni').get()
            ]);

            const students = {}; studentsSnap.forEach(d => students[d.data().user_id] = d.data());
            const staff = {}; staffSnap.forEach(d => staff[d.data().user_id] = d.data());
            const alumniArr = {}; alumniSnap.forEach(d => alumniArr[d.data().user_id] = d.data());

            const results = users.map(u => {
                const s = students[u.id] || {};
                const st = staff[u.id] || {};
                const al = alumniArr[u.id] || {};
                return {
                    ...u,
                    program: s.program || '',
                    semester: s.semester || '',
                    batch_year: s.batch_year || '',
                    designation: st.designation || '',
                    alumni_batch: al.batch_year || '',
                    alumni_program: al.program || '',
                    current_company: al.current_company || '',
                    current_role: al.current_role || ''
                };
            });
            return res.json(results);
        }

        let query = `
            SELECT
                u.id, u.user_id, u.name, u.email, u.role, u.created_at,
                s.program, s.semester, s.batch_year,
                st.designation,
                al.batch_year as alumni_batch, al.program as alumni_program, al.current_company, al.current_role
            FROM users u
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN staff st ON u.id = st.user_id
            LEFT JOIN alumni al ON u.id = al.user_id
        `;
        const params = [];

        if (targetRole && targetRole !== 'all') {
            query += " WHERE u.role = ?";
            params.push(targetRole);
        }

        query += " ORDER BY u.created_at DESC";

        const rows = dbConfig.db.prepare(query).all(...params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/users — create a new user (admin only)
router.post('/', authMiddleware(['admin']), async (req, res) => {
    const { user_id, name, email, password, role, program, semester, batch_year, designation } = req.body;
    if (!user_id || !name || !email || !password || !role) return res.status(400).json({ message: 'All fields required.' });
    const allowed = ['student', 'staff', 'admin', 'alumni'];
    if (!allowed.includes(role)) return res.status(400).json({ message: 'Invalid role.' });

    try {
        const hash = bcrypt.hashSync(password, 12);
        
        if (dbConfig.isProduction) {
            const existing = await firestore.collection('users').where('user_id', '==', String(user_id)).get();
            if (!existing.empty) return res.status(409).json({ message: 'User ID already exists.' });

            const userRef = await firestore.collection('users').add({
                user_id, name, email, password_hash: hash, role, created_at: new Date().toISOString()
            });
            const uid = userRef.id;

            if (role === 'student') {
                await firestore.collection('students').add({
                    user_id: uid, program: program || 'MCA', semester: Number(semester) || 1, batch_year: batch_year || ''
                });
            } else if (role === 'staff') {
                await firestore.collection('staff').add({
                    user_id: uid, designation: designation || 'Lecturer', department: 'Computer Application and Engineering'
                });
            }
            return res.status(201).json({ message: 'User created successfully.', id: uid });
        }

        const uid = dbConfig.db.prepare('INSERT INTO users (user_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(user_id, name, email, hash, role).lastInsertRowid;

        if (role === 'student' && program) {
            dbConfig.db.prepare('INSERT INTO students (user_id, program, semester, batch_year) VALUES (?, ?, ?, ?)').run(uid, program, semester || 1, batch_year || '');
        }
        if (role === 'staff') {
            dbConfig.db.prepare('INSERT INTO staff (user_id, designation) VALUES (?, ?)').run(uid, designation || 'Lecturer');
        }

        res.status(201).json({ message: 'User created successfully.', id: uid });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) return res.status(409).json({ message: 'User ID or email already exists.' });
        res.status(500).json({ message: 'Server error.' });
    }
});

// PATCH /api/users/:id/password
router.patch('/:id/password', authMiddleware(['admin']), async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    try {
        const hash = bcrypt.hashSync(password, 12);
        if (dbConfig.isProduction) {
            await firestore.collection('users').doc(req.params.id).update({ password_hash: hash });
        } else {
            dbConfig.db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.params.id);
        }
        res.json({ message: 'Password updated.' });
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

// PATCH /api/users/:id — update user info
router.patch('/:id', authMiddleware(['admin']), async (req, res) => {
    const { name, email } = req.body;
    try {
        if (dbConfig.isProduction) {
            await firestore.collection('users').doc(req.params.id).update({ name, email });
        } else {
            dbConfig.db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, req.params.id);
        }
        res.json({ message: 'User updated.' });
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

// DELETE /api/users/:id
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
    if (String(req.params.id) === String(req.user.id)) return res.status(400).json({ message: 'Cannot delete your own account.' });
    try {
        if (dbConfig.isProduction) {
            await firestore.collection('users').doc(req.params.id).delete();
            // Optional: delete related entries in students/staff/alumni
        } else {
            dbConfig.db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
        }
        res.json({ message: 'User deleted.' });
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

// GET /api/users/:id/profile — detailed profile info
router.get('/:id/profile', authMiddleware(), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const uDoc = await firestore.collection('users').doc(req.params.id).get();
            if (!uDoc.exists) return res.status(404).json({ message: 'User not found.' });
            const user = { id: uDoc.id, ...uDoc.data() };

            const [sSnap, stSnap, alSnap, sdSnap, docSnap] = await Promise.all([
                firestore.collection('students').where('user_id', '==', user.id).limit(1).get(),
                firestore.collection('staff').where('user_id', '==', user.id).limit(1).get(),
                firestore.collection('alumni').where('user_id', '==', user.id).limit(1).get(),
                firestore.collection('staff_details').where('user_id', '==', user.id).limit(1).get(),
                firestore.collection('staff_documents').where('user_id', '==', user.id).get()
            ]);

            const profile = {
                ...user,
                ...(sSnap.empty ? {} : sSnap.docs[0].data()),
                ...(stSnap.empty ? {} : stSnap.docs[0].data()),
                ...(alSnap.empty ? {} : alSnap.docs[0].data()),
                ...(sdSnap.empty ? {} : sdSnap.docs[0].data()),
            };
            const documents = docSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            return res.json({ profile, documents });
        }

        const user = dbConfig.db.prepare(`
            SELECT u.id, u.user_id, u.name, u.email, u.role, u.created_at, u.profile_picture,
                   s.program, s.semester, s.batch_year, s.id as student_db_id,
                   st.department, st.designation, st.joining_date,
                   al.batch_year as alumni_batch, al.program as alumni_program, al.current_company, al.current_role, al.linkedin, al.available_for_mentorship,
                   sd.phone, sd.address, sd.qualification, sd.experience_years, sd.specialization
            FROM users u
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN staff st ON u.id = st.user_id
            LEFT JOIN alumni al ON u.id = al.user_id
            LEFT JOIN staff_details sd ON u.id = sd.user_id
            WHERE u.id = ?
        `).get(req.params.id);
        
        if (!user) return res.status(404).json({ message: 'User not found.' });

        let documents = [];
        if (user.role === 'staff' || user.role === 'admin') {
            documents = dbConfig.db.prepare('SELECT id, doc_name, file_path, uploaded_at FROM staff_documents WHERE user_id = ?').all(user.id);
        }

        res.json({ profile: user, documents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/users/:id/documents — upload document
router.post('/:id/documents', authMiddleware(), upload.single('document'), async (req, res) => {
    const { doc_name } = req.body;
    const { id } = req.params;
    if (!req.file || !doc_name) return res.status(400).json({ message: 'Document name and file are required.' });

    try {
        if (dbConfig.isProduction) {
            await firestore.collection('staff_documents').add({
                user_id: id, doc_name, file_path: `/api/users/docs/${req.file.filename}`, uploaded_at: new Date().toISOString()
            });
        } else {
            dbConfig.db.prepare('INSERT INTO staff_documents (user_id, doc_name, file_path) VALUES (?, ?, ?)')
              .run(id, doc_name, `/api/users/docs/${req.file.filename}`);
        }
        res.status(201).json({ message: 'Document uploaded successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/users/docs/:filename — serve documents
router.get('/docs/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads/staff_docs', req.params.filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ message: 'File not found.' });
    }
});

module.exports = router;

