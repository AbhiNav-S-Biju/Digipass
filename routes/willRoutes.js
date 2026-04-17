const express = require('express');
const router = express.Router();
const { generateWill, downloadWill } = require('../controllers/willController');
const { authenticateToken: authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/generate-will', generateWill);
router.get('/download-will/:willId', downloadWill);

module.exports = router;
