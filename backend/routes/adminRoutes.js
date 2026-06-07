const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');

// Dashboard stats (Unified route, internal role handling)
router.get('/dashboard', authenticateJWT, authorizeRoles('admin', 'staff'), adminController.getDashboard);

// Revenue vs expenses summary
router.get('/expenses-summary', authenticateJWT, authorizeRoles('admin', 'staff'), adminController.getExpensesSummary);

module.exports = router;
