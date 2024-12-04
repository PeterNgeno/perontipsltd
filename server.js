const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const { logQuizAttempt } = require('./middleware/analytics');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming requests with JSON payloads

// Firebase Initialization
try {
  const serviceAccount = require('./service-account.json');
  // If Firebase has already been initialized, use a unique app name
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://perontipsltd-default-rtdb.firebaseio.com',
    });
  } else {
    // Optional: you can initialize multiple apps with unique names if needed
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://perontipsltd-default-rtdb.firebaseio.com',
    }, 'app2');  // Initialize as a second app with a unique name ('app2')
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  process.exit(1); // Exit the application if Firebase cannot initialize
}

const db = admin.firestore();

// Import Routes
const productRoutes = require('./routes/productRoutes');
const quizRoutes = require('./routes/quizRoutes');
const bettingRoutes = require('./routes/bettingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Use Routes
app.use('/api/products', productRoutes(db));
app.use('/api/quiz', quizRoutes(db));
app.use('/api/betting', bettingRoutes(db));
app.use('/api/payments', paymentRoutes(db));

// Analytics Logging Middleware
app.use(async (req, res, next) => {
  try {
    const path = req.path;
    await logQuizAttempt(path); // Correcting this to use the appropriate logging function
    next();
  } catch (error) {
    console.error('Error logging analytics data:', error);
    next(); // Continue to the next middleware even if logging fails
  }
});

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PeronTipsLimited API' });
});

// Example Route to Log Quiz Attempts
app.post('/api/quiz/attempt', async (req, res) => {
  try {
    const { userId, section, score, passed } = req.body;
    await logQuizAttempt(userId, section, score, passed); // Correctly logging quiz attempt
    res.json({ message: 'Quiz attempt logged successfully', score });
  } catch (error) {
    console.error('Error logging quiz attempt:', error);
    res.status(500).json({ error: 'Failed to log quiz attempt' });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
