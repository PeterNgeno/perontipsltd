const db = require('../db'); // SQLite database connection

// Render the betting page
exports.getBettingPage = (req, res) => {
  res.render('betting'); // Render the betting page
};

// Get Betting Predictions
exports.getBettingPredictions = (req, res) => {
  const { userId } = req.query;

  // Validate the userId
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Query to check if the user has made a payment for betting predictions
    const query = 'SELECT * FROM payments WHERE userId = ? AND section = "betting"';
    db.get(query, [userId], (err, payment) => {
      if (err) {
        console.error('Error checking payment status:', err);
        return res.status(500).json({ error: 'Error processing request' });
      }

      if (!payment) {
        return res.status(403).json({ error: 'Please pay to view predictions.' });
      } else {
        // If payment found, render predictions
        res.render('betting-predictions', {
          predictions: [
            // Mock predictions data (replace with actual data as needed)
            { match: 'Team A vs Team B', prediction: 'Team A Wins' },
            { match: 'Team C vs Team D', prediction: 'Over 2.5 Goals' },
            // Add more predictions as needed
          ],
        });
      }
    });
  } catch (err) {
    console.error('Error fetching payment status or predictions:', err);
    res.status(500).json({ error: 'Error processing request' });
  }
};
