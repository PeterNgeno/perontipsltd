const express = require('express');
const router = express.Router();
const { processPayment } = require('../services/paymentService'); // Payment processing

module.exports = (db) => {
  // Route to view betting predictions (after payment of 20 Ksh)
  router.get('/betting-predictions', async (req, res) => {
    const userId = req.user?.id; // Ensure req.user exists
    if (!userId) return res.status(401).json({ error: 'Unauthorized access' });

    try {
      // Check if the user has already paid for predictions
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists || !userDoc.data().hasPaid) {
        return res.status(400).json({ error: 'Payment required to access betting predictions' });
      }

      // Fetch betting predictions
      const predictionsSnapshot = await db.collection('bettingPredictions').get();
      const predictions = predictionsSnapshot.docs.map((doc) => doc.data());

      // Format predictions into a 3-column, 21-row table
      const tableData = formatPredictionsIntoTable(predictions);
      res.status(200).json({ message: 'Betting predictions', predictions: tableData });
    } catch (error) {
      console.error('Error fetching betting predictions:', error.message);
      res.status(500).json({ error: 'Error fetching betting predictions' });
    }
  });

  // Route to handle payment for betting predictions
  router.post('/pay-for-predictions', async (req, res) => {
    const userId = req.user?.id; // Ensure req.user exists
    if (!userId) return res.status(401).json({ error: 'Unauthorized access' });

    try {
      const paymentResult = await processPayment(userId, 20); // Process payment (20 Ksh)
      if (paymentResult.success) {
        await db.collection('users').doc(userId).set({ hasPaid: true }, { merge: true });
        res.status(200).json({ message: 'Payment successful' });
      } else {
        res.status(400).json({ error: 'Payment failed' });
      }
    } catch (error) {
      console.error('Error processing payment:', error.message);
      res.status(500).json({ error: 'Payment failed' });
    }
  });

  // Helper function to format predictions into a table
  function formatPredictionsIntoTable(predictions) {
    const table = [];
    const rows = 21; // 21 rows
    const columns = 3; // 3 columns per row
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        const prediction = predictions[i * columns + j];
        row.push(prediction || 'No data'); // Default to "No data" if not enough predictions
      }
      table.push(row);
    }
    return table;
  }

  return router;
};
