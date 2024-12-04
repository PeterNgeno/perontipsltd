const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    const serviceAccount = require('./service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase initialized successfully.');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

const db = admin.firestore(); // Initialize Firestore database

// Function to log a quiz attempt to Firestore
async function logQuizAttempt(userId, section, score, passed) {
  try {
    const quizAttemptRef = db.collection('quiz_attempts').doc(); // Create a new document for each attempt
    await quizAttemptRef.set({
      user_id: userId,
      section: section,
      score: score,
      attempt_date: admin.firestore.FieldValue.serverTimestamp(),
      passed: passed,
    });

    // Update the analytics for the section
    await updateAnalytics(section, passed);
    console.log('Quiz attempt logged successfully.');
  } catch (error) {
    console.error('Error logging quiz attempt:', error);
  }
}

// Function to update the analytics after each quiz attempt
async function updateAnalytics(section, passed) {
  const analyticsRef = db.collection('analytics').doc(section); // Find the analytics document for the specific section

  try {
    const doc = await analyticsRef.get();
    if (doc.exists) {
      // If document exists, update it
      const data = doc.data();
      const totalAttempts = data.total_attempts + 1;
      const totalPasses = passed ? data.total_passes + 1 : data.total_passes;
      const totalFailures = !passed ? data.total_failures + 1 : data.total_failures;

      await analyticsRef.update({
        total_attempts: totalAttempts,
        total_passes: totalPasses,
        total_failures: totalFailures,
        last_updated: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // If document doesn't exist, create it
      await analyticsRef.set({
        section: section,
        total_attempts: 1,
        total_passes: passed ? 1 : 0,
        total_failures: !passed ? 1 : 0,
        last_updated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log('Analytics updated successfully.');
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
}

module.exports = {
  logQuizAttempt,
  updateAnalytics,
};
