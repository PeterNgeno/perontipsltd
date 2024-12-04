const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const { logAnalyticsData } = require('./analytics');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming requests with JSON payloads

// Firebase Initialization
try {
  const serviceAccount = require('./service-account.json');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://perontipsltd-default-rtdb.firebaseio.com',
    });
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
    await logAnalyticsData(path);
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
    await logAnalyticsData(section, userId, section, score, passed);
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
