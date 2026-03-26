require('dotenv').config();

// Detect production mode from environments (Render/Vercel)
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER || !!process.env.VERCEL;

let dbConfig = {
  isProduction: isProduction,
  db: null
};

try {
  // Always load the local SQLITE database for local/admin operations
  const db = require('../db');
  dbConfig.db = db;
  console.log(`--- DATABASE INIT: ${isProduction ? 'CLOUD MODE (Mirroring to Firebase)' : 'LOCAL MODE (SQLite Only)'} ✅ ---`);
} catch (e) {
  console.error('❌ SQLITE LOAD ERROR:', e.message);
}

module.exports = dbConfig;

