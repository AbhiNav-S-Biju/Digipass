const express = require('express');
const router = express.Router();
const {
  addExecutor,
  getExecutors,
  resendExecutorVerification,
  verifyExecutorToken,
  grantAccess,
  revokeAccess
} = require('../controllers/executorsController');
const { authenticateToken: authMiddleware } = require('../middleware/auth');

router.get('/verify', verifyExecutorToken);

router.use(authMiddleware);

router.post('/', addExecutor);
router.get('/', getExecutors);
router.post('/:id/resend-verification', resendExecutorVerification);
router.patch('/:id/grant-access', grantAccess);
router.patch('/:id/revoke-access', revokeAccess);

module.exports = router;
