const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/authMiddleware');

// Login
router.post('/login', authController.login);

// Create new user (Admin Only)
router.post('/register', authenticateJWT, authorizeRoles('admin'), authController.register);

// Get all staff (Admin Only)
router.get('/staff', authenticateJWT, authorizeRoles('admin'), authController.getAllStaff);

// Delete staff member (Admin Only)
router.delete('/staff/:id', authenticateJWT, authorizeRoles('admin'), authController.deleteStaff);

module.exports = router;
