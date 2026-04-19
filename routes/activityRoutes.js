const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserActivities } = require('../utils/activityLogger');

/**
 * GET /api/activity
 * Get user's activity log
 * Query params: limit (default 20)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100

    const activities = await getUserActivities(userId, limit);

    res.json({
      success: true,
      data: activities,
      count: activities.length
    });
  } catch (err) {
    console.error('Activity endpoint error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
});

module.exports = router;
