const Database = require('better-sqlite3');
const db = new Database('portal.db');

try {
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM students").get().count;
    console.log('Students:', totalStudents);
    const totalStaff = db.prepare("SELECT COUNT(*) as count FROM staff").get().count;
    console.log('Staff:', totalStaff);
    const totalAlumni = db.prepare("SELECT COUNT(*) as count FROM users WHERE role='alumni'").get().count;
    console.log('Alumni:', totalAlumni);
    const totalEvents = db.prepare("SELECT COUNT(*) as count FROM events").get().count;
    console.log('Events:', totalEvents);
    const totalPlacements = db.prepare("SELECT COUNT(*) as count FROM placements").get().count;
    console.log('Placements:', totalPlacements);
    const totalNotices = db.prepare("SELECT COUNT(*) as count FROM notices").get().count;
    console.log('Notices:', totalNotices);
    const totalMaterials = db.prepare("SELECT COUNT(*) as count FROM study_materials").get().count;
    console.log('Materials:', totalMaterials);
    const totalAssignments = db.prepare("SELECT COUNT(*) as count FROM assignments").get().count;
    console.log('Assignments:', totalAssignments);

    const attTotal = db.prepare("SELECT COUNT(*) as count FROM attendance").get().count;
    const attPresent = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE status='present'").get().count;
    console.log('Attendance:', attTotal, 'Present:', attPresent);

    const byProgram = db.prepare("SELECT program, COUNT(*) as count FROM students GROUP BY program ORDER BY count DESC").all();
    console.log('By Program:', byProgram);

    const marksDist = db.prepare(`
        SELECT
            SUM(CASE WHEN total >= 90 THEN 1 ELSE 0 END) as 'O',
            SUM(CASE WHEN total >= 80 AND total < 90 THEN 1 ELSE 0 END) as 'A+',
            SUM(CASE WHEN total >= 70 AND total < 80 THEN 1 ELSE 0 END) as 'A',
            SUM(CASE WHEN total >= 60 AND total < 70 THEN 1 ELSE 0 END) as 'B+',
            SUM(CASE WHEN total >= 50 AND total < 60 THEN 1 ELSE 0 END) as 'B',
            SUM(CASE WHEN total < 50 THEN 1 ELSE 0 END) as 'F'
        FROM marks`).get();
    console.log('Marks Dist:', marksDist);

    const attByCourse = db.prepare(`
        SELECT course_id,
            COUNT(*) as total,
            SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
            ROUND(SUM(CASE WHEN status='present' THEN 1.0 ELSE 0 END) * 100 / COUNT(*), 1) as pct
        FROM attendance GROUP BY course_id ORDER BY pct DESC LIMIT 8`).all();
    console.log('Att by Course:', attByCourse);

    const recentAttendance = db.prepare(`
        SELECT a.date, a.status, a.course_id, u.name as student
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN users u ON s.user_id = u.id
        ORDER BY a.timestamp DESC LIMIT 5`).all();
    console.log('Recent Attendance:', recentAttendance);

} catch (err) {
    console.error('SQL Error:', err.message);
    console.error(err.stack);
}
