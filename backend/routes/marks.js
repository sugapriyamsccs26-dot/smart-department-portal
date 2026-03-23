const express = require('express');
const router = express.Router();
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');
const { authMiddleware } = require('../middleware/auth');
const syncService = require('../cloud/syncService');

// Helper for NoSQL to resolve Firebase UID across collections
async function resolveFbStudentId(input_id) {
    if (!input_id) return null;
    const userSnap = await firestore.collection('users').where('user_id', '==', String(input_id)).limit(1).get();
    if (!userSnap.empty) {
        const uId = userSnap.docs[0].id;
        const studentSnap = await firestore.collection('students').where('user_id', '==', uId).limit(1).get();
        if (!studentSnap.empty) return studentSnap.docs[0].id;
    }
    const csSnap = await firestore.collection('class_students').where('reg_no', '==', String(input_id)).limit(1).get();
    if (!csSnap.empty) {
        const user2 = await firestore.collection('users').where('user_id', '==', String(csSnap.docs[0].data().reg_no)).limit(1).get();
        if (!user2.empty) {
            const student2 = await firestore.collection('students').where('user_id', '==', user2.docs[0].id).limit(1).get();
            if (!student2.empty) return student2.docs[0].id;
        }
    }
    return String(input_id); // Fallback to treat standard string as ID
}

// GET /api/marks/class-summary
router.get('/class-summary', authMiddleware(['staff', 'admin']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            // Aggregation in NoSQL
            const snap = await firestore.collection('marks').where('uploaded_by', '==', String(req.user.id)).get();
            const courseMap = {};
            snap.forEach(d => {
                const mark = d.data();
                if (!courseMap[mark.course_id]) courseMap[mark.course_id] = { totalSum: 0, count: 0 };
                courseMap[mark.course_id].totalSum += mark.total;
                courseMap[mark.course_id].count++;
            });
            const summary = Object.keys(courseMap).map(cid => ({
                course_id: cid,
                students_graded: courseMap[cid].count,
                average_mark: (courseMap[cid].totalSum / courseMap[cid].count).toFixed(1)
            }));
            res.json(summary);
        } else {
            const summary = dbConfig.db.prepare(`
                SELECT course_id, COUNT(*) as students_graded, ROUND(AVG(total), 1) as average_mark 
                FROM marks WHERE uploaded_by = ? GROUP BY course_id
            `).all(req.user.id);
            res.json(summary);
        }
    } catch (err) { res.status(500).json({ message: 'Error fetching class marks summary', error: err.message }); }
});

// GET /api/marks/summary - Global marks summary
router.get('/summary', authMiddleware(['admin', 'staff', 'hod']), async (req, res) => {
    try {
        if (dbConfig.isProduction) {
            const snap = await firestore.collection('marks').get();
            const courseMap = {};
            snap.forEach(d => {
                const mark = d.data();
                if (!courseMap[mark.course_id]) courseMap[mark.course_id] = { sum: 0, count: 0 };
                courseMap[mark.course_id].sum += mark.total;
                courseMap[mark.course_id].count++;
            });
            const summary = Object.keys(courseMap).map(cid => ({
                course_id: cid, avg_marks: (courseMap[cid].sum / courseMap[cid].count), count: courseMap[cid].count
            }));
            res.json(summary);
        } else {
            const summary = dbConfig.db.prepare(`
                SELECT course_id, AVG(total) as avg_marks, COUNT(*) as count
                FROM marks GROUP BY course_id`).all();
            res.json(summary);
        }
    } catch (err) { res.status(500).json({ message: 'Error fetching marks summary' }); }
});

router.get('/', authMiddleware(['admin', 'staff', 'student']), async (req, res) => {
    let { student_id } = req.query;
    if (!student_id) return res.status(400).json({ message: 'student_id required.' });
    try {
        let resolvedId = null;
        if (dbConfig.isProduction) {
            resolvedId = await resolveFbStudentId(student_id);
            if (resolvedId) {
                const sMarksnap = await firestore.collection('marks').where('student_id', '==', resolvedId).get();
                const eMarksnap = await firestore.collection('exam_marks').where('student_id', '==', resolvedId).get();
                res.json({ semMarks: sMarksnap.docs.map(d=>d.data()), examMarks: eMarksnap.docs.map(d=>d.data()) });
            } else {
                res.json({ semMarks: [], examMarks: [] });
            }
        } else {
            const userStudent = dbConfig.db.prepare('SELECT s.id FROM students s JOIN users u ON s.user_id = u.id WHERE u.user_id = ?').get(student_id);
            if (userStudent) resolvedId = userStudent.id;
            else {
                const internalStudent = dbConfig.db.prepare('SELECT id FROM students WHERE id = ?').get(student_id);
                if (internalStudent) resolvedId = internalStudent.id;
            }

            if (resolvedId) {
                const semMarks = dbConfig.db.prepare('SELECT * FROM marks WHERE student_id = ?').all(resolvedId);
                const examMarks = dbConfig.db.prepare('SELECT * FROM exam_marks WHERE student_id = ?').all(resolvedId);
                res.json({ semMarks, examMarks });
            } else {
                res.json({ semMarks: [], examMarks: [] });
            }
        }
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Server error fetching marks.' }); 
    }
});

