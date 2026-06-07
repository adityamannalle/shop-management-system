const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/authMiddleware');

// GET /api/notifications
router.get('/', authenticateJWT, notificationController.getNotifications);

// POST /api/notifications
router.post('/', authenticateJWT, authorizeRoles('admin'), notificationController.createNotification);

// PUT /api/notifications/read-all
router.put('/read-all', authenticateJWT, notificationController.markAllRead);

module.exports = router;
