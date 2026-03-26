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
      // Simplified private key reconstruction
      const rawKey = serviceAccount.private_key.replace(/\\n/g, '\n');
      serviceAccount.private_key = rawKey;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'nexusportal-c49b0.firebasestorage.app'
    });

    initialized = true;
    console.log('Firebase Admin successfully initialized!'); // Kept this log
  } else {
    initialized = true;
  }
} catch (error) {
  console.error('❌ Firebase Admin Setup Error:', error.message);
  lastError = error.message;
  initialized = false; // Ensure initialized is false on error
}

if (initialized) {
  const db = admin.firestore();
  const auth = admin.auth(); // Kept auth
  const storage = admin.storage(); // Kept storage
  module.exports = { admin, db, auth, storage, isFirebaseConfigured: true, lastError: null }; // Export lastError as null on success
} else {
  module.exports = { isFirebaseConfigured: false, db: null, auth: null, storage: null, lastError }; // Export lastError on failure
}
