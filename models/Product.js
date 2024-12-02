const { db } = require('../firebase');  // Import Firebase Firestore instance

module.exports = {
  // Function to add a product to Firestore
  addProduct: (product) => {
    return new Promise(async (resolve, reject) => {
      try {
        const productRef = db.collection('products').doc();  // Create a new document with auto-generated ID
        const productData = {
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
        };

        await productRef.set(productData);  // Insert product data to Firestore

        resolve({
          id: productRef.id,  // Return the Firestore document ID
          ...productData,
        });
      } catch (err) {
        reject(err);  // Reject if there's an error during insertion
      }
    });
  },

  // Function to get all products from Firestore
  getProducts: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const snapshot = await db.collection('products').get();  // Get all products
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        resolve(products);  // Return all products
      } catch (err) {
        reject(err);  // Reject if there's an error fetching the products
      }
    });
  },

  // Function to get a product by its ID
  getProductById: (productId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const productDoc = await db.collection('products').doc(productId).get();

        if (!productDoc.exists) {
          reject('Product not found');
        } else {
          resolve({ id: productDoc.id, ...productDoc.data() });  // Return the single product
        }
      } catch (err) {
        reject(err);  // Reject if there's an error fetching the product
      }
    });
  },

  // Function to update a product by ID
  updateProduct: (productId, updatedProduct) => {
    return new Promise(async (resolve, reject) => {
      try {
        const productRef = db.collection('products').doc(productId);

        const productDoc = await productRef.get();
        if (!productDoc.exists) {
          reject('Product not found');
        } else {
          await productRef.update(updatedProduct);  // Update the product
          resolve({
            id: productId,
            ...updatedProduct,
          });
        }
      } catch (err) {
        reject(err);  // Reject if there's an error updating the product
      }
    });
  },

  // Function to delete a product by ID
  deleteProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const productRef = db.collection('products').doc(productId);

        const productDoc = await productRef.get();
        if (!productDoc.exists) {
          reject('Product not found');
        } else {
          await productRef.delete();  // Delete the product
          resolve({ message: 'Product deleted successfully' });
        }
      } catch (err) {
        reject(err);  // Reject if there's an error deleting the product
      }
    });
  },
};
