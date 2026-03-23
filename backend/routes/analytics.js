const express = require('express');
const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { db: firestore } = require('../config/firebaseNode');
const dbConfig = require('../config/database');

// Shared logic for overview calculations
async function getOverviewData() {
    if (dbConfig.isProduction) {
        const [students, staff, alumni, admins, users, events, placements, notices, materials, assignments, attTotal, attPresent] = await Promise.all([
            firestore.collection('students').count().get(),
            firestore.collection('staff').count().get(),
            firestore.collection('users').where('role', '==', 'alumni').count().get(),
            firestore.collection('users').where('role', '==', 'admin').count().get(),
            firestore.collection('users').count().get(),
            firestore.collection('events').count().get(),
            firestore.collection('placements').count().get(),
            firestore.collection('notices').count().get(),
            firestore.collection('study_materials').count().get(),
            firestore.collection('assignments').count().get(),
            firestore.collection('attendance').count().get(),
            firestore.collection('attendance').where('status', '==', 'present').count().get()
        ]);

        const totalAtt = attTotal.data().count;
        const presentAtt = attPresent.data().count;
        const attPct = totalAtt > 0 ? Math.round(presentAtt * 100 / totalAtt) : 0;

        // Note: For complex charts like marksDist and attByCourse in Firestore,
        // we normally need aggregation or separate summary docs.
        // For now, we'll return zeroed data or simple limits to keep it fast.
        return {
            counts: {
                totalStudents: students.data().count,
                totalStaff: staff.data().count,
                totalAlumni: alumni.data().count,
                totalAdmins: admins.data().count,
                totalUsers: users.data().count,
                totalEvents: events.data().count,
                totalPlacements: placements.data().count,
                totalNotices: notices.data().count,
                totalMaterials: materials.data().count,
                totalAssignments: assignments.data().count
            },
            attendance: { total: totalAtt, present: presentAtt, percentage: attPct },
            byProgram: [], // Firestore aggregation needed or return empty for now
            marksDist: { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'F': 0 },
            attByCourse: [],
            recentAttendance: []
        };
    }

    const totalStudents = dbConfig.db.prepare("SELECT COUNT(*) as count FROM students").get().count;
    const totalStaff = dbConfig.db.prepare("SELECT COUNT(*) as count FROM staff").get().count;
    const totalAlumni = dbConfig.db.prepare("SELECT COUNT(*) as count FROM users WHERE role='alumni'").get().count;
    const totalAdmins = dbConfig.db.prepare("SELECT COUNT(*) as count FROM users WHERE role='admin'").get().count;
    const totalUsers = dbConfig.db.prepare("SELECT COUNT(*) as count FROM users").get().count;
    
    const totalEvents = dbConfig.db.prepare("SELECT COUNT(*) as count FROM events").get().count;
    const totalPlacements = dbConfig.db.prepare("SELECT COUNT(*) as count FROM placements").get().count;
    const totalNotices = dbConfig.db.prepare("SELECT COUNT(*) as count FROM notices").get().count;
    const totalMaterials = dbConfig.db.prepare("SELECT COUNT(*) as count FROM study_materials").get().count;
    const totalAssignments = dbConfig.db.prepare("SELECT COUNT(*) as count FROM assignments").get().count;

    // Attendance overview - Handle empty tables with COALESCE
    const attTotal = dbConfig.db.prepare("SELECT COUNT(*) as count FROM attendance").get().count;
    const attPresent = dbConfig.db.prepare("SELECT COUNT(*) as count FROM attendance WHERE status='present'").get().count;
    const attPct = attTotal > 0 ? Math.round(attPresent * 100 / attTotal) : 0;

    // Students by program
    const byProgram = dbConfig.db.prepare("SELECT program, COUNT(*) as count FROM students GROUP BY program ORDER BY count DESC").all();

    // Marks distribution (grade bands)
    const marksDist = dbConfig.db.prepare(`
        SELECT
            COALESCE(SUM(CASE WHEN total >= 90 THEN 1 ELSE 0 END), 0) as 'O',
            COALESCE(SUM(CASE WHEN total >= 80 AND total < 90 THEN 1 ELSE 0 END), 0) as 'A+',
            COALESCE(SUM(CASE WHEN total >= 70 AND total < 80 THEN 1 ELSE 0 END), 0) as 'A',
            COALESCE(SUM(CASE WHEN total >= 60 AND total < 70 THEN 1 ELSE 0 END), 0) as 'B+',
            COALESCE(SUM(CASE WHEN total >= 50 AND total < 60 THEN 1 ELSE 0 END), 0) as 'B',
            COALESCE(SUM(CASE WHEN total < 50 THEN 1 ELSE 0 END), 0) as 'F'
        FROM marks`).get();

    // Attendance by course
    const attByCourse = dbConfig.db.prepare(`
        SELECT course_id,
            COUNT(*) as total,
            SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
            ROUND(SUM(CASE WHEN status='present' THEN 100.0 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) as pct
        FROM attendance GROUP BY course_id ORDER BY pct DESC LIMIT 8`).all();

    // Recent activity
    const recentAttendance = dbConfig.db.prepare(`
        SELECT a.date, a.status, a.course_id, u.name as student
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN users u ON s.user_id = u.id
        ORDER BY a.timestamp DESC LIMIT 5`).all();

    return {
        counts: { totalStudents, totalStaff, totalAlumni, totalAdmins, totalUsers, totalEvents, totalPlacements, totalNotices, totalMaterials, totalAssignments },
        attendance: { total: attTotal, present: attPresent, percentage: attPct },
        byProgram,
        marksDist,
        attByCourse: attByCourse.map(c => ({ ...c, pct: c.pct || 0 })), 
        recentAttendance
    };
}

