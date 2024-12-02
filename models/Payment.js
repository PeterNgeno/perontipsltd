const { db } = require('../firebase');  // Import Firebase Firestore instance

// Function to create a payment record
function createPayment(userId, amount, paymentMethod, status) {
  return new Promise(async (resolve, reject) => {
    try {
      const paymentRef = db.collection('payments').doc();  // Create a new document
      const paymentData = {
        userId,
        amount,
        paymentMethod,
        status,
        paymentDate: new Date().toISOString(),  // Store payment date as ISO string
      };

      await paymentRef.set(paymentData);  // Insert payment data to Firestore

      resolve({
        id: paymentRef.id,  // Return the Firestore document ID
        ...paymentData,
      });
    } catch (err) {
      reject(err);  // Reject if there's an error during insertion
    }
  });
}

// Function to get a payment record by ID
function getPaymentById(paymentId) {
  return new Promise(async (resolve, reject) => {
    try {
      const paymentDoc = await db.collection('payments').doc(paymentId).get();

      if (!paymentDoc.exists) {
        reject('Payment record not found');
      } else {
        resolve(paymentDoc.data());  // Return the payment data
      }
    } catch (err) {
      reject(err);  // Reject if there's an error fetching the payment
    }
  });
}

// Initialize the payments collection (Note: Firestore doesn't require creating tables)
function createPaymentTable() {
  // Firestore doesn't require creating tables, so this function isn't necessary anymore
  // Firestore automatically creates collections and documents as needed
  console.log("Firestore 'payments' collection is ready.");
}

module.exports = {
  createPayment,
  getPaymentById,
  createPaymentTable,  // This can be removed, as Firestore is schema-less
};
