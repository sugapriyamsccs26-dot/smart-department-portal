const firebase = require('./backend/config/firebaseNode');
console.log('Firebase Configured:', firebase.isFirebaseConfigured);
if (!firebase.isFirebaseConfigured) {
  console.log('Error:', firebase.lastError);
} else {
  console.log('Debug Info:', firebase.debugKeyInfo);
}
