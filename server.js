const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const { logAnalyticsData } = require('./analytics');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Firebase Initialization
const serviceAccount = require('./service-account.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://perontipsltd-default-rtdb.firebaseio.com',
  });
}

const db = admin.firestore();

// Import Routes
const productRoutes = require('./routes/productRoutes')(db);
const quizRoutes = require('./routes/quizRoutes')(db);
const bettingRoutes = require('./routes/bettingRoutes')(db);
const paymentRoutes = require('./routes/paymentRoutes')(db);

// Use Routes
app.use('/api/products', productRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/betting', bettingRoutes);
app.use('/api/payments', paymentRoutes);

// Analytics Logging Middleware
app.use(async (req, res, next) => {
  const path = req.path;
  await logAnalyticsData(path);
  next();
});

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PeronTipsLimited API' });
});

// Example Route to Log Quiz Attempts
app.post('/api/quiz/attempt', async (req, res) => {
  const { userId, section, score, passed } = req.body;
  await logAnalyticsData(section, userId, section, score, passed);
  res.json({ message: 'Quiz attempt logged successfully', score });
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
