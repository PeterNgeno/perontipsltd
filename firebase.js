const admin = require('firebase-admin');

// Load the Firebase service account key
const serviceAccount = require('./service-account.json'); // Ensure this path is correct

// Initialize Firebase Admin SDK only if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://perontipsltd-default-rtdb.firebaseio.com',
  });
}

// Initialize Firestore
const db = admin.firestore();

// Export Firebase Admin and Firestore instance
module.exports = { admin, db };