// GET /api/analytics/overview - Stats for all roles
router.get('/overview', authMiddleware(['admin', 'staff', 'student', 'alumni']), async (req, res) => {
    try {
        const data = await getOverviewData();
        res.json(data);
    } catch (err) {
        console.error('Analytics Overview Error:', err);
        res.status(500).json({ message: 'Server error processing analytics summary.' });
    }
});

// GET /api/analytics/summary - For AI insights 
router.get('/summary', authMiddleware(['admin', 'staff', 'hod']), async (req, res) => {
    try {
        const data = await getOverviewData();
        res.json(data);
    } catch (err) {
        console.error('Analytics Summary Error:', err);
        res.status(500).json({ message: 'Server error processing analytics summary.' });
    }
});

// GET /api/analytics/student/:id - Individual student analytics
router.get('/student/:id', authMiddleware(['admin', 'staff', 'student']), async (req, res) => {
    try {
        const identifier = req.params.id;

        if (dbConfig.isProduction) {
            // Find student in Firestore (id can be Firestore Doc ID or registered user_id)
            let studentDoc;
            // Try as Doc ID first
            const byId = await firestore.collection('students').doc(identifier).get();
            if (byId.exists) {
                studentDoc = { id: byId.id, ...byId.data() };
            } else {
                // Try as user_id (registry reference)
                const byRef = await firestore.collection('students').where('user_id', '==', identifier).limit(1).get();
                if (!byRef.empty) {
                    studentDoc = { id: byRef.docs[0].id, ...byRef.docs[0].data() };
                } else {
                    // Try looking in users table first if identifier is reg_no
                    const userSnap = await firestore.collection('users').where('user_id', '==', identifier).limit(1).get();
                    if (!userSnap.empty) {
                        const studentById = await firestore.collection('students').where('user_id', '==', userSnap.docs[0].id).limit(1).get();
                        if (!studentById.empty) studentDoc = { id: studentById.docs[0].id, ...studentById.docs[0].data() };
                    }
                }
            }

            if (!studentDoc) return res.status(404).json({ message: 'Student information not found.' });

            // Fetch attendance data for this student
            const attSnap = await firestore.collection('attendance').where('student_id', '==', studentDoc.id).get();
            const classAttSnap = await firestore.collection('class_attendance').where('reg_no', '==', studentDoc.user_id).get();

            const combined = [...attSnap.docs.map(d=>d.data()), ...classAttSnap.docs.map(d=>({course_id: d.data().subject, ...d.data()}))];
            
            // Group and aggregate by course_id
            const courses = {};
            combined.forEach(a => {
                const cId = a.course_id || 'General';
                if (!courses[cId]) courses[cId] = { course_id: cId, total: 0, present: 0 };
                courses[cId].total++;
                if (a.status === 'present') courses[cId].present++;
            });

            const attStats = Object.values(courses).map(c => ({
                ...c,
                pct: c.total > 0 ? (c.present * 100 / c.total).toFixed(2) : 0
            }));

            // Fetch marks
            const marksSnap = await firestore.collection('marks').where('student_id', '==', studentDoc.id).get();
            const marksStats = marksSnap.docs.map(d => d.data());

            const gradePoints = marksStats.map(m => {
                if (m.total >= 90) return 10;
                if (m.total >= 80) return 9;
                if (m.total >= 70) return 8;
                if (m.total >= 60) return 7;
                if (m.total >= 50) return 6;
                return 0;
            });
            const cgpa = gradePoints.length > 0 ? (gradePoints.reduce((a, b) => a + b, 0) / gradePoints.length).toFixed(2) : '0.00';
            const overallAtt = combined.length > 0 ? Math.round(combined.filter(a=>a.status==='present').length * 100 / combined.length) : 0;

            return res.json({ attStats, marksStats, cgpa, overallAttendance: overallAtt });
        }
        
        const studentInfo = dbConfig.db.prepare(`
            SELECT s.id, u.user_id as reg_no 
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            WHERE u.user_id = ? OR s.id = ? 
            LIMIT 1`).get(identifier, identifier);
        
        if (!studentInfo) return res.status(404).json({ message: 'Student information not found.' });

        const { id: studentDbId, reg_no } = studentInfo;

        const attStats = dbConfig.db.prepare(`
            WITH CombinedAtt AS (
                SELECT course_id as subject, status FROM attendance WHERE student_id = ?
                UNION ALL
                SELECT subject, status FROM class_attendance WHERE reg_no = ?
            )
            SELECT subject as course_id,
                COUNT(*) as total,
                SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
                ROUND(SUM(CASE WHEN status='present' THEN 100.0 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as pct
            FROM CombinedAtt GROUP BY subject`).all(studentDbId, reg_no);

        const marksStats = dbConfig.db.prepare(`
            SELECT course_id, semester, internal_marks, external_marks, total
            FROM marks WHERE student_id=? ORDER BY semester, course_id`).all(studentDbId);

        const gradePoints = marksStats.map(m => {
            if (m.total >= 90) return 10;
            if (m.total >= 80) return 9;
            if (m.total >= 70) return 8;
            if (m.total >= 60) return 7;
            if (m.total >= 50) return 6;
            return 0;
        });
        const cgpa = gradePoints.length > 0
            ? (gradePoints.reduce((a, b) => a + b, 0) / gradePoints.length).toFixed(2)
            : '0.00';

        const overallAtt = attStats.length > 0
            ? Math.round(attStats.reduce((a, b) => a + b.present, 0) * 100 / attStats.reduce((a, b) => a + b.total, 0))
            : 0;

        res.json({ attStats, marksStats: marksStats.map(m => ({ ...m, pct: m.pct || 0 })), cgpa, overallAttendance: overallAtt });
    } catch (err) {
        console.error('Student Analytics Error:', err);
        res.status(500).json({ message: 'Server error calculating student metrics.' });
    }
});

