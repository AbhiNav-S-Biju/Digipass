const express = require('express');
const router = express.Router();
const {
  getStatus,
  checkIn,
  updateInterval,
  getExecutorNotifications
} = require('../controllers/deadMansSwitchController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Dead Man's Switch Routes
 * All routes require user authentication
 */

// Get current dead man's switch status
router.get('/status', authenticateToken, getStatus);

// Manual check-in
router.post('/check-in', authenticateToken, checkIn);

// Update check interval
router.put('/interval', authenticateToken, updateInterval);

// Get executor notifications/access status
router.get('/executor-notifications', authenticateToken, getExecutorNotifications);

module.exports = router;
