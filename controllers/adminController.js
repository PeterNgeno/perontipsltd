const db = require('../db'); // Firebase Firestore instance

// Update Quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { quizId, question, answer } = req.body;

    // Ensure required fields are provided
    if (!quizId || !question || !answer) {
      return res.status(400).json({ message: 'Quiz ID, question, and answer are required.' });
    }

    const quizRef = db.collection('quizzes').doc(quizId);

    // Check if the quiz exists
    const quizDoc = await quizRef.get();
    if (!quizDoc.exists) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    // Update the quiz
    await quizRef.update({ question, answer });
    res.json({ message: 'Quiz updated successfully.' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ message: 'Failed to update quiz.' });
  }
};

// Update Betting Prediction
exports.updateBettingPrediction = async (req, res) => {
  try {
    const { predictionId, prediction, odds } = req.body;

    // Ensure required fields are provided
    if (!predictionId || !prediction || !odds) {
      return res.status(400).json({ message: 'Prediction ID, prediction, and odds are required.' });
    }

    const predictionRef = db.collection('betting_predictions').doc(predictionId);

    // Check if the betting prediction exists
    const predictionDoc = await predictionRef.get();
    if (!predictionDoc.exists) {
      return res.status(404).json({ message: 'Betting prediction not found.' });
    }

    // Update the betting prediction
    await predictionRef.update({ prediction, odds });
    res.json({ message: 'Betting prediction updated successfully.' });
  } catch (error) {
    console.error('Error updating betting prediction:', error);
    res.status(500).json({ message: 'Failed to update betting prediction.' });
  }
};

// Update Product (for shop)
exports.updateProduct = async (req, res) => {
  try {
    const { productId, name, price, imageUrl } = req.body;

    // Ensure required fields are provided
    if (!productId || !name || !price) {
      return res.status(400).json({ message: 'Product ID, name, and price are required.' });
    }

    const productRef = db.collection('products').doc(productId);

    // Check if the product exists
    const productDoc = await productRef.get();
    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Update the product
    await productRef.update({ name, price, imageUrl });
    res.json({ message: 'Product updated successfully.' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product.' });
  }
};
