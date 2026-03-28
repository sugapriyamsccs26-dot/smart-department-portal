const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let initialized = false;
let lastError = null; // Added to capture initialization errors

let serviceAccount; // Moved to higher scope

try {
  if (!admin.apps.length) {
    let raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (raw) {
      const trimmed = raw.trim();
      if (trimmed.startsWith('{')) {
        try {
          serviceAccount = JSON.parse(trimmed);
        } catch (e) {
          lastError = 'JSON Parse: ' + e.message;
        }
      }
    }

    if (!serviceAccount) {
      const p = path.join(__dirname, 'nexusportal-service-key.json');
      if (fs.existsSync(p)) {
        serviceAccount = require(p);
      }
    }

    if (serviceAccount && (serviceAccount.private_key || serviceAccount.privateKey)) {
      // THE FIX: Clean the key extremely robustly
      let pkey = serviceAccount.private_key || serviceAccount.privateKey;
      
      // 1. Convert literal \n to real newlines
      pkey = pkey.replace(/\\n/g, '\n');
      
      // 2. If it's still a single line but looks like base64, wrap it
      if (!pkey.includes('\n') || !pkey.includes('BEGIN PRIVATE KEY')) {
        const clean = pkey.replace(/-----BEGIN PRIVATE KEY-----/g, '')
                          .replace(/-----END PRIVATE KEY-----/g, '')
                          .replace(/\\n/g, '') // handle escaped newlines
                          .replace(/[\s\r\n]+/g, ''); // strip all whitespace
        
        const chunks = clean.match(/.{1,64}/g);
        if (chunks) {
           pkey = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
        } else {
           throw new Error('Private key contains no valid base64 content');
        }
      }

      // Re-map for the SDK's expectations
      const finalAccount = {
        projectId: serviceAccount.project_id || serviceAccount.projectId || 'nexusportal-c49b0',
        clientEmail: serviceAccount.client_email || serviceAccount.clientEmail || 'firebase-adminsdk-fbsvc@nexusportal-c49b0.iam.gserviceaccount.com',
        privateKey: pkey
      };

      admin.initializeApp({
        credential: admin.credential.cert(finalAccount),
        storageBucket: 'nexusportal-c49b0.firebasestorage.app'
      });
      initialized = true;
    } else {
      lastError = lastError || 'No private key found in credentials';
    }
  } else {
    initialized = true;
  }
} catch (error) {
  lastError = error.message;
  initialized = false;
}

const finalDebugInfo = (serviceAccount && (serviceAccount.private_key || serviceAccount.privateKey))
  ? `Key detected (Len: ${(serviceAccount.private_key || serviceAccount.privateKey).length}), Project: ${serviceAccount.project_id || 'nexusportal-c49b0'}`
  : `Missing Key (Env: ${process.env.FIREBASE_SERVICE_ACCOUNT ? 'Found' : 'Missing'})`;

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
