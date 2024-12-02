const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { db } = require('../firebase'); // Firestore instance

// POST route for signing up
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

    if (!userSnapshot.empty) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user in Firestore
    const newUser = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await db.collection('users').add(newUser);

    res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ error: 'Error signing up user' });
  }
});

module.exports = router;
