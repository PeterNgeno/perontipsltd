const db = require('../db'); // Firebase Firestore instance
const mpesa = require('../models/Payment'); // Assuming you have a helper for Mpesa STK push

// Process payment
exports.processPayment = async (req, res) => {
  const { userId, amount, section } = req.body;

  try {
    // Process payment via Mpesa
    const result = await mpesa.stkPush(userId, amount); // Assuming stkPush returns a promise

    // Payment record to save in Firestore
    const paymentRecord = {
      userId,
      amount,
      section,
      status: result.status || 'Pending',
      paymentDate: new Date().toISOString(),
    };

    // Save payment record in Firestore
    await db.collection('payments').add(paymentRecord);

    // Return success response
    res.json({ success: true, message: 'Payment successful!' });
  } catch (err) {
    console.error('Payment processing failed:', err);
    res.status(500).json({ error: 'Payment failed' });
  }
};
