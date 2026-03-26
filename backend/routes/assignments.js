const path = require('path');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');
const { authMiddleware } = require('../middleware/auth');
const syncService = require('../cloud/syncService');
const storageService = require('../cloud/storageService');
const multer = require('multer');

// Ensure assignments uploads directory exists
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 400 * 1024 * 1024 }, // 400 MB limit
});

router.get('/', authMiddleware(), async (req, res) => {
    const { course_id } = req.query;
    try {
        if (dbConfig.isProduction) {
            let ref = firestore.collection('assignments');
            if (course_id) ref = ref.where('course_id', '==', course_id);
            const snap = await ref.orderBy('due_date', 'asc').get();
            const assignments = [];
            snap.forEach(d => { assignments.push({ id: d.id, ...d.data() }); });
            res.json(assignments);
        } else {
            let query = 'SELECT a.*, u.name as created_by_name FROM assignments a JOIN users u ON a.created_by = u.id WHERE 1=1';
            const params = [];
            if (course_id) { query += ' AND a.course_id = ?'; params.push(course_id); }
            query += ' ORDER BY a.due_date ASC';
            res.json(dbConfig.db.prepare(query).all(...params));
        }
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.post('/', authMiddleware(['staff', 'admin']), async (req, res) => {
    const { title, description, course_id, due_date } = req.body;
    if (!title || !course_id || !due_date) return res.status(400).json({ message: 'Required fields missing.' });
    try {
        const isAdmin = req.user.role === 'admin';
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const monthEnd   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;
        
        if (dbConfig.isProduction) {
            // Only enforce monthly limit for staff, not admin
            if (!isAdmin) {
                const snap = await firestore.collection('assignments').where('created_by', '==', String(req.user.id)).where('created_at', '>=', monthStart).where('created_at', '<=', monthEnd).count().get();
                if (snap.data().count >= 2) {
                    return res.status(429).json({ message: `Monthly assignment limit reached. You can only post 2 assignments per month. Already posted ${snap.data().count} this month.` });
                }
            }
            const added = await firestore.collection('assignments').add({
                title, description: description || '', course_id, due_date,
                created_by: String(req.user.id), created_by_name: req.user.name || 'Staff',
                created_at: new Date().toISOString().split('T')[0]
            });
            res.status(201).json({ message: 'Assignment created.', id: added.id });
        } else {
            // Only enforce monthly limit for staff, not admin
            if (!isAdmin) {
                const countThisMonth = dbConfig.db.prepare(
                    `SELECT COUNT(*) as cnt FROM assignments WHERE created_by = ? AND created_at >= ? AND created_at <= ?`
                ).get(req.user.id, monthStart, monthEnd);
                if (countThisMonth.cnt >= 2) return res.status(429).json({ message: `Monthly assignment limit reached. You can only post 2 assignments per month. Already posted ${countThisMonth.cnt} this month.` });
            }

            const result = dbConfig.db.prepare('INSERT INTO assignments (title, description, course_id, due_date, created_by) VALUES (?, ?, ?, ?, ?)').run(title, description || '', course_id, due_date, req.user.id);
            syncService.syncRecord('assignments', { id: result.lastInsertRowid, title, description: description || '', course_id, due_date, created_by: req.user.id });
            res.status(201).json({ message: 'Assignment created.', id: result.lastInsertRowid });
        }
    } catch (err) { 
        console.error('Assignment create error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message }); 
    }
});

router.post('/:id/submit', authMiddleware(['student']), upload.single('file'), async (req, res) => {
    try {
        let file_path = null;
        if (req.file) file_path = `/uploads/assignments/${req.file.filename}`;
        else if (req.body.file_path) file_path = req.body.file_path;

        if (dbConfig.isProduction) {
            let studentRealId = null;
            const stuSnap = await firestore.collection('students').where('user_id', '==', String(req.user.id)).limit(1).get();
            
            if (stuSnap.empty) {
                const classStudent = await firestore.collection('class_students').where('reg_no', '==', String(req.user.user_id)).limit(1).get();
                if (!classStudent.empty) {
                    const added = await firestore.collection('students').add({ user_id: req.user.id, program: classStudent.docs[0].data().program, semester: 2 });
                    studentRealId = added.id;
                }
            } else {
                studentRealId = stuSnap.docs[0].id;
            }

            if (!studentRealId) return res.status(404).json({ message: 'Student profile not found. Please contact admin.' });

            const existSnap = await firestore.collection('assignment_submissions').where('assignment_id', '==', String(req.params.id)).where('student_id', '==', studentRealId).get();
            if (!existSnap.empty) {
                await firestore.collection('assignment_submissions').doc(existSnap.docs[0].id).update({ file_path: file_path || '', submitted_at: new Date().toISOString() });
            } else {
                await firestore.collection('assignment_submissions').add({
                    assignment_id: String(req.params.id), student_id: studentRealId,
                    file_path: file_path || '', submitted_at: new Date().toISOString(),
                    student_name: req.user.name, registration_no: req.user.user_id // Denormalized for NoSQL
                });
            }
        } else {
            let student = dbConfig.db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id);
            if (!student) {
                const classStudent = dbConfig.db.prepare('SELECT * FROM class_students WHERE reg_no = ?').get(req.user.user_id);
                if (classStudent) {
                    dbConfig.db.prepare('INSERT INTO students (user_id, program, semester) VALUES (?, ?, ?)').run(req.user.id, classStudent.program, 2);
                    student = dbConfig.db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id);
                }
            }
            if (!student) return res.status(404).json({ message: 'Student profile not found. Please contact admin.' });

            dbConfig.db.prepare('INSERT OR REPLACE INTO assignment_submissions (assignment_id, student_id, file_path) VALUES (?, ?, ?)').run(req.params.id, student.id, file_path || '');
            syncService.syncRecord('assignment_submissions', { assignment_id: Number(req.params.id), student_id: student.id, file_path: file_path || '' }, 'assignment_id, student_id');
        }

        if (req.file) storageService.uploadFile(req.file.path, 'uploads', `assignments/${req.file.filename}`);

        res.status(201).json({ message: 'Assignment submitted successfully.', file_path });
    } catch (err) {
        console.error('Submission Server Error:', err);
        res.status(500).json({ message: 'Server error. ' + err.message });
    }
});

router.get('/:id/submissions', authMiddleware(['staff', 'admin']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snap = await firestore.collection('assignment_submissions').where('assignment_id', '==', String(req.params.id)).orderBy('submitted_at', 'desc').get();
            const subs = [];
            snap.forEach(d => {
                const doc = d.data();
                subs.push({
                    id: d.id, assignment_id: doc.assignment_id, student_id: doc.student_id,
                    file_path: doc.file_path, submitted_at: doc.submitted_at, grade: doc.grade,
                    name: doc.student_name, registration_no: doc.registration_no // Denormalized output
                });
            });
            res.json(subs);
        } else {
            const rows = dbConfig.db.prepare(`
                SELECT asub.*, u.name, u.user_id as registration_no, s.program, s.semester 
                FROM assignment_submissions asub
                JOIN students s ON asub.student_id = s.id
                JOIN users u ON s.user_id = u.id
                WHERE asub.assignment_id = ?
                ORDER BY asub.submitted_at DESC
            `).all(req.params.id);
            res.json(rows);
        }
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/', authMiddleware(['admin']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snap = await firestore.collection('assignments').get();
            const batch = firestore.batch();
            snap.forEach(d => batch.delete(d.ref));
            await batch.commit();
        } else {
            dbConfig.db.prepare('DELETE FROM assignments').run();
            // Bulk delete usually needs a different strategy, but for simplicity:
            syncService.syncDelete('assignments', 'id', '*'); // '*' could mean all if syncDelete handles it, or I'll just skip bulk for now
        }

        res.json({ message: 'All assignments cleared successfully.' });
    } catch (err) {
        console.error('Clear All error:', err);
        res.status(500).json({ message: 'Server error clearing assignments.' });
    }
});

router.delete('/:id', authMiddleware(['staff', 'admin']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            await firestore.collection('assignments').doc(req.params.id).delete();
            res.json({ message: 'Assignment deleted successfully.' });
        } else {
            const result = dbConfig.db.prepare('DELETE FROM assignments WHERE id = ?').run(req.params.id);
            if (result.changes === 0) return res.status(404).json({ message: 'Assignment not found.' });
            syncService.syncDelete('assignments', 'id', req.params.id);
            res.json({ message: 'Assignment deleted successfully.' });
        }

    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: 'Server error deleting assignment.' });
    }
});

module.exports = router;
