const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');

// GET /api/analytics/at-risk
router.get('/at-risk', authMiddleware(['admin', 'staff', 'hod']), async (req, res) => {
    try {
        const dbConfig = require('../config/database');
        const { db: firestore } = require('../config/firebaseNode');

        if (dbConfig.isProduction) {
            // Find at-risk students in Firestore
            // For now, we fetch a sample of students and check their metrics.
            // A full implementation would use pre-computed daily_attendance or similar.
            const studentsSnap = await firestore.collection('students').limit(20).get();
            const results = [];

            for (const doc of studentsSnap.docs) {
                const s = doc.data();
                const userSnap = await firestore.collection('users').doc(s.user_id).get();
                const userData = userSnap.exists ? userSnap.data() : { name: 'Unknown' };

                // Get marks for this student
                const marksSnap = await firestore.collection('marks').where('student_id', '==', doc.id).get();
                let totalMarks = 0;
                let count = 0;
                marksSnap.forEach(d => { totalMarks += d.data().total; count++; });
                const avgMarks = count > 0 ? totalMarks / count : 0;

                // Simple check for risk
                if (avgMarks < 40) {
                    results.push({
                        studentId: userData.user_id,
                        name: userData.name,
                        program: s.program,
                        attendance_pct: 100, // Hardcoded for now till attendance is robustly aggregated
                        avg_marks: Math.round(avgMarks),
                        risk_level: avgMarks < 30 ? 'high' : 'medium'
                    });
                }
            }
            return res.json(results);
        }

        // Query to find at-risk students based on attendance < 75% or average marks < 40
        // We use COALESCE to ensure students with NO data are flagged as 0 (highest risk)
        const atRiskStudents = dbConfig.db.prepare(`
            WITH StudentAttendance AS (
                SELECT 
                    student_id,
                    ROUND(SUM(CASE WHEN status='present' THEN 100.0 ELSE 0 END) / COUNT(*), 1) as attendance_pct
                FROM attendance
                GROUP BY student_id
            ),
            StudentMarks AS (
                SELECT 
                    student_id,
                    AVG(total) as avg_marks
                FROM marks
                GROUP BY student_id
            )
            SELECT 
                u.user_id as studentId,
                u.name,
                s.program,
                COALESCE(sa.attendance_pct, 0) as attendance_pct,
                COALESCE(sm.avg_marks, 0) as avg_marks
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN StudentAttendance sa ON s.id = sa.student_id
            LEFT JOIN StudentMarks sm ON s.id = sm.student_id
            WHERE COALESCE(sa.attendance_pct, 0) < 75 OR COALESCE(sm.avg_marks, 0) < 40
            ORDER BY attendance_pct ASC, avg_marks ASC
            LIMIT 15
        `).all();

        const results = atRiskStudents.map(s => {
            const att = s.attendance_pct;
            const marks = s.avg_marks;
            return {
                studentId: s.studentId,
                name: s.name,
                program: s.program,
                attendance_pct: att,
                avg_marks: Math.round(marks),
                risk_level: (att < 50 || marks < 30) ? 'high' : 'medium'
            };
        });

        res.json(results);
    } catch (err) {
        console.error('At-Risk Students Error:', err);
        res.status(500).json({ message: 'Server error fetching at-risk data.' });
    }
});

module.exports = router;
