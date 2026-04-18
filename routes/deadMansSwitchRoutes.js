const express = require('express');
const router = express.Router();
const {
  getStatus,
  checkIn,
  updateInterval,
  getExecutorNotifications
} = require('../controllers/deadMansSwitchController');
const { authenticateUser } = require('../middleware/auth');

/**
 * Dead Man's Switch Routes
 * All routes require user authentication
 */

// Get current dead man's switch status
router.get('/status', authenticateUser, getStatus);

// Manual check-in
router.post('/check-in', authenticateUser, checkIn);

// Update check interval
router.put('/interval', authenticateUser, updateInterval);

// Get executor notifications/access status
router.get('/executor-notifications', authenticateUser, getExecutorNotifications);

module.exports = router;
