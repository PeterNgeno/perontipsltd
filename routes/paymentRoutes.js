module.exports = (db, mpesa) => ({
  processPayment: async (userId, amount) => {
    try {
      // Process payment via Mpesa
      const result = await mpesa.stkPush(userId, amount);

      // Insert payment record into Firestore
      const paymentData = {
        userId,
        amount,
        status: result.status,
        paymentDate: new Date().toISOString(),
      };

      await db.collection('payments').add(paymentData);
      return { success: true, result };
    } catch (err) {
      console.error('Error processing payment:', err.message);
      return { success: false, error: err.message };
    }
  },
});
