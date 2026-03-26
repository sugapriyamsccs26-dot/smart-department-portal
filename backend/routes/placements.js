const express = require('express');
const router = express.Router();
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');
const { authMiddleware } = require('../middleware/auth');
const syncService = require('../cloud/syncService');


router.get('/', async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snap = await firestore.collection('placements').orderBy('posted_at', 'desc').get();
            const results = [];
            snap.forEach(d => results.push({ id: d.id, ...d.data() }));
            res.json(results);
        } else {
            res.json(dbConfig.db.prepare('SELECT * FROM placements ORDER BY posted_at DESC').all());
        }
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.post('/', authMiddleware(['admin']), async (req, res) => {
    const { company_name, role, package: pkg, type, location, apply_link, deadline } = req.body;
    if (!company_name || !role || !type) return res.status(400).json({ message: 'Required fields missing.' });
    try {
        if (dbConfig.isProduction) {
            await firestore.collection('placements').add({
                company_name, role, package: pkg || '', type, location: location || '', apply_link: apply_link || '',
                deadline: deadline || null, posted_at: new Date().toISOString()
            });
            res.status(201).json({ message: 'Placement posted.' });
        } else {
            const result = dbConfig.db.prepare('INSERT INTO placements (company_name, role, package, type, location, apply_link, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)').run(company_name, role, pkg || '', type, location || '', apply_link || '', deadline || null);
            syncService.syncRecord('placements', { id: result.lastInsertRowid, company_name, role, package: pkg || '', type, location: location || '', apply_link: apply_link || '', deadline: deadline || null, posted_at: new Date().toISOString() });
            res.status(201).json({ message: 'Placement posted.' });
        }

    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            await firestore.collection('placements').doc(req.params.id).delete();
            res.json({ message: 'Deleted.' });
        } else {
            dbConfig.db.prepare('DELETE FROM placements WHERE id = ?').run(req.params.id);
            syncService.syncDelete('placements', 'id', req.params.id);
            res.json({ message: 'Deleted.' });
        }

    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;
