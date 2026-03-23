const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');
const syncService = require('../cloud/syncService');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { user_id, password } = req.body;
    if (!user_id || !password) return res.status(400).json({ message: 'User ID and password are required.' });
    const cleanId = user_id.trim();
    try {
        if (!dbConfig.db) {
          return res.status(500).json({ message: 'Database not initialized.' });
        }
        
        const user = dbConfig.db.prepare('SELECT * FROM users WHERE LOWER(user_id) = LOWER(?)').get(cleanId);
        if (!user || !user.password_hash) return res.status(401).json({ message: 'Invalid credentials.' });

        const isMatch = bcrypt.compareSync(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });
        
        const token = jwt.sign({ id: user.id, user_id: user.user_id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, user: { id: user.id, user_id: user.user_id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {

        console.error('Login error full details:', err);
        // Temporarily send error details back for diagnosis
        res.status(500).json({ 
          message: 'Server error.', 
          error: err.message,
          stack: process.env.NODE_ENV === 'production' ? null : err.stack 
        });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { user_id, name, email, password, role } = req.body;
    if (!user_id || !name || !email || !password || !role) return res.status(400).json({ message: 'All fields required.' });
    const allowedRoles = ['student', 'staff', 'admin', 'alumni'];
    if (!allowedRoles.includes(role)) return res.status(400).json({ message: 'Invalid role.' });
    try {
        const hash = bcrypt.hashSync(password, 12);
        
        if (dbConfig.isProduction) {
            const existing = await firestore.collection('users').where('user_id', '==', String(user_id)).get();
            if (!existing.empty) return res.status(409).json({ message: 'User ID already exists.' });
            await firestore.collection('users').add({ user_id, name, email, password_hash: hash, role });
        } else {
            dbConfig.db.prepare('INSERT INTO users (user_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(user_id, name, email, hash, role);
        }
        res.status(201).json({ message: 'Registered successfully.' });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) return res.status(409).json({ message: 'User ID or email already exists.' });
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/auth/profile — update self info
router.put('/profile', authMiddleware(), async (req, res) => {
    const { name, phone, address, qualification, experience_years, specialization } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required.' });
    const trimmedName = name.trim();

    try {
        if (dbConfig.isProduction) {
            if (req.user.role === 'alumni') {
                const snapshot = await firestore.collection('users').where('role', '==', 'alumni').where('name', '==', trimmedName).get();
                const dupCount = snapshot.docs.filter(d => d.id !== req.user.id);
                if (dupCount.length > 0) return res.status(409).json({ message: 'Alumni name already exists' });
            }
            await firestore.collection('users').doc(req.user.id).update({ name: trimmedName });

            if (req.user.role === 'staff' || req.user.role === 'admin') {
                const staffDetails = { user_id: req.user.id, phone: phone || '', address: address || '', qualification: qualification || '', experience_years: experience_years || 0, specialization: specialization || '' };
                const sRef = firestore.collection('staff_details').where('user_id', '==', req.user.id);
                const sDoc = await sRef.get();
                if (sDoc.empty) {
                    await firestore.collection('staff_details').add(staffDetails);
                } else {
                    await firestore.collection('staff_details').doc(sDoc.docs[0].id).update(staffDetails);
                }
            }
        } else {
            if (req.user.role === 'alumni') {
                const duplicate = dbConfig.db.prepare('SELECT id FROM users WHERE LOWER(name) = LOWER(?) AND id != ? AND role = "alumni"').get(trimmedName, req.user.id);
                if (duplicate) return res.status(409).json({ message: 'Alumni name already exists' });
            }
            dbConfig.db.prepare('UPDATE users SET name = ? WHERE id = ?').run(trimmedName, req.user.id);
            syncService.syncRecord('users', { id: req.user.id, name: trimmedName }, 'id');

            if (req.user.role === 'staff' || req.user.role === 'admin') {
                const staffDetails = { user_id: req.user.id, phone: phone || '', address: address || '', qualification: qualification || '', experience_years: experience_years || 0, specialization: specialization || '' };
                dbConfig.db.prepare(`
                    INSERT INTO staff_details (user_id, phone, address, qualification, experience_years, specialization)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(user_id) DO UPDATE SET
                        phone=excluded.phone, address=excluded.address, qualification=excluded.qualification, experience_years=excluded.experience_years, specialization=excluded.specialization
                `).run(staffDetails.user_id, staffDetails.phone, staffDetails.address, staffDetails.qualification, staffDetails.experience_years, staffDetails.specialization);
                syncService.syncRecord('staff_details', staffDetails, 'user_id');
            }
        }
        res.json({ message: 'Profile updated successfully', name: trimmedName });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;
