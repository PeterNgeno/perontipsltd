const express = require('express');
const router = express.Router();
const { db } = require('../firebase');  // Import Firebase Firestore instance

// Route to get all quiz questions
router.get('/', async (req, res) => {
  try {
    // Fetch all quizzes from Firestore
    const snapshot = await db.collection('quizzes').get();  // Get all quiz documents
    const quizzes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ message: 'Quiz page is working!', quizzes });
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Route to submit quiz answers and calculate score
router.post('/submit', async (req, res) => {
  const userAnswers = req.body.answers; // Assuming the answers are sent in the body
  let score = 0;

  try {
    // Fetch all quizzes from Firestore
    const snapshot = await db.collection('quizzes').get();
    const quizzes = snapshot.docs.map(doc => doc.data());

    // Compare user answers with the correct answers
    quizzes.forEach((question, index) => {
      if (userAnswers[index] === question.answer) {
        score++;
      }
    });

    res.json({ message: 'Quiz submitted successfully', score });
  } catch (err) {
    console.error('Error fetching quizzes for score calculation:', err);
    res.status(500).json({ error: 'Failed to calculate score' });
  }
});

module.exports = router;
