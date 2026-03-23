const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');

router.post('/', authMiddleware(), async (req, res) => {
    const { type, subject_id, rating, comments } = req.body;
    if (!type || !rating) return res.status(400).json({ message: 'type and rating required.' });
    try {
        if (dbConfig.isProduction) {
            await firestore.collection('feedback').add({
                user_id: String(req.user.id), type, subject_id: subject_id || null, rating: Number(rating), comments: comments || '', submitted_at: new Date().toISOString()
            });
        } else {
            dbConfig.db.prepare('INSERT INTO feedback (user_id, type, subject_id, rating, comments) VALUES (?, ?, ?, ?, ?)').run(req.user.id, type, subject_id || null, rating, comments || '');
        }
        res.status(201).json({ message: 'Feedback submitted. Thank you!' });
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.get('/', authMiddleware(['admin']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snap = await firestore.collection('feedback').orderBy('submitted_at', 'desc').get();
            const usersSnap = await firestore.collection('users').get();
            const users = {}; usersSnap.forEach(d => users[d.id] = d.data().name);
            
            const results = snap.docs.map(d => ({
                id: d.id, ...d.data(), from_user: users[d.data().user_id] || 'Unknown'
            }));
            return res.json(results);
        }
        const rows = dbConfig.db.prepare('SELECT f.*, u.name as from_user FROM feedback f JOIN users u ON f.user_id = u.id ORDER BY f.submitted_at DESC').all();
        res.json(rows);
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            await firestore.collection('feedback').doc(req.params.id).delete();
        } else {
            dbConfig.db.prepare('DELETE FROM feedback WHERE id = ?').run(req.params.id);
        }
        res.json({ message: 'Feedback deleted.' });
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;

