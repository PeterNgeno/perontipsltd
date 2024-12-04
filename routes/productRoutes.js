const express = require('express');
const router = express.Router();

// Firestore instance from the initialized Firebase Admin in server.js
let db;
if (!db) {
    const admin = require('firebase-admin');
    db = admin.firestore();
}

// Route to get all products
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('products').get();
        if (snapshot.empty) {
            return res.status(404).json({ error: 'No products found' });
        }

        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Route to get a product by its ID
router.get('/:id', async (req, res) => {
    try {
        const doc = await db.collection('products').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Route to create a new product
router.post('/', async (req, res) => {
    try {
        const newProduct = req.body;
        const docRef = await db.collection('products').add(newProduct);
        res.status(201).json({ id: docRef.id, ...newProduct });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Route to update a product by ID
router.put('/:id', async (req, res) => {
    try {
        const productRef = db.collection('products').doc(req.params.id);
        const doc = await productRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await productRef.update(req.body);
        const updatedProduct = { id: doc.id, ...doc.data(), ...req.body };
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Route to delete a product by ID
router.delete('/:id', async (req, res) => {
    try {
        const productRef = db.collection('products').doc(req.params.id);
        const doc = await productRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await productRef.delete();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;
