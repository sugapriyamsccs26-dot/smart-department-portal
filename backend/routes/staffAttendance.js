const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const dbConfig = require('../config/database');
const { db: firestore } = require('../config/firebaseNode');

// Campus: QMHW+4MV, Kajamalai Colony, TVS Tollgate, Tiruchirappalli, TN 620023
const CAMPUS_LAT = 10.7775195;
const CAMPUS_LNG = 78.6950325;
const ALLOWED_RADIUS_METERS = 300;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); 
}

// POST /api/staff-attendance/checkin
router.post('/checkin', authMiddleware(), async (req, res) => {
  const { latitude, longitude } = req.body;
  const staffId = req.user.id;

  if (req.user.role !== 'staff' && req.user.role !== 'admin' && req.user.role !== 'hod') {
    return res.status(403).json({ message: 'Only staff can mark attendance.' });
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });

  try {
    if (dbConfig.isProduction) {
        const existing = await firestore.collection('staff_attendance')
            .where('staff_id', '==', staffId)
            .where('date', '==', today).limit(1).get();
        
        if (!existing.empty) {
            return res.json({ alreadyMarked: true, id: existing.docs[0].id, ...existing.docs[0].data() });
        }

        const distance_meters = getDistance(latitude, longitude, CAMPUS_LAT, CAMPUS_LNG);
        const status = distance_meters <= ALLOWED_RADIUS_METERS ? 'Present' : 'Outside';
        
        const data = { staff_id: staffId, date: today, check_in_time: timeStr, latitude, longitude, distance_meters, status };
        const docRef = await firestore.collection('staff_attendance').add(data);
        return res.json({ success: true, status, id: docRef.id, distance_meters, message: status === 'Present' ? 'Attendance Marked ✓' : 'Outside campus boundary', check_in_time: timeStr });
    }

    const existing = dbConfig.db.prepare(`SELECT * FROM staff_attendance WHERE staff_id = ? AND date = date('now', 'localtime')`).get(staffId);
    if (existing) {
      return res.json({ alreadyMarked: true, ...existing });
    }

    const distance_meters = getDistance(latitude, longitude, CAMPUS_LAT, CAMPUS_LNG);
    const status = distance_meters <= ALLOWED_RADIUS_METERS ? 'Present' : 'Outside';

    const info = dbConfig.db.prepare(`
      INSERT INTO staff_attendance (staff_id, date, check_in_time, latitude, longitude, distance_meters, status)
      VALUES (?, date('now', 'localtime'), time('now', 'localtime'), ?, ?, ?, ?)
    `).run(staffId, latitude, longitude, distance_meters, status);

    const checkInTime = dbConfig.db.prepare(`SELECT check_in_time FROM staff_attendance WHERE id = ?`).get(info.lastInsertRowid)?.check_in_time;

    res.json({ success: true, status, distance_meters, message: status === 'Present' ? 'Attendance Marked ✓' : 'Outside campus boundary', check_in_time: checkInTime });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error marking attendance.' });
  }
});

// GET /api/staff-attendance/today
router.get('/today', authMiddleware(['admin', 'hod']), async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    if (dbConfig.isProduction) {
        const usersSnap = await firestore.collection('users').where('role', 'in', ['staff', 'hod']).get();
        const attSnap = await firestore.collection('staff_attendance').where('date', '==', today).get();
        
        const attMap = {};
        attSnap.forEach(d => attMap[d.data().staff_id] = d.data());
        
        const results = usersSnap.docs.map(u => {
            const att = attMap[u.id] || {};
            return {
                staffId: u.id, name: u.data().name, designation: u.data().role,
                ...att
            };
        });
        return res.json(results);
    }

    const rows = dbConfig.db.prepare(`
      SELECT 
        sa.staff_id as staffId, u.name, COALESCE(sd.designation, u.role) as designation, 
        sa.check_in_time, sa.distance_meters, sa.status
      FROM users u
      LEFT JOIN staff_attendance sa ON u.id = sa.staff_id AND sa.date = date('now', 'localtime')
      LEFT JOIN staff sd ON u.id = sd.user_id
      WHERE u.role IN ('staff', 'hod')
      ORDER BY u.name
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching today attendance.' });
  }
});

// GET /api/staff-attendance/history
router.get('/history', authMiddleware(['admin', 'hod']), async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];
  try {
    if (dbConfig.isProduction) {
        const usersSnap = await firestore.collection('users').where('role', 'in', ['staff', 'hod']).get();
        const attSnap = await firestore.collection('staff_attendance').where('date', '==', targetDate).get();
        
        const attMap = {};
        attSnap.forEach(d => attMap[d.data().staff_id] = d.data());
        
        const results = usersSnap.docs.map(u => {
            const att = attMap[u.id] || {};
            return {
                staffId: u.id, name: u.data().name, designation: u.data().role,
                ...att
            };
        });
        return res.json(results);
    }

    const rows = dbConfig.db.prepare(`
      SELECT 
        sa.staff_id as staffId, u.name, COALESCE(sd.designation, u.role) as designation, 
        sa.check_in_time, sa.distance_meters, sa.status
      FROM users u
      LEFT JOIN staff_attendance sa ON u.id = sa.staff_id AND sa.date = ?
      LEFT JOIN staff sd ON u.id = sd.user_id
      WHERE u.role IN ('staff', 'hod')
      ORDER BY u.name
    `).all(targetDate);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching history.' });
  }
});

module.exports = router;

