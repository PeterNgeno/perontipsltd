const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db'); // Firebase Firestore instance
const router = express.Router();

// Handle POST request to sign up a new user
router.post('/signup', async (req, res) => {
  const { firstName, secondName, phone, email, password } = req.body;

  // Validate input data
  if (!firstName || !secondName || !phone || !email || !password) {
    return res.status(400).send('Please fill in all fields');
  }

  try {
    // Check if user already exists by email
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!userSnapshot.empty) {
      return res.status(400).send('Email is already registered');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add new user to Firestore
    const newUser = {
      firstName,
      secondName,
      phone,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await db.collection('users').add(newUser);

    // Send success response
    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('Error during user signup:', err);
    res.status(500).send('Error signing up. Please try again later.');
  }
});

module.exports = router;
