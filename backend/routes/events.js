const express = require('express');
const router = express.Router();
const dbConfig = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const syncService = require('../cloud/syncService');
const { db: firestore } = require('../config/firebaseNode');

router.get('/', authMiddleware(), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snapshot = await firestore.collection('events').orderBy('event_date', 'desc').get();
            const events = [];
            snapshot.forEach(doc => { events.push({ id: doc.id, ...doc.data() }); });
            res.json(events);
        } else {
            res.json(dbConfig.db.prepare('SELECT * FROM events ORDER BY event_date DESC').all());
        }
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.get('/my-registrations', authMiddleware(), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snapshot = await firestore.collection('event_registrations').where('user_id', '==', String(req.user.id)).get();
            const evIds = [];
            snapshot.forEach(d => evIds.push(d.data().event_id));
            res.json(evIds);
        } else {
            const rows = dbConfig.db.prepare('SELECT event_id FROM event_registrations WHERE user_id = ?').all(req.user.id);
            res.json(rows.map(r => r.event_id));
        }
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.post('/:id/register', authMiddleware(['student', 'alumni']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const existing = await firestore.collection('event_registrations').where('event_id', '==', String(req.params.id)).where('user_id', '==', String(req.user.id)).get();
            if (!existing.empty) return res.status(400).json({ message: 'Already registered.' });
            await firestore.collection('event_registrations').add({ event_id: req.params.id, user_id: req.user.id, registered_at: new Date().toISOString() });
        } else {
            dbConfig.db.prepare('INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)').run(req.params.id, req.user.id);
        }
        res.status(201).json({ message: 'Successfully registered.' });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) return res.status(400).json({ message: 'Already registered.' });
        res.status(500).json({ message: 'Server error.' });
    }
});

router.get('/:id/registrations', authMiddleware(['admin', 'staff']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snapshot = await firestore.collection('event_registrations').where('event_id', '==', String(req.params.id)).get();
            const formatted = [];
            snapshot.forEach(doc => formatted.push({ id: doc.id, ...doc.data() }));
            res.json(formatted); // Simplified structure for NoSQL document storage format
        } else {
            const rows = dbConfig.db.prepare(`
                SELECT er.*, u.name, u.email, s.program, s.semester 
                FROM event_registrations er
                JOIN users u ON er.user_id = u.id
                LEFT JOIN students s ON u.id = s.user_id
                WHERE er.event_id = ?
                ORDER BY er.registered_at DESC
            `).all(req.params.id);
            res.json(rows);
        }
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.post('/', authMiddleware(['admin', 'staff']), async (req, res) => {
    const { title, description, event_date, venue, type } = req.body;
    if (!title || !event_date) return res.status(400).json({ message: 'Title and event_date required.' });
    try {
        if (dbConfig.isProduction) {
            await firestore.collection('events').add({ title, description: description || '', event_date, venue: venue || '', type: type || 'other' });
        } else {
            const stmt = dbConfig.db.prepare('INSERT INTO events (title, description, event_date, venue, type) VALUES (?, ?, ?, ?, ?)');
            const result = stmt.run(title, description || '', event_date, venue || '', type || 'other');
            syncService.syncRecord('events', { id: result.lastInsertRowid, title, description: description || '', event_date, venue: venue || '', type: type || 'other' });
        }
        res.status(201).json({ message: 'Event created.' });
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
    try { 
        if (dbConfig.isProduction) {
            await firestore.collection('events').doc(req.params.id).delete();
        } else {
            dbConfig.db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id); 
        }
        res.json({ message: 'Deleted.' }); 
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;
