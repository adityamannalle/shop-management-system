const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/authMiddleware');

// Sales performance analytics
router.get('/performance', authenticateJWT, authorizeRoles('staff', 'admin'), orderController.getSalesPerformance);

// Create a new order
router.post('/', authenticateJWT, authorizeRoles('staff', 'admin'), orderController.createOrder);

// Full sales report (Admin Only)
router.get('/report', authenticateJWT, authorizeRoles('admin'), orderController.getSalesReport);

// Bill details
router.get('/detail/:id', authenticateJWT, authorizeRoles('staff', 'admin'), orderController.getBillDetails);

module.exports = router;
