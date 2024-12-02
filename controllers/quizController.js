const { db } = require('../firebase'); // Firestore instance

// Start Quiz: Fetch the section's quiz and timer duration based on payment
exports.startQuiz = async (req, res) => {
  const { section, payment } = req.body;

  try {
    const timer = getTimerDuration(payment);

    // Fetch quiz from Firestore
    const quizSnapshot = await db.collection('quizzes').where('section', '==', section).limit(1).get();

    if (quizSnapshot.empty) {
      return res.status(404).json({ error: `No quiz found for section ${section}` });
    }

    const quizData = quizSnapshot.docs[0].data();
    const questions = quizData.questions; // Assuming questions are stored as an array in Firestore

    res.json({
      message: `Starting section ${section} with ${timer} seconds`,
      quiz: questions,
      timer,
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({ error: 'Failed to start quiz' });
  }
};

// Submit Quiz: Validate answers and return the result
exports.submitQuiz = async (req, res) => {
  const { answers, section } = req.body;
  const userId = req.user.id;

  try {
    // Fetch quiz from Firestore
    const quizSnapshot = await db.collection('quizzes').where('section', '==', section).limit(1).get();

    if (quizSnapshot.empty) {
      return res.status(404).json({ error: `No quiz found for section ${section}` });
    }

    const quizData = quizSnapshot.docs[0].data();
    const score = checkAnswers(answers, quizData.questions); // Assuming questions are stored as an array

    // Fetch user data
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const updatedScore = (userData.score || 0) + score;
    const updatedSectionProgress = { ...(userData.sectionProgress || {}), [section]: score };

    // Update the user's score and progress in Firestore
    await db.collection('users').doc(userId).update({
      score: updatedScore,
      sectionProgress: updatedSectionProgress,
    });

    if (score === quizData.questions.length) {
      res.json({
        success: true,
        message: 'You passed! Proceed to the next section.',
        score,
      });
    } else {
      res.json({
        success: false,
        message: 'You failed. Please pay to retry.',
        score,
      });
    }
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

// Helper function to check answers against correct ones
function checkAnswers(submittedAnswers, correctQuestions) {
  let score = 0;

  submittedAnswers.forEach((answer, index) => {
    if (answer.toLowerCase() === correctQuestions[index].correctAnswer.toLowerCase()) {
      score++;
    }
  });

  return score;
}

// Helper function to determine timer duration based on payment
function getTimerDuration(payment) {
  switch (payment) {
    case '50':
      return 30;
    case '100':
      return 45;
    case '200':
      return 50;
    case '400':
      return 65;
    default:
      return 30;
  }
        }
