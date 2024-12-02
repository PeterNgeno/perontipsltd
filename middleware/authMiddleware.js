// middleware/authMiddleware.js

const { db } = require('../firebase');  // Import Firebase Firestore instance
const admin = require('firebase-admin'); // Import Firebase Admin SDK

// Middleware to check if the user is an admin
async function isAdmin(req, res, next) {
  try {
    // Ensure the token is provided in the Authorization header
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).send('Unauthorized');
    }

    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Fetch the user from Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    // If user doesn't exist, return an error
    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    const user = userDoc.data();

    // Check if the user has the role of admin
    if (user && user.role === 'admin') {
      req.user = { id: userId, role: user.role };  // Add user data to the request
      return next();
    } else {
      return res.status(403).send('Forbidden');
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).send('Internal Server Error');
  }
}

module.exports = isAdmin;
