const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let initialized = false;
let lastError = null; // Added to capture initialization errors

try {
  if (!admin.apps.length) {
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('Firebase Admin: using env variable credentials ✅');
      } catch (e) {
        lastError = 'JSON Parse Error: ' + e.message;
        throw new Error(lastError);
      }
    } else {
      const serviceAccountPath = path.join(__dirname, 'nexusportal-service-key.json');
      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
        console.log('Firebase Admin: using local JSON key ✅');
      } else {
        lastError = 'Credentials missing (neither ENV nor File found)';
        throw new Error(lastError);
      }
    }

    if (serviceAccount && serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'nexusportal-c49b0.firebasestorage.app'
    });

    initialized = true;
    console.log('Firebase Admin successfully initialized! ✅');
  } else {
    initialized = true;
  }
} catch (error) {
  console.error('❌ Firebase Admin Setup Error:', error.message);
  lastError = error.message;
  initialized = false;
}

if (initialized) {
  const db = admin.firestore();
  const auth = admin.auth();
  const storage = admin.storage();
  const debugKeyInfo = (serviceAccount && serviceAccount.private_key) 
    ? `Length: ${serviceAccount.private_key.length}, Type: ${typeof serviceAccount.private_key}, Format: ${serviceAccount.private_key.includes('BEGIN PRIVATE KEY') ? 'PEM' : 'RAW'}`
    : 'Key missing';
  module.exports = { admin, db, auth, storage, isFirebaseConfigured: true, lastError: null, debugKeyInfo };
} else {
  module.exports = { isFirebaseConfigured: false, db: null, auth: null, storage: null, lastError, debugKeyInfo: 'Key init failed' };
}
