const pool = require('../db');
const { verifyToken } = require('../utils/jwt');

async function authenticateExecutor(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log('[Executor Auth] authenticateExecutor called');
    console.log('[Executor Auth] Auth header present:', !!authHeader);
    console.log('[Executor Auth] Token present:', !!token);

    if (!token) {
      console.log('[Executor Auth] No token provided');
      return res.status(401).json({
        success: false,
        message: 'Executor token required'
      });
    }

    const decoded = verifyToken(token);
    
    console.log('[Executor Auth] Token decoded:', decoded);
    console.log('[Executor Auth] Token type:', decoded?.type);
    console.log('[Executor Auth] Executor ID:', decoded?.executorId);
    console.log('[Executor Auth] User ID:', decoded?.userId);

    if (!decoded || decoded.type !== 'executor') {
      console.log('[Executor Auth] Invalid or missing executor type in token');
      return res.status(403).json({
        success: false,
        message: 'Invalid executor token'
      });
    }

    const { rows } = await pool.query(
      `SELECT
        executor_id,
        user_id,
        executor_name,
        executor_email,
        verification_status,
        access_granted
      FROM executors
      WHERE executor_id = $1 AND user_id = $2`,
      [decoded.executorId, decoded.userId]
    );

    console.log('[Executor Auth] Executor found:', rows.length > 0);

    if (rows.length === 0) {
      console.log('[Executor Auth] Executor not found in database');
      return res.status(403).json({
        success: false,
        message: 'Executor account not found'
      });
    }

    const executor = rows[0];

    console.log('[Executor Auth] Executor verification_status:', executor.verification_status);
    console.log('[Executor Auth] Executor access_granted:', executor.access_granted);

    if (executor.verification_status !== 'verified') {
      console.log('[Executor Auth] Executor not verified');
      return res.status(403).json({
        success: false,
        message: 'Executor email is not verified yet'
      });
    }

    if (executor.access_granted !== true) {
      console.log('[Executor Auth] Executor access not granted');
      return res.status(403).json({
        success: false,
        message: 'Executor is verified, but access has not been granted yet'
      });
    }

    console.log('[Executor Auth] Authentication successful for executor:', executor.executor_id);
    req.executor = executor;
    req.ownerUserId = executor.user_id;
    next();
  } catch (error) {
    console.error('[Executor Auth] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate executor'
    });
  }
}

module.exports = {
  authenticateExecutor
};
