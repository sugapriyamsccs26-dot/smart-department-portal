const bcrypt = require('../backend/node_modules/bcryptjs');
const db = require('../backend/db.js');

// Test student login
const u = db.prepare("SELECT user_id, role, password_hash FROM users WHERE user_id = '24MCA01'").get();
if (u) {
  console.log('✅ User found:', u.user_id, '| Role:', u.role);
  const match = bcrypt.compareSync('Student@1234', u.password_hash);
  console.log('Password match (Student@1234):', match ? '✅ YES' : '❌ NO');
} else {
  console.log('❌ User 24MCA01 NOT found in DB!');
}

// Test staff login
const s = db.prepare("SELECT user_id, role, password_hash FROM users WHERE user_id = 'BDU1660758'").get();
if (s) {
  console.log('✅ Staff found:', s.user_id, '| Role:', s.role);
  const match = bcrypt.compareSync('Staff@1234', s.password_hash);
  console.log('Password match (Staff@1234):', match ? '✅ YES' : '❌ NO');
} else {
  console.log('❌ Staff BDU1660758 NOT found!');
}

// Test admin
const a = db.prepare("SELECT user_id, role, password_hash FROM users WHERE user_id = 'BDU1670884'").get();
if (a) {
  console.log('✅ Admin found:', a.user_id, '| Role:', a.role);
  const match = bcrypt.compareSync('Admin@1234', a.password_hash);
  console.log('Password match (Admin@1234):', match ? '✅ YES' : '❌ NO');
} else {
  console.log('❌ Admin NOT found!');
}

db.close();
