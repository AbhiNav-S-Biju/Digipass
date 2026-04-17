const express = require('express');
const router = express.Router();
const { generateWill } = require('../controllers/willController');
const { authenticateToken: authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/generate-will', generateWill);

module.exports = router;
