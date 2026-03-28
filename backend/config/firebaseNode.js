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

    let debugKeyInfo = 'No key available';
    if (serviceAccount && serviceAccount.private_key) {
      const isPEM = serviceAccount.private_key.includes('BEGIN PRIVATE KEY');
      debugKeyInfo = `Length: ${serviceAccount.private_key.length}, Type: ${typeof serviceAccount.private_key}, Format: ${isPEM ? 'PEM' : 'RAW'}`;
      
      if (!isPEM) {
        // Robust reconstruction if headers are missing
        const cleanKey = serviceAccount.private_key.replace(/\\n/g, '').replace(/\n/g, '').replace(/\s/g, '');
        serviceAccount.private_key = `-----BEGIN PRIVATE KEY-----\n${cleanKey.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----\n`;
        debugKeyInfo += ` (Reconstructed to PEM)`;
      } else {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
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

const finalDebugInfo = (typeof serviceAccount !== 'undefined' && serviceAccount.private_key) 
    ? `Length: ${serviceAccount.private_key.length}, Type: ${typeof serviceAccount.private_key}, Format: ${serviceAccount.private_key.includes('BEGIN PRIVATE KEY') ? 'PEM' : 'RAW (Post-Fix)'}`
    : 'Key Missing or undefined';

if (initialized) {
  const db = admin.firestore();
  const auth = admin.auth();
  const storage = admin.storage();
  module.exports = { admin, db, auth, storage, isFirebaseConfigured: true, lastError: null, debugKeyInfo: finalDebugInfo };
} else {
  module.exports = { isFirebaseConfigured: false, db: null, auth: null, storage: null, lastError, debugKeyInfo: finalDebugInfo };
}
