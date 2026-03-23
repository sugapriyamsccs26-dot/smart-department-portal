const admin = require('firebase-admin');
const serviceAccount = require('./backend/config/nexusportal-service-key.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const db = admin.firestore();
  console.log('--- Initialized ---');
  
  db.collection('test_connectivity').doc('ping').set({ timestamp: new Date().toISOString() })
    .then(() => {
        console.log('--- SUCCESS: Write worked ---');
        process.exit(0);
    })
    .catch(err => {
        console.error('--- FAILURE: Write failed ---');
        console.error(err);
        process.exit(1);
    });
} catch (err) {
  console.error('--- CRITICAL: Initialization failed ---');
  console.error(err);
  process.exit(1);
}
