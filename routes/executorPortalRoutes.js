const express = require('express');
const router = express.Router();
const {
  executorLogin,
  registerExecutor,
  getExecutorAssets
} = require('../controllers/executorPortalController');
const { getAssetInstructions } = require('../controllers/assetInstructionsController');
const { authenticateExecutor } = require('../middleware/executorAuth');

router.post('/executor/login', executorLogin);
router.post('/executor/register', registerExecutor);
router.get('/executor/assets', authenticateExecutor, getExecutorAssets);
router.get('/executor/asset-instructions/:assetId', authenticateExecutor, getAssetInstructions);

module.exports = router;
