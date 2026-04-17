const express = require('express');
const router = express.Router();
const { addAsset, getAssets, deleteAsset } = require('../controllers/assetsController');
const { authenticateToken: authMiddleware } = require('../middleware/auth');

// All digital asset endpoints require a logged-in user.
router.use(authMiddleware);

// POST /api/assets
router.post('/', addAsset);

// GET /api/assets
router.get('/', getAssets);

// DELETE /api/assets/:id
router.delete('/:id', deleteAsset);

module.exports = router;
