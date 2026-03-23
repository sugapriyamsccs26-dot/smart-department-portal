const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');

// GET /api/notifications - Get current user notifications
router.get('/', authMiddleware(), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snap = await firestore.collection('notifications')
                .where('user_id', '==', String(req.user.id))
                .orderBy('created_at', 'desc').limit(20).get();
            const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return res.json(results);
        }

        const rows = dbConfig.db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.user.id);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching notifications.' });
    }
});

// PATCH /api/notifications/:id/read - Mark as read
router.patch('/:id/read', authMiddleware(), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            await firestore.collection('notifications').doc(req.params.id).update({ is_read: true });
        } else {
            dbConfig.db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
        }
        res.json({ message: 'Marked as read.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error marking notification as read.' });
    }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authMiddleware(), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            await firestore.collection('notifications').doc(req.params.id).delete();
        } else {
            dbConfig.db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
        }
        res.json({ message: 'Deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error deleting notification.' });
    }
});

module.exports = router;

