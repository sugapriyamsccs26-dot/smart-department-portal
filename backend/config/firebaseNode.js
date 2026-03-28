const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let initialized = false;
let lastError = null; // Added to capture initialization errors

try {
  if (!admin.apps.length) {
    let rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT;
    let serviceAccount;

    if (rawCredentials) {
      if (rawCredentials.trim().startsWith('{')) {
        try {
          serviceAccount = JSON.parse(rawCredentials);
          console.log('Firebase: Parsed JSON credentials ✅');
        } catch (e) {
          lastError = 'JSON Parse Error: ' + e.message;
        }
      } else {
        // Fallback: assume it's the raw private key string
        console.log('Firebase: Working with raw key string 🔑');
        serviceAccount = {
          privateKey: rawCredentials,
          clientEmail: 'firebase-adminsdk-v9v8j@nexusportal-c49b0.iam.gserviceaccount.com', // fallback from nexusportal
          projectId: 'nexusportal-c49b0'
        };
      }
    }

    if (!serviceAccount) {
      const serviceAccountPath = path.join(__dirname, 'nexusportal-service-key.json');
      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
      }
    }

    if (serviceAccount && (serviceAccount.privateKey || serviceAccount.private_key)) {
      const pKey = serviceAccount.privateKey || serviceAccount.private_key;
      const cleanKey = pKey.replace(/\\n/g, '\n');
      
      // Ensure PEM format
      if (!cleanKey.includes('BEGIN PRIVATE KEY')) {
        const base64 = cleanKey.replace(/\n/g, '').replace(/\s/g, '');
        serviceAccount.privateKey = `-----BEGIN PRIVATE KEY-----\n${base64.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----\n`;
      } else {
        serviceAccount.privateKey = cleanKey;
      }
      
      // Map keys correctly for SDK
      serviceAccount.private_key = serviceAccount.privateKey;
      serviceAccount.client_email = serviceAccount.clientEmail || serviceAccount.client_email;
      serviceAccount.project_id = serviceAccount.projectId || serviceAccount.project_id;

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'nexusportal-c49b0.firebasestorage.app'
      });
      initialized = true;
    } else {
      lastError = lastError || 'No credentials found in ENV or File';
      initialized = false;
    }
  } else {
    initialized = true;
  }
} catch (error) {
  lastError = error.message;
  initialized = false;
}

const finalDebugInfo = (typeof process.env.FIREBASE_SERVICE_ACCOUNT !== 'undefined')
  ? `EnvLen: ${process.env.FIREBASE_SERVICE_ACCOUNT.length}, JSON: ${process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith('{')}`
  : 'Env Var missing';

if (initialized) {
  module.exports = { 
    admin, db: admin.firestore(), auth: admin.auth(), storage: admin.storage(), 
    isFirebaseConfigured: true, lastError: null, debugKeyInfo: finalDebugInfo 
  };
} else {
  module.exports = { 
    isFirebaseConfigured: false, db: null, auth: null, storage: null, 
    lastError, debugKeyInfo: finalDebugInfo 
  };
}
