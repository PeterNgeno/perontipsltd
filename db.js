const admin = require('firebase-admin');

// Firestore Reference
const db = admin.firestore();

const Notification = {
  // Create a new notification
  create: async (message, user_id) => {
    try {
      const notification = {
        message,
        user_id,
        is_read: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      };
      const docRef = await db.collection('notifications').add(notification);
      return { id: docRef.id, ...notification };
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  },

  // Get all notifications for a user
  findByUserId: async (user_id) => {
    try {
      const snapshot = await db
        .collection('notifications')
        .where('user_id', '==', user_id)
        .orderBy('created_at', 'desc')
        .get();
      if (snapshot.empty) {
        return [];
      }
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return notifications;
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  },

  // Mark a notification as read
  markAsRead: async (id) => {
    try {
      const notificationRef = db.collection('notifications').doc(id);
      await notificationRef.update({ is_read: true });
      return { id, is_read: true };
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  },

  // Delete a notification
  delete: async (id) => {
    try {
      await db.collection('notifications').doc(id).delete();
      return { id };
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  },
};

module.exports = Notification;
