const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { db } = require('./firebase'); // Import Firebase Firestore instance

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html (Landing page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Quiz Routes (For Admin and User)
app.get('/admin/quiz', async (req, res) => {
  const section = req.query.section;
  
  try {
    // Fetch the quiz questions from Firestore based on the section
    const quizSnapshot = await db.collection('quizzes').where('section', '==', section).get();
    
    if (quizSnapshot.empty) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const questions = quizSnapshot.docs.map(doc => doc.data());
    
    res.json({
      section,
      questions: questions.map(q => ({
        question: q.question,
        options: [q.option1, q.option2, q.option3],
        correctAnswer: q.correctAnswer
      }))
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching questions' });
  }
});

app.post('/admin/quiz', async (req, res) => {
  const { section, questions } = req.body;

  try {
    const batch = db.batch();
    questions.forEach(q => {
      const newQuizRef = db.collection('quizzes').doc();  // Create a new document for each question
      batch.set(newQuizRef, {
        section,
        question: q.question,
        option1: q.options[0],
        option2: q.options[1],
        option3: q.options[2],
        correctAnswer: q.correctAnswer
      });
    });

    // Commit the batch write to Firestore
    await batch.commit();
    res.send('Questions updated successfully');
  } catch (err) {
    return res.status(500).json({ message: 'Error saving questions' });
  }
});

// User Submit Answers
app.post('/user/quiz/submit', async (req, res) => {
  const { answers } = req.body;
  
  try {
    // Fetch quiz answers from Firestore
    const quizSnapshot = await db.collection('quizzes').where('section', '==', 'A').get();
    
    if (quizSnapshot.empty) {
      return res.status(500).json({ message: 'Error fetching answers' });
    }

    const correctAnswers = quizSnapshot.docs.map(doc => doc.data().correctAnswer);
    let score = 0;

    answers.forEach((answer, index) => {
      if (answer === correctAnswers[index]) {
        score++;
      }
    });

    // Score and decision based on the score
    if (score === 10) {
      // Automatically proceed to payment if 100% score
      res.json({ success: true, message: 'You scored 100%! Please proceed to the payment page.' });
    } else {
      res.json({ success: false, message: `You scored ${score} out of 10. Please try again.` });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Error processing quiz submission' });
  }
});

// Payment Routes
app.get('/payment', (req, res) => {
  // Logic to handle payment for quiz sections
  res.send('Payment Page');
});

// Serve the shop page
app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

// Product Search functionality (for shop page)
app.get('/products', async (req, res) => {
  const searchQuery = req.query.search || '';
  const query = db.collection('products').where('name', '>=', searchQuery).where('name', '<=', searchQuery + '\uf8ff');
  
  try {
    const snapshot = await query.get();
    const products = snapshot.docs.map(doc => doc.data());
    res.json(products);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching products' });
  }
});

// Admin Routes for Managing Products
app.post('/admin/product', async (req, res) => {
  const { name, price, description, imageUrl } = req.body;

  try {
    const newProductRef = db.collection('products').doc();  // Create a new document for the product
    await newProductRef.set({
      name,
      price,
      description,
      imageUrl
    });
    res.send('Product added successfully');
  } catch (err) {
    return res.status(500).json({ message: 'Error adding product' });
  }
});

app.put('/admin/product', async (req, res) => {
  const { id, name, price, description, imageUrl } = req.body;

  try {
    const productRef = db.collection('products').doc(id);
    await productRef.update({
      name,
      price,
      description,
      imageUrl
    });
    res.send('Product updated successfully');
  } catch (err) {
    return res.status(500).json({ message: 'Error updating product' });
  }
});

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
