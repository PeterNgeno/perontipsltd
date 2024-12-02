const express = require('express');
const router = express.Router();
const { db } = require('../firebase'); // Firebase Firestore instance
const isAdmin = require('../middleware/authMiddleware'); // Middleware to allow only admins

// Route to get quiz data for a section (A to J)
router.get('/admin/quiz', isAdmin, async (req, res) => {
  const section = req.query.section; // Get the section from query params (A to J)

  if (!section) {
    return res.status(400).json({ error: 'Section is required' });
  }

  try {
    // Fetch quiz data for the section from Firestore
    const quizDoc = await db.collection('quizzes').doc(section).get();

    if (!quizDoc.exists) {
      return res.json({ questions: [] });
    }

    const quiz = quizDoc.data();
    res.json({ section: quiz.section, questions: quiz.questions });
  } catch (error) {
    console.error('Error fetching quiz data:', error);
    res.status(500).json({ error: 'Error fetching quiz data' });
  }
});

// Route to update quiz data for a section (A to J)
router.post('/admin/quiz', isAdmin, async (req, res) => {
  const { section, questions } = req.body; // Get section and questions from request body

  if (!section || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    // Update or create quiz data for the section in Firestore
    await db.collection('quizzes').doc(section).set({
      section,
      questions,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).send('Quiz updated successfully');
  } catch (error) {
    console.error('Error updating quiz data:', error);
    res.status(500).json({ error: 'Error updating quiz' });
  }
});

module.exports = router;
