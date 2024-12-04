const admin = require('firebase-admin');

// Load the Firebase service account key
const serviceAccount = require('./service-account.json'); // Adjust the path if the file is in a different location

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://perontipsltd-default-rtdb.firebaseio.com', // Replace with your Firebase database URL
    });
}

// Initialize Firestore
const db = admin.firestore();

// Export the Firestore instance
module.exports = { db };
