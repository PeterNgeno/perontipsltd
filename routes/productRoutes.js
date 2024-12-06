module.exports = (db) => {
  const router = require('express').Router();

  router.get('/', async (req, res) => {
    try {
      const snapshot = await db.collection('products').get();
      res.status(200).json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching products:', error.message);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // Other routes remain unchanged but should also use `db`

  return router;
};
