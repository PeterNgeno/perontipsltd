const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const { logAnalyticsData } = require('./analytics');  // Import the analytics logger
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Initialize Firebase
const serviceAccount = require('./firebase-service-account.json'); // Your Firebase Admin SDK key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<your-database-name>.firebaseio.com', // Replace with your Firebase database URL
});

const db = admin.firestore();

// Import Routes
const productRoutes = require('./routes/productRoutes')(db); // Pass Firestore db
const quizRoutes = require('./routes/quizRoutes')(db);       // Pass Firestore db
const bettingRoutes = require('./routes/bettingRoutes')(db); // Pass Firestore db
const paymentRoutes = require('./routes/paymentRoutes')(db); // Pass Firestore db

// Use Routes
app.use('/api/products', productRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/betting', bettingRoutes);
app.use('/api/payments', paymentRoutes);

// Analytics Logging Middleware (for page views or other actions)
app.use(async (req, res, next) => {
  const path = req.path;
  // Log page view or any other relevant analytics
  await logAnalyticsData(path);

  next();  // Proceed to the next middleware or route
});

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PeronTipsLimited API' });
});

// Example route to log quiz attempts
app.post('/api/quiz/attempt', async (req, res) => {
  const { userId, section, score, passed } = req.body;

  // Log quiz attempt to Firestore and analytics
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