router.get('/dashboard', authMiddleware(), async (req, res) => {
    try {
        const { id: userDbId, user_id, role } = req.user;
        const dbConfig = require('../config/database');

        if (dbConfig.isProduction) {
            // --- FIREBASE CLOUD MODE ---
            const [noticesSnap, eventsSnap, notifsSnap] = await Promise.all([
                firestore.collection('notices').orderBy('created_at', 'desc').limit(4).get(),
                firestore.collection('events').orderBy('event_date', 'asc').limit(4).get(),
                firestore.collection('notifications').where('user_id', '==', String(userDbId)).where('is_read', '==', false).count().get()
            ]);

            const notices = noticesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            const events = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            const unreadNotifs = notifsSnap.data().count;

            let overview = null;
            if (role === 'student') {
                const studentSnap = await firestore.collection('students').where('user_id', '==', String(userDbId)).limit(1).get();
                
                if (!studentSnap.empty) {
                    const studentRealId = studentSnap.docs[0].id;
                    const marksSnap = await firestore.collection('marks').where('student_id', '==', studentRealId).get();
                    const marksList = marksSnap.docs.map(d => d.data());
                    
                    const gradePoints = marksList.map(m => {
                        if (m.total >= 90) return 10;
                        if (m.total >= 80) return 9;
                        if (m.total >= 70) return 8;
                        if (m.total >= 60) return 7;
                        if (m.total >= 50) return 6;
                        return 0;
                    });
                    
                    const cgpa = gradePoints.length > 0 ? (gradePoints.reduce((a, b) => a + b, 0) / gradePoints.length).toFixed(2) : '0.00';
                    overview = { studentMode: true, data: { overallAttendance: 100, cgpa } };
                }
            } else {
                const countsObj = await Promise.all([
                    firestore.collection('students').count().get(),
                    firestore.collection('staff').count().get(),
                    firestore.collection('users').where('role', '==', 'alumni').count().get(),
                    firestore.collection('events').count().get(),
                    firestore.collection('notices').count().get()
                ]);
                overview = {
                    counts: {
                        totalStudents: countsObj[0].data().count,
                        totalStaff: countsObj[1].data().count,
                        totalAlumni: countsObj[2].data().count,
                        totalEvents: countsObj[3].data().count,
                        totalNotices: countsObj[4].data().count
                    }
                };
            }

            return res.json({ notices, events, overview, unreadNotifs });
        }

        // --- SQLITE LOCAL MODE ---
        const notices = dbConfig.db.prepare("SELECT * FROM notices ORDER BY created_at DESC LIMIT 4").all();
        const events = dbConfig.db.prepare("SELECT * FROM events ORDER BY event_date ASC LIMIT 4").all();
        const unreadNotifs = dbConfig.db.prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0").get(userDbId).count;

        let overview = null;
        if (role === 'student') {
            const studentInfo = dbConfig.db.prepare(`
                SELECT s.id, u.user_id as reg_no FROM students s 
                JOIN users u ON s.user_id = u.id WHERE u.id = ? LIMIT 1
            `).get(userDbId);

            if (studentInfo) {
                const combinedAtt = dbConfig.db.prepare(`
                    WITH CombinedAtt AS (
                        SELECT status FROM attendance WHERE student_id = ?
                        UNION ALL
                        SELECT status FROM class_attendance WHERE reg_no = ?
                    )
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present
                    FROM CombinedAtt
                `).get(studentInfo.id, studentInfo.reg_no);

                const marks = dbConfig.db.prepare("SELECT total FROM marks WHERE student_id = ?").all(studentInfo.id);
                const gradePoints = marks.map(m => {
                    if (m.total >= 90) return 10;
                    if (m.total >= 80) return 9;
                    if (m.total >= 70) return 8;
                    if (m.total >= 60) return 7;
                    if (m.total >= 50) return 6;
                    return 0;
                });
                
                const cgpa = gradePoints.length > 0 ? (gradePoints.reduce((a, b) => a + b, 0) / gradePoints.length).toFixed(2) : '0.00';
                const overallAtt = combinedAtt.total > 0 ? Math.round(combinedAtt.present * 100 / combinedAtt.total) : 0;
                
                overview = { studentMode: true, data: { overallAttendance: overallAtt, cgpa } };
            }
        } else {
            overview = {
                counts: {
                    totalStudents: dbConfig.db.prepare("SELECT COUNT(*) as count FROM students").get().count,
                    totalStaff: dbConfig.db.prepare("SELECT COUNT(*) as count FROM staff").get().count,
                    totalAlumni: dbConfig.db.prepare("SELECT COUNT(*) as count FROM alumni").get().count,
                    totalEvents: dbConfig.db.prepare("SELECT COUNT(*) as count FROM events").get().count,
                    totalNotices: dbConfig.db.prepare("SELECT COUNT(*) as count FROM notices").get().count
                }
            };
        }

        res.json({ notices, events, overview, unreadNotifs });
    } catch (err) {
        console.error('Dashboard Error:', err);
        res.status(500).json({ message: 'Error loading dashboard data' });
    }
});

module.exports = router;
