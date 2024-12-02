const { db } = require('../firebase');  // Import Firebase Firestore instance

module.exports = {
  // Function to add a quiz question to Firestore
  addQuiz: (quiz) => {
    return new Promise(async (resolve, reject) => {
      try {
        const quizRef = db.collection('quizzes').doc();  // Create a new document with auto-generated ID
        const quizData = {
          question: quiz.question,
          options: quiz.options,  // Store options as an array directly
          answer: quiz.answer,
        };

        await quizRef.set(quizData);  // Insert quiz data to Firestore

        resolve({
          id: quizRef.id,  // Return the Firestore document ID
          ...quizData,
        });
      } catch (err) {
        reject(err);  // Reject if there's an error during insertion
      }
    });
  },

  // Function to get all quiz questions from Firestore
  getQuizzes: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const snapshot = await db.collection('quizzes').get();  // Get all quiz documents
        const quizzes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        resolve(quizzes);  // Return all quizzes
      } catch (err) {
        reject(err);  // Reject if there's an error fetching the quizzes
      }
    });
  },

  // Function to get a specific quiz by ID from Firestore
  getQuizById: (quizId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const quizDoc = await db.collection('quizzes').doc(quizId).get();

        if (!quizDoc.exists) {
          reject('Quiz not found');
        } else {
          resolve({ id: quizDoc.id, ...quizDoc.data() });  // Return the specific quiz
        }
      } catch (err) {
        reject(err);  // Reject if there's an error fetching the quiz
      }
    });
  },

  // Function to update an existing quiz in Firestore
  updateQuiz: (quizId, updatedQuiz) => {
    return new Promise(async (resolve, reject) => {
      try {
        const quizRef = db.collection('quizzes').doc(quizId);

        const quizDoc = await quizRef.get();
        if (!quizDoc.exists) {
          reject('Quiz not found');
        } else {
          await quizRef.update(updatedQuiz);  // Update the quiz with new data
          resolve({
            id: quizId,
            ...updatedQuiz,
          });
        }
      } catch (err) {
        reject(err);  // Reject if there's an error updating the quiz
      }
    });
  },

  // Function to delete a quiz by ID from Firestore
  deleteQuiz: (quizId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const quizRef = db.collection('quizzes').doc(quizId);

        const quizDoc = await quizRef.get();
        if (!quizDoc.exists) {
          reject('Quiz not found');
        } else {
          await quizRef.delete();  // Delete the quiz document
          resolve({ message: 'Quiz deleted successfully' });
        }
      } catch (err) {
        reject(err);  // Reject if there's an error deleting the quiz
      }
    });
  },
};
