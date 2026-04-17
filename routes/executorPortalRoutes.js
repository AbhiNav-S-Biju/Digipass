const express = require('express');
const router = express.Router();
const {
  executorLogin,
  registerExecutor,
  getExecutorAssets
} = require('../controllers/executorPortalController');
const { authenticateExecutor } = require('../middleware/executorAuth');

router.post('/executor/login', executorLogin);
router.post('/executor/register', registerExecutor);
router.get('/executor/assets', authenticateExecutor, getExecutorAssets);

module.exports = router;
