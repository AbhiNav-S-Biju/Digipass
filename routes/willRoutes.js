const express = require('express');
const router = express.Router();
const { generateWill, downloadWill } = require('../controllers/willController');
const { authenticateToken: authMiddleware } = require('../middleware/auth');
const pool = require('../db');

router.use(authMiddleware);

router.get('/generate-will', generateWill);
router.get('/download-will/:willId', downloadWill);

/**
 * Check if a digital will exists for the user
 * GET /api/will
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    
    const { rows } = await pool.query(
      `SELECT will_id, created_at FROM digital_will
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No will exists'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        will_id: rows[0].will_id,
        created_at: rows[0].created_at
      },
      message: 'Will exists'
    });
  } catch (err) {
    console.error('Error checking will existence:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to check will status'
    });
  }
});

module.exports = router;
