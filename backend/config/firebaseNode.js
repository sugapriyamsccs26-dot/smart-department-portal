const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let initialized = false;

try {
  if (!admin.apps.length) {
    let credential;

    // Option 1: Environment variable (for Render / cloud deployment)
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('Firebase Admin: using env variable credentials ✅');
    } else {
      // Option 2: Local JSON file (for local development)
      const serviceAccountPath = path.join(__dirname, 'nexusportal-service-key.json');
      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
        console.log('Firebase Admin: using local JSON key ✅');
      } else {
        throw new Error('No Firebase credentials found!');
      }
    }

    if (serviceAccount && serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    credential = admin.credential.cert(serviceAccount);


    admin.initializeApp({
      credential,
      storageBucket: 'nexusportal-c49b0.firebasestorage.app'
    });

    initialized = true;
    console.log('Firebase Admin successfully initialized!');
  } else {
    initialized = true;
  }
} catch (error) {
  console.error('Firebase Admin Setup Error:', error.message);
}

if (initialized) {
  const db = admin.firestore();
  const auth = admin.auth();
  const storage = admin.storage();
  module.exports = { admin, db, auth, storage, isFirebaseConfigured: true };
} else {
  module.exports = { isFirebaseConfigured: false, db: null, auth: null, storage: null };
}
