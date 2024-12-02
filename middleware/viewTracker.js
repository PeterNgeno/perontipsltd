// middleware/visitorStats.js

const admin = require('firebase-admin'); // Import Firebase Admin SDK

// Firestore initialization
const db = admin.firestore(); // Access Firestore database

module.exports = async (req, res, next) => {
  try {
    // Insert a new visitor stat record
    const statsRef = db.collection('visitorStats').doc(); // Create a new document in Firestore

    await statsRef.set({
      path: req.path, // The path of the visited page
      visitedAt: new Date(), // Timestamp when the visit happened
    });

    console.log('Visitor stats logged successfully.');
  } catch (err) {
    console.error('Error logging visitor stats:', err.message);
  }
  
  next(); // Proceed to the next middleware or route handler
};
