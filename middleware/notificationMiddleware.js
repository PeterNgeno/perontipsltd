// middleware/notificationLogger.js

const admin = require('firebase-admin'); // Import Firebase Admin SDK

// Firestore initialization (Ensure Firebase Admin SDK is already initialized)
const db = admin.firestore(); 

// Middleware to log a notification for a user (e.g., when they log in)
module.exports = async (req, res, next) => {
  if (req.user) { // If user is logged in
    try {
      // Create a new notification in Firestore
      const notificationRef = db.collection('notifications').doc();
      
      // Add notification data to Firestore
      await notificationRef.set({
        userId: req.user.id, // Assuming req.user contains the user data
        message: 'New login event.',
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('Error logging notification:', err);
    }
  }
  next();
};
