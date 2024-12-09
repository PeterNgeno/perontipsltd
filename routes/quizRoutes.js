const express = require('express');

module.exports = (db, quizController, paymentController, authMiddleware) => {
  const router = express.Router();

  // Fetch Quiz
  router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized access' });

    try {
      const quiz = await quizController.getQuizPage(userId);
      if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
      res.status(200).json(quiz);
    } catch (error) {
      console.error('Error fetching quiz:', error.message);
      res.status(500).json({ error: 'Error fetching quiz' });
    }
  });

  // Submit Quiz
  router.post('/submit', authMiddleware, async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized access' });

    try {
      const result = await quizController.submitQuiz(userId, req.body.answers);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error submitting quiz:', error.message);
      res.status(500).json({ error: 'Error submitting quiz' });
    }
  });

  // Make Payment
  router.post('/pay', authMiddleware, async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized access' });

    try {
      const paymentResult = await paymentController.processPayment(userId, 20);
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

  return router;
};
