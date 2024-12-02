const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
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

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PeronTipsLimited API' });
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
