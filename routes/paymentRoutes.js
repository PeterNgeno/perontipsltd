const { db } = require('../firebase'); // Firebase Firestore instance
const mpesa = require('../models/Payment'); // Assuming you have a helper for Mpesa STK push

// Process payment
exports.processPayment = async (req, res) => {
  const { userId, amount, section } = req.body;

  try {
    // Process payment via Mpesa
    const result = await mpesa.stkPush(userId, amount); // Assuming stkPush returns a promise

    // Insert payment record into Firestore
    const paymentRef = db.collection('payments').doc(); // Create a new document in 'payments' collection
    const paymentData = {
      userId,
      amount,
      section,
      status: result.status,
      paymentDate: new Date().toISOString(), // Store payment date in ISO format
    };

    await paymentRef.set(paymentData); // Save payment data to Firestore

    // Return success response
    res.json({ success: true, message: 'Payment successful!' });
  } catch (err) {
    console.error('Payment processing failed:', err);
    res.status(500).json({ error: 'Payment failed' });
  }
};
