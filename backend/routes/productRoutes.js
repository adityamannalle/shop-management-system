const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/authMiddleware');

// Get all products
router.get('/', authenticateJWT, productController.getAllProducts);

// Get single product
router.get('/:id', authenticateJWT, productController.getProductById);

// Create product (Admin Only)
router.post('/', authenticateJWT, authorizeRoles('admin'), productController.createProduct);

// Update product (Admin Only)
router.put('/:id', authenticateJWT, authorizeRoles('admin'), productController.updateProduct);

// Delete product (Admin Only)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), productController.deleteProduct);

module.exports = router;
