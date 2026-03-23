require('dotenv').config();

// Detect production mode from environments
const isProduction = process.env.NODE_ENV === 'production';

let dbConfig = {
  isProduction: isProduction,
  db: null
};

try {
  // Always try to load the local SQLITE database (works in render /tmp too)
  const db = require('../db');
  dbConfig.db = db;
  console.log(`--- DATABASE MODE: ${isProduction ? 'PRODUCTION' : 'LOCAL'} SQLITE SUCCESS ✅ ---`);
} catch (e) {
  console.error('❌ SQLITE LOAD ERROR:', e.message);
}

module.exports = dbConfig;