router.post('/', authMiddleware(['admin', 'staff']), async (req, res) => {
    let { student_id, course_id, semester, internal_marks, external_marks } = req.body;
    if (!student_id || !course_id || !semester) return res.status(400).json({ message: 'Required fields missing.' });
    
    try {
        let resolvedId;
        if (dbConfig.isProduction) {
            resolvedId = await resolveFbStudentId(student_id);
        } else {
            let student = dbConfig.db.prepare('SELECT s.id FROM students s JOIN users u ON s.user_id = u.id WHERE u.user_id = ?').get(student_id);
            if (!student) student = dbConfig.db.prepare('SELECT id FROM students WHERE id = ?').get(student_id);
            if (!student) {
                const cs = dbConfig.db.prepare('SELECT reg_no FROM class_students WHERE reg_no = ?').get(student_id);
                if (cs) student = dbConfig.db.prepare('SELECT s.id FROM students s JOIN users u ON s.user_id = u.id WHERE u.user_id = ?').get(cs.reg_no);
            }
            if (student) resolvedId = student.id;
        }

        if (!resolvedId) return res.status(404).json({ message: `Student identifier "${student_id}" not found. Please use a valid User ID or Reg No.` });

        const internal = Number(internal_marks) || 0;
        const external = Number(external_marks) || 0;

        if (internal > 25) return res.status(400).json({ message: `Internal marks cannot exceed 25. Received: ${internal}` });
        if (external > 75) return res.status(400).json({ message: `External marks cannot exceed 75. Received: ${external}` });
        if (internal < 0 || external < 0) return res.status(400).json({ message: 'Marks cannot be negative.' });

        const total = internal + external;
        const markRecord = { student_id: resolvedId, course_id, semester, internal_marks: internal, external_marks: external, total, uploaded_by: String(req.user.id) };
        
        if (dbConfig.isProduction) {
            const existing = await firestore.collection('marks').where('student_id', '==', resolvedId).where('course_id', '==', course_id).where('semester', '==', semester).get();
            if (!existing.empty) {
                await firestore.collection('marks').doc(existing.docs[0].id).update({ internal_marks: internal, external_marks: external, total });
                return res.json({ message: 'Marks updated successfully!' });
            }
            await firestore.collection('marks').add(markRecord);
            res.status(201).json({ message: 'Marks entered successfully!' });
        } else {
            const existing = dbConfig.db.prepare('SELECT id FROM marks WHERE student_id=? AND course_id=? AND semester=?').get(resolvedId, course_id, semester);
            if (existing) {
                dbConfig.db.prepare('UPDATE marks SET internal_marks=?, external_marks=?, total=? WHERE id=?').run(internal, external, total, existing.id);
                syncService.syncRecord('marks', markRecord, 'student_id, course_id, semester');
                return res.json({ message: 'Marks updated successfully!' });
            }
            dbConfig.db.prepare('INSERT INTO marks (student_id, course_id, semester, internal_marks, external_marks, total) VALUES (?, ?, ?, ?, ?, ?)').run(resolvedId, course_id, semester, internal, external, total);
            syncService.syncRecord('marks', markRecord, 'student_id, course_id, semester');
            res.status(201).json({ message: 'Marks entered successfully!' });
        }
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Server error saving marks.' }); 
    }
});

