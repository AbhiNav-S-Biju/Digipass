const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

// Test protected route
router.get('/dashboard-test', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route accessed successfully!',
    userId: req.userId,
    timestamp: new Date(),
    testData: {
      dashboard: 'This is a test protected endpoint',
      authenticated: true
    }
  });
});

module.exports = router;
