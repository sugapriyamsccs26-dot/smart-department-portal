const express = require('express');
const router = express.Router();
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');
const { authMiddleware } = require('../middleware/auth');

// ── Startup: clean up duplicate alumni rows (caused by old INSERT OR REPLACE bug) ──
if (!dbConfig.isProduction) {
    try {
        const dupes = dbConfig.db.prepare(`SELECT user_id FROM alumni GROUP BY user_id HAVING COUNT(*) > 1`).all();
        if (dupes.length > 0) {
            console.warn(`[alumni] Cleaning up ${dupes.length} duplicate alumni entries...`);
            dbConfig.db.transaction(() => {
                for (const { user_id } of dupes) {
                    dbConfig.db.prepare(`
                        DELETE FROM alumni
                        WHERE user_id = ? AND rowid NOT IN (
                            SELECT rowid FROM alumni WHERE user_id = ? ORDER BY rowid DESC LIMIT 1
                        )
                    `).run(user_id, user_id);
                }
            })();
            console.warn('[alumni] Duplicate cleanup complete.');
        }
    } catch (err) {
        console.error('[alumni] Startup cleanup error:', err.message);
    }
}

// GET /api/alumni — list all alumni profiles
router.get('/', async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snap = await firestore.collection('alumni').orderBy('batch_year', 'desc').get();
            const results = [];
            snap.forEach(d => results.push({ id: d.id, ...d.data() }));
            res.json(results);
        } else {
            const rows = dbConfig.db.prepare('SELECT a.*, u.name, u.email FROM alumni a JOIN users u ON a.user_id = u.id ORDER BY a.batch_year DESC').all();
            res.json(rows);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/alumni — create or update own alumni profile
router.post('/', authMiddleware(['alumni', 'admin']), async (req, res) => {
    const { name, batch_year, program, current_company, current_role, linkedin, available_for_mentorship } = req.body;
    const userId = String(req.user.id);

    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required.' });
    const trimmedName = name.trim();

    try {
        if (dbConfig.isProduction) {
            // Check uniqueness
            const nameCheck = await firestore.collection('users').where('name', '==', trimmedName).where('role', '==', 'alumni').get();
            if (!nameCheck.empty && nameCheck.docs[0].id !== userId) {
                return res.status(409).json({ message: 'Another alumni already has this name.' });
            }

            // Update user profile display name
            await firestore.collection('users').doc(userId).update({ name: trimmedName });

            // Check if alumni profile exists
            const alSnap = await firestore.collection('alumni').where('user_id', '==', userId).limit(1).get();
            const payload = {
                user_id: userId, name: trimmedName, email: req.user.email, // Denormalize
                batch_year: batch_year || '', program: program || '', current_company: current_company || '',
                current_role: current_role || '', linkedin: linkedin || '', available_for_mentorship: available_for_mentorship ? 1 : 0
            };

            if (!alSnap.empty) {
                await firestore.collection('alumni').doc(alSnap.docs[0].id).update(payload);
            } else {
                await firestore.collection('alumni').add(payload);
            }
        } else {
            // Name uniqueness check (allow own name, block other alumni with same name)
            const duplicate = dbConfig.db.prepare(
                'SELECT id FROM users WHERE LOWER(name) = LOWER(?) AND id != ? AND role = \'alumni\''
            ).get(trimmedName, userId);
            if (duplicate) return res.status(409).json({ message: 'Another alumni already has this name.' });

            // Update display name in users table
            dbConfig.db.prepare('UPDATE users SET name = ? WHERE id = ?').run(trimmedName, userId);

            // Upsert: check if row already exists for this user
            const existing = dbConfig.db.prepare('SELECT id FROM alumni WHERE user_id = ?').get(userId);
            if (existing) {
                dbConfig.db.prepare(`
                    UPDATE alumni
                    SET batch_year = ?, program = ?, current_company = ?,
                        current_role = ?, linkedin = ?, available_for_mentorship = ?
                    WHERE user_id = ?
                `).run(batch_year || '', program || '', current_company || '', current_role || '', linkedin || '', available_for_mentorship ? 1 : 0, userId);
            } else {
                dbConfig.db.prepare(`
                    INSERT INTO alumni (user_id, batch_year, program, current_company, current_role, linkedin, available_for_mentorship)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(userId, batch_year || '', program || '', current_company || '', current_role || '', linkedin || '', available_for_mentorship ? 1 : 0);
            }
        }

        res.status(201).json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('[alumni POST]', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
