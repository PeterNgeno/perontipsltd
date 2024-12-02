const express = require('express');
const router = express.Router();
const multer = require('multer');
const { db, admin } = require('../firebase'); // Firebase Firestore and Storage instances

// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Update existing products
router.post('/admin/update-existing-products', upload.any(), async (req, res) => {
  const updatedProducts = req.body.products || [];

  try {
    // Update each product in Firestore
    for (const product of updatedProducts) {
      const { id, name, price, description, imageUrl } = product;

      // Ensure product ID is provided
      if (!id) {
        console.warn(`Skipping product with missing ID:`, product);
        continue;
      }

      // Update product in Firestore
      await db.collection('products').doc(id).update({
        name,
        price: parseFloat(price),
        description,
        imageUrl,
        updatedAt: admin.firestore.Timestamp.now(),
      });
    }

    console.log('Updated Products:', updatedProducts);
    res.redirect('/public/admin/manage-products.html');
  } catch (error) {
    console.error('Error updating products:', error);
    res.status(500).json({ error: 'Failed to update products' });
  }
});

// Add new products
router.post('/admin/add-new-products', upload.any(), async (req, res) => {
  const newProducts = req.body.newProducts || [];

  try {
    // Add each new product to Firestore
    for (const product of newProducts) {
      const { name, price, description, imageUrl } = product;

      // Add new product to Firestore
      await db.collection('products').add({
        name,
        price: parseFloat(price),
        description,
        imageUrl,
        createdAt: admin.firestore.Timestamp.now(),
      });
    }

    console.log('New Products:', newProducts);
    res.redirect('/public/admin/manage-products.html');
  } catch (error) {
    console.error('Error adding new products:', error);
    res.status(500).json({ error: 'Failed to add new products' });
  }
});

module.exports = router;
