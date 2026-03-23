const express = require('express');
const router = express.Router();
const dbConfig = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const syncService = require('../cloud/syncService');
const { db: firestore } = require('../config/firebaseNode');

router.get('/', async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snapshot = await firestore.collection('notices').orderBy('created_at', 'desc').get();
            const notices = [];
            snapshot.forEach(doc => { notices.push({ id: doc.id, ...doc.data() }); });
            res.json(notices);
        } else {
            const rows = dbConfig.db.prepare('SELECT n.*, u.name as posted_by_name FROM notices n JOIN users u ON n.posted_by = u.id ORDER BY n.created_at DESC').all();
            res.json(rows);
        }
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.post('/', authMiddleware(['admin', 'staff']), async (req, res) => {
    const { title, content, category } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content required.' });
    try {
        if (dbConfig.isProduction) {
            await firestore.collection('notices').add({ 
                title, 
                content, 
                category: category || 'general', 
                posted_by: req.user.id,
                posted_by_name: req.user.name || 'Admin', // Denormalized for Firebase NoSQL
                created_at: new Date().toISOString()
            });
        } else {
            const stmt = dbConfig.db.prepare('INSERT INTO notices (title, content, category, posted_by) VALUES (?, ?, ?, ?)');
            const result = stmt.run(title, content, category || 'general', req.user.id);
            syncService.syncRecord('notices', { id: result.lastInsertRowid, title, content, category: category || 'general', posted_by: req.user.id });
        }
        res.status(201).json({ message: 'Notice posted.' });
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/:id', authMiddleware(['admin', 'staff']), async (req, res) => {
    const noticeId = req.params.id;
    try { 
        if (dbConfig.isProduction) {
            await firestore.collection('notices').doc(noticeId).delete();
        } else {
            const numericId = parseInt(noticeId, 10);
            if (isNaN(numericId)) return res.status(400).json({ message: 'Invalid notice ID format.' });
            
            const stmt = dbConfig.db.prepare('DELETE FROM notices WHERE id = ?');
            const result = stmt.run(numericId);
            
            if (result.changes === 0) {
                return res.status(404).json({ message: 'Notice not found or already deleted.' });
            }
            // Optional: call sync service if needed for deletion tracking
            syncService.syncDelete('notices', 'id', numericId); 
        }
        res.json({ message: 'Notice deleted successfully.' }); 
    } catch (err) { 
        console.error('CRITICAL NOTICE DELETE ERROR:', err);
        res.status(500).json({ message: 'Failed to delete notice: ' + err.message }); 
    }
});

module.exports = router;