router.post('/structured', authMiddleware(['admin', 'staff']), (req, res) => {
    let { student_id, course_id, semester, exam_type, marks } = req.body;
    if (!student_id || !course_id || !semester || !exam_type) return res.status(400).json({ message: 'Required fields missing.' });
    
    try {
        // Resolve student_id to internal students.id
        let student = dbConfig.db.prepare('SELECT s.id FROM students s JOIN users u ON s.user_id = u.id WHERE u.user_id = ?').get(student_id);
        if (!student) student = dbConfig.db.prepare('SELECT id FROM students WHERE id = ?').get(student_id);

        if (!student) return res.status(404).json({ message: `Student ID "${student_id}" not found. Please use a valid User ID.` });
        const resolvedId = student.id;

        const markValue = marks === '' ? 0 : Number(marks);
        if (isNaN(markValue)) return res.status(400).json({ message: 'Marks must be a number.' });

        const structuredRecord = { student_id: resolvedId, course_id, semester, exam_type, marks: markValue };
        const existing = dbConfig.db.prepare('SELECT id FROM exam_marks WHERE student_id=? AND course_id=? AND semester=? AND exam_type=?').get(resolvedId, course_id, semester, exam_type);
        if (existing) {
            dbConfig.db.prepare('UPDATE exam_marks SET marks=? WHERE id=?').run(markValue, existing.id);
            syncService.syncRecord('exam_marks', structuredRecord, 'student_id, course_id, semester, exam_type');
            return res.json({ message: `${exam_type} marks updated successfully!` });
        }
        dbConfig.db.prepare('INSERT INTO exam_marks (student_id, course_id, semester, exam_type, marks) VALUES (?, ?, ?, ?, ?)').run(resolvedId, course_id, semester, exam_type, markValue);
        syncService.syncRecord('exam_marks', structuredRecord, 'student_id, course_id, semester, exam_type');
        res.status(201).json({ message: `${exam_type} marks entered successfully!` });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Server error saving marks.' }); 
    }
});

