const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/authMiddleware');

// Get all expenses (Admin Only)
router.get('/', authenticateJWT, authorizeRoles('admin'), expenseController.getAllExpenses);

// Add new expense (Admin Only)
router.post('/', authenticateJWT, authorizeRoles('admin'), expenseController.createExpense);

// Delete an expense (Admin Only)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), expenseController.deleteExpense);

module.exports = router;
