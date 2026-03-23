const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');
const { authMiddleware } = require('../middleware/auth');
const syncService = require('../cloud/syncService');
const storageService = require('../cloud/storageService');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 400 * 1024 * 1024 }, // 400 MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.pptx', '.ppt', '.docx', '.doc', '.zip', '.txt', '.png', '.jpg'];
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
    }
});

router.get('/', authMiddleware(), async (req, res) => {
    const { type, program } = req.query;
    try { 
        if (dbConfig.isProduction) {
            let ref = firestore.collection('study_materials');
            if (type) ref = ref.where('type', '==', type);
            // In NoSQL we might have to filter 'program' dynamically if complex ORs exist
            const snapshot = await ref.orderBy('uploaded_at', 'desc').get();
            const mats = [];
            snapshot.forEach(doc => {
                const d = doc.data();
                if (!program || d.program === program || !d.program) {
                    mats.push({ id: doc.id, ...d });
                }
            });
            res.json(mats);
        } else {
            let query = `SELECT m.*, u.name as uploaded_by_name FROM study_materials m JOIN users u ON m.uploaded_by = u.id WHERE 1=1`;
            const params = [];
            if (type) { query += ' AND m.type = ?'; params.push(type); }
            if (program) { query += ' AND (m.program = ? OR m.program IS NULL)'; params.push(program); }
            query += ' ORDER BY m.uploaded_at DESC';
            res.json(dbConfig.db.prepare(query).all(...params)); 
        }
    } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

router.post('/', authMiddleware(['staff', 'admin']), upload.single('file'), async (req, res) => {
    const { title, description, type, program } = req.body;
    if (!title || !type) return res.status(400).json({ message: 'title and type required.' });

    let file_path;
    if (req.file) {
        file_path = `/uploads/${req.file.filename}`;
    } else if (req.body.file_path) {
        file_path = req.body.file_path;
    } else {
        return res.status(400).json({ message: 'A file or file_path is required.' });
    }

    try {
        let materialId;
        if (dbConfig.isProduction) {
            const added = await firestore.collection('study_materials').add({
                title, description: description || '', file_path, type, program: program || null,
                uploaded_by: req.user.id,
                uploaded_by_name: req.user.name || 'Staff', // Denormalized for NO-SQL
                uploaded_at: new Date().toISOString()
            });
            materialId = added.id;
        } else {
            const result = dbConfig.db.prepare('INSERT INTO study_materials (title, description, file_path, type, program, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)').run(title, description || '', file_path, type, program || null, req.user.id);
            materialId = result.lastInsertRowid;
            syncService.syncRecord('study_materials', { id: materialId, title, description: description || '', file_path, type, program: program || null, uploaded_by: req.user.id });
        }

        // Upload physical file to cloud if it was just uploaded locally
        if (req.file) {
          storageService.uploadFile(req.file.path, 'uploads', req.file.filename);
        }

        res.status(201).json({ message: 'Material uploaded.', file_path, id: materialId });
    } catch (err) { 
        console.error('Material upload error:', err);
        res.status(500).json({ message: 'Server error.' }); 
    }
});

router.delete('/all', authMiddleware(['staff', 'admin']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snapshot = await firestore.collection('study_materials').get();
            const batch = firestore.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        } else {
            dbConfig.db.prepare('DELETE FROM study_materials').run();
        }
        res.json({ message: 'All materials deleted.' });
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/:id', authMiddleware(['staff', 'admin']), async (req, res) => {
    try {
        let filePath = null;
        if (dbConfig.isProduction) {
            const doc = await firestore.collection('study_materials').doc(req.params.id).get();
            if (doc.exists) filePath = doc.data().file_path;
            await firestore.collection('study_materials').doc(req.params.id).delete();
        } else {
            const mat = dbConfig.db.prepare('SELECT file_path FROM study_materials WHERE id = ?').get(req.params.id);
            if (mat) filePath = mat.file_path;
            dbConfig.db.prepare('DELETE FROM study_materials WHERE id = ?').run(req.params.id);
        }
        
        // Try to delete actual file if it exists locally
        if (filePath?.startsWith('/uploads/')) {
            const fp = path.join(__dirname, '..', filePath);
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }
        res.json({ message: 'Deleted.' });
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;