router.post('/bulk', authMiddleware(['admin', 'staff']), (req, res) => {
    const { semester, exam_type, course_id, marks_data } = req.body;
    if (!marks_data || !Array.isArray(marks_data) || !course_id || !semester || !exam_type) {
        return res.status(400).json({ message: 'Invalid payload.' });
    }

    // Mapping from frontend to backend exam types
    const EXAM_TYPE_MAP = {
        'Cycle Test 1': 'Internal 1',
        'Cycle Test 2': 'Internal 2',
        'Model Exam': 'Model Exam',
        'Semester Exam': 'Semester'
    };
    const mappedType = EXAM_TYPE_MAP[exam_type] || exam_type;

    try {
        const insertOrUpdate = dbConfig.db.transaction((data) => {
            for (const item of data) {
                const { student_id, internal, external } = item;
                
                let student = dbConfig.db.prepare('SELECT s.id FROM students s JOIN users u ON s.user_id = u.id WHERE u.user_id = ?').get(student_id);
                if (!student) student = dbConfig.db.prepare('SELECT id FROM students WHERE id = ?').get(student_id);
                if (!student) continue;

                const resolvedId = student.id;

                if (exam_type === 'Semester Exam') {
                    const intVal = Number(internal) || 0;
                    const extVal = Number(external) || 0;
                    // Enforce correct marks range
                    if (intVal > 25 || extVal > 75) continue; // Skip invalid entries silently
                    const total = intVal + extVal;
                    const existing = dbConfig.db.prepare('SELECT id FROM marks WHERE student_id=? AND course_id=? AND semester=?').get(resolvedId, course_id, semester);
                    if (existing) {
                        dbConfig.db.prepare('UPDATE marks SET internal_marks=?, external_marks=?, total=? WHERE id=?').run(intVal, extVal, total, existing.id);
                    } else {
                        dbConfig.db.prepare('INSERT INTO marks (student_id, course_id, semester, internal_marks, external_marks, total) VALUES (?, ?, ?, ?, ?, ?)').run(resolvedId, course_id, semester, intVal, extVal, total);
                    }
                } else {
                    // Cycle Test / Model Exam — save BOTH internal AND external marks
                    const intVal = Number(internal) || 0;
                    const extVal = Number(external) || 0;
                    const total = intVal + extVal;
                    const existing = dbConfig.db.prepare('SELECT id FROM exam_marks WHERE student_id=? AND course_id=? AND semester=? AND exam_type=?').get(resolvedId, course_id, semester, mappedType);
                    if (existing) {
                        dbConfig.db.prepare('UPDATE exam_marks SET marks=?, internal_marks=?, external_marks=?, total=? WHERE id=?').run(intVal, intVal, extVal, total, existing.id);
                    } else {
                        dbConfig.db.prepare('INSERT INTO exam_marks (student_id, course_id, semester, exam_type, marks, internal_marks, external_marks, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(resolvedId, course_id, semester, mappedType, intVal, intVal, extVal, total);
                    }
                }
            }
        });

        insertOrUpdate(marks_data);

        // SYNC TO CLOUD (Supabase) - Enhancement
        const cloudMarks = marks_data.map(m => {
          const intVal = Number(m.internal) || 0;
          const extVal = Number(m.external) || 0;
          const total = intVal + extVal;
          if (exam_type === 'Semester Exam') {
            return { student_id: m.student_id, course_id, semester, internal_marks: intVal, external_marks: extVal, total };
          } else {
            return { student_id: m.student_id, course_id, semester, exam_type: mappedType, marks: intVal };
          }
        });
        const targetTable = exam_type === 'Semester Exam' ? 'marks' : 'exam_marks';
        const conflictCols = exam_type === 'Semester Exam' ? 'student_id, course_id, semester' : 'student_id, course_id, semester, exam_type';
        syncService.syncBulk(targetTable, cloudMarks, conflictCols);

        res.json({ message: 'Bulk marks saved successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error bulk saving.' });
    }
});

router.get('/bulk/fetch', authMiddleware(['admin', 'staff']), (req, res) => {
    const { className, course_id, exam_type, semester } = req.query;
    if (!className || !course_id || !exam_type || !semester) return res.status(400).json({ message: 'Missing parameters.' });

    const EXAM_TYPE_MAP = {
        'Cycle Test 1': 'Internal 1',
        'Cycle Test 2': 'Internal 2',
        'Model Exam': 'Model Exam',
        'Semester Exam': 'Semester'
    };
    const mappedType = EXAM_TYPE_MAP[exam_type] || exam_type;

    try {
        let rows = [];
        if (exam_type === 'Semester Exam') {
            rows = dbConfig.db.prepare(`
                SELECT u.user_id as student_id, m.internal_marks as internal, m.external_marks as external 
                FROM class_students cs
                JOIN users u ON cs.reg_no = u.user_id
                JOIN students s ON u.id = s.user_id
                LEFT JOIN marks m ON s.id = m.student_id AND m.course_id = ? AND m.semester = ?
                WHERE cs.class_name = ?
            `).all(course_id, semester, className);
        } else {
            // Return BOTH internal and external for cycle tests
            rows = dbConfig.db.prepare(`
                SELECT u.user_id as student_id, 
                       COALESCE(e.internal_marks, e.marks, 0) as internal, 
                       COALESCE(e.external_marks, 0) as external 
                FROM class_students cs
                JOIN users u ON cs.reg_no = u.user_id
                JOIN students s ON u.id = s.user_id
                LEFT JOIN exam_marks e ON s.id = e.student_id AND e.course_id = ? AND e.semester = ? AND e.exam_type = ?
                WHERE cs.class_name = ?
            `).all(course_id, semester, mappedType, className);
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching bulk marks.' });
    }
});
router.get('/export/:className', authMiddleware(['admin', 'staff']), (req, res) => {
    const { className } = req.params;
    const { course_id } = req.query;

    try {
        let query = `
            SELECT cs.reg_no, cs.name, e.course_id, e.exam_type, e.marks 
            FROM class_students cs
            JOIN users u ON cs.reg_no = u.user_id
            JOIN students s ON u.id = s.user_id
            LEFT JOIN exam_marks e ON s.id = e.student_id
            WHERE cs.class_name = ?
        `;
        const params = [className];
        
        if (course_id) {
            query += ` AND e.course_id = ?`;
            params.push(course_id);
        }
        query += ` ORDER BY cs.reg_no, e.course_id`;

        const rows = dbConfig.db.prepare(query).all(...params);

        // Pivot data logically in code
        const studentMap = {};
        rows.forEach(r => {
            const key = `${r.reg_no}_${r.course_id || 'ANY'}`;
            if (!studentMap[key]) {
                studentMap[key] = {
                    'Register Number': r.reg_no,
                    'Name': r.name,
                    'Course ID': r.course_id || 'N/A',
                    'Internal 1': '-',
                    'Internal 2': '-',
                    'Model Exam': '-',
                    'Semester': '-'
                };
            }
            if (r.exam_type) {
                studentMap[key][r.exam_type] = r.marks;
            }
        });

        res.json(Object.values(studentMap));
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Server error generating export.' }); 
    }
});

module.exports = router;
